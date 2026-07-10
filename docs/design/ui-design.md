# UI/UX 디자인 시스템 — Sauna Travel Planner

> 방향: **웜 & 스파 무드** (기존 onsen 오렌지 × cream 재활용) + **모바일 우선**, 데스크탑은 중앙 넓은 컬럼 + 배경 장식.

## 1. 컬러 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `--cream` | `#FBF6EF` | 배경 베이스 (따뜻한 크림) |
| `--cream-2` | `#F3E9DC` | 배경 장식/보조 카드 |
| `--onsen` | `#E8743B` | 메인 액센트 (사우나 오렌지) |
| `--onsen-soft` | `#FCE9DD` | 액센트 연한 배경 (뱃지/호버) |
| `--bark` | `#3A2E26` | 본문 텍스트 (딥 브라운) |
| `--bark-soft` | `#7A6A5E` | 보조 텍스트 |
| `--steam` | `#6FB7B0` | 세컨드 액센트 (온천 스팀 민트, 배지/포인트) |
| 화이트 | `#FFFFFF` | 카드 베이스 |

**그라데이션**: `linear-gradient(135deg, #E8743B, #F0A35E)` (헤더/CTA)
**글래스**: `rgba(255,255,255,0.7)` + `backdrop-filter: blur(10px)`

## 2. 타이포

- 본문: `-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`
- 헤더 h1: `text-3xl font-extrabold` (그라데이션 텍스트 또는 white on gradient)
- 섹션 h2: `text-lg font-bold`
- 보조: `text-sm text-bark-soft`

## 3. 라운드 / 그림자

- 라운드: 카드 `20px`, 버튼 `14px`(pill은 `9999px`), 배지 `8px`
- 그림자: `0 4px 20px rgba(58,46,38,0.08)` (카드), `0 6px 16px rgba(232,116,59,0.3)` (CTA hover)

## 4. 컴포넌트 규칙

- **btn-primary**: onsen 그라데이션, white text, pill, hover 시 그림자+scale 살짝
- **btn-secondary**: white/glass 배경, onsen border+text, hover 시 onsen-soft 배경
- **btn-ghost**: 투명, bark-soft text (보조 액션)
- **card**: white/glass, round-20, soft shadow, 내부 padding `p-5`
- **badge**: round-8, 작은 폰트, 컬러별 bg/text (온천=rose, 사우나=sky, 숙소=violet, 추천지수=amber)

## 5. 레이아웃

- 모바일: `max-w-md` (384px) 중앙
- 데스크탑(≥768px): `max-w-2xl` (672px) 중앙, 좌우 cream-2 원형 장식 배경
- 헤더: 상단 그라데이션 밴드 + 앱 아이콘(🔥) + 타이틀

## 6. 지도

- 커스텀 마커: onsen 원형 핀 (기본 파란 Leaflet 마커 교체)
- Attribution: 작게 유지 (라이선스 필수)

## 7. 금지

- 순수 검정 플로팅 버튼, 개발자 노트성 푸터, 모호한 버튼 계층
