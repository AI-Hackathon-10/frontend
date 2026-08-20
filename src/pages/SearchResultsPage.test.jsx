import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SearchResultsPage from './SearchResultsPage.jsx'
import { createSymptomRecord } from '../api/symptomApi.js'
import { markMedicationTaken } from '../api/medicationApi.js'
import { createReport, getReports } from '../api/reportApi.js'
import { loadMedicationAnalysisResults, saveMedicationAnalysisResults } from '../utils/medicationAnalysisStorage.js'
import {
  REPORT_CREATION_STORAGE_KEY,
  loadReportCreationContext,
  saveReportCreationContext,
} from '../utils/reportCreationStorage.js'

vi.mock('../api/symptomApi.js', () => ({
  createSymptomRecord: vi.fn(),
}))

vi.mock('../api/medicationApi.js', () => ({
  markMedicationTaken: vi.fn(),
}))

vi.mock('../api/reportApi.js', () => ({
  createReport: vi.fn(),
  getReports: vi.fn(),
}))

const ANALYSIS_RUN_ID = 'run-20260820-a'

const result = {
  itemSeq: '202106092',
  itemName: '타이레놀정500밀리그람(아세트아미노펜)',
  imageUrl: 'https://example.com/tylenol.png',
  identification: { confidence: 'HIGH', score: 1 },
  recommendation: {
    status: 'NOT_RECOMMENDED',
    score: 0.2,
    confidence: 'HIGH',
    reason: '실제 AI 판단 이유입니다.',
    caution: '실제 복용 전 주의사항입니다.',
  },
  official: {
    efficacy: '실제 주요 효능입니다.',
    useMethod: '실제 복용 방법입니다.',
    warning: '경고 전문',
    caution: '주의 전문',
    interaction: '상호작용 전문',
    sideEffect: '부작용 전문',
    storage: '보관 방법 전문',
  },
}

