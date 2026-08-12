import { invokeLLM, listLLMModels } from "../_core/llm";
import { type TravelPlace, travelPlaces } from "../../shared/travelCatalog";

export type TravelPreference = {
  region: string;
  purpose: "recovery" | "slow-travel" | "family-time" | "date" | "solo-reset";
  mood: string;
  budget: "light" | "balanced" | "signature";
  companion: string;
};

export type CourseStop = {
  period: "오전" | "오후" | "저녁";
  placeId: string;
  title: string;
  description: string;
  tip: string;
};

export type TravelCourse = {
  title: string;
  rationale: string;
  stops: CourseStop[];
  wellbeingNote: string;
  generatedWith: "ai" | "curated";
};

function scorePlace(place: TravelPlace, preference: TravelPreference) {
  let score = 0;
  if (place.region === preference.region) score += 5;
  if (place.mood.includes(preference.mood)) score += 3;
  if (place.companions.includes(preference.companion)) score += 2;
  if (place.priceBand === preference.budget) score += 2;
  if (preference.purpose === "family-time" && place.companions.includes("가족")) score += 3;
  if (preference.purpose === "solo-reset" && place.companions.includes("혼자")) score += 3;
  if (preference.purpose === "date" && place.companions.includes("연인")) score += 3;
  if (preference.purpose === "slow-travel" && place.mood.some(mood => ["고요한", "자연", "산속"].includes(mood))) score += 2;
  return score;
}

function pickPlaces(preference: TravelPreference) {
  const sorted = [...travelPlaces].sort((a, b) => scorePlace(b, preference) - scorePlace(a, preference));
  const primary = sorted.find(place => place.region === preference.region) ?? sorted[0];
  const secondary = sorted.find(place => place.id !== primary.id && place.region === primary.region) ?? sorted.find(place => place.id !== primary.id) ?? primary;
  return { primary, secondary };
}

export function createFallbackCourse(preference: TravelPreference): TravelCourse {
  const { primary, secondary } = pickPlaces(preference);
  const food = primary.neighborhood.find(item => item.type === "food") ?? primary.neighborhood[0];
  const sight = primary.neighborhood.find(item => item.type === "sight") ?? primary.neighborhood[0];
  return {
    title: `${primary.region}에서 보내는 느린 온천 하루`,
    rationale: `${preference.companion}와 함께 ${preference.mood} 분위기를 찾는 ${preference.purpose} 여행을 위해, 이동 부담보다 체류의 질을 우선한 코스입니다.`,
    stops: [
      { period: "오전", placeId: primary.id, title: sight.title, description: sight.description, tip: "느린 걸음으로 시작하고, 다음 장소까지 이동 시간을 충분히 남겨 두세요." },
      { period: "오후", placeId: primary.id, title: primary.name, description: primary.summary, tip: primary.usageTip },
      { period: "저녁", placeId: secondary.id, title: food.title, description: food.description, tip: "고온 환경 이용 뒤에는 수분을 보충하고 몸 상태에 맞춰 일정을 가볍게 마무리하세요." },
    ],
    wellbeingNote: "건강 관련 정보는 일반적인 연구 요약입니다. 개인의 질환, 복용 약물, 임신 여부 등은 의료진의 조언을 우선하세요.",
    generatedWith: "curated",
  };
}

function parseCourse(value: string, preference: TravelPreference): TravelCourse | null {
  try {
    const parsed = JSON.parse(value) as Omit<TravelCourse, "generatedWith">;
    if (!parsed.title || !parsed.rationale || !Array.isArray(parsed.stops)) return null;
    const validStops = parsed.stops.filter(stop => ["오전", "오후", "저녁"].includes(stop.period) && travelPlaces.some(place => place.id === stop.placeId));
    if (!validStops.length) return null;
    return {
      title: parsed.title,
      rationale: parsed.rationale,
      stops: validStops.slice(0, 3),
      wellbeingNote: parsed.wellbeingNote || createFallbackCourse(preference).wellbeingNote,
      generatedWith: "ai",
    };
  } catch {
    return null;
  }
}

export function extractLLMText(content: string | Array<{ type: "text"; text: string } | { type: "image_url" } | { type: "file_url" }> | null | undefined) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter((part): part is { type: "text"; text: string } => part.type === "text").map(part => part.text).join("\n");
}

export async function generateTravelCourse(preference: TravelPreference): Promise<TravelCourse> {
  const fallback = createFallbackCourse(preference);
  try {
    const catalog = await listLLMModels();
    const model = catalog.data.find(item => item.id === "gpt-5-mini")?.id ?? catalog.data[0]?.id;
    if (!model) return fallback;
    const candidates = travelPlaces.map(place => ({ id: place.id, name: place.name, region: place.region, mood: place.mood, companions: place.companions, priceBand: place.priceBand, summary: place.summary, usageTip: place.usageTip })).slice(0, 8);
    const response = await invokeLLM({
      model,
      messages: [
        { role: "system", content: "You are a Korean wellness travel curator. Generate only a calm, realistic day itinerary from the supplied curated candidates. Never claim medical benefits, invent opening hours, prices, reviews, transit times, or facts. Keep the output in Korean and follow the JSON schema exactly." },
        { role: "user", content: `여행 선호: ${JSON.stringify(preference)}\n큐레이션 장소: ${JSON.stringify(candidates)}` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sauna_travel_course",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              rationale: { type: "string" },
              stops: {
                type: "array",
                minItems: 2,
                maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    period: { type: "string", enum: ["오전", "오후", "저녁"] },
                    placeId: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    tip: { type: "string" },
                  },
                  required: ["period", "placeId", "title", "description", "tip"],
                  additionalProperties: false,
                },
              },
              wellbeingNote: { type: "string" },
            },
            required: ["title", "rationale", "stops", "wellbeingNote"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = response.choices[0]?.message?.content;
    return parseCourse(extractLLMText(content), preference) ?? fallback;
  } catch {
    return fallback;
  }
}
