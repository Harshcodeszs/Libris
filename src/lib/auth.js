import {
  allAccountEmails,
  emailFor,
  findUserByEmail,
  getDB,
  getUser,
  nextId,
  saveDB,
  studentEmailTaken,
} from './db'
import { createToken, hashPassword, verifyPassword } from './hash'
import {
  isGmail,
  isValidEmail,
  normalizePhone,
  passwordIssues,
} from './validation'
import { normalizeEmail, fullName, todayISO } from './format'
import { DEFAULT_MAX_LOAN, ROLE } from './constants'

const PENDING_TTL_MS = 24 * 60 * 60 * 1000
const RESET_TTL_MS = 60 * 60 * 1000

function hydrate(role, user) {
  if (!user) return null
  return {
    id:
      role === ROLE.STUDENT
        ? user.student_id
        : role === ROLE.LIBRARIAN
          ? user.librarian_id
          : user.superlibrarian_id,
    role,
    firstName: user.first_name,
    lastName: user.last_name,
    name: fullName(user),
    email: emailFor(user, role),
    contactNumber: user.contact_number || '',
    maxLoan: user.max_loan || DEFAULT_MAX_LOAN,
    mustChangePassword: Boolean(user.must_change_password),
    isVerified: user.is_verified !== false,
  }
}

export function getSessionUser() {
  const db = getDB()
  if (!db.session) return null
  const user = getUser(db.session.role, db.session.id)
  if (!user) {
    db.session = null
    saveDB(db)
    return null
  }
  return hydrate(db.session.role, user)
}

export function login(email, password) {
  const match = findUserByEmail(email)
  if (!match || !verifyPassword(password, match.user.password_hash)) {
    throw new Error('Invalid email or password. Please try again.')
  }
  if (match.role === ROLE.STUDENT && match.user.is_verified === false) {
    throw new Error('Please confirm your Gmail address before signing in.')
  }

  const db = getDB()
  db.session = {
    role: match.role,
    id:
      match.role === ROLE.STUDENT
        ? match.user.student_id
        : match.role === ROLE.LIBRARIAN
          ? match.user.librarian_id
          : match.user.superlibrarian_id,
    started_at: new Date().toISOString(),
  }
  saveDB(db)
  return hydrate(match.role, match.user)
}

export function logout() {
  const db = getDB()
  db.session = null
  saveDB(db)
}

export function registerStudent(values) {
  const email = normalizeEmail(values.email)
  if (!isGmail(email)) throw new Error('Registration requires a valid @gmail.com address.')
  if (allAccountEmails().has(email) || studentEmailTaken(email)) {
    throw new Error('An account with this email already exists.')
  }
  const issues = passwordIssues(values.password || '')
  if (issues.length) throw new Error(`Password needs ${issues.join(', ')}.`)

  const db = getDB()
  const now = Date.now()
  db.pending_registrations = db.pending_registrations.filter(
    (pending) => pending.expires_at > now && pending.email !== email,
  )

  const pending = {
    token: createToken(),
    email,
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    contact_number: normalizePhone(values.contactNumber),
    password_hash: hashPassword(values.password),
    created_at: now,
    expires_at: now + PENDING_TTL_MS,
  }
  db.pending_registrations.push(pending)
  saveDB(db)
  return pending
}

export function resendRegistration(email, previousToken) {
  const normalized = normalizeEmail(email)
  const db = getDB()
  const pending = db.pending_registrations.find(
    (item) => item.email === normalized && (!previousToken || item.token === previousToken),
  )
  if (!pending) throw new Error('This registration has expired. Please sign up again.')
  pending.token = createToken()
  pending.created_at = Date.now()
  pending.expires_at = Date.now() + PENDING_TTL_MS
  saveDB(db)
  return pending
}

export function confirmRegistration(token) {
  if (!token) throw new Error('This confirmation link is missing its token.')
  const db = getDB()
  const pending = db.pending_registrations.find((item) => item.token === token)
  if (!pending) throw new Error('This confirmation link is invalid or has already been used.')
  if (pending.expires_at < Date.now()) {
    db.pending_registrations = db.pending_registrations.filter((item) => item.token !== token)
    saveDB(db)
    throw new Error('This confirmation link has expired. Please register again.')
  }
  if (allAccountEmails().has(pending.email)) {
    db.pending_registrations = db.pending_registrations.filter((item) => item.token !== token)
    saveDB(db)
    throw new Error('An account with this email already exists.')
  }

  const student = {
    student_id: nextId(db.students, 'student_id'),
    first_name: pending.first_name,
    last_name: pending.last_name,
    contact_number: pending.contact_number,
    max_loan: DEFAULT_MAX_LOAN,
    password_hash: pending.password_hash,
    student_email: pending.email,
    is_verified: true,
    created_at: todayISO(),
  }

  db.students.push(student)
  db.pending_registrations = db.pending_registrations.filter((item) => item.token !== token)
  saveDB(db)
  return student
}

export function requestPasswordReset(email) {
  const match = findUserByEmail(email)
  if (!match) return null

  const db = getDB()
  const now = Date.now()
  db.reset_tokens = db.reset_tokens.filter((item) => item.expires_at > now)

  const id =
    match.role === ROLE.STUDENT
      ? match.user.student_id
      : match.role === ROLE.LIBRARIAN
        ? match.user.librarian_id
        : match.user.superlibrarian_id

  const token = {
    token: createToken(),
    role: match.role,
    id,
    email: emailFor(match.user, match.role),
    created_at: now,
    expires_at: now + RESET_TTL_MS,
  }
  db.reset_tokens.push(token)
  saveDB(db)
  return token
}

