import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import Icon from '../components/ui/Icon.jsx'

const filterGroups = [
  { title: '제형', items: [['ALL', '전체'], ['pill', '정제'], ['capsule', '경질캡슐'], ['capsule-yellow', '연질캡슐'], ['other', '기타']] },
  { title: '분할선', items: [['ALL', '전체'], ['none', '선없음'], ['plus', '십자(+)형'], ['minus', '일자(-)형'], ['other', '기타']] },
  { title: '모양', items: [['ALL', '전체'], ['circle', '원형'], ['oval', '타원형'], ['oblong', '장방형'], ['semi', '반원형'], ['triangle', '삼각형'], ['square', '사각형'], ['diamond', '마름모형']] },
]

function FilterTile({ visual, label, selected = false }) {
  return <div className={`filter-tile ${selected ? 'is-selected' : ''}`}><span className={`filter-tile__visual filter-tile__visual--${visual}`} aria-hidden="true">{visual === 'ALL' ? 'ALL' : visual === 'other' ? '?' : null}</span><span>{label}</span></div>
}

export default function ShapeSearchPage() {
  return (
    <div className="page page--shape">
      <PageHeader eyebrow="알약 식별" title="알약 외형으로 찾기" description="기억나는 특징을 선택해 후보를 좁혀 보세요." />
      <section className="shape-intro"><span className="shape-intro__icon"><Icon name="grid" size={25} /></span><div><strong>천천히 골라도 괜찮아요</strong><p>선택하지 않은 항목은 전체 조건으로 검색됩니다.</p></div></section>
      <div className="filter-groups">
        {filterGroups.map((group) => (
          <section className="filter-group" key={group.title} aria-labelledby={`filter-${group.title}`}>
            <div className="section-heading section-heading--tight"><h2 id={`filter-${group.title}`}>{group.title}</h2><span>전체 선택됨</span></div>
            <div className="filter-grid">{group.items.map(([visual, label], index) => <FilterTile key={`${group.title}-${label}`} label={label} selected={index === 0} visual={visual} />)}</div>
          </section>
        ))}
      </div>
      <div className="shape-actions"><button className="button button--outline" type="button">초기화</button><Link className="button button--primary" to="/search/results"><span>검색하기</span><Icon name="arrowRight" size={18} /></Link></div>
      <p className="page-footnote"><Icon name="shield" size={15} /> 실제 식별 결과는 공식 의약품 정보를 기준으로 확인하세요.</p>
    </div>
  )
}
