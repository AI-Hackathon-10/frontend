import Icon from '../ui/Icon.jsx'

export default function FacilityMap({ facilities }) {
  return (
    <div className="facility-map" role="img" aria-label="주변 응급의료기관 위치를 표시한 예시 지도">
      <div className="map-topbar"><span><Icon name="location" size={16} /> 성남시 분당구</span><span className="map-topbar__live"><i /> 목업 위치</span></div>
      <svg className="map-lines" viewBox="0 0 700 470" aria-hidden="true" preserveAspectRatio="none">
        <path d="M-20 340C160 305 220 360 340 290s250-40 390-120" />
        <path d="M-40 120c150 45 200 15 340 95s225 80 430 60" />
        <path d="M145-20c75 120 50 205 105 310s130 120 150 205" />
        <path d="M430-20c-10 120 20 170 90 240s100 160 110 280" />
        <path className="map-lines__river" d="M-20 430c140-90 190-20 285-110s150-75 260-180 100-90 210-115" />
        <path className="map-lines__minor" d="M70 40 220 430M580 10 355 470M25 255h650M300 0 440 470" />
      </svg>
      <div className="map-area-label map-area-label--one">판교</div>
      <div className="map-area-label map-area-label--two">정자</div>
      <div className="map-area-label map-area-label--three">서현</div>
      <span className="map-location-dot" aria-label="현재 위치" />
      {facilities.map((facility, index) => (
        <span
          className={`map-marker ${index === 0 ? 'is-selected' : ''}`}
          key={facility.id}
          style={facility.mapPosition}
          title={facility.name}
        >
          <Icon name="location" size={24} />
        </span>
      ))}
      <div className="map-legend"><span><i className="legend-dot legend-dot--current" />현재 위치</span><span><i className="legend-dot legend-dot--facility" />응급의료기관</span></div>
    </div>
  )
}
