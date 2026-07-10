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
      // 초기값은 항상 폼에 전달, &auto=0이면 자동 제출만 생략(라운드트립 검증용)
      if (decoded) {
        setAutoInput(decoded);
        setAutoSubmit(params.get("auto") !== "0");
      }
    }
    setChecked(true);
  }, []);

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">🔥 사우나 여행 코스 메이커</h1>
        <p className="text-sm text-bark/70 mt-1">사우나를 축으로 맛집·볼거리를 엮은 맞춤 여행</p>
      </header>
      {checked && (
        <ErrorBoundary>
          <PlannerForm initialInput={autoInput} autoSubmit={autoSubmit} />
        </ErrorBoundary>
      )}
      <footer className="text-center text-xs text-bark/50 mt-8">
        tourAPI 실데이터 + 큐레이션 기반 · 사우나 여행 코스 메이커
      </footer>
    </main>
  );
}
