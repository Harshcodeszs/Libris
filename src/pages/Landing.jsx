import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Library,
  MailCheck,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { getOverviewStats } from '../lib/stats'
import { BRAND } from '../lib/constants'
import { peso } from '../lib/format'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const steps = [
  {
    icon: MailCheck,
    title: 'Confirm your Gmail',
    body: 'Register with a @gmail.com address. A confirmation link activates your student account before you can sign in.',
  },
  {
    icon: Search,
    title: 'Find your next read',
    body: 'Search the catalog by title, author or category, check availability, and borrow instantly within your five-book limit.',
  },
  {
    icon: Clock,
    title: 'Return on time',
    body: 'Every loan is due in 14 days. Return at the desk and overdue fines are calculated automatically at ₱5 per day.',
  },
]

const roles = [
  {
    icon: GraduationCap,
    title: 'For students',
    tone: 'student',
    points: [
      'Browse and search the whole collection',
      'Borrow up to five books at a time',
      'Track due dates and unpaid fines',
      'Update your contact details',
    ],
  },
  {
    icon: Library,
    title: 'For librarians',
    tone: 'librarian',
    points: [
      'Maintain the catalog and copy status',
      'Issue and receive loans at the desk',
      'Issue, collect or waive fines',
      'Look up student borrowing history',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'For super librarians',
    tone: 'super',
    points: [
      'Create librarian accounts',
      'Edit names, emails and passwords',
      'Remove accounts that leave the library',
      'Oversee every operational record',
    ],
  },
]

export default function Landing() {
  const stats = useMemo(() => getOverviewStats(), [])

  return (
    <>
      <section className="relative overflow-hidden border-b border-cream-300 paper-grain">
        <div className="container-page grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-800">
              <Sparkles size={13} aria-hidden="true" />
              {BRAND.library}
            </span>

            <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              A quieter way to borrow, return and{' '}
              <span className="relative whitespace-nowrap text-forest-800">
                keep reading
                <span
                  className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-brass-300/50"
                  aria-hidden="true"
                />
              </span>
              .
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              One login for students, librarians and supervisors. Students confirm their Gmail to
              join, librarians run the desk, and the super librarian keeps every account in order.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/register" size="lg">
                Create a student account
                <ArrowRight size={17} />
              </Button>
              <Button as={Link} to="/login" variant="secondary" size="lg">
                <BookMarked size={17} />
                Sign in to your dashboard
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-cream-300 pt-6">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  Titles
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-ink">{stats.books}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  Students
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-ink">
                  {stats.students}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  On loan
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-ink">
                  {stats.activeLoans}
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-fade-in">
            <div
              className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brass-200/50 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-forest-300/40 blur-2xl"
              aria-hidden="true"
            />

            <div className="card relative overflow-hidden p-5 shadow-lift">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                  Your shelf
                </p>
                <Badge tone="success">Gmail verified</Badge>
              </div>

              <div className="mt-4 flex gap-4">
                <div className="book-spines flex h-36 w-24 shrink-0 items-end justify-center rounded-lg p-2 shadow-sm ring-1 ring-forest-950/20">
                  <span className="rounded bg-cream-50/90 px-1.5 py-0.5 font-display text-[10px] font-semibold text-forest-900">
                    FICTION
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-brass-700">Currently borrowed</p>
                  <h2 className="mt-1 truncate font-display text-xl font-semibold text-ink">
                    Clean Code
                  </h2>
                  <p className="text-sm text-ink-muted">Robert C. Martin</p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink-soft">Due in 6 days</span>
                      <span className="text-ink-faint">Nov 10</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-200">
                      <div className="h-full w-[62%] rounded-full bg-forest-600" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                      <BookOpen size={15} aria-hidden="true" />
                    </span>
                    <div className="text-xs leading-tight">
                      <p className="font-medium text-ink">2 of 5 loans used</p>
                      <p className="text-ink-faint">No unpaid fines</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-cream-200 pt-4 text-center">
                {[
                  ['Due today', '0'],
                  ['Overdue', '1'],
                  ['Fines', peso(stats.unpaidFinesTotal)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-7 -right-2 w-56 rotate-2 rounded-2xl border border-cream-300 bg-white p-3.5 shadow-lift sm:-right-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-100 text-forest-700">
                  <CheckCircle2 size={16} aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-ink">Returned on time</p>
                  <p className="text-[11px] text-ink-faint">No fine. Nice work.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-cream-300 bg-cream-50">
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-700">
              How it works
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Three steps from sign-up to your first loan
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <article key={step.title} className="card card-hover p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700 ring-1 ring-inset ring-forest-100">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="font-display text-3xl font-semibold text-cream-400">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="for-students" className="border-b border-cream-300">
        <div className="container-page py-16 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-700">
                One system, three roles
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Everyone gets the view they need
              </h2>
            </div>
            <Button as={Link} to="/login" variant="secondary">
              <Users size={16} />
              Sign in
            </Button>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon
              const isStudent = role.tone === 'student'
              return (
                <article
                  key={role.title}
                  className={
                    isStudent
                      ? 'card relative overflow-hidden border-forest-200 p-6 ring-1 ring-forest-100'
                      : 'card p-6'
                  }
                >
                  {isStudent ? (
                    <span className="absolute right-4 top-4 rounded-full bg-forest-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-forest-700">
                      Public sign-up
                    </span>
                  ) : null}
                  <span
                    className={
                      role.tone === 'librarian'
                        ? 'flex h-11 w-11 items-center justify-center rounded-xl bg-brass-50 text-brass-700 ring-1 ring-inset ring-brass-100'
                        : isStudent
                          ? 'flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700 ring-1 ring-inset ring-forest-100'
                          : 'flex h-11 w-11 items-center justify-center rounded-xl bg-forest-800 text-cream-50'
                    }
                  >
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">{role.title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {role.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-sm text-ink-muted">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-forest-500"
                          aria-hidden="true"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4 text-sm text-ink-muted">
            <ReceiptText size={18} className="mt-0.5 shrink-0 text-brass-600" aria-hidden="true" />
            <p>
              <span className="font-medium text-ink">Bringing a book back late?</span> Overdue fines
              are ₱5 per day and show up on the student&apos;s fines page immediately after the
              librarian records the return.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest-950">
        <div className="container-page flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16">
          <div>
            <h2 className="font-display text-2xl font-semibold text-cream-50 sm:text-3xl">
              Ready to borrow your next book?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream-100/70">
              Create a student account with your Gmail, or sign in to your student or staff
              dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/register" variant="brass" size="lg">
              Register as a student
            </Button>
            <Button
              as={Link}
              to="/login"
              size="lg"
              className="border border-white/15 bg-white/5 text-cream-50 hover:bg-white/10"
            >
              Sign in
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
