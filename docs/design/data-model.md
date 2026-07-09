# 데이터 모델 상세 설계 (Data Model Design)

> Phase: Design · 문서 버전: v0.1 · 날짜: 2026-07-09
> 상위: src/data/schema.ts, docs/analysis/data-sources.md

## 1. 입력 모델 (PlannerInput) — 이미 정의

```ts
PlannerInput = { region, days(1..4), preferences[], note? }
```

## 2. 도메인 데이터 모델 (장소/지역)

| 엔티티 | 필드 | 타입 | 설명 |
|--------|------|------|------|
| Place | id | string | region 내 유일 (예: "gangwon-sauna-01") |
| | name | string | 표시명 |
| | type | enum | sauna/jjimjilbang/spa/restaurant/attraction |
| | region | enum | Region |
| | city | string | 시군구 |
| | summary | string | 한 줄 |
| | tags | string[] | 필터/가중 키 |
| | priceLevel | enum | low/mid/high |
| | avgDurationMin | number | 체류분(타임라인 배치 변수) |
| | address? | string | |
| | url? | string(url) | |
| | openHours? | string | |
| | highlights | string[] | 추천 포인트(≥1) |
| Region | id/name/blurb | — | 지역 래퍼 |
| | places | Place[] | 지역 내 장소 |

## 3. 출력 모델 (Course) — 신규 설계

```ts
CourseStop = {
  time: string;          // "10:00"
  placeId?: string;      // seed id 참조(가능 시) — 환각 억제
  title: string;         // 장소명 또는 코스 노드 명칭
  reason: string;        // 추천 이유
  tip?: string;          // 이동/준비/수분 팁
}
Day = { day: number; theme: string; stops: CourseStop[] }
Course = {
  region: string;
  days: Day[];
  estCostKrw: number;    // 예상 비용(원)
  summary: string;       // 웰니스 멘트 포함
  usedFallback?: boolean;// 폴백 사용 여부 (엔진이 주입)
}
```

## 4. 가중/필터 로직 (폴백용)

```
score(place, preferences):
  base = 1
  if budget ∈ pref and priceLevel=="low"  → +2
  if budget ∈ pref and priceLevel=="high" → -2
  if premium ∈ pref and priceLevel=="high"→ +2
  if outdoor_spa ∈ pref and "야외온천" ∈ tags → +3
  if family ∈ pref and "가족" ∈ tags → +2
  if quiet ∈ pref and "조용한" ∈ tags → +2
  if foodie ∈ pref and type=="restaurant" → +1
  if solo ∈ pref and "혼자" ∈ tags → +2
```

## 5. 시간대 매핑 (폴백)

- 사우나/스파: 10:00, 19:00 슬롯 (R-1)
- restaurant: 13:00, 18:00 슬롯 (R-3)
- attraction: 15:00 슬롯 (R-4 완충)
- Stop 간격은 avgDurationMin 기반 누적
