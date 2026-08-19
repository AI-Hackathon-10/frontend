import { Link, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'

const navItems = [
  { label: '홈', to: '/', icon: 'home', end: true },
  { label: '알약 찾기', to: '/identify/image', icon: 'pill' },
  { label: '증상 기록', to: '/symptoms', icon: 'notes' },
]

export default function GlobalNav() {
  const { pathname } = useLocation()

  return (
    <nav aria-label="주요 메뉴" className="global-nav">
      {navItems.map((item) => {
        const isMedicationResult = item.to === '/identify/image' && pathname === '/search/results'
        const isActive = item.end ? pathname === item.to : pathname.startsWith(item.to)

        return (
        <Link
          className={`global-nav__link ${isActive || isMedicationResult ? 'is-active' : ''}`}
          key={item.to}
          to={item.to}
        >
          <Icon name={item.icon} size={21} />
          <span>{item.label}</span>
        </Link>
        )
      })}
    </nav>
  )
}
