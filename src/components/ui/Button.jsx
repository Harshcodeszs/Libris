import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/format'

const variants = {
  primary:
    'bg-forest-800 text-cream-50 shadow-sm hover:bg-forest-900 active:bg-forest-950',
  secondary:
    'border border-cream-300 bg-white text-ink shadow-sm hover:border-cream-400 hover:bg-cream-50',
  ghost: 'text-ink-soft hover:bg-cream-100 hover:text-ink',
  danger: 'bg-red-700 text-white shadow-sm hover:bg-red-800',
  brass: 'bg-brass-600 text-white shadow-sm hover:bg-brass-700',
  link: 'h-auto rounded-none px-0 text-forest-700 underline-offset-4 hover:text-forest-900 hover:underline',
}

const sizes = {
  sm: 'h-9 gap-1.5 px-3 text-xs',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-sm',
  icon: 'h-9 w-9',
}

const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    type = 'button',
    as: Component = 'button',
    ...props
  },
  ref,
) {
  const isNativeButton = Component === 'button'
  const isDisabled = disabled || loading

  return (
    <Component
      ref={ref}
      {...(isNativeButton ? { type, disabled: isDisabled } : { 'aria-disabled': isDisabled })}
      className={cn(
        'inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 disabled:cursor-not-allowed disabled:opacity-55',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </Component>
  )
})

export default Button
