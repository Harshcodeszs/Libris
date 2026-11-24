import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BookMarked,
  CalendarDays,
  KeyRound,
  MailCheck,
  RotateCcw,
  Save,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateOwnProfile } from '../lib/auth'
import { getDB, getStudent, resetDB } from '../lib/db'
import { activeBorrowsFor, unpaidFineTotal } from '../lib/rules'
import { getLibrarianWorkload } from '../lib/stats'
import { isValidPhone, normalizePhone } from '../lib/validation'
import { ROLE, ROLE_LABEL } from '../lib/constants'
import { formatDate, peso } from '../lib/format'
import PageHeader from '../components/ui/PageHeader'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function Profile() {
  const { user, refresh, signOut } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [contactNumber, setContactNumber] = useState(user.contactNumber || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const student = user.role === ROLE.STUDENT ? getStudent(user.id) : null
  const db = getDB()
  const workload = user.role === ROLE.LIBRARIAN ? getLibrarianWorkload() : []
  const myLoans =
    user.role === ROLE.LIBRARIAN
      ? workload.find((item) => item.librarian.librarian_id === user.id)?.loans || 0
      : 0

  const handleSave = (event) => {
    event.preventDefault()
    setError('')
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.')
      return
    }
    if (user.role === ROLE.STUDENT && !isValidPhone(contactNumber)) {
      setError('Use an 11-digit mobile number like 09171234567.')
      return
    }

    setSaving(true)
    try {
      updateOwnProfile(user.role, user.id, {
        firstName,
        lastName,
        contactNumber: normalizePhone(contactNumber),
      })
      const next = refresh()
      if (next) {
        setFirstName(next.firstName)
        setLastName(next.lastName)
        setContactNumber(next.contactNumber || '')
      }
      notify('Profile updated.', 'success')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    resetDB()
    signOut()
    notify('Local data cleared. Sign in again to continue.', 'info')
    navigate('/login', { replace: true })
  }

  const openLoans = student ? activeBorrowsFor(user.id).length : 0
  const outstanding = student ? unpaidFineTotal(user.id) : 0

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile & settings"
        description="Keep your name and contact details current. Your email is the sign-in identity and cannot be edited here."
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.4fr]">
        <div className="space-y-6">
          <section className="card overflow-hidden">
            <div className="h-24 bg-forest-950 paper-grain" aria-hidden="true" />
            <div className="px-5 pb-5">
              <div className="-mt-9 flex items-end justify-between">
                <Avatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  role={user.role}
                  size="lg"
                  className="ring-4 ring-white"
                />
                <Badge tone={user.role === ROLE.SUPER ? 'forest' : 'success'}>
                  {ROLE_LABEL[user.role]}
                </Badge>
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold text-ink">{user.name}</h2>
              <p className="mt-0.5 text-sm text-ink-muted">{user.email}</p>

              <div className="mt-4 space-y-2.5 border-t border-cream-200 pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-ink-muted">
                    <MailCheck size={15} className="text-ink-faint" />
                    Email status
                  </span>
                  {user.isVerified ? (
                    <Badge tone="success">Verified</Badge>
                  ) : (
                    <Badge tone="warning">Unverified</Badge>
                  )}
                </div>

                {student ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-ink-muted">
                        <BookMarked size={15} className="text-ink-faint" />
                        Active loans
                      </span>
                      <span className="font-medium text-ink">
                        {openLoans} / {student.max_loan}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-ink-muted">
                        <CalendarDays size={15} className="text-ink-faint" />
                        Student ID
                      </span>
                      <span className="font-mono text-xs text-ink-soft">
                        STU-{String(student.student_id).padStart(4, '0')}
                      </span>
                    </div>
                    {student.created_at ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-ink-muted">
                          <CalendarDays size={15} className="text-ink-faint" />
                          Member since
                        </span>
                        <span className="text-xs text-ink-soft">
                          {formatDate(student.created_at)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-ink-muted">
                        <ShieldCheck size={15} className="text-ink-faint" />
                        Outstanding
                      </span>
                      <span
                        className={
                          outstanding > 0
                            ? 'text-sm font-semibold text-red-600'
                            : 'text-sm font-medium text-forest-700'
                        }
                      >
                        {peso(outstanding)}
                      </span>
                    </div>
                  </>
                ) : user.role === ROLE.LIBRARIAN ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-ink-muted">
                        <BookMarked size={15} className="text-ink-faint" />
                        Loans processed
                      </span>
                      <span className="font-medium text-ink">{myLoans}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-ink-muted">
                        <KeyRound size={15} className="text-ink-faint" />
                        Password
                      </span>
                      <Badge tone={user.mustChangePassword ? 'warning' : 'success'}>
                        {user.mustChangePassword ? 'Needs change' : 'Set'}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-ink-muted">
                      <Users size={15} className="text-ink-faint" />
                      Librarian accounts
                    </span>
                    <span className="font-medium text-ink">{db.librarians.length}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="section-title">Security</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Change your password regularly. New librarian accounts must replace their initial
              password before using the dashboard.
            </p>
            <Button as={Link} to="/change-password" variant="secondary" className="mt-4 w-full">
              <KeyRound size={16} />
              Change password
            </Button>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <UserRound size={18} className="text-forest-700" aria-hidden="true" />
              <h2 className="section-title">Personal details</h2>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              These details appear on library records and borrow slips.
            </p>

            <form onSubmit={handleSave} className="mt-5 space-y-4" noValidate>
              {error ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                >
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {error}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value)
                    if (error) setError('')
                  }}
                  required
                />
                <Input
                  label="Last name"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value)
                    if (error) setError('')
                  }}
                  required
                />
              </div>

              <Input
                label="Email address"
                value={user.email}
                readOnly
                disabled
                hint="Email is your sign-in identity and cannot be changed here."
              />

              {student ? (
                <Input
                  label="Contact number"
                  type="tel"
                  value={contactNumber}
                  onChange={(event) => {
                    setContactNumber(event.target.value)
                    if (error) setError('')
                  }}
                  hint="11-digit mobile number used by the library desk."
                  required
                />
              ) : null}

              <div className="flex justify-end">
                <Button type="submit" loading={saving}>
                  <Save size={16} />
                  Save changes
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-cream-300 bg-cream-50 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brass-700 ring-1 ring-inset ring-brass-200">
                <RotateCcw size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-semibold text-ink">Local data</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  This build keeps everything in your browser. Clear the local database to remove
                  all books, accounts, loans, fines and requests from this device.
                </p>
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={() => setResetOpen(true)}
                >
                  <RotateCcw size={15} />
                  Clear local data
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="Clear all local data?"
        description="Every book, student, staff account, loan and fine will be permanently removed from this browser. You will be signed out."
        confirmLabel="Clear and sign out"
        tone="danger"
      />
    </div>
  )
}
