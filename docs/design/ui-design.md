# UI/UX 디자인 시스템 — Sauna Travel Planner

> 방향: **온기행(溫氣行) 톤** — 딥그린(pine)으로 구조를 잡고 테라코타(clay)를 유일한 강조색으로 쓰는
> 웜페이퍼 바탕. 제목은 명조(Noto Serif KR). **랜딩 = 몰입형 히어로 → 씬 카드 → 코스 메이커 → 가이드**.
> 2026-08-19 전면 개편: `manus/ongihaeng-rebuild`(온기행) 브랜치의 시각 언어를 `main`으로 이식하면서,
> WebGL 증기 히어로와 CSS 3D 레이어를 새로 얹었다. 기능·API는 손대지 않았다.
> 2026-07-14 검토 이력: 로딩 상태 버그, 관리자 안내문 노출, 지도 마커 겹침, `gray-*` 토큰 드리프트 수정.

## 1. 컬러 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `--pine` | `#234034` | **구조색.** 헤더/푸터/결과 밴드/선택된 세그먼트 |
| `--pine-soft` | `#3B5A4B` | pine 호버 |
| `--pine-deep` | `#16291F` | 히어로 베이스, 푸터 그라데이션 끝 |
| `--clay` | `#B9603A` | **유일한 강조색.** 링크·eyebrow·시각(time)·CTA |
| `--clay-soft` | `#F6E5DA` | 강조 연한 배경 (배지/비용/호버) |
| `--clay-deep` | `#8E4526` | clay 위 텍스트, 강조 텍스트 |
| `--ember` | `#E08A57` | 어두운 배경 위 eyebrow, 포커스 링, 빛기둥 |
| `--sage` | `#7FA893` | 물·김을 가리킬 때만 (사우나 배지, 팁) |
| `--paper` | `#FFFCF6` | 카드 베이스 |
| `--cream` | `#F7F3EC` | 페이지 배경 |
| `--cream-2` | `#EFE5D6` | 스켈레톤/보조 면 |
| `--line` | `#E5D9C8` | 모든 경계선 |
| `--ink` / `--ink-soft` | `#2A231D` / `#6F6157` | 본문 / 보조 텍스트 |

**기존 이름 호환**: 앱 전반이 `onsen`/`bark`/`steam` 클래스를 쓰고 있어, 이 이름들을 위 팔레트로
**별칭 매핑**해 두었다(`onsen→clay`, `bark→ink`, `steam→sage`). 덕분에 토큰만 갈아끼워 톤을 전환했고
컴포넌트 className을 전수 수정하지 않았다. 새 코드는 의미가 분명한 새 이름(`pine`/`clay`/`sage`)을 쓴다.

**그라데이션**: `onsen-gradient` = `linear-gradient(135deg,#B9603A,#E08A57)` (CTA·타임라인 노드) ·
`pine-gradient` = `linear-gradient(150deg,#234034,#16291F)` (푸터·결과 밴드·요약 패널)

**글래스**: `.glass` = `rgba(255,252,246,.78)` + blur(14px) · `.glass-dark` = `rgba(19,34,27,.42)` + blur(16px)

## 2. 타이포

- **제목: 명조** — `next/font/google`의 Noto Serif KR을 `--font-serif-kr`로 주입하고 `font-serif`로 쓴다.
  - `preload: false`로 두면 `subsets` 지정 없이 한글 유니코드 레인지가 전부 포함되고, 빌드 시
    자체 호스팅되어 런타임 외부 요청이 없다. 대신 서브셋이 124조각으로 쪼개지므로 **preload는 금지**
    (필요한 조각만 온디맨드로 받게 둔다).
  - Tailwind의 serif 스택은 `var(--font-serif-kr, 'Noto Serif KR')`처럼 **var()에 폴백을 함께 준다** —
    변수가 정의되지 않으면 `font-family` 선언 전체가 무효가 되기 때문.
- 본문: 시스템 스택(`-apple-system, "Apple SD Gothic Neo", "Malgun Gothic"`)
- 히어로 h1: `font-serif clamp(2.6rem,7.2vw,4.75rem)`, `tracking-[-0.045em]`
- 섹션 h2: `font-serif clamp(1.9rem,4.2vw,2.75rem)`, `text-pine`
- eyebrow: `.eyebrow` (11px, `tracking-eyebrow`=0.18em, uppercase, clay)
- **`word-break: keep-all`을 body에 건다** — 한글이 어절 중간에서 갈라지지 않게(“됩니/다”). 끊을 수 없는
  긴 문자열만 `overflow-wrap: break-word`로 예외 처리.

## 3. 라운드 / 그림자

- 라운드: 카드 `22px`, 입력 `14px`, **버튼·배지·칩은 알약(`999px`)** — 온기행의 기본형
- 그림자: `card` `0 18px 44px -34px rgba(45,32,20,.55)` · `cta` `0 14px 30px -14px rgba(185,96,58,.7)` ·
  `pine` (딥그린 면) · `lift` `0 40px 80px -50px` (3D로 떠 있는 요소)

