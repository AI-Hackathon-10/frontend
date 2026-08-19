import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import PillIllustration from './PillIllustration.jsx'

export default function OwnedDrugItem({ drug }) {
  return (
    <Link className="owned-drug-item" to={`/drugs/${drug.id}`}>
      <span className="owned-drug-item__visual"><PillIllustration imprint={drug.imprintFront} size="small" variant={drug.imageVariant} /></span>
      <span className="owned-drug-item__copy">
        <strong>{drug.name}</strong>
        <span>{drug.effect}</span>
      </span>
      <Icon name="chevronRight" size={17} />
    </Link>
  )
}
