# 사우나 중심 여행 추천 웹앱 (Sauna Travel Planner) 구현 계획

> **For Hermes:** plan 모드 산출물. 실행은 승인 후 subagent-driven-development 방식으로 task 단위 진행.

**Goal:** 사용자가 "지역 / 기간 / 취향"을 입력하면, AI가 한국 사우나·찜질방·온천을 중심으로 맛집·볼거리를 엮은 맞춤형 1일~N일 여행 코스를 생성하는 인터랙티브 웹앱을 만든다.

**Architecture:** Next.js(App Router, TypeScript) 정적 프론트 + 서버리스 API 라우트. API 라우트가 LLM(OpenRouter 무료 모델)을 호출해 코스를 생성하고, 생성 근거는 repo 내 curated seed 데이터(JSON)에서 가져온다. 실시간 LLM 호출이 필요하므로 순수 GitHub Pages 단독은 불가 → 코드/CI는 GitHub, 실행 호스팅은 무료 서버리스(Vercel 또는 Cloudflare Pages+Worker) 사용.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, OpenRouter API (무료 모델: `nousresearch/hermes-3-llama-3.1-405b:free` 등), Zod(스키마 검증), Vitest(단위 테스트), GitHub Actions(CI).

---

## 결정 필요 사항 (기본값 제안)

1. **데이터 소스** — 기본값: **직접 큐레이션한 seed JSON** (v1). 법적/기술적 리스크 없고 즉시 동작. 후속 단계에서 공공데이터포털(한국관광공사 tourAPI), 위키트래블, 리뷰 크롤링으로 보강.
2. **배포 호스트** — 기본값: **Vercel(Free)** 또는 **Cloudflare Pages + Worker**. GitHub Pages는 실시간 LLM 시크릿 노출 위험으로 부적합. 코드는 GitHub에 두고 Actions로 lint/test/type-check 수행.
3. **LLM 키 관리** — 서버리스 환경 변수(`OPENROUTER_API_KEY`)에 보관. 클라이언트로 노출 금지.

---

## Phase 0 — 기획 산출물 (현재 단계)

### Task 0-1: PRD / 기능 명세 작성
**Objective:** 무엇을 만드는지 이해관계자용으로 정리.
**Files:** Create `docs/PRD.md`
**Step:** 아래 항목 포함해 작성 — 배경, 목표 사용자, 핵심 가치, 주요 기능(MVP scope), 범위 밖(Non-goals), 성공 지표.
**검증:** PRD.md 존재 및 섹션 6개(배경/사용자/기능/Non-goals/KPI/제약) 충족.

### Task 0-2: 데이터 스키마 정의
**Objective:** 사우나/맛집/볼거리를 통일된 형태로 표현할 스키마 확정.
**Files:** Create `src/data/schema.ts` (Zod 스키마)
**Step:** 아래 스키마 작성.

```ts
import { z } from "zod";

export const PlaceType = z.enum(["sauna", "jjimjilbang", "spa", "restaurant", "attraction"]);
export const Region = z.enum(["seoul", "busan", "gangwon", "gyeongju", "jeju", "incheon", "daejeon", "gwangju", "daegu"]);

export const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: PlaceType,
  region: Region,
  city: z.string(),                 // 상세 시군구
  summary: z.string(),              // 한 줄 설명
  tags: z.array(z.string()),        // 예: ["황토", "족욕", "가성비"]
  priceLevel: z.enum(["low", "mid", "high"]),
  avgDurationMin: z.number(),       // 체류 권장 분
  address: z.string().optional(),
  url: z.string().url().optional(),
  openHours: z.string().optional(),
  highlights: z.array(z.string()),  // 추천 포인트
});
export type Place = z.infer<typeof PlaceSchema>;

export const RegionSchema = z.object({
  id: Region,
  name: z.string(),
  blurb: z.string(),                // 지역 한 줄 소개
  places: z.array(PlaceSchema),
});
export type RegionData = z.infer<typeof RegionSchema>;
```

**검증:** `npx tsc --noEmit` 통과 (스키마 파일만 우선).