## 4. 컴포넌트 규칙

- **btn-primary**: clay 그라데이션, 알약, hover 시 `translateY(-2px)`
- **btn-secondary**: paper 배경 + line 테두리 + pine 텍스트, hover 시 clay 톤
- **btn-pine**: 딥그린 솔리드 (헤더 CTA 등 구조적 액션)
- **`.seg`**: 세그먼트 컨트롤. **활성 상태를 `aria-pressed="true"` CSS 선택자로 처리**하므로
  className에 조건부 분기를 쓰지 않는다 — 접근성 속성과 시각 상태가 어긋날 수 없다.
- **`.field`**: select/textarea 공통. focus 시 clay 테두리 + 3px 링
- **card**: paper + line 테두리 + `shadow-card` + `rounded-card`
- **배지**: 알약, 팔레트 안에서만 (온천=clay, 사우나=sage, 숙소=pine, 추천지수=clay-soft, 검증=sage)
  — rose/sky/violet/amber 같은 팔레트 밖 색은 쓰지 않는다.

## 5. 레이아웃

- **랜딩 구성**: 고정 헤더 → 히어로 → 씬 카드 3종 → `#plan` 코스 메이커 → `#guides` 가이드 → 푸터
- 헤더는 **`position: fixed`** — `sticky`로 두면 헤더가 자기 자리를 차지해 크림 바탕 위에 흰 글자가
  얹히고 대비가 무너진다. 히어로 위에 겹쳐 떠 있다가 `scrollY > 40`에서 유리판으로 굳는다.
  앵커 점프를 위해 `html { scroll-padding-top: 84px }`.
- 폼 영역: 모바일 `max-w-md` → 태블릿 `max-w-2xl` → 데스크탑 `max-w-5xl` 안에서
  **입력 폼(가변) + 우측 300px 고정 "선택 요약" 패널** 2단 그리드. 요약 패널은 `sticky top-8` + pine 그라데이션.
  코스 결과는 2단 대상이 아니며 `lg:max-w-2xl lg:mx-auto`로 원래 폭 유지.
- 스테퍼: 단계 사이를 연결선으로 잇고, 도달한 단계만 클릭 이동 가능. 라벨은 `sm` 이상에서만 노출.
- **헤딩 계층**: 히어로 h1 → 섹션 h2 → 폼 소제목/코스 제목 h3 → 일자 h4. 섹션 제목이 생겼으므로
  폼 내부 제목을 h3으로 내렸다. e2e는 태그 대신 `getByRole("heading", { name })`으로 집을 것.

## 6. 히어로 — WebGL 증기 (`OnsenCanvas.tsx`)

three.js 없이 **프래그먼트 셰이더 하나**로 그린다. 이 레포는 런타임 의존성 5개를 유지하는 것이 원칙이라
3D 라이브러리를 들이지 않는다. 추가 번들은 컴포넌트 코드뿐(≈8KB).

- **구성**: 2단 도메인 워프 FBM으로 난류형 증기 → 바닥 수면 커스틱 → 우상단 빛기둥.
  출력은 **스트레이트 알파**(`premultipliedAlpha: false`)라 뒤에 깔린 히어로 사진 위로 김이 흐르듯 합성된다.
- **반응**: 포인터를 따라 국소 소용돌이(관성 추종), 스크롤할수록 김이 걷힘(`u_scroll`).
- **밀도 튜닝 원칙**: `density`의 smoothstep 하한을 높게(0.30) 잡아야 옅은 부분이 잘려 나가고
  **뿌연 덩어리 대신 가닥**이 남는다. 낮게 잡으면 히어로 하단이 흰 안개로 덮여 본문 대비가 무너진다.
  빛기둥은 `p.x`가 양수인 쪽에서만 세운다 — 본문이 왼쪽에 있기 때문.
- **폴백**: WebGL 미지원·셰이더 컴파일 실패·컨텍스트 로스트 시 `onFallback`으로 CSS `.steam-fallback`
  그라데이션으로 교체. `prefers-reduced-motion`에서는 애니메이션 없이 완성된 한 장면만 그린다.
- **성능**: DPR 1.75 상한 + 총 픽셀 160만 상한, 화면 밖(IntersectionObserver)·백그라운드 탭에서 rAF 정지,
  언마운트 시 프로그램·버퍼 삭제 후 `WEBGL_lose_context`.
- ⚠️ `getBoundingClientRect()`가 0을 주는 순간(레이아웃 전, 숨겨진 조상 아래)에 **버퍼를 1px로 만들면
  안 된다** — 다시 보일 때까지 깨진 채로 남는다. 0이면 리사이즈를 건너뛴다.

## 7. 3D 레이어 (CSS)

- **`.tilt` / `Tilt.tsx`**: 포인터를 따라 기우는 카드. 회전은 CSS(`rotateX/rotateY` + `--rx/--ry`)가 하고
  JS는 커스텀 속성만 갱신한다(리렌더 없음). 표면 광택(`.tilt-sheen`)은 포인터 위치를 따라간다.
