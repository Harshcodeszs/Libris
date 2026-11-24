import { cn } from '../../lib/format'

const tones = {
  success: 'bg-forest-50 text-forest-700 ring-forest-200',
  warning: 'bg-brass-50 text-brass-800 ring-brass-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  neutral: 'bg-cream-100 text-ink-muted ring-cream-300',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  forest: 'bg-forest-800 text-cream-50 ring-forest-800',
  brass: 'bg-brass-600 text-white ring-brass-600',
}

const dotTones = {
  success: 'bg-forest-500',
  warning: 'bg-brass-500',
  danger: 'bg-red-500',
  neutral: 'bg-stone-400',
  info: 'bg-sky-500',
  forest: 'bg-cream-50',
  brass: 'bg-white',
}

export function statusTone(value) {
  const normalized = String(value || '').toLowerCase()
  if (['available', 'paid', 'returned', 'verified', 'active', 'success'].includes(normalized))
    return 'success'
  if (['borrowed', 'unpaid', 'overdue', 'damaged', 'warning'].includes(normalized))
    return 'warning'
  if (['lost', 'rejected', 'danger'].includes(normalized)) return 'danger'
  if (['waived', 'neutral', 'inactive'].includes(normalized)) return 'neutral'
  return 'neutral'
}

export default function Badge({ children, tone = 'neutral', dot = true, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone] || tones.neutral,
        className,
      )}
    >
      {dot ? (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotTones[tone] || dotTones.neutral)} />
      ) : null}
      {children}
    </span>
  )
}
