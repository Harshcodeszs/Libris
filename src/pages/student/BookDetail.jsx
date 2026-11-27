import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookCheck,
  BookOpen,
  CalendarDays,
  Clock,
  Copy,
  Library,
  TriangleAlert,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getBook, getDB, getStudent } from '../../lib/db'
import {
  activeBorrowsFor,
  canBorrow,
  isOverdue,
  pendingBorrowForStudentBook,
  pendingBorrowsFor,
  requestBorrow,
} from '../../lib/rules'
import { BOOK_STATUS } from '../../lib/constants'
import { daysFromToday, formatDate, peso } from '../../lib/format'
import Button from '../../components/ui/Button'
import Badge, { statusTone } from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import BookCover from '../../components/books/BookCover'

export default function BookDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { notify } = useToast()
  const [tick, setTick] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const [borrowing, setBorrowing] = useState(false)
  const [result, setResult] = useState(null)

  const student = getStudent(user.id)
  const book = getBook(Number(id))
  const active = activeBorrowsFor(user.id)
  const currentLoan = book ? active.find((borrow) => borrow.book_id === book.book_id) : null
  const pending = book ? pendingBorrowForStudentBook(user.id, book.book_id) : null
  const pendingCount = pendingBorrowsFor(user.id).length
  const eligibility = book ? canBorrow(user.id, book.book_id) : { ok: false, reason: '' }

  const related = useMemo(() => {
    if (!book) return []
    return getDB()
      .books.filter(
        (item) =>
          item.book_id !== book.book_id &&
          item.category === book.category &&
          item.status === BOOK_STATUS.AVAILABLE,
      )
      .slice(0, 3)
  }, [book, tick])
  // Create Operation
  const handleRequest = () => {
    if (!book) return
    setBorrowing(true)
    try {
      const request = requestBorrow({ studentId: user.id, bookId: book.book_id })
      setResult(request)
      setConfirming(false)
      setTick((value) => value + 1)
      notify('Request sent. A librarian will review it shortly.', 'success')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setBorrowing(false)
    }
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-ink-faint">
            <Library size={24} aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Book not found</h1>
          <p className="mt-2 text-sm text-ink-muted">
            This title may have been removed from the catalog.
          </p>
          <Button as={Link} to="/catalog" className="mt-5">
            Back to the catalog
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted underline-offset-4 hover:text-forest-800 hover:underline"
      >
        <ArrowLeft size={15} />
        Back to catalog
      </Link>

      <div className="card overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[220px_1fr] lg:gap-8 lg:p-8">
          <div>
            <BookCover book={book} className="mx-auto aspect-[3/4] h-auto w-full max-w-[220px]" />
            <div className="mt-3 rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                Catalog ID
              </p>
              <p className="font-mono text-sm font-medium text-ink-soft">
                BK-{String(book.book_id).padStart(4, '0')}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="warning" dot={false}>
                {book.category}
              </Badge>
              <Badge tone={statusTone(book.status)}>{book.status}</Badge>
            </div>

            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              {book.title}
            </h1>
            <p className="mt-1.5 text-base text-ink-muted">by {book.author}</p>

            {result ? (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-brass-200 bg-brass-50 p-4">
                <Clock
                  size={20}
                  className="mt-0.5 shrink-0 text-brass-700"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-brass-900">Request submitted</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-brass-800/80">
                    The desk will review your request. The 14-day loan starts only after approval,
                    and you can track it under My loans.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Button as={Link} to="/loans" size="sm" variant="secondary">
                      Track my requests
                    </Button>
                    <Button as={Link} to="/catalog" size="sm" variant="ghost">
                      Keep browsing
                    </Button>
                  </div>
                </div>
              </div>
            ) : pending ? (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-brass-200 bg-brass-50 p-4">
                <Clock size={19} className="mt-0.5 shrink-0 text-brass-700" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-brass-900">Request pending</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-brass-800/80">
                    Sent {formatDate(pending.borrow_date)}. A librarian still needs to approve this
                    copy before it is marked borrowed.
                  </p>
                  <Button
                    as={Link}
                    to="/loans"
                    size="sm"
                    variant="secondary"
                    className="mt-2.5"
                  >
                    Track my requests
                  </Button>
                </div>
              </div>
            ) : currentLoan ? (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-brass-200 bg-brass-50 p-4">
                <Clock size={19} className="mt-0.5 shrink-0 text-brass-700" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-brass-900">
                    You already have this copy
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-brass-800/80">
                    Borrowed {formatDate(currentLoan.borrow_date)} · due{' '}
                    {formatDate(currentLoan.due_date)}
                    {isOverdue(currentLoan)
                      ? ` · overdue by ${Math.abs(daysFromToday(currentLoan.due_date))} days`
                      : ''}
                    .
                  </p>
                  <Button
                    as={Link}
                    to="/loans"
                    size="sm"
                    variant="secondary"
                    className="mt-2.5"
                  >
                    Open my loans
                  </Button>
                </div>
              </div>
            ) : !eligibility.ok && book.status === BOOK_STATUS.AVAILABLE && !pending ? (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                {eligibility.reason}
              </div>
            ) : null}

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-cream-200 pt-5 sm:grid-cols-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Category
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{book.category}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Status
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{book.status}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Loan period
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">14 days</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Overdue rate
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{peso(5)} / day</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => setConfirming(true)}
                disabled={
                  !eligibility.ok || Boolean(result) || Boolean(currentLoan) || Boolean(pending)
                }
                size="lg"
                className="sm:min-w-[170px]"
              >
                <BookCheck size={17} />
                {pending
                  ? 'Request pending'
                  : book.status !== BOOK_STATUS.AVAILABLE
                    ? 'Not available'
                    : eligibility.ok
                      ? 'Request this book'
                      : 'Request blocked'}
              </Button>
              <Button as={Link} to="/catalog" variant="secondary" size="lg">
                <Library size={17} />
                Back to catalog
              </Button>
            </div>

            {!eligibility.ok && book.status === BOOK_STATUS.AVAILABLE && !pending ? (
              <p className="mt-2 text-xs text-ink-faint">{eligibility.reason}</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 border-t border-cream-200 bg-cream-50 px-5 py-4 sm:grid-cols-3 sm:px-8">
          {[
            [Copy, 'One physical copy', 'Each catalog entry represents a single book.'],
            [
              CalendarDays,
              'Approval required',
              'The 14-day loan starts when a librarian approves your request.',
            ],
            [BookOpen, 'Return at the desk', 'A librarian closes the loan and checks for fines.'],
          ].map(([Icon, title, body]) => (
            <div key={title} className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-forest-700 ring-1 ring-inset ring-cream-300">
                <Icon size={15} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {related.length ? (
        <section>
          <h2 className="section-title">More in {book.category}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.book_id}
                to={`/catalog/${item.book_id}`}
                className="card card-hover flex cursor-pointer items-center gap-3 p-3"
              >
                <BookCover book={item} className="h-20 w-14" />
                <div className="min-w-0">
                  <p className="line-clamp-2 font-display text-sm font-semibold text-ink">
                    {item.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-faint">{item.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleRequest}
        loading={borrowing}
        tone="primary"
        title={`Request “${book.title}”?`}
        description={`This sends a borrow request to the library desk. You have ${active.length} of ${
          student?.max_loan || 5
        } active loans and ${pendingCount} pending ${
          pendingCount === 1 ? 'request' : 'requests'
        }. The 14-day loan starts only after approval.`}
        confirmLabel="Send request"
      />
    </div>
  )
}
