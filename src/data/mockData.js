export const DRUGS = [
  {
    id: 'prime-tablet',
    name: '프리메정',
    englishName: 'Prime Tab.',
    manufacturer: '한국프라임제약(주)',
    ingredient: '[M214134] 덱시부프로펜',
    classification: '해열·진통·소염제',
    shape: '장방형',
    form: '필름코팅정',
    color: '분홍색',
    imprintFront: 'PM',
    imprintBack: '|',
    imageVariant: 'pink',
    similarity: 94,
    effect: '통증과 열감을 완화하는 데 참고할 수 있는 의약품 정보입니다.',
    usage: '복용 전 제품 설명서와 의사·약사의 안내를 확인하세요.',
    cautions: ['운전·기계조작 전 주의가 필요한 성분이 포함될 수 있습니다.', '개인의 상태에 따라 복용 방법이 달라질 수 있습니다.'],
    cautionTags: ['운전/기계조작', '졸음', '어지러움'],
    expirationStatus: 'unknown',
  },
  {
    id: 'opm-capsule',
    name: '오피엠캡슐',
    englishName: 'OPM Capsule',
    manufacturer: '(주)마더스제약',
    ingredient: '오메프라졸',
    classification: '소화성궤양용제',
    shape: '경질캡슐',
    form: '캡슐',
    color: '적갈색·연분홍색',
    imprintFront: 'MTS OPM',
    imprintBack: '없음',
    imageVariant: 'red',
    effect: '위산 관련 증상에 대한 의약품 정보를 확인할 수 있습니다.',
    usage: '증상과 복용 이력에 따라 전문가와 상담해 사용하세요.',
    cautions: ['장기간 복용이 필요한 경우 전문가의 상담이 필요합니다.'],
    cautionTags: ['복용 전 상담', '개인차'],
    expirationStatus: 'valid',
  },
  {
    id: 'youngpoong-capsule',
    name: '영풍다나졸캡슐',
    englishName: 'Danazol Capsule',
    manufacturer: '영풍제약(주)',
    ingredient: '다나졸',
    classification: '호르몬 관련 의약품',
    shape: '경질캡슐',
    form: '캡슐',
    color: '청색·백색',
    imprintFront: 'YSP',
    imprintBack: '없음',
    imageVariant: 'blue',
    effect: '의약품 성분과 주의 정보를 확인하기 위한 예시 데이터입니다.',
    usage: '복용 여부와 용량은 의료진의 처방 및 안내를 따라야 합니다.',
    cautions: ['임의로 복용을 시작하거나 중단하지 마세요.'],
    cautionTags: ['처방 확인', '전문가 상담'],
    expirationStatus: 'expired',
  },
]

export const SYMPTOM_OPTIONS = [
  '두통', '발열', '기침', '인후통', '콧물',
  '코막힘', '복통', '소화불량', '설사', '변비',
  '속쓰림', '구토/메스꺼움', '근육통', '생리통', '치통',
  '알레르기', '피부 가려움', '몸살', '어지러움', '오한',
]

export const PRIMARY_SYMPTOMS = [
  '두통', '발열', '기침', '콧물·코막힘', '인후통', '복통', '소화불량·속쓰림', '설사',
]

export const SYMPTOM_CATEGORIES = [
  { name: '감기·호흡기', symptoms: ['기침', '콧물', '코막힘', '재채기', '인후통', '가래', '발열', '오한'] },
  { name: '머리·전신', symptoms: ['두통', '어지러움', '몸살', '피로'] },
  { name: '소화기', symptoms: ['복통', '소화불량', '속쓰림', '설사', '변비', '메스꺼움', '구토'] },
  { name: '근육·통증', symptoms: ['근육통', '관절통', '허리통증', '목통증', '어깨통증', '치통'] },
  { name: '피부', symptoms: ['가려움', '발진', '두드러기'] },
]

export const DEMO_IDENTIFY_RESULT = {
  status: 'success',
  drugId: 'prime-tablet',
  symptoms: ['두통', '발열'],
}

export const MOCK_MEDICATION_RECORDS = {
  'prime-tablet': [
    { id: 'dose-prime-1', takenAt: '2026-08-19T14:30:00+09:00', note: '두통 증상으로 기록' },
  ],
  'opm-capsule': [
    { id: 'dose-opm-1', takenAt: '2026-08-18T21:10:00+09:00', note: '저녁 복용 기록' },
  ],
}

export const EXPIRATION_STATUS = {
  valid: { label: '유효기간 확인됨', tone: 'valid' },
  unknown: { label: '유효기간 확인 불가', tone: 'unknown' },
  expired: { label: '유효기간 경과', tone: 'expired' },
}

export const DEMO_SYMPTOM_NOTE = {
  symptoms: ['두통', '발열'],
  onset: '오늘 오후부터',
  severity: '중간 정도',
  memo: '오후부터 몸이 무겁고 미열이 있는 느낌입니다.',
  summary: '오늘 오후부터 두통과 발열이 시작되었고, 증상은 중간 정도로 느껴집니다.',
}

export const MOCK_USER_PROFILE = {
  name: '홍길동',
  id: 'pillcare-user',
  gender: 'undisclosed',
  birthDate: '1995-08-19',
}

export const SYMPTOM_REPORTS = [
  {
    id: 'report-2026-08-19',
    title: '두통·발열 증상 기록',
    createdAt: '2026-08-19T14:30:00+09:00',
    symptoms: ['두통', '발열'],
    severity: '중간 정도',
    summary: '오늘 오후부터 두통과 발열이 시작되었고, 증상은 중간 정도로 느껴집니다.',
    documentImageUrl: 'https://example.com/presigned/symptom-report-1.png',
  },
  {
    id: 'report-2026-08-12',
    title: '기침·인후통 증상 기록',
    createdAt: '2026-08-12T21:10:00+09:00',
    symptoms: ['기침', '인후통'],
    severity: '가벼움',
    summary: '기침과 인후통이 가볍게 느껴지는 상태입니다.',
    documentImageUrl: 'https://example.com/presigned/symptom-report-2.png',
  },
]

export const SYMPTOM_REPORTS_STORAGE_KEY = 'pill-care-symptom-reports'

export function createSymptomReport({ symptoms, onsetDate, onsetTime, memo }) {
  const onsetLabel = [onsetDate, onsetTime].filter(Boolean).join(' ')
  const symptomsLabel = symptoms.length > 0 ? symptoms.join('과 ') : '기타 증상'

  return {
    id: `report-${Date.now()}`,
    title: `${symptomsLabel} 증상 기록`,
    createdAt: new Date().toISOString(),
    symptoms,
    severity: '사용자 입력 기록',
    summary: [onsetLabel && `${onsetLabel}부터`, memo].filter(Boolean).join(' · ') || '사용자가 작성한 증상 기록입니다.',
    documentImageUrl: 'https://example.com/presigned/mock-symptom-report.png',
  }
}

export function getDrugById(drugId) {
  return DRUGS.find((drug) => drug.id === drugId) ?? DRUGS[0]
}
