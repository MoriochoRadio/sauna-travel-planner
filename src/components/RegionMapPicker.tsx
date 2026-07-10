"use client";

import { useEffect, useRef } from "react";
import type { Region } from "@/data/schema";
import { getSigungus, nearestSigungu, type Sigungu } from "@/data/sigungu";

// Leaflet 동적 로드 (한 번만)
let leafletLoading: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletLoading) return leafletLoading;
  leafletLoading = new Promise((resolve, reject) => {
    // CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);
    // JS
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    s.crossOrigin = "";
    s.onload = () => resolve(w.L);
    s.onerror = () => reject(new Error("leaflet load fail"));
    document.head.appendChild(s);
  });
  return leafletLoading;
}

export function RegionMapPicker({
  region,
  selectedId,
  onSelect,
}: {
  region: Region;
  selectedId?: string;
  onSelect: (s: Sigungu) => void;
}) {
  const list = getSigungus(region);
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    let destroyed = false;
    const el = ref.current;
    if (!el || list.length === 0) return;

    loadLeaflet()
      .then((L) => {
        if (destroyed || !ref.current) return;
        // 지도 초기화
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        const center = list[0];
        const map = L.map(el).setView([center.lat, center.lng], 9);
        mapRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 18,
        }).addTo(map);

        markersRef.current = {};
        const drawMarkers = (selId?: string) => {
          for (const k in markersRef.current) {
            map.removeLayer(markersRef.current[k]);
          }
          markersRef.current = {};
          for (const s of list) {
            const isSel = s.id === selId;
            const marker = L.marker([s.lat, s.lng], {
              title: s.fullName,
              ...(isSel ? { icon: L.icon({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconSize: [30, 48], iconAnchor: [15, 48],
              }) } : {}),
            }).addTo(map);
            marker.bindTooltip(s.fullName, { direction: "top" });
            marker.on("click", () => onSelect(s));
            markersRef.current[s.id] = marker;
          }
        };
        drawMarkers(selectedId);

        // 지도 빈 곳 클릭 → 최근접 시군구
        map.on("click", (e: any) => {
          const found = nearestSigungu(region, e.latlng.lat, e.latlng.lng);
          if (found) onSelect(found);
        });

        // 선택 변경 시 마커 갱신 + 팬
        const sel = list.find((s) => s.id === selectedId);
        if (sel) {
          map.panTo([sel.lat, sel.lng]);
          drawMarkers(selectedId);
        }
      })
      .catch((e) => console.warn("[RegionMapPicker]", e.message));

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [region, list, selectedId, onSelect]);

  if (list.length === 0) {
    return (
      <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
        이 지역은 시군구 선택을 지원하지 않아요.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">
        지도에서 동네를 직접 클릭하거나 마커를 눌러 세부 지역을 선택하세요.
      </p>
      <div
        ref={ref}
        className="w-full h-64 rounded-lg border border-gray-200 z-0"
        aria-label="세부 지역 선택 지도"
      />
    </div>
  );
}
