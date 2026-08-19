# 알약케어 반응형 프론트 UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** API 연결 전에도 해커톤 시연에 사용할 수 있는 알약 식별·증상 문서화·응급의료기관 탐색 프론트 목업을 제공한다.

**Architecture:** React Router 기반의 화면별 페이지와 공통 AppShell을 사용한다. 화면은 로컬 목업 데이터를 props로 렌더링하고, 외부 API·지도 SDK·파일 업로드에는 의존하지 않는다.

**Tech Stack:** React, Vite, JavaScript, React Router, plain CSS, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-19-pill-care-ui-design.md`

## Global Constraints

- 브랜드명은 `알약케어`를 사용한다.
- 데이터는 정적 목업이며 모든 결과에 예시 데이터임을 표시한다.
- 보관함·설정·로그인·실제 API·Spring Boot·Nginx는 구현하지 않는다.
- 지도는 SVG 목업이며 실제 위치·길찾기·전화 동작은 제공하지 않는다.
- 화면은 모바일 하단 내비게이션과 데스크톱 상단 내비게이션을 제공한다.
- 터치 영역은 최소 44px이고 가로 스크롤이 없어야 한다.

### Task 1: Vite 기반과 테스트 기반 구성

**Files:**

- Create: `package.json`, `vite.config.js`, `index.html`
- Create: `src/main.jsx`, `src/App.jsx`
- Create: `src/App.test.jsx`, `src/test/setup.js`

- [x] Vite React JavaScript 프로젝트와 `react-router-dom`, Vitest, React Testing Library를 구성한다.
- [x] `npm run test -- --run`과 `npm run build` 스크립트를 추가한다.
- [x] 라우트별 화면이 존재해야 한다는 테스트를 먼저 작성하고, 화면이 없어서 실패하는지 확인한다.
- [x] 최소 App과 라우트 골격으로 테스트를 통과시킨다.

### Task 2: 데이터와 공통 디자인 시스템

**Files:**

- Create: `src/data/mockData.js`
- Create: `src/components/ui/Icon.jsx`, `src/components/ui/Button.jsx`
- Create: `src/components/layout/AppShell.jsx`, `src/components/layout/GlobalNav.jsx`
- Create: `src/styles/tokens.css`, `src/styles/global.css`

- [x] 약품, 기관, 증상 목업 데이터를 정의한다.
- [x] 인라인 SVG 아이콘과 공통 버튼을 만든다.
- [x] 데스크톱 헤더, 모바일 하단 내비게이션, 페이지 컨테이너를 구현한다.
- [x] 내비게이션 링크가 지정 라우트로 이동하는 테스트를 작성하고 통과시킨다.

### Task 3: 홈·식별·검색 화면

**Files:**

- Create: `src/pages/HomePage.jsx`, `src/pages/ImageIdentifyPage.jsx`
- Create: `src/pages/ShapeSearchPage.jsx`, `src/pages/SearchResultsPage.jsx`
- Create: `src/components/drugs/DrugCard.jsx`, `src/components/drugs/SearchBar.jsx`

- [x] 홈에 빠른 진입 카드, 최근 예시 약품, 참고용 안내를 배치한다.
- [x] 이미지 식별 화면에 앞면·뒷면 미리보기와 촬영/앨범 선택 UI를 배치한다.
- [x] 외형 검색 화면에 제형·분할선·모양 필터를 배치한다.
- [x] 검색 결과 화면에 예시 약품 리스트와 조건 칩을 배치한다.
- [x] 주요 CTA는 지정된 라우트로만 이동하도록 연결한다.

### Task 4: 상세·증상·기관 화면

**Files:**

- Create: `src/pages/DrugDetailPage.jsx`, `src/pages/SymptomPage.jsx`
- Create: `src/pages/FacilitiesPage.jsx`
- Create: `src/components/drugs/DrugInfoTable.jsx`, `src/components/drugs/SafetySection.jsx`
- Create: `src/components/facilities/FacilityMap.jsx`, `src/components/facilities/FacilityCard.jsx`

- [x] 의약품 상세에 식별 정보, 효능, 사용 참고, 주의사항을 구성한다.
- [x] 증상 문서화 화면에 선택 상태가 보이는 예시 증상, 발생 시점, 메모, 요약 카드를 구성한다.
- [x] 응급의료기관 화면에 반응형 SVG 지도, 마커, 기관 리스트, 전화 CTA를 구성한다.
- [x] 실제 전화·업로드·지도·위치 기능은 실행하지 않는다.

### Task 5: 문서화와 검증

**Files:**

- Modify: `docs/implementation/2026-08-19-pill-care-ui.md`

- [x] 구현 파일, 라우트, 목업 데이터 경계, API 연결 보류 사항을 작업 기록에 적는다.
- [x] 라우트·내비게이션 테스트를 실행한다.
- [x] `npm run build`를 실행한다.
- [x] 390×844, 768×1024, 1440×900에서 가로 스크롤·내비게이션·카드 정렬을 확인한다.
- [x] 검증 결과와 남은 후속 작업을 구현 기록에 적는다.

### Task 6: ver 1.0 흐름 개선

**Spec:** `docs/superpowers/specs/2026-08-19-pill-care-v1-improvements-design.md`

- [x] 증상 20개 선택과 로컬 사진 미리보기를 `/identify/image`에 연결한다.
- [x] Router state와 Mock fallback으로 `/search/results` 결과를 구성한다.
- [x] 대표 약품·보유약 목록·복용 확인 모달을 추가한다.
- [x] 모든 주요 라우트에 Mock `tel:` 응급실 Floating Button을 추가한다.
- [x] 모바일 고정 CTA와 모달 z-index, 하단 여백을 반응형 CSS에 반영한다.
- [x] 20개 화면 계약 테스트와 파일 미리보기·삭제 테스트를 추가한다.
