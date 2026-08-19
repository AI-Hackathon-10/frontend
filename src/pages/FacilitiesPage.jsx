import PageHeader from '../components/layout/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Icon from '../components/ui/Icon.jsx'
import FacilityMap from '../components/facilities/FacilityMap.jsx'
import FacilityCard from '../components/facilities/FacilityCard.jsx'
import { FACILITIES } from '../data/mockData.js'

export default function FacilitiesPage() {
  return (
    <div className="page page--facilities">
      <PageHeader eyebrow="응급의료기관 탐색" title="가까운 응급의료기관" description="현재 위치를 기준으로 한 예시 화면입니다." action={<Badge tone="mint"><Icon name="location" size={13} /> 위치 목업</Badge>} />
      <section className="facility-summary"><div><span className="eyebrow">주변 검색</span><h2>지금 확인할 수 있는 기관</h2></div><span className="facility-summary__count"><strong>{FACILITIES.length}</strong>곳</span></section>
      <FacilityMap facilities={FACILITIES} />
      <div className="facility-toolbar"><div className="toolbar-tabs"><span className="is-active">응급의료기관</span><span>가까운 순</span></div><span className="toolbar-note"><Icon name="clock" size={14} /> 운영 정보 확인 필요</span></div>
      <div className="facility-list">{FACILITIES.map((facility, index) => <FacilityCard facility={facility} key={facility.id} selected={index === 0} />)}</div>
      <aside className="emergency-note"><span><Icon name="alert" size={18} /></span><p><strong>위급한 상황인가요?</strong><br />의식이 없거나 호흡이 곤란하면 즉시 119에 연락하세요.</p></aside>
      <p className="page-footnote"><Icon name="shield" size={15} /> 기관 위치와 운영 여부는 실제 공공데이터 연동 후 갱신됩니다.</p>
    </div>
  )
}
