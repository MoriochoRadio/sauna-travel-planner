# 시스템 아키텍처 설계 (System Architecture Design)

> Phase: Design · 문서 버전: v0.1 · 날짜: 2026-07-09
> 상위: PRD.md, IA.md, docs/analysis/*

## 1. 아키텍처 개요

```
┌──────────────┐     POST /api/course      ┌────────────────────┐
│  Browser     │ ───────────────────────▶  │  Next.js Route     │
│  (Next.js    │                           │  Handler (Server)  │
│   Client)    │ ◀───────────────────────  │                    │
│              │      Course JSON          │  generateCourse()  │
└──────────────┘                           └─────────┬──────────┘
                                                     │
                          ┌──────────────────────────┼──────────────────────────┐
                          ▼                          ▼                          ▼
                   ┌─────────────┐          ┌──────────────────┐       ┌────────────────┐
                   │ seed.ts     │          │ generate.ts      │       │ fallback.ts    │
                   │ (curated    │          │ (OpenRouter LLM) │       │ (rule-based)   │
                   │  RegionData)│          │  json_schema 강제│       │ 결괴 보장       │
                   └─────────────┘          └──────────────────┘       └────────────────┘
                          │                          │                          │
                          └──────────────────────────┴──────────────────────────┘
                                             ▼
                                      CourseSchema (Zod)
                                      검증 통과 → 응답
```

- **클라이언트**: 입력 폼 + 결과 렌더 (서버 키 비노출)
- **서버(Route Handler)**: 입력 검증 → `generateCourse()` → 검증된 Course 반환
- **generateCourse**: LLM 우선, 실패 시 폴백. 반환 시 `usedFallback` 플래그 포함
- **환경변수**: `OPENROUTER_API_KEY` 는 서버리스 환경변수에만 존재

## 2. 컴포넌트/모듈 구조

```
src/
├── data/
│   ├── schema.ts        # Zod: Place/Region/PlannerInput
│   ├── seed.ts          # 전체 RegionData[] (17시도+경주 curated + 숙소)
│   ├── seed.enriched.ts # tourAPI 자동 보강 데이터
│   ├── sigungu.ts       # 시군구 좌표 (230개, generated 기반)
│   ├── sigungu.generated.ts # 자동 생성 시군구
│   ├── regions-ko.ts    # 전국 시군구명
│   ├── rating.ts        # 추천지수 산출
│   └── share.ts         # 공유 URL 인코딩/디코딩
├── ai/
│   ├── course.schema.ts # [설계/구현] Course/Day/Stop Zod
│   ├── prompt.ts        # [설계/구현] 시스템+유저 프롬프트 템플릿
│   ├── generate.ts      # [설계/구현] LLM 호출 + 파싱
│   ├── fallback.ts      # [설계/구현] 규칙 기반 생성
│   └── engine.ts        # [설계/구현] generateCourse() 오케스트레이션
├── app/
│   ├── page.tsx         # 입력 폼 (Client)
│   ├── api/course/route.ts  # POST 핸들러 (Server)
│   ├── components/
│   │   ├── PlannerForm.tsx  # 지역/기간/취향 입력
│   │   └── CourseView.tsx   # 결과 타임라인
│   ├── globals.css
│   └── layout.tsx
└── ...
```

## 3. 의사결정 (DDD-lite)

- 도메인 로직(AI 생성/폴백)은 `src/ai`에 격리 → UI와 무관하게 테스트 가능
- 데이터는 `src/data`에 격리 → tourAPI 보강 시 이层만 교체
- API 경계에서만 Zod 검증 → trust boundary 명확

## 4. 배포 토폴로지

- 저장소: GitHub (이미 생성: MoriochoRadio/sauna-travel-planner, private)
- CI: GitHub Actions (push/PR → lint+typecheck+test)
- 호스팅: Vercel/Cloudflare Pages (서버리스 Function = Route Handler)
- 시크릿: 호스트 환경변수 (GitHub Actions는 코드 검증용, 키 불필요)
