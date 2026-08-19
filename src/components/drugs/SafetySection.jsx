import Badge from '../ui/Badge.jsx'
import Icon from '../ui/Icon.jsx'

export default function SafetySection({ drug }) {
  return (
    <section className="safety-section" aria-labelledby="safety-title">
      <div className="section-heading section-heading--tight">
        <div>
          <span className="eyebrow eyebrow--warning"><Icon name="alert" size={14} /> 확인이 필요한 정보</span>
          <h2 id="safety-title">주의 및 특수 분류</h2>
        </div>
        <Badge tone="warning">참고용</Badge>
      </div>
      <div className="caution-list">
        {drug.cautions.map((caution, index) => (
          <div className="caution-item" key={caution}>
            <span className="caution-item__icon">{index === 0 ? <Icon name="alert" size={16} /> : <Icon name="shield" size={16} />}</span>
            <p>{caution}</p>
          </div>
        ))}
      </div>
      <div className="tag-cloud">
        {drug.cautionTags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <p className="small-note">최신 정보와 개인별 복용 방법은 의사·약사와 확인하세요.</p>
    </section>
  )
}
