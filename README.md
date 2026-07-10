# 🔥 사우나 여행 코스 메이커 (Sauna Travel Planner)

한국 **사우나·찜질방·온천**을 축으로, **맛집·볼거리·숙소**를 엮어 맞춤형 여행 코스를 생성하는 인터랙티브 웹앱입니다.

> 지역 / 세부지역(시군구) / 기간 / 취향을 입력하면 → 일자별 타임라인(장소·시간·추천이유·팁·예상비용·추천지수)을 생성합니다.

## ✨ 기능

- **전국 커버리지**: 17개 시도 + 경주(독립 region), 230개 시군구 선택 가능
- **실시간 카카오 로컬 검색**: 선택 시군구 반경 10km 내 사우나/찜질방/온천/숙소를 실시간 조회 (키 필요, 무료)
- **온천·사우나 보유 숙소 자동 포함**: 2일차 이상이거나 숙소 옵션 켜면, 코스 마지막에 숙소를 자동 배치 (매일 다른 숙소)
- **추천지수(rating)**: 카카오는 리뷰/평점을 제공하지 않아, 가격대·온천보유·태그·정보완성도 기반 자체 산출 지표로 배지 표시
- **AI 생성 + 규칙 기반 폴백**: OpenRouter 무료 모델 우선, 실패/타임아웃 시 항상 폴백 코스로 동작
- **웰니스 강조**: 하루 1회 사우나 집중, 수분 500ml 안내, 사우나 전후 버퍼
- **공유 URL**: 설정(지역/시군구/기간/취향)이 URL에 보존되어 복원·공유 가능
- **전국 지도 자유 선택**: 지역 지도에서 임의 시군구 클릭 + 드롭다운 선택

## 🧱 기술 스택

- **Next.js 15.5** (App Router) · React 19 · TypeScript · Tailwind CSS
- **Zod** (입력/코스 스키마 검증) · **Vitest** (단위) · **Playwright** (E2E)
- **카카오 로컬 검색 REST API** (실시간 사우나/숙소, 무료·심사 없음)
- **OpenRouter API** (무료 LLM, `json_schema` 강제)
- **tourAPI** (한국관광공사, 폴백 데이터 소스)
- **Leaflet + OpenStreetMap** (지도, API 키 불필요)

## 🚀 로컬 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

AI 생성 없이도 폴백으로 동작합니다. 실시간 데이터/AI 사용 시 환경변수 등록:

```bash
cp .env.example .env.local
# KAKAO_REST_KEY=...        (카카오 개발자센터 REST API 키)
# OPENROUTER_API_KEY=sk-or-...  (선택, 미설정 시 폴백)
# TOURAPI_KEY=...           (선택, 폴백용)
```

> ⚠️ **보안**: 모든 키는 서버 환경변수(`.env.local`, Vercel/호스트 env)에서만 관리. 클라이언트 번들에 노출되지 않음.

## 🧪 테스트 / 검증

```bash
npm test           # vitest 단위 (카카오 키 있으면 live 병합 테스트도 실행, 없으면 skip)
npm run typecheck  # 타입 검증
npm run lint       # ESLint
npm run build      # 프로덕션 빌드
npm run test:e2e   # Playwright E2E (10개 시나리오)
```

| 게이트 | 상태 |
|---|---|
| 타입체크 | ✅ 0 error |
| 단위 테스트 | ✅ 33 passed |
| E2E (Playwright) | ✅ 10 passed |
| 빌드 | ✅ 성공 |

## 📦 배포 (Vercel Free)

1. GitHub 저장소 import → Framework: Next.js (자동 감지)
2. 환경변수 등록: `KAKAO_REST_KEY`, `OPENROUTER_API_KEY`(선택), `TOURAPI_KEY`(선택)
3. Deploy → 서버리스 Function(`/api/course`, `/api/places`) 자동 동작

> 서버리스 타임아웃 고려: LLM 호출은 10초 하드 타임아웃 후 즉시 폴백.

## 📁 프로젝트 구조

```
src/
├── data/         # 스키마(schema), 시드(seed), 시군구(sigungu), 추천지수(rating)
├── ai/           # 코스 스키마·프롬프트·LLM 호출·폴백·엔진 오케스트레이션
├── lib/          # 카카오/kakao, tourAPI 연동
├── app/          # 페이지 + API 라우트 (/api/course, /api/places)
└── components/   # 입력 폼(PlannerForm)·결과 뷰(CourseView)·지도 피커
scripts/          # build-sigungu.mjs (전국 시군구 좌표 수집)
```

## 🔑 핵심 설계 결정

- **카카오 리뷰 부재 대응**: 평점 대신 `* 추천지수(rating)`를 자체 산출해 배지 표시
- **숙소 자동 포함**: 다일차 여행 또는 옵션 켜짐 → 코스 마지막 stop(21:00)에 숙소 배치, 매일 다른 숙소 지향
- **fail-soft**: LLM/외부 API 실패 시 항상 규칙 기반 코스로 응답 (런타임 중단 없음)
- **무료 유지**: Vercel Free + GitHub Actions + 카카오/OpenRouter 무료 티어

## 🗺 로드맵

- tourAPI areaCode 매핑 실검증 및 자동 보강 워크플로우
- 실제 숙소 live 데이터 품질 향상 (온천/사우나 보유 추론 정교화)
- 코스 지도 시각화 (이동 동선)
- 사용자 코스 북마크/공유 확장
