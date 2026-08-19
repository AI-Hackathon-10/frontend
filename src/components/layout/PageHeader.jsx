import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'

export default function PageHeader({ eyebrow, title, description, backTo = '/', action }) {
  return (
    <header className="page-header">
      {backTo || action ? (
        <div className="page-header__topline">
          {backTo ? <Link aria-label="이전 화면으로 이동" className="back-link" to={backTo}><Icon name="arrowLeft" size={19} /><span>뒤로</span></Link> : null}
          {action}
        </div>
      ) : null}
      <div className="page-header__copy">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
    </header>
  )
}
