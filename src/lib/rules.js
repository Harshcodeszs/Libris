import {
  addDaysISO,
  daysBetween,
  daysFromToday,
  todayISO,
} from './format'
import {
  BLOCK_BORROW_ON_UNPAID_FINES,
  BOOK_STATUS,
  BORROW_STATUS,
  FINE_PER_DAY,
  FINE_REASONS,
  FINE_STATUS,
  LOAN_PERIOD_DAYS,
  ROLE,
} from './constants'
import { getBook, getDB, getStudent, nextId, saveDB } from './db'

// Records created before requests existed have no status. Treat them using the
// old convention: an open loan is active, a closed one is returned.
export function getBorrowStatus(borrow) {
  if (!borrow) return null
  if (borrow.status) return borrow.status
  return borrow.return_date ? BORROW_STATUS.RETURNED : BORROW_STATUS.ACTIVE
}

export function isActiveBorrow(borrow) {
  return getBorrowStatus(borrow) === BORROW_STATUS.ACTIVE && !borrow.return_date
}

export function isPendingBorrow(borrow) {
  return getBorrowStatus(borrow) === BORROW_STATUS.PENDING
}

function declinePendingForBook(db, bookId, reason, excludeBorrowId = null) {
  const today = todayISO()
  db.borrows.forEach((item) => {
    if (
      item.book_id === Number(bookId) &&
      item.borrow_id !== Number(excludeBorrowId) &&
      isPendingBorrow(item)
    ) {
      item.status = BORROW_STATUS.REJECTED
      item.rejected_date = today
      item.rejection_reason = reason
    }
  })
}

export function activeBorrowsFor(studentId) {
  return getDB()
    .borrows.filter((borrow) => borrow.student_id === Number(studentId) && isActiveBorrow(borrow))
    .sort((a, b) => (a.due_date < b.due_date ? -1 : 1))
}

export function pendingBorrowsFor(studentId) {
  return getDB()
    .borrows.filter((borrow) => borrow.student_id === Number(studentId) && isPendingBorrow(borrow))
    .sort((a, b) => b.borrow_id - a.borrow_id)
}

export function pendingBorrows() {
  return getDB()
    .borrows.filter(isPendingBorrow)
    .sort((a, b) => a.borrow_date.localeCompare(b.borrow_date) || a.borrow_id - b.borrow_id)
}

export function pendingBorrowForStudentBook(studentId, bookId) {
  return (
    pendingBorrowsFor(studentId).find((borrow) => borrow.book_id === Number(bookId)) || null
  )
}

export function pendingBorrowForBook(bookId) {
  return (
    getDB().borrows.find(
      (borrow) => borrow.book_id === Number(bookId) && isPendingBorrow(borrow),
    ) || null
  )
}

export function borrowsForStudent(studentId) {
  return getDB()
    .borrows.filter((borrow) => borrow.student_id === Number(studentId))
    .sort((a, b) => b.borrow_date.localeCompare(a.borrow_date) || b.borrow_id - a.borrow_id)
}

export function activeBorrowForBook(bookId) {
  return (
    getDB().borrows.find(
      (borrow) => borrow.book_id === Number(bookId) && isActiveBorrow(borrow),
    ) || null
  )
}

export function finesForStudent(studentId) {
  return getDB()
    .fines.filter((fine) => fine.student_id === Number(studentId))
    .sort((a, b) => b.issued_date.localeCompare(a.issued_date) || b.fine_id - a.fine_id)
}

export function unpaidFinesFor(studentId) {
  return finesForStudent(studentId).filter((fine) => fine.status === FINE_STATUS.UNPAID)
}

export function unpaidFineTotal(studentId) {
  return unpaidFinesFor(studentId).reduce((total, fine) => total + Number(fine.amount), 0)
}

export function overdueDays(borrow) {
  if (!borrow) return 0
  const reference = borrow.return_date || todayISO()
  return Math.max(0, daysBetween(borrow.due_date, reference))
}

export function isOverdue(borrow) {
  if (!borrow || borrow.return_date) return false
  return daysFromToday(borrow.due_date) < 0
}

export function overdueFineEstimate(borrow) {
  return overdueDays(borrow) * FINE_PER_DAY
}

