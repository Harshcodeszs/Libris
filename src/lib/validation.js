import { normalizeEmail } from './format'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(normalizeEmail(email))
}

export function isGmail(email) {
  const normalized = normalizeEmail(email)
  return isValidEmail(normalized) && normalized.endsWith('@gmail.com')
}

export function normalizePhone(value = '') {
  const digits = value.replace(/[^\d]/g, '')
  if (digits.startsWith('639') && digits.length === 12) return `0${digits.slice(2)}`
  if (digits.startsWith('9') && digits.length === 10) return `0${digits}`
  return digits
}

export function isValidPhone(value) {
  return /^09\d{9}$/.test(normalizePhone(value))
}

export function passwordIssues(password = '') {
  const issues = []
  if (password.length < 8) issues.push('at least 8 characters')
  if (!/[A-Za-z]/.test(password)) issues.push('one letter')
  if (!/\d/.test(password)) issues.push('one number')
  return issues
}

export function passwordStrength(password = '') {
  if (!password) return { score: 0, label: 'Empty', tone: 'muted' }
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 2) return { score, label: 'Weak', tone: 'danger' }
  if (score === 3) return { score, label: 'Fair', tone: 'warning' }
  if (score === 4) return { score, label: 'Good', tone: 'success' }
  return { score, label: 'Strong', tone: 'success' }
}

/**
 * Validates the student sign-up form.
 * @param {object} values - form fields
 * @param {Set<string>} takenEmails - lowercased emails already in use
 */
export function validateRegistration(values, takenEmails = new Set()) {
  const errors = {}
  const firstName = values.firstName.trim()
  const lastName = values.lastName.trim()
  const email = normalizeEmail(values.email)
  const phone = normalizePhone(values.contactNumber)
  const { password, confirmPassword } = values

  if (!firstName) errors.firstName = 'First name is required.'
  else if (firstName.length < 2) errors.firstName = 'Please enter your full first name.'

  if (!lastName) errors.lastName = 'Last name is required.'
  else if (lastName.length < 2) errors.lastName = 'Please enter your full last name.'

  if (!email) errors.email = 'Email is required.'
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.'
  else if (!isGmail(email)) errors.email = 'Only @gmail.com addresses can be used to register.'
  else if (takenEmails.has(email)) errors.email = 'An account with this email already exists.'

  if (!phone) errors.contactNumber = 'Contact number is required.'
  else if (!isValidPhone(phone)) errors.contactNumber = 'Use an 11-digit mobile number like 09171234567.'

  const issues = passwordIssues(password)
  if (!password) errors.password = 'Password is required.'
  else if (issues.length) errors.password = `Password needs ${issues.join(', ')}.`

  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.'
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'

  if (!values.agreedToTerms) errors.agreedToTerms = 'Please accept the library policy to continue.'

  return { valid: Object.keys(errors).length === 0, errors }
}
