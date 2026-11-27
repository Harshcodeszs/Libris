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
  operations = await server.ssrLoadModule('/src/lib/bookOperations.js')
  ;({ getDB, resetDB, saveDB } = await server.ssrLoadModule('/src/lib/db.js'))
})

after(async () => { await server?.close() })
beforeEach(() => { items.clear(); resetDB() })

test('read returns sorted books and the current loan and student lookups without mutating shared records', () => {
  const db = getDB()
  db.books = [
    { book_id: 2, title: 'Zebra', author: 'B', category: 'Fiction', status: 'Borrowed' },
    { book_id: 1, title: 'Apple', author: 'A', category: 'Fiction', status: 'Available' },
  ]
  db.borrows = [{ borrow_id: 1, book_id: 2, student_id: 7, status: 'active', due_date: '2026-12-01' }]
  db.students = [{ student_id: 7, first_name: 'A', last_name: 'Reader' }]
  saveDB(db)

  const view = operations.readBooks()
  assert.deepEqual(view.books.map((book) => book.title), ['Apple', 'Zebra'])
  assert.equal(view.activeByBook.get(2).student_id, 7)
  assert.equal(view.studentById.get(7).last_name, 'Reader')
  assert.equal(getDB().books[0].title, 'Zebra')
})

test('form validation rejects missing title or author before writing a book', () => {
  assert.throws(
    () => operations.createBookRecord({ title: ' ', author: 'Reader', category: 'Fiction', status: 'Available' }),
    { message: 'Title and author are required.' },
  )
  assert.equal(getDB().books.length, 0)
})

test('create, update and delete keep the shared catalog in sync with the existing Book rules', () => {
  const book = operations.createBookRecord({
    title: 'Example',
    author: 'Writer',
    category: 'Fiction',
    status: 'Available',
  })
  assert.equal(getDB().books[0].book_id, book.book_id)
  operations.updateBookRecord(book.book_id, {
    title: 'Revised',
    author: 'Writer',
    category: 'Fiction',
    status: 'Damaged',
  })
  assert.equal(operations.readBooks().books[0].status, 'Damaged')
  operations.deleteBookRecord(book.book_id)
  assert.equal(operations.readBooks().books.length, 0)
})

test('update keeps the existing active-loan restriction', () => {
  const book = operations.createBookRecord({
    title: 'On loan',
    author: 'Writer',
    category: 'Fiction',
    status: 'Available',
  })
  const db = getDB()
  db.borrows.push({ borrow_id: 1, book_id: book.book_id, student_id: 7, status: 'active', return_date: null })
  saveDB(db)
  assert.throws(
    () => operations.updateBookRecord(book.book_id, {
      title: 'On loan',
      author: 'Writer',
      category: 'Fiction',
      status: 'Damaged',
    }),
    { message: 'This copy is on loan. Process its return before changing its status.' },
  )
  assert.equal(getDB().books[0].status, 'Available')
})
