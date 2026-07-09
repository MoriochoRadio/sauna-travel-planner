# 🔥 사우나 여행 코스 메이커 (Sauna Travel Planner)

AI가 한국 **사우나·찜질방·온천**을 축으로, **맛집·볼거리**를 엮어 맞춤형 여행 코스를 생성하는 웹앱입니다.

> 지역 / 기간 / 취향을 입력하면 → 일자별 타임라인(장소·시간·추천이유·팁·예상비용)을 생성합니다.

## ✨ 기능
- 지역 5곳(서울·부산·강원·경주·제주) curated 데이터 기반
- 취향 다중 선택: 조용한 / 가성비 / 프리미엄 / 가족 / 혼자 / 야외온천 / 음식중심
- AI 생성(OpenRouter 무료 모델) + 실패 시 규칙 기반 폴백으로 **항상 동작**
- 웰니스 강조(하루 1회 사우나·수분 500ml 안내)

## 🧱 기술 스택
- Next.js 15 (App Router) · TypeScript · Tailwind CSS
- Zod (스키마 검증) · Vitest (단위 테스트)
- OpenRouter API (무료 LLM, `json_schema` 강제)

## 🚀 로컬 실행
```bash
npm install
npm run dev      # http://localhost:3000
```
AI 생성 없이도 폴백으로 동작합니다. AI 사용 시 `.env.local`에 키 등록:
```bash
cp .env.example .env.local
# OPENROUTER_API_KEY=sk-or-... 입력
```

## 🧪 테스트 / 검증
```bash
npm test         # vitest (데이터·엔진 로직)
npm run typecheck
npm run build
```

## 📦 배포
- Vercel/Cloudflare Pages 권장 (서버리스 Function = `/api/course`)
- `OPENROUTER_API_KEY`는 호스트 환경변수에 등록 (클라이언트 노출 금지)
- `vercel.json` 참고

## 📁 구조
```
src/
├── data/      # 스키마 + 시드 데이터
├── ai/        # 코스 스키마·프롬프트·LLM 호출·폴백·엔진
├── app/       # 페이지 + API 라우트
└── components/ # 입력 폼·결과 뷰
docs/          # 기획/분석/설계 산출물
```

## 📋 개발 단계 산출물
- `docs/PRD.md`, `docs/IA.md` — 기획
- `docs/analysis/*` — 요구사항·데이터소스·도메인·타당성/리스크
- `docs/design/*` — 아키텍처·데이터모델·API·프롬프트·와이어프레임

## 🗺 로드맵
- tourAPI 연동으로 데이터 자동 보강
- 지도 시각화(이동 동선)
- 사용자 코스 공유/북마크
