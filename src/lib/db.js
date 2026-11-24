import { normalizeEmail } from './format'
import { ROLE, STORAGE_KEY } from './constants'
import { buildEmptyDatabase } from './emptyDatabase'

let cache = null

function persist(db) {
  cache = db
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (error) {
    console.warn('Unable to save local database', error)
  }
  return db
}

export function getDB() {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      cache = JSON.parse(raw)
      // Guard against a partially written store.
      if (!cache.students || !cache.books || !cache.borrows) throw new Error('Invalid store')
      return cache
    }
  } catch (error) {
    console.warn('Discarding invalid local database', error)
  }
  return persist(buildEmptyDatabase())
}

export function saveDB(db) {
  return persist(db)
}

export function resetDB() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn(error)
  }
  cache = buildEmptyDatabase()
  return persist(cache)
}

export function nextId(collection, key) {
  return collection.reduce((max, item) => Math.max(max, Number(item[key]) || 0), 0) + 1
}

export function allAccountEmails() {
  const db = getDB()
  return new Set([
    ...db.students.map((item) => item.student_email.toLowerCase()),
    ...db.librarians.map((item) => item.librarian_email.toLowerCase()),
    ...db.superlibrarians.map((item) => item.superlibrarian_email.toLowerCase()),
  ])
}

export function findUserByEmail(email) {
  const normalized = normalizeEmail(email)
  if (!normalized) return null
  const db = getDB()

  const student = db.students.find((item) => item.student_email.toLowerCase() === normalized)
  if (student) return { role: ROLE.STUDENT, user: student }

  const librarian = db.librarians.find((item) => item.librarian_email.toLowerCase() === normalized)
  if (librarian) return { role: ROLE.LIBRARIAN, user: librarian }

  const superUser = db.superlibrarians.find(
    (item) => item.superlibrarian_email.toLowerCase() === normalized,
  )
  if (superUser) return { role: ROLE.SUPER, user: superUser }

  return null
}

export function studentEmailTaken(email) {
  const normalized = normalizeEmail(email)
  const db = getDB()
  return (
    db.students.some((item) => item.student_email.toLowerCase() === normalized) ||
    db.pending_registrations.some(
      (pending) => pending.email.toLowerCase() === normalized && pending.expires_at > Date.now(),
    )
  )
}

export function getStudent(studentId) {
  return getDB().students.find((item) => item.student_id === Number(studentId)) || null
}

export function getBook(bookId) {
  return getDB().books.find((item) => item.book_id === Number(bookId)) || null
}

export function getLibrarian(librarianId) {
  return getDB().librarians.find((item) => item.librarian_id === Number(librarianId)) || null
}

export function getSuperlibrarian(id) {
  return getDB().superlibrarians.find((item) => item.superlibrarian_id === Number(id)) || null
}

export function getUser(role, id) {
  if (role === ROLE.STUDENT) return getStudent(id)
  if (role === ROLE.LIBRARIAN) return getLibrarian(id)
  if (role === ROLE.SUPER) return getSuperlibrarian(id)
  return null
}

export function emailFor(user, role) {
  if (!user) return ''
  if (role === ROLE.STUDENT) return user.student_email
  if (role === ROLE.LIBRARIAN) return user.librarian_email
  return user.superlibrarian_email
}

export function getBorrow(borrowId) {
  return getDB().borrows.find((item) => item.borrow_id === Number(borrowId)) || null
}

export function getFine(fineId) {
  return getDB().fines.find((item) => item.fine_id === Number(fineId)) || null
}
