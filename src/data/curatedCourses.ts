import type { Course } from "../ai/course.schema";
import type { PlannerInput, Region } from "./schema";

/**
 * 손으로 짠 추천 코스.
 *
 * 이전에는 OpenRouter LLM으로 코스를 생성하고 실패하면 규칙 기반으로 넘어갔다.
 * 실제로는 키가 없어 늘 규칙 기반으로 돌면서 화면에는 "AI 생성 실패"라고
 * 표시됐다. 매번 달라지는 생성 결과보다, 검증한 장소로 미리 짜 둔 코스가
 * 품질이 일정하고 설명도 구체적이다.
 *
 * 여기 없는 지역·기간은 규칙 기반 생성기(fallback.ts)가 그대로 맡는다.
 * 장소 id는 src/data/verified.ts 와 seed 의 실제 항목을 가리킨다.
 */
export type CuratedCourse = Omit<Course, "places">;

type CuratedKey = `${Region}-${number}`;

export const curatedCourses: Partial<Record<CuratedKey, CuratedCourse>> = {
  "busan-1": {
    region: "busan",
    estCostKrw: 95000,
    summary:
      "동래 온천수로 몸을 풀고, 해운대에서 도시를 내려다보며 마무리하는 하루입니다. 이동을 두 번으로 줄여 쉬는 시간을 길게 잡았습니다.",
    days: [
      {
        day: 1,
        theme: "온천으로 열고, 도시에서 닫는 하루",
        stops: [
          {
            time: "10:30",
            placeId: "busan-spa-verified-02",
            title: "허심청",
            reason:
              "동래 온천권의 온천수로 하루를 엽니다. 아침 시간대가 가장 한산합니다.",
            tip: "입욕 전후로 물 500ml를 나눠 마시고, 고온탕은 한 번에 10분을 넘기지 마세요.",
          },
          {
            time: "13:00",
            title: "동래 온천장 골목 점심",
            reason:
              "온천 바로 앞 상권이라 이동 없이 따뜻한 한 끼를 먹을 수 있습니다.",
            tip: "탕에서 나온 직후에는 과식보다 국물 있는 가벼운 메뉴가 편합니다.",
          },
          {
            time: "15:30",
            placeId: "busan-spa-verified-01",
            title: "스파랜드 센텀시티",
            reason:
              "실내형이라 날씨의 영향을 받지 않고, 여러 온열 공간을 옮겨 다니며 오래 머물기 좋습니다.",
            tip: "기본 이용 시간이 정해져 있으니 입장 전에 공식 안내를 확인하세요.",
          },
          {
            time: "19:00",
            title: "영화의전당 주변 산책",
            reason:
              "해 질 무렵 건축과 야외 공간을 천천히 둘러보며 하루를 정리합니다.",
            tip: "온열 뒤에는 체온이 빨리 떨어집니다. 겉옷을 하나 챙기세요.",
          },
        ],
      },
    ],
  },

  "gangwon-1": {
    region: "gangwon",
    estCostKrw: 78000,
    summary:
      "설악산 자락에서 온천을 여행의 중심 장면으로 두는 하루입니다. 산행과 고온욕을 같은 날 겹치지 않도록 짰습니다.",
    days: [
      {
        day: 1,
        theme: "산속 공기와 온천 사이의 여백",
        stops: [
          {
            time: "11:00",
            title: "오색약수 주변 짧은 산책",
            reason: "입욕 전에 몸을 가볍게 데우는 정도로만 걷습니다.",
            tip: "산행처럼 길게 걷지 마세요. 30분 안쪽이면 충분합니다.",
          },
          {
            time: "13:00",
            title: "양양 로컬 점심",
            reason: "온천 입장 전 속을 채워 두면 어지럼증을 줄일 수 있습니다.",
            tip: "음주는 피하세요. 고온 환경에서 탈수를 키웁니다.",
          },
          {
            time: "14:30",
            placeId: "gangwon-spa-verified-01",
            title: "오색그린야드호텔 온천",
            reason: "산속 온천을 하루의 중심에 두고 충분히 머무릅니다.",
            tip: "계절에 따라 운영 시간이 달라집니다. 방문 전 공식 채널에서 확인하세요.",
          },
          {
            time: "17:30",
            title: "귀가 동선 정리",
            reason:
              "산간 도로는 해가 지면 이동 시간이 길어집니다. 여유 있게 출발합니다.",
            tip: "입욕 직후 장거리 운전은 피하고, 30분은 쉬었다 출발하세요.",
          },
        ],
      },
    ],
  },

  "chungnam-1": {
    region: "chungnam",
    estCostKrw: 88000,
    summary:
      "수도권에서 가까운 도고 온천권에서 속도를 늦추는 하루입니다. 체류 시간을 길게 잡아 이동을 최소화했습니다.",
    days: [
      {
        day: 1,
        theme: "근교에서 하루를 통째로 쉬기",
        stops: [
          {
            time: "11:00",
            placeId: "chungnam-spa-verified-01",
            title: "파라다이스 스파 도고",
            reason:
              "노천을 포함해 여러 탕을 오가며 오래 머물기 좋습니다. 오전 입장이 여유롭습니다.",
            tip: "야외 시설은 계절에 따라 운영이 달라지니 예약 페이지에서 확인하세요.",
          },
          {
            time: "14:30",
            title: "아산 로컬 점심",
            reason:
              "온천 일정에 맞춰 식사 시간을 유연하게 조정할 수 있는 상권입니다.",
            tip: "탕과 식사 사이에 20분 정도는 쉬어 주세요.",
          },
          {
            time: "16:00",
            title: "도고 온천권 산책",
            reason: "온천 마을의 느린 분위기를 걸으며 하루를 마무리합니다.",
            tip: "이동 거리가 짧아 체력을 남긴 채 귀가할 수 있습니다.",
          },
        ],
      },
    ],
  },

  "gyeonggi-1": {
    region: "gyeonggi",
    estCostKrw: 82000,
    summary:
      "이동을 최소화한 수도권 당일 코스입니다. 실내 위주라 날씨에 영향을 받지 않습니다.",
    days: [
      {
        day: 1,
        theme: "이동 없이 반나절 쉬기",
        stops: [
          {
            time: "12:00",
            title: "킨텍스 인근 점심",
            reason: "선택 폭이 넓어 동행의 취향이 달라도 맞추기 쉽습니다.",
            tip: "찜질 전에는 과식을 피하세요.",
          },
          {
            time: "14:00",
            placeId: "gyeonggi-spa-verified-01",
            title: "아쿠아필드 고양",
            reason: "쇼핑·식사·찜질이 한 건물 안에 있어 이동 부담이 없습니다.",
            tip: "이동이 많은 날이라면 한낮보다 늦은 오후가 한산합니다.",
          },
          {
            time: "17:30",
            title: "호수공원 산책",
            reason: "온열 뒤 바깥 공기를 쐬며 체온을 천천히 내립니다.",
            tip: "땀이 식으면서 체온이 떨어집니다. 겉옷을 챙기세요.",
          },
        ],
      },
    ],
  },

  "gyeongbuk-2": {
    region: "gyeongbuk",
    estCostKrw: 210000,
    summary:
      "울진 산자락에서 하룻밤 머무르며 회복에 집중하는 1박 2일입니다. 도착한 날은 욕심을 줄이고, 다음 날 아침 산책으로 마무리합니다.",
    days: [
      {
        day: 1,
        theme: "도착한 날은 쉬는 것까지가 일정",
        stops: [
          {
            time: "15:00",
            placeId: "gyeongbuk-spa-verified-01",
            title: "덕구온천 리조트 체크인",
            reason:
              "산간 이동은 예상보다 길어집니다. 도착 뒤 바로 쉬어도 일정이 완성되도록 잡았습니다.",
            tip: "체크인 직후 바로 입욕하기보다 30분 정도 쉬었다 들어가세요.",
          },
          {
            time: "17:00",
            title: "온천 입욕",
            reason: "이동 피로를 푸는 데 하루의 중심을 둡니다.",
            tip: "고온탕과 휴식을 번갈아 가되, 어지럼증이 있으면 즉시 나오세요.",
          },
          {
            time: "19:30",
            title: "가벼운 저녁과 수분 보충",
            reason: "입욕 뒤에는 무거운 식사보다 국물과 물을 우선합니다.",
            tip: "음주는 다음 날 회복을 늦춥니다.",
          },
        ],
      },
      {
        day: 2,
        theme: "아침 산책으로 여행을 닫기",
        stops: [
          {
            time: "08:30",
            title: "응봉산 자락 짧은 산책",
            reason:
              "무리하지 않는 범위로 걸으면 여행이 급하게 끝나지 않습니다.",
            tip: "전날 입욕으로 피로가 남아 있으면 산책 거리를 줄이세요.",
          },
          {
            time: "10:30",
            title: "온천 마무리 입욕",
            reason: "체크아웃 전 짧게 한 번 더 몸을 데웁니다.",
            tip: "귀가 운전이 있다면 짧게 끝내세요.",
          },
          {
            time: "12:30",
            title: "울진 로컬 점심 후 출발",
            reason: "식사를 마치고 여유 있게 출발해 안전하게 돌아옵니다.",
            tip: "귀가 시각을 넉넉히 잡아 두세요.",
          },
        ],
      },
    ],
  },
};

/** 지역·기간에 맞는 손수 짠 코스가 있으면 돌려준다. */
export function findCuratedCourse(
  input: PlannerInput,
): CuratedCourse | undefined {
  return curatedCourses[`${input.region}-${input.days}` as CuratedKey];
}
