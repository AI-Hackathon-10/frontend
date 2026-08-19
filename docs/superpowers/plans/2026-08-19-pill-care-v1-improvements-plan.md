# 알약케어 ver 1.0 UI 개선 구현 계획

## 작업 순서

1. 증상 Chip, 결과 화면, 복용 확인 모달, 전역 응급실 전화 CTA의 테스트 계약을 추가한다.
2. Mock 데이터에 20개 증상과 결과 fallback, 사용기한 상태를 추가한다.
3. `AppShell`에 접근 가능한 응급실 전화 Floating Button을 연결한다.
4. `/identify/image`를 증상 선택 → 사진 미리보기 → Mock 결과 이동 흐름으로 변경한다.
5. `/search/results`를 선택 증상, 대표 약품, 보유약, 복용 확인 모달 흐름으로 변경한다.
6. 모바일 고정 CTA, 응급실 CTA, compact grid, 모달 및 결과 카드의 반응형 CSS를 보강한다.
7. 구현 문서와 기존 설계·계획 문서를 갱신하고 테스트·빌드·브라우저 검수를 수행한다.

## 주요 파일

- `src/data/mockData.js`
- `src/components/layout/EmergencyCallButton.jsx`
- `src/components/identify/SymptomSelector.jsx`
- `src/components/identify/UploadCard.jsx`
- `src/components/drugs/DrugResultHero.jsx`
- `src/components/drugs/OwnedDrugItem.jsx`
- `src/components/drugs/DoseConfirmModal.jsx`
- `src/pages/ImageIdentifyPage.jsx`
- `src/pages/SearchResultsPage.jsx`
- `src/components/layout/AppShell.jsx`
- `src/styles/global.css`
- `src/styles/tokens.css`
- `src/App.test.jsx`

## 검증 방법

```bash
npm run test -- --run src/App.test.jsx
npm run test -- --run
npm run build
```

브라우저에서는 390×844, 768×1024, 1440×900에서 증상 Chip, 고정 CTA, 응급실 링크, 사진 미리보기, 결과 카드와 모달을 확인한다.

## API 연결 보류

식품의약품안전처 의약품개요·낱알식별 API와 국립중앙의료원 응급의료기관 API의 응답 모델은 이번 단계에서 정의하지 않는다. 추후 Spring Boot API 설계가 완료되면 화면 컴포넌트가 참조하는 Mock 데이터 계층만 교체할 수 있도록 데이터와 UI를 분리한다.
