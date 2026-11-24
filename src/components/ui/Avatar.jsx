import { cn, initials } from '../../lib/format'

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

const tones = {
  student: 'bg-forest-100 text-forest-800 ring-forest-200',
  librarian: 'bg-brass-100 text-brass-800 ring-brass-200',
  superlibrarian: 'bg-forest-800 text-cream-50 ring-forest-900',
  neutral: 'bg-cream-200 text-ink-soft ring-cream-300',
}

export default function Avatar({ firstName, lastName, name, role = 'neutral', size = 'md', className }) {
  const first = firstName ?? (name ? name.split(' ')[0] : '')
  const last = lastName ?? (name ? name.split(' ').slice(1).join(' ') : '')
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase ring-1 ring-inset',
        sizes[size] || sizes.md,
        tones[role] || tones.neutral,
        className,
      )}
      aria-hidden="true"
    >
      {initials(first, last)}
    </span>
  )
}
