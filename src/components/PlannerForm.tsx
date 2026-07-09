"use client";

import { useState, useEffect } from "react";
import type { PlannerInput, Preference } from "@/data/schema";
import { CourseView } from "./CourseView";
import { CourseSkeleton } from "./CourseSkeleton";
import type { Course } from "./types";

const REGIONS = [
  { id: "seoul", name: "서울" },
  { id: "busan", name: "부산" },
  { id: "gangwon", name: "강원" },
  { id: "gyeongju", name: "경주" },
  { id: "jeju", name: "제주" },
  { id: "incheon", name: "인천" },
  { id: "daejeon", name: "대전" },
  { id: "gwangju", name: "광주" },
  { id: "daegu", name: "대구" },
];

const PREFS: { id: Preference; label: string }[] = [
  { id: "quiet", label: "조용한" },
  { id: "budget", label: "가성비" },
  { id: "premium", label: "프리미엄" },
  { id: "family", label: "가족" },
  { id: "solo", label: "혼자" },
  { id: "outdoor_spa", label: "야외온천" },
  { id: "foodie", label: "음식중심" },
];

export function PlannerForm({ initialInput, autoSubmit }: { initialInput?: PlannerInput | null; autoSubmit?: boolean }) {
  const [region, setRegion] = useState<PlannerInput["region"]>(initialInput?.region ?? "gangwon");
  const [days, setDays] = useState(initialInput?.days ?? 2);
  const [prefs, setPrefs] = useState<Preference[]>(initialInput?.preferences ?? []);
  const [note, setNote] = useState(initialInput?.note ?? "");
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);

  const togglePref = (p: Preference) =>
    setPrefs((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, days, preferences: prefs, note: note || undefined } as PlannerInput),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "요청 실패");
        return;
      }
      setCourse(await res.json());
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  // 공유 URL로 진입 시 자동 생성
  useEffect(() => {
    if (autoSubmit && !course && !loading) {
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSubmit]);

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <h2 className="font-bold mb-3">지역</h2>
        <select
          className="w-full border rounded-lg p-3 min-h-[44px]"
          value={region}
          onChange={(e) => setRegion(e.target.value as PlannerInput["region"])}
          aria-label="지역 선택"
        >
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </section>

      <section className="card p-5">
        <h2 className="font-bold mb-3">기간</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`flex-1 min-h-[44px] rounded-lg border ${days === d ? "bg-onsen text-white border-onsen" : "border-gray-300"}`}
              aria-pressed={days === d}
            >
              {d}일
            </button>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold mb-3">취향 (복수 선택)</h2>
        <div className="flex flex-wrap gap-2">
          {PREFS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePref(p.id)}
              className={`px-3 py-2 rounded-full border text-sm ${prefs.includes(p.id) ? "bg-onsen text-white border-onsen" : "border-gray-300"}`}
              aria-pressed={prefs.includes(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold mb-3">특이사항</h2>
        <textarea
          className="w-full border rounded-lg p-3 min-h-[64px]"
          placeholder="예: 겨울 방문, 차 없음, 아이 동반"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          aria-label="특이사항"
        />
      </section>

      <button className="btn-primary w-full" onClick={submit} disabled={loading}>
        {loading ? "AI가 코스를 짜고 있어요…" : "코스 만들기"}
      </button>

      {course && (
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => {
            const url = `${window.location.origin}/?region=${region}&days=${days}${prefs.length ? `&prefs=${prefs.join(",")}` : ""}${note ? `&note=${encodeURIComponent(note)}` : ""}`;
            navigator.clipboard?.writeText(url);
            alert("공유 URL이 클립보드에 복사됐어요!\n" + url);
          }}
        >
          🔗 코스 공유 URL 복사
        </button>
      )}

      {error && <p className="text-red-600 text-sm">오류: {error}</p>}

      {loading && !course && <CourseSkeleton />}

      {course && <CourseView course={course} onRetry={submit} loading={loading} />}
    </div>
  );
}
