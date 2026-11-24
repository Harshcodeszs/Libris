import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  BookOpen,
  Library,
  SearchX,
  SlidersHorizontal,
  TriangleAlert,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getDB, getStudent } from '../../lib/db'
import {
  activeBorrowsFor,
  canBorrow,
  pendingBorrowsFor,
  requestBorrow,
} from '../../lib/rules'
import { BOOK_STATUS, BOOK_STATUSES, CATEGORIES } from '../../lib/constants'
import { peso } from '../../lib/format'
import Button from '../../components/ui/Button'
import Badge, { statusTone } from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import SearchInput from '../../components/ui/SearchInput'
import Select from '../../components/ui/Select'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import BookCover from '../../components/books/BookCover'

export default function Catalog() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [tick, setTick] = useState(0)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [borrowing, setBorrowing] = useState(false)

  const student = getStudent(user.id)
  const activeCount = activeBorrowsFor(user.id).length

  const pendingIds = useMemo(
    () => new Set(pendingBorrowsFor(user.id).map((borrow) => borrow.book_id)),
    [user.id, tick],
  )
  const pendingCount = pendingIds.size

  const books = useMemo(() => {
    return getDB()
      .books.slice()
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [tick])

  const eligibility = useMemo(() => {
    const map = new Map()
    books.forEach((book) => {
      map.set(book.book_id, canBorrow(user.id, book.book_id))
    })
    return map
  }, [books, user.id, tick])

  const availableCount = books.filter((book) => book.status === BOOK_STATUS.AVAILABLE).length

  const filtered = books.filter((book) => {
    const haystack = `${book.title} ${book.author} ${book.category}`.toLowerCase()
    const matchesQuery = haystack.includes(query.trim().toLowerCase())
    const matchesCategory = category === 'all' || book.category === category
    const matchesStatus = status === 'all' || book.status === status
    return matchesQuery && matchesCategory && matchesStatus
  })

  const hasFilters = query.trim() || category !== 'all' || status !== 'all'

  const handleRequest = () => {
    if (!selected) return
    setBorrowing(true)
    try {
      requestBorrow({ studentId: user.id, bookId: selected.book_id })
      notify(`Request sent for “${selected.title}”. A librarian will review it.`, 'success')
      setSelected(null)
      setTick((value) => value + 1)
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setBorrowing(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Browse the collection"
        description={`${books.length} titles on the shelves, ${availableCount} available right now. Each listing is a single physical copy.`}
        actions={
          <div className="rounded-xl border border-cream-300 bg-white px-3.5 py-2 text-xs text-ink-muted shadow-sm">
            <span className="font-semibold text-ink">{activeCount}</span> of{' '}
            <span className="font-semibold text-ink">{student?.max_loan || 5}</span> loans used
            {pendingCount ? (
              <span className="block text-[10px] text-brass-700">
                {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}
              </span>
            ) : null}
          </div>
        }
      />

      {student && activeCount + pendingCount >= student.max_loan ? (
        <div className="flex items-start gap-3 rounded-2xl border border-brass-200 bg-brass-50 px-4 py-3.5">
          <TriangleAlert size={17} className="mt-0.5 shrink-0 text-brass-700" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-brass-900">
            You have reached your {student.max_loan}-book limit with active loans and pending
            requests. Return a loan or wait for a request to be reviewed before requesting another
            title.
          </p>
        </div>
      ) : null}

      <div className="card p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by title, author or category…"
            aria-label="Search the catalog"
          />

          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-[42px]"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Filter by availability"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-[42px]"
          >
            <option value="all">Any status</option>
            {BOOK_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <Button
            variant="ghost"
            onClick={() => {
              setQuery('')
              setCategory('all')
              setStatus('all')
            }}
            disabled={!hasFilters}
            className="h-[42px]"
          >
            <SlidersHorizontal size={15} />
            Clear
          </Button>
        </div>

        <p className="mt-3 text-xs text-ink-faint" aria-live="polite">
          Showing <span className="font-semibold text-ink-soft">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'title' : 'titles'}
          {hasFilters ? ' matching your filters' : ''}.
        </p>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((book) => {
            const check = eligibility.get(book.book_id) || { ok: false, reason: 'Unavailable.' }
            const unavailable = book.status !== BOOK_STATUS.AVAILABLE
            const isPending = pendingIds.has(book.book_id)
            return (
              <article key={book.book_id} className="card card-hover flex gap-3.5 p-3.5">
                <Link
                  to={`/catalog/${book.book_id}`}
                  className="cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2"
                  aria-label={`Open ${book.title}`}
                >
                  <BookCover book={book} className="h-36 w-[98px]" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brass-700">
                      {book.category}
                    </span>
                    <Badge tone={statusTone(book.status)}>{book.status}</Badge>
                  </div>

                  <Link
                    to={`/catalog/${book.book_id}`}
                    className="mt-1.5 line-clamp-2 cursor-pointer font-display text-base font-semibold leading-snug text-ink underline-offset-4 hover:text-forest-800 hover:underline"
                  >
                    {book.title}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-ink-faint">{book.author}</p>

                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <Link
                      to={`/catalog/${book.book_id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted underline-offset-4 hover:text-forest-800 hover:underline"
                    >
                      Details
                      <ArrowUpRight size={12} />
                    </Link>

                    <Button
                      size="sm"
                      onClick={() => setSelected(book)}
                      disabled={!check.ok || isPending}
                      title={
                        isPending
                          ? 'Waiting for a librarian to approve your request.'
                          : check.ok
                            ? undefined
                            : check.reason
                      }
                    >
                      {isPending
                        ? 'Pending'
                        : unavailable
                          ? 'Unavailable'
                          : check.ok
                            ? 'Request'
                            : 'Blocked'}
                    </Button>
                  </div>

                  {isPending ? (
                    <p className="mt-1.5 text-[10px] leading-snug text-brass-700">
                      Request pending librarian approval.
                    </p>
                  ) : !check.ok && !unavailable ? (
                    <p className="mt-1.5 text-[10px] leading-snug text-ink-faint">{check.reason}</p>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={hasFilters ? SearchX : Library}
            title={hasFilters ? 'No titles match those filters' : 'The catalog is empty'}
            description={
              hasFilters
                ? 'Try a different search term, category or status.'
                : 'A librarian has not added any books yet. Check back soon.'
            }
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('')
                    setCategory('all')
                    setStatus('all')
                  }}
                >
                  Reset filters
                </Button>
              ) : (
                <Button as={Link} to="/student">
                  Back to dashboard
                </Button>
              )
            }
          />
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4 text-sm text-ink-muted">
        <BookOpen size={18} className="mt-0.5 shrink-0 text-forest-600" aria-hidden="true" />
        <p>
          Requests are reviewed by a librarian. Once approved, the copy is marked borrowed and the
          14-day due date begins. Pick the physical copy up at the desk.
        </p>
      </div>

      <ConfirmDialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onConfirm={handleRequest}
        loading={borrowing}
        title={selected ? `Request “${selected.title}”?` : 'Request this book?'}
        description={
          selected
            ? `This sends a borrow request to the library desk. You currently have ${activeCount} of ${
                student?.max_loan || 5
              } active loans and ${pendingCount} pending ${
                pendingCount === 1 ? 'request' : 'requests'
              }.`
            : ''
        }
        confirmLabel="Send request"
        tone="primary"
      />

      {student && activeCount === 0 ? (
        <p className="text-center text-xs text-ink-faint">
          Starting fresh — your first loan is free of fines as long as it returns on time. Overdue
          rates are {peso(5)} per day.
        </p>
      ) : null}
    </div>
  )
}
