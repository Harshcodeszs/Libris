import { useMemo, useState } from 'react'
import {
  KeyRound,
  Pencil,
  SearchX,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { createLibrarian, deleteLibrarian, updateLibrarian } from '../../lib/auth'
import { getDB } from '../../lib/db'
import { isValidEmail, passwordIssues } from '../../lib/validation'
import { formatDate, fullName } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/ui/PasswordInput'
import SearchInput from '../../components/ui/SearchInput'
import EmptyState from '../../components/ui/EmptyState'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function ManageLibrarians() {
  const { notify } = useToast()
  const [tick, setTick] = useState(0)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
// Read Operation
  const { librarians, loanCounts } = useMemo(() => {
    const db = getDB()
    const counts = new Map()
    db.borrows.forEach((borrow) => {
      if (borrow.librarian_id) {
        counts.set(borrow.librarian_id, (counts.get(borrow.librarian_id) || 0) + 1)
      }
    })
    return {
      librarians: db.librarians
        .slice()
        .sort((a, b) =>
          `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
        ),
      loanCounts: counts,
    }
  }, [tick])

  const pending = librarians.filter((item) => item.must_change_password).length
  const totalLoans = librarians.reduce(
    (sum, librarian) => sum + (loanCounts.get(librarian.librarian_id) || 0),
    0,
  )

  const filtered = librarians.filter((librarian) => {
    const haystack =
      `${librarian.first_name} ${librarian.last_name} ${librarian.librarian_email} ${librarian.librarian_id}`.toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (librarian) => {
    setEditing(librarian)
    setForm({
      firstName: librarian.first_name,
      lastName: librarian.last_name,
      email: librarian.librarian_email,
      password: '',
      confirmPassword: '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditing(null)
    setFormError('')
  }

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (formError) setFormError('')
  }
// Create Operation
  const handleSubmit = () => {
    setFormError('')
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError('First and last name are required.')
      return
    }
    if (!isValidEmail(form.email)) {
      setFormError('Enter a valid email address for the librarian.')
      return
    }

    const needsPassword = !editing || Boolean(form.password)
    if (needsPassword) {
      const issues = passwordIssues(form.password)
      if (issues.length) {
        setFormError(`Password needs ${issues.join(', ')}.`)
        return
      }
      if (form.password !== form.confirmPassword) {
        setFormError('The two passwords do not match.')
        return
      }
    }

    setSaving(true)
    try {
      if (editing) {
        updateLibrarian(editing.librarian_id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password || undefined,
        })
        notify(
          form.password
            ? 'Librarian updated. The new password must be changed at their next sign-in.'
            : 'Librarian account updated.',
          'success',
        )
      } else {
        createLibrarian({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        })
        notify('Librarian account created. They must set a new password on first sign-in.', 'success')
      }
      setModalOpen(false)
      setEditing(null)
      setTick((value) => value + 1)
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    try {
      deleteLibrarian(deleteTarget.librarian_id)
      notify(`${fullName(deleteTarget)}'s account was removed.`, 'success')
      setDeleteTarget(null)
      setTick((value) => value + 1)
    } catch (error) {
      notify(error.message, 'error')
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Librarian accounts"
        description="Create, edit and remove librarian accounts. Superlibrarian accounts are separate and cannot be managed from here."
        actions={
          <Button onClick={openCreate}>
            <UserPlus size={16} />
            Add librarian
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Librarian accounts', librarians.length, Users, 'text-ink'],
          ['Active', librarians.length - pending, ShieldCheck, 'text-forest-700'],
          ['Password pending', pending, KeyRound, 'text-brass-700'],
          ['Loans processed', totalLoans, ShieldCheck, 'text-ink'],
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
          placeholder="Search by name, email or ID…"
          aria-label="Search librarians"
          className="max-w-xl"
        />
      </div>

      {filtered.length ? (
        <>
          <div className="table-wrap hidden md:block">
            <table className="table-base">
              <thead>
                <tr>
                  <th scope="col">Librarian</th>
                  <th scope="col">Loans processed</th>
                  <th scope="col">Account status</th>
                  <th scope="col">Created</th>
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((librarian) => (
                  <tr key={librarian.librarian_id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar
                          firstName={librarian.first_name}
                          lastName={librarian.last_name}
                          role="librarian"
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{fullName(librarian)}</p>
                          <p className="truncate text-xs text-ink-faint">
                            {librarian.librarian_email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">
                      <span className="font-semibold text-ink">
                        {loanCounts.get(librarian.librarian_id) || 0}
                      </span>
                    </td>
                    <td>
                      <Badge tone={librarian.must_change_password ? 'warning' : 'success'}>
                        {librarian.must_change_password ? 'Initial password' : 'Active'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap text-xs">
                      {formatDate(librarian.created_at)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(librarian)}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-cream-100 hover:text-ink"
                          aria-label={`Edit ${fullName(librarian)}`}
                          title="Edit account"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(librarian)}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${fullName(librarian)}`}
                          title="Delete account"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {filtered.map((librarian) => (
              <li key={librarian.librarian_id} className="card p-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    firstName={librarian.first_name}
                    lastName={librarian.last_name}
                    role="librarian"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{fullName(librarian)}</p>
                    <p className="truncate text-xs text-ink-faint">{librarian.librarian_email}</p>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      {loanCounts.get(librarian.librarian_id) || 0} loans processed
                    </p>
                  </div>
                  <Badge tone={librarian.must_change_password ? 'warning' : 'success'}>
                    {librarian.must_change_password ? 'Initial' : 'Active'}
                  </Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(librarian)}>
                    <Pencil size={13} />
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(librarian)}>
                    <Trash2 size={13} />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="card">
          <EmptyState
            icon={query ? SearchX : Users}
            title={query ? 'No librarians match' : 'No librarian accounts'}
            description={
              query
                ? 'Try a different name, email or ID.'
                : 'Add a librarian so the circulation desk can operate.'
            }
            action={
              query ? (
                <Button variant="secondary" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <UserPlus size={16} />
                  Add the first librarian
                </Button>
              )
            }
          />
        </div>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4 text-sm text-ink-muted">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-forest-600" aria-hidden="true" />
        <p>
          Deleting a librarian keeps their past loan records intact and shows “Former librarian” in
          circulation history. New accounts must replace their initial password on first sign-in.
        </p>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        size="lg"
        title={editing ? 'Edit librarian account' : 'Add a librarian'}
        description={
          editing
            ? `${editing.librarian_email} · created ${formatDate(editing.created_at)}`
            : 'The librarian signs in with this email and initial password, then must choose a new password.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Save changes' : 'Create account'}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              value={form.firstName}
              onChange={(event) => update('firstName', event.target.value)}
              required
            />
            <Input
              label="Last name"
              value={form.lastName}
              onChange={(event) => update('lastName', event.target.value)}
              required
            />
          </div>

          <Input
            label="Library email"
            type="email"
            placeholder="name@school.edu"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            hint="This is the sign-in email and must be unique across every account."
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordInput
              label={editing ? 'New password (optional)' : 'Initial password'}
              autoComplete="new-password"
              placeholder={editing ? 'Leave blank to keep current' : 'At least 8 characters'}
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              hint={
                editing
                  ? 'Setting a password forces a change at next sign-in.'
                  : 'The librarian must change this after signing in.'
              }
              required={!editing}
            />
            <PasswordInput
              label="Confirm password"
              autoComplete="new-password"
              placeholder={editing ? 'Repeat if changing' : 'Repeat the password'}
              value={form.confirmPassword}
              onChange={(event) => update('confirmPassword', event.target.value)}
              required={!editing || Boolean(form.password)}
            />
          </div>

          {!editing ? (
            <div className="rounded-xl border border-brass-200 bg-brass-50 p-3.5 text-xs leading-relaxed text-brass-900">
              Share the initial password with the librarian privately. The account is active
              immediately, but the dashboard stays locked until they replace it.
            </div>
          ) : null}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget ? `Delete ${fullName(deleteTarget)}?` : 'Delete this account?'}
        description="The librarian will no longer be able to sign in. Their past checkout records stay in circulation history and will show as “Former librarian”."
        confirmLabel="Delete account"
        tone="danger"
      />
    </div>
  )
}
