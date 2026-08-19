import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Icon from '../components/ui/Icon.jsx'
import { createSymptomReport, SYMPTOM_OPTIONS, SYMPTOM_REPORTS_STORAGE_KEY } from '../data/mockData.js'

export default function SymptomPage() {
  const navigate = useNavigate()
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [onsetDate, setOnsetDate] = useState('')
  const [onsetTime, setOnsetTime] = useState('')
  const [memo, setMemo] = useState('')

  const hasRequiredSymptoms = selectedSymptoms.length === 2
  const hasOnset = Boolean(onsetDate && onsetTime)
  const canCreateDocument = hasRequiredSymptoms && hasOnset
  const documentStatusMessage = !hasRequiredSymptoms
    ? selectedSymptoms.length === 0
      ? '증상 2개와 시작 날짜·시간을 입력해 주세요.'
      : '증상을 1개 더 선택해 주세요.'
    : !hasOnset
      ? '시작 날짜와 시간을 입력해 주세요.'
      : '입력한 내용으로 증상 문서를 만들 수 있어요.'

  const handleCreateDocument = () => {
    if (!canCreateDocument) return

    const report = createSymptomReport({ memo, onsetDate, onsetTime, symptoms: selectedSymptoms })
    const storedReports = JSON.parse(sessionStorage.getItem(SYMPTOM_REPORTS_STORAGE_KEY) ?? '[]')
    sessionStorage.setItem(SYMPTOM_REPORTS_STORAGE_KEY, JSON.stringify([report, ...storedReports]))
    navigate('/mypage')
  }

  const handleToggleSymptom = (symptom) => {
    setSelectedSymptoms((current) => {
      if (current.includes(symptom)) return current.filter((item) => item !== symptom)
      if (current.length >= 2) return current
      return [...current, symptom]
    })
  }

  return (
    <div className="page page--symptoms">
      <PageHeader eyebrow="증상 문서화" title="증상 기록" description="지금 느끼는 상태를 간단히 정리해 의료진에게 보여줄 수 있어요." />
      <section className="notice-card notice-card--mint"><span className="notice-card__icon"><Icon name="notes" size={22} /></span><div><strong>기록은 판단을 대신하지 않아요</strong><p>증상을 남겨두면 나중에 설명할 때 도움이 될 수 있습니다.</p></div></section>
      <section className="form-section" aria-labelledby="symptom-select-title"><div className="section-heading section-heading--tight"><div><span className="eyebrow">01 · 지금 느끼는 증상</span><h2 id="symptom-select-title">해당되는 항목을 골라 주세요</h2></div><Badge tone="blue">{selectedSymptoms.length}/2개 선택</Badge></div><div className="symptom-options">{SYMPTOM_OPTIONS.map((symptom) => { const isSelected = selectedSymptoms.includes(symptom); return <button aria-pressed={isSelected} className={`symptom-chip ${isSelected ? 'is-selected' : ''}`} key={symptom} onClick={() => handleToggleSymptom(symptom)} type="button">{isSelected ? <Icon name="check" size={15} /> : <Icon name="plus" size={15} />}{symptom}</button> })}</div></section>
      <section className="form-section" aria-labelledby="symptom-time-title"><div className="section-heading section-heading--tight"><div><span className="eyebrow">02 · 시작 시점</span><h2 id="symptom-time-title">언제부터였나요?</h2></div></div><div className="onset-fields"><label className="onset-field"><span>날짜</span><input aria-label="증상 시작 날짜" onChange={(event) => setOnsetDate(event.target.value)} type="date" value={onsetDate} /></label><label className="onset-field"><span>시간</span><input aria-label="증상 시작 시간" onChange={(event) => setOnsetTime(event.target.value)} step="3600" type="time" value={onsetTime} /></label></div></section>
      <section className="form-section" aria-labelledby="symptom-memo-title"><div className="section-heading section-heading--tight"><div><span className="eyebrow">03 · 메모</span><h2 id="symptom-memo-title">더 알려주고 싶은 내용</h2></div><span className="character-count">{memo.length} / 200</span></div><textarea aria-label="증상 메모" className="symptom-memo" maxLength={200} onChange={(event) => setMemo(event.target.value)} placeholder="증상과 함께 알려주고 싶은 내용을 입력해 주세요." value={memo} /></section>
      <section className="symptom-document-action" aria-label="증상 문서 만들기"><button className="button button--primary button--wide" disabled={!canCreateDocument} onClick={handleCreateDocument} type="button"><Icon name="notes" size={18} /> 증상 문서 만들기</button><p className={`symptom-document-action__status ${canCreateDocument ? 'is-ready' : ''}`} role="status">{documentStatusMessage}</p><p>작성한 내용은 문서로 정리되어 마이페이지에서 확인할 수 있어요.</p></section>
      <p className="page-footnote"><Icon name="shield" size={15} /> 증상 기록은 참고용이며, 필요한 경우 의료진에게 보여주세요.</p>
    </div>
  )
}
