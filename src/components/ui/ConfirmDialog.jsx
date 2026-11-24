import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <span
          className={
            tone === 'danger'
              ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600'
              : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brass-50 text-brass-700'
          }
        >
          <AlertTriangle size={20} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}
