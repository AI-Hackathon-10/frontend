import { NavLink } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'

const navItems = [
  { label: '홈', to: '/', icon: 'home', end: true },
  { label: '알약 찾기', to: '/identify/image', icon: 'pill' },
  { label: '증상 기록', to: '/symptoms', icon: 'notes' },
]

export default function GlobalNav() {
  return (
    <nav aria-label="주요 메뉴" className="global-nav">
      {navItems.map((item) => (
        <NavLink
          className={({ isActive }) => `global-nav__link ${isActive ? 'is-active' : ''}`}
          end={item.end}
          key={item.to}
          to={item.to}
        >
          <Icon name={item.icon} size={21} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
