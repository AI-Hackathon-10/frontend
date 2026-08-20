import PageHeader from '../components/layout/PageHeader.jsx'
import Badge from '../components/ui/Badge.jsx'
import Icon from '../components/ui/Icon.jsx'
import { useAuth } from '../components/user/AuthProvider.jsx'

const genderLabels = { FEMALE: '여성', MALE: '남성' }

export default function MyPage() {
  const { user } = useAuth()

  return (
    <div className="page page--account page--mypage">
      <PageHeader
        description="가입한 사용자 정보를 확인할 수 있어요."
        eyebrow="내 건강 기록"
        title="마이페이지"
      />

      <section className="profile-card" aria-labelledby="profile-card-title">
        <div className="profile-card__topline">
          <div className="profile-card__identity">
            <span className="profile-card__avatar"><Icon name="shield" size={23} /></span>
            <div><span className="eyebrow">가입 정보</span><h2 id="profile-card-title">{user?.name ?? '사용자'}</h2></div>
          </div>
          <Badge tone="mint">인증됨</Badge>
        </div>
        <dl className="profile-card__details">
          <div><dt>아이디</dt><dd>{user?.id ?? '-'}</dd></div>
          <div><dt>성별</dt><dd>{genderLabels[user?.gender] ?? '-'}</dd></div>
          <div><dt>생년월일</dt><dd>{user?.birthDate ?? '-'}</dd></div>
        </dl>
      </section>
    </div>
  )
}
