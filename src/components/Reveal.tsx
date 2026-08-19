"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 스크롤로 들어올 때 한 번 나타나는 래퍼.
 *
 * 초기 상태를 서버 마크업이 아니라 마운트 직후 JS로 숨기는 이유는, JS가 꺼져
 * 있거나 실패해도 본문이 보이게 하기 위해서다. IntersectionObserver가 없으면
 * 그냥 바로 보여준다.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** 등장 지연(ms) — 같은 줄의 카드들을 순차로 띄울 때 쓴다 */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.dataset.reveal = "shown";
      return;
    }

    // 이미 화면 안이면 숨겼다 띄우는 깜빡임이 생기므로 그대로 보여준다
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.dataset.reveal = "shown";
      return;
    }

    el.dataset.reveal = "pending";

    let delivered = false;
    const io = new IntersectionObserver(
      (entries) => {
        delivered = true;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.reveal = "shown";
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);

    // 관찰자가 첫 콜백조차 주지 못하는 환경(렌더링이 멈춘 탭 등)에서는 본문이
    // 영영 숨겨진 채로 남는다. 초기 콜백이 오지 않으면 그냥 보여준다.
    const failsafe = window.setTimeout(() => {
      if (!delivered) {
        el.dataset.reveal = "shown";
        io.disconnect();
      }
    }, 2500);

    return () => {
      window.clearTimeout(failsafe);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </div>
  );
}
