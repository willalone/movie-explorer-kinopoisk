import { useEffect, useId, useMemo, useRef } from 'react'

interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onClose,
  onConfirm,
}: ConfirmModalProps) => {
  if (!open) return null

  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  const describedBy = useMemo(() => (description ? descriptionId : undefined), [description, descriptionId])

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const node = panelRef.current
    const focusable = node?.querySelectorAll<HTMLElement>(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
    )
    focusable?.[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Tab' && node && focusable && focusable.length > 0) {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null

        if (e.shiftKey) {
          if (active === first || active === node) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      previouslyFocused.current?.focus?.()
    }
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        ref={panelRef}
        tabIndex={-1}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <h2 className="modal__title" id={titleId}>
          {title}
        </h2>
        {description && (
          <p className="modal__description" id={descriptionId}>
            {description}
          </p>
        )}
        <div className="modal__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