describe('clean medication result hierarchy', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sessionStorage.clear()
    getReports.mockResolvedValue([])
    saveReportCreationContext({
      analysisRunId: ANALYSIS_RUN_ID,
      medicationIdsByResultIndex: [29],
      symptomTypes: ['HEADACHE', 'INDIGESTION', 'HEARTBURN'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '머리가 아픕니다.',
    })
  })

  it('prioritizes identity, two metrics, and the actual AI reason', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [result], symptoms: ['두통', '소화불량·속쓰림'] } }]}>
        <Routes><Route path="/search/results" element={<SearchResultsPage />} /></Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '타이레놀정500밀리그람' })).toBeInTheDocument()
    const resultCard = screen.getByRole('article')
    expect(within(resultCard).getByLabelText('선택한 증상')).toHaveTextContent('두통소화불량·속쓰림')
    expect(resultCard).not.toHaveTextContent('복용 비추천')
    const metrics = screen.getByLabelText('핵심 분석 수치')
    expect(metrics).toHaveTextContent('판별 일치도100%')
    expect(metrics).toHaveTextContent('AI 추천 정도20%')
    expect(metrics).not.toHaveTextContent('신뢰도 높음')
    const progress = metrics.querySelectorAll('.result-metric__track > span')
    expect(progress[0]).toHaveStyle({ width: '100%' })
    expect(progress[1]).toHaveStyle({ width: '20%' })
    expect(screen.getByText('실제 AI 판단 이유입니다.')).toBeInTheDocument()
    expect(screen.queryByText('약 정보 더 알아보기')).not.toBeInTheDocument()
    const efficacyDetails = screen.getByText('주요 효능').closest('details')
    expect(efficacyDetails).not.toHaveAttribute('open')
    fireEvent.click(screen.getByText('주요 효능'))
    expect(efficacyDetails).toHaveAttribute('open')
    expect(screen.getByText('실제 주요 효능입니다.')).toBeInTheDocument()
    const dosageDetails = screen.getByText('복용 방법').closest('details')
    expect(dosageDetails).not.toHaveAttribute('open')
    fireEvent.click(screen.getByText('복용 방법'))
    expect(dosageDetails).toHaveAttribute('open')
    expect(efficacyDetails).toHaveAttribute('open')
    expect(screen.getByRole('button', { name: '복용하기' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: '복용하기' }))
    expect(screen.getByRole('dialog', { name: 'AI 분석상 복용을 권장하지 않아요' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '취소' }))

    fireEvent.click(screen.getByRole('button', { name: /주의사항 전체 보기/ }))
    expect(within(screen.getByRole('dialog')).getByText('경고 전문')).toBeInTheDocument()
  })

  it('selects the highest recommendation first and switches candidates locally', () => {
    const recommendedResult = {
      ...result,
      itemSeq: 'recommended-1',
      itemName: '추천 후보정',
      identification: { confidence: 'MEDIUM', score: 0.82 },
      recommendation: {
        status: 'RECOMMENDED',
        score: 0.9,
        confidence: 'HIGH',
        reason: '추천 후보의 판단 이유입니다.',
      },
    }

    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [result, recommendedResult] } }]}>
        <Routes><Route path="/search/results" element={<SearchResultsPage />} /></Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '추천 후보정' })).toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveClass('analysis-card--recommended')
    expect(screen.getAllByText('AI 1순위')).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: /타이레놀정500밀리그람.*결과 보기/ }))

    expect(screen.getByRole('heading', { name: '타이레놀정500밀리그람' })).toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveClass('analysis-card--not-recommended')
    expect(screen.getByText('실제 AI 판단 이유입니다.')).toBeInTheDocument()
    expect(screen.getAllByText('AI 1순위')).toHaveLength(1)
  })

  it('shows a failed result without an irrelevant duplicate medication warning', () => {
    const failedResult = {
      ok: false,
      pillLabel: '알약 1',
      error: '사진이 흐리거나 식별 문자가 가려졌을 수 있어요. 다른 사진으로 다시 시도해 주세요.',
    }

    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [failedResult] } }]}>
        <Routes><Route path="/search/results" element={<SearchResultsPage />} /></Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '알약 1 - 판별 실패' })).toBeInTheDocument()
    expect(document.querySelector('.identify-result-state__icon img')).toBeInTheDocument()
    expect(document.querySelector('.analysis-card--failed .identify-result-state p')?.textContent).toBe('사진이 흐리거나 식별 문자가 가려졌을 수 있어요.\n다른 사진으로 다시 시도해 주세요.')
    expect(screen.queryByText('AI 분석상 복용을 권장하지 않아 확인 후 기록할 수 있어요.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '복용하기' })).not.toBeInTheDocument()
  })

  it('creates the symptom, intake, and report in order and navigates immediately', async () => {
    let resolveSymptom
    createSymptomRecord.mockReturnValue(new Promise((resolve) => {
      resolveSymptom = resolve
    }))
    markMedicationTaken.mockResolvedValue({ medicationId: 29 })
    createReport.mockResolvedValue({ reportId: 7 })
    saveMedicationAnalysisResults([result], { analysisRunId: ANALYSIS_RUN_ID })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [result], symptoms: ['두통', '소화불량·속쓰림'] } }]}>
        <Routes>
          <Route path="/search/results" element={<SearchResultsPage />} />
          <Route path="/symptoms" element={<h1>증상 기록 목록</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '복용하기' }))
    fireEvent.click(screen.getByRole('button', { name: '복용 기록하기' }))

    expect(createSymptomRecord).toHaveBeenCalledWith({
      symptomTypes: ['HEADACHE', 'INDIGESTION', 'HEARTBURN'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '머리가 아픕니다.',
    })
    const submittingButton = screen.getByRole('button', { name: '기록 중...' })
    expect(submittingButton).toBeDisabled()
    fireEvent.click(submittingButton)
    expect(createSymptomRecord).toHaveBeenCalledTimes(1)

    resolveSymptom({ symptomRecordId: 17 })

    expect(await screen.findByRole('heading', { name: '증상 기록 목록' })).toBeInTheDocument()
    expect(markMedicationTaken).toHaveBeenCalledWith(29)
    expect(createReport).toHaveBeenCalledWith({ symptomRecordId: 17, medicationId: 29 })
    expect(createSymptomRecord.mock.invocationCallOrder[0]).toBeLessThan(markMedicationTaken.mock.invocationCallOrder[0])
    expect(markMedicationTaken.mock.invocationCallOrder[0]).toBeLessThan(createReport.mock.invocationCallOrder[0])
    expect(loadReportCreationContext()).toBeNull()
    expect(loadMedicationAnalysisResults()).toEqual([])
  })

  it('keeps the confirmation open and shows an error when creation fails', async () => {
    createSymptomRecord.mockRejectedValue(new Error('network failure'))

    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [result], symptoms: ['두통'] } }]}>
        <Routes><Route path="/search/results" element={<SearchResultsPage />} /></Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '복용하기' }))
    fireEvent.click(screen.getByRole('button', { name: '복용 기록하기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('복용 기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    expect(screen.getByRole('dialog', { name: 'AI 분석상 복용을 권장하지 않아요' })).toBeInTheDocument()
    expect(markMedicationTaken).not.toHaveBeenCalled()
    expect(createReport).not.toHaveBeenCalled()
    expect(loadReportCreationContext()).not.toBeNull()
  })

  it('does not call creation APIs when the selected result has no medication id', async () => {
    saveReportCreationContext({
      analysisRunId: ANALYSIS_RUN_ID,
      medicationIdsByResultIndex: [null],
      symptomTypes: ['HEADACHE'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '',
    })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [result], symptoms: ['두통'] } }]}>
        <Routes><Route path="/search/results" element={<SearchResultsPage />} /></Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '복용하기' }))
    fireEvent.click(screen.getByRole('button', { name: '복용 기록하기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('복용 기록 정보를 찾을 수 없습니다. 알약을 다시 분석해 주세요.')
    expect(createSymptomRecord).not.toHaveBeenCalled()
    expect(markMedicationTaken).not.toHaveBeenCalled()
    expect(createReport).not.toHaveBeenCalled()
  })

  it('refuses writes when browser history shows a different analysis run', async () => {
    saveReportCreationContext({
      analysisRunId: 'run-20260820-b',
      medicationIdsByResultIndex: [88],
      symptomTypes: ['HEADACHE'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '',
    })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [result], symptoms: ['두통'] } }]}>
        <Routes><Route path="/search/results" element={<SearchResultsPage />} /></Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '복용하기' }))
    fireEvent.click(screen.getByRole('button', { name: '복용 기록하기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('복용 기록 정보를 찾을 수 없습니다. 알약을 다시 분석해 주세요.')
    expect(createSymptomRecord).not.toHaveBeenCalled()
    expect(markMedicationTaken).not.toHaveBeenCalled()
    expect(createReport).not.toHaveBeenCalled()
  })

  it('refuses every write when stored symptom types contain duplicates', async () => {
    sessionStorage.setItem(REPORT_CREATION_STORAGE_KEY, JSON.stringify({
      analysisRunId: ANALYSIS_RUN_ID,
      medicationIdsByResultIndex: [29],
      symptomTypes: ['HEADACHE', 'HEADACHE'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '',
    }))

    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [result], symptoms: ['두통'] } }]}>
        <Routes><Route path="/search/results" element={<SearchResultsPage />} /></Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '복용하기' }))
    fireEvent.click(screen.getByRole('button', { name: '복용 기록하기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('복용 기록 정보를 찾을 수 없습니다. 알약을 다시 분석해 주세요.')
    expect(createSymptomRecord).not.toHaveBeenCalled()
    expect(markMedicationTaken).not.toHaveBeenCalled()
    expect(createReport).not.toHaveBeenCalled()
  })

  it('reuses the symptom record when intake fails and the user retries', async () => {
    createSymptomRecord.mockResolvedValue({ symptomRecordId: 17 })
    markMedicationTaken.mockRejectedValueOnce(new Error('intake failure')).mockResolvedValue({ medicationId: 29 })
    createReport.mockResolvedValue({ reportId: 7 })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [result], symptoms: ['두통'] } }]}>
        <Routes>
          <Route path="/search/results" element={<SearchResultsPage />} />
          <Route path="/symptoms" element={<h1>증상 기록 목록</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '복용하기' }))
    fireEvent.click(screen.getByRole('button', { name: '복용 기록하기' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '복용 기록하기' }))

    expect(await screen.findByRole('heading', { name: '증상 기록 목록' })).toBeInTheDocument()
    expect(createSymptomRecord).toHaveBeenCalledTimes(1)
    expect(markMedicationTaken).toHaveBeenCalledTimes(2)
    expect(createReport).toHaveBeenCalledTimes(1)
  })

  it('skips completed symptom and intake writes when report creation is retried', async () => {
    createSymptomRecord.mockResolvedValue({ symptomRecordId: 17 })
    markMedicationTaken.mockResolvedValue({ medicationId: 29 })
    createReport.mockRejectedValueOnce(new Error('report failure')).mockResolvedValue({ reportId: 7 })

    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [result], symptoms: ['두통'] } }]}>
        <Routes>
          <Route path="/search/results" element={<SearchResultsPage />} />
          <Route path="/symptoms" element={<h1>증상 기록 목록</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '복용하기' }))
    fireEvent.click(screen.getByRole('button', { name: '복용 기록하기' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '복용 기록하기' }))

    expect(await screen.findByRole('heading', { name: '증상 기록 목록' })).toBeInTheDocument()
    expect(createSymptomRecord).toHaveBeenCalledTimes(1)
    expect(markMedicationTaken).toHaveBeenCalledTimes(1)
    expect(createReport).toHaveBeenCalledTimes(2)
  })

  it('treats a report as created when a lost response is confirmed by the list API', async () => {
    createSymptomRecord.mockResolvedValue({ symptomRecordId: 17 })
    markMedicationTaken.mockResolvedValue({ medicationId: 29 })
    createReport.mockRejectedValue(new Error('response lost'))
    getReports.mockResolvedValue([
      {
        reportId: 7,
        symptomRecordId: 17,
        medication: { medicationId: 29 },
      },
    ])

    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { analysisRunId: ANALYSIS_RUN_ID, results: [result], symptoms: ['두통'] } }]}>
        <Routes>
          <Route path="/search/results" element={<SearchResultsPage />} />
          <Route path="/symptoms" element={<h1>증상 기록 목록</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '복용하기' }))
    fireEvent.click(screen.getByRole('button', { name: '복용 기록하기' }))

    expect(await screen.findByRole('heading', { name: '증상 기록 목록' })).toBeInTheDocument()
    expect(getReports).toHaveBeenCalledTimes(1)
    expect(createSymptomRecord).toHaveBeenCalledTimes(1)
    expect(markMedicationTaken).toHaveBeenCalledTimes(1)
    expect(createReport).toHaveBeenCalledTimes(1)
    expect(loadReportCreationContext()).toBeNull()
  })
})
