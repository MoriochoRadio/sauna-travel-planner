# 정보 아키텍처 / 사용자 플로우 (IA.md)

## 1. 화면 구성
```
/                     입력 폼 (PlannerForm)
/api/course           POST → 코스 생성 (서버리스)
/ (결과 영역)         입력 폼 아래에 CourseView 렌더 (SPA 전환, 별도 라우트 없음)
```

## 2. 사용자 플로우

### Step A — 입력
- 지역 선택: 드롭다운 (서울/부산/강원/경주/제주 …)
- 기간: 1~4일 선택 (기본 2일)
- 취향: 다중 체크박스
  - 조용한(quiet) · 가성비(budget) · 프리미엄(premium) · 가족(family)
  - 혼자(solo) · 야외온천(outdoor_spa) · 음식중심(foodie)
- 특이사항: 자유텍스트 (예: "아이 동반, 차 없음")
- [코스 만들기] 버튼

### Step B — 로딩
- 스켈레톤 UI + "AI가 코스를 짜고 있어요…" 메시지
- 타임아웃/실패 시 폴백 안내

### Step C — 결과 (CourseView)
- 지역 + 요약 한 줄
- 일자별 카드:
  - Day N · 테마 (예: "오전 온천 → 오후 구시가지")
  - 타임라인 항목: 시간 | 장소명 | 추천이유 | 팁(이동/준비)
  - 예상 비용(원)
- [다시 만들기] 버튼 (같은 입력으로 재생성)
- 폴백 사용 시 "AI 생성 실패 → 기본 코스 표시" 뱃지

## 3. 데이터 흐름
```
PlannerForm
  → POST /api/course {region, days, preferences, note}
  → generateCourse(input)
       ├─ LLM (OpenRouter, 키 있음 & 성공) → Course
       └─ 폴백 (키 없음/실패)           → Course + usedFallback:true
  → CourseView 렌더
```

## 4. 반응형 / 접근성
- 모바일 우선 (1열 → 데스크톱 2열)
- 폼 라벨 명시, 버튼 최소 44px 터치 영역
- 콘트라스트: 따뜻한 톤(사우나 무드)이나 텍스트 가독성 유지
