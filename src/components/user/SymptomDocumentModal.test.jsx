import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SymptomDocumentModal from './SymptomDocumentModal.jsx'

describe('SymptomDocumentModal', () => {
  it('renders a document preview with symptom, user, medication, and image sections', () => {
    render(
      <SymptomDocumentModal
        onClose={vi.fn()}
        open
        report={{
          createdAt: '2026-08-19T14:30:00+09:00',
          memo: '밤부터 머리가 아프고 열감이 있어 메모를 남겼습니다.',
          symptoms: ['두통', '발열'],
        }}
      />,
    )

    expect(screen.getByText('사용자 정보')).toBeInTheDocument()
    expect(screen.getByText('홍길동')).toBeInTheDocument()
    expect(screen.getByText('1995-08-19')).toBeInTheDocument()
    expect(screen.getByText('두통 · 발열')).toBeInTheDocument()
    expect(screen.getByText('프리메정')).toBeInTheDocument()
    expect(screen.getByText('밤부터 머리가 아프고 열감이 있어 메모를 남겼습니다.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '약 앞면 이미지' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '약 뒷면 이미지' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument()
  })

  it('keeps the save action visible without starting device download yet', () => {
    render(<SymptomDocumentModal onClose={vi.fn()} open report={{ symptoms: ['두통'] }} />)

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    expect(screen.getByRole('status')).toHaveTextContent('디바이스 저장 기능은 준비 중입니다.')
  })
})