- **`.z-lift-sm/.z-lift/.z-lift-lg`**: `preserve-3d` 안에서 26/48/72px 앞으로 띄우는 유틸.
  ⚠️ `overflow: hidden` 박스 안에 넣으면 브라우저가 3D를 평평하게 만든다 —
  **띄울 요소는 `.tilt-inner` 바로 아래에 두고 절대배치로 겹칠 것.**
- `(pointer: coarse)`와 `prefers-reduced-motion: reduce`에서는 틸트·광택·translateZ를 전부 끈다.
- **`Reveal.tsx`**: 스크롤 진입 리빌. 초기 숨김을 서버 마크업이 아니라 **마운트 후 JS로** 걸어
  JS가 꺼져 있어도 본문이 보이게 한다. 관찰자가 첫 콜백조차 주지 못하는 환경을 대비해
  2.5초 실패 안전장치로 강제 노출한다(내용이 영영 숨는 것을 막는다).

## 8. 배경 시그니처 모티프

- **온천 물결 링**(`.ripple-ring`): 동심원 SVG를 `#plan` 섹션 우상단과 코스 결과 밴드 안에 배치.
  `ripple-breathe`로 아주 느리게 숨쉬듯 확대/축소(`prefers-reduced-motion`이면 정지).
  일반 blur 원 장식 대신 "온천에 번지는 파문"을 형상화해 subject와 직접 연결.
- **미네랄 질감**(`.grain`): SVG `feTurbulence` 노이즈를 배경 전체에 4% 불투명도, `mix-blend-mode: multiply`.
- **씬 카드 지형**: 장소 사진 대신 3겹 능선 SVG. 사진은 출처·사용 허가가 정리된 것만 쓴다는 정책 때문이며,
  대신 카드를 기울이면 배지가 다른 깊이로 움직여 입체감을 만든다.
- ⚠️ **스태킹 주의**: `position: fixed` 장식 레이어에 **음수 z-index를 쓰면 안 됨** — 상위에
  `position: relative`만 있고 z-index가 없는 컨테이너는 스태킹 컨텍스트를 만들지 않아서, 그 컨테이너
  자신의 배경이 음수 z-index 자식보다 나중에(위에) 칠해져 장식이 완전히 가려짐. `z-0` + DOM 순서로 처리.
  히어로처럼 음수 z-index를 쓰려면 부모에 **`isolate`**를 걸어 스태킹 컨텍스트를 명시적으로 만들 것.

## 9. 이미지

- 히어로 사진(`public/onsen-guide-hero.webp`)은 1200×420 원본이라 **선명하게 쓰지 않는다** —
  `opacity-55 blur-[1px] scale-110`으로 대기 질감으로만 깔고 그 위를 딥그린 스크림이 덮는다.
  가이드 섹션에서는 원본 비율에 가까워 그대로 쓴다.
- ⚠️ 이 이미지는 온기행 브랜치의 관리형 자산을 옮겨온 것으로 **원저작자·라이선스 기록이 없다**
  (`docs/static-visual-assets.md` 참조). 외부 홍보·상업적 사용 전에는 교체하거나 권리를 확인할 것.
- Next 이미지 최적화는 쓰지 않는다(`unoptimized`) — 이미 webp이고, Vercel 무료 플랜의 최적화 쿼터를
  쓰지 않는 것이 이 프로젝트의 무료 유지 원칙.

## 10. 지도

- 커스텀 마커: clay 원형 핀(선택 시 pine), 기본 파란 Leaflet 마커 교체
- 전국 모드(시군구 230개+)는 **반드시 마커 클러스터링**(`leaflet.markercluster`, CDN 동적 로드) 적용 —
  클러스터링 없이 개별 마커를 찍으면 수도권 등 밀집 지역이 완전히 겹쳐 클릭 불가능해짐.
- `getSigungus(region)` 등 `.filter()`로 매 렌더 새 배열을 만드는 값을 지도 컴포넌트의 `useEffect`
  의존성에 그대로 넣지 말 것 — `useMemo`로 안정화하지 않으면 무관한 상태 변경(예: 텍스트 입력)에도
  지도가 매번 파괴·재생성됨.
- Attribution: 작게 유지 (라이선스 필수)

## 11. 금지

- 순수 검정 플로팅 버튼, 개발자 노트성 푸터, 모호한 버튼 계층
- 팔레트 밖의 색(rose/sky/violet/amber/emerald 등)을 배지에 쓰는 것
- 사용자에게 노출되는 관리자/운영 안내문(예: 환경변수명, 배포 설정) — 코드 주석으로만 남기고
  UI 문구는 사용자 관점으로 작성
- 로딩 상태와 "결과 0건" 상태를 같은 조건(`length === 0`)으로 판별하는 것 — 별도 boolean으로 구분
- **장식용 예시 데이터에 실제 결과와 같은 문구를 쓰는 것** — 히어로 샘플 카드가 "예상 비용"을 그대로
  쓰면 화면에 같은 말이 두 번 나오고 사용자가 샘플을 자기 결과로 오인한다.
