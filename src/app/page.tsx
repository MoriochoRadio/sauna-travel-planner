"use client";

import { useEffect, useState } from "react";
import { PlannerForm } from "@/components/PlannerForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TravelGuides } from "@/components/TravelGuides";
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

  return (
    <div className="min-h-screen bg-page-bg relative">
      {/* 미네랄 온천수 입자감 — 전체 배경에 아주 은은한 질감 */}
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-0" />

      {/* 온천 물결 링 — 이 페이지의 시그니처 모티프. 돌을 던진 온천에 번지는 파문을 형상화 (데스크탑 전용, 모바일은 깨끗하게 유지) */}
      <svg
        aria-hidden
        viewBox="0 0 520 520"
        className="pointer-events-none fixed -top-24 -right-24 z-0 hidden md:block w-[420px] h-[420px] lg:w-[520px] lg:h-[520px]"
      >
        <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.55 }} cx="260" cy="260" r="70" fill="none" stroke="var(--onsen)" strokeWidth="1.5" />
        <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.4, animationDelay: "1.4s" }} cx="260" cy="260" r="130" fill="none" stroke="var(--steam)" strokeWidth="1.5" />
        <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.28, animationDelay: "2.8s" }} cx="260" cy="260" r="190" fill="none" stroke="var(--onsen)" strokeWidth="1.25" />
        <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.18, animationDelay: "4.2s" }} cx="260" cy="260" r="250" fill="none" stroke="var(--steam)" strokeWidth="1" />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 360 360"
        className="pointer-events-none fixed -bottom-20 -left-20 z-0 hidden md:block w-72 h-72"
      >
        <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.22, animationDelay: "2s" }} cx="180" cy="180" r="90" fill="none" stroke="var(--onsen-deep)" strokeWidth="1.25" />
        <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.14, animationDelay: "3.6s" }} cx="180" cy="180" r="150" fill="none" stroke="var(--steam)" strokeWidth="1" />
      </svg>

      <main className="relative mx-auto w-full max-w-md md:max-w-2xl lg:max-w-5xl px-4 py-8 md:py-12">
        {/* 그라데이션 헤더 밴드 */}
        <header className="text-center mb-7 animate-fade-up">
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-onsen-gradient shadow-cta text-3xl mb-3">
            🔥
            {/* 피어오르는 김 — 사우나의 열기를 은유 */}
            <svg aria-hidden viewBox="0 0 40 60" className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 w-7 h-11 overflow-visible">
              <path className="steam-wisp" d="M12 55 Q4 42 14 32 Q22 24 13 12" fill="none" stroke="var(--steam)" strokeWidth="2.5" strokeLinecap="round" />
              <path className="steam-wisp" style={{ animationDelay: "1.1s" }} d="M24 55 Q30 44 22 34 Q16 26 25 14" fill="none" stroke="var(--steam)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-bark">
            사우나 여행 코스 메이커
          </h1>
          <p className="text-sm md:text-base text-bark-soft mt-2">
            사우나·온천을 축으로 맛집·볼거리·숙소를 엮은 맞춤 여행
          </p>
          {/* 물결 구분선 — 다음 섹션과의 경계를 파문으로 표시 */}
          <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="w-24 h-3 mx-auto mt-5 opacity-70">
            <path d="M0 6 Q 12.5 0 25 6 T 50 6 T 75 6 T 100 6 T 125 6 T 150 6 T 175 6 T 200 6" fill="none" stroke="var(--onsen)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </header>

        {checked && (
          <ErrorBoundary>
            <PlannerForm initialInput={autoInput} autoSubmit={autoSubmit} />
          </ErrorBoundary>
        )}

        <ErrorBoundary>
          <TravelGuides />
        </ErrorBoundary>

        <footer className="text-center text-xs text-bark-soft/70 mt-10 space-y-1">
          <p>💡 지역·기간·취향을 입력하면 하루 코스가 완성돼요</p>
          <p>실시간 카카오 데이터 + AI 추천 · 사우나 여행 코스 메이커</p>
        </footer>
      </main>
    </div>
  );
}
