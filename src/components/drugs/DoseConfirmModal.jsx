import { useEffect } from 'react'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'

export default function DoseConfirmModal({ open, drug, onCancel, onConfirm }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, open])

  if (!open) return null

  return (
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
        <div className="dose-modal__icon"><Icon name="alert" size={23} /></div>
        <span className="eyebrow">{drug?.name ?? '알약'} 복용 전</span>
        <h2 id="dose-confirm-title">복용 전 확인해주세요</h2>
        <p className="dose-modal__lead">알약 사진만으로는 사용기한과 실제 제품을 확인할 수 없어요.</p>
        <div className="dose-modal__warning">
          <p>현재 알약의 사용기한을 확인할 수 없습니다.</p>
          <p>AI가 식별한 의약품 정보는 실제 제품과 다를 수 있습니다.</p>
        </div>
        <p className="dose-modal__note">제품 포장 또는 전문가 확인 없이 AI 결과만으로 복용 여부를 판단하지 마세요.</p>
        <div className="dose-modal__actions">
          <Button className="button--grow" onClick={onCancel} variant="outline">취소</Button>
          <Button className="button--grow" onClick={onConfirm} variant="primary">확인 후 복용 기록</Button>
        </div>
      </section>
    </div>
  )
}
