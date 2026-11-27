import { getDB } from './db'
import { issueFine, payFine, waiveFine } from './rules'

export function readFines() {
  const store = getDB()
  const studentById = new Map(store.students.map((item) => [item.student_id, item]))
  const borrowById = new Map(store.borrows.map((item) => [item.borrow_id, item]))
  const bookById = new Map(store.books.map((item) => [item.book_id, item]))

  return {
    students: store.students
      .slice()
      .sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)),
    borrows: store.borrows,
    bookById,
    fines: store.fines
      .slice()
      .sort((a, b) => b.issued_date.localeCompare(a.issued_date) || b.fine_id - a.fine_id)
      .map((fine) => {
        const borrow = fine.borrow_id ? borrowById.get(fine.borrow_id) : null
        return {
          ...fine,
          student: studentById.get(fine.student_id) || null,
          borrow: borrow || null,
          book: borrow ? bookById.get(borrow.book_id) || null : null,
        }
      }),
  }
}

export function issueFineRecord(form) {
  if (!form.studentId) throw new Error('Choose the student the fine belongs to.')
  const amount = Number(form.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Enter a fine amount greater than zero.')
  }
  return issueFine({
    studentId: Number(form.studentId),
    borrowId: form.borrowId ? Number(form.borrowId) : null,
    amount,
    reason: form.reason,
  })
}

export function payFineRecord(fineId) {
  return payFine(fineId)
}

export function waiveFineRecord(fineId) {
  return waiveFine(fineId)
}
