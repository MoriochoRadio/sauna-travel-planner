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
    <section id="guides" className="mt-4 scroll-mt-20 py-12" aria-labelledby="guides-heading">
      <div className="relative overflow-hidden rounded-card shadow-card">
        {/* 이미 webp로 최적화된 단일 정적 이미지라 Next 이미지 최적화를 거칠 이유가 없다.
            Vercel 무료 플랜의 이미지 최적화 쿼터도 쓰지 않는다 (이 프로젝트의 무료 유지 원칙). */}
        <Image
          src="/onsen-guide-hero.webp"
          alt=""
          width={1200}
          height={420}
          className="h-48 w-full object-cover md:h-64"
          unoptimized
        />
        <div className="absolute inset-0 bg-[linear-gradient(96deg,rgba(15,32,24,0.94)_0%,rgba(22,41,31,0.76)_48%,rgba(20,38,29,0.28)_100%)]" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-9">
          <span className="flex items-center gap-2.5 text-[10px] font-extrabold tracking-eyebrow text-ember">
            <span aria-hidden className="h-px w-6 bg-current" />
            SLOW ONSEN GUIDE
          </span>
          <h2
            id="guides-heading"
            className="mt-2.5 font-serif text-[clamp(1.5rem,3.4vw,2.1rem)] font-bold leading-[1.2] tracking-[-0.035em] text-[#FFFCF6]"
          >
            좋은 온천 여행은 <br className="md:hidden" />
            빈틈없는 일정이 아닙니다
          </h2>
          <p className="mt-2.5 max-w-md text-xs leading-relaxed text-white/75 md:text-sm">
            회복할 여백이 있는 일정을 만드는 방법을 정리했습니다.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {travelGuides.map((guide) => {
          const open = openSlug === guide.slug;
          const places = guide.placeIds
            .map((id) => verifiedPlaces.find((place) => place.id === id))
            .filter((place): place is NonNullable<typeof place> => Boolean(place));

          return (
            <li
              key={guide.slug}
              className={`overflow-hidden rounded-card border bg-paper transition-shadow ${
                open ? "border-clay/35 shadow-card" : "border-line hover:shadow-card"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenSlug(open ? null : guide.slug)}
                aria-expanded={open}
                className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
              >
                <span>
                  <span className="text-[10px] font-extrabold tracking-eyebrow text-clay">{guide.eyebrow}</span>
                  <strong className="mt-1 block font-serif text-lg font-bold tracking-[-0.02em] text-pine">
                    {guide.title}
                  </strong>
                  <span className="mt-1 block text-xs text-bark-soft">
                    {guide.region} · {guide.readMinutes}분 읽기
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-pill text-base font-bold transition-all ${
                    open ? "rotate-180 bg-pine text-white" : "bg-clay-soft text-clay-deep"
                  }`}
                >
                  {open ? "−" : "+"}
                </span>
              </button>

              {open && (
                <div className="border-t border-line bg-cream/50 px-5 py-4">
                  <p className="text-xs leading-relaxed text-bark-soft">{guide.intro}</p>

                  <h3 className="mt-4 text-[10px] font-extrabold uppercase tracking-eyebrow text-clay">챙길 것</h3>
                  <ul className="mt-1 space-y-0.5">
                    {guide.essentials.map((item) => (
                      <li key={item} className="text-xs text-bark-soft">
                        · {item}
                      </li>
                    ))}
                  </ul>

                  {guide.sections.map((section) => (
                    <div key={section.title} className="mt-4">
                      <h3 className="font-serif text-sm font-bold text-pine">{section.title}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-bark-soft">{section.body}</p>
                    </div>
                  ))}

                  {places.length > 0 && (
                    <div className="mt-4 rounded-[14px] border border-clay/20 bg-clay-soft/50 px-3.5 py-3">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-eyebrow text-clay">
                        이 가이드가 참고한 장소
                      </h3>
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

      <p className="mt-5 text-center text-[11px] leading-relaxed text-bark-soft/70">
        운영 시간·요금·이용 조건은 변동될 수 있습니다. 방문 전 각 장소의 공식 출처를 확인하세요.
      </p>
    </section>
  );
}
