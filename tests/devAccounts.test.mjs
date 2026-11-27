import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { build, createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

let server
let seed
let resetTestPasswords
let login
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
  ;({ createDevAccounts: seed, resetDevPasswords: resetTestPasswords } = await server.ssrLoadModule('/src/lib/devAccounts.js'))
  ;({ login } = await server.ssrLoadModule('/src/lib/auth.js'))
  ;({ getDB, resetDB, saveDB } = await server.ssrLoadModule('/src/lib/db.js'))
})

after(async () => { await server?.close() })
beforeEach(() => { items.clear(); resetDB() })

test('creates three distinct sign-in accounts without storing plaintext passwords', () => {
  const result = seed()
  assert.equal(result.created.length, 3)
  assert.deepEqual(result.skipped, [])
  for (const { role, email, password } of result.created) {
    assert.ok(password.length >= 16)
    assert.equal(login(email, password).role, role)
    assert.ok(!items.get('libris.db.v1').includes(password))
  }
  assert.equal(getDB().students[0].is_verified, true)
  assert.equal(getDB().librarians[0].must_change_password, false)
  assert.equal(getDB().books.length, 0)
})

test('repeating setup leaves accounts, sessions and existing data unchanged', () => {
  const first = seed()
  const db = getDB()
  db.books.push({ book_id: 42 })
  saveDB(db)
  login(first.created[0].email, first.created[0].password)
  const before = items.get('libris.db.v1')
  const second = seed()
  assert.deepEqual(second.created, [])
  assert.deepEqual(second.skipped, ['student', 'librarian', 'superlibrarian'])
  assert.equal(items.get('libris.db.v1'), before)
})

test('creates only missing roles when another role already exists', () => {
  const db = getDB()
  db.students.push({
    student_id: 8, first_name: 'Real', last_name: 'Student',
    student_email: 'real@gmail.com', password_hash: 'existing', is_verified: true,
  })
  db.books.push({ book_id: 42 })
  saveDB(db)
  const result = seed()
  assert.deepEqual(result.skipped, ['student'])
  assert.deepEqual(result.created.map((account) => account.role), ['librarian', 'superlibrarian'])
  assert.equal(getDB().students.length, 1)
  assert.equal(getDB().books[0].book_id, 42)
})

test('a conflicting email cannot partially create other accounts', () => {
  const db = getDB()
  db.librarians.push({
    librarian_id: 9, librarian_email: 'test.superlibrarian@libris.test',
    first_name: 'Existing', last_name: 'Staff', password_hash: 'existing',
  })
  saveDB(db)
  const before = items.get('libris.db.v1')
  assert.throws(() => seed(), /already in use/)
  assert.equal(items.get('libris.db.v1'), before)
  assert.equal(getDB().students.length, 0)
})

test('setup does not take an email reserved by a pending student registration', () => {
  const db = getDB()
  db.pending_registrations.push({
    email: 'test.student@gmail.com', token: 'existing-registration',
    expires_at: Date.now() + 60_000,
  })
  saveDB(db)
  assert.throws(() => seed(), /already in use/)
  assert.equal(getDB().pending_registrations.length, 1)
  assert.equal(getDB().students.length, 0)
})

test('reset replaces passwords for only the three seeded accounts without changing related data', () => {
  const first = seed()
  const db = getDB()
  db.students.push({ student_id: 7, student_email: 'other@gmail.com', password_hash: 'untouched' })
  db.books.push({ book_id: 42 })
  db.borrows.push({ borrow_id: 3, student_id: 1, librarian_id: 1 })
  saveDB(db)
  const snapshot = JSON.parse(items.get('libris.db.v1'))

  const updated = resetTestPasswords()
  assert.equal(updated.length, 3)
  for (const { role, email, password } of updated) {
    assert.equal(first.created.find((item) => item.role === role).email, email)
    assert.notEqual(password, first.created.find((item) => item.role === role).password)
    assert.throws(() => login(email, first.created.find((item) => item.role === role).password), /Invalid email or password/)
    assert.equal(login(email, password).role, role)
    assert.ok(!items.get('libris.db.v1').includes(password))
  }
  const current = getDB()
  assert.equal(current.students[1].password_hash, 'untouched')
  assert.deepEqual(current.books, snapshot.books)
  assert.deepEqual(current.borrows, snapshot.borrows)
  assert.deepEqual(current.students.map((student) => student.student_id), [1, 7])
  assert.equal(current.librarians[0].librarian_id, 1)
  assert.equal(current.superlibrarians[0].superlibrarian_id, 1)
})

test('reset refuses missing test accounts without changing any existing password', () => {
  const db = getDB()
  db.students.push({ student_id: 9, student_email: 'test.student@gmail.com', password_hash: 'existing' })
  saveDB(db)
  const before = items.get('libris.db.v1')
  assert.throws(() => resetTestPasswords(), /all three test accounts/)
  assert.equal(items.get('libris.db.v1'), before)
})

test('production mode rejects account creation', async () => {
  const previousEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  let result
  try {
    result = await build({
      configFile: false,
      logLevel: 'silent',
      build: {
        write: false,
        lib: { entry: 'src/lib/devAccounts.js', formats: ['es'], fileName: 'dev-accounts' },
      },
    })
  } finally {
    process.env.NODE_ENV = previousEnv
  }
  const source = result[0].output.find((file) => file.type === 'chunk').code
  const { createDevAccounts, resetDevPasswords } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  assert.throws(() => createDevAccounts(), /only in development/)
  assert.throws(() => resetDevPasswords(), /only in development/)
  assert.equal(getDB().students.length, 0)
})

test('setup page presents an explicit create action before showing credentials', async () => {
  const { default: Setup } = await server.ssrLoadModule('/src/pages/auth/DevAccounts.jsx')
  const markup = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Setup)))
  assert.match(markup, /Create test accounts/)
  assert.match(markup, /local browser/)
  assert.doesNotMatch(markup, /L7-/)
  assert.equal(getDB().students.length, 0)
})

test('setup page offers password reset when all three test accounts exist', async () => {
  seed()
  const { default: Setup } = await server.ssrLoadModule('/src/pages/auth/DevAccounts.jsx')
  const markup = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Setup)))
  assert.match(markup, /Reset test passwords/)
  assert.match(markup, /replaces the old passwords/)
})

test('the app includes the setup page in development but excludes it in production', async () => {
  async function compile(mode) {
    const old = process.env.NODE_ENV
    process.env.NODE_ENV = mode
    try {
      const output = await build({
        configFile: false,
        logLevel: 'silent',
        build: {
          write: false,
          lib: { entry: 'src/App.jsx', formats: ['es'], fileName: 'app' },
          rollupOptions: { external: ['lucide-react'] },
        },
      })
      return output[0].output.filter((file) => file.type === 'chunk').map((file) => file.code).join('\n')
    } finally {
      process.env.NODE_ENV = old
    }
  }
  assert.equal((await compile('development')).includes('Local test accounts'), true)
  assert.equal((await compile('production')).includes('Local test accounts'), false)
})
