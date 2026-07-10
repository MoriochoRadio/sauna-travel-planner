import type { PlannerInput, RegionData } from "../data/schema";

const PREF_LABELS: Record<string, string> = {
  quiet: "조용한",
  budget: "가성비",
  premium: "프리미엄",
  family: "가족",
  solo: "혼자",
  outdoor_spa: "야외온천",
  foodie: "음식중심",
};

export function systemPrompt(): string {
  return `당신은 한국 사우나·찜질방·온천 여행 전문가입니다.
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

반드시 아래 JSON 형식으로만 출력하세요. 다른 텍스트(설명, 인사말)는 절대 금지, 코드펜스(\`\`\`)도 사용하지 마세요:
{
  "region": "지역명",
  "days": [
    {
      "day": 1,
      "theme": "하루 주제",
      "stops": [
        { "time": "10:00", "placeId": "장소ID", "title": "장소명", "reason": "이유", "tip": "팁" }
      ]
    }
  ],
  "estCostKrw": 0,
  "summary": "코스 한 줄 요약"
}`;
}

export function userPrompt(input: PlannerInput, region: RegionData): string {
  const prefs = input.preferences.length
    ? input.preferences.map((p) => PREF_LABELS[p] ?? p).join(", ")
    : "없음";
  const note = input.note?.trim() || "없음";

  // 먼저 고른 사우나/온천을 코스의 핵심(첫 stop)으로 고정
  const anchor = input.anchorSaunaId
    ? region.places.find((p) => p.id === input.anchorSaunaId)
    : undefined;
  const anchorLine = anchor
    ? `\n중심 사우나(반드시 1일차 첫 stop으로 배치): ${anchor.name} (${anchor.id})`
    : "";

  const onsenLine = input.onsenFocus
    ? "\n모드: 온천 중심 — spa(온천) 유형을 우선 배치하고 온천 위주로 코스를 구성하세요."
    : "";
  const lodgingLine = input.includeLodging
    ? "\n숙소: 온천/사우나를 보유한 숙소(lodging, hasOnsen/hasSauna)를 저녁 이후 마지막 stop으로 추천하세요."
    : "";

  const sigunguLine = input.sigungu
    ? `\n세부 지역(시군구): ${input.sigungu} — 해당 시군구(sigungu 필드 일치) 장소를 우선 배치하세요.`
    : "";

  return `[입력]
지역: ${region.name}
기간: ${input.days}일
취향: ${prefs}
특이사항: ${note}${anchorLine}${onsenLine}${lodgingLine}${sigunguLine}

[장소 데이터]
${JSON.stringify(region.places, null, 2)}

위 데이터만 사용해 ${input.days}일 코스를 만들고, 지정된 JSON 형식으로 출력하세요.
estCostKrw는 1인 기준 예상 비용(원)으로 계산하세요.`;
}
