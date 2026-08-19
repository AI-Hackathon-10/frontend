import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import Icon from '../components/ui/Icon.jsx'
import DrugResultHero from '../components/drugs/DrugResultHero.jsx'
import OwnedDrugItem from '../components/drugs/OwnedDrugItem.jsx'
import DoseConfirmModal from '../components/drugs/DoseConfirmModal.jsx'
import { DEMO_IDENTIFY_RESULT, DRUGS, getDrugById } from '../data/mockData.js'

export default function SearchResultsPage() {
  const location = useLocation()
  const result = location.state ?? DEMO_IDENTIFY_RESULT
  const symptoms = result.symptoms?.length ? result.symptoms : DEMO_IDENTIFY_RESULT.symptoms
  const primaryDrug = getDrugById(result.drugId ?? DEMO_IDENTIFY_RESULT.drugId)
  const ownedDrugs = DRUGS.filter((drug) => drug.id !== primaryDrug.id).slice(0, 2)
  const [isDoseModalOpen, setDoseModalOpen] = useState(false)
  const [doseRecorded, setDoseRecorded] = useState(false)

  return (
    <div className="page page--results page--narrow">
      <PageHeader eyebrow="알약 식별 결과" title="검색 결과" description="선택한 증상을 기준으로 확인한 예시 결과예요." backTo="/identify/image" />

      <section aria-labelledby="selected-symptoms-title" className="results-symptom-card">
        <div className="section-heading section-heading--tight">
          <div>
            <span className="eyebrow">현재 상태</span>
            <h2 id="selected-symptoms-title">현재 선택한 증상</h2>
          </div>
          <Icon name="notes" size={21} />
        </div>
        <div className="results-symptom-list">
          {symptoms.map((symptom) => <span className="result-symptom-chip" key={symptom}>{symptom}</span>)}
        </div>
      </section>

      <section aria-labelledby="related-drug-title" className="results-primary-section">
        <div className="section-heading section-heading--tight">
          <div>
            <span className="eyebrow">현재 증상과 관련된 약</span>
            <h2 id="related-drug-title">가장 관련 있는 약</h2>
          </div>
          <span className="results-count">Mock 01</span>
        </div>
        <DrugResultHero drug={primaryDrug} />
      </section>

      <section aria-labelledby="owned-drugs-title" className="owned-drugs-section">
        <div className="section-heading section-heading--tight">
          <div>
            <span className="eyebrow">보유약</span>
            <h2 id="owned-drugs-title">다른 보유약</h2>
          </div>
          <span className="results-count">{ownedDrugs.length}개</span>
        </div>
        <div className="owned-drugs-list">
          {ownedDrugs.map((drug) => <OwnedDrugItem drug={drug} key={drug.id} />)}
        </div>
      </section>

      <div className="results-actions">
        <Link className="button button--outline button--grow" to="/identify/image">
          <Icon name="arrowLeft" size={17} />
          <span>다시 찾기</span>
        </Link>
        <button className="button button--primary button--grow" onClick={() => setDoseModalOpen(true)} type="button">
          <Icon name="check" size={17} />
          <span>복용하기</span>
        </button>
      </div>

      {doseRecorded && <p className="dose-recorded" role="status"><Icon name="check" size={16} /> 복용 기록이 저장되었습니다</p>}

      <p className="page-footnote"><Icon name="shield" size={15} /> 약품 정보와 복용 관련 안내는 참고용 예시입니다.</p>

      <DoseConfirmModal
        drug={primaryDrug}
        onCancel={() => setDoseModalOpen(false)}
        onConfirm={() => {
          setDoseModalOpen(false)
          setDoseRecorded(true)
        }}
        open={isDoseModalOpen}
      />
    </div>
  )
}
