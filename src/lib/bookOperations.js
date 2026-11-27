import { getDB } from './db'
import { createBook, deleteBook, getBorrowStatus, updateBook } from './rules'
import { BORROW_STATUS } from './constants'

export function readBooks() {
  const db = getDB()
  return {
    books: db.books.slice().sort((a, b) => a.title.localeCompare(b.title)),
    activeByBook: new Map(
      db.borrows
        .filter((borrow) => getBorrowStatus(borrow) === BORROW_STATUS.ACTIVE)
        .map((borrow) => [borrow.book_id, borrow]),
    ),
    studentById: new Map(db.students.map((student) => [student.student_id, student])),
  }
}

function validateBookForm(form) {
  if (!form.title.trim() || !form.author.trim()) {
    throw new Error('Title and author are required.')
  }
}

export function createBookRecord(form) {
  validateBookForm(form)
  return createBook(form)
}

export function updateBookRecord(bookId, form) {
  validateBookForm(form)
  return updateBook(bookId, form)
}

export function deleteBookRecord(bookId) {
  return deleteBook(bookId)
}
