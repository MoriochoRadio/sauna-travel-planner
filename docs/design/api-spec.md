# API 명세 설계 (API Specification)

> Phase: Design · 문서 버전: v0.1 · 날짜: 2026-07-09
> 엔드포인트: POST /api/course

## 1. 요청 (Request)

```
POST /api/course
Content-Type: application/json
Body:
{
  "region": "gangwon",          // Region enum
  "days": 2,                    // 1..4
  "preferences": ["premium","outdoor_spa"],  // Preference[] (선택)
  "note": "겨울 방문, 차 없음"   // 선택, 500자 이내
}
```

### 검증 (Zod: PlannerInputSchema)
- `region`: enum 위반 → 400 `{"error":"invalid_region"}`
- `days`: 정수 1..4 위반 → 400 `{"error":"invalid_days"}`
- `preferences`: enum 원소 위반 → 400 `{"error":"invalid_preference"}`
- `note`: 500자 초과 → 400 `{"error":"note_too_long"}`

## 2. 응답 (Response)

### 성공 (LLM 또는 폴백)
```
200 OK
{
  "region": "강원",
  "days": [
    {
      "day": 1,
      "theme": "설원 속 노천온천 힐링",
      "stops": [
        {"time":"10:00","placeId":"gangwon-sauna-01","title":"평창 용평 온천",
         "reason":"겨울 노천온천으로 시작하는 힐링","tip":"수분 챙기세요"},
        {"time":"13:00","title":"평창 송어 회·매운탕",
         "reason":"온천 전 보양 식사","tip":""},
        {"time":"15:00","title":"오대산 국립공원",
         "reason":"숲 산책으로 완충","tip":"방한 준비"}
      ]
    }
  ],
  "estCostKrw": 120000,
  "summary": "하루 1회 온천+수분 500ml 권장",
  "usedFallback": false
}
```

### 실패 (검증)
```
400 Bad Request
{ "error": "invalid_days" }
```

## 3. 처리 흐름 (서버)

1. `PlannerInputSchema.safeParse(body)`
2. 실패 → 400 + 에러 코드
3. 성공 → `generateCourse(input)`
   - LLM 호출 시도 (env 키 존재 & 성공 & CourseSchema 통과)
   - 실패 → `fallback(input)` + `usedFallback:true`
4. `CourseSchema.safeParse(result)` → 통과 시 200, 실패 시 500

## 4. 비기능
- 타임아웃: LLM 호출 12s 상한 (초과 시 폴백)
- CORS: 동일 오리진(Next.js 자체) — 외부 개방 없음
- 로깅: 에러만 서버 로그 (사용자 입력 평문 저장 안 함)
