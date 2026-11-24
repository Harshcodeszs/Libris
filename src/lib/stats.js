import { format, isSameMonth, parseISO, subMonths } from 'date-fns'
import { getDB } from './db'
import { fullName } from './format'
import { BORROW_STATUS, FINE_STATUS, ROLE } from './constants'

function statusOf(borrow) {
  if (borrow.status) return borrow.status
  return borrow.return_date ? BORROW_STATUS.RETURNED : BORROW_STATUS.ACTIVE
}

function countsAsLoan(borrow) {
  return [BORROW_STATUS.ACTIVE, BORROW_STATUS.RETURNED].includes(statusOf(borrow))
}

function nameForStudent(db, studentId) {
  const student = db.students.find((item) => item.student_id === studentId)
  return student ? fullName(student) : 'Former student'
}

function titleForBook(db, bookId) {
  const book = db.books.find((item) => item.book_id === bookId)
  return book ? book.title : 'Removed title'
}

export function daysLate(borrow, reference = new Date()) {
  const due = parseISO(borrow.due_date)
  if (borrow.return_date) return 0
  const diff = Math.floor((reference - due) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function getOverdueLoans() {
  const db = getDB()
  const now = new Date()
  return db.borrows
    .filter((borrow) => statusOf(borrow) === BORROW_STATUS.ACTIVE)
    .map((borrow) => ({ borrow, lateDays: daysLate(borrow, now) }))
    .filter((item) => item.lateDays > 0)
    .map(({ borrow, lateDays }) => ({
      ...borrow,
      student: db.students.find((item) => item.student_id === borrow.student_id) || null,
      book: db.books.find((item) => item.book_id === borrow.book_id) || null,
      lateDays,
    }))
    .sort((a, b) => b.lateDays - a.lateDays)
}

export function getOverviewStats() {
  const db = getDB()
  const active = db.borrows.filter((borrow) => statusOf(borrow) === BORROW_STATUS.ACTIVE)
  const overdue = getOverdueLoans()
  const unpaid = db.fines.filter((fine) => fine.status === FINE_STATUS.UNPAID)

  return {
    books: db.books.length,
    available: db.books.filter((book) => book.status === 'Available').length,
    borrowed: db.books.filter((book) => book.status === 'Borrowed').length,
    damaged: db.books.filter((book) => ['Damaged', 'Lost'].includes(book.status)).length,
    students: db.students.length,
    librarians: db.librarians.length,
    activeLoans: active.length,
    pendingRequests: db.borrows.filter(
      (borrow) => statusOf(borrow) === BORROW_STATUS.PENDING,
    ).length,
    overdueLoans: overdue.length,
    unpaidFinesCount: unpaid.length,
    unpaidFinesTotal: unpaid.reduce((sum, fine) => sum + Number(fine.amount), 0),
    returnedTotal: db.borrows.filter((borrow) => statusOf(borrow) === BORROW_STATUS.RETURNED)
      .length,
  }
}

export function getMonthlyBorrows(months = 6) {
  const db = getDB()
  const now = new Date()
  return Array.from({ length: months }, (_, index) => {
    const month = subMonths(now, months - 1 - index)
    return {
      key: format(month, 'yyyy-MM'),
      label: format(month, 'MMM'),
      count: db.borrows.filter(
        (borrow) =>
          countsAsLoan(borrow) &&
          borrow.borrow_date &&
          isSameMonth(parseISO(borrow.borrow_date), month),
      ).length,
    }
  })
}

export function getTopCategories(limit = 5) {
  const db = getDB()
  const counts = new Map()
  db.borrows.forEach((borrow) => {
    if (!countsAsLoan(borrow)) return
    const book = db.books.find((item) => item.book_id === borrow.book_id)
    if (!book) return
    counts.set(book.category, (counts.get(book.category) || 0) + 1)
  })
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function getRecentActivity(limit = 8) {
  const db = getDB()
  const events = []

  db.borrows.forEach((borrow) => {
    if (!countsAsLoan(borrow)) return
    events.push({
      id: `borrow-${borrow.borrow_id}`,
      type: 'borrow',
      date: borrow.borrow_date,
      text: `${nameForStudent(db, borrow.student_id)} borrowed “${titleForBook(db, borrow.book_id)}”`,
    })
    if (borrow.return_date) {
      events.push({
        id: `return-${borrow.borrow_id}`,
        type: 'return',
        date: borrow.return_date,
        text: `${nameForStudent(db, borrow.student_id)} returned “${titleForBook(db, borrow.book_id)}”`,
      })
    }
  })

  db.fines.forEach((fine) => {
    events.push({
      id: `fine-${fine.fine_id}`,
      type: 'fine',
      date: fine.issued_date,
      text: `${nameForStudent(db, fine.student_id)} · ${fine.reason} fine of ₱${Number(fine.amount).toFixed(2)}`,
    })
  })

  return events
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
}

export function getLibrarianWorkload() {
  const db = getDB()
  return db.librarians
    .map((librarian) => ({
      librarian,
      loans: db.borrows.filter((borrow) => borrow.librarian_id === librarian.librarian_id).length,
    }))
    .sort((a, b) => b.loans - a.loans)
}

export function getRoleCounts() {
  const db = getDB()
  return {
    [ROLE.STUDENT]: db.students.length,
    [ROLE.LIBRARIAN]: db.librarians.length,
    [ROLE.SUPER]: db.superlibrarians.length,
  }
}
