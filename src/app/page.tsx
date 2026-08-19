"use client";

import { useEffect, useState } from "react";
import { PlannerForm } from "@/components/PlannerForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TravelGuides } from "@/components/TravelGuides";
import { Hero } from "@/components/Hero";
import { SceneCards } from "@/components/SceneCards";
import { SiteHeader } from "@/components/SiteHeader";
import { Reveal } from "@/components/Reveal";
import { decodeInputFromQuery } from "@/data/share";
import type { PlannerInput } from "@/data/schema";

export default function Home() {
  // 공유 URL(?region=...&days=...)로 진입 시 자동 생성 플래그
  const [autoInput, setAutoInput] = useState<PlannerInput | null>(null);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const qs = window.location.search;
    if (qs) {
      const params = new URLSearchParams(qs);
      const decoded = decodeInputFromQuery(qs.slice(1));
      if (decoded) {
        setAutoInput(decoded);
        setAutoSubmit(params.get("auto") !== "0");
      }
    }
    setChecked(true);
  }, []);

  // 공유 링크로 들어온 사람은 코스를 보러 온 것이므로, 히어로를 지나 바로
  // 생성 영역으로 내려보낸다.
  useEffect(() => {
    if (!checked || !autoInput) return;
    document.getElementById("plan")?.scrollIntoView({ block: "start" });
  }, [checked, autoInput]);

  return (
    <div id="top" className="relative min-h-screen bg-page-bg">
      {/* 미네랄 온천수 입자감 — 전체 배경에 아주 은은한 질감 */}
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-0" />

      <SiteHeader />

      <main className="relative">
        <Hero />

        <SceneCards />

        {/* ── 코스 메이커 ── */}
        <section id="plan" className="relative scroll-mt-20 overflow-hidden py-16 md:py-20">
          {/* 온천 물결 링 — 이 섹션의 시그니처 모티프. 돌을 던진 온천에 번지는 파문 */}
          <svg
            aria-hidden
            viewBox="0 0 520 520"
            className="pointer-events-none absolute -right-28 -top-16 z-0 hidden h-[420px] w-[420px] md:block lg:h-[520px] lg:w-[520px]"
          >
            <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.4 }} cx="260" cy="260" r="70" fill="none" stroke="var(--clay)" strokeWidth="1.5" />
            <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.3, animationDelay: "1.4s" }} cx="260" cy="260" r="130" fill="none" stroke="var(--sage)" strokeWidth="1.5" />
            <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.22, animationDelay: "2.8s" }} cx="260" cy="260" r="190" fill="none" stroke="var(--clay)" strokeWidth="1.25" />
            <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.14, animationDelay: "4.2s" }} cx="260" cy="260" r="250" fill="none" stroke="var(--sage)" strokeWidth="1" />
          </svg>

          <div className="relative mx-auto w-full max-w-md px-4 md:max-w-2xl lg:max-w-5xl lg:px-8">
            <Reveal>
              <div className="mb-9 text-center lg:text-left">
                <p className="eyebrow">Build your course</p>
                <h2 className="mt-2 font-serif text-[clamp(1.9rem,4.2vw,2.75rem)] font-bold tracking-[-0.04em] text-pine">
                  지역과 취향만 고르면 됩니다
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-bark-soft lg:mx-0">
                  전국 17개 시도·230개 시군구에서 사우나와 온천을 찾고, 실시간 장소 데이터와
                  AI 추천으로 시간대별 동선을 만들어 드립니다.
                </p>
                {/* 물결 구분선 */}
                <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="mx-auto mt-6 h-3 w-24 opacity-70 lg:mx-0">
                  <path d="M0 6 Q 12.5 0 25 6 T 50 6 T 75 6 T 100 6 T 125 6 T 150 6 T 175 6 T 200 6" fill="none" stroke="var(--clay)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </Reveal>

            {checked && (
              <ErrorBoundary>
                <PlannerForm initialInput={autoInput} autoSubmit={autoSubmit} />
              </ErrorBoundary>
            )}
          </div>
        </section>

        {/* ── 여행 가이드 ── */}
        <div className="mx-auto w-full max-w-md px-4 pb-8 md:max-w-2xl lg:max-w-5xl lg:px-8">
          <ErrorBoundary>
            <TravelGuides />
          </ErrorBoundary>
        </div>
      </main>

      <footer className="relative mt-8 border-t border-line/70 bg-pine-gradient">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div>
              <p className="flex items-center gap-2.5 font-serif text-lg font-bold text-[#FFFCF6]">
                <span aria-hidden className="grid h-8 w-8 place-items-center rounded-pill bg-white/15">
                  ♨
                </span>
                사우나 여행 코스 메이커
              </p>
              <p className="mt-3 max-w-md text-xs leading-relaxed text-white/55">
                지역·기간·취향을 입력하면 하루 코스가 완성됩니다. 실시간 카카오 장소 데이터와
                AI 추천을 함께 씁니다.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-white/70">
              <a href="#plan" className="inline-flex min-h-[32px] items-center hover:text-white">
                코스 만들기
              </a>
              <a href="#guides" className="inline-flex min-h-[32px] items-center hover:text-white">
                여행 가이드
              </a>
              <a
                href="https://github.com/MoriochoRadio/sauna-travel-planner"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[32px] items-center hover:text-white"
              >
                소스코드
              </a>
            </nav>
          </div>
          <p className="mt-9 border-t border-white/10 pt-6 text-[11px] leading-relaxed text-white/40">
            운영 시간·요금·이용 조건은 변동될 수 있습니다. 방문 전 각 장소의 공식 출처를 확인하세요.
          </p>
        </div>
      </footer>
    </div>
  );
}
