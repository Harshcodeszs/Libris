import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  Inbox,
  Library,
  ReceiptText,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getBook, getDB, getStudent } from '../../lib/db'
import {
  activeBorrowsFor,
  isOverdue,
  overdueDays,
  overdueFineEstimate,
  pendingBorrowsFor,
  unpaidFineTotal,
  unpaidFinesFor,
} from '../../lib/rules'
import { daysFromToday, formatDate, peso } from '../../lib/format'
import { BOOK_STATUS } from '../../lib/constants'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import Badge, { statusTone } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import BookCover from '../../components/books/BookCover'

function borrowStatus(borrow) {
  if (borrow.return_date) return { label: 'Returned', tone: 'neutral' }
  if (isOverdue(borrow)) return { label: `Overdue ${overdueDays(borrow)}d`, tone: 'danger' }
  const days = daysFromToday(borrow.due_date)
  if (days === 0) return { label: 'Due today', tone: 'warning' }
  if (days <= 3) return { label: `Due in ${days}d`, tone: 'warning' }
  return { label: `Due in ${days}d`, tone: 'success' }
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const student = getStudent(user.id)

  const data = useMemo(() => {
    const active = activeBorrowsFor(user.id)
    const overdue = active.filter(isOverdue)
    const dueSoon = active.filter(
      (borrow) => !isOverdue(borrow) && daysFromToday(borrow.due_date) <= 3,
    )
    const unpaid = unpaidFinesFor(user.id)
    const unpaidTotal = unpaidFineTotal(user.id)
    const activeWithBooks = active.map((borrow) => {
      const book = getBook(borrow.book_id)
      return { ...borrow, book, status: borrowStatus(borrow) }
    })
    const pending = pendingBorrowsFor(user.id)
    const busyBookIds = new Set(
      [...active, ...pending].map((borrow) => borrow.book_id),
    )
    const suggestions = getDB()
      .books.filter(
        (book) => book.status === BOOK_STATUS.AVAILABLE && !busyBookIds.has(book.book_id),
      )
      .slice(0, 3)
    return {
      active,
      overdue,
      dueSoon,
      unpaid,
      unpaidTotal,
      activeWithBooks,
      pending,
      suggestions,
    }
  }, [user.id])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const maxLoan = student?.max_loan || 5
  const usage = Math.round((data.active.length / maxLoan) * 100)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={formatDate(new Date(), 'EEEE, MMMM d')}
        title={`${greeting}, ${user.firstName}`}
        description="Here is what is on your shelf, what is due, and anything waiting at the desk."
        actions={
          <Button as={Link} to="/catalog">
            <Library size={16} />
            Browse the catalog
          </Button>
        }
      />

      {data.overdue.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 ring-1 ring-inset ring-red-200">
              <TriangleAlert size={17} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-red-800">
                {data.overdue.length} overdue {data.overdue.length === 1 ? 'loan' : 'loans'}
              </p>
              <p className="text-xs leading-relaxed text-red-700/80">
                Overdue fines grow at ₱5 per day. Return the book at the desk to stop the charge.
              </p>
            </div>
          </div>
          <Button as={Link} to="/loans" variant="secondary" size="sm">
            Review loans
          </Button>
        </div>
      ) : null}

      {data.pending.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-brass-200 bg-brass-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brass-700 ring-1 ring-inset ring-brass-200">
              <Inbox size={17} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-brass-900">
                {data.pending.length} borrow{' '}
                {data.pending.length === 1 ? 'request is' : 'requests are'} waiting for approval
              </p>
              <p className="text-xs leading-relaxed text-brass-800/80">
                The copy is not marked borrowed until a librarian approves it.
              </p>
            </div>
          </div>
          <Button as={Link} to="/loans" variant="secondary" size="sm">
            View requests
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active loans"
          value={`${data.active.length} / ${maxLoan}`}
          hint={
            data.pending.length
              ? `${data.pending.length} ${data.pending.length === 1 ? 'request' : 'requests'} awaiting approval`
              : data.active.length >= maxLoan
                ? 'At your borrowing limit'
                : 'Books currently with you'
          }
          icon={BookMarked}
        />
        <StatCard
          label="Due soon"
          value={data.dueSoon.length}
          hint="Due within the next three days"
          icon={CalendarClock}
          tone="brass"
        />
        <StatCard
          label="Overdue"
          value={data.overdue.length}
          hint="Accruing ₱5 per day"
          icon={Clock}
          tone={data.overdue.length ? 'red' : 'cream'}
        />
        <StatCard
          label="Unpaid fines"
          value={peso(data.unpaidTotal)}
          hint={`${data.unpaid.length} open ${data.unpaid.length === 1 ? 'fine' : 'fines'}`}
          icon={ReceiptText}
          tone={data.unpaidTotal > 0 ? 'red' : 'forest'}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-cream-200 px-5 py-4">
            <div>
              <h2 className="section-title">Your current loans</h2>
              <p className="mt-0.5 text-xs text-ink-faint">Due dates are 14 days from checkout.</p>
            </div>
            <Link
              to="/loans"
              className="inline-flex items-center gap-1 text-sm font-medium text-forest-700 underline-offset-4 hover:underline"
            >
              See all
              <ArrowRight size={14} />
            </Link>
          </div>

          {data.activeWithBooks.length ? (
            <ul className="divide-y divide-cream-200">
              {data.activeWithBooks.slice(0, 4).map((borrow) => (
                <li key={borrow.borrow_id} className="flex gap-3 px-5 py-4 sm:gap-4">
                  <BookCover book={borrow.book} className="h-24 w-[68px]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/catalog/${borrow.book_id}`}
                          className="block truncate font-medium text-ink underline-offset-4 hover:text-forest-800 hover:underline"
                        >
                          {borrow.book?.title || 'Removed title'}
                        </Link>
                        <p className="truncate text-xs text-ink-faint">
                          {borrow.book?.author || 'Unknown author'}
                        </p>
                      </div>
                      <Badge tone={borrow.status.tone}>{borrow.status.label}</Badge>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-ink-faint">
                        <span>Borrowed {formatDate(borrow.borrow_date, 'MMM d')}</span>
                        <span>Due {formatDate(borrow.due_date, 'MMM d')}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-200">
                        <div
                          className={
                            isOverdue(borrow)
                              ? 'h-full rounded-full bg-red-500'
                              : daysFromToday(borrow.due_date) <= 3
                                ? 'h-full rounded-full bg-brass-500'
                                : 'h-full rounded-full bg-forest-600'
                          }
                          style={{
                            width: `${
                              isOverdue(borrow)
                                ? 100
                                : Math.min(
                                    100,
                                    Math.max(
                                      6,
                                      ((14 - Math.max(0, daysFromToday(borrow.due_date))) / 14) *
                                        100,
                                    ),
                                  )
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {isOverdue(borrow) ? (
                      <p className="mt-2 text-[11px] font-medium text-red-600">
                        Estimated fine: {peso(overdueFineEstimate(borrow))} so far
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No books on loan"
              description="Your shelf is clear. Browse the catalog and borrow your next read."
              action={
                <Button as={Link} to="/catalog" size="sm">
                  Find a book
                </Button>
              }
            />
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-cream-200 px-5 py-4">
            <div>
              <h2 className="section-title">Fresh from the catalog</h2>
              <p className="mt-0.5 text-xs text-ink-faint">Available to borrow now.</p>
            </div>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1 text-xs font-medium text-forest-700 underline-offset-4 hover:underline"
            >
              See all
              <ArrowRight size={13} />
            </Link>
          </div>

          {data.suggestions.length ? (
            <ul className="divide-y divide-cream-200">
              {data.suggestions.map((book) => (
                <li key={book.book_id}>
                  <Link
                    to={`/catalog/${book.book_id}`}
                    className="flex cursor-pointer gap-3 p-4 transition-colors hover:bg-cream-50"
                  >
                    <BookCover book={book} className="h-24 w-[68px]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-brass-700">
                          {book.category}
                        </span>
                        <Badge tone={statusTone(book.status)}>{book.status}</Badge>
                      </div>
                      <h3 className="mt-1 line-clamp-2 font-display text-sm font-semibold leading-snug text-ink">
                        {book.title}
                      </h3>
                      <p className="mt-0.5 truncate text-xs text-ink-faint">{book.author}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Library}
              title="Everything is checked out"
              description="No copies are free right now. Check back after a return."
            />
          )}
        </section>
      </div>
    </div>
  )
}