export function resetPassword(token, newPassword) {
  const db = getDB()
  const record = db.reset_tokens.find((item) => item.token === token)
  if (!record) throw new Error('This reset link is invalid or has already been used.')
  if (record.expires_at < Date.now()) {
    db.reset_tokens = db.reset_tokens.filter((item) => item.token !== token)
    saveDB(db)
    throw new Error('This reset link has expired. Request a new one.')
  }
  const issues = passwordIssues(newPassword)
  if (issues.length) throw new Error(`Password needs ${issues.join(', ')}.`)

  const user = getUser(record.role, record.id)
  if (!user) throw new Error('Account not found.')

  user.password_hash = hashPassword(newPassword)
  if (record.role === ROLE.LIBRARIAN) user.must_change_password = false
  db.reset_tokens = db.reset_tokens.filter(
    (item) => !(item.role === record.role && item.id === record.id),
  )
  saveDB(db)
  return record.role
}

export function changePassword(role, id, currentPassword, newPassword) {
  const user = getUser(role, id)
  if (!user) throw new Error('Account not found.')
  if (!verifyPassword(currentPassword, user.password_hash)) {
    throw new Error('Your current password is incorrect.')
  }
  const issues = passwordIssues(newPassword)
  if (issues.length) throw new Error(`Password needs ${issues.join(', ')}.`)
  if (currentPassword === newPassword) {
    throw new Error('Choose a password different from your current one.')
  }
  user.password_hash = hashPassword(newPassword)
  if (role === ROLE.LIBRARIAN) user.must_change_password = false
  saveDB(getDB())
  return true
}

function assertLibrarianEmail(email, ignoreId = null) {
  const normalized = normalizeEmail(email)
  if (!isValidEmail(normalized)) throw new Error('Enter a valid email address.')
  const db = getDB()
  const clash =
    db.librarians.some(
      (item) =>
        item.librarian_email.toLowerCase() === normalized &&
        item.librarian_id !== Number(ignoreId),
    ) ||
    db.superlibrarians.some(
      (item) => item.superlibrarian_email.toLowerCase() === normalized,
    ) ||
    db.students.some((item) => item.student_email.toLowerCase() === normalized)
  if (clash) throw new Error('Another account already uses this email address.')
  return normalized
}

export function createLibrarian({ firstName, lastName, email, password }) {
  if (!firstName.trim() || !lastName.trim()) throw new Error('First and last name are required.')
  const normalized = assertLibrarianEmail(email)
  const issues = passwordIssues(password || '')
  if (issues.length) throw new Error(`Initial password needs ${issues.join(', ')}.`)

  const db = getDB()
  const librarian = {
    librarian_id: nextId(db.librarians, 'librarian_id'),
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    librarian_email: normalized,
    password_hash: hashPassword(password),
    must_change_password: true,
    created_at: todayISO(),
  }
  db.librarians.push(librarian)
  saveDB(db)
  return librarian
}

export function updateLibrarian(librarianId, { firstName, lastName, email, password }) {
  const db = getDB()
  const librarian = db.librarians.find((item) => item.librarian_id === Number(librarianId))
  if (!librarian) throw new Error('Librarian not found.')
  if (!firstName.trim() || !lastName.trim()) throw new Error('First and last name are required.')

  librarian.first_name = firstName.trim()
  librarian.last_name = lastName.trim()
  librarian.librarian_email = assertLibrarianEmail(email, librarian.librarian_id)

  if (password) {
    const issues = passwordIssues(password)
    if (issues.length) throw new Error(`New password needs ${issues.join(', ')}.`)
    librarian.password_hash = hashPassword(password)
    librarian.must_change_password = true
  }

  saveDB(db)
  return librarian
}

export function deleteLibrarian(librarianId) {
  const db = getDB()
  const librarian = db.librarians.find((item) => item.librarian_id === Number(librarianId))
  if (!librarian) throw new Error('Librarian not found.')

  db.librarians = db.librarians.filter(
    (item) => item.librarian_id !== librarian.librarian_id,
  )
  // Keep transaction history intact; the UI renders a "Former librarian" fallback.
  db.borrows = db.borrows.map((borrow) =>
    borrow.librarian_id === librarian.librarian_id
      ? {
          ...borrow,
          librarian_id: null,
          processed_by_role: borrow.processed_by_role || ROLE.LIBRARIAN,
        }
      : borrow,
  )
  saveDB(db)
  return true
}

export function updateOwnProfile(role, id, { firstName, lastName, contactNumber }) {
  const db = getDB()
  if (role === ROLE.STUDENT) {
    const student = db.students.find((item) => item.student_id === Number(id))
    if (!student) throw new Error('Student not found.')
    if (!firstName.trim() || !lastName.trim()) throw new Error('Names are required.')
    student.first_name = firstName.trim()
    student.last_name = lastName.trim()
    student.contact_number = normalizePhone(contactNumber)
    saveDB(db)
    return student
  }
  const user =
    role === ROLE.LIBRARIAN
      ? db.librarians.find((item) => item.librarian_id === Number(id))
      : db.superlibrarians.find((item) => item.superlibrarian_id === Number(id))
  if (!user) throw new Error('Account not found.')
  if (!firstName.trim() || !lastName.trim()) throw new Error('Names are required.')
  user.first_name = firstName.trim()
  user.last_name = lastName.trim()
  saveDB(db)
  return user
}
