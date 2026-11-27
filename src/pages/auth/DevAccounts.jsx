import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createDevAccounts, resetDevPasswords } from '../../lib/devAccounts'
import { getDB } from '../../lib/db'
import { ROLE_LABEL } from '../../lib/constants'

export default function DevAccounts() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [counts, setCounts] = useState(() => {
    const db = getDB()
    return [db.students.length, db.librarians.length, db.superlibrarians.length]
  })
  const allPresent = counts.every(Boolean)

  const handleCreate = () => {
    setError('')
    try {
      setResult(createDevAccounts())
      const db = getDB()
      setCounts([db.students.length, db.librarians.length, db.superlibrarians.length])
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReset = () => {
    setError('')
    try {
      setResult({ created: resetDevPasswords(), skipped: [] })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-lift">
        <div className="border-b border-cream-200 bg-cream-50 px-6 py-7 sm:px-8">
          <h1 className="font-display text-3xl font-semibold text-ink">Local test accounts</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Create a Student, Librarian and Superlibrarian for testing in this local browser.
            No Neon connection or email is needed. Creating accounts leaves existing data untouched.
          </p>
        </div>
        <div className="space-y-5 px-6 py-7 sm:px-8">
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          {!result && (
            <button
              type="button"
              disabled={allPresent}
              onClick={handleCreate}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-forest-800 px-5 text-sm font-medium text-cream-50 shadow-sm transition-colors hover:bg-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
            >
              Create test accounts
            </button>
          )}

          {result?.created.length > 0 && (
            <section aria-label="New test credentials" className="space-y-3">
              <p className="text-sm text-ink-muted">
                Copy these passwords now. They are shown only here and cannot be retrieved later.
              </p>
              <div className="divide-y divide-cream-200 rounded-xl border border-cream-300">
                {result.created.map(({ role, email, password }) => (
                  <div key={role} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[8rem_1fr]">
                    <strong className="text-ink">{ROLE_LABEL[role]}</strong>
                    <div className="min-w-0 space-y-1">
                      <p className="break-all text-ink-muted">{email}</p>
                      <p className="break-all font-mono text-ink">{password}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setResult(null)} className="text-sm font-medium text-forest-700 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600">
                Hide passwords
              </button>
            </section>
          )}
          {result?.skipped.length > 0 && (
            <p role="status" className="text-sm leading-relaxed text-ink-muted">
              Already present (left unchanged): {result.skipped.map((role) => ROLE_LABEL[role]).join(', ')}.
              Existing passwords cannot be displayed.
            </p>
          )}
          {allPresent && !result && (
            <div className="space-y-3">
              <p role="status" className="text-sm text-ink-muted">
                All three roles already have accounts. Creation will not change them.
              </p>
              <p className="text-sm text-ink-muted">
                Lost the test credentials? Reset test passwords replaces the old passwords
                for the three test emails only. Your accounts, books and loans stay intact.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-cream-300 bg-white px-5 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2"
              >
                Reset test passwords
              </button>
            </div>
          )}
          <p className="text-sm text-ink-muted">
            Ready? <Link to="/login" className="font-medium text-forest-700 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600">Go to sign in</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
