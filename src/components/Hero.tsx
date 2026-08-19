"use client";

import Image from "next/image";
import { useState } from "react";
import { OnsenCanvas } from "./OnsenCanvas";
import { Tilt } from "./Tilt";

/** 히어로 카드 스택에 띄우는 예시 동선 — 실제 생성 결과가 어떤 모양인지 미리 보여준다 */
const SAMPLE_STOPS = [
  { time: "10:30", icon: "♨", title: "스파랜드 센텀시티", note: "도시 한복판의 온열 휴식" },
  { time: "13:00", icon: "🍜", title: "해운대 밀면", note: "온천 뒤에 부담 없는 한 끼" },
  { time: "16:20", icon: "🏞", title: "동백섬 해안 산책", note: "회복한 몸으로 걷는 바다" },
];

const STATS = [
  { value: "17", unit: "개 시도", label: "전국 커버리지" },
  { value: "230", unit: "개 시군구", label: "세부 지역 선택" },
  { value: "실시간", unit: "", label: "카카오 장소 데이터" },
];

export function Hero() {
  // WebGL을 못 쓰는 환경에서만 CSS 증기로 대체한다
  const [useCssSteam, setUseCssSteam] = useState(false);

  return (
    <section className="relative isolate min-h-[80svh] overflow-hidden bg-pine-deep lg:min-h-[88svh]">
      {/* ── 바닥: 온천 사진 ── 1200×420 원본이라 선명하게 쓰지 않고 대기 질감으로만 깐다 */}
      <Image
        src="/onsen-guide-hero.webp"
        alt=""
        fill
        priority
        unoptimized
        className="-z-30 scale-110 object-cover object-center opacity-55 blur-[1px]"
      />

      {/* 딥그린 스크림 — 왼쪽을 짙게 덮어 본문 대비를 확보한다 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[linear-gradient(100deg,rgba(15,32,24,0.96)_0%,rgba(22,41,31,0.82)_42%,rgba(20,38,29,0.34)_78%,rgba(20,38,29,0.5)_100%)]"
      />
      <div
        aria-hidden
        className="absolute -left-24 top-4 -z-20 h-80 w-80 rounded-full bg-clay/25 blur-3xl"
      />

      {/* ── 증기 레이어 ── */}
      {useCssSteam ? (
        <div aria-hidden className="steam-fallback absolute inset-0 -z-10" />
      ) : (
        <OnsenCanvas
          className="absolute inset-0 -z-10 h-full w-full"
          onFallback={() => setUseCssSteam(true)}
        />
      )}

      {/* 아래 섹션으로 자연스럽게 넘어가도록 바닥을 페이드 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-b from-transparent to-cream md:h-32"
      />

      <div className="relative mx-auto flex min-h-[80svh] w-full max-w-6xl flex-col justify-center px-5 py-20 lg:min-h-[88svh] lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ── 본문 ── */}
          <div className="animate-rise-in">
            <p className="flex items-center gap-2.5 text-[11px] font-extrabold tracking-eyebrow text-ember">
              <span aria-hidden className="h-px w-8 bg-current" />
              KOREAN ONSEN JOURNEY
            </p>

            <h1 className="mt-5 font-serif text-[clamp(2.6rem,7.2vw,4.75rem)] font-bold leading-[1.06] tracking-[-0.045em] text-[#FFFCF6]">
              몸의 온도로,
              <br />
              여행의 결을 고른다
            </h1>

            <p className="mt-6 max-w-lg text-[15px] leading-[1.85] text-white/80 md:text-base">
              사우나·찜질방·온천을 축으로 맛집과 볼거리, 숙소를 하루의 리듬으로 엮습니다.
              지역과 취향만 고르면 시간대별 동선이 완성됩니다.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#plan" className="btn-primary">
                코스 만들러 가기
                <span aria-hidden>→</span>
              </a>
              <a
                href="#guides"
                className="inline-flex min-h-[46px] items-center justify-center gap-1.5 rounded-pill border border-white/30 bg-white/10 px-6 font-bold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
              >
                여행 가이드 보기
                <span aria-hidden>↓</span>
              </a>
            </div>

            {/* 지표 스트립 */}
            <dl className="mt-11 flex flex-wrap gap-x-9 gap-y-5 border-t border-white/15 pt-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[10px] font-bold uppercase tracking-eyebrow text-white/45">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-serif text-2xl font-bold text-[#FFFCF6]">
                    {stat.value}
                    {stat.unit && (
                      <span className="ml-0.5 font-sans text-xs font-semibold text-white/60">
                        {stat.unit}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── 3D 카드 스택 ── 생성 결과의 모양을 입체로 미리 보여준다.
              화면이 좁으면 본문을 가리기만 하므로 lg 이상에서만 띄운다. */}
          <Tilt max={11} className="hidden lg:block" innerClassName="animate-rise-in">
            <div className="relative" style={{ transformStyle: "preserve-3d" }}>
              {/* 뒤로 물러난 두 장 — 깊이를 만든다 */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-card border border-white/10 bg-white/[0.07]"
                style={{ transform: "translateZ(-58px) translateX(30px) rotate(5deg)" }}
              />
              <div
                aria-hidden
                className="absolute inset-0 rounded-card border border-white/15 bg-white/[0.09]"
                style={{ transform: "translateZ(-28px) translateX(15px) rotate(2.5deg)" }}
              />

              {/* 본 카드 */}
              <div className="glass-dark relative rounded-card p-6 shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold tracking-eyebrow text-ember">
                    SAMPLE COURSE
                  </span>
                  <span className="rounded-pill bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white/80">
                    부산 · 1일차
                  </span>
                </div>

                <p className="mt-4 font-serif text-xl font-bold leading-snug text-[#FFFCF6]">
                  도시 한복판에서
                  <br />
                  느리게 풀어내는 하루
                </p>

                <ol className="mt-5 space-y-3.5 border-l border-white/20 pl-4">
                  {SAMPLE_STOPS.map((stop) => (
                    <li key={stop.time} className="relative">
                      <span
                        aria-hidden
                        className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-ember ring-4 ring-ember/20"
                      />
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xs font-bold text-ember">{stop.time}</span>
                        <span aria-hidden className="text-sm">
                          {stop.icon}
                        </span>
                        <span className="text-sm font-bold text-white">{stop.title}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-white/60">{stop.note}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 카드 위로 떠오른 배지 — preserve-3d 안에서 앞으로 밀어낸다 */}
              <div
                className="z-lift-lg absolute -right-5 -top-5 rounded-pill bg-onsen-gradient px-4 py-2 text-xs font-extrabold text-white shadow-cta"
                style={{ transformStyle: "preserve-3d" }}
              >
                ♨ 온천 중심
              </div>
              <div
                className="z-lift absolute -bottom-6 -left-6 rounded-pill bg-paper px-4 py-2 text-xs font-extrabold text-pine shadow-lift"
                style={{ transformStyle: "preserve-3d" }}
              >
                1일 예상 78,000원
              </div>
            </div>
          </Tilt>
        </div>

        {/* 스크롤 유도 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center"
        >
          <span className="animate-scroll-cue text-lg text-white/55">↓</span>
        </div>
      </div>
    </section>
  );
}
