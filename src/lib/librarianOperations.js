import { createLibrarian, deleteLibrarian, updateLibrarian } from './auth'
import { getDB } from './db'
import { isValidEmail, passwordIssues } from './validation'

export function readLibrarians() {
  const db = getDB()
  const loanCounts = new Map()
  db.borrows.forEach((borrow) => {
    if (borrow.librarian_id) {
      loanCounts.set(borrow.librarian_id, (loanCounts.get(borrow.librarian_id) || 0) + 1)
    }
  })
  return {
    librarians: db.librarians.slice().sort((a, b) =>
      `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
    ),
    loanCounts,
  }
}

function validateLibrarianForm(form, editing) {
  if (!form.firstName.trim() || !form.lastName.trim()) {
    throw new Error('First and last name are required.')
  }
  if (!isValidEmail(form.email)) {
    throw new Error('Enter a valid email address for the librarian.')
  }
  if (!editing || form.password) {
    const issues = passwordIssues(form.password)
    if (issues.length) throw new Error(`Password needs ${issues.join(', ')}.`)
    if (form.password !== form.confirmPassword) {
      throw new Error('The two passwords do not match.')
    }
  }
}

export function createLibrarianRecord(form) {
  validateLibrarianForm(form, false)
  return createLibrarian({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password,
  })
}

export function updateLibrarianRecord(librarianId, form) {
  validateLibrarianForm(form, true)
  return updateLibrarian(librarianId, {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password || undefined,
  })
}

export function deleteLibrarianRecord(librarianId) {
  return deleteLibrarian(librarianId)
}
