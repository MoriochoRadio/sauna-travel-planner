# 배포 가이드 (Deployment Guide) — Vercel Free

> 단계: A(실제 배포) · 무료 유지 전제
> 저장소: MoriochoRadio/sauna-travel-planner (private)

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
- `OPENROUTER_API_KEY` = `sk-or-...` (https://openrouter.ai/keys 무료 발급)
- Environment: Production + Preview 모두 체크
- ⚠️ 이 키가 없으면 앱은 **폴백(기본 코스)**으로 동작합니다 (여전히 작동함).

## 4. Deploy
- "Deploy" 클릭 → 수십 초 후 `https://sauna-travel-planner-xxx.vercel.app` 발급
- main 브랜치 push 시 자동 재배포 (Auto-deploy)

## 5. 검증
- `/` 접속 → 지역/기간/취향 선택 → "코스 만들기"
- 키 있음: AI 생성 코스 / 키 없음: "AI 생성 실패 → 기본 코스" 뱃지 + 폴백 코스

## 6. 무료 유지 체크리스트
- ✅ Vercel Hobby(무료) 플랜
- ✅ LLM은 OpenRouter 무료 모델 (`nousresearch/hermes-3-llama-3.1-405b:free`)
- ✅ 데이터는 curated(외부 유료 API 없음)
- ⚠️ Vercel 무료는 서버리스 Function 실행 한도 있음 → 폴백 경량화로 대응 완료

## 7. 대안 (무료)
- Netlify / Cloudflare Pages + Workers 도 가능 (Next 서버리스 호환)
- 이 프로젝트는 Vercel 기준으로 검증됨
