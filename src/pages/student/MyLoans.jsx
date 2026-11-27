import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookMarked, BookOpen, CalendarClock, Clock, Inbox, ReceiptText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getBook, getDB } from '../../lib/db'
import {
  borrowsForStudent,
  cancelBorrowRequest,
  getBorrowStatus,
  isOverdue,
  overdueDays,
  overdueFineEstimate,
} from '../../lib/rules'
import { BORROW_STATUS } from '../../lib/constants'
import { daysFromToday, formatDate, peso } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import BookCover from '../../components/books/BookCover'

function stateFor(borrow) {
  const status = getBorrowStatus(borrow)
  if (status === BORROW_STATUS.PENDING) {
    return { key: 'pending', label: 'Awaiting approval', tone: 'warning' }
  }
  if (status === BORROW_STATUS.REJECTED) {
    return { key: 'rejected', label: 'Declined', tone: 'danger' }
  }
  if (status === BORROW_STATUS.CANCELLED) {
    return { key: 'cancelled', label: 'Cancelled', tone: 'neutral' }
  }
  if (status === BORROW_STATUS.RETURNED || borrow.return_date) {
    return { key: 'returned', label: 'Returned', tone: 'neutral' }
  }
  if (isOverdue(borrow)) return { key: 'overdue', label: 'Overdue', tone: 'danger' }
  const days = daysFromToday(borrow.due_date)
  if (days === 0) return { key: 'active', label: 'Due today', tone: 'warning' }
  if (days <= 3) return { key: 'active', label: `Due in ${days}d`, tone: 'warning' }
  return { key: 'active', label: 'On loan', tone: 'success' }
}

