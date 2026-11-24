import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { cn } from '../../lib/format'
import { BRAND } from '../../lib/constants'

export default function Brand({ to = '/', dark = false, className, compact = false }) {
  return (
    <Link
      to={to}
      className={cn('group inline-flex items-center gap-2.5 rounded-xl', className)}
      aria-label={`${BRAND.name} home`}
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset transition-colors',
          dark
            ? 'bg-cream-100 text-forest-900 ring-white/10'
            : 'bg-forest-800 text-cream-50 ring-forest-900/10 group-hover:bg-forest-900',
        )}
      >
        <BookOpen size={18} strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            'block font-display text-xl font-semibold tracking-tight',
            dark ? 'text-cream-50' : 'text-ink',
          )}
        >
          {BRAND.name}
        </span>
        {!compact ? (
          <span
            className={cn(
              'mt-1 block text-[9px] font-semibold uppercase tracking-[0.2em]',
              dark ? 'text-cream-100/50' : 'text-ink-faint',
            )}
          >
            {BRAND.tagline}
          </span>
        ) : null}
      </span>
    </Link>
  )
}
