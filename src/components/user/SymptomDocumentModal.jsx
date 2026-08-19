import { useEffect, useState } from 'react'
import Icon from '../ui/Icon.jsx'

export default function SymptomDocumentModal({ open, report, onClose }) {
  const [hasImageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [report])

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!open || !report) return null

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="account-modal-backdrop" onMouseDown={handleBackdropMouseDown}>
      <div
        aria-labelledby="symptom-document-modal-title"
        aria-modal="true"
        className="account-modal account-modal--document"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button aria-label="증상 기록 문서 닫기" className="modal-close" onClick={onClose} type="button">
          <Icon name="close" size={19} />
        </button>
        <span className="account-modal__icon"><Icon name="notes" size={21} /></span>
        <h2 id="symptom-document-modal-title">증상 기록 문서 보기</h2>
        <p className="account-modal__description">S3 Presigned URL 이미지 목업</p>
        <div className="document-preview">
          <img
            alt="증상 기록 문서"
            onError={() => setImageError(true)}
            src={report.documentImageUrl}
          />
          {hasImageError ? <p role="status">문서 이미지 연결 전 목업 주소입니다.</p> : null}
        </div>
      </div>
    </div>
  )
}
