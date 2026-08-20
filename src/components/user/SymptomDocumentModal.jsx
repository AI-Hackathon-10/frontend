import { useEffect, useState } from 'react'
import Icon from '../ui/Icon.jsx'

const DEFAULT_DOCUMENT_DATA = {
  userName: '홍길동',
  birthDate: '1995-08-19',
  drugName: '프리메정',
}

function formatDocumentDate(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function DocumentImage({ alt, label, src }) {
  if (src) {
    return <img alt={alt} className="symptom-document__image" src={src} />
  }

  return (
    <div aria-label={alt} className="symptom-document__image-placeholder" role="img">
      <Icon name="image" size={28} />
      <strong>{label}</strong>
      <small>이미지 연결 전</small>
    </div>
  )
}

export default function SymptomDocumentModal({ open, report, onClose }) {
  const [saveStatus, setSaveStatus] = useState('')

  useEffect(() => {
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

  const documentData = { ...DEFAULT_DOCUMENT_DATA, ...report }
  const symptoms = documentData.symptoms?.join(' · ') || '-'
  const startedAt = documentData.startedAt ?? documentData.createdAt
  const takenAt = documentData.takenAt ?? documentData.createdAt

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  const handleSaveDocument = () => {
    setSaveStatus('디바이스 저장 기능은 준비 중입니다.')
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
        <p className="account-modal__description">의료진에게 보여줄 수 있는 증상 기록 문서입니다.</p>
        <article aria-label="증상 기록 문서" className="symptom-document">
          <header className="symptom-document__header">
            <div>
              <span className="eyebrow">증상 문서</span>
              <h3>나의 증상 기록</h3>
            </div>
            <Icon name="notes" size={25} />
          </header>

          <section className="symptom-document__section" aria-labelledby="symptom-document-user-title">
            <h4 id="symptom-document-user-title">사용자 정보</h4>
            <dl className="symptom-document__details">
              <div><dt>이름</dt><dd>{documentData.userName}</dd></div>
              <div><dt>생년월일</dt><dd>{documentData.birthDate}</dd></div>
            </dl>
          </section>

          <section className="symptom-document__section" aria-labelledby="symptom-document-symptom-title">
            <h4 id="symptom-document-symptom-title">증상 및 복용 기록</h4>
            <dl className="symptom-document__details">
              <div><dt>증상</dt><dd>{symptoms}</dd></div>
              <div><dt>증상 시작 시점</dt><dd>{formatDocumentDate(startedAt)}</dd></div>
              <div><dt>복용한 약품</dt><dd>{documentData.drugName}</dd></div>
              <div><dt>복용 시점</dt><dd>{formatDocumentDate(takenAt)}</dd></div>
            </dl>
          </section>

          <section className="symptom-document__section" aria-labelledby="symptom-document-image-title">
            <h4 id="symptom-document-image-title">알약 판별 이미지</h4>
            <div className="symptom-document__images">
              <DocumentImage alt="약 앞면 이미지" label="앞면 이미지" src={documentData.frontImageUrl} />
              <DocumentImage alt="약 뒷면 이미지" label="뒷면 이미지" src={documentData.backImageUrl} />
            </div>
          </section>

          <footer className="symptom-document__footer">
            문서 생성 시점: {formatDocumentDate(documentData.createdAt)}
          </footer>
        </article>
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
