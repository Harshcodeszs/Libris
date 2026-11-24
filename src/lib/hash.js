// Local password hashing. This is NOT production-grade security —
// it exists so the browser database never stores raw passwords.
function randomSalt() {
  return Math.random().toString(36).slice(2, 10)
}

function digest(password, salt) {
  let hash = 5381
  const input = `${salt}:${password}`
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

export function hashPassword(password, salt = randomSalt()) {
  return `libris$${salt}$${digest(password, salt)}`
}

export function verifyPassword(password, storedHash) {
  if (!storedHash) return false
  const parts = storedHash.split('$')
  if (parts.length !== 3) return false
  return digest(password, parts[1]) === parts[2]
}

export function createToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`
}