export function canBorrow(studentId, bookId) {
  const student = getStudent(studentId)
  const book = getBook(bookId)

  if (!student) return { ok: false, reason: 'Student record not found.' }
  if (!book) return { ok: false, reason: 'Book record not found.' }
  if (book.status !== BOOK_STATUS.AVAILABLE) {
    return { ok: false, reason: `This book is currently ${book.status.toLowerCase()}.` }
  }

  const active = activeBorrowsFor(student.student_id)
  if (active.some((borrow) => borrow.book_id === book.book_id)) {
    return { ok: false, reason: 'You already have this book on loan.' }
  }

  const pending = pendingBorrowsFor(student.student_id)
  if (pending.some((borrow) => borrow.book_id === book.book_id)) {
    return { ok: false, reason: 'You already have a pending request for this book.' }
  }
  if (active.length + pending.length >= student.max_loan) {
    return {
      ok: false,
      reason: `You have reached your limit of ${student.max_loan} active loans or pending requests.`,
    }
  }

  const unpaid = unpaidFineTotal(student.student_id)
  if (BLOCK_BORROW_ON_UNPAID_FINES && unpaid > 0) {
    return {
      ok: false,
      reason: `Settle your unpaid fines first (₱${unpaid.toFixed(2)} outstanding).`,
    }
  }

  return { ok: true, reason: '' }
}
// Create Borrow Request
export function requestBorrow({ studentId, bookId }) {
  const check = canBorrow(studentId, bookId)
  if (!check.ok) throw new Error(check.reason)

  const db = getDB()
  const book = db.books.find((item) => item.book_id === Number(bookId))
  const student = db.students.find((item) => item.student_id === Number(studentId))
  const requestDate = todayISO()

  const request = {
    borrow_id: nextId(db.borrows, 'borrow_id'),
    student_id: student.student_id,
    book_id: book.book_id,
    librarian_id: null,
    borrow_date: requestDate,
    due_date: addDaysISO(requestDate, LOAN_PERIOD_DAYS),
    return_date: null,
    status: BORROW_STATUS.PENDING,
    request_date: requestDate,
    requested_at: new Date().toISOString(),
  }

  db.borrows.push(request)
  // The copy stays Available until a librarian approves the request.
  saveDB(db)
  return request
}

export function approveBorrow(
  borrowId,
  { librarianId = null, actorRole = ROLE.LIBRARIAN, dueDate } = {},
) {
  const db = getDB()
  const borrow = db.borrows.find((item) => item.borrow_id === Number(borrowId))
  if (!borrow) throw new Error('Borrow request not found.')
  if (!isPendingBorrow(borrow)) throw new Error('This request has already been reviewed.')

  const book = db.books.find((item) => item.book_id === borrow.book_id)
  if (!book) throw new Error('The requested copy is no longer in the catalog.')
  if (book.status !== BOOK_STATUS.AVAILABLE) {
    throw new Error(`This copy is currently ${book.status.toLowerCase()} and cannot be issued.`)
  }
  if (activeBorrowForBook(book.book_id)) {
    throw new Error('This copy has already been issued to another borrower.')
  }

  const student = db.students.find((item) => item.student_id === borrow.student_id)
  if (!student) throw new Error('The student record no longer exists.')
  if (activeBorrowsFor(student.student_id).length >= student.max_loan) {
    throw new Error(`The student already holds ${student.max_loan} active loans.`)
  }
  if (BLOCK_BORROW_ON_UNPAID_FINES && unpaidFineTotal(student.student_id) > 0) {
    throw new Error('The student has unpaid fines. Settle them before approving this request.')
  }

  const today = todayISO()
  const due = dueDate || addDaysISO(today, LOAN_PERIOD_DAYS)
  if (daysBetween(today, due) <= 0) throw new Error('The due date must be after today.')

  borrow.status = BORROW_STATUS.ACTIVE
  borrow.borrow_date = today
  borrow.due_date = due
  borrow.return_date = null
  borrow.approved_date = today
  borrow.processed_by_role = actorRole || null
  borrow.processed_by_id = librarianId ? Number(librarianId) : null
  borrow.librarian_id =
    actorRole === ROLE.LIBRARIAN && librarianId ? Number(librarianId) : null

  book.status = BOOK_STATUS.BORROWED
  // Other students waiting for the same copy can no longer be fulfilled.
  declinePendingForBook(
    db,
    book.book_id,
    'The copy was issued to another borrower.',
    borrow.borrow_id,
  )

  saveDB(db)
  return borrow
}

