"use client";

import { useEffect, useState } from "react";
import { PlannerForm } from "@/components/PlannerForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
    <div className="min-h-screen bg-page-bg">
      {/* 데스크탑 배경 장식 (모바일선 숨김) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden -z-10 hidden md:block"
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-onsen/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-steam/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-onsen-soft/40 blur-3xl" />
      </div>

      <main className="relative mx-auto w-full max-w-md md:max-w-2xl px-4 py-8 md:py-12">
        {/* 그라데이션 헤더 밴드 */}
        <header className="text-center mb-7 animate-fade-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-onsen-gradient shadow-cta text-3xl mb-3">
            🔥
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-bark">
            사우나 여행 코스 메이커
          </h1>
          <p className="text-sm md:text-base text-bark-soft mt-2">
            사우나·온천을 축으로 맛집·볼거리·숙소를 엮은 맞춤 여행
          </p>
        </header>

        {checked && (
          <ErrorBoundary>
            <PlannerForm initialInput={autoInput} autoSubmit={autoSubmit} />
          </ErrorBoundary>
        )}

        <footer className="text-center text-xs text-bark-soft/70 mt-10 space-y-1">
          <p>💡 지역·기간·취향을 입력하면 하루 코스가 완성돼요</p>
          <p>실시간 카카오 데이터 + AI 추천 · 사우나 여행 코스 메이커</p>
        </footer>
      </main>
    </div>
  );
}
