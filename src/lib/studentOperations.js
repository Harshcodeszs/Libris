import { allAccountEmails, getDB, getStudent } from './db'
import { ROLE, BORROW_STATUS } from './constants'
import {
  confirmRegistration,
  registerStudent,
  resendRegistration,
  updateOwnProfile,
} from './auth'
import {
  activeBorrowsFor,
  borrowsForStudent,
  finesForStudent,
  getBorrowStatus,
  unpaidFineTotal,
} from './rules'

export function readRegistrationEmails() {
  const emails = allAccountEmails()
  getDB().pending_registrations.forEach((item) => emails.add(item.email))
  return emails
}

export function beginStudentRegistration(values) {
  return registerStudent(values)
}

export function resendStudentRegistration(email, previousToken) {
  return resendRegistration(email, previousToken)
}

export function confirmStudentRegistration(token) {
  return confirmRegistration(token)
}

export function readStudentDirectory() {
  return getDB()
    .students.slice()
    .sort((a, b) =>
      `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
    )
    .map((student) => ({
      ...student,
      activeCount: activeBorrowsFor(student.student_id).length,
      unpaid: unpaidFineTotal(student.student_id),
      totalBorrows: borrowsForStudent(student.student_id).filter((borrow) =>
        [BORROW_STATUS.ACTIVE, BORROW_STATUS.RETURNED].includes(getBorrowStatus(borrow)),
      ).length,
    }))
}

export function readStudentRecord(studentId) {
  if (!studentId) return null
  return {
    borrows: borrowsForStudent(studentId)
      .filter((borrow) =>
        [BORROW_STATUS.ACTIVE, BORROW_STATUS.RETURNED].includes(getBorrowStatus(borrow)),
      )
      .slice(0, 8),
    fines: finesForStudent(studentId),
  }
}

export function readStudentProfile(studentId) {
  const student = getStudent(studentId)
  return {
    student,
    openLoans: student ? activeBorrowsFor(studentId).length : 0,
    outstanding: student ? unpaidFineTotal(studentId) : 0,
  }
}

export function updateStudentAccount(studentId, values) {
  return updateOwnProfile(ROLE.STUDENT, studentId, values)
}
