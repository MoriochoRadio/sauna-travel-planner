# 전면 검토 및 점검 (Full Review)

> 날짜: 2026-07-09
> 프로젝트: sauna-travel-planner (한국 사우나/찜질방/온천 중심 여행 코스 생성 웹앱)
> 검증 범위: A(배포) → B(데이터) → C(LLM) → D(테스트) → E(보안) → F(UX) → G(모니터링)

## ✅ 검증 결과 요약

| 단계 | 상태 | 핵심 산출물 |
|------|------|------------|
| A. 배포 | ✅ | Vercel Free, 커밋 이메일 통일(`neo6228@naver.com`), Next CVE 패치 |
| B. 데이터 | ✅ | tourAPI 클라이언트+주간 동기화, 지역 9곳 curated seed |
| C. LLM 견고함 | ✅ | 무료 모델 폴백 체인, max_tokens, 429 backoff, API 하드타임아웃 10s |
| D. 테스트 | ✅ | 단위 24개, Playwright E2E 5개, CI e2e 단계 |
| E. 보안 | ✅ | vitest 3.x(esbuild 이슈 해소), IP별 rate-limit(1분 5회) |
| F. UX | ✅ | 로딩 스켈레톤, 코스 공유 URL, 카카오맵 지도링크 |
| G. 모니터링 | ✅ | 폴백 비율 무료 집계(/api/stats) |

## 🔍 정적 점검 (코드 리뷰)

### 아키텍처
- **엔진 오케스트레이션** (`src/ai/engine.ts`): LLM 우선 → 실패 시 폴백. 명확한 단일 책임.
- **폴백 로직** (`src/ai/fallback.ts`): 도메인 규칙(시간대 R-1~R-4, 취향 가중) 잘 구현. `placeId` 기반 비용 합산 정확.
- **API 라우트** (`src/app/api/course/route.ts`): rate-limit + 하드타임아웃 + 폴백 전환 + 모니터링 기록. 방어적 설계.
- **모델 체인** (`src/ai/generate.ts`): 실존 무료 모델 3개, 429 backoff, 파싱 헬퍼 분리(`parse.ts`).

### 데이터
- **seed.ts**: 지역 9곳(seoul/busan/gangwon/gyeongju/jeju/incheon/daejeon/gwangju/daegu) curated.
- **tourapi.ts**: 하이브리드(사우나 curated, 맛집/볼거리 보강). Decoding 키 자동 인코딩.
- **sync-tourapi.mjs + sync-tourapi.yml**: 주간 월요일 03:00 UTC 크론.

### 보안
- **.gitignore**: `.env`, `.env*.local` 차단 확인. 키 하드코딩 없음.
- **rate-limit**: IP별 1분 5회 (무료 티어 남용 방지).
- **의존성**: vitest 3.x로 esbuild 취약점 해소. 잔여 12개는 Next 내부 postcss + playwright(devDependency, 런타임 무영향).

### UX
- **로딩 스켈레톤**: API 호출 중 빈 화면 방지.
- **공유 URL**: `?region=&days=&prefs=&note=` 쿼리로 진입 시 자동 생성 + 클립보드 복사.
- **지도 링크**: 각 stop 카카오맵 검색 링크.

### 모니터링
- **/api/stats**: 폴백 발생 횟수/비율 집계 (메모리, 무료). Vercel Functions 로그로도 `usedFallback` 확인 가능.

## ⚠️ 알려진 이슈 / 잔여 과제

1. **무료 모델 rate-limit**: OpenRouter 무료 티어는 provider별 레이트리밋이 심해 간헐적으로 AI 생성(usedFallback:false)이 안 됨. 폴백이 견고해 사용자 체감 영향 없음. rate-limit 풀리면 자동 복구.
2. **TOURAPI_KEY 미등록**: GitHub Secrets / Vercel env에 미등록 → 주간 동기화 워크플로우 실제 미동작. 등록 필요.
3. **잔여 취약점 12개**: Next 내부 postcss(빌드 시에만), playwright(devDependency). 런타임 노출 없음.
4. **다크모드**: F단계에서 보류 (사용자 선택). 필요시 추가.

## 📊 최종 메트릭

- 타입체크: 0 에러
- 단위 테스트: 24 passed
- E2E: 5 passed
- 빌드: 성공
- 라이브: https://sauna-travel-planner-git-main-smaa04.vercel.app (Vercel Free, 자동 배포)

## 🎯 권고사항

1. **TOURAPI_KEY 등록** (GitHub Secrets + Vercel) → 주간 맛집/볼거리 자동 갱신 활성화.
2. 운영 중 `/api/stats`로 폴백 비율 모니터링. 100% 지속 시 OpenRouter 키/모델 체인 재점검.
3. 트래픽 증가 시 rate-limit 임계값 조정 검토.
4. (선택) 다크모드, 코스 저장(로컬스토리지), 더 많은 지역 확장.
