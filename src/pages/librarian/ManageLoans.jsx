import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Inbox,
  RotateCcw,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  getBorrowStatus,
  isOverdue,
  overdueDays,
  overdueFineEstimate,
} from '../../lib/rules'
import { issueDeskLoan, readStaffLoans, returnBorrowedBook } from '../../lib/borrowOperations'
import { BORROW_STATUS, LOAN_PERIOD_DAYS, ROLE } from '../../lib/constants'
import { addDaysISO, daysFromToday, formatDate, peso, todayISO } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import SearchInput from '../../components/ui/SearchInput'
import Tabs from '../../components/ui/Tabs'
import EmptyState from '../../components/ui/EmptyState'
import BookCover from '../../components/books/BookCover'

function statusFor(borrow) {
  const status = getBorrowStatus(borrow)
  if (status === BORROW_STATUS.RETURNED || borrow.return_date) {
    return { label: 'Returned', tone: 'neutral' }
  }
  if (status !== BORROW_STATUS.ACTIVE) return { label: 'Closed', tone: 'neutral' }
  if (isOverdue(borrow)) return { label: `Overdue ${overdueDays(borrow)}d`, tone: 'danger' }
  const days = daysFromToday(borrow.due_date)
  if (days === 0) return { label: 'Due today', tone: 'warning' }
  if (days <= 3) return { label: `Due in ${days}d`, tone: 'warning' }
  return { label: 'On loan', tone: 'success' }
}

function issuedBy(row) {
  if (row.librarian) return `${row.librarian.first_name} ${row.librarian.last_name}`
  if (row.processed_by_role === ROLE.SUPER) return 'Super librarian'
  if (row.processed_by_role === ROLE.LIBRARIAN) return 'Former librarian'
  return 'Self-service'
}

