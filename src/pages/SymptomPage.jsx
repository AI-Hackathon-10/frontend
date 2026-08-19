import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Icon from '../components/ui/Icon.jsx'
import { DEMO_SYMPTOM_NOTE, SYMPTOM_OPTIONS } from '../data/mockData.js'

export default function SymptomPage() {
  return (
    <div className="page page--symptoms">
      <PageHeader eyebrow="증상 문서화" title="증상 기록" description="지금 느끼는 상태를 간단히 정리해 의료진에게 보여줄 수 있어요." />
      <section className="notice-card notice-card--mint"><span className="notice-card__icon"><Icon name="notes" size={22} /></span><div><strong>기록은 판단을 대신하지 않아요</strong><p>증상을 남겨두면 나중에 설명할 때 도움이 될 수 있습니다.</p></div></section>
      <section className="form-section" aria-labelledby="symptom-select-title"><div className="section-heading section-heading--tight"><div><span className="eyebrow">01 · 지금 느끼는 증상</span><h2 id="symptom-select-title">해당되는 항목을 골라 주세요</h2></div><Badge tone="blue">2개 선택</Badge></div><div className="symptom-options">{SYMPTOM_OPTIONS.map((symptom) => <span className={`symptom-chip ${DEMO_SYMPTOM_NOTE.symptoms.includes(symptom) ? 'is-selected' : ''}`} key={symptom}>{DEMO_SYMPTOM_NOTE.symptoms.includes(symptom) ? <Icon name="check" size={15} /> : <Icon name="plus" size={15} />}{symptom}</span>)}</div></section>
      <section className="form-section" aria-labelledby="symptom-time-title"><div className="section-heading section-heading--tight"><div><span className="eyebrow">02 · 시작 시점</span><h2 id="symptom-time-title">언제부터였나요?</h2></div></div><div className="select-preview"><Icon name="clock" size={18} /><span>{DEMO_SYMPTOM_NOTE.onset}</span><Icon className="select-preview__arrow" name="chevronDown" size={17} /></div></section>
      <section className="form-section" aria-labelledby="symptom-memo-title"><div className="section-heading section-heading--tight"><div><span className="eyebrow">03 · 메모</span><h2 id="symptom-memo-title">더 알려주고 싶은 내용</h2></div><span className="character-count">24 / 200</span></div><div className="textarea-preview">{DEMO_SYMPTOM_NOTE.memo}<span className="textarea-preview__cursor" /></div></section>
      <section className="summary-card" aria-labelledby="summary-title"><div className="summary-card__topline"><span className="eyebrow">의료진에게 보여줄 요약</span><Badge tone="mint">예시 기록</Badge></div><h2 id="summary-title">현재 상태를 한 문장으로</h2><p>{DEMO_SYMPTOM_NOTE.summary}</p><div className="summary-card__footer"><span><Icon name="check" size={15} /> 기록 준비 완료</span><span>참고용</span></div></section>
      <Link className="button button--primary button--wide" to="/facilities"><span>응급의료기관 확인하기</span><Icon className="button__trailing" name="arrowRight" size={18} /></Link>
      <p className="page-footnote"><Icon name="shield" size={15} /> 증상이 심하거나 갑작스러우면 즉시 119 또는 의료기관에 연락하세요.</p>
    </div>
  )
}
