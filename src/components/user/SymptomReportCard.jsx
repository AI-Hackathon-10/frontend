import Icon from '../ui/Icon.jsx'

function formatReportDate(createdAt) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(createdAt))
}

export default function SymptomReportCard({ report, onSelect }) {
  const symptomsLabel = report.symptoms.join(' · ')

  return (
    <button
      aria-label={`증상 리포트 ${report.symptoms.join(' ')}`}
      className="symptom-report-card"
      onClick={() => onSelect(report)}
      type="button"
    >
      <span className="symptom-report-card__icon"><Icon name="notes" size={21} /></span>
      <span className="symptom-report-card__body">
        <span className="symptom-report-card__topline">
          <span className="eyebrow">증상 기록</span>
          <span>{formatReportDate(report.createdAt)}</span>
        </span>
        <strong>{symptomsLabel}</strong>
        <small>{report.summary}</small>
        <span className="symptom-report-card__meta"><span>{report.severity}</span><Icon name="arrowRight" size={16} /></span>
      </span>
    </button>
  )
}
