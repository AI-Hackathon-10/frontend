import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthField from '../components/user/AuthField.jsx'
import AuthPageLayout from '../components/user/AuthPageLayout.jsx'
import Icon from '../components/ui/Icon.jsx'

const INITIAL_FORM = {
  gender: '',
  birthDate: '',
  name: '',
  userId: '',
  password: '',
  passwordConfirm: '',
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const isPasswordMismatch = Boolean(form.passwordConfirm && form.password !== form.passwordConfirm)
  const canSubmit = Object.values(form).every(Boolean) && !isPasswordMismatch

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return

    navigate('/login', {
      state: { registeredId: form.userId },
    })
  }

  return (
    <AuthPageLayout
      description="기본 정보를 입력하면 나만의 알약케어를 시작할 수 있어요."
      eyebrow="새 계정 만들기"
      title="회원가입"
      footer={<>이미 계정이 있나요? <Link to="/login">로그인</Link></>}
    >
      <form className="auth-form auth-form--signup" onSubmit={handleSubmit}>
        <div className="auth-form__grid">
          <label className="auth-field" htmlFor="signup-gender">
            <span className="auth-field__label">성별</span>
            <select id="signup-gender" name="gender" onChange={updateField('gender')} value={form.gender}>
              <option value="">성별을 선택해 주세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
              <option value="undisclosed">선택하지 않음</option>
            </select>
          </label>
          <AuthField id="signup-birthDate" label="생년월일" onChange={updateField('birthDate')} type="date" value={form.birthDate} />
        </div>

        <AuthField autoComplete="name" id="signup-name" label="이름" onChange={updateField('name')} placeholder="이름을 입력해 주세요" value={form.name} />
        <AuthField autoComplete="username" id="signup-userId" label="아이디" onChange={updateField('userId')} placeholder="영문과 숫자로 입력해 주세요" value={form.userId} />
        <AuthField autoComplete="new-password" id="signup-password" label="비밀번호" onChange={updateField('password')} placeholder="8자 이상 입력해 주세요" type="password" value={form.password} />
        <AuthField autoComplete="new-password" id="signup-passwordConfirm" label="비밀번호 확인" onChange={updateField('passwordConfirm')} placeholder="비밀번호를 한 번 더 입력해 주세요" type="password" value={form.passwordConfirm} />

        {isPasswordMismatch ? <p className="auth-field__error" role="alert">비밀번호가 일치하지 않습니다.</p> : null}

        <button className="button button--primary button--wide auth-form__submit" disabled={!canSubmit} type="submit">
          회원가입 완료
          <Icon name="arrowRight" size={18} />
        </button>
      </form>
      <p className="auth-form__note">입력 정보는 API 연결 전까지 브라우저나 서버에 저장되지 않습니다.</p>
    </AuthPageLayout>
  )
}
