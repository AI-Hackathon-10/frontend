import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'

const actions = [
  { title: '사진으로 알약 찾기', description: '알약 사진을 업로드해 빠르게 식별해요', to: '/identify/image', icon: 'camera', theme: 'blue' },
  { title: '보이스로 알약 찾기', description: '음성으로 증상이나 약 정보를 말해 탐색해요', to: '/identify/voice', icon: 'mic', theme: 'navy' },
  // TODO: 임시 숨김 - 어르신 약 추천
  // { title: '어르신 약 추천', description: '큰 글씨와 쉬운 질문으로 어르신도 편하게', to: '/elderly/voice', icon: 'mic', theme: 'warm' },
]

export default function HomePage() {
  return (
    <div className="page page--home">
      <h2 className="sr-only">알약케어</h2>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__copy">
          <h1 id="home-title">YAKAL<span>.</span></h1>
          <h2><em>약을 찾는</em> 가장 간단한 방법</h2>
          <i className="home-hero__rule" />
          <p>사진 또는 음성으로 빠르게 알약을 찾아<br />필요한 정보를 확인해보세요.</p>
        </div>
        <div className="home-hero__visual" aria-hidden="true">
          <span className="capsule capsule--large" /><span className="capsule capsule--small" />
          <span className="capsule capsule--outline" /><span className="home-hero__orbit" /><span className="home-hero__dots" />
        </div>
      </section>
      <section className="home-actions" aria-labelledby="home-actions-title">
        <div className="home-actions__heading"><i /><h2 id="home-actions-title">어떤 방법으로 찾아볼까요?</h2></div>
        <div className="home-actions__grid">
          {actions.map((action) => (
            <Link className={`home-action home-action--${action.theme}`} key={action.to} to={action.to}>
              <span className="home-action__icon"><Icon name={action.icon} size={25} /></span>
              <span className="home-action__copy"><strong>{action.title}</strong><span>{action.description}</span></span>
              {action.theme === 'blue' ? <span className="home-action__camera-frame" aria-hidden="true"><span className="home-action__capsule" /></span> : <span className="home-action__wave" aria-hidden="true">{Array.from({ length: 19 }, (_, index) => <i key={index} />)}</span>}
              <span className="home-action__arrow"><Icon name="arrowRight" size={18} /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
