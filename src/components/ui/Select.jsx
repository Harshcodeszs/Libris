import { forwardRef, useId } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/format'

const Select = forwardRef(function Select(
  { label, error, hint, className, id, required, children, containerClassName, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id || generatedId
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined

  return (
    <div className={containerClassName}>
      {label ? (
        <label htmlFor={selectId} className="label">
          {label}
          {required ? <span className="ml-0.5 text-brass-600">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(
            'input cursor-pointer appearance-none pr-10',
            error && 'input-error',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
      </div>
      {error ? (
        <p id={`${selectId}-error`} className="error-text">
          <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default Select
