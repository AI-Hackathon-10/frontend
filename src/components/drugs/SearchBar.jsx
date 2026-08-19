import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'

export default function SearchBar({ value = '', placeholder = '의약품명이나 증상을 검색해 보세요' }) {
  return (
    <Link aria-label="의약품 검색 결과로 이동" className="search-bar" to="/search/results">
      <Icon name="search" size={21} />
      <span className={value ? 'search-bar__value' : 'search-bar__placeholder'}>{value || placeholder}</span>
      {value ? <span className="search-bar__clear">×</span> : <span className="search-bar__shortcut">검색</span>}
    </Link>
  )
}
