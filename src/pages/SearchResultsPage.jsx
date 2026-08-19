import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import PillIllustration from '../components/drugs/PillIllustration.jsx'
import DoseConfirmModal from '../components/drugs/DoseConfirmModal.jsx'
import { DEMO_IDENTIFY_RESULT, EXPIRATION_STATUS, MOCK_MEDICATION_RECORDS, getDrugById } from '../data/mockData.js'
import alertTriangle from '../assets/icons/triangle-alert.svg'

function IdentificationState({ status, onRetry }) {
  if (status === 'loading') {
    return (
      <section className="identify-result-state" aria-live="polite">
        <span className="identify-result-state__spinner" aria-hidden="true" />
        <h2>알약을 판별하고 있어요</h2>
        <p>이미지의 모양과 식별 문자를 확인하는 중입니다.</p>
      </section>
    )
  }

  return (
    <section className="identify-result-state identify-result-state--error" role="alert">
      <span className="identify-result-state__icon"><Icon name="alert" size={24} /></span>
      <h2>알약을 판별하지 못했어요</h2>
      <p>사진이 흐리거나 식별 문자가 가려졌을 수 있어요. 다른 사진으로 다시 시도해주세요.</p>
      <Button icon="search" onClick={onRetry} variant="outline">다시 시도하기</Button>
    </section>
  )
}

export default function SearchResultsPage() {
  const location = useLocation()
  const result = { ...DEMO_IDENTIFY_RESULT, ...location.state }
  const [identificationStatus, setIdentificationStatus] = useState(result.status)
  const [isDoseModalOpen, setDoseModalOpen] = useState(false)
  const [records, setRecords] = useState(MOCK_MEDICATION_RECORDS[result.drugId] ?? [])
  const drug = getDrugById(result.drugId)
  const expiration = EXPIRATION_STATUS[drug.expirationStatus] ?? EXPIRATION_STATUS.unknown
  const symptoms = result.symptoms?.length ? result.symptoms : DEMO_IDENTIFY_RESULT.symptoms

  const recordDose = () => {
    setRecords((current) => [
      { id: `mock-dose-${Date.now()}`, takenAt: new Date().toISOString(), note: '목업 복용 기록' },
      ...current,
    ])
  }

  const handleTakeMedication = () => {
    if (drug.expirationStatus === 'unknown') {
      setDoseModalOpen(true)
      return
    }
    if (drug.expirationStatus === 'expired') return
    recordDose()
  }

  const handleConfirmRecord = () => {
    setDoseModalOpen(false)
    recordDose()
  }

  if (identificationStatus !== 'success') {
    return (
      <div className="page page--results page--narrow">
        <PageHeader eyebrow="알약 식별" title="판별 결과" description="사진을 바탕으로 알약 정보를 확인합니다." backTo="/identify/image" />
        <IdentificationState status={identificationStatus} onRetry={() => setIdentificationStatus('loading')} />
        <p className="page-footnote"><Icon name="shield" size={15} /> 판별 결과는 참고 정보이며 실제 제품과 다를 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="page page--results page--narrow">
      <PageHeader eyebrow="알약 식별" title="판별 결과" description="사진을 바탕으로 확인한 참고 정보예요." backTo={null} />

      <article className="compact-result" aria-labelledby="identified-drug-title">
        <div className="compact-result__topline">
          <div className="results-symptom-list" aria-label="선택한 증상">{symptoms.map((symptom) => <span className="result-symptom-chip" key={symptom}>{symptom}</span>)}</div>
          <div className={`compact-result__expiration compact-result__expiration--${expiration.tone}`}><img alt="" src={alertTriangle} /><span>{expiration.label}</span></div>
        </div>
        <div className="compact-result__visual"><PillIllustration imprint={drug.imprintFront} size="large" variant={drug.imageVariant} /></div>
        <div className="compact-result__summary">
          <div className="compact-result__name"><span className="eyebrow">AI 식별 결과</span><h2 id="identified-drug-title">{drug.name}</h2></div>
          <div className="compact-result__similarity"><div><span>이미지 유사도</span><strong>{drug.similarity}%</strong></div><span className="compact-result__similarity-track" aria-hidden="true"><span style={{ width: `${drug.similarity}%` }} /></span></div>
          <dl className="compact-result__info"><div><dt>효능</dt><dd>{drug.effect}</dd></div><div><dt>복용방법</dt><dd>{drug.usage}</dd></div></dl>
          <div className="compact-result__caution"><img alt="" src={alertTriangle} /><div><strong>주의사항</strong><p>{drug.cautions.join(' ')}</p></div></div>
        </div>
      </article>

      <section className="medication-history" aria-labelledby="medication-history-title">
        <div className="compact-section-heading"><h2 id="medication-history-title">최근 복용 기록</h2><span>{records.length}건</span></div>
        {records.length === 0 ? (
          <div className="medication-history__empty"><Icon name="notes" size={21} /><div><strong>최근 복용 기록이 없어요</strong><p>복용을 기록하면 이곳에서 최근 이력을 확인할 수 있어요.</p></div></div>
        ) : (
          <ul className="medication-history__list">{records.map((record) => <li key={record.id}><span><Icon name="check" size={15} /></span><div><strong>{new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.takenAt))}</strong><p>{record.note}</p></div></li>)}</ul>
        )}
      </section>

      <div className="results-actions">
        <Link className="button button--outline button--grow" to="/identify/image"><Icon name="arrowLeft" size={17} /><span>다시 찾기</span></Link>
        <Button className="button--grow" disabled={drug.expirationStatus === 'expired'} icon="check" onClick={handleTakeMedication}>복용하기</Button>
      </div>
      {drug.expirationStatus === 'expired' && <p className="dose-blocked" role="status"><Icon name="alert" size={16} /> 유효기간이 지난 의약품은 복용 기록을 진행할 수 없어요.</p>}
      <p className="page-footnote"><Icon name="shield" size={15} /> 식별 및 의약품 정보는 참고용입니다. 복용 판단은 의사·약사와 확인하세요.</p>
      <DoseConfirmModal drug={drug} onCancel={() => setDoseModalOpen(false)} onConfirm={handleConfirmRecord} open={isDoseModalOpen} />
    </div>
  )
}
