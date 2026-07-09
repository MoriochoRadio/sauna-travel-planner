"use client";

import { useEffect, useRef } from "react";
import type { Place } from "@/data/schema";

type Coord = { lat: number; lng: number; name: string; id: string };

// 카카오맵 SDK 로드 (한 번만)
let sdkLoading: Promise<void> | null = null;
function loadKakao(key: string): Promise<void> {
  if (typeof window === "undefined" || (window as any).kakao?.maps) return Promise.resolve();
  if (sdkLoading) return sdkLoading;
  sdkLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    s.onload = () => (window as any).kakao.maps.load(() => resolve());
    s.onerror = () => reject(new Error("kakao map load fail"));
    document.head.appendChild(s);
  });
  return sdkLoading;
}

export function MapEmbed({ places, selectedId }: { places: Place[]; selectedId?: string }) {
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  const ref = useRef<HTMLDivElement>(null);

  const coords: Coord[] = places
    .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
    .map((p) => ({ lat: p.lat!, lng: p.lng!, name: p.name, id: p.id }));

  useEffect(() => {
    if (!key || !ref.current || coords.length === 0) return;
    let destroyed = false;
    loadKakao(key)
      .then(() => {
        if (destroyed || !ref.current) return;
        const kakao = (window as any).kakao;
        const center = new kakao.maps.LatLng(coords[0].lat, coords[0].lng);
        const map = new kakao.maps.Map(ref.current, {
          center,
          level: coords.length > 1 ? 8 : 4,
        });
        for (const c of coords) {
          const marker = new kakao.maps.Marker({
            map,
            position: new kakao.maps.LatLng(c.lat, c.lng),
          });
          const infow = new kakao.maps.InfoWindow({ content: `<div style="padding:4px 8px;font-size:12px">${c.name}</div>` });
          const sel = c.id === selectedId;
          if (sel) {
            map.setCenter(new kakao.maps.LatLng(c.lat, c.lng));
            infow.open(map, marker);
          }
          kakao.maps.event.addListener(marker, "click", () => infow.open(map, marker));
        }
      })
      .catch((e) => console.warn("[MapEmbed]", e.message));
    return () => { destroyed = true; };
  }, [key, coords, selectedId]);

  if (!key) {
    return (
      <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
        지도 임베드 미설정 — 장소 카드의 "지도/네이버" 링크로 위치를 확인하세요.
        (관리자: Vercel env <code>NEXT_PUBLIC_KAKAO_MAP_KEY</code> 등록 시 지도 활성화)
      </div>
    );
  }
  if (coords.length === 0) {
    return <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">표시할 좌표가 아직 없어요 (동기화 데이터에 좌표가 없음).</div>;
  }
  return <div ref={ref} className="w-full h-64 rounded-lg border border-gray-200" aria-label="사우나 지도" />;
}
