import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon.jsx'

export default function VoiceIdentifyPage() {
  return (
    <div className="page page--narrow voice-page">
      <div className="page-header"><span className="eyebrow">VOICE SEARCH</span><h1>보이스로 알약 찾기</h1><p>음성으로 증상이나 약 정보를 말해 탐색해요</p></div>
      <section className="voice-page__card" aria-label="보이스 검색 준비 중">
        <span className="voice-page__icon"><Icon name="mic" size={30} /></span><h2>보이스 검색을 준비하고 있어요</h2><p>현재는 사진으로 알약 찾기를 이용해 주세요.</p><Link className="button button--primary" to="/identify/image">사진으로 알약 찾기</Link>
      </section>
    </div>
  )
}