export default function MyLoans() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState('all')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const { loans, pending } = useMemo(() => {
    const fines = getDB().fines
    const rows = borrowsForStudent(user.id).map((borrow) => ({
      ...borrow,
      book: getBook(borrow.book_id),
      fine: fines.find((fine) => fine.borrow_id === borrow.borrow_id) || null,
      state: stateFor(borrow),
    }))
    const loanStatuses = [BORROW_STATUS.ACTIVE, BORROW_STATUS.RETURNED]
    return {
      loans: rows.filter((row) => loanStatuses.includes(getBorrowStatus(row))),
      pending: rows.filter((row) => getBorrowStatus(row) === BORROW_STATUS.PENDING),
    }
  }, [user.id, tick])

  const counts = {
    all: loans.length,
    active: loans.filter((row) => getBorrowStatus(row) === BORROW_STATUS.ACTIVE).length,
    overdue: loans.filter(
      (row) => getBorrowStatus(row) === BORROW_STATUS.ACTIVE && isOverdue(row),
    ).length,
    returned: loans.filter((row) => getBorrowStatus(row) === BORROW_STATUS.RETURNED).length,
  }

  const visible = loans.filter((row) => {
    const status = getBorrowStatus(row)
    if (tab === 'all') return true
    if (tab === 'active') return status === BORROW_STATUS.ACTIVE
    if (tab === 'overdue') return status === BORROW_STATUS.ACTIVE && isOverdue(row)
    return status === BORROW_STATUS.RETURNED
  })

  const handleCancel = () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      cancelBorrowRequest(cancelTarget.borrow_id, user.id)
      notify('Borrow request cancelled.', 'info')
      setCancelTarget(null)
      setTick((value) => value + 1)
    } catch (error) {
      notify(error.message, 'error')
      setCancelTarget(null)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My loans"
        title="Borrowing History"
        description="Track requests waiting for approval, current due dates, and every loan you have returned."
        actions={
          <Button as={Link} to="/catalog">
            <BookOpen size={16} />
            Request another book
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['On loan', counts.active, BookMarked, 'forest'],
          ['Pending requests', pending.length, Inbox, 'brass'],
          ['Overdue', counts.overdue, Clock, counts.overdue ? 'red' : 'cream'],
          ['Returned', counts.returned, CalendarClock, 'brass'],
        ].map(([label, value, Icon, tone]) => (
          <div key={label} className="card flex items-center gap-4 p-4">
            <span
              className={
                tone === 'red'
                  ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-100'
                  : tone === 'brass'
                    ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-brass-50 text-brass-700 ring-1 ring-inset ring-brass-100'
                    : 'flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700 ring-1 ring-inset ring-forest-100'
              }
            >
              <Icon size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                {label}
              </p>
              <p className="font-display text-2xl font-semibold text-ink">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {pending.length ? (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-cream-200 px-5 py-4">
            <div>
              <h2 className="section-title">Pending requests</h2>
              <p className="mt-0.5 text-xs text-ink-faint">
                Waiting for a librarian to approve these copies.
              </p>
            </div>
            <Badge tone="warning">{pending.length} waiting</Badge>
          </div>

          <ul className="divide-y divide-cream-200">
            {pending.map((row) => (
              <li key={row.borrow_id} className="flex gap-3 p-4 sm:gap-4">
                <BookCover book={row.book} className="h-24 w-[68px]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      {row.book ? (
                        <Link
                          to={`/catalog/${row.book.book_id}`}
                          className="block truncate font-medium text-ink underline-offset-4 hover:text-forest-800 hover:underline"
                        >
                          {row.book.title}
                        </Link>
                      ) : (
                        <span className="text-ink-muted">Removed title</span>
                      )}
                      <p className="truncate text-xs text-ink-faint">{row.book?.author || '—'}</p>
                    </div>
                    <Badge tone="warning">Awaiting approval</Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-ink-muted">
                      Requested {formatDate(row.request_date || row.borrow_date)} · the 14-day loan
                      starts after approval.
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCancelTarget(row)}
                    >
                      Cancel request
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="card overflow-hidden">
        <Tabs
          className="px-4 pt-1"
          value={tab}
          onChange={setTab}
          items={[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'active', label: 'On loan', count: counts.active },
            { key: 'overdue', label: 'Overdue', count: counts.overdue },
            { key: 'returned', label: 'Returned', count: counts.returned },
          ]}
        />

        {visible.length ? (
          <>
            <div className="hidden md:block">
              <table className="table-base">
                <thead>
                  <tr>
                    <th scope="col">Book</th>
                    <th scope="col">Borrowed</th>
                    <th scope="col">Due</th>
                    <th scope="col">Status</th>
                    <th scope="col">Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row.borrow_id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <BookCover book={row.book} className="h-14 w-10" />
                          <div className="min-w-0">
                            {row.book ? (
                              <Link
                                to={`/catalog/${row.book.book_id}`}
                                className="block max-w-[22rem] truncate font-medium text-ink underline-offset-4 hover:text-forest-800 hover:underline"
                              >
                                {row.book.title}
                              </Link>
                            ) : (
                              <span className="text-ink-muted">Removed title</span>
                            )}
                            <p className="truncate text-xs text-ink-faint">
                              {row.book?.author || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-xs">
                        {formatDate(row.borrow_date, 'MMM d, yyyy')}
                      </td>
                      <td className="whitespace-nowrap text-xs">
                        <span className={isOverdue(row) ? 'font-semibold text-red-600' : ''}>
                          {formatDate(row.due_date, 'MMM d, yyyy')}
                        </span>
                        {row.return_date ? (
                          <span className="block text-[11px] text-ink-faint">
                            Returned {formatDate(row.return_date, 'MMM d')}
                          </span>
                        ) : null}
                      </td>
                      <td>
                        <Badge tone={row.state.tone}>{row.state.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap text-xs">
                        {row.fine ? (
                          <div>
                            <span className="font-medium text-ink">{peso(row.fine.amount)}</span>
                            <Badge
                              tone={
                                row.fine.status === 'paid'
                                  ? 'success'
                                  : row.fine.status === 'waived'
                                    ? 'neutral'
                                    : 'warning'
                              }
                              className="ml-1.5"
                            >
                              {row.fine.status}
                            </Badge>
                          </div>
                        ) : isOverdue(row) ? (
                          <span className="text-red-600">
                            {peso(overdueFineEstimate(row))}
                            <span className="ml-1 text-[10px] text-red-500">est.</span>
                          </span>
                        ) : (
                          <span className="text-ink-faint">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-cream-200 md:hidden">
              {visible.map((row) => (
                <li key={row.borrow_id} className="flex gap-3 p-4">
                  <BookCover book={row.book} className="h-24 w-[68px]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {row.book ? (
                          <Link
                            to={`/catalog/${row.book.book_id}`}
                            className="block truncate font-medium text-ink underline-offset-4 hover:underline"
                          >
                            {row.book.title}
                          </Link>
                        ) : (
                          <span className="text-ink-muted">Removed title</span>
                        )}
                        <p className="truncate text-xs text-ink-faint">{row.book?.author || '—'}</p>
                      </div>
                      <Badge tone={row.state.tone}>{row.state.label}</Badge>
                    </div>

                    <dl className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-ink-muted">
                      <div>
                        <dt className="text-ink-faint">Borrowed</dt>
                        <dd>{formatDate(row.borrow_date, 'MMM d')}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-faint">Due</dt>
                        <dd className={isOverdue(row) ? 'font-semibold text-red-600' : ''}>
                          {formatDate(row.due_date, 'MMM d')}
                        </dd>
                      </div>
                    </dl>

                    {row.fine ? (
                      <p className="mt-2 text-[11px]">
                        Fine <span className="font-semibold text-ink">{peso(row.fine.amount)}</span>{' '}
                        <span className="capitalize text-ink-faint">({row.fine.status})</span>
                      </p>
                    ) : isOverdue(row) ? (
                      <p className="mt-2 text-[11px] text-red-600">
                        Estimated fine {peso(overdueFineEstimate(row))} ·{' '}
                        {overdueDays(row)} days late
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            icon={tab === 'returned' ? BookOpen : BookMarked}
            title={
              tab === 'all'
                ? 'No loans yet'
                : tab === 'overdue'
                  ? 'Nothing overdue'
                  : tab === 'returned'
                    ? 'No returned loans'
                    : 'No active loans'
            }
            description={
              tab === 'overdue'
                ? 'You are all caught up. Keep returning books on time.'
                : 'Request a title from the catalog and it will appear here once a librarian approves it.'
            }
            action={
              tab !== 'overdue' ? (
                <Button as={Link} to="/catalog" size="sm">
                  Browse the catalog
                </Button>
              ) : null
            }
          />
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4 text-sm text-ink-muted">
        <ReceiptText size={18} className="mt-0.5 shrink-0 text-brass-600" aria-hidden="true" />
        <p>
          Estimated fines on overdue loans are not final until a librarian records the return. The
          final amount appears on your{' '}
          <Link
            to="/fines"
            className="font-medium text-forest-700 underline-offset-4 hover:underline"
          >
            fines page
          </Link>
          .
        </p>
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => !cancelling && setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={cancelling}
        tone="danger"
        title="Cancel this request?"
        description={
          cancelTarget
            ? `“${cancelTarget.book?.title || 'This title'}” will be removed from the desk queue. You can request it again later.`
            : ''
        }
        confirmLabel="Cancel request"
      />
    </div>
  )
}
