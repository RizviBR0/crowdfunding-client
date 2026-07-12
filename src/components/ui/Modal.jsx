import { useEffect } from 'react'
import { X } from 'lucide-react'

function Modal({ children, description, isOpen, onClose, title }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        aria-describedby="design-modal-description"
        aria-labelledby="design-modal-title"
        aria-modal="true"
        className="modal-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-panel__header">
          <div>
            <p className="modal-panel__eyebrow">Modal shell preview</p>
            <h3 id="design-modal-title">{title}</h3>
            <p id="design-modal-description">{description}</p>
          </div>
          <button aria-label="Close preview modal" className="icon-button" onClick={onClose} type="button">
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="modal-panel__content">{children}</div>
      </div>
    </div>
  )
}

export default Modal
