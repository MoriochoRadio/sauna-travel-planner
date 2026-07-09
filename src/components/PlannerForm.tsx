"use client";

import { useState, useEffect } from "react";
import type { PlannerInput, Preference, Place } from "@/data/schema";
import { getRegion } from "@/data/seed";
import { CourseView } from "./CourseView";
import { CourseSkeleton } from "./CourseSkeleton";
import { SaunaMap } from "./SaunaMap";
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

type Step = 1 | 2 | 3;

export function PlannerForm({ initialInput, autoSubmit }: { initialInput?: PlannerInput | null; autoSubmit?: boolean }) {
  const [region, setRegion] = useState<PlannerInput["region"]>(initialInput?.region ?? "gangwon");
  const [onsenFocus, setOnsenFocus] = useState(initialInput?.onsenFocus ?? false);
  const [days, setDays] = useState(initialInput?.days ?? 2);
  const [prefs, setPrefs] = useState<Preference[]>(initialInput?.preferences ?? []);
  const [includeLodging, setIncludeLodging] = useState(initialInput?.includeLodging ?? true);
  const [note, setNote] = useState(initialInput?.note ?? "");
  const [anchorSaunaId, setAnchorSaunaId] = useState<string | undefined>(initialInput?.anchorSaunaId);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);

  const regionData = getRegion(region);
  const anchorSauna = regionData?.places.find((p) => p.id === anchorSaunaId);

  const togglePref = (p: Preference) =>
    setPrefs((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const body: PlannerInput = {
        region,
        days,
        preferences: prefs,
        note: note || undefined,
        anchorSaunaId,
        onsenFocus,
        includeLodging,
      };
      const res = await fetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  // 지역 바뀌면 선택 사우나 초기화
  const onRegionChange = (id: PlannerInput["region"]) => {
    setRegion(id);
    setAnchorSaunaId(undefined);
  };

  if (course) {
    return (
      <div className="space-y-4">
        <CourseView course={course} onRetry={submit} loading={loading} />
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => {
            setCourse(null);
            setStep(2);
          }}
        >
          ↺ 다른 사우나로 다시 짜기
        </button>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => {
            const url = `${window.location.origin}/?region=${region}&days=${days}${prefs.length ? `&prefs=${prefs.join(",")}` : ""}${anchorSaunaId ? `&sauna=${anchorSaunaId}` : ""}${onsenFocus ? "&onsen=1" : ""}${!includeLodging ? "&lodging=0" : ""}${note ? `&note=${encodeURIComponent(note)}` : ""}`;
            navigator.clipboard?.writeText(url);
            alert("공유 URL이 클립보드에 복사됐어요!\n" + url);
          }}
        >
          🔗 코스 공유 URL 복사
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <ol className="flex items-center gap-2 text-sm">
        {[1, 2, 3].map((s) => (
          <li key={s} className={`flex items-center gap-2 ${step === s ? "font-bold text-onsen" : "text-gray-400"}`}>
            <span className={`w-6 h-6 rounded-full grid place-items-center text-xs ${step === s ? "bg-onsen text-white" : "bg-gray-200"}`}>{s}</span>
            {s === 1 ? "지역" : s === 2 ? "사우나 고르기" : "부가 옵션"}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <section className="card p-5 space-y-4">
          <div>
            <h2 className="font-bold mb-3">지역</h2>
            <select
              className="w-full border rounded-lg p-3 min-h-[44px]"
              value={region}
              onChange={(e) => onRegionChange(e.target.value as PlannerInput["region"])}
              aria-label="지역 선택"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <h2 className="font-bold mb-3">여행 모드</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOnsenFocus(false)}
                className={`flex-1 min-h-[44px] rounded-lg border ${!onsenFocus ? "bg-onsen text-white border-onsen" : "border-gray-300"}`}
                aria-pressed={!onsenFocus}
              >
                일반 (사우나/온천 혼합)
              </button>
              <button
                type="button"
                onClick={() => setOnsenFocus(true)}
                className={`flex-1 min-h-[44px] rounded-lg border ${onsenFocus ? "bg-onsen text-white border-onsen" : "border-gray-300"}`}
                aria-pressed={onsenFocus}
              >
                ♨ 온천 중심
              </button>
            </div>
            {regionData?.onsenDistrict && (
              <p className="text-xs text-onsen mt-2">이 지역은 온천 지구예요 — 온천 중심 모드를 추천해요.</p>
            )}
          </div>
          <button className="btn-primary w-full" onClick={() => setStep(2)}>
            다음: 사우나 고르기 →
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">사우나·온천 지도 ({regionData?.name})</h2>
            {anchorSauna && (
              <span className="text-xs bg-onsen/10 text-onsen px-2 py-1 rounded-full">
                선택: {anchorSauna.name}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            가고 싶은 사우나·온천을 골라보세요. 골라두면 코스의 중심이 돼요. (건너뛰고 추천받을 수도 있어요)
          </p>
          <SaunaMap
            region={regionData!}
            selectedId={anchorSaunaId}
            onSelect={(p: Place) => setAnchorSaunaId(p.id)}
          />
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setStep(1)}>← 이전</button>
            <button className="btn-primary flex-1" onClick={() => setStep(3)}>
              {anchorSauna ? "선택한 사우나로 →" : "추천 받기 →"}
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="card p-5 space-y-5">
          {anchorSauna && (
            <div className="text-sm bg-onsen/10 text-onsen rounded-lg p-3">
              🎯 중심: <b>{anchorSauna.name}</b> — 이 사우나를 축으로 코스를 짜요.
            </div>
          )}
          <div>
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
          </div>
          <div>
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
          </div>
          <div>
            <h2 className="font-bold mb-3">숙소 추천</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeLodging}
                onChange={(e) => setIncludeLodging(e.target.checked)}
              />
              온천·사우나를 갖춘 숙소도 코스에 포함
            </label>
          </div>
          <div>
            <h2 className="font-bold mb-3">특이사항</h2>
            <textarea
              className="w-full border rounded-lg p-3 min-h-[64px]"
              placeholder="예: 겨울 방문, 차 없음, 아이 동반"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              aria-label="특이사항"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setStep(2)}>← 이전</button>
            <button className="btn-primary flex-1" onClick={submit} disabled={loading}>
              {loading ? "AI가 코스를 짜고 있어요…" : "코스 만들기"}
            </button>
          </div>
        </section>
      )}

      {error && <p className="text-red-600 text-sm">오류: {error}</p>}
      {loading && <CourseSkeleton />}
    </div>
  );
}
