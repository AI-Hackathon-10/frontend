import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import { useAuth } from './AuthProvider.jsx'
import LogoutConfirmModal from './LogoutConfirmModal.jsx'

export default function UserMenu() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [isOpen, setOpen] = useState(false)
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false)

  if (!user) return null

  const handleLogoutConfirm = () => {
    logout()
    setLogoutModalOpen(false)
    setOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div className="user-menu">
        <button
          aria-controls="account-menu"
          aria-expanded={isOpen}
          aria-label="내 메뉴"
          className="user-menu__toggle"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span className="user-menu__avatar"><Icon name="shield" size={17} /></span>
          <span className="user-menu__name">{user.name}</span>
          <Icon name="chevronDown" size={15} />
        </button>

        {isOpen ? (
          <div className="user-menu__panel" id="account-menu">
            <div className="user-menu__profile">
              <span className="eyebrow">내 계정</span>
              <strong>{user.name}</strong>
              <small>{user.id}</small>
            </div>
            <Link onClick={() => setOpen(false)} to="/mypage"><Icon name="notes" size={17} /> 마이페이지</Link>
            <Link onClick={() => setOpen(false)} to="/password"><Icon name="shield" size={17} /> 비밀번호 수정</Link>
            <button onClick={() => { setOpen(false); setLogoutModalOpen(true) }} type="button"><Icon name="arrowRight" size={17} /> 로그아웃</button>
          </div>
        ) : null}
      </div>

      <LogoutConfirmModal
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        open={isLogoutModalOpen}
      />
    </>
  )
}
