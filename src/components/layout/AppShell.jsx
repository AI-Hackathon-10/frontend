import { Link, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import GlobalNav from './GlobalNav.jsx'
import UserMenu from '../user/UserMenu.jsx'
import { useAuth } from '../user/AuthProvider.jsx'

export default function AppShell({ children }) {
  const { pathname } = useLocation()
  const isAuthRoute = pathname === '/login' || pathname === '/signup'
  const isHomeRoute = pathname === '/'
  const { user } = useAuth()

  return (
    <div className="site-background">
      <div className="site-orb site-orb--one" />
      <div className="site-orb site-orb--two" />
      <div className={`app-shell ${isAuthRoute ? 'app-shell--auth' : ''} ${isHomeRoute ? 'app-shell--home' : ''}`.trim()}>
        <header className="desktop-header">
          <Link aria-label="알약케어 홈" className="brand-lockup" to="/">
            <span className="brand-mark"><Icon name="pill" size={21} /></span>
            <span>
              <strong>알약케어</strong>
              <small>pill care studio</small>
            </span>
          </Link>
          <GlobalNav />
          <div className="header-actions">
            {user ? <UserMenu /> : null}
          </div>
        </header>

        <header className="mobile-header">
          <Link aria-label="알약케어 홈" className="brand-lockup" to="/">
            <span className="brand-mark"><Icon name="pill" size={20} /></span>
            <span><strong>알약케어</strong><small>pill care studio</small></span>
          </Link>
        </header>

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
