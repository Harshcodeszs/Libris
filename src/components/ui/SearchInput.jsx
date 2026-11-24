import { Search, X } from 'lucide-react'
import { cn } from '../../lib/format'

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  inputClassName,
  ...props
}) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={17}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn('input pl-10 pr-9', inputClassName)}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-cream-100 hover:text-ink"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      ) : null}
    </div>
  )
}
