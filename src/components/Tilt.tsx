"use client";

import { useRef, type ReactNode } from "react";

/**
 * 포인터를 따라 기우는 3D 카드 래퍼.
 *
 * 실제 회전은 CSS(.tilt-inner의 rotateX/rotateY)가 하고, 여기서는 커스텀 속성만
 * 갱신한다 — 리렌더 없이 프레임마다 값을 바꿀 수 있다.
 * 터치 기기와 모션 최소화 설정에서는 globals.css가 변환을 통째로 끄므로,
 * 여기서 기기 분기를 따로 하지 않는다.
 */
export function Tilt({
  children,
  className = "",
  innerClassName = "",
  max = 9,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** 최대 기울기(도) */
  max?: number;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const apply = (e: React.PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) return;
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const nx = (e.clientX - rect.left) / rect.width; // 0..1
    const ny = (e.clientY - rect.top) / rect.height;

    root.dataset.active = "true";
    inner.style.setProperty("--ry", `${(nx - 0.5) * 2 * max}deg`);
    inner.style.setProperty("--rx", `${(0.5 - ny) * 2 * max}deg`);
    inner.style.setProperty("--gx", `${nx * 100}%`);
    inner.style.setProperty("--gy", `${ny * 100}%`);
  };

  const reset = () => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) return;
    root.dataset.active = "false";
    inner.style.setProperty("--rx", "0deg");
    inner.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={rootRef}
      className={`tilt ${className}`}
      onPointerMove={apply}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <div ref={innerRef} className={`tilt-inner relative ${innerClassName}`}>
        {children}
        <span aria-hidden className="tilt-sheen" />
      </div>
    </div>
  );
}
