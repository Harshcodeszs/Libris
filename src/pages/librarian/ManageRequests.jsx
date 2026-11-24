import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Inbox,
  Library,
  SearchX,
  Users,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getDB } from '../../lib/db'
import { approveBorrow, getBorrowStatus, rejectBorrow } from '../../lib/rules'
import { BORROW_STATUS, LOAN_PERIOD_DAYS } from '../../lib/constants'
import { addDaysISO, formatDate, fullName, todayISO } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Tabs from '../../components/ui/Tabs'
import SearchInput from '../../components/ui/SearchInput'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import BookCover from '../../components/books/BookCover'

const reviewedStatuses = [BORROW_STATUS.REJECTED, BORROW_STATUS.CANCELLED]

function requestStatusLabel(borrow) {
  const status = getBorrowStatus(borrow)
  if (status === BORROW_STATUS.REJECTED) return { label: 'Declined', tone: 'danger' }
  if (status === BORROW_STATUS.CANCELLED) return { label: 'Cancelled', tone: 'neutral' }
  return { label: 'Pending', tone: 'warning' }
}

export default function ManageRequests() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState('pending')
  const [query, setQuery] = useState('')
  const [action, setAction] = useState(null)
  const [working, setWorking] = useState(false)

  const { pending, reviewed, availableCount } = useMemo(() => {
    const db = getDB()
    const studentById = new Map(db.students.map((item) => [item.student_id, item]))
    const bookById = new Map(db.books.map((item) => [item.book_id, item]))

    const decorate = (borrow) => ({
      ...borrow,
      student: studentById.get(borrow.student_id) || null,
      book: bookById.get(borrow.book_id) || null,
      requestState: requestStatusLabel(borrow),
    })

    return {
      pending: db.borrows
        .filter((borrow) => getBorrowStatus(borrow) === BORROW_STATUS.PENDING)
        .sort((a, b) => a.borrow_id - b.borrow_id)
        .map(decorate),
      reviewed: db.borrows
        .filter((borrow) => reviewedStatuses.includes(getBorrowStatus(borrow)))
        .sort((a, b) => b.borrow_id - a.borrow_id)
        .map(decorate),
      availableCount: db.books.filter((book) => book.status === 'Available').length,
    }
  }, [tick])

  const waitingStudents = new Set(pending.map((row) => row.student_id)).size
  const counts = { pending: pending.length, reviewed: reviewed.length }

  const visible = (tab === 'pending' ? pending : reviewed).filter((row) => {
    const haystack = `${row.student?.first_name || ''} ${row.student?.last_name || ''} ${
      row.student?.student_email || ''
    } ${row.book?.title || ''} ${row.book?.author || ''}`.toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  })

  const approve = (row) => setAction({ type: 'approve', row })
  const decline = (row) => setAction({ type: 'reject', row })

  const handleConfirm = () => {
    if (!action) return
    setWorking(true)
    try {
      if (action.type === 'approve') {
        const borrow = approveBorrow(action.row.borrow_id, {
          librarianId: user.id,
          actorRole: user.role,
        })
        notify(
          `Request approved. “${action.row.book?.title || 'The copy'}” is due ${formatDate(
            borrow.due_date,
          )}.`,
          'success',
        )
      } else {
        rejectBorrow(action.row.borrow_id, {
          librarianId: user.id,
          actorRole: user.role,
          reason: 'Declined by the library desk.',
        })
        notify('Request declined. The copy stays available for other students.', 'info')
      }
      setAction(null)
      setTick((value) => value + 1)
    } catch (error) {
      notify(error.message, 'error')
      setAction(null)
    } finally {
      setWorking(false)
    }
  }

  const dialog = action
    ? {
        title:
          action.type === 'approve'
            ? `Approve “${action.row.book?.title || 'this request'}”?`
            : `Decline “${action.row.book?.title || 'this request'}”?`,
        description:
          action.type === 'approve'
            ? `${
                action.row.student ? fullName(action.row.student) : 'The student'
              } will receive the copy until ${formatDate(
                addDaysISO(todayISO(), LOAN_PERIOD_DAYS),
              )}. The book will be marked Borrowed.`
            : `${
                action.row.student ? fullName(action.row.student) : 'The student'
              } will be notified that the request was declined. The copy stays Available.`,
        confirmLabel: action.type === 'approve' ? 'Approve request' : 'Decline request',
        tone: action.type === 'approve' ? 'primary' : 'danger',
      }
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Circulation"
        title="Borrow requests"
        description="Review what students have asked to borrow. A copy is only marked Borrowed after you approve the request."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Pending requests', pending.length, Inbox, 'text-brass-700'],
          ['Students waiting', waitingStudents, Users, 'text-ink'],
          ['Available copies', availableCount, Library, 'text-forest-700'],
          ['Reviewed', reviewed.length, XCircle, 'text-ink-muted'],
        ].map(([label, value, Icon, tone]) => (
          <div key={label} className="card flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-ink-muted">
              <Icon size={16} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                {label}
              </p>
              <p className={`font-display text-xl font-semibold ${tone}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-cream-200 p-4 sm:p-5">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'reviewed', label: 'Reviewed', count: counts.reviewed },
            ]}
          />
          <div className="mt-3">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by student or book…"
              aria-label="Search borrow requests"
            />
          </div>
        </div>

        {visible.length ? (
          <>
            <div className="hidden lg:block">
              <table className="table-base">
                <thead>
                  <tr>
                    <th scope="col">Book</th>
                    <th scope="col">Student</th>
                    <th scope="col">Requested</th>
                    <th scope="col">Copy</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => {
                    const canApprove = row.book?.status === 'Available'
                    return (
                      <tr key={row.borrow_id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <BookCover book={row.book} className="h-12 w-9" />
                            <div className="min-w-0">
                              <p className="max-w-[16rem] truncate font-medium text-ink">
                                {row.book?.title || 'Removed title'}
                              </p>
                              <p className="text-xs text-ink-faint">{row.book?.author || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              firstName={row.student?.first_name}
                              lastName={row.student?.last_name}
                              role="student"
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-ink-soft">
                                {row.student ? fullName(row.student) : 'Former student'}
                              </p>
                              <p className="truncate text-xs text-ink-faint">
                                {row.student?.student_email || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap text-xs">
                          {formatDate(row.request_date || row.borrow_date)}
                        </td>
                        <td>
                          <Badge
                            tone={
                              !row.book
                                ? 'neutral'
                                : row.book.status === 'Available'
                                  ? 'success'
                                  : 'warning'
                            }
                          >
                            {row.book?.status || 'Removed'}
                          </Badge>
                        </td>
                        <td>
                          <Badge tone={row.requestState.tone}>{row.requestState.label}</Badge>
                          {row.requestState.label === 'Declined' && row.rejection_reason ? (
                            <p className="mt-1 max-w-[14rem] text-[11px] leading-snug text-ink-faint">
                              {row.rejection_reason}
                            </p>
                          ) : null}
                        </td>
                        <td className="text-right">
                          {tab === 'pending' ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => decline(row)}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => approve(row)}
                                disabled={!canApprove}
                                title={
                                  canApprove
                                    ? undefined
                                    : 'This copy is not available right now.'
                                }
                              >
                                <CheckCircle2 size={14} />
                                Approve
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-ink-faint">
                              {formatDate(row.rejected_date || row.cancelled_date)}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-cream-200 lg:hidden">
              {visible.map((row) => {
                const canApprove = row.book?.status === 'Available'
                return (
                  <li key={row.borrow_id} className="flex gap-3 p-4">
                    <BookCover book={row.book} className="h-24 w-[68px]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">
                            {row.book?.title || 'Removed title'}
                          </p>
                          <p className="truncate text-xs text-ink-faint">
                            {row.student ? fullName(row.student) : 'Former student'}
                          </p>
                        </div>
                        <Badge tone={row.requestState.tone}>{row.requestState.label}</Badge>
                      </div>

                      <p className="mt-2 text-[11px] text-ink-muted">
                        Requested {formatDate(row.request_date || row.borrow_date, 'MMM d')} ·{' '}
                        {row.book?.status || 'Removed'}
                      </p>

                      {tab === 'pending' ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => approve(row)} disabled={!canApprove}>
                            <CheckCircle2 size={14} />
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => decline(row)}>
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2 text-[11px] text-ink-faint">
                          Reviewed {formatDate(row.rejected_date || row.cancelled_date)}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <EmptyState
            icon={
              query ? SearchX : tab === 'pending' ? Inbox : XCircle
            }
            title={
              query
                ? 'No requests match that search'
                : tab === 'pending'
                  ? 'No pending requests'
                  : 'Nothing reviewed yet'
            }
            description={
              query
                ? 'Try another student name or book title.'
                : tab === 'pending'
                  ? 'Student requests will appear here as soon as they are submitted.'
                  : 'Declined and cancelled requests will be listed here.'
            }
          />
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4 text-sm text-ink-muted">
        <Clock size={18} className="mt-0.5 shrink-0 text-forest-600" aria-hidden="true" />
        <p>
          Pending requests do not reserve a copy. If several students ask for the same book,
          approving one automatically declines the others so the shelf stays accurate.
        </p>
      </div>

      <ConfirmDialog
        open={Boolean(action)}
        onClose={() => !working && setAction(null)}
        onConfirm={handleConfirm}
        loading={working}
        tone={dialog?.tone}
        title={dialog?.title}
        description={dialog?.description}
        confirmLabel={dialog?.confirmLabel}
      />
    </div>
  )
}
