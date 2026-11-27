import { useState } from 'react'
import {
  CircleDollarSign,
  HandCoins,
  ReceiptText,
  SearchX,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { getBorrowStatus } from '../../lib/rules'
import { issueFineRecord, payFineRecord, readFines, waiveFineRecord } from '../../lib/fineOperations'
import { BORROW_STATUS, FINE_REASONS, FINE_STATUS } from '../../lib/constants'
import { formatDate, peso } from '../../lib/format'
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

export default function ManageFines() {
  const { notify } = useToast()
  const [fineView, setFineView] = useState(readFines)
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [reason, setReason] = useState('all')
  const [issueOpen, setIssueOpen] = useState(false)
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    reason: 'Damaged',
    amount: '',
    borrowId: '',
  })
  const [formError, setFormError] = useState('')
  const [issuing, setIssuing] = useState(false)
  const [action, setAction] = useState(null)
  const [working, setWorking] = useState(false)
  const { fines, students, borrows, bookById } = fineView

  // Read operation
  const handleReadFines = () => {
    setFineView(readFines())
  }

  const totals = {
    outstanding: fines
      .filter((fine) => fine.status === FINE_STATUS.UNPAID)
      .reduce((sum, fine) => sum + Number(fine.amount), 0),
    paid: fines
      .filter((fine) => fine.status === FINE_STATUS.PAID)
      .reduce((sum, fine) => sum + Number(fine.amount), 0),
    waived: fines
      .filter((fine) => fine.status === FINE_STATUS.WAIVED)
      .reduce((sum, fine) => sum + Number(fine.amount), 0),
    openCount: fines.filter((fine) => fine.status === FINE_STATUS.UNPAID).length,
  }

  const counts = {
    all: fines.length,
    unpaid: fines.filter((fine) => fine.status === FINE_STATUS.UNPAID).length,
    paid: fines.filter((fine) => fine.status === FINE_STATUS.PAID).length,
    waived: fines.filter((fine) => fine.status === FINE_STATUS.WAIVED).length,
  }

  const visible = fines.filter((fine) => {
    const matchesTab = tab === 'all' || fine.status === tab
    const matchesReason = reason === 'all' || fine.reason === reason
    const haystack = `${fine.student?.first_name || ''} ${fine.student?.last_name || ''} ${
      fine.book?.title || ''
    } ${fine.reason}`.toLowerCase()
    return matchesTab && matchesReason && haystack.includes(query.trim().toLowerCase())
  })

  const studentBorrows = issueForm.studentId
    ? borrows
        .filter(
          (borrow) =>
            borrow.student_id === Number(issueForm.studentId) &&
            [BORROW_STATUS.ACTIVE, BORROW_STATUS.RETURNED].includes(getBorrowStatus(borrow)),
        )
        .sort(
          (a, b) => b.borrow_date.localeCompare(a.borrow_date) || b.borrow_id - a.borrow_id,
        )
    : []

  const openIssue = () => {
    setIssueForm({ studentId: '', reason: 'Damaged', amount: '', borrowId: '' })
    setFormError('')
    setIssueOpen(true)
  }
  // Issue operation
  const handleIssueFine = () => {
    setFormError('')
    setIssuing(true)
    try {
      issueFineRecord(issueForm)
      notify(`${peso(Number(issueForm.amount))} fine issued.`, 'success')
      setIssueOpen(false)
      handleReadFines()
    } catch (error) {
      setFormError(error.message)
    } finally {
      setIssuing(false)
    }
  }

  const settleFine = (operation, message, tone) => {
    if (!action) return
    setWorking(true)
    try {
      operation(action.fine.fine_id)
      notify(message, tone)
      setAction(null)
      handleReadFines()
    } catch (error) {
      notify(error.message, 'error')
      setAction(null)
    } finally {
      setWorking(false)
    }
  }

  // Pay operation
  const handlePayFine = () => {
    if (!action) return
    settleFine(payFineRecord, `${peso(action.fine.amount)} marked as paid.`, 'success')
  }

  // Waive operation
  const handleWaiveFine = () => {
    if (!action) return
    settleFine(waiveFineRecord, `${peso(action.fine.amount)} fine waived.`, 'info')
  }

  const handleAction = () => {
    if (action?.type === 'pay') handlePayFine()
    else if (action?.type === 'waive') handleWaiveFine()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fines"
        title="Fines & payments"
        description="Collect or waive charges, or record a manual fine for a damaged or lost copy. Overdue fines are created automatically when a late loan is returned."
        actions={
          <Button onClick={openIssue}>
            <ReceiptText size={16} />
            Issue a fine
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Outstanding', peso(totals.outstanding), Wallet, 'text-red-600'],
          ['Collected', peso(totals.paid), CircleDollarSign, 'text-forest-700'],
          ['Waived', peso(totals.waived), HandCoins, 'text-ink'],
          ['Open charges', totals.openCount, ShieldCheck, 'text-brass-700'],
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
        <div className="space-y-3 border-b border-cream-200 p-4 sm:p-5">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'unpaid', label: 'Unpaid', count: counts.unpaid },
              { key: 'paid', label: 'Paid', count: counts.paid },
              { key: 'waived', label: 'Waived', count: counts.waived },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by student or book…"
              aria-label="Search fines"
            />
            <Select
              aria-label="Filter by reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="h-[42px]"
            >
              <option value="all">All reasons</option>
              {FINE_REASONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {visible.length ? (
          <>
            <div className="hidden lg:block">
              <table className="table-base">
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Reason</th>
                    <th scope="col">Related book</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Issued</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((fine) => (
                    <tr key={fine.fine_id}>
                      <td>
                        <p className="font-medium text-ink-soft">
                          {fine.student
                            ? `${fine.student.first_name} ${fine.student.last_name}`
                            : 'Former student'}
                        </p>
                        <p className="text-xs text-ink-faint">{fine.student?.student_email || '—'}</p>
                      </td>
                      <td>
                        <Badge
                          tone={
                            fine.reason === 'Overdue'
                              ? 'warning'
                              : fine.reason === 'Lost'
                                ? 'danger'
                                : 'neutral'
                          }
                        >
                          {fine.reason}
                        </Badge>
                      </td>
                      <td className="max-w-[14rem] truncate text-xs">
                        {fine.book?.title || <span className="text-ink-faint">Manual charge</span>}
                      </td>
                      <td className="whitespace-nowrap font-semibold text-ink">{peso(fine.amount)}</td>
                      <td className="whitespace-nowrap text-xs">{formatDate(fine.issued_date)}</td>
                      <td>
                        <Badge
                          tone={
                            fine.status === 'paid'
                              ? 'success'
                              : fine.status === 'waived'
                                ? 'neutral'
                                : 'warning'
                          }
                        >
                          {fine.status}
                        </Badge>
                        {fine.paid_date ? (
                          <span className="mt-0.5 block text-[10px] text-ink-faint">
                            {formatDate(fine.paid_date, 'MMM d')}
                          </span>
                        ) : null}
                      </td>
                      <td>
                        {fine.status === FINE_STATUS.UNPAID ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => setAction({ fine, type: 'pay' })}
                            >
                              Mark paid
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAction({ fine, type: 'waive' })}
                            >
                              Waive
                            </Button>
                          </div>
                        ) : (
                          <p className="text-right text-xs text-ink-faint">Settled</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-cream-200 lg:hidden">
              {visible.map((fine) => (
                <li key={fine.fine_id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {fine.student
                          ? `${fine.student.first_name} ${fine.student.last_name}`
                          : 'Former student'}
                      </p>
                      <p className="truncate text-xs text-ink-faint">
                        {fine.book?.title || 'Manual charge'} · {fine.reason}
                      </p>
                    </div>
                    <Badge
                      tone={
                        fine.status === 'paid'
                          ? 'success'
                          : fine.status === 'waived'
                            ? 'neutral'
                            : 'warning'
                      }
                    >
                      {fine.status}
                    </Badge>
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-[11px] text-ink-faint">
                      Issued {formatDate(fine.issued_date, 'MMM d, yyyy')}
                    </p>
                    <p className="font-display text-xl font-semibold text-ink">{peso(fine.amount)}</p>
                  </div>

                  {fine.status === FINE_STATUS.UNPAID ? (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => setAction({ fine, type: 'pay' })}>
                        Mark paid
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAction({ fine, type: 'waive' })}
                      >
                        Waive
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            icon={SearchX}
            title={query || reason !== 'all' ? 'No fines match' : 'No fines on record'}
            description={
              query || reason !== 'all'
                ? 'Try another student, book or reason.'
                : 'Late returns and manual charges will appear here.'
            }
            action={
              query || reason !== 'all' ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('')
                    setReason('all')
                  }}
                >
                  Clear filters
                </Button>
              ) : null
            }
          />
        )}
      </div>

      <Modal
        open={issueOpen}
        onClose={() => !issuing && setIssueOpen(false)}
        title="Issue a fine"
        description="Use this for damage, loss or a correction. The amount is rounded to two decimals."
        footer={
          <>
            <Button variant="secondary" disabled={issuing} onClick={() => setIssueOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleIssueFine} loading={issuing}>
              Issue fine
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
            onChange={(event) =>
              setIssueForm((current) => ({
                ...current,
                studentId: event.target.value,
                borrowId: '',
              }))
            }
            required
          >
            <option value="">Choose a student…</option>
            {students.map((student) => (
              <option key={student.student_id} value={student.student_id}>
                {student.first_name} {student.last_name} · {student.student_email}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Reason"
              value={issueForm.reason}
              onChange={(event) =>
                setIssueForm((current) => ({ ...current, reason: event.target.value }))
              }
              required
            >
              {FINE_REASONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Input
              label="Amount (₱)"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={issueForm.amount}
              onChange={(event) =>
                setIssueForm((current) => ({ ...current, amount: event.target.value }))
              }
              required
            />
          </div>

          <Select
            label="Related loan (optional)"
            value={issueForm.borrowId}
            onChange={(event) =>
              setIssueForm((current) => ({ ...current, borrowId: event.target.value }))
            }
            hint="Link the charge to a specific checkout, or leave blank for a manual charge."
            disabled={!issueForm.studentId}
          >
            <option value="">No linked loan</option>
            {studentBorrows.map((borrow) => {
              const book = bookById.get(borrow.book_id)
              return (
                <option key={borrow.borrow_id} value={borrow.borrow_id}>
                  {book?.title || 'Removed title'} · {formatDate(borrow.borrow_date)} ·{' '}
                  {borrow.return_date ? 'returned' : 'active'}
                </option>
              )
            })}
          </Select>

          <div className="rounded-xl border border-cream-200 bg-cream-50 p-3 text-xs leading-relaxed text-ink-muted">
            Issuing a fine blocks the student from new loans until it is paid or waived.
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(action)}
        onClose={() => !working && setAction(null)}
        onConfirm={handleAction}
        loading={working}
        tone={action?.type === 'waive' ? 'brass' : 'primary'}
        title={
          action?.type === 'pay'
            ? 'Mark this fine as paid?'
            : action?.type === 'waive'
              ? 'Waive this fine?'
              : ''
        }
        description={
          action
            ? action.type === 'pay'
              ? `${peso(action.fine.amount)} will be recorded as collected today for ${
                  action.fine.student?.first_name || 'the student'
                }.`
              : `${peso(action.fine.amount)} will be forgiven. The charge stays visible as waived but no longer blocks borrowing.`
            : ''
        }
        confirmLabel={action?.type === 'pay' ? 'Mark paid' : 'Waive fine'}
      />
    </div>
  )
}