### Task 0-3: 정보 아키텍처 / 사용자 플로우
**Objective:** 화면 구성과 입력→출력 흐름 정의.
**Files:** Create `docs/IA.md`
**Step:** 작성 항목 — (1) 입력 화면: 지역 선택(드롭다운), 기간(1~4일), 취향(다중선택: 조용한/가성비/프리미엄/가족/혼자/야외온천/음식중심), 특이사항(자유텍스트). (2) 로딩 상태. (3) 결과 화면: 일자별 타임라인(시간/장소/설명/이동팁), 지도 링크, 예상 비용. (4) 공유/다시 생성 버튼.

### Task 0-4: 초기 시드 데이터 설계(지역 3곳 샘플)
**Objective:** 스키마에 맞는 실제 데이터 일부를 먼저 만들어 형태 검증.
**Files:** Create `src/data/seed.sample.ts`
**Step:** 서울/부산/강원 각 3~5개 장소(사우나 2 + 맛집 2 + 볼거리 1)를 위 스키마로 작성. 나중에 전체 seed로 확장.

---

## Phase 1 — 데이터 구축

### Task 1-1: 전체 시드 데이터셋 작성
**Objective:** 주요 지역별로 사우나·맛집·볼거리를 채운 JSON/TS 데이터셋 완성.
**Files:** Create `src/data/seed.ts` (RegionData[])
**Step:** 지역별 최소 사우나 3 + 맛집 3 + 볼거리 2. 실제 존재하는 곳 위주로 작성(예: 서울 *두산위브더제니스 사우나*, 부산 *해운대 스파빌*, 강원 *평창 온천*, 경주 *황남빵/첨성대* 등).
**검증:** Task 1-2 테스트로 스키마 일치 확인.

### Task 1-2: 데이터 검증 스크립트 + 테스트
**Objective:** 시드 데이터가 스키마/필수 필드를 위반하지 않음을 보장.
**Files:** Create `src/data/seed.test.ts`
**Step:**
```ts
import { RegionSchema } from "./schema";
import { regions } from "./seed";
test("모든 region이 스키마를 따른다", () => {
  regions.forEach((r) => expect(RegionSchema.parse(r)).toBeTruthy());
});
test("각 region은 사우나≥3, 맛집≥3, 볼거리≥2", () => {
  regions.forEach((r) => {
    const by = (t: string) => r.places.filter((p) => p.type === t).length;
    expect(by("sauna") + by("jjimjilbang") + by("spa")).toBeGreaterThanOrEqual(3);
    expect(by("restaurant")).toBeGreaterThanOrEqual(3);
    expect(by("attraction")).toBeGreaterThanOrEqual(2);
  });
});
```
**Run:** `npx vitest run src/data/seed.test.ts` → PASS.

---

## Phase 2 — AI 추천 엔진

### Task 2-1: 출력 코스 JSON 스키마 정의
**Objective:** LLM이 내놓을 코스 구조를 고정.
**Files:** Create `src/ai/course.schema.ts`
```ts
import { z } from "zod";
export const CourseStopSchema = z.object({
  time: z.string(),            // "10:00"
  placeId: z.string(),         // seed의 id 참조(가능 시)
  title: z.string(),
  reason: z.string(),          // 추천 이유
  tip: z.string().optional(),  // 이동/준비 팁
});
export const DaySchema = z.object({
  day: z.number(),
  theme: z.string(),
  stops: z.array(CourseStopSchema),
});
export const CourseSchema = z.object({
  region: z.string(),
  days: z.array(DaySchema),
  estCostKrw: z.number(),
  summary: z.string(),
});
export type Course = z.infer<typeof CourseSchema>;
```

### Task 2-2: 프롬프트 템플릿 설계
**Objective:** 지역/기간/취향 + 시드 데이터를 넣어 일관된 JSON을 유도.
**Files:** Create `src/ai/prompt.ts`
**Step:** 시스템 프롬프트(한국어, 사우나 중심 여행 전문가 역할, JSON만 출력, 온도/수분/휴식 강조) + 유저 프롬프트(region/기간/취향 + 시드 JSON 일부 직렬화). `response_format`은 라우트에서 `json_schema`로 강제.

### Task 2-3: LLM 호출 모듈
**Objective:** OpenRouter 호출 + JSON 파싱 + 검증.
**Files:** Create `src/ai/generate.ts`
**Step:** `POST https://openrouter.ai/api/v1/chat/completions` 호출(모델 무료, `response_format={type:"json_schema", json_schema:{...CourseSchema}}`), `CourseSchema.safeParse`로 검증. 실패 시 Task 2-4 폴백.