export function rejectBorrow(
  borrowId,
  { librarianId = null, actorRole = ROLE.LIBRARIAN, reason = 'Declined at the desk.' } = {},
) {
  const db = getDB()
  const borrow = db.borrows.find((item) => item.borrow_id === Number(borrowId))
  if (!borrow) throw new Error('Borrow request not found.')
  if (!isPendingBorrow(borrow)) throw new Error('This request has already been reviewed.')

  borrow.status = BORROW_STATUS.REJECTED
  borrow.rejected_date = todayISO()
  borrow.rejection_reason = reason
  borrow.processed_by_role = actorRole || null
  borrow.processed_by_id = librarianId ? Number(librarianId) : null
  saveDB(db)
  return borrow
}

export function cancelBorrowRequest(borrowId, studentId) {
  const db = getDB()
  const borrow = db.borrows.find((item) => item.borrow_id === Number(borrowId))
  if (!borrow) throw new Error('Borrow request not found.')
  if (!isPendingBorrow(borrow)) throw new Error('Only pending requests can be cancelled.')
  if (borrow.student_id !== Number(studentId)) {
    throw new Error('You can only cancel your own request.')
  }

  borrow.status = BORROW_STATUS.CANCELLED
  borrow.cancelled_date = todayISO()
  saveDB(db)
  return borrow
}

export function borrowBook({
  studentId,
  bookId,
  librarianId = null,
  dueDate,
  actorRole = ROLE.LIBRARIAN,
}) {
  const check = canBorrow(studentId, bookId)
  if (!check.ok) throw new Error(check.reason)

  const db = getDB()
  const book = db.books.find((item) => item.book_id === Number(bookId))
  const student = db.students.find((item) => item.student_id === Number(studentId))
  const borrowDate = todayISO()
  const due = dueDate || addDaysISO(borrowDate, LOAN_PERIOD_DAYS)

  if (daysBetween(borrowDate, due) <= 0) {
    throw new Error('The due date must be after today.')
  }

  const borrow = {
    borrow_id: nextId(db.borrows, 'borrow_id'),
    student_id: student.student_id,
    book_id: book.book_id,
    librarian_id:
      actorRole === ROLE.LIBRARIAN && librarianId ? Number(librarianId) : null,
    borrow_date: borrowDate,
    due_date: due,
    return_date: null,
    status: BORROW_STATUS.ACTIVE,
    processed_by_role: librarianId ? actorRole : null,
    processed_by_id: librarianId ? Number(librarianId) : null,
  }

  db.borrows.push(borrow)
  book.status = BOOK_STATUS.BORROWED
  declinePendingForBook(db, book.book_id, 'The copy was issued to another borrower.')
  saveDB(db)
  return borrow
}

export function returnBook(borrowId) {
  const db = getDB()
  const borrow = db.borrows.find((item) => item.borrow_id === Number(borrowId))
  if (!borrow) throw new Error('Borrow record not found.')
  if (!isActiveBorrow(borrow)) throw new Error('Only active loans can be returned.')

  const today = todayISO()
  const lateDays = Math.max(0, daysBetween(borrow.due_date, today))
  borrow.return_date = today
  borrow.status = BORROW_STATUS.RETURNED

  const book = db.books.find((item) => item.book_id === borrow.book_id)
  if (book && book.status === BOOK_STATUS.BORROWED) {
    book.status = BOOK_STATUS.AVAILABLE
  }

  let fine = null
  const alreadyFined = db.fines.some(
    (item) => item.borrow_id === borrow.borrow_id && item.reason === 'Overdue',
  )

  if (lateDays > 0 && !alreadyFined) {
    fine = {
      fine_id: nextId(db.fines, 'fine_id'),
      borrow_id: borrow.borrow_id,
      student_id: borrow.student_id,
      amount: lateDays * FINE_PER_DAY,
      reason: 'Overdue',
      status: FINE_STATUS.UNPAID,
      issued_date: today,
      paid_date: null,
    }
    db.fines.push(fine)
  }

  saveDB(db)
  return { borrow, fine, lateDays }
}
// Fine Management
export function issueFine({ studentId, borrowId = null, amount, reason }) {
  const db = getDB()
  const student = db.students.find((item) => item.student_id === Number(studentId))
  if (!student) throw new Error('Select a valid student.')
  if (!FINE_REASONS.includes(reason)) throw new Error('Select a valid fine reason.')

  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error('Fine amount must be greater than zero.')
  }

  if (borrowId) {
    const borrow = db.borrows.find((item) => item.borrow_id === Number(borrowId))
    if (!borrow || borrow.student_id !== student.student_id) {
      throw new Error('The selected borrow record does not belong to this student.')
    }
  }

  const fine = {
    fine_id: nextId(db.fines, 'fine_id'),
    borrow_id: borrowId ? Number(borrowId) : null,
    student_id: student.student_id,
    amount: Math.round(numericAmount * 100) / 100,
    reason,
    status: FINE_STATUS.UNPAID,
    issued_date: todayISO(),
    paid_date: null,
  }

  db.fines.push(fine)
  saveDB(db)
  return fine
}

