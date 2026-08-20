import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import alertTriangle from '../../assets/icons/triangle-alert.svg'

export default function DoseConfirmModal({ open, analysisWarning = false, onCancel, onConfirm }) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel, open])

  if (!open) return null

  return createPortal(
    <div
      aria-hidden="false"
      className="dose-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <section aria-labelledby="dose-confirm-title" aria-modal="true" className="dose-modal" role="dialog">
        <button aria-label="복용 확인 모달 닫기" className="dose-modal__close icon-button" onClick={onCancel} type="button">
          <Icon name="close" size={19} />
        </button>
        <div className="dose-modal__icon"><img alt="" src={alertTriangle} /></div>
        <h2 id="dose-confirm-title">{analysisWarning ? 'AI 분석상 복용을 권장하지 않아요' : '복용을 기록할까요?'}</h2>
        <p className="dose-modal__lead">{analysisWarning ? '현재 증상과 사용자 정보를 기준으로 권장하지 않는 약입니다. 복용 전 의사 또는 약사에게 확인해주세요.' : '현재 선택한 약의 복용 기록을 남깁니다.'}</p>
        <div className="dose-modal__actions">
          <Button className="button--grow" onClick={onCancel} variant="outline">취소</Button>
          <Button className="button--grow" onClick={onConfirm} variant="primary">{analysisWarning ? '복용 기록하기' : '기록하기'}</Button>
        </div>
      </section>
    </div>,
    document.body,
  )
}
