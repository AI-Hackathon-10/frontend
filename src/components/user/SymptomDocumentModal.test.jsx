import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toBlob } from 'html-to-image'
import SymptomDocumentModal from './SymptomDocumentModal.jsx'

vi.mock('html-to-image', () => ({
  toBlob: vi.fn(),
}))

describe('SymptomDocumentModal', () => {
  const createObjectURL = vi.fn(() => 'blob:symptom-document')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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

  it('replaces a failed HTTP image with the document placeholder', () => {
    render(
      <SymptomDocumentModal
        onClose={vi.fn()}
        open
        report={{ frontImageUrl: 'https://example.com/expired.jpg', symptoms: ['두통'] }}
      />,
    )

    fireEvent.error(screen.getByRole('img', { name: '약 앞면 이미지' }))

    expect(screen.getByRole('img', { name: '약 앞면 이미지' })).toHaveClass('symptom-document__image-placeholder')
  })

  it('downloads the rendered document as a report-named PNG', async () => {
    const pngBlob = new Blob(['png'], { type: 'image/png' })
    toBlob.mockResolvedValue(pngBlob)
    render(<SymptomDocumentModal onClose={vi.fn()} open report={{ id: 42, symptoms: ['두통'] }} />)

    const originalCreateElement = document.createElement.bind(document)
    let downloadLink
    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      const element = originalCreateElement(tagName, options)
      if (tagName === 'a') {
        downloadLink = element
        vi.spyOn(element, 'click').mockImplementation(() => {})
      }
      return element
    })

    expect(screen.queryByText('홍길동')).not.toBeInTheDocument()
    expect(screen.queryByText('프리메정')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '증상 기록 문서 닫기' })).toHaveFocus()
    expect(document.body).toHaveStyle({ overflow: 'hidden' })

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled()
    expect(await screen.findByRole('status')).toHaveTextContent('증상 기록 문서를 저장했습니다.')
    expect(toBlob).toHaveBeenCalledWith(screen.getByRole('article', { name: '증상 기록 문서' }), {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    })
    expect(createObjectURL).toHaveBeenCalledWith(pngBlob)
    expect(downloadLink).toHaveAttribute('download', '증상기록-42.png')
    expect(downloadLink).toHaveAttribute('href', 'blob:symptom-document')
    expect(downloadLink.click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:symptom-document')
  })

  it('keeps the modal open and reports a PNG conversion failure', async () => {
    toBlob.mockRejectedValue(new Error('conversion failed'))
    render(<SymptomDocumentModal onClose={vi.fn()} open report={{ id: 42, symptoms: ['두통'] }} />)

    fireEvent.click(screen.getByRole('button', { name: '저장하기' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('증상 기록 문서를 저장하지 못했습니다.')
    await waitFor(() => expect(screen.getByRole('button', { name: '저장하기' })).toBeEnabled())
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
