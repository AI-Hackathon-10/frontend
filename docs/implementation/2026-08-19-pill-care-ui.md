# 알약케어 프론트 UI 구현 기록

## 작업 범위

API 연결 전 정적 프론트 목업을 구현한다. React Router 기반 화면 전환, 반응형 AppShell, 의약품·증상·응급의료기관 목업 화면을 포함한다.

## 확정 사항

- React + Vite + JavaScript
- React Router + plain CSS
- 임시 브랜드명 `알약케어`
- 모바일 하단 내비게이션 / 데스크톱 상단 내비게이션
- 응급의료기관 중심의 SVG 지도 목업
- 실제 공공 API·서버 업로드·위치 조회·저장 기능 제외
- 응급의료기관 화면은 위치·운영 상태를 보여주는 정보 목업만 제공하며 전화 연결 기능은 제외

## 구현 파일

- 기반: `package.json`, `package-lock.json`, `vite.config.js`, `index.html`
- 엔트리: `src/main.jsx`, `src/App.jsx`
- 데이터: `src/data/mockData.js`
- 공통 셸: `src/components/layout/AppShell.jsx`, `GlobalNav.jsx`, `PageHeader.jsx`
- 공통 UI: `src/components/ui/Icon.jsx`, `Button.jsx`, `Badge.jsx`
- 의약품 UI: `src/components/drugs/DrugCard.jsx`, `DrugInfoTable.jsx`, `SafetySection.jsx`, `SearchBar.jsx`
- 기관 UI: `src/components/facilities/FacilityMap.jsx`, `FacilityCard.jsx`
- 일러스트: `src/components/illustrations/PillIllustration.jsx`
- 화면: `src/pages/HomePage.jsx`, `ImageIdentifyPage.jsx`, `ShapeSearchPage.jsx`, `SearchResultsPage.jsx`, `DrugDetailPage.jsx`, `SymptomPage.jsx`, `FacilitiesPage.jsx`
- 스타일: `src/styles/tokens.css`, `src/styles/global.css`
- 테스트: `src/App.test.jsx`, `src/test/setup.js`

## 라우트와 목업 범위

| 라우트 | 화면 | 구현 범위 |
| --- | --- | --- |
| `/` | 홈 | 이미지/외형 식별 진입, 증상·응급실 진입 |
| `/identify/image` | 사진 식별 | 증상 선택, 앞·뒷면 이미지 영역 기반 선택 메뉴, Mock 결과 진입 |
| `/identify/shape` | 외형 검색 | 제형·분할선·모양 필터 선택 목업 |
| `/search/results` | 검색 결과 | 선택 증상, 대표 약품, 보유약, 복용 확인 모달 |
| `/drugs/:drugId` | 약품 상세 | 제품 정보, 효능·사용 참고, 주의사항 |
| `/symptoms` | 증상 기록 | 증상 선택, 발생 시점, 메모, 의료진 전달용 요약 |
| `/facilities` | 응급의료기관 | SVG 지도 목업, 기관 카드, 전화 CTA 제외 |

모든 약품·기관·증상 내용은 `예시 데이터`이다. 사진은 서버로 전송하지 않고 브라우저에서만 미리보기하며, 응급실 전화 링크·Floating CTA·시설 카드 전화 버튼은 제공하지 않는다. 위치 조회, 지도 SDK, 실제 API 분석, 복용 기록 저장은 구현하지 않았다.

## ver 1.0 개선 구현

### 사용자 흐름

`/identify/image`에서 20개 증상 Chip을 복수 선택하고 앞면·뒷면 사진을 선택할 수 있다. 증상 하나 이상 선택 시에만 `알약 찾기`가 활성화되며, 사진 없이도 Mock 결과로 이동한다. 이동 시 `symptoms`와 `drugId`를 React Router state로 전달하고, `/search/results` 직접 접근·새로고침에서는 `DEMO_IDENTIFY_RESULT`를 사용한다.

결과 화면은 선택 증상, 대표 `프리메정`, 주요 효능, `사용기한 확인 불가`, 상세 링크, 다른 보유약 목록, `다시 찾기`·`복용하기` 액션으로 구성한다. `복용하기`는 `DoseConfirmModal`에서 사용기한과 AI 식별 오차를 안내한 후 확인을 받아 완료 상태만 표시한다.

### 추가 파일

- `src/components/identify/SymptomSelector.jsx`
- `src/components/identify/UploadCard.jsx`
- `src/components/drugs/DrugResultHero.jsx`
- `src/components/drugs/OwnedDrugItem.jsx`
- `src/components/drugs/DoseConfirmModal.jsx`
- `docs/superpowers/specs/2026-08-19-pill-care-v1-improvements-design.md`
- `docs/superpowers/plans/2026-08-19-pill-care-v1-improvements-plan.md`

### 후속 UI 조정

