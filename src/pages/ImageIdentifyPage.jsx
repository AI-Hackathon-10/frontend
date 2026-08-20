import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import Icon from '../components/ui/Icon.jsx'
import Button from '../components/ui/Button.jsx'
import SymptomSelector from '../components/drugs/SymptomSelector.jsx'
import UploadCard from '../components/drugs/UploadCard.jsx'
import { PRIMARY_SYMPTOMS, SYMPTOM_CATEGORIES } from '../data/mockData.js'
import { getPresignedUrl, identifyMedication } from '../api/medicationApi.js'
import { ApiError } from '../api/client.js'

export default function ImageIdentifyPage() {
  const navigate = useNavigate()
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const nextPillSetId = useRef(2)
  const [pillSets, setPillSets] = useState([{ id: 1, front: null, back: null }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleToggleSymptom = (symptom) => {
    setSelectedSymptoms((current) => (
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom]
    ))
  }

  const handleUploadChange = (setId, side, file) => {
    setPillSets((current) => current.map((pillSet) => (
      pillSet.id === setId ? { ...pillSet, [side]: file } : pillSet
    )))
  }

  const handleAddPillSet = () => {
    const id = nextPillSetId.current
    nextPillSetId.current += 1
    setPillSets((current) => [...current, { id, front: null, back: null }])
  }

  const handleRemovePillSet = (setId) => {
    setPillSets((current) => current.filter((pillSet) => pillSet.id !== setId))
  }

  async function uploadOnePillSet(pillSet) {
    const { requestId, frontUploadUrl, backUploadUrl } = await getPresignedUrl()

    await Promise.all([
      fetch(frontUploadUrl, {
        method: 'PUT',
        body: pillSet.front,
        headers: { 'Content-Type': 'image/jpeg' },
      }),
      fetch(backUploadUrl, {
        method: 'PUT',
        body: pillSet.back,
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    ])

    return identifyMedication({ requestId, symptoms: selectedSymptoms })
  }

  const handleFindPill = async () => {
    if (selectedSymptoms.length === 0) return

    const readySets = pillSets.filter((p) => p.front && p.back)
    if (readySets.length === 0) {
      setErrorMessage('앞면과 뒷면 사진을 모두 추가해 주세요.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const results = await Promise.all(readySets.map(uploadOnePillSet))

      navigate('/search/results', {
        state: { symptoms: selectedSymptoms, results },
      })
    } catch (e) {
      const message = e instanceof ApiError ? e.message : '분석 중 오류가 발생했어요. 다시 시도해 주세요.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page page--narrow page--identify">
      <PageHeader backTo={null} eyebrow="알약 식별" title="사진으로 알약 정보 찾기" description="증상을 선택하고 알약의 앞·뒷면 사진을 추가해 주세요." />

      <SymptomSelector
        categories={SYMPTOM_CATEGORIES}
        primarySymptoms={PRIMARY_SYMPTOMS}
        selected={selectedSymptoms}
        onToggle={handleToggleSymptom}
      />

      <section aria-labelledby="captured-title" className="capture-section identify-upload-section">
        <div className="section-heading section-heading--tight">
          <div>
            <h2 id="captured-title">알약 사진</h2>
          </div>
        </div>
        <p className="section-helper">각인과 분할선이 선명한 사진일수록 식별에 도움이 됩니다.</p>
        <div className="pill-set-list">
          {pillSets.map((pillSet, index) => (
            <section aria-labelledby={`pill-set-${pillSet.id}-title`} className="pill-set" key={pillSet.id}>
              <div className="pill-set__header">
                <h3 id={`pill-set-${pillSet.id}-title`}>알약 {index + 1}</h3>
                {index > 0 && (
                  <button aria-label={`알약 ${index + 1} 삭제`} onClick={() => handleRemovePillSet(pillSet.id)} type="button">
                    <Icon name="close" size={14} /> 삭제
                  </button>
                )}
              </div>
              <div className="upload-grid">
                <UploadCard label="앞면" side={`pill-${pillSet.id}-front`} onChange={(file) => handleUploadChange(pillSet.id, 'front', file)} />
                <UploadCard label="뒷면" side={`pill-${pillSet.id}-back`} onChange={(file) => handleUploadChange(pillSet.id, 'back', file)} />
              </div>
            </section>
          ))}
        </div>
        <button className="pill-set-add" onClick={handleAddPillSet} type="button">
          <Icon name="plus" size={15} /> 알약 추가
        </button>
      </section>

      {errorMessage && <p className="page-footnote page-footnote--error">{errorMessage}</p>}

      <div className="identify-action-bar">
        <Button disabled={selectedSymptoms.length === 0 || isSubmitting} icon="search" onClick={handleFindPill} variant="primary">
          {isSubmitting ? '분석 중...' : '알약 찾기'}
        </Button>
      </div>

      <div className="identify-footnotes">
        <p className="page-footnote"><Icon name="shield" size={15} /> AI 판별 결과는 참고용이며, 사진은 판별 목적으로만 안전하게 처리됩니다.</p>
      </div>
    </div>
  )
}