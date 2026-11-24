import { forwardRef, useId } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/format'

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, className, id, required, containerClassName, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className={containerClassName}>
      {label ? (
        <label htmlFor={inputId} className="label">
          {label}
          {required ? <span className="ml-0.5 text-brass-600">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {Icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-faint">
            <Icon size={17} aria-hidden="true" />
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn('input', Icon && 'pl-10', error && 'input-error', className)}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="error-text">
          <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default Input
