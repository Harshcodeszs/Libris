import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

let server
let auth
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
  auth = await server.ssrLoadModule('/src/lib/auth.js')
  ;({ getDB, resetDB, saveDB } = await server.ssrLoadModule('/src/lib/db.js'))
})

after(async () => { await server?.close() })
beforeEach(() => { items.clear(); resetDB() })

async function librarianOperations() {
  return server.ssrLoadModule('/src/lib/librarianOperations.js')
}

test('permanent deletion is blocked before changing accounts or historical loans', () => {
  const librarian = auth.createLibrarian({
    firstName: 'Ada',
    lastName: 'Reader',
    email: 'ada@example.com',
    password: 'SafePass123!',
  })
  const db = getDB()
  db.borrows.push({
    borrow_id: 1,
    librarian_id: librarian.librarian_id,
    student_id: 1,
    book_id: 1,
    status: 'returned',
  })
  saveDB(db)
  const before = items.get('libris.db.v1')

  assert.throws(() => auth.deleteLibrarian(librarian.librarian_id), /temporarily unavailable/)
  assert.equal(items.get('libris.db.v1'), before)
  assert.equal(getDB().borrows[0].librarian_id, librarian.librarian_id)
  assert.equal(auth.login('ada@example.com', 'SafePass123!').role, 'librarian')
})

test('the librarian page keeps delete controls visible but disabled', async () => {
  auth.createLibrarian({
    firstName: 'Ada',
    lastName: 'Reader',
    email: 'ada@example.com',
    password: 'SafePass123!',
  })
  const { ToastProvider } = await server.ssrLoadModule('/src/context/ToastContext.jsx')
  const { default: ManageLibrarians } = await server.ssrLoadModule('/src/pages/super/ManageLibrarians.jsx')
  const markup = renderToStaticMarkup(
    createElement(ToastProvider, null, createElement(ManageLibrarians)),
  )
  const deleteButtons = [...markup.matchAll(/<button\b[^>]*>.*?<\/button>/gs)]
    .map(([button]) => button)
    .filter((button) => /aria-label="Delete Ada Reader"/.test(button) || />Delete<\/button>$/.test(button))
  assert.equal(deleteButtons.length, 2)
  deleteButtons.forEach((button) => assert.match(button, /\sdisabled=""/))
  assert.match(markup, /deletion is temporarily unavailable/i)
})

test('read orders librarians by name and counts processed loans without changing records', async () => {
  const zebra = auth.createLibrarian({
    firstName: 'Zara', lastName: 'Reader', email: 'zara@example.com', password: 'SafePass123!',
  })
  auth.createLibrarian({
    firstName: 'Ada', lastName: 'Reader', email: 'ada@example.com', password: 'SafePass123!',
  })
  const db = getDB()
  db.borrows.push({ borrow_id: 1, librarian_id: zebra.librarian_id })
  saveDB(db)

  const { readLibrarians } = await librarianOperations()
  const view = readLibrarians()
  assert.deepEqual(view.librarians.map((item) => item.first_name), ['Ada', 'Zara'])
  assert.equal(view.loanCounts.get(zebra.librarian_id), 1)
  assert.equal(getDB().librarians[0].first_name, 'Zara')
})

test('create validates the form without writing an incomplete account', async () => {
  const { createLibrarianRecord } = await librarianOperations()
  assert.throws(
    () => createLibrarianRecord({
      firstName: ' ', lastName: 'Reader', email: 'ada@example.com',
      password: 'SafePass123!', confirmPassword: 'SafePass123!',
    }),
    /First and last name are required/,
  )
  assert.equal(getDB().librarians.length, 0)
})

test('create and update keep login working and optional password unchanged', async () => {
  const { createLibrarianRecord, updateLibrarianRecord } = await librarianOperations()
  const librarian = createLibrarianRecord({
    firstName: 'Ada', lastName: 'Reader', email: 'ada@example.com',
    password: 'SafePass123!', confirmPassword: 'SafePass123!',
  })
  assert.equal(getDB().librarians[0].librarian_id, librarian.librarian_id)
  updateLibrarianRecord(librarian.librarian_id, {
    firstName: 'Ada', lastName: 'Writer', email: 'ada@example.com',
    password: '', confirmPassword: '',
  })
  assert.equal(auth.login('ada@example.com', 'SafePass123!').lastName, 'Writer')
})

test('update rejects mismatched replacement passwords without changing login', async () => {
  const { createLibrarianRecord, updateLibrarianRecord } = await librarianOperations()
  const librarian = createLibrarianRecord({
    firstName: 'Ada', lastName: 'Reader', email: 'ada@example.com',
    password: 'SafePass123!', confirmPassword: 'SafePass123!',
  })
  assert.throws(
    () => updateLibrarianRecord(librarian.librarian_id, {
      firstName: 'Ada', lastName: 'Writer', email: 'ada@example.com',
      password: 'OtherPass123!', confirmPassword: 'DifferentPass123!',
    }),
    /two passwords do not match/,
  )
  assert.equal(auth.login('ada@example.com', 'SafePass123!').lastName, 'Reader')
})

test('delete operation refuses removal and retains the librarian', async () => {
  const { deleteLibrarianRecord, createLibrarianRecord } = await librarianOperations()
  const librarian = createLibrarianRecord({
    firstName: 'Ada', lastName: 'Reader', email: 'ada@example.com',
    password: 'SafePass123!', confirmPassword: 'SafePass123!',
  })
  assert.throws(() => deleteLibrarianRecord(librarian.librarian_id), /temporarily unavailable/)
  assert.equal(getDB().librarians.length, 1)
})
