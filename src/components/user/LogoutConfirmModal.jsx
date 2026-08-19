import { useEffect } from 'react'
import Icon from '../ui/Icon.jsx'

export default function LogoutConfirmModal({ open, onCancel, onConfirm }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, open])

  if (!open) return null

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) onCancel()
  }

  return (
    <div className="account-modal-backdrop" onMouseDown={handleBackdropMouseDown}>
      <div
        aria-labelledby="logout-modal-title"
        aria-modal="true"
        className="account-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button aria-label="로그아웃 확인 닫기" className="modal-close" onClick={onCancel} type="button">
          <Icon name="close" size={19} />
        </button>
        <span className="account-modal__icon"><Icon name="shield" size={21} /></span>
        <h2 id="logout-modal-title">로그아웃 확인</h2>
        <p>현재 화면에서 로그아웃할까요?</p>
        <div className="account-modal__actions">
          <button className="button button--outline" onClick={onCancel} type="button">아니오</button>
          <button className="button button--primary" onClick={onConfirm} type="button">확인</button>
        </div>
      </div>
    </div>
  )
}
