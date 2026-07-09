# AI 프롬프트 설계 (AI Prompt Design)

> Phase: Design · 문서 버전: v0.1 · 날짜: 2026-07-09
> 상위: docs/analysis/domain-model.md (도메인 규칙 R-1~R-7)

## 1. 시스템 프롬프트 (System Prompt)

```
당신은 한국 사우나·찜질방·온천 여행 전문가입니다.
사용자 입력(지역/기간/취향/특이사항)과 제공된 장소 데이터를 바탕으로
사우나를 '축'으로 삼고 맛집과 볼거리를 조화롭게 엮은 여행 코스를 설계하세요.

필수 원칙:
- 사우나/온천은 하루 1회 집중(오전 또는 저녁), 과열 방지
- 사우나 전후 수분·휴식 버퍼를 둘 것 (멘트에 수분 500ml 권장)
- 맛집은 점심(13시)/저녁(18시) 배치
- 볼거리는 오후(15시) 완충 코스로 배치
- 장소는 반드시 제공된 데이터의 name 또는 placeId를 사용 (존재하지 않는 곳 금지)
- 취향(조용한/가성비/프리미엄/가족/혼자/야외온천/음식중심)을 반영
- 한글, 친근하고 실용적인 어투

출력은 주어진 JSON 스키마만 준수하세요. 다른 텍스트 금지.
```

## 2. 유저 프롬프트 (User Prompt) 템플릿

```
[입력]
지역: {regionName}
기간: {days}일
취향: {preferencesLabel} (없으면 "없음")
특이사항: {note or "없음"}

[장소 데이터]
{region.places 를 JSON으로 직렬화}

위 데이터만 사용해 {days}일 코스를 만들고, 지정된 JSON 스키마로 출력하세요.
estCostKrw는 1인 기준 예상 비용(원)으로 계산하세요.
```

## 3. JSON Schema 강제 (response_format)

```json
{
  "type": "json_schema",
  "json_schema": {
    "name": "course",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "region": {"type":"string"},
        "days": {
          "type":"array",
          "items": {
            "type":"object",
            "properties": {
              "day": {"type":"integer"},
              "theme": {"type":"string"},
              "stops": {
                "type":"array",
                "items": {
                  "type":"object",
                  "properties": {
                    "time":{"type":"string"},
                    "placeId":{"type":"string"},
                    "title":{"type":"string"},
                    "reason":{"type":"string"},
                    "tip":{"type":"string"}
                  },
                  "required":["time","title","reason"],
                  "additionalProperties":false
                }
              }
            },
            "required":["day","theme","stops"],
            "additionalProperties":false
          }
        },
        "estCostKrw": {"type":"integer"},
        "summary": {"type":"string"}
      },
      "required":["region","days","estCostKrw","summary"],
      "additionalProperties":false
    }
  }
}
```

## 4. 환각 억제 전략
- 유저 프롬프트에 해당 region의 places만 주입 → 후보 제한
- `placeId` 참조를 권장하되, 이름이라도 반드시 데이터 내 존재해야 함
- 파싱 후 `CourseSchema`로 검증, 실패 시 폴백

## 5. 재시도
- 1차 파싱 실패 → 동일 요청 1회 재시도
- 2회 실패 → 폴백
