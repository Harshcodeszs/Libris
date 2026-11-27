import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

let server
let operations
let getDB
let resetDB
let saveDB

const items = new Map()
globalThis.localStorage = {
  getItem(key) { return items.get(key) ?? null },
  setItem(key, value) { items.set(key, value) },
  removeItem(key) { items.delete(key) },
}

before(async () => {
  server = await createServer({
    appType: 'custom',
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, include: [] },
  })
  operations = await server.ssrLoadModule('/src/lib/borrowOperations.js')
  ;({ getDB, resetDB, saveDB } = await server.ssrLoadModule('/src/lib/db.js'))
})

after(async () => { await server?.close() })
beforeEach(() => { items.clear(); resetDB() })

function seed() {
  const db = getDB()
  db.students = [
    { student_id: 1, first_name: 'Ada', last_name: 'Reader', max_loan: 5 },
    { student_id: 2, first_name: 'Ben', last_name: 'Reader', max_loan: 5 },
  ]
  db.books = Array.from({ length: 7 }, (_, index) => ({
    book_id: index + 1, title: `Book ${index + 1}`, status: 'Available',
  }))
  db.librarians = [{ librarian_id: 8, first_name: 'Lee', last_name: 'Desk' }]
  saveDB(db)
}

test('student requests leave the copy available, and pending requests remain cancellable history', () => {
  seed()
  const request = operations.requestBorrowRecord({ studentId: 1, bookId: 1 })
  assert.equal(request.status, 'pending')
  assert.equal(getDB().books[0].status, 'Available')
  assert.equal(operations.readStudentBorrowState(1).pending.length, 1)
  assert.throws(
    () => operations.requestBorrowRecord({ studentId: 1, bookId: 1 }),
    /already have a pending request/,
  )
  assert.throws(
    () => operations.cancelBorrowRequestRecord(request.borrow_id, 2),
    /only cancel your own/,
  )
  operations.cancelBorrowRequestRecord(request.borrow_id, 1)
  assert.equal(operations.readStudentLoans(1).pending.length, 0)
  assert.equal(getDB().borrows[0].status, 'cancelled')
  assert.equal(getDB().books[0].status, 'Available')
})

test('combined pending and active requests respect the student limit and recorded unpaid fines', () => {
  seed()
  for (let bookId = 1; bookId <= 5; bookId += 1) {
    operations.requestBorrowRecord({ studentId: 1, bookId })
  }
  operations.approveBorrowRequest(1, { librarianId: 8, actorRole: 'librarian' })
  assert.equal(operations.readStudentBorrowState(1).active.length, 1)
  assert.equal(operations.readStudentBorrowState(1).pending.length, 4)
  assert.throws(
    () => operations.requestBorrowRecord({ studentId: 1, bookId: 6 }),
    /reached your limit of 5/,
  )
  operations.cancelBorrowRequestRecord(2, 1)
  const db = getDB()
  db.fines.push({ fine_id: 1, student_id: 1, amount: 5, status: 'unpaid', issued_date: '2026-01-01' })
  saveDB(db)
  assert.throws(
    () => operations.requestBorrowRecord({ studentId: 1, bookId: 6 }),
    /Settle your unpaid fines/,
  )
})

test('approval starts a loan, marks the book borrowed, and rejects competing requests', () => {
  seed()
  const first = operations.requestBorrowRecord({ studentId: 1, bookId: 1 })
  const competing = operations.requestBorrowRecord({ studentId: 2, bookId: 1 })
  const loan = operations.approveBorrowRequest(first.borrow_id, {
    librarianId: 8, actorRole: 'librarian',
  })
  assert.equal(loan.status, 'active')
  assert.equal(loan.processed_by_id, 8)
  assert.equal(getDB().books[0].status, 'Borrowed')
  assert.equal(getDB().borrows.find((row) => row.borrow_id === competing.borrow_id).status, 'rejected')
  assert.equal(operations.readBorrowRequests().pending.length, 0)
  assert.equal(operations.readBorrowRequests().reviewed.length, 1)
  assert.throws(
    () => operations.approveBorrowRequest(competing.borrow_id, { librarianId: 8 }),
    /already been reviewed/,
  )
})

test('staff rejection keeps the copy available and the reviewed request in history', () => {
  seed()
  const request = operations.requestBorrowRecord({ studentId: 1, bookId: 1 })
  operations.rejectBorrowRequest(request.borrow_id, {
    librarianId: 8, actorRole: 'librarian', reason: 'Declined by the library desk.',
  })
  assert.equal(getDB().books[0].status, 'Available')
  assert.equal(operations.readBorrowRequests().reviewed[0].rejection_reason, 'Declined by the library desk.')
  const history = operations.readStudentLoans(1)
  assert.deepEqual(history.loans.map((row) => row.status), ['rejected'])
  assert.equal(history.pending.length, 0)
  assert.equal(history.loans[0].book.title, 'Book 1')
  assert.equal(getDB().borrows[0].status, 'rejected')
  assert.throws(() => operations.cancelBorrowRequestRecord(request.borrow_id, 1), /Only pending requests/)
})