### Task 2-4: 규칙 기반 폴백 추천
**Objective:** LLM 실패/키 없음 시에도 동작하는 deterministic 추천.
**Files:** Create `src/ai/fallback.ts`
**Step:** 기간/취향에 따라 시드에서 사우나·맛집·볼거리 점수 매기고 시간대 배치(오전 사우나→점심 맛집→오후 볼거리→저녁 맛집). `generateCourse()`가 LLM 실패 시 이 함수 호출.

### Task 2-5: 엔진 단위 테스트
**Objective:** 폴백·파싱 로직 검증.
**Files:** Create `src/ai/engine.test.ts`
**Step:** (1) `fallback`이 기간=2일 입력에 2일 코스 생성, (2) 잘못된 JSON 파싱 시 safeParse 실패 처리, (3) 프롬프트에 취향 토큰 포함 확인.
**Run:** `npx vitest run src/ai/` → PASS.

---

## Phase 3 — 웹앱 (Next.js)

### Task 3-1: Next.js 프로젝트 스캐폴드
**Objective:** App Router 프로젝트 생성.
**Step:** `npx create-next-app@latest . --ts --tailwind --app --no-src-dir` (src dir 사용 시 `--src-dir`). 이후 `src/` 구조로 정리.
**검증:** `npm run dev` 로컬 기동.

### Task 3-2: 입력 폼 UI
**Objective:** 지역/기간/취향 입력 컴포넌트.
**Files:** Create `src/app/page.tsx`, `src/components/PlannerForm.tsx`
**Step:** 드롭다운(region), 숫자(기간 1~4), 체크박스(취향), 텍스트(특이사항). 제출 시 `/api/course` 호출.

### Task 3-3: API 라우트
**Objective:** 폼 입력을 받아 코스 생성 후 반환.
**Files:** Create `src/app/api/course/route.ts`
**Step:** body 파싱(Zod), `generateCourse(input)` 호출, `CourseSchema`로 응답. 키 누락 시 폴백 사용 + 경고 플래그.

### Task 3-4: 결과 코스 UI
**Objective:** 일자별 타임라인 렌더.
**Files:** Create `src/components/CourseView.tsx`
**Step:** Day별 카드, 시간/장소/이유/팁, 예상 비용, 다시 생성 버튼. 모바일 반응형.

### Task 3-5: 스타일/UX 다듬기
**Objective:** 사우나 무드(따뜻한 톤) 테마, 로딩 스켈레톤.
**Files:** Modify `src/app/globals.css`, `tailwind.config.ts`

---

## Phase 4 — 배포 & 자동화

### Task 4-1: CI 워크플로우
**Objective:** push/PR 시 lint·typecheck·test 자동화.
**Files:** Create `.github/workflows/ci.yml`
**Step:** Node 설치 → `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npx vitest run`.

### Task 4-2: 배포 설정
**Objective:** 무료 서버리스 배포.
**Files:** Create `vercel.json`(또는 `wrangler.toml`), `.env.example`(`OPENROUTER_API_KEY=`)
**Step:** Vercel 연동 또는 Cloudflare Pages 설정. 시크릿은 호스트 환경변수에 등록(로컬 커밋 금지).

### Task 4-3: README
**Objective:** 실행/배포 방법 문서화.
**Files:** Create `README.md`

---

## 검증 시나리오 (E2E)
1. `npm run dev` → 폼에서 "강원 / 2일 / 프리미엄+온천중심" 선택 → 제출.
2. 키 있음: LLM 코스 수신, 타임라인 렌더. 키 없음: 폴백 코스 렌더 + "AI 생성 실패, 기본 코스" 표시.
3. `npx vitest run` 전체 PASS. `npx tsc --noEmit` 통과.

## 리스크 / 트레이드오프
- 무료 LLM 레이트리밋/품질 편차 → 폴백으로 항상 동작 보장.
- 실시간 크롤링 생략(v1) → 데이터 신선도는 수동 갱신. 후속 자동화로 보강.
- 배포 호스트 결정 지연 → Phase 3까지는 로컬에서 충분히 동작.