- 사진 식별 화면의 별도 사진 선택 버튼을 제거하고, 앞면·뒷면 예시 이미지 영역을 클릭하면 `촬영하기`, `앨범에서 선택하기`, `파일 탐색기에서 선택하기` 메뉴가 열린다.
- 파일은 계속 브라우저 메모리의 object URL로만 미리보기하며, 모바일 촬영 입력에는 `capture="environment"` 힌트를 사용한다.
- 홈 화면의 `최근 확인한 약품` 영역을 제거해 핵심 진입 카드 중심으로 단순화했다.
- 전역 응급실 전화 Floating Button과 기관 카드의 전화 액션을 제거했다. 응급의료기관 지도·목록 목업은 유지한다.

### API·저장 보류 범위

식품의약품안전처 의약품개요·낱알식별 API와 국립중앙의료원 응급의료기관 API는 아직 호출하지 않는다. 현재 화면은 API 응답을 받을 수 있는 데이터 구조를 유지한 정적 목업이며, Spring Boot·Nginx·Gemini Vision·인증·서버 저장은 후속 작업이다.

## 디자인 및 반응형 처리

- `#142B3A` 딥 네이비, `#1D8DCC` 블루, `#8AD7D6` 청록 토큰을 중심으로 구성했다.
- 데스크톱은 최대 1,180px 카드형 앱 셸과 상단 내비게이션을 사용한다.
- 880px 이하에서는 전체 폭 앱 셸, 모바일 헤더, 하단 고정 내비게이션으로 전환한다.
- 620px 이하에서는 카드 그리드가 1열로 바뀌고, 콘텐츠 좌우 여백과 제목 크기를 줄인다.
- `:focus-visible`, 최소 터치 높이, `overflow-x: hidden`을 적용했다.
- 모바일 하단 내비게이션이 앱 셸의 `backdrop-filter`에 의해 콘텐츠 하단으로 이동하는 문제를 실제 브라우저에서 재현하고, 모바일 구간에서 해당 효과를 해제해 뷰포트 하단 고정으로 수정했다.

## 검증 결과

### 자동 검증

- `npm run test -- --run`: 통과 — `src/App.test.jsx`, 21개 테스트
  - 기본 홈 렌더링
  - 내비게이션 링크 목적지
  - 7개 라우트별 제목 렌더링
- 약품 상세·응급의료기관 예시 데이터 렌더링
- 20개 증상 Chip 선택·해제 및 검색 버튼 활성화
- Router state 결과, Mock fallback, 대표 약품·사용기한 상태
- 복용 확인 모달 취소·확인 완료 상태
- 앞면·뒷면 예시 이미지 영역 클릭 후 세 가지 이미지 선택 방식 노출
- 파일 미리보기·삭제와 선택 후 메뉴 닫힘
- 응급실 전화 링크·Floating CTA·기관 카드 전화 버튼 미노출
- `npm run build`: 통과 — Vite 7.3.6, 67개 모듈 변환, `dist/` 생성

### 실제 브라우저 뷰포트 검수

- `390×844`: 모바일 헤더와 하단 내비게이션 표시, 가로 스크롤 없음
- `768×1024`: 모바일 헤더와 하단 내비게이션 표시, 홈 카드 2열 정렬, 가로 스크롤 없음
- `1440×900`: 데스크톱 상단 내비게이션 표시, 홈 카드 2열 정렬, 가로 스크롤 없음
- `/facilities` 모바일 화면: 제목, SVG 지도, 3개 기관 카드 목업이 렌더링됨
- CSS/SVG 기반 시각 요소와 로컬 선택 이미지 미리보기를 사용하며, 버튼·링크·미리보기에는 접근 가능한 텍스트, `aria-label` 또는 `alt`를 제공한다.

### ver 1.0 브라우저 검수

- `390×844`: 증상 Chip 20개·4열, 앞면/뒷면 사진 카드 2열, 가로 넘침 없음, 이미지 영역 클릭 메뉴가 화면 폭 안에 표시됨
- `768×1024`: 증상 4열, 사진 카드 2열, 모바일 헤더·하단 내비게이션 표시, 가로 넘침 없음
- `1440×900`: 데스크톱 상단 내비게이션 표시, 모바일 내비게이션 숨김, 전화 Floating CTA 미표시, 결과 대표 카드 폭 748px
- `/identify/image`에서 증상 선택 후 `/search/results` 이동과 선택 증상 표시 확인
- 결과 직접 접근 시 `두통`, `발열` fallback 확인
- 복용 확인 모달의 `role="dialog"`, 취소·확인 후 `role="status"` 완료 상태 확인
- 사진 파일 선택은 브라우저 object URL 미리보기와 삭제 시 URL 해제를 단위 테스트로 확인

## 실행 방법

```bash
npm install
npm run dev
```

## 후속 API 연결

다음 세 데이터 소스의 API 계약이 확정되면 `src/data/mockData.js`를 API 응답 매핑 계층으로 교체한다.

- 식품의약품안전처 의약품개요 정보
- 식품의약품안전처 의약품 낱알식별 정보
- 국립중앙의료원 전국 응급의료기관 정보

연결 시 우선순위는 `SearchBar`/식별 화면의 요청 상태, 약품 상세의 공공 데이터 필드 매핑, 응급의료기관 위치·운영 상태 갱신 순서로 진행한다. Spring Boot와 Nginx 연동은 API 계약 확정 이후 별도 작업으로 남겨두었다.