export default function ManageLoans() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState('active')
  const [query, setQuery] = useState('')
  const [issueOpen, setIssueOpen] = useState(false)
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    bookId: '',
    dueDate: addDaysISO(todayISO(), LOAN_PERIOD_DAYS),
  })
  const [formError, setFormError] = useState('')
  const [issuing, setIssuing] = useState(false)
  const [returnTarget, setReturnTarget] = useState(null)
  const [returning, setReturning] = useState(false)
  // Read Loans, counts, visible loans
  const { rows, students, availableBooks, pendingCount } = useMemo(() => {
    const loans = readStaffLoans()
    return {
      rows: loans.rows.map((row) => ({ ...row, loanState: statusFor(row) })),
      students: loans.students,
      availableBooks: loans.availableBooks,
      pendingCount: loans.pendingCount,
    }
  }, [tick])

  const counts = {
    all: rows.length,
    active: rows.filter((row) => getBorrowStatus(row) === BORROW_STATUS.ACTIVE).length,
    overdue: rows.filter(
      (row) => getBorrowStatus(row) === BORROW_STATUS.ACTIVE && isOverdue(row),
    ).length,
    returned: rows.filter((row) => getBorrowStatus(row) === BORROW_STATUS.RETURNED).length,
  }

  const visible = rows.filter((row) => {
    const status = getBorrowStatus(row)
    const matchesTab =
      tab === 'all'
        ? true
        : tab === 'active'
          ? status === BORROW_STATUS.ACTIVE
          : tab === 'overdue'
            ? status === BORROW_STATUS.ACTIVE && isOverdue(row)
            : status === BORROW_STATUS.RETURNED
    const haystack = `${row.student?.first_name || ''} ${row.student?.last_name || ''} ${
      row.book?.title || ''
    }`.toLowerCase()
    return matchesTab && haystack.includes(query.trim().toLowerCase())
  })

  const openIssue = () => {
    setIssueForm({
      studentId: '',
      bookId: '',
      dueDate: addDaysISO(todayISO(), LOAN_PERIOD_DAYS),
    })
    setFormError('')
    setIssueOpen(true)
  }

  // Create Issue desk loan operation
  const handleIssueDeskLoan = () => {
    setFormError('')
    setIssuing(true)
    try {
      const borrow = issueDeskLoan(issueForm, user)
      notify(`Loan recorded. Due ${formatDate(borrow.due_date)}.`, 'success')
      setIssueOpen(false)
      setTab('active')
      setTick((value) => value + 1)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIssuing(false)
    }
  }

  // Update Return loan operation
  const handleReturnLoan = () => {
    if (!returnTarget) return
    setReturning(true)
    try {
      const result = returnBorrowedBook(returnTarget.borrow_id)
      if (result.fine) {
        notify(
          `Returned ${result.lateDays} day(s) late. A ${peso(result.fine.amount)} overdue fine was issued.`,
          'info',
        )
      } else {
        notify('Book returned on time. The copy is available again.', 'success')
      }
      setReturnTarget(null)
      setTick((value) => value + 1)
    } catch (error) {
      notify(error.message, 'error')
      setReturnTarget(null)
    } finally {
      setReturning(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Circulation"
        title="Borrow & return"
        description="Approve student requests, issue a loan at the desk, or close one when the copy comes back. Overdue fines are created automatically on return."
        actions={
          <>
            <Button as={Link} to="/requests" variant="secondary">
              <Inbox size={16} />
              Requests{pendingCount ? ` (${pendingCount})` : ''}
            </Button>
            <Button onClick={openIssue} disabled={!availableBooks.length}>
              <CalendarPlus size={16} />
              Issue a loan
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Active loans', counts.active, BookOpen, 'text-forest-700'],
          ['Overdue', counts.overdue, Clock, 'text-red-600'],
          ['Returned', counts.returned, RotateCcw, 'text-brass-700'],
          ['Available copies', availableBooks.length, CheckCircle2, 'text-ink'],
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
              { key: 'active', label: 'On loan', count: counts.active },
              { key: 'overdue', label: 'Overdue', count: counts.overdue },
              { key: 'returned', label: 'Returned', count: counts.returned },
              { key: 'all', label: 'All', count: counts.all },
            ]}
          />
          <div className="mt-3">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by student or book…"
              aria-label="Search loans"
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
                    <th scope="col">Borrowed</th>
                    <th scope="col">Due</th>
                    <th scope="col">Issued by</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
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
                        <p className="font-medium text-ink-soft">
                          {row.student
                            ? `${row.student.first_name} ${row.student.last_name}`
                            : 'Former student'}
                        </p>
                        <p className="text-xs text-ink-faint">{row.student?.student_email || '—'}</p>
                      </td>
                      <td className="whitespace-nowrap text-xs">{formatDate(row.borrow_date)}</td>
                      <td className="whitespace-nowrap text-xs">
                        <span className={isOverdue(row) ? 'font-semibold text-red-600' : ''}>
                          {formatDate(row.due_date)}
                        </span>
                        {row.return_date ? (
                          <span className="block text-[11px] text-ink-faint">
                            returned {formatDate(row.return_date, 'MMM d')}
                          </span>
                        ) : null}
                      </td>
                      <td className="text-xs text-ink-muted">{issuedBy(row)}</td>
                      <td>
                        <Badge tone={row.loanState.tone}>{row.loanState.label}</Badge>
                      </td>
                      <td className="text-right">
                        {getBorrowStatus(row) === BORROW_STATUS.ACTIVE ? (
                          <Button size="sm" variant="secondary" onClick={() => setReturnTarget(row)}>
                            Return
                          </Button>
                        ) : (
                          <span className="text-xs text-ink-faint">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-cream-200 lg:hidden">
              {visible.map((row) => (
                <li key={row.borrow_id} className="flex gap-3 p-4">
                  <BookCover book={row.book} className="h-20 w-14" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {row.book?.title || 'Removed title'}
                        </p>
                        <p className="truncate text-xs text-ink-faint">
                          {row.student
                            ? `${row.student.first_name} ${row.student.last_name}`
                            : 'Former student'}
                        </p>
                      </div>
                      <Badge tone={row.loanState.tone}>{row.loanState.label}</Badge>
                    </div>
                    <p className="mt-2 text-[11px] text-ink-muted">
                      Borrowed {formatDate(row.borrow_date, 'MMM d')} · due{' '}
                      {formatDate(row.due_date, 'MMM d')}
                    </p>
                    {getBorrowStatus(row) === BORROW_STATUS.ACTIVE ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2"
                        onClick={() => setReturnTarget(row)}
                      >
                        <RotateCcw size={13} />
                        Process return
                      </Button>
                    ) : (
                      <p className="mt-2 text-[11px] text-ink-faint">
                        Returned {formatDate(row.return_date, 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            icon={BookOpen}
            title={
              query
                ? 'No loans match that search'
                : tab === 'overdue'
                  ? 'Nothing overdue'
                  : tab === 'returned'
                    ? 'No returns yet'
                    : 'No active loans'
            }
            description={
              query
                ? 'Try another student name or book title.'
                : 'Issue a loan from the button above to get started.'
            }
            action={
              !query && tab !== 'overdue' ? (
                <Button onClick={openIssue} disabled={!availableBooks.length}>
                  <CalendarPlus size={16} />
                  Issue a loan
                </Button>
              ) : null
            }
          />
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4 text-sm text-ink-muted">
        <UserRound size={18} className="mt-0.5 shrink-0 text-forest-600" aria-hidden="true" />
        <p>
          Student requests are reviewed on the Borrow requests page before a copy changes status.
          Loans issued directly at the desk appear here immediately. Fines are only finalised when
          you process the return — the estimated amount is based on {peso(5)} per late day.
        </p>
      </div>

      <Modal
        open={issueOpen}
        onClose={() => !issuing && setIssueOpen(false)}
        title="Issue a loan"
        description="The due date defaults to 14 days from today. You can shorten or extend it."
        footer={
          <>
            <Button variant="secondary" disabled={issuing} onClick={() => setIssueOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleIssueDeskLoan} loading={issuing} disabled={!availableBooks.length}>
              Record loan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          ) : null}

          <Select
            label="Student"
            value={issueForm.studentId}
            onChange={(event) => {
              setIssueForm((current) => ({ ...current, studentId: event.target.value }))
              if (formError) setFormError('')
            }}
            required
          >
            <option value="">Choose a student…</option>
            {students.map((student) => (
              <option key={student.student_id} value={student.student_id}>
                {student.first_name} {student.last_name} · {student.student_email}
              </option>
            ))}
          </Select>

          <Select
            label="Available copy"
            value={issueForm.bookId}
            onChange={(event) => {
              setIssueForm((current) => ({ ...current, bookId: event.target.value }))
              if (formError) setFormError('')
            }}
            hint={
              availableBooks.length
                ? `${availableBooks.length} copies are ready to lend.`
                : 'No copies are available right now.'
            }
            required
          >
            <option value="">Choose a book…</option>
            {availableBooks.map((book) => (
              <option key={book.book_id} value={book.book_id}>
                {book.title} — {book.author}
              </option>
            ))}
          </Select>

          <Input
            label="Due date"
            type="date"
            value={issueForm.dueDate}
            min={addDaysISO(todayISO(), 1)}
            onChange={(event) =>
              setIssueForm((current) => ({ ...current, dueDate: event.target.value }))
            }
            hint="Loans are normally 14 days."
            required
          />

          <div className="rounded-xl border border-cream-200 bg-cream-50 p-3 text-xs leading-relaxed text-ink-muted">
            Limits are enforced automatically: five active loans per student, no duplicate copies,
            and no borrowing while fines are unpaid.
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(returnTarget)}
        onClose={() => !returning && setReturnTarget(null)}
        onConfirm={handleReturnLoan}
        loading={returning}
        tone={returnTarget && isOverdue(returnTarget) ? 'danger' : 'primary'}
        title="Process this return?"
        description={
          returnTarget
            ? isOverdue(returnTarget)
              ? `${returnTarget.book?.title || 'This copy'} is ${overdueDays(
                  returnTarget,
                )} day(s) late. An overdue fine of ${peso(
                  overdueFineEstimate(returnTarget),
                )} will be issued to ${returnTarget.student?.first_name || 'the student'}.`
              : `${returnTarget.book?.title || 'This copy'} will be marked available and the loan closed for ${
                  returnTarget.student?.first_name || 'the student'
                }.`
            : ''
        }
        confirmLabel={returnTarget && isOverdue(returnTarget) ? 'Return with fine' : 'Confirm return'}
      />
    </div>
  )
}
