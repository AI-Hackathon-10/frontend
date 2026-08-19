import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import PillIllustration from './PillIllustration.jsx'
import Badge from '../ui/Badge.jsx'

export default function DrugCard({ drug, compact = false }) {
  return (
    <Link className={`drug-card ${compact ? 'drug-card--compact' : ''}`} to={`/drugs/${drug.id}`}>
      <div className="drug-card__visual">
        <PillIllustration imprint={drug.imprintFront} size={compact ? 'small' : 'medium'} variant={drug.imageVariant} />
      </div>
      <div className="drug-card__content">
        <div className="drug-card__meta"><Badge tone="soft">예시 데이터</Badge><span>{drug.classification}</span></div>
        <h3>{drug.name}</h3>
        <p>{drug.manufacturer}</p>
        <div className="drug-card__tags"><span>{drug.shape}</span><span>{drug.color}</span><span>{drug.imprintFront}</span></div>
      </div>
      <Icon className="drug-card__arrow" name="chevronRight" size={18} />
    </Link>
  )
}
