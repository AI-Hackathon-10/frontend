import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ImageIdentifyPage, { getRelativeStartedAt } from './ImageIdentifyPage.jsx'
import { getPresignedUrl, identifyMedication, uploadMedicationImage } from '../api/medicationApi.js'
import { loadReportCreationContext } from '../utils/reportCreationStorage.js'

vi.mock('../api/medicationApi.js', () => ({
  getPresignedUrl: vi.fn(),
  identifyMedication: vi.fn(),
  uploadMedicationImage: vi.fn(),
}))

describe('ImageIdentifyPage onset input', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sessionStorage.clear()
  })

  it('defaults to now and only shows pickers in manual mode', () => {
    render(
      <MemoryRouter>
        <ImageIdentifyPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: '지금' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('증상 시작 몇 시간 전')).toHaveValue('지금')
    expect(screen.queryByLabelText('증상 시작 날짜')).not.toBeInTheDocument()

    expect(screen.queryByRole('button', { name: '몇 시간 전' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '날짜·시간으로 직접 선택' }))

    expect(screen.getByLabelText('증상 시작 날짜')).toBeRequired()
    expect(screen.getByLabelText('증상 시작 시간')).toBeRequired()
    expect(screen.getByLabelText('증상 시작 날짜')).not.toHaveValue('')
    expect(screen.getByLabelText('증상 시작 시간')).not.toHaveValue('')
    expect(screen.queryByLabelText('증상 시작 몇 시간 전')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '두통' }))
    fireEvent.click(screen.getByRole('button', { name: '알약 찾기' }))
    expect(screen.getByText('앞면과 뒷면 사진을 모두 추가해 주세요.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '몇 시간 전으로 선택' }))
    fireEvent.click(screen.getByRole('button', { name: '6시간 전' }))
    expect(screen.getByLabelText('증상 시작 몇 시간 전')).toHaveValue('6')
    expect(screen.queryByLabelText('증상 시작 날짜')).not.toBeInTheDocument()
  })

  it('converts relative hours to the existing ISO datetime format', () => {
    const now = new Date('2026-08-20T23:00:00+09:00').getTime()

    expect(getRelativeStartedAt(3, now)).toBe('2026-08-20T11:00:00.000Z')
  })

  it('marks validated sections as required without changing label colors', () => {
    render(
      <MemoryRouter>
        <ImageIdentifyPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '증상 선택 (필수)' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '증상 발현 시간 (필수)' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '알약 사진 (필수)' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '앞면 이미지 선택 영역' })).toHaveAttribute('aria-required', 'true')
  })

  it('limits symptom selection to ten items', () => {
    render(
      <MemoryRouter>
        <ImageIdentifyPage />
      </MemoryRouter>,
    )

    ;['두통', '발열', '기침', '콧물·코막힘', '인후통', '복통', '소화불량·속쓰림', '설사'].forEach((symptom) => {
      fireEvent.click(screen.getByRole('button', { name: symptom, exact: true }))
    })
    fireEvent.click(screen.getByRole('button', { name: '다른 증상 찾기' }))
    fireEvent.click(screen.getByRole('button', { name: '재채기' }))
    fireEvent.click(screen.getByRole('button', { name: '가래' }))

    expect(screen.getAllByText('10개 선택').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: '몸살' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '재채기' }))
    expect(screen.getByRole('button', { name: '몸살' })).toBeEnabled()
  })

  it('keeps the presign medication id aligned with every returned candidate', async () => {
    getPresignedUrl.mockResolvedValue({
      medicationId: 29,
      requestId: 'request-1',
      frontUploadUrl: 'https://upload.example.com/front',
      backUploadUrl: 'https://upload.example.com/back',
    })
    uploadMedicationImage.mockResolvedValue(undefined)
    identifyMedication.mockResolvedValue([
      { itemSeq: 'candidate-1', itemName: '후보 A' },
      { itemSeq: 'candidate-2', itemName: '후보 B' },
    ])

    render(
      <MemoryRouter initialEntries={['/identify/image']}>
        <Routes>
          <Route path="/identify/image" element={<ImageIdentifyPage />} />
          <Route path="/search/results" element={<h1>판별 결과 도착</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '두통' }))
    const frontFile = new File(['front'], 'front.jpg', { type: 'image/jpeg' })
    const backFile = new File(['back'], 'back.jpg', { type: 'image/jpeg' })

    fireEvent.click(screen.getByRole('button', { name: '앞면 이미지 선택 영역' }))
    fireEvent.change(screen.getByLabelText('앞면 사진 보관함에서 선택하기'), { target: { files: [frontFile] } })
    fireEvent.click(screen.getByRole('button', { name: '뒷면 이미지 선택 영역' }))
    fireEvent.change(screen.getByLabelText('뒷면 사진 보관함에서 선택하기'), { target: { files: [backFile] } })
    fireEvent.click(screen.getByRole('button', { name: '알약 찾기' }))

    expect(await screen.findByRole('heading', { name: '판별 결과 도착' })).toBeInTheDocument()
    const context = loadReportCreationContext()
    expect(context).toEqual({
      analysisRunId: expect.any(String),
      medicationIdsByResultIndex: [29, 29],
      symptomTypes: ['HEADACHE'],
      startedAt: expect.any(String),
      memo: '',
    })
    expect(identifyMedication).toHaveBeenCalledWith({
      requestId: 'request-1',
      symptomTypes: ['HEADACHE'],
      startedAt: context.startedAt,
    })
  })
})
