"use client";

import type { Course } from "./types";
import { getRegion } from "@/data/seed";
import { REGION_LABELS } from "@/data/schema";
import type { Place } from "@/data/schema";

function kakaoMapUrl(p: Place): string {
  if (typeof p.lat === "number" && typeof p.lng === "number") {
    return `https://map.kakao.com/?lat=${p.lat}&lng=${p.lng}&urlLevel=3`;
  }
  return `https://map.kakao.com/?q=${encodeURIComponent(p.name + " " + p.city)}`;
}
function naverMapUrl(p: Place): string {
  if (typeof p.lat === "number" && typeof p.lng === "number") {
    return `https://map.naver.com/v5/search/${p.lat},${p.lng}`;
  }
  return `https://map.naver.com/v5/search/${encodeURIComponent(p.name + " " + p.city)}`;
}

function typeIcon(t: Place["type"]): string {
  if (t === "lodging") return "🏨";
  if (t === "spa") return "♨";
  return "🧖";
}

export function CourseView({ course, onRetry, loading }: { course: Course; onRetry: () => void; loading: boolean }) {
  // 장소 상세 매핑: 응답에 실린 places(live+curated 병합) 우선, 부족하면 정적 region으로 보강
  const placeById = new Map<string, Place>();
  const placeByName = new Map<string, Place>();
  const addPlace = (p: Place) => {
    placeById.set(p.id, p);
    if (!placeByName.has(p.name)) placeByName.set(p.name, p);
  };
  (course.places ?? []).forEach(addPlace);
  const regionData = getRegion(course.region as any);
  regionData?.places.forEach(addPlace);

  const resolvePlace = (s: { placeId?: string; title: string }): Place | undefined =>
    (s.placeId ? placeById.get(s.placeId) : undefined) ?? placeByName.get(s.title);

  const regionLabel = REGION_LABELS[course.region as keyof typeof REGION_LABELS] ?? course.region;

  return (
    <section className="card glass p-5 md:p-6 mt-6 animate-fade-up">
      {/* 헤더 밴드 */}
      <div className="-mx-5 -mt-5 md:-mx-6 md:-mt-6 mb-5 px-5 md:px-6 py-4 rounded-t-card bg-onsen-gradient text-white">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg md:text-xl font-extrabold drop-shadow-sm">
            {regionLabel} · {course.days.length}일 코스
          </h2>
          <button
            className="text-sm font-semibold bg-white/25 hover:bg-white/35 rounded-full px-3 py-1.5 transition disabled:opacity-60"
            onClick={onRetry}
            disabled={loading}
          >
            ↻ 다시 만들기
          </button>
        </div>
      </div>

      {course.usedFallback && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
          ⚠ AI 생성 실패로 기본 코스를 표시합니다.
        </p>
      )}

      <p className="text-sm text-bark-soft mb-5 leading-relaxed">💡 {course.summary}</p>

      <div className="space-y-6">
        {course.days.map((d) => (
          <div key={d.day}>
            <h3 className="font-bold text-bark mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-onsen-soft text-onsen text-sm font-extrabold">
                {d.day}
              </span>
              <span className="text-base">{d.theme}</span>
            </h3>

            <ol className="relative border-l-2 border-onsen/25 ml-3 space-y-4">
              {d.stops.map((s, i) => {
                const place = resolvePlace(s);
                return (
                  <li key={i} className="relative pl-5">
                    {/* 타임라인 노드 */}
                    <span className="absolute -left-[9px] top-2.5 w-4 h-4 rounded-full bg-onsen-gradient border-2 border-white shadow-cta" />
                    <div className="rounded-card bg-white/80 border border-onsen/10 p-3 hover:shadow-card-hover transition-shadow">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-onsen">{s.time}</span>
                        <span className="text-lg mr-1">{place ? typeIcon(place.type) : "📍"}</span>
                        <a
                          href={place ? kakaoMapUrl(place) : `https://map.kakao.com/?q=${encodeURIComponent(s.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-bark underline decoration-onsen/40 hover:decoration-onsen"
                        >
                          {s.title}
                        </a>
                      </div>
                      <div className="text-xs text-bark-soft mt-1 leading-relaxed">{s.reason}</div>

                      {place && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {typeof place.rating === "number" && (
                            <span
                              className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700"
                              title="추천지수 (자체 산출)"
                            >
                              ★ {place.rating.toFixed(1)}
                            </span>
                          )}
                          {place.hasOnsen && (
                            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">♨ 온천</span>
                          )}
                          {place.hasSauna && (
                            <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">🧖 사우나</span>
                          )}
                          {place.type === "lodging" && (
                            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">🏨 숙소</span>
                          )}
                          {place.tel && <span className="text-xs text-bark-soft">☎ {place.tel}</span>}
                          {place.address && <span className="text-xs text-bark-soft">📍 {place.address}</span>}
                          <a
                            href={kakaoMapUrl(place)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-onsen font-medium underline decoration-onsen/40 hover:decoration-onsen"
                          >
                            카카오맵
                          </a>
                          <a
                            href={naverMapUrl(place)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-onsen font-medium underline decoration-onsen/40 hover:decoration-onsen"
                          >
                            네이버맵
                          </a>
                        </div>
                      )}

                      {s.tip && (
                        <div className="text-xs text-steam font-medium mt-1.5">💧 {s.tip}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-card bg-onsen-soft px-4 py-3">
        <span className="text-sm text-bark-soft">예상 비용</span>
        <span className="text-base font-extrabold text-onsen-deep">
          약 {course.estCostKrw.toLocaleString()}원
        </span>
      </div>
    </section>
  );
}
