import { useState } from 'react'
import Badge from '../components/ui/Badge.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import SymptomDocumentModal from '../components/user/SymptomDocumentModal.jsx'
import SymptomReportCard from '../components/user/SymptomReportCard.jsx'
import { SYMPTOM_REPORTS, SYMPTOM_REPORTS_STORAGE_KEY } from '../data/mockData.js'

export default function SymptomPage() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [reports] = useState(() => {
    const storedReports = JSON.parse(sessionStorage.getItem(SYMPTOM_REPORTS_STORAGE_KEY) ?? '[]')
    return [...storedReports, ...SYMPTOM_REPORTS]
  })

  return (
    <div className="page page--symptoms page--symptom-reports">
      <PageHeader
        description="리포트를 누르면 의료진에게 전달할 문서 이미지를 확인할 수 있어요."
        eyebrow="증상 문서화"
        title="증상 기록 리포트"
      />

      <section className="account-section" aria-labelledby="reports-title">
        <div className="section-heading section-heading--tight">
          <div>
            <span className="eyebrow">증상 문서화</span>
            <h2 id="reports-title">나의 증상 문서</h2>
          </div>
          <Badge tone="blue">{reports.length}건</Badge>
        </div>
        <p className="account-section__description">기록된 증상과 메모를 한눈에 확인할 수 있어요.</p>
        <div className="symptom-report-list">
          {reports.map((report) => (
            <SymptomReportCard key={report.id} onSelect={setSelectedReport} report={report} />
          ))}
        </div>
      </section>

      <SymptomDocumentModal
        onClose={() => setSelectedReport(null)}
        open={Boolean(selectedReport)}
        report={selectedReport}
      />
    </div>
  )
}
