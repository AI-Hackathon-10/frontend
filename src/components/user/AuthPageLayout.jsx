import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'

export default function AuthPageLayout({ eyebrow, title, description, children, footer }) {
  return (
    <div className="page page--auth">
      <div className="auth-layout">
        <section className="auth-intro" aria-label="알약케어 서비스 안내">
          <span className="auth-intro__eyebrow"><Icon name="shield" size={15} /> 안전한 건강 정보 정리</span>
          <h2>필요한 순간,<br /><em>차분하게</em> 확인해요.</h2>
          <p>알약 정보와 증상 기록을 한곳에서 관리할 수 있도록 도와드릴게요.</p>
          <div className="auth-intro__steps" aria-label="서비스 이용 흐름">
            <span><b>01</b> 증상 기록</span>
            <span><b>02</b> 알약 확인</span>
            <span><b>03</b> 정보 정리</span>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card__header">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
          {footer ? <div className="auth-card__footer">{footer}</div> : null}
        </section>
      </div>

      <p className="page-footnote"><Icon name="shield" size={15} /> API 연결 전 제공되는 화면이며 입력 정보는 저장되지 않습니다.</p>
      <Link className="auth-home-link" to="/" aria-label="알약케어 홈으로 돌아가기"><Icon name="arrowLeft" size={15} /> 홈으로 돌아가기</Link>
    </div>
  )
}
