import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import SymptomPage from './SymptomPage.jsx'
import { getReport, getReports } from '../api/reportApi.js'

vi.mock('../api/reportApi.js', () => ({
  getReport: vi.fn(),
  getReports: vi.fn(),
}))

vi.mock('../components/user/AuthProvider.jsx', () => ({
  useAuth: () => ({ user: { name: '홍길동', birthDate: '1995-08-19' } }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <SymptomPage />
    </MemoryRouter>,
  )
}

describe('SymptomPage report API integration', () => {
  it('loads report cards from the report list API', async () => {
    getReports.mockResolvedValue([
      {
        reportId: 7,
        createdAt: '2026-08-20T01:00:00Z',
        symptomTypes: ['두통', '발열'],
        summary: '밤부터 머리가 아프고 열감이 있습니다.',
      },
    ])

    renderPage()

    await waitFor(() => expect(screen.getByRole('button', { name: '증상 리포트 두통 발열' })).toBeInTheDocument())
    expect(getReports).toHaveBeenCalledTimes(1)
    expect(screen.getByText('밤부터 머리가 아프고 열감이 있습니다.')).toBeInTheDocument()
  })

  it('loads report detail when a report card is selected', async () => {
    getReports.mockResolvedValue([
      {
        reportId: 7,
        createdAt: '2026-08-20T01:00:00Z',
        symptomTypes: ['두통', '발열'],
        summary: '증상 요약',
      },
    ])
    getReport.mockResolvedValue({
      reportId: 7,
      createdAt: '2026-08-20T01:00:00Z',
      startedAt: '2026-08-19T23:00:00Z',
      symptomTypes: ['두통', '발열'],
      memo: '밤부터 열감이 있었습니다.',
      summary: '상세 증상 요약',
      medication: {
        drugName: '프리메정',
        takenAt: '2026-08-20T00:30:00',
        frontImageUrl: 'HTTPS://example.com/front.jpg',
        backImageUrl: 'medications/7/back.jpg',
      },
    })

    renderPage()
    const card = await screen.findByRole('button', { name: '증상 리포트 두통 발열' })
    fireEvent.click(card)

    await waitFor(() => expect(getReport).toHaveBeenCalledWith(7))
    expect(await screen.findByRole('dialog', { name: '증상 기록 문서 보기' })).toBeInTheDocument()
    expect(screen.getByText('프리메정')).toBeInTheDocument()
    expect(screen.queryByText('밤부터 열감이 있었습니다.')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: '약 앞면 이미지' })).toHaveAttribute('src', 'HTTPS://example.com/front.jpg')
    expect(screen.getByRole('img', { name: '약 뒷면 이미지' })).toHaveClass('symptom-document__image-placeholder')
  })
})
