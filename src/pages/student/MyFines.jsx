import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Clock,
  HandCoins,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getBorrow, getBook } from '../../lib/db'
import {
  activeBorrowsFor,
  finesForStudent,
  isOverdue,
  overdueDays,
  overdueFineEstimate,
} from '../../lib/rules'
import { FINE_STATUS } from '../../lib/constants'
import { formatDate, peso } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'

export default function MyFines() {
  const { user } = useAuth()
  const [tab, setTab] = useState('all')

  const data = useMemo(() => {
    const fines = finesForStudent(user.id).map((fine) => {
      const borrow = fine.borrow_id ? getBorrow(fine.borrow_id) : null
      const book = borrow ? getBook(borrow.book_id) : null
      return { ...fine, borrow, book }
    })
    const active = activeBorrowsFor(user.id)
    const overdue = active.filter(isOverdue)

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
      accruing: overdue.reduce((sum, borrow) => sum + overdueFineEstimate(borrow), 0),
    }

    return { fines, overdue, totals }
  }, [user.id])

  const counts = {
    all: data.fines.length,
    unpaid: data.fines.filter((fine) => fine.status === FINE_STATUS.UNPAID).length,
    paid: data.fines.filter((fine) => fine.status === FINE_STATUS.PAID).length,
    waived: data.fines.filter((fine) => fine.status === FINE_STATUS.WAIVED).length,
  }

  const visible = data.fines.filter((fine) => tab === 'all' || fine.status === tab)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My fines"
        title="Fines and Payments"
        description="Fines are issued by library staff. Outstanding balances block new borrowing until settled at the desk."
        actions={
          <Button as={Link} to="/loans" variant="secondary">
            <Clock size={16} />
            Review loans
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-brass-700">
            <Wallet size={16} aria-hidden="true" />
            <p className="text-[10px] font-semibold uppercase tracking-wider">Outstanding</p>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {peso(data.totals.outstanding)}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            {counts.unpaid} unpaid {counts.unpaid === 1 ? 'fine' : 'fines'}
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-forest-700">
            <ShieldCheck size={16} aria-hidden="true" />
            <p className="text-[10px] font-semibold uppercase tracking-wider">Paid</p>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {peso(data.totals.paid)}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            {counts.paid} settled {counts.paid === 1 ? 'payment' : 'payments'}
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-ink-faint">
            <HandCoins size={16} aria-hidden="true" />
            <p className="text-[10px] font-semibold uppercase tracking-wider">Waived</p>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {peso(data.totals.waived)}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            {counts.waived} waived {counts.waived === 1 ? 'charge' : 'charges'}
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={16} aria-hidden="true" />
            <p className="text-[10px] font-semibold uppercase tracking-wider">Accruing now</p>
          </div>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {peso(data.totals.accruing)}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            {data.overdue.length} overdue {data.overdue.length === 1 ? 'loan' : 'loans'}
          </p>
        </div>
      </div>

      {data.overdue.length ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 ring-1 ring-inset ring-red-200">
              <AlertTriangle size={17} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-900">Overdue charges are still growing</p>
              <p className="mt-0.5 text-xs leading-relaxed text-red-700/80">
                These loans are not final fines yet. Return the books to stop the ₱5-per-day charge.
              </p>
              <ul className="mt-3 space-y-1.5">
                {data.overdue.map((borrow) => {
                  const book = getBook(borrow.book_id)
                  return (
                    <li
                      key={borrow.borrow_id}
                      className="flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-medium text-red-900">
                        {book?.title || 'Removed title'}
                      </span>
                      <span className="text-red-700">
                        {overdueDays(borrow)} days late · est. {peso(overdueFineEstimate(borrow))}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <div className="card overflow-hidden">
        <Tabs
          className="px-4 pt-1"
          value={tab}
          onChange={setTab}
          items={[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'unpaid', label: 'Unpaid', count: counts.unpaid },
            { key: 'paid', label: 'Paid', count: counts.paid },
            { key: 'waived', label: 'Waived', count: counts.waived },
          ]}
        />

        {visible.length ? (
          <>
            <div className="hidden md:block">
              <table className="table-base">
                <thead>
                  <tr>
                    <th scope="col">Reason</th>
                    <th scope="col">Related book</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Issued</th>
                    <th scope="col">Status</th>
                    <th scope="col">Paid on</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((fine) => (
                    <tr key={fine.fine_id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100 text-ink-muted">
                            <ReceiptText size={14} aria-hidden="true" />
                          </span>
                          <span className="font-medium text-ink">{fine.reason}</span>
                        </div>
                      </td>
                      <td>
                        {fine.book ? (
                          <Link
                            to={`/catalog/${fine.book.book_id}`}
                            className="max-w-[18rem] truncate text-ink-soft underline-offset-4 hover:text-forest-800 hover:underline"
                          >
                            {fine.book.title}
                          </Link>
                        ) : (
                          <span className="text-ink-faint">Library charge</span>
                        )}
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
                      </td>
                      <td className="whitespace-nowrap text-xs">
                        {fine.paid_date ? formatDate(fine.paid_date) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-cream-200 md:hidden">
              {visible.map((fine) => (
                <li key={fine.fine_id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-ink-muted">
                        <ReceiptText size={15} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{fine.reason}</p>
                        <p className="text-[11px] text-ink-faint">
                          Issued {formatDate(fine.issued_date, 'MMM d, yyyy')}
                        </p>
                      </div>
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

                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-ink-faint">Book</p>
                      <p className="truncate text-xs text-ink-soft">
                        {fine.book?.title || 'Library charge'}
                      </p>
                    </div>
                    <p className="font-display text-xl font-semibold text-ink">{peso(fine.amount)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <EmptyState
            icon={ReceiptText}
            title={tab === 'unpaid' ? 'No unpaid fines' : 'Nothing here'}
            description={
              tab === 'unpaid'
                ? 'Your account is clear. Return books on time to keep it that way.'
                : `You have no ${tab === 'all' ? '' : `${tab} `}fines on record.`
            }
          />
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4 text-sm text-ink-muted">
        <HandCoins size={18} className="mt-0.5 shrink-0 text-brass-600" aria-hidden="true" />
        <p>
          Payments and waivers are handled by library staff. Once a librarian marks a fine as paid,
          the balance here updates automatically and borrowing is unblocked.
        </p>
      </div>
    </div>
  )
}
