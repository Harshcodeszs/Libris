import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

let server
let operations
let getDB
let resetDB
let saveDB
let returnBook

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
  operations = await server.ssrLoadModule('/src/lib/fineOperations.js')
  ;({ getDB, resetDB, saveDB } = await server.ssrLoadModule('/src/lib/db.js'))
  ;({ returnBook } = await server.ssrLoadModule('/src/lib/rules.js'))
})

after(async () => { await server?.close() })
beforeEach(() => { items.clear(); resetDB() })

function addStudent() {
  const db = getDB()
  db.students.push({ student_id: 1, first_name: 'Ada', last_name: 'Reader' })
  saveDB(db)
}

test('read joins fines with student and loan book, and orders newest first without changing storage', () => {
  const db = getDB()
  db.students.push({ student_id: 1, first_name: 'Ada', last_name: 'Reader' })
  db.books.push({ book_id: 2, title: 'Example', status: 'Available' })
  db.borrows.push({ borrow_id: 3, book_id: 2, student_id: 1, status: 'returned', borrow_date: '2026-11-01' })
  db.fines.push(
    { fine_id: 1, student_id: 1, borrow_id: null, amount: 5, reason: 'Lost', status: 'unpaid', issued_date: '2026-11-01' },
    { fine_id: 2, student_id: 1, borrow_id: 3, amount: 10, reason: 'Damaged', status: 'unpaid', issued_date: '2026-11-02' },
  )
  saveDB(db)

  const view = operations.readFines()
  assert.deepEqual(view.fines.map((fine) => fine.fine_id), [2, 1])
  assert.equal(view.fines[0].student.first_name, 'Ada')
  assert.equal(view.fines[0].book.title, 'Example')
  assert.equal(view.fines[1].book, null)
  assert.equal(view.bookById.get(2).title, 'Example')
  assert.equal(getDB().fines[0].fine_id, 1)
})

test('issue rejects an empty student or nonpositive amount before changing records', () => {
  addStudent()
  assert.throws(
    () => operations.issueFineRecord({ studentId: '', borrowId: '', amount: '5', reason: 'Damaged' }),
    { message: 'Choose the student the fine belongs to.' },
  )
  assert.throws(
    () => operations.issueFineRecord({ studentId: '1', borrowId: '', amount: '0', reason: 'Damaged' }),
    { message: 'Enter a fine amount greater than zero.' },
  )
  assert.equal(getDB().fines.length, 0)
})

test('issue and pay retain the fine and record its payment date', () => {
  addStudent()
  const fine = operations.issueFineRecord({ studentId: '1', borrowId: '', amount: '12.5', reason: 'Lost' })
  assert.equal(getDB().fines[0].fine_id, fine.fine_id)
  operations.payFineRecord(fine.fine_id)
  assert.equal(operations.readFines().fines[0].status, 'paid')
  assert.match(getDB().fines[0].paid_date, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(getDB().fines.length, 1)
  assert.throws(() => operations.payFineRecord(fine.fine_id), /Only unpaid fines/)
})

test('waive retains the fine without a payment date', () => {
  addStudent()
  const fine = operations.issueFineRecord({ studentId: '1', borrowId: '', amount: '15', reason: 'Damaged' })
  operations.waiveFineRecord(fine.fine_id)
  assert.equal(getDB().fines[0].status, 'waived')
  assert.equal(getDB().fines[0].paid_date, null)
  assert.equal(getDB().fines.length, 1)
  assert.throws(() => operations.waiveFineRecord(fine.fine_id), /Only unpaid fines/)
})

test('a late return still creates an overdue fine visible in the Fine read view', () => {
  const db = getDB()
  db.students.push({ student_id: 1, first_name: 'Ada', last_name: 'Reader' })
  db.books.push({ book_id: 2, title: 'Example', status: 'Borrowed' })
  db.borrows.push({
    borrow_id: 3, book_id: 2, student_id: 1, status: 'active',
    due_date: '2020-01-01', return_date: null,
  })
  saveDB(db)

  const result = returnBook(3)
  assert.equal(result.fine.reason, 'Overdue')
  assert.equal(operations.readFines().fines[0].borrow.borrow_id, 3)
  assert.equal(getDB().books[0].status, 'Available')
})
