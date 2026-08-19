import { useEffect } from 'react'
import Button from '../ui/Button.jsx'
import Icon from '../ui/Icon.jsx'
import alertTriangle from '../../assets/icons/triangle-alert.svg'

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
        <div className="dose-modal__icon"><img alt="" src={alertTriangle} /></div>
        <h2 id="dose-confirm-title">유효기간을 확인할 수 없어요</h2>
        <p className="dose-modal__lead">유효기간을 확인할 수 없는 의약품은 복용을 권장하기 어렵습니다. 복용 전 의사 또는 약사에게 확인해주세요.</p>
        <div className="dose-modal__actions">
          <Button className="button--grow" onClick={onCancel} variant="outline">취소</Button>
          <Button className="button--grow" onClick={onConfirm} variant="primary">그래도 기록하기</Button>
        </div>
      </section>
    </div>
  )
}
