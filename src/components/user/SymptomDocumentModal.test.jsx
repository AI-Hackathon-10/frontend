import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SymptomDocumentModal from './SymptomDocumentModal.jsx'

describe('SymptomDocumentModal', () => {
  it('renders the reference document sections without exposing the user memo', () => {
    render(
      <SymptomDocumentModal
        onClose={vi.fn()}
        open
        report={{
          createdAt: '2026-08-19T14:30:00+09:00',
          userName: '홍길동',
          birthDate: '1995-08-19',
          drugName: '프리메정',
          memo: '밤부터 머리가 아프고 열감이 있어 메모를 남겼습니다.',
          symptoms: ['두통', '발열'],
          startedAt: '2026-08-19T10:30:00+09:00',
          takenAt: '2026-08-19T11:10:00+09:00',
          frontImageUrl: 'https://example.com/front.jpg',
          backImageUrl: 'medications/29/back.jpg',
        }}
      />,
    )

    expect(screen.getByRole('heading', { name: '증상 기록 문서', level: 3 })).toBeInTheDocument()
    expect(screen.getByText('환자 정보')).toBeInTheDocument()
    expect(screen.getByText('증상 정보')).toBeInTheDocument()
    expect(screen.getByText('복용 약 정보')).toBeInTheDocument()
    expect(screen.getByText('홍길동')).toBeInTheDocument()
    expect(screen.getByText('1995-08-19')).toBeInTheDocument()
    expect(screen.getByText('두통 · 발열')).toBeInTheDocument()
    expect(screen.getByText('프리메정')).toBeInTheDocument()
    expect(screen.queryByText('밤부터 머리가 아프고 열감이 있어 메모를 남겼습니다.')).not.toBeInTheDocument()
    expect(screen.queryByText('사용자 메모')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: '약 앞면 이미지' })).toHaveAttribute('src', 'https://example.com/front.jpg')
    expect(screen.getByRole('img', { name: '약 뒷면 이미지' })).toHaveClass('symptom-document__image-placeholder')
    expect(screen.getByText('알약 앞면')).toBeInTheDocument()
    expect(screen.getByText('알약 뒷면')).toBeInTheDocument()
    expect(screen.getByText('기록 생성')).toBeInTheDocument()
    expect(screen.getByText('본 문서는 사용자가 입력한 증상 및 복용 기록을 정리한 참고용 문서입니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument()
  })

  it('keeps the save action visible without starting device download yet', () => {
    render(<SymptomDocumentModal onClose={vi.fn()} open report={{ symptoms: ['두통'] }} />)

    expect(screen.queryByText('홍길동')).not.toBeInTheDocument()
    expect(screen.queryByText('프리메정')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '증상 기록 문서 닫기' })).toHaveFocus()
    expect(document.body).toHaveStyle({ overflow: 'hidden' })

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    expect(screen.getByRole('status')).toHaveTextContent('디바이스 저장 기능은 준비 중입니다.')
  })

  it('traps focus inside the dialog and restores it after closing', () => {
    const onClose = vi.fn()
    const report = { symptoms: ['두통'] }
    const { rerender } = render(
      <>
        <button type="button">문서 열기</button>
        <SymptomDocumentModal onClose={onClose} open={false} report={report} />
      </>,
    )
    const opener = screen.getByRole('button', { name: '문서 열기' })
    opener.focus()

    rerender(
      <>
        <button type="button">문서 열기</button>
        <SymptomDocumentModal onClose={onClose} open report={report} />
      </>,
    )

    const closeButton = screen.getByRole('button', { name: '증상 기록 문서 닫기' })
    const saveButton = screen.getByRole('button', { name: '저장하기' })
    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(saveButton).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(closeButton).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    rerender(
      <>
        <button type="button">문서 열기</button>
        <SymptomDocumentModal onClose={onClose} open={false} report={report} />
      </>,
    )
    expect(opener).toHaveFocus()
    expect(document.body).not.toHaveStyle({ overflow: 'hidden' })
  })
})
