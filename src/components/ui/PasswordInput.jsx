import { forwardRef, useId, useState } from 'react'
import { AlertCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '../../lib/format'

const PasswordInput = forwardRef(function PasswordInput(
  { label, error, hint, className, id, required, containerClassName, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)
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
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-faint">
          <Lock size={17} aria-hidden="true" />
        </span>
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn('input pl-10 pr-11', error && 'input-error', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-xl text-ink-faint transition-colors hover:text-ink"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
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

export default PasswordInput
