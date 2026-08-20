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
  const [onsetDate, setOnsetDate] = useState('')
  const [onsetTime, setOnsetTime] = useState('')
  const [memo, setMemo] = useState('')
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

  // 💡 S3 Presigned URL을 발급받아 업로드 후 식별 API를 순차적으로 호출하는 정석 파이프라인
  async function uploadOnePillSet(pillSet) {
    // 1. 공통 medicationApi를 사용하여 안전하게 S3 업로드용 URL과 requestId 발급
    const { requestId, frontUploadUrl, backUploadUrl } = await getPresignedUrl()

    // 2. 발급받은 개별 S3 URL로 이미지 바이너리(File 객체) 전송
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

    const startedAt = onsetDate && onsetTime ? new Date(`${onsetDate}T${onsetTime}`).toISOString() : null

    // 3. 업로드가 완료되면 최종 식별 API 호출 결과를 반환 (client.js 내부에서 ApiError 처리됨)
    return identifyMedication({ 
      requestId, 
      symptoms: selectedSymptoms,
      memo,
      startedAt
    })
  }

  const handleFindPill = async () => {
    if (selectedSymptoms.length === 0) return
    if (!onsetDate || !onsetTime) {
      setErrorMessage('증상 발현 날짜와 시간을 선택해 주세요.')
      return
    }

    const readySets = pillSets.filter((p) => p.front && p.back)
    if (readySets.length === 0) {
      setErrorMessage('앞면과 뒷면 사진을 모두 추가해 주세요.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // 모든 알약 세트를 순차/병렬로 업로드 및 분석 요청
      const results = await Promise.all(readySets.map(uploadOnePillSet))
      const startedAt = new Date(`${onsetDate}T${onsetTime}`).toISOString()

      // 결과 페이지로 획득한 데이터와 함께 라우팅
      navigate('/search/results', {
        state: { 
          symptoms: selectedSymptoms, 
          results,
          memo,
          startedAt
        },
      })
    } catch (e) {
      // 💡 이제 정상적으로 ApiError 규격을 타기 때문에 백엔드 에러 메시지가 온전히 출력됩니다.
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

      <section aria-labelledby="symptom-onset-title" className="identify-context-section">
        <div className="section-heading section-heading--tight">
          <div>
            <h2 id="symptom-onset-title">증상 발현 시각</h2>
          </div>
        </div>
        <p className="section-helper">증상이 시작된 날짜와 시간을 선택해 주세요.</p>
        <div className="onset-fields">
          <label className="onset-field">
            <span>날짜</span>
            <input
              aria-label="증상 시작 날짜"
              onChange={(event) => setOnsetDate(event.target.value)}
              required
              type="date"
              value={onsetDate}
            />
          </label>
          <label className="onset-field">
            <span>시간</span>
            <input
              aria-label="증상 시작 시간"
              onChange={(event) => setOnsetTime(event.target.value)}
              required
              step="3600"
              type="time"
              value={onsetTime}
            />
          </label>
        </div>
      </section>

      <section aria-labelledby="symptom-memo-title" className="identify-context-section identify-context-section--memo">
        <div className="section-heading section-heading--tight">
          <div>
            <h2 id="symptom-memo-title">증상 메모</h2>
          </div>
          <span className="character-count">{memo.length} / 200</span>
        </div>
        <p className="section-helper">증상에 대해 더 알려주고 싶은 내용을 입력해 주세요. (선택)</p>
        <textarea
          aria-label="증상 메모"
          className="symptom-memo"
          maxLength={200}
          onChange={(event) => setMemo(event.target.value)}
          placeholder="증상과 함께 알려주고 싶은 내용을 입력해 주세요."
          value={memo}
        />
      </section>

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