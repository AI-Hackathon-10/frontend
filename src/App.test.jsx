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

  it('lets users select up to two symptoms and toggle them off again', () => {
    render(
      <MemoryRouter initialEntries={['/symptoms']}>
        <App />
      </MemoryRouter>,
    )

    const headache = screen.getByRole('button', { name: '두통', exact: true })
    const fever = screen.getByRole('button', { name: '발열', exact: true })
    const cough = screen.getByRole('button', { name: '기침', exact: true })

    expect(headache).toHaveAttribute('aria-pressed', 'false')
    expect(fever).toHaveAttribute('aria-pressed', 'false')
    expect(cough).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(headache)
    fireEvent.click(fever)
    expect(headache).toHaveAttribute('aria-pressed', 'true')
    expect(fever).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(cough)
    expect(cough).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(headache)
    expect(headache).toHaveAttribute('aria-pressed', 'false')
  })

  it('provides date and hourly time inputs for symptom onset', () => {
    render(
      <MemoryRouter initialEntries={['/symptoms']}>
        <App />
      </MemoryRouter>,
    )

    const onsetDate = screen.getByLabelText('증상 시작 날짜')
    const onsetTime = screen.getByLabelText('증상 시작 시간')

    expect(onsetDate).toHaveAttribute('type', 'date')
    expect(onsetTime).toHaveAttribute('type', 'time')
    expect(onsetTime).toHaveAttribute('step', '3600')
  })

  it('lets users type a symptom memo and shows the current character count', () => {
    render(
      <MemoryRouter initialEntries={['/symptoms']}>
        <App />
      </MemoryRouter>,
    )

    const memo = screen.getByLabelText('증상 메모')
    expect(memo.tagName).toBe('TEXTAREA')
    expect(memo).toHaveValue('')

    fireEvent.change(memo, { target: { value: '오후부터 몸이 무겁습니다.' } })
    expect(memo).toHaveValue('오후부터 몸이 무겁습니다.')
    expect(screen.getByText('14 / 200')).toBeInTheDocument()
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

describe('authentication pages', () => {
  it('renders the login form with an account creation link', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByLabelText('아이디')).toHaveAttribute('autocomplete', 'username')
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('autocomplete', 'current-password')
    expect(screen.getByRole('link', { name: '회원가입' })).toHaveAttribute('href', '/signup')
  })

  it('renders all requested signup fields', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument()
    expect(screen.getByLabelText('성별')).toBeInTheDocument()
    expect(screen.getByLabelText('생년월일')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('이름')).toBeInTheDocument()
    expect(screen.getByLabelText('아이디')).toHaveAttribute('autocomplete', 'username')
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('autocomplete', 'new-password')
    expect(screen.getByLabelText('비밀번호 확인')).toHaveAttribute('autocomplete', 'new-password')
  })

  it('redirects to login with a mock completion state after valid signup', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('성별'), { target: { value: 'female' } })
    fireEvent.change(screen.getByLabelText('생년월일'), { target: { value: '1998-04-12' } })
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'safe-password' } })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'safe-password' } })
    fireEvent.click(screen.getByRole('button', { name: '회원가입 완료' }))

    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('회원가입이 완료되었습니다')
    expect(screen.getByLabelText('아이디')).toHaveValue('pill-user')
  })

  it('keeps the signup action disabled until required values are complete', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: '회원가입 완료' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('성별'), { target: { value: 'male' } })
    fireEvent.change(screen.getByLabelText('생년월일'), { target: { value: '1998-04-12' } })
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'safe-password' } })

    expect(screen.getByRole('button', { name: '회원가입 완료' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'safe-password' } })
    expect(screen.getByRole('button', { name: '회원가입 완료' })).toBeEnabled()
  })

  it('moves to the pill-care home and exposes the user menu after login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'mock-password' } })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))

    expect(screen.getByRole('heading', { name: '오늘의 알약 케어' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '내 메뉴' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the three account destinations from the user menu', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'mock-password' } })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))
    fireEvent.click(screen.getByRole('button', { name: '내 메뉴' }))

    expect(screen.getByRole('link', { name: '마이페이지' })).toHaveAttribute('href', '/mypage')
    expect(screen.getByRole('link', { name: '비밀번호 수정' })).toHaveAttribute('href', '/password')
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
  })

  it('shows symptom report cards and opens the selected document image', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'mock-password' } })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))
    fireEvent.click(screen.getByRole('button', { name: '내 메뉴' }))
    fireEvent.click(screen.getByRole('link', { name: '마이페이지' }))

    expect(screen.getByRole('heading', { name: '마이페이지' })).toBeInTheDocument()
    const reportCard = screen.getByRole('button', { name: /두통.*발열/ })
    expect(reportCard).toBeInTheDocument()

    fireEvent.click(reportCard)

    expect(screen.getByRole('dialog', { name: '증상 기록 문서 보기' })).toBeInTheDocument()
    expect(screen.getByAltText('증상 기록 문서')).toHaveAttribute('src', 'https://example.com/presigned/symptom-report-1.png')
  })

  it('requires the current password before showing a password change success state', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'mock-password' } })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))
    fireEvent.click(screen.getByRole('button', { name: '내 메뉴' }))
    fireEvent.click(screen.getByRole('link', { name: '비밀번호 수정' }))

    expect(screen.getByRole('heading', { name: '비밀번호 수정' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('현재 비밀번호'), { target: { value: 'wrong-password' } })
    fireEvent.change(screen.getByLabelText('새 비밀번호'), { target: { value: 'new-password' } })
    fireEvent.change(screen.getByLabelText('새 비밀번호 확인'), { target: { value: 'new-password' } })
    fireEvent.click(screen.getByRole('button', { name: '비밀번호 변경' }))

    expect(screen.getByRole('alert')).toHaveTextContent('현재 비밀번호가 일치하지 않습니다')

    fireEvent.change(screen.getByLabelText('현재 비밀번호'), { target: { value: 'mock-password' } })
    fireEvent.click(screen.getByRole('button', { name: '비밀번호 변경' }))
    expect(screen.getByRole('status')).toHaveTextContent('비밀번호가 변경되었습니다')
  })

  it('closes the logout confirmation without logging out when cancelled or dismissed', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'mock-password' } })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))
    fireEvent.click(screen.getByRole('button', { name: '내 메뉴' }))
    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))

    expect(screen.getByRole('dialog', { name: '로그아웃 확인' })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: '로그아웃 확인' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '오늘의 알약 케어' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '내 메뉴' }))
    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))
    fireEvent.click(screen.getByRole('button', { name: '아니오' }))
    expect(screen.queryByRole('dialog', { name: '로그아웃 확인' })).not.toBeInTheDocument()
  })

  it('logs out and returns to login after confirming the modal', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'mock-password' } })
    fireEvent.click(screen.getByRole('button', { name: '로그인' }))
    fireEvent.click(screen.getByRole('button', { name: '내 메뉴' }))
    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }))
    fireEvent.click(screen.getByRole('button', { name: '확인' }))

    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '내 메뉴' })).not.toBeInTheDocument()
  })
})
