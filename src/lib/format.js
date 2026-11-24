import { addDays, format, parseISO, isValid, differenceInCalendarDays } from 'date-fns'

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function addDaysISO(iso, days) {
  return format(addDays(parseISO(iso), days), 'yyyy-MM-dd')
}

export function formatDate(iso, pattern = 'MMM d, yyyy') {
  if (!iso) return '—'
  const date = typeof iso === 'string' ? parseISO(iso) : iso
  if (!isValid(date)) return '—'
  return format(date, pattern)
}

export function formatDateTime(iso) {
  return formatDate(iso, 'MMM d, yyyy · h:mm a')
}

export function daysBetween(fromISO, toISO) {
  if (!fromISO || !toISO) return 0
  return differenceInCalendarDays(parseISO(toISO), parseISO(fromISO))
}

export function daysFromToday(iso) {
  return daysBetween(todayISO(), iso)
}

export function peso(amount) {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function initials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?'
}

export function fullName(person) {
  if (!person) return 'Unknown'
  return [person.first_name, person.last_name].filter(Boolean).join(' ')
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}

export function truncate(text, length = 80) {
  if (!text) return ''
  return text.length > length ? `${text.slice(0, length - 1)}…` : text
}

export function normalizeEmail(email = '') {
  return email.trim().toLowerCase()
}

export function userEmail(user, role) {
  if (!user) return ''
  if (role === 'student') return user.student_email
  if (role === 'librarian') return user.librarian_email
  return user.superlibrarian_email
}
