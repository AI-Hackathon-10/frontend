import { useEffect, useState } from 'react'
import Badge from '../components/ui/Badge.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import SymptomDocumentModal from '../components/user/SymptomDocumentModal.jsx'
import SymptomReportCard from '../components/user/SymptomReportCard.jsx'
import { useAuth } from '../components/user/AuthProvider.jsx'
import { getReport, getReports } from '../api/reportApi.js'

function toImageUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value) ? value : undefined
}

function mapReport(report, user) {
  const medication = report.medication ?? {}

  return {
    id: report.reportId,
    createdAt: report.createdAt,
    symptoms: report.symptomTypes?.length ? report.symptomTypes : ['증상 없음'],
    severity: '사용자 입력 기록',
    summary: report.summary || '사용자가 작성한 증상 기록입니다.',
    userName: report.userName ?? user?.name,
    birthDate: user?.birthDate,
    startedAt: report.startedAt,
    drugName: medication.drugName ?? '-',
    takenAt: medication.takenAt,
    frontImageUrl: toImageUrl(medication.frontImageUrl),
    backImageUrl: toImageUrl(medication.backImageUrl),
  }
}

export default function SymptomPage() {
  const { user } = useAuth()
  const [selectedReport, setSelectedReport] = useState(null)
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setError('')
    getReports()
      .then((result) => {
        if (!cancelled) setReports((result ?? []).map((report) => mapReport(report, user)))
      })
      .catch(() => {
        if (!cancelled) setError('증상 리포트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.birthDate, user?.name])

  const handleSelectReport = async (report) => {
    setIsDetailLoading(true)
    setError('')

    try {
      const detail = await getReport(report.id)
      setSelectedReport(mapReport(detail, user))
    } catch {
      setError('증상 리포트 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsDetailLoading(false)
    }
  }

  return (
    <div className="page page--symptoms page--symptom-reports">
      <PageHeader
        description="리포트를 누르면 의료진에게 전달할 증상 문서를 확인할 수 있어요."
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
        <p className="account-section__description">기록된 증상과 복용 정보를 한눈에 확인할 수 있어요.</p>
        {isLoading ? <p className="account-section__description" role="status">증상 리포트를 불러오는 중입니다.</p> : null}
        {isDetailLoading ? <p className="account-section__description" role="status">증상 문서를 불러오는 중입니다.</p> : null}
        {error ? <p className="account-section__description" role="alert">{error}</p> : null}
        {!isLoading && !error && reports.length === 0 ? <p className="account-section__description">등록된 증상 리포트가 없습니다.</p> : null}
        {!isLoading && reports.length > 0 ? (
          <div className="symptom-report-list">
            {reports.map((report) => (
              <SymptomReportCard key={report.id} onSelect={handleSelectReport} report={report} />
            ))}
          </div>
        ) : null}
      </section>

      <SymptomDocumentModal
        onClose={() => setSelectedReport(null)}
        open={Boolean(selectedReport)}
        report={selectedReport}
      />
    </div>
  )
}