export function payFine(fineId) {
  const db = getDB()
  const fine = db.fines.find((item) => item.fine_id === Number(fineId))
  if (!fine) throw new Error('Fine not found.')
  if (fine.status !== FINE_STATUS.UNPAID) throw new Error('Only unpaid fines can be settled.')
  fine.status = FINE_STATUS.PAID
  fine.paid_date = todayISO()
  saveDB(db)
  return fine
}

export function waiveFine(fineId) {
  const db = getDB()
  const fine = db.fines.find((item) => item.fine_id === Number(fineId))
  if (!fine) throw new Error('Fine not found.')
  if (fine.status !== FINE_STATUS.UNPAID) throw new Error('Only unpaid fines can be waived.')
  fine.status = FINE_STATUS.WAIVED
  fine.paid_date = null
  saveDB(db)
  return fine
}
// Create Book
export function createBook({ title, author, category, status = BOOK_STATUS.AVAILABLE }) {
  if (!title.trim()) throw new Error('Title is required.')
  if (!author.trim()) throw new Error('Author is required.')
  if (!category.trim()) throw new Error('Category is required.')

  const db = getDB()
  const book = {
    book_id: nextId(db.books, 'book_id'),
    title: title.trim(),
    author: author.trim(),
    category,
    status,
  }
  db.books.push(book)
  saveDB(db)
  return book
}

export function updateBook(bookId, changes) {
  const db = getDB()
  const book = db.books.find((item) => item.book_id === Number(bookId))
  if (!book) throw new Error('Book not found.')

  if (changes.status && changes.status !== book.status) {
    const active = activeBorrowForBook(book.book_id)
    if (active) {
      throw new Error('This copy is on loan. Process its return before changing its status.')
    }
    book.status = changes.status
    if (book.status !== BOOK_STATUS.AVAILABLE) {
      declinePendingForBook(db, book.book_id, 'The copy is no longer available for loan.')
    }
  }

  if (changes.title !== undefined) {
    if (!changes.title.trim()) throw new Error('Title is required.')
    book.title = changes.title.trim()
  }
  if (changes.author !== undefined) {
    if (!changes.author.trim()) throw new Error('Author is required.')
    book.author = changes.author.trim()
  }
  if (changes.category !== undefined) {
    if (!changes.category.trim()) throw new Error('Category is required.')
    book.category = changes.category
  }

  saveDB(db)
  return book
}

export function deleteBook(bookId) {
  const db = getDB()
  const book = db.books.find((item) => item.book_id === Number(bookId))
  if (!book) throw new Error('Book not found.')
  if (activeBorrowForBook(book.book_id)) {
    throw new Error('This copy is on loan. Process the return before deleting it.')
  }
  db.books = db.books.filter((item) => item.book_id !== book.book_id)
  // Pending requests point at a copy that no longer exists.
  db.borrows = db.borrows.filter(
    (item) => !(item.book_id === book.book_id && isPendingBorrow(item)),
  )
  saveDB(db)
  return true
}

export function updateStudentProfile(studentId, { first_name, last_name, contact_number }) {
  const db = getDB()
  const student = db.students.find((item) => item.student_id === Number(studentId))
  if (!student) throw new Error('Student not found.')
  if (first_name !== undefined) {
    if (!first_name.trim()) throw new Error('First name is required.')
    student.first_name = first_name.trim()
  }
  if (last_name !== undefined) {
    if (!last_name.trim()) throw new Error('Last name is required.')
    student.last_name = last_name.trim()
  }
  if (contact_number !== undefined) {
    if (!contact_number.trim()) throw new Error('Contact number is required.')
    student.contact_number = contact_number.trim()
  }
  saveDB(db)
  return student
}
