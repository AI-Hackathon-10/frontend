import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import AuthField from '../components/user/AuthField.jsx'
import { useAuth } from '../components/user/AuthProvider.jsx'
import Icon from '../components/ui/Icon.jsx'

export default function PasswordChangePage() {
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const canSubmit = Boolean(currentPassword && newPassword && newPasswordConfirmation)

  const handleSubmit = (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (newPassword !== newPasswordConfirmation) {
      setErrorMessage('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (!changePassword(currentPassword, newPassword)) {
      setErrorMessage('현재 비밀번호가 일치하지 않습니다.')
      return
    }

    setSuccessMessage('비밀번호가 변경되었습니다.')
    setCurrentPassword('')
    setNewPassword('')
    setNewPasswordConfirmation('')
  }

  return (
    <div className="page page--account page--password">
      <PageHeader
        description="현재 비밀번호를 확인한 뒤 새로운 비밀번호를 설정할 수 있어요."
        eyebrow="계정 보안"
        title="비밀번호 수정"
      />

      <section className="account-form-card">
        <div className="account-form-card__intro"><span className="account-form-card__icon"><Icon name="shield" size={22} /></span><div><strong>안전한 비밀번호 관리</strong><p>이번 화면에서는 입력값을 저장하지 않는 목업 흐름만 제공합니다.</p></div></div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <AuthField autoComplete="current-password" id="change-current-password" label="현재 비밀번호" onChange={(event) => setCurrentPassword(event.target.value)} placeholder="현재 비밀번호를 입력해 주세요" type="password" value={currentPassword} />
          <AuthField autoComplete="new-password" id="change-new-password" label="새 비밀번호" onChange={(event) => setNewPassword(event.target.value)} placeholder="새 비밀번호를 입력해 주세요" type="password" value={newPassword} />
          <AuthField autoComplete="new-password" id="change-new-password-confirmation" label="새 비밀번호 확인" onChange={(event) => setNewPasswordConfirmation(event.target.value)} placeholder="새 비밀번호를 한 번 더 입력해 주세요" type="password" value={newPasswordConfirmation} />
          <button className="button button--primary button--wide auth-form__submit" disabled={!canSubmit} type="submit">비밀번호 변경 <Icon name="check" size={18} /></button>
        </form>
        {errorMessage ? <p className="auth-feedback auth-feedback--error" role="alert">{errorMessage}</p> : null}
        {successMessage ? <p className="auth-feedback auth-feedback--success" role="status"><Icon name="check" size={16} /> {successMessage}</p> : null}
      </section>
    </div>
  )
}
