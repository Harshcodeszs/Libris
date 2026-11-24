import { useMemo, useState } from 'react'
import {
  BookMarked,
  BookOpen,
  ReceiptText,
  SearchX,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react'
import { getBook, getDB } from '../../lib/db'
import {
  activeBorrowsFor,
  borrowsForStudent,
  finesForStudent,
  getBorrowStatus,
  unpaidFineTotal,
} from '../../lib/rules'
import { BORROW_STATUS } from '../../lib/constants'
import { formatDate, fullName, peso } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import SearchInput from '../../components/ui/SearchInput'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'

const loanStatuses = [BORROW_STATUS.ACTIVE, BORROW_STATUS.RETURNED]

export default function ManageStudents() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const students = useMemo(() => {
    return getDB()
      .students.slice()
      .sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
      )
      .map((student) => ({
        ...student,
        activeCount: activeBorrowsFor(student.student_id).length,
        unpaid: unpaidFineTotal(student.student_id),
        totalBorrows: borrowsForStudent(student.student_id).filter((borrow) =>
          loanStatuses.includes(getBorrowStatus(borrow)),
        ).length,
      }))
  }, [])

  const filtered = students.filter((student) => {
    const haystack = `${student.first_name} ${student.last_name} ${student.student_email} ${student.student_id}`.toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  })

  const withFines = students.filter((student) => student.unpaid > 0).length
  const withLoans = students.filter((student) => student.activeCount > 0).length
  const totalUnpaid = students.reduce((sum, student) => sum + student.unpaid, 0)

  const detail = useMemo(() => {
    if (!selected) return null
    const borrows = borrowsForStudent(selected.student_id)
      .filter((borrow) => loanStatuses.includes(getBorrowStatus(borrow)))
      .slice(0, 8)
    const fines = finesForStudent(selected.student_id)
    return { borrows, fines }
  }, [selected])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Students"
        title="Student directory"
        description="Look up a borrower, check their current loans and see any outstanding fines. Records are read-only here."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Registered students', students.length, Users, 'text-ink'],
          ['With active loans', withLoans, BookMarked, 'text-forest-700'],
          ['With unpaid fines', withFines, ReceiptText, 'text-brass-700'],
          ['Total outstanding', peso(totalUnpaid), Wallet, 'text-red-600'],
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

      <div className="card p-4 sm:p-5">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name, email or student ID…"
          aria-label="Search students"
          className="max-w-xl"
        />
        <p className="mt-3 text-xs text-ink-faint" aria-live="polite">
          {filtered.length} of {students.length} students shown.
        </p>
      </div>

      {filtered.length ? (
        <>
          <div className="table-wrap hidden md:block">
            <table className="table-base">
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Active loans</th>
                  <th scope="col">Unpaid fines</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">
                    Record
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.student_id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar
                          firstName={student.first_name}
                          lastName={student.last_name}
                          role="student"
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{fullName(student)}</p>
                          <p className="truncate text-xs text-ink-faint">{student.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-xs">{student.contact_number}</td>
                    <td className="text-xs">
                      <span className="font-medium text-ink">
                        {student.activeCount} / {student.max_loan}
                      </span>
                    </td>
                    <td className="text-xs">
                      <span
                        className={
                          student.unpaid > 0 ? 'font-semibold text-red-600' : 'text-ink-faint'
                        }
                      >
                        {peso(student.unpaid)}
                      </span>
                    </td>
                    <td>
                      {student.unpaid > 0 ? (
                        <Badge tone="warning">Fines due</Badge>
                      ) : student.activeCount >= student.max_loan ? (
                        <Badge tone="neutral">At limit</Badge>
                      ) : (
                        <Badge tone="success">Clear</Badge>
                      )}
                    </td>
                    <td className="text-right">
                      <Button size="sm" variant="secondary" onClick={() => setSelected(student)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {filtered.map((student) => (
              <li key={student.student_id} className="card flex items-center gap-3 p-4">
                <Avatar
                  firstName={student.first_name}
                  lastName={student.last_name}
                  role="student"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{fullName(student)}</p>
                  <p className="truncate text-xs text-ink-faint">{student.student_email}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {student.activeCount} active ·{' '}
                    <span className={student.unpaid ? 'text-red-600' : ''}>
                      {peso(student.unpaid)} unpaid
                    </span>
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setSelected(student)}>
                  View
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="card">
          <EmptyState
            icon={SearchX}
            title="No students match"
            description="Try a different name, email or student ID."
            action={
              <Button variant="secondary" onClick={() => setQuery('')}>
                Clear search
              </Button>
            }
          />
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? fullName(selected) : 'Student record'}
        description={selected ? selected.student_email : ''}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected && detail ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-cream-200 bg-cream-50 p-4">
              <Avatar
                firstName={selected.first_name}
                lastName={selected.last_name}
                role="student"
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-semibold text-ink">{fullName(selected)}</p>
                <p className="text-sm text-ink-muted">{selected.student_email}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="success">Gmail verified</Badge>
                  <Badge tone="neutral" dot={false}>
                    STU-{String(selected.student_id).padStart(4, '0')}
                  </Badge>
                </div>
              </div>
              <div className="rounded-lg border border-cream-200 bg-white px-3 py-2 text-right">
                <p className="text-[10px] uppercase tracking-wider text-ink-faint">Loans</p>
                <p className="text-sm font-semibold text-ink">
                  {selected.activeCount} / {selected.max_loan}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-cream-200 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Contact
                </dt>
                <dd className="mt-1 text-ink-soft">{selected.contact_number}</dd>
              </div>
              <div className="rounded-xl border border-cream-200 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Unpaid fines
                </dt>
                <dd className={selected.unpaid ? 'mt-1 font-semibold text-red-600' : 'mt-1 text-ink-soft'}>
                  {peso(selected.unpaid)}
                </dd>
              </div>
              <div className="rounded-xl border border-cream-200 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                  Total borrows
                </dt>
                <dd className="mt-1 text-ink-soft">{selected.totalBorrows}</dd>
              </div>
            </dl>

            <section>
              <div className="mb-2 flex items-center gap-2">
                <BookOpen size={16} className="text-forest-700" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-ink">Recent borrowing</h3>
              </div>
              {detail.borrows.length ? (
                <ul className="divide-y divide-cream-200 rounded-xl border border-cream-200">
                  {detail.borrows.map((borrow) => {
                    const book = getBook(borrow.book_id)
                    return (
                      <li key={borrow.borrow_id} className="flex items-center gap-3 px-3.5 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">
                            {book?.title || 'Removed title'}
                          </p>
                          <p className="text-[11px] text-ink-faint">
                            {formatDate(borrow.borrow_date)} →{' '}
                            {borrow.return_date ? formatDate(borrow.return_date) : 'still out'}
                          </p>
                        </div>
                        <Badge tone={borrow.return_date ? 'neutral' : 'success'}>
                          {borrow.return_date ? 'Returned' : 'On loan'}
                        </Badge>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-4 text-sm text-ink-muted">
                  No borrowing history yet.
                </p>
              )}
            </section>

            <section>
              <div className="mb-2 flex items-center gap-2">
                <ReceiptText size={16} className="text-brass-700" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-ink">Fines</h3>
              </div>
              {detail.fines.length ? (
                <ul className="divide-y divide-cream-200 rounded-xl border border-cream-200">
                  {detail.fines.map((fine) => (
                    <li key={fine.fine_id} className="flex items-center gap-3 px-3.5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">
                          {fine.reason} · {peso(fine.amount)}
                        </p>
                        <p className="text-[11px] text-ink-faint">
                          Issued {formatDate(fine.issued_date)}
                          {fine.paid_date ? ` · paid ${formatDate(fine.paid_date)}` : ''}
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
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-cream-200 bg-cream-50 px-3.5 py-4 text-sm text-ink-muted">
                  No fines on record.
                </p>
              )}
            </section>

            <div className="flex items-start gap-2.5 rounded-xl border border-cream-200 bg-cream-50 p-3.5 text-xs leading-relaxed text-ink-muted">
              <UserRound size={15} className="mt-0.5 shrink-0 text-ink-faint" aria-hidden="true" />
              Students cannot be deleted from this screen. Contact the super librarian if an account
              needs to be reviewed.
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
