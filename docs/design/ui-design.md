# UI/UX 디자인 시스템 — Sauna Travel Planner

> 방향: **웜 & 스파 무드** (onsen 오렌지 × cream) + **모바일 우선**, 데스크탑은 2단 레이아웃(입력 폼 + 우측 고정 선택 요약 패널) + 시그니처 배경 모티프.
> 2026-07-14 전면 검토: 로딩 상태 버그, 관리자 안내문 노출, 지도 마커 겹침, `gray-*` 토큰 드리프트 수정 + 데스크탑 전용 비주얼/레이아웃 신설.

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

- 모바일: `max-w-md` (384px) 중앙, 장식 요소 없음(깨끗하게 유지)
- 태블릿(≥768px): `max-w-2xl` (672px) 중앙
- 데스크탑(≥1024px, `lg:`): `max-w-5xl` 안에서 **입력 폼(가변폭) + 우측 300px 고정 "선택 요약" 패널**의 2단 그리드(`lg:grid-cols-[minmax(0,1fr)_300px]`). 요약 패널은 `sticky top-8`로 스크롤 중에도 고정 노출되며 지역/사우나/여행모드/기간/취향/숙소추천을 실시간 반영. 코스 결과 화면은 2단 그리드 대상이 아니며 `lg:max-w-2xl lg:mx-auto`로 원래 폭을 유지(늘어나지 않음).
- 스테퍼: 이미 지났던 단계는 클릭해서 바로 이동 가능(`disabled`로 아직 안 가본 단계 차단). 요약 패널에도 "다음 단계로 이동" 단축 버튼 노출.
- 헤더: 상단 그라데이션 밴드 + 앱 아이콘(🔥) + 타이틀 + 물결 구분선(SVG)

## 6. 배경 시그니처 모티프 (데스크탑 전용, `hidden md:block`)

- **온천 물결 링**: 동심원 SVG(`.ripple-ring`)를 뷰포트 상단 우측/하단 좌측에 배치, onsen/steam 색을 번갈아 사용. `ripple-breathe` 키프레임으로 아주 느리게 숨쉬듯 확대/축소(`prefers-reduced-motion`이면 정지). 이 페이지의 시그니처 요소 — 일반 blur 원 장식 대신 "온천에 번지는 파문"을 형상화해 subject와 직접 연결.
- **스팀 모티프**: 헤더 🔥 아이콘 위로 옅은 스팀 두 가닥이 피어올랐다 사라짐(`steam-wisp`, `steam-rise` 키프레임).
- **미네랄 질감(`grain`)**: SVG `feTurbulence` 기반 노이즈를 배경 전체에 3.5% 불투명도로 오버레이, `mix-blend-mode: multiply`. 모바일 포함 전역 적용(아주 은은해 방해되지 않음).
- ⚠️ **스태킹 주의**: 이 장식 레이어들은 `position: fixed`이지만 **음수 z-index(`-z-10`)를 쓰면 안 됨** — 상위에 `position: relative`만 있고 z-index가 없는 컨테이너(`bg-page-bg` div 등)는 스태킹 컨텍스트를 만들지 않아서, 그 컨테이너 자신의 배경이 "일반 인플로우 콘텐츠" 단계에서 음수 z-index 자식보다 나중에(위에) 칠해져 장식이 완전히 가려짐. `z-0`(또는 z-index 생략) + DOM 순서로 처리할 것.

## 7. 지도

- 커스텀 마커: onsen 원형 핀 (기본 파란 Leaflet 마커 교체)
- 전국 모드(시군구 230개+)는 **반드시 마커 클러스터링**(`leaflet.markercluster`, CDN 동적 로드) 적용 — 클러스터링 없이 개별 마커를 찍으면 수도권 등 밀집 지역이 완전히 겹쳐 클릭 불가능해짐.
- `getSigungus(region)` 등 `.filter()`로 매 렌더 새 배열을 만드는 값을 지도 컴포넌트의 `useEffect` 의존성에 그대로 넣지 말 것 — `useMemo`로 안정화하지 않으면 무관한 상태 변경(예: 텍스트 입력)에도 지도가 매번 파괴·재생성됨.
- Attribution: 작게 유지 (라이선스 필수)

## 8. 금지

- 순수 검정 플로팅 버튼, 개발자 노트성 푸터, 모호한 버튼 계층
- 사용자에게 노출되는 관리자/운영 안내문(예: 환경변수명, 배포 설정) — 코드 주석으로만 남기고 UI 문구는 사용자 관점으로 작성
- 로딩 상태와 "결과 0건" 상태를 같은 조건(`length === 0`)으로 판별하는 것 — 별도 boolean으로 구분
