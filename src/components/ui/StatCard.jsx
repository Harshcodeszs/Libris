import { cn } from '../../lib/format'

const toneStyles = {
  forest: 'bg-forest-50 text-forest-700 ring-forest-100',
  brass: 'bg-brass-50 text-brass-700 ring-brass-100',
  red: 'bg-red-50 text-red-600 ring-red-100',
  cream: 'bg-cream-100 text-ink-soft ring-cream-200',
}

export default function StatCard({ label, value, hint, icon: Icon, tone = 'forest' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold leading-none text-ink">{value}</p>
          {hint ? <p className="mt-2 text-xs text-ink-muted">{hint}</p> : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
              toneStyles[tone] || toneStyles.forest,
            )}
          >
            <Icon size={20} aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </div>
  )
}
