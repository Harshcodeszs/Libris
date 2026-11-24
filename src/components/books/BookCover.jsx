import { cn } from '../../lib/format'

const palettes = {
  Fiction: 'from-forest-600 via-forest-800 to-forest-950',
  Literature: 'from-brass-500 via-brass-700 to-brass-900',
  History: 'from-stone-500 via-stone-700 to-stone-900',
  Science: 'from-teal-600 via-teal-800 to-forest-950',
  Technology: 'from-sky-700 via-sky-900 to-slate-950',
  Psychology: 'from-violet-700 via-violet-900 to-stone-950',
  Philosophy: 'from-rose-700 via-rose-900 to-stone-950',
  'Self-Help': 'from-amber-500 via-amber-700 to-brass-900',
  Reference: 'from-slate-500 via-slate-700 to-slate-900',
}

export default function BookCover({ book, className }) {
  const palette = palettes[book?.category] || 'from-forest-600 via-forest-800 to-forest-950'

  return (
    <div
      className={cn(
        'relative flex shrink-0 flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br p-2.5 text-cream-50 shadow-sm ring-1 ring-ink/10',
        palette,
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-black/25" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.7) 3px, rgba(255,255,255,0.7) 4px)',
        }}
      />
      <p className="relative line-clamp-4 font-display text-[11px] font-semibold leading-tight">
        {book?.title}
      </p>
      <div className="relative">
        <p className="truncate text-[8px] uppercase tracking-widest text-cream-50/60">
          {book?.category}
        </p>
        <p className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.22em] text-cream-50/40">
          Libris
        </p>
      </div>
    </div>
  )
}
