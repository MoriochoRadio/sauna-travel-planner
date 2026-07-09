# 기술 타당성 및 리스크 분석 (Feasibility & Risk Analysis)

> Phase: Analysis · 문서 버전: v0.1 · 날짜: 2026-07-09

## 1. 기술 타당성

| 항목 | 평가 | 근거 |
|------|------|------|
| Next.js 정적+서버리스 | 적합 | App Router + Route Handler로 LLM 시크릿 서버 보관 가능 |
| 무료 LLM (OpenRouter) | 가능 | `nousresearch/hermes-3-llama-3.1-405b:free` 등 json_schema 강제 지원 |
| Zod 스키마 검증 | 적합 | 입력/출력 타입 안정성, 폴백 파싱 검증 |
| Curated seed | 충분 | v1 범위 커버, 외부 의존 0 |
| 무료 호스팅 | 가능 | Vercel/Cloudflare Free 티어로 서버리스 배포 |

## 2. 리스크 목록

| ID | 리스크 | 영향 | 확률 | 대응(완화) |
|----|--------|------|------|------------|
| RK-1 | 무료 LLM 레이트리밋/다운 | 코스 생성 실패 | 중 | 폴백(fallback.ts)으로 항상 동작, usedFallback 플래그 |
| RK-2 | LLM 환각(없는 장소 생성) | 신뢰도 하락 | 중 | 응답에 seed placeId 참조 강제, 파싱 시 검증 |
| RK-3 | API 키 클라이언트 노출 | 보안 사고 | 낮 | 서버리스 env만 사용, .env.local 커밋 금지(.gitignore) |
| RK-4 | 무료 호스팅 실행시간 한도 | 응답 지연/타임아웃 | 낮~중 | 폴백 경로 경량화, LLM 타임아웃 설정 |
| RK-5 | 데이터 노후(폐업/이전) | 추천 품질 저하 | 높음(v1 후) | tourAPI 동기화 워크플로우(로드맵) |
| RK-6 | 출력 JSON 스키마 불준수 | 파싱 실패 | 중 | safeParse + 폴백, 필요 시 1회 재시도 |
| RK-7 | 모바일 UX 미흡 | 이탈 | 중 | 반응형 우선, a11y 기준 적용 |

## 3. 의사결정 기록 (Open Questions → Resolved)

- Q: 실시간 크롤링 vs curated? → **curated** (데이터소스 분석 결정)
- Q: 배포 호스트? → **Vercel/Cloudflare Free** (실시간 LLM 필요, Pages 단독 부적합)
- Q: LLM 키 관리? → 서버리스 환경변수 (클라이언트 노출 금지)

## 4. 타당성 결론

기술적으로 무료 플랜만으로 MVP 구현·배포 가능. 핵심 리스크(RK-1/2/6)는 폴백+검증으로
수용 가능한 수준으로 통제됨. 데이터 신선도(RK-5)만 운영 단계 과제로 남음.
