import { getDB, getStudent } from './db'
import { BOOK_STATUS, BORROW_STATUS } from './constants'
import {
  activeBorrowsFor,
  approveBorrow,
  borrowBook,
  borrowsForStudent,
  cancelBorrowRequest,
  getBorrowStatus,
  pendingBorrowsFor,
  rejectBorrow,
  requestBorrow,
  returnBook,
} from './rules'

export function readStudentBorrowState(studentId) {
  return {
    student: getStudent(studentId),
    active: activeBorrowsFor(studentId),
    pending: pendingBorrowsFor(studentId),
  }
}

export function readStudentLoans(studentId) {
  const db = getDB()
  const bookById = new Map(db.books.map((book) => [book.book_id, book]))
  const fineByBorrowId = new Map()
  db.fines.forEach((fine) => {
    if (!fineByBorrowId.has(fine.borrow_id)) fineByBorrowId.set(fine.borrow_id, fine)
  })
  const rows = borrowsForStudent(studentId).map((borrow) => ({
    ...borrow,
    book: bookById.get(borrow.book_id) || null,
    fine: fineByBorrowId.get(borrow.borrow_id) || null,
  }))
  return {
    loans: rows.filter((row) =>
      [BORROW_STATUS.ACTIVE, BORROW_STATUS.RETURNED, BORROW_STATUS.REJECTED].includes(
        getBorrowStatus(row),
      )),
    pending: rows.filter((row) => getBorrowStatus(row) === BORROW_STATUS.PENDING),
  }
}

export function readBorrowRequests() {
  const db = getDB()
  const studentById = new Map(db.students.map((student) => [student.student_id, student]))
  const bookById = new Map(db.books.map((book) => [book.book_id, book]))
  const decorate = (borrow) => ({
    ...borrow,
    student: studentById.get(borrow.student_id) || null,
    book: bookById.get(borrow.book_id) || null,
  })
  return {
    pending: db.borrows
      .filter((borrow) => getBorrowStatus(borrow) === BORROW_STATUS.PENDING)
      .sort((a, b) => a.borrow_id - b.borrow_id)
      .map(decorate),
    reviewed: db.borrows
      .filter((borrow) =>
        [BORROW_STATUS.REJECTED, BORROW_STATUS.CANCELLED].includes(getBorrowStatus(borrow)))
      .sort((a, b) => b.borrow_id - a.borrow_id)
      .map(decorate),
    availableCount: db.books.filter((book) => book.status === BOOK_STATUS.AVAILABLE).length,
  }
}

export function readStaffLoans() {
  const db = getDB()
  const studentById = new Map(db.students.map((student) => [student.student_id, student]))
  const bookById = new Map(db.books.map((book) => [book.book_id, book]))
  const librarianById = new Map(db.librarians.map((librarian) => [librarian.librarian_id, librarian]))
  return {
    rows: db.borrows
      .filter((borrow) =>
        [BORROW_STATUS.ACTIVE, BORROW_STATUS.RETURNED].includes(getBorrowStatus(borrow)))
      .sort((a, b) => b.borrow_date.localeCompare(a.borrow_date) || b.borrow_id - a.borrow_id)
      .map((borrow) => ({
        ...borrow,
        student: studentById.get(borrow.student_id) || null,
        book: bookById.get(borrow.book_id) || null,
        librarian: borrow.librarian_id ? librarianById.get(borrow.librarian_id) || null : null,
      })),
    students: db.students
      .slice()
      .sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)),
    availableBooks: db.books
      .filter((book) => book.status === BOOK_STATUS.AVAILABLE)
      .sort((a, b) => a.title.localeCompare(b.title)),
    pendingCount: db.borrows.filter(
      (borrow) => getBorrowStatus(borrow) === BORROW_STATUS.PENDING,
    ).length,
  }
}

export function requestBorrowRecord({ studentId, bookId }) {
  return requestBorrow({ studentId, bookId })
}

export function cancelBorrowRequestRecord(borrowId, studentId) {
  return cancelBorrowRequest(borrowId, studentId)
}

export function approveBorrowRequest(borrowId, staff) {
  return approveBorrow(borrowId, staff)
}

export function rejectBorrowRequest(borrowId, staff) {
  return rejectBorrow(borrowId, staff)
}

export function issueDeskLoan(form, staff) {
  if (!form.studentId || !form.bookId) {
    throw new Error('Choose both a student and an available book.')
  }
  return borrowBook({
    studentId: Number(form.studentId),
    bookId: Number(form.bookId),
    librarianId: staff.id,
    actorRole: staff.role,
    dueDate: form.dueDate,
  })
}

export function returnBorrowedBook(borrowId) {
  return returnBook(borrowId)
}
