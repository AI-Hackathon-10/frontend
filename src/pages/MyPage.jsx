import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Icon from '../components/ui/Icon.jsx'
import SymptomDocumentModal from '../components/user/SymptomDocumentModal.jsx'
import SymptomReportCard from '../components/user/SymptomReportCard.jsx'
import { useAuth } from '../components/user/AuthProvider.jsx'
import { SYMPTOM_REPORTS, SYMPTOM_REPORTS_STORAGE_KEY } from '../data/mockData.js'

const genderLabels = { female: '여성', male: '남성', other: '기타' }

export default function MyPage() {
  const { user } = useAuth()
  const [selectedReport, setSelectedReport] = useState(null)
  const [reports] = useState(() => {
    const storedReports = JSON.parse(sessionStorage.getItem(SYMPTOM_REPORTS_STORAGE_KEY) ?? '[]')
    return [...storedReports, ...SYMPTOM_REPORTS]
  })

  return (
    <div className="page page--account page--mypage">
      <PageHeader
        description="내 정보와 증상 기록 리포트를 한곳에서 확인할 수 있어요."
        eyebrow="내 건강 기록"
        title="마이페이지"
      />

      <section className="profile-card" aria-labelledby="profile-card-title">
        <div className="profile-card__topline">
          <div className="profile-card__identity">
            <span className="profile-card__avatar"><Icon name="shield" size={23} /></span>
            <div><span className="eyebrow">가입 정보</span><h2 id="profile-card-title">{user?.name ?? '사용자'}</h2></div>
          </div>
          <Badge tone="mint">Mock profile</Badge>
        </div>
        <dl className="profile-card__details">
          <div><dt>아이디</dt><dd>{user?.id ?? '-'}</dd></div>
          <div><dt>성별</dt><dd>{genderLabels[user?.gender] ?? '-'}</dd></div>
          <div><dt>생년월일</dt><dd>{user?.birthDate ?? '-'}</dd></div>
        </dl>
      </section>

      <section className="account-section" aria-labelledby="reports-title">
        <div className="section-heading section-heading--tight">
          <div><span className="eyebrow">증상 문서화</span><h2 id="reports-title">증상 기록 리포트</h2></div>
          <Badge tone="blue">{reports.length}건</Badge>
        </div>
        <p className="account-section__description">리포트를 누르면 의료진에게 전달할 문서 이미지를 확인할 수 있어요.</p>
        <div className="symptom-report-list">
          {reports.map((report) => <SymptomReportCard key={report.id} onSelect={setSelectedReport} report={report} />)}
        </div>
      </section>

      <SymptomDocumentModal onClose={() => setSelectedReport(null)} open={Boolean(selectedReport)} report={selectedReport} />
    </div>
  )
}
