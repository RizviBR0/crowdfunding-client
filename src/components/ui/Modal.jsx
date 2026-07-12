import { useEffect } from 'react'
import { X } from 'lucide-react'

const titleId = 'modal-title'
const descriptionId = 'modal-description'

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
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="modal-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-panel__header">
          <div>
            <h3 id={titleId}>{title}</h3>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          <button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button">
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="modal-panel__content">{children}</div>
      </div>
    </div>
  )
}

export default Modal
