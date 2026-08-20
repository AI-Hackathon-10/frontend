import { useEffect, useRef, useState } from 'react'
import { toBlob } from 'html-to-image'
import Icon from '../ui/Icon.jsx'

const DEFAULT_DOCUMENT_DATA = {
  userName: '-',
  birthDate: '-',
  drugName: '-',
}

function formatDocumentDate(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function DocumentImage({ alt, label, src }) {
  const isHttpImage = typeof src === 'string' && /^https?:\/\//i.test(src)
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    setHasLoadError(false)
  }, [src])

  return (
    <figure className="symptom-document__image-figure">
      {isHttpImage && !hasLoadError ? (
        <img
          alt={alt}
          className="symptom-document__image"
          crossOrigin="anonymous"
          onError={() => setHasLoadError(true)}
          src={src}
        />
      ) : (
        <div aria-label={alt} className="symptom-document__image-placeholder" role="img">
          <Icon name="image" size={30} />
          <small>이미지 없음</small>
        </div>
      )}
      <figcaption>{label}</figcaption>
    </figure>
  )
}

export default function SymptomDocumentModal({ open, report, onClose }) {
  const dialogRef = useRef(null)
  const documentRef = useRef(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  useEffect(() => {
    setSaveStatus(null)
  }, [report])

  useEffect(() => {
    if (!open) return undefined

    const dialog = dialogRef.current
    const previouslyFocusedElement = document.activeElement
    const previousBodyOverflow = document.body.style.overflow
    const getFocusableElements = () => Array.from(dialog?.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? [])

    document.body.style.overflow = 'hidden'
    getFocusableElements()[0]?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      if (previouslyFocusedElement instanceof HTMLElement) previouslyFocusedElement.focus()
    }
  }, [onClose, open])

  if (!open || !report) return null

  const documentData = {
    ...DEFAULT_DOCUMENT_DATA,
    ...report,
    userName: report.userName || DEFAULT_DOCUMENT_DATA.userName,
    birthDate: report.birthDate || DEFAULT_DOCUMENT_DATA.birthDate,
    drugName: report.drugName || DEFAULT_DOCUMENT_DATA.drugName,
  }
  const symptoms = documentData.symptoms?.join(' · ') || '-'
  const startedAt = documentData.startedAt ?? documentData.createdAt
  const takenAt = documentData.takenAt ?? documentData.createdAt

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  const handleSaveDocument = async () => {
    if (isSaving || !documentRef.current) return

    setIsSaving(true)
    setSaveStatus(null)

    try {
      const imageBlob = await toBlob(documentRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      })

      if (!imageBlob) throw new Error('PNG conversion returned no data')

      const objectUrl = URL.createObjectURL(imageBlob)
      try {
        const downloadLink = document.createElement('a')
        downloadLink.href = objectUrl
        downloadLink.download = `증상기록-${documentData.id ?? '문서'}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        downloadLink.remove()
      } finally {
        URL.revokeObjectURL(objectUrl)
      }

      setSaveStatus({ type: 'success', message: '증상 기록 문서를 저장했습니다.' })
    } catch {
      setSaveStatus({ type: 'error', message: '증상 기록 문서를 저장하지 못했습니다.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="account-modal-backdrop" onMouseDown={handleBackdropMouseDown}>
      <div
        aria-labelledby="symptom-document-modal-title"
        aria-modal="true"
        className="account-modal account-modal--document"
        onMouseDown={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
      >
        <button aria-label="증상 기록 문서 닫기" className="modal-close" onClick={onClose} type="button">
          <Icon name="close" size={19} />
        </button>
        <h2 className="sr-only" id="symptom-document-modal-title">증상 기록 문서 보기</h2>
        <article aria-label="증상 기록 문서" className="symptom-document" ref={documentRef}>
          <header className="symptom-document__header">
            <h3>증상 기록 문서</h3>
            <div aria-hidden="true" className="symptom-document__title-divider">
              <span><Icon name="notes" size={21} /></span>
            </div>
          </header>

          <section className="symptom-document__section" aria-labelledby="symptom-document-user-title">
            <header className="symptom-document__section-header">
              <span><Icon name="user" size={20} /></span>
              <h4 id="symptom-document-user-title">환자 정보</h4>
            </header>
            <dl className="symptom-document__details">
              <div><dt>이름</dt><dd>{documentData.userName}</dd></div>
              <div><dt>생년월일</dt><dd>{documentData.birthDate}</dd></div>
            </dl>
          </section>

          <section className="symptom-document__section" aria-labelledby="symptom-document-symptom-title">
            <header className="symptom-document__section-header">
              <span><Icon name="heart" size={20} /></span>
              <h4 id="symptom-document-symptom-title">증상 정보</h4>
            </header>
            <dl className="symptom-document__details">
              <div className="symptom-document__symptoms"><dt>증상</dt><dd>{symptoms}</dd></div>
              <div><dt>증상 시작</dt><dd>{formatDocumentDate(startedAt)}</dd></div>
            </dl>
          </section>

          <section className="symptom-document__section" aria-labelledby="symptom-document-medication-title">
            <header className="symptom-document__section-header">
              <span><Icon name="pill" size={20} /></span>
              <h4 id="symptom-document-medication-title">복용 약 정보</h4>
            </header>
            <dl className="symptom-document__details">
              <div><dt>약 이름</dt><dd>{documentData.drugName}</dd></div>
              <div><dt>복용 시각</dt><dd>{formatDocumentDate(takenAt)}</dd></div>
            </dl>
            <div className="symptom-document__images">
              <DocumentImage alt="약 앞면 이미지" label="알약 앞면" src={documentData.frontImageUrl} />
              <DocumentImage alt="약 뒷면 이미지" label="알약 뒷면" src={documentData.backImageUrl} />
            </div>
          </section>

          <div className="symptom-document__created-at">
            <span><Icon name="clock" size={18} />기록 생성</span>
            <strong>{formatDocumentDate(documentData.createdAt)}</strong>
          </div>
          <footer className="symptom-document__footer">
            <Icon name="info" size={19} />
            <p>본 문서는 사용자가 입력한 증상 및 복용 기록을 정리한 참고용 문서입니다.</p>
          </footer>
        </article>
        <div className="document-preview__actions">
          <button
            className="button button--primary button--wide"
            disabled={isSaving}
            onClick={handleSaveDocument}
            type="button"
          >
            <Icon name="download" size={18} />
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
          {saveStatus ? (
            <p
              className={`document-save-status document-save-status--${saveStatus.type}`}
              role={saveStatus.type === 'error' ? 'alert' : 'status'}
            >
              {saveStatus.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
