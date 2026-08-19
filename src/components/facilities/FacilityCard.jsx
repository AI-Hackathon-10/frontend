import Icon from '../ui/Icon.jsx'
import Badge from '../ui/Badge.jsx'

export default function FacilityCard({ facility, selected = false }) {
  return (
    <article className={`facility-card ${selected ? 'is-selected' : ''}`}>
      <div className="facility-card__topline">
        <Badge tone={selected ? 'blue' : 'soft'}>{facility.type}</Badge>
        <span className="facility-card__distance"><Icon name="location" size={14} /> {facility.distance}</span>
      </div>
      <h3>{facility.name}</h3>
      <p className="facility-card__address">{facility.address}</p>
      <div className="facility-card__status"><span className="status-dot status-dot--amber" />{facility.status}</div>
    </article>
  )
}
