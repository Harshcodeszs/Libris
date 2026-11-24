import { cn } from '../../lib/format'

export default function Tabs({ items, value, onChange, className }) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto border-b border-cream-300', className)}>
      {items.map((item) => {
        const active = item.key === value
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex shrink-0 cursor-pointer items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors duration-150',
              active ? 'text-forest-800' : 'text-ink-muted hover:text-ink',
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                  active ? 'bg-forest-100 text-forest-800' : 'bg-cream-100 text-ink-faint',
                )}
              >
                {item.count}
              </span>
            ) : null}
            {active ? (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-forest-700" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
