"use client";

import type { Course } from "./types";

export function CourseView({ course, onRetry, loading }: { course: Course; onRetry: () => void; loading: boolean }) {
  return (
    <section className="card p-5 mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">{course.region} · {course.days.length}일 코스</h2>
        <button className="text-sm text-onsen underline" onClick={onRetry} disabled={loading}>
          다시 만들기
        </button>
      </div>

      {course.usedFallback && (
        <p className="text-xs text-amber-600 mb-2">⚠ AI 생성 실패로 기본 코스를 표시합니다.</p>
      )}

      <p className="text-sm text-bark/80 mb-4">💡 {course.summary}</p>

      <div className="space-y-5">
        {course.days.map((d) => (
          <div key={d.day}>
            <h3 className="font-semibold mb-2">Day {d.day} · {d.theme}</h3>
            <ol className="border-l-2 border-onsen/30 pl-4 space-y-3">
              {d.stops.map((s, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-onsen" />
                  <div className="text-sm">
                    <span className="font-mono text-onsen">{s.time}</span>{" "}
                    <a
                      href={`https://map.kakao.com/?q=${encodeURIComponent(s.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline decoration-onsen/40 hover:decoration-onsen"
                    >
                      {s.title}
                    </a>
                  </div>
                  <div className="text-xs text-bark/70">{s.reason}</div>
                  {s.tip && <div className="text-xs text-amber-700">💧 {s.tip}</div>}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm font-semibold">예상 비용: 약 {course.estCostKrw.toLocaleString()}원</p>
    </section>
  );
}
