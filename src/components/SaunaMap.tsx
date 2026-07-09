import type { RegionData, Place } from "@/data/schema";
import { MapEmbed } from "./MapEmbed";

const TYPE_LABEL: Record<string, string> = {
  sauna: "사우나",
  jjimjilbang: "찜질방",
  spa: "온천·스파",
  lodging: "숙소(온천/사우나)",
};

const TYPE_COLOR: Record<string, string> = {
  sauna: "bg-sky-100 text-sky-700",
  jjimjilbang: "bg-violet-100 text-violet-700",
  spa: "bg-teal-100 text-teal-700",
  lodging: "bg-amber-100 text-amber-700",
};

// 카카오맵 좌표 기반 링크
function kakaoMapUrl(p: Place): string {
  if (typeof p.lat === "number" && typeof p.lng === "number") {
    return `https://map.kakao.com/?lat=${p.lat}&lng=${p.lng}&urlLevel=3`;
  }
  return `https://map.kakao.com/?q=${encodeURIComponent(p.name + " " + p.city)}`;
}
// 네이버맵 좌표 기반 링크
function naverMapUrl(p: Place): string {
  if (typeof p.lat === "number" && typeof p.lng === "number") {
    return `https://map.naver.com/v5/search/${p.lat},${p.lng}`;
  }
  return `https://map.naver.com/v5/search/${encodeURIComponent(p.name + " " + p.city)}`;
}

export function SaunaMap({
  region,
  selectedId,
  onSelect,
}: {
  region: RegionData;
  selectedId?: string;
  onSelect: (p: Place) => void;
}) {
  const core = region.places.filter((p) =>
    ["sauna", "jjimjilbang", "spa", "lodging"].includes(p.type)
  );

  if (core.length === 0) {
    return <p className="text-sm text-gray-500">이 지역에는 등록된 사우나/온천이 아직 없어요.</p>;
  }

  return (
    <div className="space-y-4">
      <MapEmbed places={core} selectedId={selectedId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {core.map((p) => {
          const isSel = p.id === selectedId;
          const facilities = [
            p.type === "lodging" && p.hasOnsen ? "온천 보유" : null,
            p.type === "lodging" && p.hasSauna ? "사우나 보유" : null,
          ].filter(Boolean) as string[];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              aria-pressed={isSel}
              className={`text-left card p-4 border-2 transition ${
                isSel ? "border-onsen ring-2 ring-onsen/40" : "border-transparent hover:border-onsen/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-snug">{p.name}</h3>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR[p.type] ?? "bg-gray-100"}`}>
                  {TYPE_LABEL[p.type] ?? p.type}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{p.city}{p.address ? ` · ${p.address}` : ""}</p>
              <p className="text-sm mt-2 text-gray-700 line-clamp-2">{p.summary}</p>

              {facilities.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {facilities.map((f) => (
                    <span key={f} className="text-[11px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">{f}</span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
                {p.tel && <span className="text-gray-500">☎ {p.tel}</span>}
                {p.homepage && (
                  <a href={p.homepage} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                     className="text-gray-500 underline">홈페이지</a>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-onsen font-medium">
                  {isSel ? "✓ 선택됨" : "이 사우나로 코스 짜기"}
                </span>
                <span className="flex gap-2 text-xs">
                  <a href={kakaoMapUrl(p)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                     className="text-gray-500 underline">카카오맵</a>
                  <a href={naverMapUrl(p)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                     className="text-gray-500 underline">네이버맵</a>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
