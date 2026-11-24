import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '../lib/format'

const ToastContext = createContext(null)

const tones = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-forest-600',
    iconClass: 'text-forest-600',
    label: 'Success',
  },
  error: {
    icon: AlertCircle,
    bar: 'bg-red-600',
    iconClass: 'text-red-600',
    label: 'Something went wrong',
  },
  info: {
    icon: Info,
    bar: 'bg-brass-500',
    iconClass: 'text-brass-600',
    label: 'Notice',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const counter = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const notify = useCallback(
    (message, tone = 'success') => {
      counter.current += 1
      const id = counter.current
      setToasts((current) => [...current.slice(-3), { id, message, tone }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 4500),
      )
    },
    [dismiss],
  )

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer))
      timers.current.clear()
    },
    [],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:w-full sm:max-w-sm"
      >
        {toasts.map((toast) => {
          const tone = tones[toast.tone] || tones.success
          const Icon = tone.icon
          return (
            <div
              key={toast.id}
              className="pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border border-cream-300 bg-white p-3.5 pr-2.5 shadow-lift animate-slide-in-right"
            >
              <span className={cn('absolute left-0 top-0 h-full w-1', tone.bar)} aria-hidden="true" />
              <Icon size={19} className={cn('mt-0.5 shrink-0', tone.iconClass)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {tone.label}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-ink">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-cream-100 hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
