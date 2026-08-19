import { Link, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import GlobalNav from './GlobalNav.jsx'

function RouteProgress() {
  const { pathname } = useLocation()
  const isFeature = pathname !== '/'

  return (
    <div className="route-progress" aria-hidden="true">
      <span className={isFeature ? 'is-visible' : ''} />
    </div>
  )
}

export default function AppShell({ children }) {
  const { pathname } = useLocation()
  const isAuthRoute = pathname === '/login' || pathname === '/signup'

  return (
    <div className="site-background">
      <div className="site-orb site-orb--one" />
      <div className="site-orb site-orb--two" />
      <div className={`app-shell ${isAuthRoute ? 'app-shell--auth' : ''}`.trim()}>
        <header className="desktop-header">
          <Link aria-label="알약케어 홈" className="brand-lockup" to="/">
            <span className="brand-mark"><Icon name="pill" size={21} /></span>
            <span>
              <strong>알약케어</strong>
              <small>pill care studio</small>
            </span>
          </Link>
          <GlobalNav />
          <div className="header-status"><span className="status-dot" /> 참고용 정보 서비스</div>
        </header>

        <header className="mobile-header">
          <Link aria-label="알약케어 홈" className="brand-lockup" to="/">
            <span className="brand-mark"><Icon name="pill" size={20} /></span>
            <span><strong>알약케어</strong><small>pill care studio</small></span>
          </Link>
          <span className="mobile-header__status"><Icon name="shield" size={17} /> 참고용</span>
        </header>

        <RouteProgress />
        <main className="page-scroll">
          <div className="page-content">{children}</div>
        </main>

        <div className="mobile-nav-wrap">
          <GlobalNav />
        </div>
      </div>
    </div>
  )
}
