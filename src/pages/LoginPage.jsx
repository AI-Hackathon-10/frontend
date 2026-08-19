import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthField from '../components/user/AuthField.jsx'
import AuthPageLayout from '../components/user/AuthPageLayout.jsx'
import { useAuth } from '../components/user/AuthProvider.jsx'
import Icon from '../components/ui/Icon.jsx'
import { ApiError } from '../api/client.js'

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [userId, setUserId] = useState(location.state?.registeredId ?? '')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const canSubmit = Boolean(userId.trim() && password)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit || isSubmitting) return

    setSubmitError('')
    setIsSubmitting(true)
    try {
      await login({ id: userId.trim(), password })
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : '로그인 요청 중 문제가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageLayout
      description="등록한 아이디와 비밀번호를 입력해 주세요."
      eyebrow="내 정보 확인"
      title="로그인"
      footer={<>아직 계정이 없나요? <Link to="/signup">회원가입</Link></>}
    >
      {location.state?.registeredId ? (
        <p className="auth-feedback auth-feedback--success" role="status">
          <Icon name="check" size={16} /> 회원가입이 완료되었습니다. 입력한 아이디로 로그인해 주세요.
        </p>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthField
          autoComplete="username"
          id="login-id"
          label="아이디"
          onChange={(event) => setUserId(event.target.value)}
          placeholder="아이디를 입력해 주세요"
          value={userId}
        />
        <AuthField
          autoComplete="current-password"
          id="login-password"
          label="비밀번호"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호를 입력해 주세요"
          type="password"
          value={password}
        />
        {submitError ? <p className="auth-feedback" role="alert">{submitError}</p> : null}

        <button className="button button--primary button--wide auth-form__submit" disabled={!canSubmit || isSubmitting} type="submit">
          {isSubmitting ? '로그인 중...' : '로그인'}
          <Icon name="arrowRight" size={18} />
        </button>
      </form>
    </AuthPageLayout>
  )
}
