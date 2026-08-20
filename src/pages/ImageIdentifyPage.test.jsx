import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ImageIdentifyPage, { getRelativeStartedAt } from './ImageIdentifyPage.jsx'

describe('ImageIdentifyPage onset input', () => {
  it('defaults to three hours ago and only shows pickers in manual mode', () => {
    render(
      <MemoryRouter>
        <ImageIdentifyPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: '3시간 전' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('증상 시작 몇 시간 전')).toHaveValue(3)
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
    expect(screen.getByLabelText('증상 시작 몇 시간 전')).toHaveValue(6)
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

    expect(screen.getAllByText('10/10개 선택').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: '몸살' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '재채기' }))
    expect(screen.getByRole('button', { name: '몸살' })).toBeEnabled()
  })
})