test('student history displays a declined request without a pending count or cancel control', async () => {
  seed()
  const db = getDB()
  db.session = { role: 'student', id: 1 }
  saveDB(db)
  const request = operations.requestBorrowRecord({ studentId: 1, bookId: 1 })
  operations.rejectBorrowRequest(request.borrow_id, { librarianId: 8 })
  const rejected = getDB().borrows.find((row) => row.borrow_id === request.borrow_id)
  rejected.request_date = '2020-01-01'
  rejected.borrow_date = '2020-01-01'
  rejected.due_date = '2020-01-15'
  saveDB(getDB())
  const { default: MyLoans } = await server.ssrLoadModule('/src/pages/student/MyLoans.jsx')
  const { AuthProvider } = await server.ssrLoadModule('/src/context/AuthContext.jsx')
  const { ToastProvider } = await server.ssrLoadModule('/src/context/ToastContext.jsx')
  const markup = renderToStaticMarkup(
    createElement(MemoryRouter, null,
      createElement(AuthProvider, null,
        createElement(ToastProvider, null, createElement(MyLoans)))),
  )
  assert.equal((markup.match(/Declined/g) || []).length, 2)
  assert.doesNotMatch(markup, /Cancel request|Awaiting approval/)
  assert.match(markup, /Pending requests<\/p><p[^>]*>0<\/p>/)
  assert.match(markup, /On loan<\/p><p[^>]*>0<\/p>/)
  assert.match(markup, /Returned<\/p><p[^>]*>0<\/p>/)
  assert.doesNotMatch(markup, /Estimated fine ₱|>est\.<\/span>/)
  assert.match(markup, /<dt[^>]*>Requested<\/dt>/)
})

test('desk issue requires selections and a future due date before changing storage', () => {
  seed()
  assert.throws(
    () => operations.issueDeskLoan({ studentId: '', bookId: '1', dueDate: '2030-01-01' }, { id: 8, role: 'librarian' }),
    { message: 'Choose both a student and an available book.' },
  )
  assert.throws(
    () => operations.issueDeskLoan({ studentId: '1', bookId: '1', dueDate: '2000-01-01' }, { id: 8, role: 'librarian' }),
    /due date must be after today/,
  )
  assert.equal(getDB().borrows.length, 0)
  const issued = operations.issueDeskLoan(
    { studentId: '1', bookId: '1', dueDate: '2030-01-01' }, { id: 8, role: 'librarian' },
  )
  assert.equal(issued.status, 'active')
  assert.equal(getDB().books[0].status, 'Borrowed')
  assert.equal(operations.readStaffLoans().rows[0].librarian.first_name, 'Lee')
})

test('desk issue rejects another student’s pending request without removing its history', () => {
  seed()
  const waiting = operations.requestBorrowRecord({ studentId: 2, bookId: 1 })
  operations.issueDeskLoan(
    { studentId: '1', bookId: '1', dueDate: '2030-01-01' }, { id: 8, role: 'librarian' },
  )
  assert.equal(getDB().borrows.find((row) => row.borrow_id === waiting.borrow_id).status, 'rejected')
  assert.equal(operations.readBorrowRequests().reviewed[0].borrow_id, waiting.borrow_id)
  assert.equal(operations.readStaffLoans().pendingCount, 0)
})

test('on-time returns restore the book without creating a fine', () => {
  seed()
  const issued = operations.issueDeskLoan(
    { studentId: '1', bookId: '1', dueDate: '2030-01-01' }, { id: 8, role: 'librarian' },
  )
  const result = operations.returnBorrowedBook(issued.borrow_id)
  assert.equal(result.fine, null)
  assert.equal(result.lateDays, 0)
  assert.equal(getDB().fines.length, 0)
  assert.equal(getDB().books[0].status, 'Available')
  assert.equal(operations.readStudentLoans(1).loans[0].status, 'returned')
})

test('late returns restore availability, create one overdue fine, and retain loan history', () => {
  seed()
  const db = getDB()
  db.books[0].status = 'Borrowed'
  db.borrows.push({
    borrow_id: 1, student_id: 1, book_id: 1, status: 'active',
    borrow_date: '2020-01-01', due_date: '2020-01-02', return_date: null,
  })
  saveDB(db)
  const result = operations.returnBorrowedBook(1)
  assert.equal(result.fine.reason, 'Overdue')
  assert.equal(result.fine.amount, result.lateDays * 5)
  assert.equal(getDB().books[0].status, 'Available')
  assert.equal(operations.readStudentLoans(1).loans[0].status, 'returned')
  assert.equal(operations.readStudentLoans(1).loans[0].fine.fine_id, result.fine.fine_id)
  assert.throws(() => operations.returnBorrowedBook(1), /Only active loans/)
  assert.equal(getDB().fines.length, 1)
})

test('read projections join related records, sort without changing storage, and count pending requests', () => {
  seed()
  const db = getDB()
  db.borrows = [
    { borrow_id: 2, student_id: 1, book_id: 2, status: 'returned', borrow_date: '2026-01-02', return_date: '2026-01-15' },
    { borrow_id: 1, student_id: 1, book_id: 1, status: 'active', borrow_date: '2026-01-01', due_date: '2030-01-01' },
    { borrow_id: 3, student_id: 2, book_id: 3, status: 'pending', borrow_date: '2026-01-03' },
  ]
  db.fines.push({ fine_id: 1, borrow_id: 2, student_id: 1, amount: 10, status: 'paid' })
  saveDB(db)
  const staff = operations.readStaffLoans()
  assert.deepEqual(staff.rows.map((row) => row.borrow_id), [2, 1])
  assert.equal(staff.pendingCount, 1)
  assert.equal(staff.rows[1].student.first_name, 'Ada')
  assert.deepEqual(staff.availableBooks.map((book) => book.title).slice(0, 2), ['Book 1', 'Book 2'])
  const student = operations.readStudentLoans(1)
  assert.deepEqual(student.loans.map((row) => row.borrow_id), [2, 1])
  assert.equal(student.loans[0].fine.amount, 10)
  assert.equal(student.loans[1].book.title, 'Book 1')
  assert.equal(getDB().borrows[0].borrow_id, 2)
})
