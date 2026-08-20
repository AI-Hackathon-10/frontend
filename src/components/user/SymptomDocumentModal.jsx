import { useEffect, useState } from 'react'
import Icon from '../ui/Icon.jsx'

export default function SymptomDocumentModal({ open, report, onClose }) {
  const [hasImageError, setImageError] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  useEffect(() => {
    setImageError(false)
    setSaveStatus('')
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

  const handleSaveDocument = async () => {
    if (!report.documentImageUrl) {
      setSaveStatus('저장할 문서 이미지가 아직 없습니다.')
      return
    }

    try {
      const response = await fetch(report.documentImageUrl)
      if (!response.ok) throw new Error('문서 이미지를 불러오지 못했습니다.')

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${report.title ?? 'symptom-report'}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)
      setSaveStatus('문서 이미지를 저장했습니다.')
    } catch {
      window.open(report.documentImageUrl, '_blank', 'noopener,noreferrer')
      setSaveStatus('이미지를 새 창에서 열었습니다. 메뉴에서 저장해 주세요.')
    }
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
        <div className="document-preview__actions">
          <button className="button button--primary button--wide" onClick={handleSaveDocument} type="button">
            <Icon name="download" size={18} />
            저장하기
          </button>
          {saveStatus ? <p className="document-save-status" role="status">{saveStatus}</p> : null}
        </div>
      </div>
    </div>
  )
}
