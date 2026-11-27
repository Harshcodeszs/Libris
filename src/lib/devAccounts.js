import { getDB, nextId, saveDB } from './db'
import { hashPassword } from './hash'
import { ROLE, DEFAULT_MAX_LOAN } from './constants'
import { todayISO } from './format'

const ACCOUNTS = [
  { role: ROLE.STUDENT, email: 'test.student@gmail.com', collection: 'students', emailKey: 'student_email', idKey: 'student_id', lastName: 'Student' },
  { role: ROLE.LIBRARIAN, email: 'test.librarian@libris.test', collection: 'librarians', emailKey: 'librarian_email', idKey: 'librarian_id', lastName: 'Librarian' },
  { role: ROLE.SUPER, email: 'test.superlibrarian@libris.test', collection: 'superlibrarians', emailKey: 'superlibrarian_email', idKey: 'superlibrarian_id', lastName: 'Superlibrarian' },
]

function temporaryPassword() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return `L7-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}

// Only the development page imports this module; production builds exclude that route.
export function createDevAccounts() {
  if (!import.meta.env.DEV) throw new Error('Test accounts are available only in development.')
  const db = getDB()
  const created = []
  const skipped = []
  const existingEmails = [
    ...db.students.map((item) => item.student_email),
    ...db.librarians.map((item) => item.librarian_email),
    ...db.superlibrarians.map((item) => item.superlibrarian_email),
    ...db.pending_registrations
      .filter((item) => item.expires_at > Date.now())
      .map((item) => item.email),
  ].map((email) => email.toLowerCase())

  // Validate the entire batch before mutating the cached database.
  for (const account of ACCOUNTS) {
    if (!db[account.collection].length && existingEmails.includes(account.email)) {
      throw new Error(`Cannot create ${account.role}: ${account.email} is already in use.`)
    }
  }

  for (const account of ACCOUNTS) {
    if (db[account.collection].length) {
      skipped.push(account.role)
      continue
    }
    const password = temporaryPassword()
    db[account.collection].push({
      [account.idKey]: nextId(db[account.collection], account.idKey),
      [account.emailKey]: account.email,
      first_name: 'Test',
      last_name: account.lastName,
      password_hash: hashPassword(password),
      created_at: todayISO(),
      ...(account.role === ROLE.STUDENT
        ? { is_verified: true, contact_number: '', max_loan: DEFAULT_MAX_LOAN }
        : {}),
      ...(account.role === ROLE.LIBRARIAN ? { must_change_password: false } : {}),
    })
    created.push({ role: account.role, email: account.email, password })
  }
  if (created.length) saveDB(db)
  return { created, skipped }
}

export function resetDevPasswords() {
  if (!import.meta.env.DEV) throw new Error('Test accounts are available only in development.')
  const db = getDB()
  const targets = ACCOUNTS.map((account) => ({
    account,
    user: db[account.collection].find(
      (item) => item[account.emailKey].toLowerCase() === account.email,
    ),
  }))
  if (targets.some(({ user }) => !user)) {
    throw new Error('Create all three test accounts before resetting their passwords.')
  }
  const updated = targets.map(({ account, user }) => ({
    account,
    user,
    password: temporaryPassword(),
  }))
  for (const { user, password } of updated) user.password_hash = hashPassword(password)
  saveDB(db)
  return updated.map(({ account, password }) => ({
    role: account.role,
    email: account.email,
    password,
  }))
}
