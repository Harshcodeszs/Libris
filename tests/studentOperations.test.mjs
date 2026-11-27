import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

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
  operations = await server.ssrLoadModule('/src/lib/studentOperations.js')
  ;({ getDB, resetDB, saveDB } = await server.ssrLoadModule('/src/lib/db.js'))
})

after(async () => { await server?.close() })
beforeEach(() => { items.clear(); resetDB() })

function seed() {
  const db = getDB()
  db.students = [
    { student_id: 2, first_name: 'Zoe', last_name: 'Reader', student_email: 'zoe@gmail.com', max_loan: 5 },
    { student_id: 1, first_name: 'Ada', last_name: 'Reader', student_email: 'ada@gmail.com', max_loan: 5 },
  ]
  db.borrows = [
    { borrow_id: 1, student_id: 1, book_id: 4, status: 'active', borrow_date: '2026-01-01', due_date: '2030-01-01' },
    { borrow_id: 2, student_id: 1, book_id: 5, status: 'returned', borrow_date: '2026-01-02', return_date: '2026-01-10' },
    { borrow_id: 3, student_id: 1, book_id: 6, status: 'pending', borrow_date: '2026-01-03' },
    { borrow_id: 4, student_id: 1, book_id: 7, status: 'rejected', borrow_date: '2026-01-04' },
    { borrow_id: 5, student_id: 2, book_id: 8, status: 'active', borrow_date: '2026-01-05', due_date: '2030-01-01' },
  ]
  db.fines = [
    { fine_id: 1, student_id: 1, amount: 10, status: 'unpaid', issued_date: '2026-01-01' },
    { fine_id: 2, student_id: 1, amount: 5, status: 'paid', issued_date: '2026-01-02' },
  ]
  saveDB(db)
}

test('registration email lookup includes account and pending registration emails', () => {
  seed()
  const db = getDB()
  db.pending_registrations.push({ email: 'waiting@gmail.com' })
  saveDB(db)
  const emails = operations.readRegistrationEmails()
  assert.equal(emails.has('ada@gmail.com'), true)
  assert.equal(emails.has('waiting@gmail.com'), true)
  assert.equal(emails.has('new@gmail.com'), false)
})

test('registration stays pending until confirmed and cannot reuse an existing email', () => {
  const values = {
    firstName: 'Ada', lastName: 'Reader', email: 'ADA@gmail.com',
    contactNumber: '09171234567', password: 'secret123', confirmPassword: 'secret123',
    agreedToTerms: true,
  }
  const pending = operations.beginStudentRegistration(values)
  assert.equal(getDB().students.length, 0)
  assert.equal(getDB().pending_registrations.length, 1)
  assert.equal(operations.readRegistrationEmails().has('ada@gmail.com'), true)
  assert.throws(() => operations.beginStudentRegistration(values), /already exists/)
  const student = operations.confirmStudentRegistration(pending.token)
  assert.equal(student.student_email, 'ada@gmail.com')
  assert.equal(student.max_loan, 5)
  assert.equal(getDB().pending_registrations.length, 0)
  assert.throws(() => operations.confirmStudentRegistration(pending.token), /invalid or has already been used/)
})

test('resending confirmation replaces the previous token without creating another student', () => {
  const pending = operations.beginStudentRegistration({
    firstName: 'Ada', lastName: 'Reader', email: 'ada@gmail.com',
    contactNumber: '09171234567', password: 'secret123',
  })
  const previousToken = pending.token
  const resent = operations.resendStudentRegistration(pending.email, pending.token)
  assert.notEqual(resent.token, previousToken)
  assert.equal(getDB().pending_registrations.length, 1)
  assert.equal(getDB().students.length, 0)
})

test('staff directory and selected record retain loan, fine, and sorting rules without mutating storage', () => {
  seed()
  const directory = operations.readStudentDirectory()
  assert.deepEqual(directory.map((student) => student.student_id), [1, 2])
  assert.deepEqual(
    [directory[0].activeCount, directory[0].totalBorrows, directory[0].unpaid],
    [1, 2, 10],
  )
  const record = operations.readStudentRecord(1)
  assert.deepEqual(record.borrows.map((borrow) => borrow.borrow_id), [2, 1])
  assert.deepEqual(record.fines.map((fine) => fine.fine_id), [2, 1])
  assert.equal(operations.readStudentRecord(null), null)
  assert.equal(getDB().students[0].student_id, 2)
  assert.equal(getDB().borrows[0].borrow_id, 1)
})

test('student profile reads current totals and updates only the signed-in student record', () => {
  seed()
  assert.equal(operations.readStudentProfile(1).openLoans, 1)
  assert.equal(operations.readStudentProfile(1).outstanding, 10)
  const updated = operations.updateStudentAccount(1, {
    firstName: 'Ada ', lastName: 'Updated', contactNumber: '+639171234567',
  })
  assert.equal(updated.first_name, 'Ada')
  assert.equal(operations.readStudentProfile(1).student.last_name, 'Updated')
  assert.equal(getDB().students[0].first_name, 'Zoe')
  assert.equal(getDB().students[1].contact_number, '09171234567')
  assert.throws(
    () => operations.updateStudentAccount(1, {
      firstName: ' ', lastName: 'Reader', contactNumber: '09171234567',
    }),
    /Names are required/,
  )
})
