import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import SearchResultsPage from './SearchResultsPage.jsx'

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
  beforeEach(() => sessionStorage.clear())

  it('prioritizes identity, two metrics, and the actual AI reason', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { results: [result], symptoms: ['두통', '소화불량·속쓰림'] } }]}>
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
    expect(efficacyDetails).not.toHaveAttribute('open')
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
      <MemoryRouter initialEntries={[{ pathname: '/search/results', state: { results: [result, recommendedResult] } }]}>
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
})
