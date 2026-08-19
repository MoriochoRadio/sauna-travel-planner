"use client";

import { useEffect, useState } from "react";

/**
 * 히어로 위에서는 투명하게 떠 있다가, 스크롤이 시작되면 유리판으로 굳는 헤더.
 */
export function SiteHeader() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // 히어로 위에 겹쳐 떠 있어야 흰 글자가 딥그린 배경 위에 놓인다.
    // sticky로 두면 헤더가 자기 자리를 차지해 크림 바탕 위에 흰 글자가 얹히고
    // 대비가 무너진다.
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        solid ? "glass border-b border-line/70" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center justify-between gap-3 px-5 lg:px-8">
        <a
          href="#top"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="사우나 여행 코스 메이커 처음으로"
        >
          <span
            aria-hidden
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-pill text-base transition-colors duration-300 ${
              solid ? "bg-pine text-white" : "bg-white/15 text-white backdrop-blur"
            }`}
          >
            ♨
          </span>
          <span
            className={`truncate font-serif text-[15px] font-bold tracking-[-0.02em] transition-colors duration-300 sm:text-lg ${
              solid ? "text-pine" : "text-white"
            }`}
          >
            사우나 여행 코스 메이커
          </span>
        </a>

        <nav className="flex shrink-0 items-center gap-1 sm:gap-5">
          <a
            href="#guides"
            className={`hidden min-h-[40px] items-center px-2 text-sm font-bold transition-colors sm:inline-flex ${
              solid ? "text-bark-soft hover:text-clay" : "text-white/75 hover:text-white"
            }`}
          >
            여행 가이드
          </a>
          <a
            href="#plan"
            className={`inline-flex min-h-[40px] items-center whitespace-nowrap rounded-pill px-4 text-sm font-bold transition-all duration-300 ${
              solid
                ? "bg-pine text-white hover:bg-pine-soft"
                : "border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            }`}
          >
            코스 만들기
          </a>
        </nav>
      </div>
    </header>
  );
}
