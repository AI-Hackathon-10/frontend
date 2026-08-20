import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
    ['/search/results', '판별 결과'],
    ['/drugs/prime-tablet', '프리메정'],
    ['/symptoms', '증상 기록 리포트'],
  ])('renders the expected heading for %s', (route, heading) => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    expect(document.querySelector('.route-progress')).not.toBeInTheDocument()
  })

  it('shows primary symptoms first and keeps the search action disabled until one is selected', () => {
    render(
      <MemoryRouter initialEntries={['/identify/image']}>
        <App />
      </MemoryRouter>,
    )

    const symptomButtons = ['두통', '발열', '기침', '콧물·코막힘', '인후통', '복통', '소화불량·속쓰림', '설사']

    expect(symptomButtons).toHaveLength(8)
    expect(screen.queryByRole('link', { name: '이전 화면으로 이동' })).not.toBeInTheDocument()
    expect(screen.getByText('AI 판별 결과는 참고용이며, 사진은 서버에 저장되지 않습니다.')).toHaveClass('page-footnote')
    symptomButtons.forEach((symptom) => {
      expect(screen.getByRole('button', { name: symptom, exact: true })).toBeInTheDocument()
    })

    const searchButton = screen.getByRole('button', { name: '알약 찾기', exact: true })
    expect(searchButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: '두통', exact: true }))
    expect(screen.getByRole('button', { name: '두통', exact: true })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '다른 증상 찾기', exact: true })).toBeInTheDocument()
    expect(searchButton).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: '두통', exact: true }))
    expect(screen.getByRole('button', { name: '두통', exact: true })).toHaveAttribute('aria-pressed', 'false')
    expect(searchButton).toBeDisabled()
  })

  it('renders symptom report cards instead of the symptom input form', () => {
    render(
      <MemoryRouter initialEntries={['/symptoms']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '증상 기록 리포트' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /증상 리포트 두통 발열/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /증상 리포트 기침 인후통/ })).toBeInTheDocument()
    expect(screen.queryByText('언제부터였나요?')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('증상 메모')).not.toBeInTheDocument()
  })

  it('opens a symptom document when a report card is selected', () => {
    render(
      <MemoryRouter initialEntries={['/symptoms']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /증상 리포트 두통 발열/ }))

    expect(screen.getByRole('dialog', { name: '증상 기록 문서 보기' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장하기' })).toBeInTheDocument()
  })

  it('keeps only the user information section on mypage', () => {
    render(
      <MemoryRouter initialEntries={['/mypage']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '마이페이지' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '홍길동' })).toBeInTheDocument()
    expect(screen.queryByText('증상 기록 리포트')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /증상 리포트/ })).not.toBeInTheDocument()
  })

  it('passes selected symptoms into the mock result screen', () => {
    render(
      <MemoryRouter initialEntries={['/identify/image']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '발열', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: '알약 찾기', exact: true }))

    expect(screen.getByRole('heading', { name: '판별 결과' })).toBeInTheDocument()
    expect(screen.getByText('발열', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('프리메정', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('유효기간 확인 불가', { exact: true })).toBeInTheDocument()
  })

  it('opens image source choices from the example image area', () => {
    render(
      <MemoryRouter initialEntries={['/identify/image']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('button', { name: '촬영하기', exact: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '사진 보관함에서 선택하기', exact: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '파일에서 선택하기', exact: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /사진 선택|사진 바꾸기/ })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '앞면 이미지 선택 영역', exact: true }))

    expect(screen.getByRole('dialog', { name: '사진 추가' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '촬영하기', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '사진 보관함에서 선택하기', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '파일에서 선택하기', exact: true })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '취소', exact: true }))
    expect(screen.queryByRole('dialog', { name: '사진 추가' })).not.toBeInTheDocument()
  })

  it('adds pill photo sets at the end and only allows added sets to be removed', () => {
    render(
      <MemoryRouter initialEntries={['/identify/image']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '알약 1', exact: true })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '알약 1 삭제', exact: true })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '알약 추가', exact: true })).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: '알약 추가', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: '알약 추가', exact: true }))

    expect(screen.getByRole('heading', { name: '알약 2', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '알약 3', exact: true })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '알약 추가', exact: true })).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: '알약 2 삭제', exact: true }))
    expect(screen.queryByRole('heading', { name: '알약 3', exact: true })).not.toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: '알약 2', exact: true })).toHaveLength(1)
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
      fireEvent.change(screen.getByLabelText('앞면 사진 보관함에서 선택하기'), { target: { files: [file] } })

      expect(screen.getByAltText('앞면 업로드 미리보기')).toHaveAttribute('src', 'blob:front-preview')
      expect(createObjectURL).toHaveBeenCalledWith(file)

      fireEvent.click(screen.getByRole('button', { name: '앞면 사진 삭제', exact: true }))
      expect(screen.queryByAltText('앞면 업로드 미리보기')).not.toBeInTheDocument()
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:front-preview')

      fireEvent.drop(screen.getByRole('button', { name: '앞면 이미지 선택 영역', exact: true }), {
        dataTransfer: { files: [file] },
      })
      expect(screen.getByAltText('앞면 업로드 미리보기')).toHaveAttribute('src', 'blob:front-preview')
      expect(createObjectURL).toHaveBeenCalledTimes(2)
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
    expect(screen.getByRole('dialog', { name: '유효기간을 확인할 수 없어요' })).toBeInTheDocument()
    expect(screen.getByText('유효기간을 확인할 수 없는 의약품은 복용을 권장하기 어렵습니다. 복용 전 의사 또는 약사에게 확인해주세요.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '취소', exact: true }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('두통 증상으로 기록')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '복용하기', exact: true }))
    fireEvent.click(screen.getByRole('button', { name: '그래도 기록하기', exact: true }))
    expect(screen.getByText('목업 복용 기록')).toBeInTheDocument()
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

  it('redirects to login with a completion state after a successful signup call', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({
        isSuccess: true,
        code: 'USER_CREATE_SUCCESS',
        message: '회원 가입에 성공했습니다.',
        result: { userId: 1, loginId: 'pill-user', name: '홍길동' },
      })),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('성별'), { target: { value: 'FEMALE' } })
    fireEvent.change(screen.getByLabelText('생년월일'), { target: { value: '1998-04-12' } })
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'safe-password' } })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'safe-password' } })
    fireEvent.click(screen.getByRole('button', { name: '회원가입 완료' }))

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/user',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: '홍길동',
          loginId: 'pill-user',
          password: 'safe-password',
          gender: 'FEMALE',
          birthDate: '1998-04-12',
        }),
      }),
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument())
    expect(screen.getByRole('status')).toHaveTextContent('회원가입이 완료되었습니다')
    expect(screen.getByLabelText('아이디')).toHaveValue('pill-user')
  })

  it('shows the server error message when signup fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({
        isSuccess: false,
        code: 'DUPLICATE_LOGIN_ID',
        message: '이미 사용 중인 아이디입니다.',
      })),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('성별'), { target: { value: 'MALE' } })
    fireEvent.change(screen.getByLabelText('생년월일'), { target: { value: '1998-04-12' } })
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'safe-password' } })
    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'safe-password' } })
    fireEvent.click(screen.getByRole('button', { name: '회원가입 완료' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('이미 사용 중인 아이디입니다.')
    expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument()
  })

  it('keeps the signup action disabled until required values are complete', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: '회원가입 완료' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('성별'), { target: { value: 'MALE' } })
    fireEvent.change(screen.getByLabelText('생년월일'), { target: { value: '1998-04-12' } })
    fireEvent.change(screen.getByLabelText('이름'), { target: { value: '홍길동' } })
    fireEvent.change(screen.getByLabelText('아이디'), { target: { value: 'pill-user' } })
    fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'safe-password' } })

    expect(screen.getByRole('button', { name: '회원가입 완료' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('비밀번호 확인'), { target: { value: 'safe-password' } })
    expect(screen.getByRole('button', { name: '회원가입 완료' })).toBeEnabled()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })
})
