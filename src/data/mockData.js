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

export const FACILITIES = [
  {
    id: 'seongnam-emergency',
    name: '성남중앙응급의료센터',
    type: '응급의료기관',
    distance: '1.8km',
    address: '경기도 성남시 분당구 중앙로 48',
    phone: '031-000-1199',
    status: '진료 가능 여부 확인 필요',
    mapPosition: { left: '51%', top: '46%' },
  },
  {
    id: 'bundang-medical-center',
    name: '분당새봄병원 응급실',
    type: '응급의료기관',
    distance: '2.6km',
    address: '경기도 성남시 분당구 돌마로 72',
    phone: '031-000-8272',
    status: '24시간 운영 정보 확인',
    mapPosition: { left: '69%', top: '62%' },
  },
  {
    id: 'pangyo-emergency',
    name: '판교안심의료원 응급실',
    type: '응급의료기관',
    distance: '4.1km',
    address: '경기도 성남시 수정구 판교로 110',
    phone: '031-000-4110',
    status: '진료 가능 여부 확인 필요',
    mapPosition: { left: '30%', top: '31%' },
  },
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

export const SYMPTOM_OPTIONS = SYMPTOM_CATEGORIES.flatMap(({ symptoms }) => symptoms)

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

export function getDrugById(drugId) {
  return DRUGS.find((drug) => drug.id === drugId) ?? DRUGS[0]
}
