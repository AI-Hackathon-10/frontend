import { Link } from 'react-router-dom'
import Icon from '../ui/Icon.jsx'
import PillIllustration from '../illustrations/PillIllustration.jsx'

export default function DrugResultHero({ drug }) {
  return (
    <article className="drug-result-hero">
      <div className="drug-result-hero__visual">
        <span className="drug-result-hero__label">AI 식별 예시</span>
        <div className="drug-result-hero__scene">
          <span className="drug-result-hero__grid" aria-hidden="true" />
          <PillIllustration imprint={drug.imprintFront} size="large" variant={drug.imageVariant} />
        </div>
        <span className="drug-result-hero__caption">앞면 {drug.imprintFront} · {drug.shape} · {drug.color}</span>
      </div>
      <div className="drug-result-hero__content">
        <div className="drug-result-hero__eyebrow"><Icon name="check" size={14} /> 가장 관련 있는 약</div>
        <h3>{drug.name}</h3>
        <p className="drug-result-hero__effect">{drug.effect}</p>
        <div className="drug-result-hero__expiry"><Icon name="alert" size={16} /><span>{drug.expiryStatus}</span></div>
        <Link className="button button--outline button--small" to={`/drugs/${drug.id}`}>
          <span>상세 정보</span>
          <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </article>
  )
}
