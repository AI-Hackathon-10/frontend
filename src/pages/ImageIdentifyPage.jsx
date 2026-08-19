import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import Icon from '../components/ui/Icon.jsx'
import Button from '../components/ui/Button.jsx'
import SymptomSelector from '../components/drugs/SymptomSelector.jsx'
import UploadCard from '../components/drugs/UploadCard.jsx'
import { SYMPTOM_OPTIONS } from '../data/mockData.js'

export default function ImageIdentifyPage() {
  const navigate = useNavigate()
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [, setUploads] = useState({ front: null, back: null })

  const handleToggleSymptom = (symptom) => {
    setSelectedSymptoms((current) => (
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom]
    ))
  }

  const handleUploadChange = (side, file) => {
    setUploads((current) => ({ ...current, [side]: file }))
  }

  const handleFindPill = () => {
    if (selectedSymptoms.length === 0) return

    navigate('/search/results', {
      state: {
        symptoms: selectedSymptoms,
        drugId: 'prime-tablet',
      },
    })
  }

  return (
    <div className="page page--narrow page--identify">
      <PageHeader eyebrow="알약 식별" title="사진으로 알약 정보 찾기" description="증상을 먼저 선택하고, 앞면과 뒷면 사진을 함께 준비해 주세요." />

      <section className="notice-card notice-card--blue">
        <span className="notice-card__icon"><Icon name="shield" size={22} /></span>
        <div>
          <strong>AI 결과는 참고용 정보예요</strong>
          <p>사진은 서버로 전송하지 않으며, 선택하지 않아도 예시 결과를 확인할 수 있어요.</p>
        </div>
        <Icon name="alert" size={18} />
      </section>

      <SymptomSelector options={SYMPTOM_OPTIONS} selected={selectedSymptoms} onToggle={handleToggleSymptom} />

      <section aria-labelledby="captured-title" className="capture-section identify-upload-section">
        <div className="section-heading section-heading--tight">
          <div>
            <span className="eyebrow">선택 사항</span>
            <h2 id="captured-title">알약 사진을 추가해 주세요</h2>
          </div>
          <span className="help-badge">?</span>
        </div>
        <p className="section-helper">각인과 분할선이 보이면 확인에 도움이 될 수 있어요.</p>
        <div className="upload-grid">
          <UploadCard label="앞면" side="front" onChange={(file) => handleUploadChange('front', file)} />
          <UploadCard label="뒷면" side="back" onChange={(file) => handleUploadChange('back', file)} />
        </div>
      </section>

      <div className="identify-action-bar">
        <div className="identify-action-bar__summary">
          <span>선택한 증상</span>
          <strong>{selectedSymptoms.length}개</strong>
        </div>
        <Button disabled={selectedSymptoms.length === 0} icon="search" onClick={handleFindPill} variant="primary">
          알약 찾기
        </Button>
      </div>

      <p className="page-footnote"><Icon name="shield" size={15} /> API 연결 전 제공되는 정적 예시 화면입니다.</p>
    </div>
  )
}
