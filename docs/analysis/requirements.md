# 요구사항 분석 (Requirements Analysis)

> Phase: Analysis · 문서 버전: v0.1 · 날짜: 2026-07-09
> 상위 문서: PRD.md, IA.md

## 1. 기능적 요구사항 (Functional Requirements)

| ID | 요구사항 | 우선순위 | 수용 기준 |
|----|----------|----------|-----------|
| FR-1 | 사용자는 지역(서울/부산/강원/경주/제주 등)을 선택할 수 있다 | Must | 드롭다운에 정의된 Region enum 값 전체 노출 |
| FR-2 | 사용자는 기간(1~4일)을 선택할 수 있다 | Must | 1~4 정수만 입력 허용, 벗어나면 검증 오류 |
| FR-3 | 사용자는 취향을 다중 선택할 수 있다 | Must | quiet/budget/premium/family/solo/outdoor_spa/foodie 중 0~N 선택 |
| FR-4 | 사용자는 특이사항을 자유텍스트로 입력할 수 있다 | Should | 500자 이내, 선택 입력 |
| FR-5 | 시스템은 입력 기반으로 일자별 여행 코스를 생성한다 | Must | Day N개(=기간), 각 Day는 시간순 Stop 배열 |
| FR-6 | 각 Stop은 장소명·추천이유·시간·팁을 포함한다 | Must | CourseSchema 필드 충족 |
| FR-7 | 시스템은 예상 비용(원)과 코스 요약을 제공한다 | Must | estCostKrw, summary 필드 존재 |
| FR-8 | LLM 호출 실패/키 누락 시에도 기본 코스를 제공한다 | Must | 폴백 경로가 결괴 없이 Course 반환, usedFallback 플래그 |
| FR-9 | 사용자는 동일 입력으로 코스를 재생성할 수 있다 | Should | "다시 만들기" 버튼 동일 input 재전송 |
| FR-10 | 생성된 코스는 모바일에서 가독성 있게 렌더된다 | Must | 375px 폭에서 스크롤·터치 영역 ≥44px |

## 2. 비기능적 요구사항 (Non-Functional Requirements)

| ID | 범주 | 요구사항 | 수용 기준 / 목표치 |
|----|------|----------|---------------------|
| NFR-1 | 성능 | 코스 생성 응답 시간 | LLM 정상 시 P95 < 15초, 폴백 < 1초 |
| NFR-2 | 가용성 | 코스 생성 성공률 | 폴백 포함 ≥ 95% |
| NFR-3 | 보안 | API 키 노출 금지 | 키는 서버리스 환경변수만, 클라이언트 번들에 미포함 (빌드 시 .env.local 제외) |
| NFR-4 | 품질 | 타입 안정성 | `tsc --noEmit` 0 에러, Strict 모드 |
| NFR-5 | 품질 | 테스트 커버리지 | 데이터/엔진 로직 단위 테스트 통과(CI에서 강제) |
| NFR-6 | 유지보수 | CI 자동화 | push/PR 시 lint+typecheck+test 자동 실행 |
| NFR-7 | 접근성 | 기본 a11y | 폼 label 명시, 시맨틱 마크업, 콘트라스트 AA |
| NFR-8 | 국제화 | 언어 | v1 한국어 단일(추후 확장 고려, 코드 레이어 분리 유지) |

## 3. 제약 사항 (Constraints)

- C-1: 무료 서버리스 호스팅(Vercel/Cloudflare) — 런타임 제약(실행 시간 한도 등) 고려
- C-2: 무료 LLM 모델 사용 — 레이트리밋·출력 품질 편차 존재
- C-3: v1은 정적 curated 데이터 — 실시간 크롤링/예약 불가
- C-4: GitHub 저장소 기반 형상관리, 커밋 단위 산출물 추적

## 4. 범위 밖 (Out of Scope, v1)

- 실시간 예약/결제, 사용자 계정/로그인, 다국어, 실시간 리뷰 집계
- (상세는 PRD.md §5 참조)

## 5. 요구사항 추적성

| 요구사항 | 설계 산출물 | 구현 Task |
|----------|-------------|-----------|
| FR-1~4 | IA.md 입력 폼 / schema.ts PlannerInputSchema | Task 3-2 |
| FR-5~7 | course.schema.ts CourseSchema | Task 2-1, 2-3 |
| FR-8 | fallback.ts | Task 2-4 |
| FR-9 | CourseView + API | Task 3-3, 3-4 |
| FR-10 | globals.css / tailwind | Task 3-5 |
| NFR-3 | route.ts (서버키) / vercel.json | Task 3-3, 4-2 |
| NFR-5/6 | *.test.ts / ci.yml | Phase 1~2 테스트, Task 4-1 |
