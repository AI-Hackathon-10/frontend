import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

describe('app shell routing contract', () => {
  it('renders the branded home heading', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '알약케어' })).toBeInTheDocument()
    expect(screen.queryByText('최근 확인한 약품')).not.toBeInTheDocument()
  })

  it('does not expose the removed emergency facility destination', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: '응급실' })).not.toBeInTheDocument()
    expect(screen.queryByText('응급실 찾기')).not.toBeInTheDocument()
  })

  it('renders example drug records', () => {
    render(
      <MemoryRouter initialEntries={['/drugs/prime-tablet']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText('한국프라임제약(주)')).toBeInTheDocument()
    expect(screen.getByText('[M214134] 덱시부프로펜')).toBeInTheDocument()

  })

  it.each([
    ['/', '오늘의 알약 케어'],
    ['/identify/image', '사진으로 알약 정보 찾기'],
    ['/identify/shape', '알약 외형으로 찾기'],
    ['/search/results', '검색 결과'],
    ['/drugs/prime-tablet', '프리메정'],
    ['/symptoms', '증상 기록'],
  ])('renders the expected heading for %s', (route, heading) => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('renders twenty symptoms and keeps the search action disabled until one is selected', () => {
    render(
      <MemoryRouter initialEntries={['/identify/image']}>
        <App />
      </MemoryRouter>,
    )

    const symptomButtons = [
      '두통', '발열', '기침', '인후통', '콧물', '코막힘', '복통', '소화불량', '설사', '변비',
      '속쓰림', '구토/메스꺼움', '근육통', '생리통', '치통', '알레르기', '피부 가려움', '몸살', '어지러움', '오한',
    ]

    expect(symptomButtons).toHaveLength(20)
    symptomButtons.forEach((symptom) => {
      expect(screen.getByRole('button', { name: symptom, exact: true })).toBeInTheDocument()
    })

    const searchButton = screen.getByRole('button', { name: '알약 찾기', exact: true })
    expect(searchButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '두통', exact: true }))
    expect(screen.getByRole('button', { name: '두통', exact: true })).toHaveAttribute('aria-pressed', 'true')
    expect(searchButton).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: '두통', exact: true }))
    expect(screen.getByRole('button', { name: '두통', exact: true })).toHaveAttribute('aria-pressed', 'false')
    expect(searchButton).toBeDisabled()
  })

  it('passes selected symptoms into the mock result screen', () => {
    render(
      <MemoryRouter initialEntries={['/identify/image']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '발열', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: '알약 찾기', exact: true }))

    expect(screen.getByRole('heading', { name: '검색 결과' })).toBeInTheDocument()
    expect(screen.getByText('발열', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('프리메정', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('사용기한 확인 불가', { exact: true })).toBeInTheDocument()
  })

  it('opens image source choices from the example image area', () => {
    render(
      <MemoryRouter initialEntries={['/identify/image']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('button', { name: '촬영하기', exact: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '앨범에서 선택하기', exact: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '파일 탐색기에서 선택하기', exact: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /사진 선택|사진 바꾸기/ })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '앞면 이미지 선택 영역', exact: true }))

    expect(screen.getByRole('button', { name: '촬영하기', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '앨범에서 선택하기', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '파일 탐색기에서 선택하기', exact: true })).toBeInTheDocument()
  })

  it('previews and removes locally selected pill photos', () => {
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    const createObjectURL = vi.fn(() => 'blob:front-preview')
    const revokeObjectURL = vi.fn()

    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })

    try {
      render(
        <MemoryRouter initialEntries={['/identify/image']}>
          <App />
        </MemoryRouter>,
      )

      const file = new File(['pill-image'], 'front.png', { type: 'image/png' })
      fireEvent.click(screen.getByRole('button', { name: '앞면 이미지 선택 영역', exact: true }))
      fireEvent.change(screen.getByLabelText('앞면 앨범에서 선택하기'), { target: { files: [file] } })

      expect(screen.getByAltText('앞면 업로드 미리보기')).toHaveAttribute('src', 'blob:front-preview')
      expect(createObjectURL).toHaveBeenCalledWith(file)

      fireEvent.click(screen.getByRole('button', { name: '앞면 사진 삭제', exact: true }))
      expect(screen.queryByAltText('앞면 업로드 미리보기')).not.toBeInTheDocument()
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:front-preview')
    } finally {
      Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreateObjectURL })
      Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevokeObjectURL })
    }
  })

  it('requires confirmation before marking a dose as recorded', () => {
    render(
      <MemoryRouter initialEntries={['/search/results']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '복용하기', exact: true }))
    expect(screen.getByRole('dialog', { name: '복용 전 확인해주세요' })).toBeInTheDocument()
    expect(screen.getByText('현재 알약의 사용기한을 확인할 수 없습니다.')).toBeInTheDocument()
    expect(screen.getByText('AI가 식별한 의약품 정보는 실제 제품과 다를 수 있습니다.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '취소', exact: true }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '복용하기', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: '확인 후 복용 기록', exact: true }))
    expect(screen.getByRole('status')).toHaveTextContent('복용 기록이 저장되었습니다')
  })

  it.each(['/', '/identify/image', '/identify/shape', '/search/results', '/drugs/prime-tablet', '/symptoms'])(
    'does not expose the removed emergency call CTA on %s',
    (route) => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
      )

      expect(screen.queryByRole('link', { name: '응급실 전화', exact: true })).not.toBeInTheDocument()
    },
  )

})
