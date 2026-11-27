import { useMemo, useState } from 'react'
import {
  BookPlus,
  Library,
  Pencil,
  SearchX,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { getDB } from '../../lib/db'
import { createBook, deleteBook, getBorrowStatus, updateBook } from '../../lib/rules'
import { BOOK_STATUS, BOOK_STATUSES, BORROW_STATUS, CATEGORIES } from '../../lib/constants'
import { formatDate, fullName } from '../../lib/format'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Badge, { statusTone } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import SearchInput from '../../components/ui/SearchInput'
import EmptyState from '../../components/ui/EmptyState'
import BookCover from '../../components/books/BookCover'

const emptyForm = { title: '', author: '', category: CATEGORIES[0], status: BOOK_STATUS.AVAILABLE }

export default function ManageBooks() {
  const { notify } = useToast()
  const [tick, setTick] = useState(0)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
 // Read Operation
  const { books, activeByBook, studentById } = useMemo(() => {
    const db = getDB()
    return {
      books: db.books.slice().sort((a, b) => a.title.localeCompare(b.title)),
      activeByBook: new Map(
        db.borrows
          .filter((borrow) => getBorrowStatus(borrow) === BORROW_STATUS.ACTIVE)
          .map((borrow) => [borrow.book_id, borrow]),
      ),
      studentById: new Map(db.students.map((student) => [student.student_id, student])),
    }
  }, [tick])

  const counts = {
    total: books.length,
    available: books.filter((book) => book.status === BOOK_STATUS.AVAILABLE).length,
    borrowed: books.filter((book) => book.status === BOOK_STATUS.BORROWED).length,
    offShelf: books.filter((book) => ['Lost', 'Damaged'].includes(book.status)).length,
  }

  const filtered = books.filter((book) => {
    const matchesQuery = `${book.title} ${book.author}`.toLowerCase().includes(query.trim().toLowerCase())
    const matchesCategory = category === 'all' || book.category === category
    const matchesStatus = status === 'all' || book.status === status
    return matchesQuery && matchesCategory && matchesStatus
  })

  const hasFilters = query.trim() || category !== 'all' || status !== 'all'

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (book) => {
    setEditing(book)
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      status: book.status,
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
// Create Operation
  const handleSubmit = (event) => {
    event.preventDefault()
    setFormError('')
    if (!form.title.trim() || !form.author.trim()) {
      setFormError('Title and author are required.')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        updateBook(editing.book_id, form)
        notify(`“${form.title}” updated.`, 'success')
      } else {
        createBook(form)
        notify(`“${form.title}” added to the catalog.`, 'success')
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
      deleteBook(deleteTarget.book_id)
      notify(`“${deleteTarget.title}” removed from the catalog.`, 'success')
      setDeleteTarget(null)
      setTick((value) => value + 1)
    } catch (error) {
      notify(error.message, 'error')
      setDeleteTarget(null)
    }
  }

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (formError) setFormError('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Manage books"
        description="Each row is one physical copy. Copies on loan cannot be deleted or marked unavailable until they are returned."
        actions={
          <Button onClick={openCreate}>
            <BookPlus size={16} />
            Add book
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total copies', counts.total, 'text-ink'],
          ['Available', counts.available, 'text-forest-700'],
          ['On loan', counts.borrowed, 'text-brass-700'],
          ['Lost / damaged', counts.offShelf, 'text-red-600'],
        ].map(([label, value, tone]) => (
          <div key={label} className="card px-4 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
            <p className={`mt-1 font-display text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search title or author…"
            aria-label="Search books"
          />
          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-[42px]"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-[42px]"
          >
            <option value="all">Any status</option>
            {BOOK_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Button
            variant="ghost"
            className="h-[42px]"
            disabled={!hasFilters}
            onClick={() => {
              setQuery('')
              setCategory('all')
              setStatus('all')
            }}
          >
            <SlidersHorizontal size={15} />
            Clear
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-faint" aria-live="polite">
          Showing <span className="font-semibold text-ink-soft">{filtered.length}</span> of{' '}
          {books.length} copies.
        </p>
      </div>

      {filtered.length ? (
        <>
          <div className="table-wrap hidden md:block">
            <table className="table-base">
              <thead>
                <tr>
                  <th scope="col">Book</th>
                  <th scope="col">Category</th>
                  <th scope="col">Status</th>
                  <th scope="col">Current loan</th>
                  <th scope="col" className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((book) => {
                  const active = activeByBook.get(book.book_id)
                  const borrower = active ? studentById.get(active.student_id) : null
                  return (
                    <tr key={book.book_id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <BookCover book={book} className="h-14 w-10" />
                          <div className="min-w-0">
                            <p className="max-w-[20rem] truncate font-medium text-ink">{book.title}</p>
                            <p className="max-w-[20rem] truncate text-xs text-ink-faint">
                              {book.author} · BK-{String(book.book_id).padStart(4, '0')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge tone="neutral" dot={false}>
                          {book.category}
                        </Badge>
                      </td>
                      <td>
                        <Badge tone={statusTone(book.status)}>{book.status}</Badge>
                      </td>
                      <td className="text-xs">
                        {active ? (
                          <div>
                            <p className="font-medium text-ink-soft">
                              {borrower ? fullName(borrower) : 'Former student'}
                            </p>
                            <p className="text-ink-faint">Due {formatDate(active.due_date)}</p>
                          </div>
                        ) : (
                          <span className="text-ink-faint">—</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(book)}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-cream-100 hover:text-ink"
                            aria-label={`Edit ${book.title}`}
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(book)}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label={`Delete ${book.title}`}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {filtered.map((book) => {
              const active = activeByBook.get(book.book_id)
              return (
                <li key={book.book_id} className="card flex gap-3 p-3.5">
                  <BookCover book={book} className="h-24 w-[68px]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{book.title}</p>
                        <p className="truncate text-xs text-ink-faint">{book.author}</p>
                      </div>
                      <Badge tone={statusTone(book.status)}>{book.status}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-ink-faint">{book.category}</p>
                    {active ? (
                      <p className="mt-1 text-[11px] text-brass-700">
                        On loan · due {formatDate(active.due_date, 'MMM d')}
                      </p>
                    ) : null}
                    <div className="mt-2 flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(book)}>
                        <Pencil size={13} />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(book)}>
                        <Trash2 size={13} />
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <div className="card">
          <EmptyState
            icon={hasFilters ? SearchX : Library}
            title={hasFilters ? 'No copies match' : 'No books yet'}
            description={
              hasFilters
                ? 'Try another search term or clear the filters.'
                : 'Add the first title to start building the catalog.'
            }
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery('')
                    setCategory('all')
                    setStatus('all')
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <BookPlus size={16} />
                  Add the first book
                </Button>
              )
            }
          />
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit book' : 'Add a book'}
        description={
          editing
            ? 'Update this copy. Changing status is blocked while it is on loan.'
            : 'Each entry represents one physical copy on the shelf.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Save changes' : 'Add to catalog'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {formError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          ) : null}

          <Input
            label="Title"
            placeholder="e.g. The Great Gatsby"
            value={form.title}
            onChange={(event) => updateForm('title', event.target.value)}
            required
          />
          <Input
            label="Author"
            placeholder="e.g. F. Scott Fitzgerald"
            value={form.author}
            onChange={(event) => updateForm('author', event.target.value)}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={form.category}
              onChange={(event) => updateForm('category', event.target.value)}
              required
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select
              label="Copy status"
              value={form.status}
              onChange={(event) => updateForm('status', event.target.value)}
              hint={editing ? 'On-loan copies cannot change status.' : 'New copies are usually available.'}
              required
            >
              {BOOK_STATUSES.filter(
                (item) => editing || item !== BOOK_STATUS.BORROWED,
              ).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget ? `Delete “${deleteTarget.title}”?` : 'Delete this book?'}
        description="The copy disappears from the catalog. Past borrow records are kept for reporting. Copies currently on loan cannot be deleted."
        confirmLabel="Delete book"
        tone="danger"
      />
    </div>
  )
}
