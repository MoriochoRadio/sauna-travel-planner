import { useState } from "react";
import type { RegionData, Place } from "@/data/schema";
import { MapEmbed } from "./MapEmbed";

const TYPE_LABEL: Record<string, string> = {
  sauna: "사우나",
  jjimjilbang: "찜질방",
  spa: "온천·스파",
  lodging: "숙소",
};

// docs/design/ui-design.md 배지 컬러 규칙: 온천=rose, 사우나=sky, 숙소=violet, 추천지수=amber(다른 곳에서 사용 중)
const TYPE_COLOR: Record<string, string> = {
  sauna: "bg-sky-100 text-sky-700",
  jjimjilbang: "bg-sky-100 text-sky-700",
  spa: "bg-rose-100 text-rose-700",
  lodging: "bg-violet-100 text-violet-700",
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

function PlaceCard({
  p,
  selectedId,
  onSelect,
}: {
  p: Place;
  selectedId?: string;
  onSelect: (p: Place) => void;
}) {
  const isSel = p.id === selectedId;
  const facilities = [
    p.type === "lodging" && p.hasOnsen ? "온천 보유" : null,
    p.type === "lodging" && p.hasSauna ? "사우나 보유" : null,
  ].filter(Boolean) as string[];
  return (
    <button
      type="button"
      onClick={() => onSelect(p)}
      aria-pressed={isSel}
      className={`text-left card p-4 border-2 transition ${
        isSel ? "border-onsen ring-2 ring-onsen/40" : "border-transparent hover:border-onsen/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{p.name}</h3>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR[p.type] ?? "bg-cream-2 text-bark-soft"}`}>
          {TYPE_LABEL[p.type] ?? p.type}
        </span>
      </div>
      <p className="text-xs text-bark-soft mt-1">{p.city}{p.address ? ` · ${p.address}` : ""}</p>
      <p className="text-sm mt-2 text-bark line-clamp-2">{p.summary}</p>

      {facilities.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {facilities.map((f) => (
            <span key={f} className="text-[11px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">{f}</span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
        {p.tel && <span className="text-bark-soft">☎ {p.tel}</span>}
        {p.homepage && (
          <a href={p.homepage} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
             className="text-bark-soft underline">홈페이지</a>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-onsen font-medium">
          {isSel ? "✓ 선택됨" : "이 곳으로 코스 짜기"}
        </span>
        <span className="flex gap-2 text-xs">
          <a href={kakaoMapUrl(p)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
             className="text-bark-soft underline">카카오맵</a>
          <a href={naverMapUrl(p)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
             className="text-bark-soft underline">네이버맵</a>
        </span>
      </div>
    </button>
  );
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
  const [tab, setTab] = useState<"bath" | "stay">("bath");

  const bathPlaces = region.places.filter((p) => ["sauna", "jjimjilbang", "spa"].includes(p.type));
  // 숙소 탭: 온천/사우나 보유 숙소를 상단에, 전체 숙소를 하단에
  const stayPlaces = region.places.filter((p) => p.type === "lodging");
  const stayWithOnsen = stayPlaces.filter((p) => p.hasOnsen || p.hasSauna);

  const list = tab === "bath" ? bathPlaces : stayPlaces;

  const TabBtn = ({ id, label, count }: { id: "bath" | "stay"; label: string; count: number }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
        tab === id ? "bg-onsen text-white" : "bg-cream-2 text-bark-soft hover:bg-onsen-soft"
      }`}
    >
      {label} <span className="text-xs opacity-80">{count}</span>
    </button>
  );

  if (bathPlaces.length === 0 && stayPlaces.length === 0) {
    return <p className="text-sm text-bark-soft">이 지역에는 등록된 사우나/온천이 아직 없어요.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <TabBtn id="bath" label="🛁 사우나·온천" count={bathPlaces.length} />
        <TabBtn id="stay" label="🏨 온천·사우나 숙소" count={stayPlaces.length} />
      </div>

      {tab === "stay" && stayWithOnsen.length > 0 && (
        <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded">
          💡 온천/사우나를 갖춘 숙소 {stayWithOnsen.length}곳 — 사우나 여행에 특화된 숙박입니다.
        </p>
      )}

      <MapEmbed places={list} selectedId={selectedId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map((p) => (
          <PlaceCard key={p.id} p={p} selectedId={selectedId} onSelect={onSelect} />
        ))}
      </div>

      {list.length === 0 && (
        <p className="text-sm text-bark-soft">
          {tab === "stay" ? "이 지역에는 아직 등록된 숙소가 없어요." : "이 지역에는 사우나/온천이 아직 없어요."}
        </p>
      )}
    </div>
  );
}
