# 전면 검토 및 점검 (Full Review)

> 날짜: 2026-07-10 (최신화)
> 프로젝트: sauna-travel-planner (한국 사우나/찜질방/온천 중심 여행 코스 생성 웹앱)
> 검증 범위: A(배포) → B(데이터) → C(LLM) → D(테스트) → E(보안) → F(UX/디자인) → G(모니터링)

## ✅ 검증 결과 요약

| 단계 | 상태 | 핵심 산출물 |
|------|------|------------|
| A. 배포 | ✅ | Vercel Free, 커밋 이메일 통일(`neo6228@naver.com`), Next 15.5.20 |
| B. 데이터 | ✅ | 카카오 로컬 검색 REST API 실시간 연동, tourAPI 폴백, 지역 18곳(17시도+경주) curated seed, 전국 230개 시군구 |
| C. LLM 견고함 | ✅ | 무료 모델 폴백 체인, max_tokens, 429 backoff, API 하드타임아웃 10s |
| D. 테스트 | ✅ | 단위 32 passed / 1 skipped, Playwright E2E 10 passed, CI e2e 단계 |
| E. 보안 | ✅ | vitest 3.x, IP별 rate-limit, 환경변수 서버 전용(.env.example 문서화) |
| F. UX/디자인 | ✅ | 웜&스파 무드 UI(그라데이션 헤더·글래스 카드·커스텀 핀), 로딩 스켈레톤, 공유 URL, 지도 링크 |
| G. 모니터링 | ✅ | 폴백 비율 무료 집계 |

## 🔍 정적 점검 (코드 리뷰)

### 아키텍처
- **엔진 오케스트레이션** (`src/ai/engine.ts`): LLM 우선 → 실패 시 폴백. 카카오 live 데이터(사우나/숙소) 병합.
- **폴백 로직** (`src/ai/fallback.ts`): 다일차(2일+) 또는 옵션 켜짐 시 숙소 자동 포함(매일 다른 숙소). 도메인 규칙 정확.
- **API 라우트** (`src/app/api/course/route.ts`): rate-limit + 하드타임아웃 + 폴백 전환 + `places` 응답 병합.
- **모델 체인** (`src/ai/generate.ts`): 실존 무료 모델 체인, 429 backoff, 파싱 헬퍼 분리(`parse.ts`).

### 데이터
- **seed.ts**: 18곳(17시도 + 경주) curated, 각 region 숙소 1~2곳 포함.
- **kakao.ts**: 로컬 검색 REST API(키 필요, 무료). `hasOnsen`/`hasSauna` 추론, `computeRating`으로 추천지수 산출.
- **sigungu.generated.ts**: 230개 시군구 좌표 자동 생성.
- **sync-tourapi.mjs + sync-tourapi.yml**: 주간 월요일 크론(TOURAPI_KEY 등록 시 동작).

### 보안
- **.gitignore**: `.env`, `.env*.local`, `.hermes/`, `test-results/`, `playwright-report/` 차단.
- **rate-limit**: IP별 1분 5회 (무료 티어 남용 방지).
- **키 노출**: 클라이언트 번들에 미노출, 서버 환경변수만 사용.

### UX/디자인
- **디자인 시스템** (`docs/design/ui-design.md`): 컬러/타이포/컴포넌트 규칙 문서화.
- **글로벌**: cream/onsen/steam 팔레트, 그라데이션 헤더, 글래스 카드, 커스텀 핀.
- **공유 URL**: `?region=&sigungu=&days=&prefs=&note=` 쿼리로 진입 시 자동 생성.
- **지도 링크**: 각 stop 카카오맵/네이버맵 링크.

### 모니터링
- **/api/stats**: 폴백 발생 횟수/비율 집계 (메모리, 무료).

## ⚠️ 알려진 이슈 / 잔여 과제

1. **무료 모델 rate-limit**: OpenRouter 무료 티어 레이트리밋으로 간헐적 AI 생성 지연. 폴백 견고해 체감 영향 없음.
2. **TOURAPI_KEY 미등록**: GitHub Secrets / Vercel env 미등록 → 주간 동기화 워크플로우 미동작(선택 사항).
3. **카카오 REST 키 교체**: 노출된 키는 추후 교체 예정(현재 사용 중).
4. **다크모드**: 보류 (사용자 선택). 필요시 추가.

## 📊 최종 메트릭

- 타입체크: 0 에러
- 단위 테스트: 32 passed / 1 skipped (live, 카카오 키 없으면 skip)
- E2E: 10 passed
- 빌드: 성공
- 배포: Vercel Free 자동 배포

## 🎯 권고사항

1. (선택) TOURAPI_KEY 등록 → 주간 맛집/볼거리 자동 갱신.
2. 운영 중 `/api/stats`로 폴백 비율 모니터링.
3. (선택) 다크모드, 코스 저장(로컬스토리지), 지역 확장.
4. (선택) 카카오 REST 키 로테이션.
