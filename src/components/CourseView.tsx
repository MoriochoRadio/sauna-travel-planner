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
      <div className="relative -mx-5 -mt-5 mb-5 overflow-hidden rounded-t-card bg-pine-gradient px-5 py-5 text-white md:-mx-6 md:-mt-6 md:px-6">
        {/* 헤더 안쪽에서 번지는 파문 */}
        <svg aria-hidden viewBox="0 0 240 240" className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 opacity-30">
          <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.6 }} cx="120" cy="120" r="46" fill="none" stroke="#E08A57" strokeWidth="1.5" />
          <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.4, animationDelay: "1.6s" }} cx="120" cy="120" r="82" fill="none" stroke="#7FA893" strokeWidth="1.25" />
          <circle className="ripple-ring" style={{ ["--ripple-opacity" as string]: 0.26, animationDelay: "3.2s" }} cx="120" cy="120" r="116" fill="none" stroke="#E08A57" strokeWidth="1" />
        </svg>
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-eyebrow text-ember">
              Your course
            </p>
            <h3 className="mt-1.5 font-serif text-xl font-bold tracking-[-0.03em] md:text-2xl">
              {regionLabel} · {course.days.length}일 코스
            </h3>
          </div>
          <button
            className="shrink-0 rounded-pill border border-white/25 bg-white/15 px-3.5 py-2 text-sm font-bold transition hover:bg-white/25 disabled:opacity-60"
            onClick={onRetry}
            disabled={loading}
          >
            ↻ 다시 만들기
          </button>
        </div>
      </div>

      {course.usedFallback && (
        <p className="mb-3 rounded-[12px] border border-clay/25 bg-clay-soft/60 px-3 py-2 text-xs font-semibold text-clay-deep">
          ⚠ AI 생성 실패로 기본 코스를 표시합니다.
        </p>
      )}

      <p className="mb-6 rounded-[14px] border border-line bg-cream/60 px-4 py-3 text-sm leading-[1.8] text-bark-soft">
        💡 {course.summary}
      </p>

      <div className="space-y-6">
        {course.days.map((d) => (
          <div key={d.day}>
            <h4 className="mb-3 flex items-center gap-2 font-bold text-bark">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-pine text-sm font-extrabold text-white">
                {d.day}
              </span>
              <span className="font-serif text-lg tracking-[-0.02em] text-pine">{d.theme}</span>
            </h4>

            <ol className="relative ml-3 space-y-4 border-l-2 border-dashed border-clay/30">
              {d.stops.map((s, i) => {
                const place = resolvePlace(s);
                return (
                  <li key={i} className="relative pl-5">
                    {/* 타임라인 노드 */}
                    <span className="absolute -left-[9px] top-3 h-4 w-4 rounded-pill bg-onsen-gradient ring-4 ring-paper" />
                    <div className="rounded-card border border-line/80 bg-paper p-3.5 transition-shadow hover:shadow-card-hover">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-clay">{s.time}</span>
                        <span className="text-lg mr-1">{place ? typeIcon(place.type) : "📍"}</span>
                        <a
                          href={place ? kakaoMapUrl(place) : `https://map.kakao.com/?q=${encodeURIComponent(s.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[24px] items-center font-semibold text-bark underline decoration-onsen/40 hover:decoration-onsen"
                        >
                          {s.title}
                        </a>
                      </div>
                      <div className="text-xs text-bark-soft mt-1 leading-relaxed">{s.reason}</div>

                      {place && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {typeof place.rating === "number" && (
                            <span
                              className="inline-flex items-center gap-0.5 rounded-pill bg-clay-soft px-2 py-0.5 text-xs font-bold text-clay-deep"
                              title="추천지수 (자체 산출)"
                            >
                              ★ {place.rating.toFixed(1)}
                            </span>
                          )}
                          {place.hasOnsen && (
                            <span className="rounded-pill bg-clay/12 px-2 py-0.5 text-xs font-semibold text-clay-deep">♨ 온천</span>
                          )}
                          {place.hasSauna && (
                            <span className="rounded-pill bg-sage/20 px-2 py-0.5 text-xs font-semibold text-pine">🧖 사우나</span>
                          )}
                          {place.type === "lodging" && (
                            <span className="rounded-pill bg-pine/12 px-2 py-0.5 text-xs font-semibold text-pine">🏨 숙소</span>
                          )}
                          {place.tel && <span className="text-xs text-bark-soft">☎ {place.tel}</span>}
                          {place.address && <span className="text-xs text-bark-soft">📍 {place.address}</span>}
                          <a
                            href={kakaoMapUrl(place)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[24px] items-center py-0.5 text-xs text-onsen font-medium underline decoration-onsen/40 hover:decoration-onsen"
                          >
                            카카오맵
                          </a>
                          <a
                            href={naverMapUrl(place)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[24px] items-center py-0.5 text-xs text-onsen font-medium underline decoration-onsen/40 hover:decoration-onsen"
                          >
                            네이버맵
                          </a>
                        </div>
                      )}

                      {s.tip && (
                        <div className="text-xs text-steam font-medium mt-1.5">💧 {s.tip}</div>
                      )}

                      {/* 공식 출처를 직접 확인한 장소는 검증 상태와 확인 날짜를 함께 보여준다.
                          운영 시간·요금은 자주 바뀌므로 여기서 단정하지 않고 출처로 넘긴다. */}
                      {place?.verification && (
                        <div className="mt-2 rounded-[12px] border border-line bg-cream/70 px-2.5 py-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={
                                place.verification.status === "official"
                                  ? "rounded-pill bg-sage/25 px-2 py-0.5 text-xs font-bold text-pine"
                                  : "rounded-pill bg-cream-2 px-2 py-0.5 text-xs font-bold text-bark-soft"
                              }
                            >
                              {place.verification.status === "official" ? "✓ 공식 확인" : "· 확인 중"}
                            </span>
                            <span className="text-xs text-bark-soft">{place.verification.verifiedAt} 기준</span>
                            <a
                              href={place.verification.officialUrl ?? place.verification.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[24px] items-center py-0.5 text-xs text-onsen font-medium underline decoration-onsen/40 hover:decoration-onsen"
                            >
                              {place.verification.sourceLabel}
                            </a>
                          </div>
                          {place.verification.operatingNote && (
                            <p className="mt-1 text-xs text-bark-soft leading-relaxed">
                              {place.verification.operatingNote}
                            </p>
                          )}
                        </div>
                      )}

                      {place?.usageTip && (
                        <div className="mt-1.5 text-xs text-bark-soft leading-relaxed">🧭 {place.usageTip}</div>
                      )}

                      {place?.neighborhood && place.neighborhood.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5">
                          {place.neighborhood.map((n) => (
                            <li key={n.title} className="text-xs text-bark-soft leading-relaxed">
                              {n.type === "food" ? "🍜" : "🏞"} <b className="text-bark">{n.title}</b> — {n.description}
                            </li>
                          ))}
                        </ul>
                      )}

                      {place?.science && (
                        <details className="mt-1.5">
                          <summary className="cursor-pointer text-xs font-medium text-onsen">
                            🔬 {place.science.title}
                          </summary>
                          <p className="mt-1 text-xs text-bark-soft leading-relaxed">
                            <span className="font-semibold">{place.science.studyType}</span> · {place.science.summary}{" "}
                            <a
                              href={place.science.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-onsen underline decoration-onsen/40 hover:decoration-onsen"
                            >
                              {place.science.sourceLabel}
                            </a>
                          </p>
                        </details>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-card border border-clay/20 bg-clay-soft/60 px-5 py-4">
        <span className="text-xs font-bold uppercase tracking-eyebrow text-clay">예상 비용</span>
        <span className="font-serif text-xl font-bold text-clay-deep">
          약 {course.estCostKrw.toLocaleString()}원
        </span>
      </div>
    </section>
  );
}
