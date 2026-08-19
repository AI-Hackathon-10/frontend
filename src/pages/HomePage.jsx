import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'
import Badge from '../components/ui/Badge.jsx'
import PillIllustration from '../components/drugs/PillIllustration.jsx'
import SearchBar from '../components/drugs/SearchBar.jsx'

const quickActions = [
  { eyebrow: '사진으로 찾기', title: '알약 사진을 올려\n정보를 확인해요', description: '앞·뒷면을 함께 확인하는 안전한 식별 흐름', to: '/identify/image', icon: 'camera', theme: 'blue' },
  { eyebrow: '외형으로 찾기', title: '모양과 식별문자로\n찾아볼까요?', description: '기억나는 특징을 차근차근 선택해요', to: '/identify/shape', icon: 'grid', theme: 'navy' },
]

export default function HomePage() {
  return (
    <div className="page page--home">
      <h1 className="sr-only">알약케어</h1>
      <section className="home-welcome">
        <div>
          <span className="eyebrow">AI로 더 똑똑하게, 오늘의</span>
          <h2>오늘의 알약 케어</h2>
          <p>아픈 순간에도 필요한 정보만 편안하게 확인할 수 있도록 도와드려요.</p>
        </div>
        <div className="home-welcome__halo" aria-hidden="true">
          <span className="home-welcome__ring" />
          <PillIllustration imprint="PM" size="medium" variant="pink" />
          <Icon name="sparkle" size={20} />
        </div>
      </section>

      <SearchBar />

      <section className="quick-actions" aria-labelledby="quick-actions-title">
        <div className="section-heading section-heading--tight">
          <div><span className="eyebrow">알약 찾기</span><h2 id="quick-actions-title">어떤 방법으로 찾아볼까요?</h2></div>
          <Badge tone="blue"><Icon name="sparkle" size={13} /> 간편 검색</Badge>
        </div>
        <div className="quick-actions__grid">
          {quickActions.map((action) => (
            <Link className={`action-card action-card--${action.theme}`} key={action.to} to={action.to}>
              <span className="action-card__icon"><Icon name={action.icon} size={24} /></span>
              <span className="action-card__copy"><span className="action-card__eyebrow">{action.eyebrow}</span><strong>{action.title.split('\n').map((line) => <span key={line}>{line}</span>)}</strong><small>{action.description}</small></span>
              <span className="action-card__arrow"><Icon name="arrowRight" size={18} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="support-grid" aria-label="도움 기능">
        <Link className="support-card support-card--mint" to="/symptoms"><span className="support-card__icon"><Icon name="notes" size={21} /></span><span><strong>증상 기록하기</strong><small>지금 상태를 정리해요</small></span><Icon name="chevronRight" size={17} /></Link>
        <Link className="support-card support-card--lavender" to="/facilities"><span className="support-card__icon"><Icon name="emergency" size={21} /></span><span><strong>응급실 찾기</strong><small>가까운 기관을 확인해요</small></span><Icon name="chevronRight" size={17} /></Link>
      </section>

      <aside className="reference-note"><Icon name="shield" size={18} /><p>본 서비스의 정보는 참고용입니다. 복용 전 반드시 의사·약사와 상담하세요.</p></aside>
    </div>
  )
}
