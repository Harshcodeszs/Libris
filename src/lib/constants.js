export const BRAND = {
  name: 'Libris',
  tagline: 'Library Borrowing System',
  library: 'Libris College Library',
}

export const STORAGE_KEY = 'libris.db.v1'

export const ROLE = {
  STUDENT: 'student',
  LIBRARIAN: 'librarian',
  SUPER: 'superlibrarian',
}

export const ROLE_LABEL = {
  student: 'Student',
  librarian: 'Librarian',
  superlibrarian: 'Super Librarian',
}

export const LOAN_PERIOD_DAYS = 14
export const FINE_PER_DAY = 5
export const DEFAULT_MAX_LOAN = 5
// Flip to false if you would rather let students with unpaid fines borrow anyway.
export const BLOCK_BORROW_ON_UNPAID_FINES = true

export const BOOK_STATUS = {
  AVAILABLE: 'Available',
  BORROWED: 'Borrowed',
  LOST: 'Lost',
  DAMAGED: 'Damaged',
}

export const BOOK_STATUSES = [
  BOOK_STATUS.AVAILABLE,
  BOOK_STATUS.BORROWED,
  BOOK_STATUS.LOST,
  BOOK_STATUS.DAMAGED,
]

export const BORROW_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  RETURNED: 'returned',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
}

export const FINE_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  WAIVED: 'waived',
}

export const FINE_REASONS = ['Overdue', 'Damaged', 'Lost']

export const CATEGORIES = [
  'Fiction',
  'Literature',
  'History',
  'Science',
  'Technology',
  'Psychology',
  'Philosophy',
  'Self-Help',
  'Reference',
]

