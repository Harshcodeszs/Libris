export function buildEmptyDatabase() {
  return {
    meta: {
      created_at: new Date().toISOString(),
      version: 2,
    },
    superlibrarians: [],
    librarians: [],
    students: [],
    books: [],
    borrows: [],
    fines: [],
    pending_registrations: [],
    reset_tokens: [],
    session: null,
  }
}
