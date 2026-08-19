"use client";

import { Reveal } from "./Reveal";
import { Tilt } from "./Tilt";

/**
 * "어떤 쉼이 필요한가요?" — 코스를 짜기 전에 여행의 결을 먼저 고르게 하는 도입부.
 *
 * 각 카드는 사진 대신 추상 지형(SVG 아크)으로 장면을 표현한다. 장소 사진은 출처와
 * 사용 허가가 정리된 것만 쓴다는 이 프로젝트의 정책 때문이며, 대신 카드를 기울일 때
 * 지형 레이어가 서로 다른 깊이로 움직여 입체감을 만든다.
 */

type Scene = {
  index: string;
  title: string;
  description: string;
  hint: string;
  /** 카드 배경 그라데이션 */
  sky: string;
  /** 지형 3층의 색 (먼 곳 → 가까운 곳) */
  ridges: [string, string, string];
  badge: string;
};

const SCENES: Scene[] = [
  {
    index: "SCENE 01",
    title: "도시의 여백",
    description:
      "복잡한 일정 사이, 가장 가까운 곳에서 잠깐의 회복을 찾습니다. 이동을 줄이고 실내 휴식을 중심에 둡니다.",
    hint: "도시형 · 반나절",
    sky: "linear-gradient(165deg,#F0DCCB 0%,#E4C9B4 55%,#D9B39C 100%)",
    ridges: ["#C4A18B", "#A47F68", "#6E5344"],
    badge: "🏙",
  },
  {
    index: "SCENE 02",
    title: "자연의 온도",
    description:
      "산과 바다의 리듬 속에서 오래 머무는 온천 여행을 만듭니다. 노천탕과 산책을 하루의 축으로 삼습니다.",
    hint: "야외온천 · 1박 이상",
    sky: "linear-gradient(165deg,#DDE6D6 0%,#B9CDBA 55%,#8DA99A 100%)",
    ridges: ["#7E9C89", "#5B7C68", "#2F4A3B"],
    badge: "⛰",
  },
  {
    index: "SCENE 03",
    title: "함께 쉬는 시간",
    description:
      "동행의 속도까지 생각한 가족·연인·친구의 하루를 제안합니다. 무리 없는 간격으로 일정을 벌려 둡니다.",
    hint: "가족 · 느긋하게",
    sky: "linear-gradient(165deg,#F6E7D6 0%,#EDD4BE 55%,#C89576 100%)",
    ridges: ["#D3A98A", "#B4826A", "#7C5644"],
    badge: "🫧",
  },
];

/** 세 겹으로 겹친 능선 — 카드를 기울이면 각 층이 다른 속도로 움직인다 */
function Ridges({ colors }: { colors: Scene["ridges"] }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 150"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 h-full w-full"
    >
      <path d="M0 96 C48 70 84 88 128 74 C176 58 214 80 260 66 C288 58 306 62 320 58 L320 150 L0 150 Z" fill={colors[0]} opacity="0.75" />
      <path d="M0 116 C44 96 92 110 134 100 C184 88 218 104 262 96 C292 90 308 92 320 88 L320 150 L0 150 Z" fill={colors[1]} opacity="0.85" />
      <path d="M0 136 C52 122 96 132 142 126 C192 119 224 128 268 124 C296 121 310 122 320 120 L320 150 L0 150 Z" fill={colors[2]} />
      {/* 수면에 어리는 김 */}
      <ellipse cx="96" cy="132" rx="46" ry="7" fill="#FFFCF6" opacity="0.22" />
      <ellipse cx="212" cy="139" rx="34" ry="5" fill="#FFFCF6" opacity="0.16" />
    </svg>
  );
}

export function SceneCards() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24 lg:px-8" aria-labelledby="scenes-heading">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Curated moments</p>
            <h2
              id="scenes-heading"
              className="mt-2 font-serif text-[clamp(1.9rem,4.2vw,2.75rem)] font-bold tracking-[-0.04em] text-pine"
            >
              어떤 쉼이 필요한가요?
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-bark-soft">
            좋아하는 장면부터 고르면, 아래 코스 메이커에서 지역과 취향을 정할 때 방향이 한결 또렷해집니다.
          </p>
        </div>
      </Reveal>

      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {SCENES.map((scene, i) => (
          <li key={scene.index}>
            <Reveal delay={i * 110}>
              <Tilt max={10}>
                <article className="card relative h-full overflow-visible p-4">
                  {/* 추상 지형 패널 */}
                  <div
                    className="relative h-40 overflow-hidden rounded-[16px]"
                    style={{ background: scene.sky }}
                  >
                    <Ridges colors={scene.ridges} />
                  </div>

                  {/* 패널 위로 떠오르는 요소들 — .tilt-inner의 preserve-3d 안에 직접 놓여야
                      translateZ가 살아난다 (overflow-hidden 안에 넣으면 평평해진다) */}
                  <span
                    aria-hidden
                    className="z-lift absolute left-7 top-7 grid h-11 w-11 place-items-center rounded-pill bg-paper text-lg shadow-lift"
                  >
                    {scene.badge}
                  </span>
                  <span className="z-lift-sm absolute right-7 top-8 rounded-pill bg-pine/85 px-3 py-1 text-[10px] font-bold text-white backdrop-blur">
                    {scene.hint}
                  </span>

                  <div className="px-2 pb-2 pt-5">
                    <p className="text-[10px] font-extrabold tracking-eyebrow text-clay">{scene.index}</p>
                    <h3 className="mt-2 font-serif text-2xl font-bold tracking-[-0.03em] text-pine">
                      {scene.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-[1.75] text-bark-soft">{scene.description}</p>
                    <a
                      href="#plan"
                      className="mt-4 inline-flex min-h-[32px] items-center gap-1 text-sm font-bold text-clay transition-colors hover:text-clay-deep"
                    >
                      이 결로 코스 짜기
                      <span aria-hidden>→</span>
                    </a>
                  </div>
                </article>
              </Tilt>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
