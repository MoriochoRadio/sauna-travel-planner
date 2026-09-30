# 배포 가이드 (Deployment Guide) — Vercel Free

> 단계: A(실제 배포) · 무료 유지 전제
> 저장소: MoriochoRadio/sauna-travel-planner (public)

## 1. Vercel 가입/로그인
- https://vercel.com → "Continue with GitHub" → `MoriochoRadio` 계정 연동

## 2. 프로젝트 연결
- Dashboard → **Add New → Project**
- Import Repository에서 `sauna-travel-planner` 선택
- Framework Preset: **Next.js** (자동 감지)
- Root Directory: `./` (기본)
- Build Command / Output: `vercel.json`에 명시됨 (수정 불필요)

## 3. 환경변수 등록 (중요)
- Project → Settings → Environment Variables
- `KAKAO_REST_KEY` = 카카오 개발자센터 REST API 키 (실시간 사우나·숙소 검색, 무료)
- `TOURAPI_KEY` = data.go.kr 한국관광공사 국문 관광정보 서비스 키 (선택, 실시간 검색 폴백)
- Environment: Production + Preview 모두 체크
- 키가 없어도 앱은 curated 장소와 손수 짠 코스·규칙 기반 구성으로 정상 동작합니다.
  (AI 코스 생성과 `OPENROUTER_API_KEY`는 2026-08-24에 제거됐습니다 — 등록돼 있다면 지워도 됩니다)

## 4. Deploy
- "Deploy" 클릭 → 수십 초 후 `https://sauna-travel-planner-xxx.vercel.app` 발급
- main 브랜치 push 시 자동 재배포 (Auto-deploy)

## 5. 검증
- `/` 접속 → 지역/기간/취향 선택 → "코스 만들기"
- 손수 짠 코스가 있는 조합(부산·강원·충남·경기 당일, 경북 1박 2일): "✓ 검증한 장소로 직접 짠 추천 코스입니다"
- 그 밖의 조합: "입력한 지역·기간·취향에 맞춰 자동 구성한 코스입니다" (둘 다 정상 경로)

## 6. 무료 유지 체크리스트
- ✅ Vercel Hobby(무료) 플랜
- ✅ 데이터는 curated(외부 유료 API 없음)
- ⚠️ Vercel 무료는 서버리스 Function 실행 한도 있음 → 폴백 경량화로 대응 완료

## 7. 대안 (무료)
- Netlify / Cloudflare Pages + Workers 도 가능 (Next 서버리스 호환)
- 이 프로젝트는 Vercel 기준으로 검증됨
