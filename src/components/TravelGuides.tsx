"use client";

import Image from "next/image";
import { useState } from "react";
import { travelGuides } from "@/data/guides";
import { verifiedPlaces } from "@/data/verified";

/**
 * 여행 가이드 — 코스 생성기와 별개로 "어떻게 쉬어야 하는지"를 문장으로 안내한다.
 * 코스는 매번 달라지지만 이 원칙은 바뀌지 않아서, 생성 결과 아래에 상시 노출한다.
 */
export function TravelGuides() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <section className="mt-12" aria-labelledby="guides-heading">
      <div className="relative overflow-hidden rounded-card">
        {/* 이미 webp로 최적화된 단일 정적 이미지라 Next 이미지 최적화를 거칠 이유가 없다.
            Vercel 무료 플랜의 이미지 최적화 쿼터도 쓰지 않는다 (이 프로젝트의 무료 유지 원칙). */}
        <Image
          src="/onsen-guide-hero.webp"
          alt=""
          width={1200}
          height={420}
          className="h-40 w-full object-cover md:h-52"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bark/75 via-bark/45 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-5 md:px-8">
          <span className="text-[10px] font-bold tracking-[0.18em] text-white/80">SLOW ONSEN GUIDE</span>
          <h2 id="guides-heading" className="mt-1 text-xl font-extrabold text-white md:text-2xl">
            좋은 온천 여행은 <br className="md:hidden" />
            빈틈없는 일정이 아닙니다
          </h2>
          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-white/85 md:text-sm">
            회복할 여백이 있는 일정을 만드는 방법을 정리했습니다.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {travelGuides.map((guide) => {
          const open = openSlug === guide.slug;
          const places = guide.placeIds
            .map((id) => verifiedPlaces.find((place) => place.id === id))
            .filter((place): place is NonNullable<typeof place> => Boolean(place));

          return (
            <li key={guide.slug} className="rounded-card border border-onsen/10 bg-white/80">
              <button
                type="button"
                onClick={() => setOpenSlug(open ? null : guide.slug)}
                aria-expanded={open}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
              >
                <span>
                  <span className="text-[10px] font-bold tracking-[0.14em] text-onsen">{guide.eyebrow}</span>
                  <strong className="mt-0.5 block text-sm font-bold text-bark">{guide.title}</strong>
                  <span className="mt-1 block text-xs text-bark-soft">
                    {guide.region} · {guide.readMinutes}분 읽기
                  </span>
                </span>
                <span aria-hidden className="mt-1 text-onsen">{open ? "−" : "+"}</span>
              </button>

              {open && (
                <div className="border-t border-onsen/10 px-4 py-3">
                  <p className="text-xs leading-relaxed text-bark-soft">{guide.intro}</p>

                  <h3 className="mt-3 text-xs font-bold text-bark">챙길 것</h3>
                  <ul className="mt-1 space-y-0.5">
                    {guide.essentials.map((item) => (
                      <li key={item} className="text-xs text-bark-soft">
                        · {item}
                      </li>
                    ))}
                  </ul>

                  {guide.sections.map((section) => (
                    <div key={section.title} className="mt-3">
                      <h3 className="text-xs font-bold text-bark">{section.title}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-bark-soft">{section.body}</p>
                    </div>
                  ))}

                  {places.length > 0 && (
                    <div className="mt-3 rounded-md bg-onsen-soft/50 px-3 py-2">
                      <h3 className="text-xs font-bold text-bark">이 가이드가 참고한 장소</h3>
                      <ul className="mt-1 space-y-1">
                        {places.map((place) => (
                          <li key={place.id} className="text-xs text-bark-soft">
                            <b className="text-bark">{place.name}</b> · {place.city}
                            {place.verification && (
                              <>
                                {" — "}
                                <a
                                  href={place.verification.officialUrl ?? place.verification.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex min-h-[24px] items-center py-0.5 text-onsen underline decoration-onsen/40 hover:decoration-onsen"
                                >
                                  {place.verification.sourceLabel}
                                </a>{" "}
                                ({place.verification.verifiedAt} 기준)
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-bark-soft/70">
        운영 시간·요금·이용 조건은 변동될 수 있습니다. 방문 전 각 장소의 공식 출처를 확인하세요.
      </p>
    </section>
  );
}
