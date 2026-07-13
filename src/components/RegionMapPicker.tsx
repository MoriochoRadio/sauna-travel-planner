"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Region } from "@/data/schema";
import { getSigungus, getAllSigungus, findSigunguById, nearestSigunguInRegion, type Sigungu } from "@/data/sigungu";

// Leaflet 동적 로드 (한 번만)
let leafletLoading: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletLoading) return leafletLoading;
  leafletLoading = new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);
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

// 전국 모드는 마커가 230개+라 클러스터링 없이는 수도권 등에서 마커가 겹쳐 클릭이 불가능해진다.
let clusterLoading: Promise<void> | null = null;
function loadMarkerCluster(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as any;
  if (w.L?.markerClusterGroup) return Promise.resolve();
  if (clusterLoading) return clusterLoading;
  clusterLoading = new Promise((resolve, reject) => {
    for (const href of [
      "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css",
      "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css",
    ]) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("markercluster load fail"));
    document.head.appendChild(s);
  });
  return clusterLoading;
}

// region 종속 모드(세부지역) 또는 전국 모드(nationwide)
export function RegionMapPicker({
  mode = "region",
  region,
  selectedId,
  onSelect,
}: {
  mode?: "region" | "nationwide";
  region?: Region;
  selectedId?: string;
  onSelect: (s: Sigungu) => void;
}) {
  // useMemo로 참조를 안정시켜, region/mode가 그대로인데 부모가 리렌더될 때마다
  // 지도 전체가 파괴·재생성되는 것을 방지한다(예: 특이사항 입력 중 지도가 매번 다시 그려짐).
  const list = useMemo(
    () => (mode === "nationwide" ? getAllSigungus() : region ? getSigungus(region) : []),
    [mode, region]
  );
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const clusterRef = useRef<any>(null);
  const selected = selectedId ? findSigunguById(selectedId) : undefined;

  useEffect(() => {
    let destroyed = false;
    const el = ref.current;
    if (!el || list.length === 0) return;

    loadLeaflet()
      .then((L) => (mode === "nationwide" ? loadMarkerCluster().catch(() => {}).then(() => L) : L))
      .then((L) => {
        if (destroyed || !ref.current) return;
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        const center = selected ?? list[0];
        const map = L.map(el).setView([center.lat, center.lng], mode === "nationwide" ? 7 : 9);
        mapRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 18,
        }).addTo(map);

        // onsen 컬러 커스텀 핀 (Leaflet 기본 파란 마커 교체)
        const makePin = (selected: boolean) =>
          L.divIcon({
            className: "onsen-pin",
            html: `<span class="pin-dot ${selected ? "pin-dot--sel" : ""}"></span>`,
            iconSize: selected ? [26, 26] : [20, 20],
            iconAnchor: selected ? [13, 13] : [10, 10],
          });

        // 전국 모드(마커 230개+)는 클러스터 그룹에 담아 겹침을 방지, region 모드는 소수라 바로 지도에 추가
        const useCluster = mode === "nationwide" && typeof L.markerClusterGroup === "function";
        const cluster = useCluster ? L.markerClusterGroup({ maxClusterRadius: 60 }) : null;
        clusterRef.current = cluster;

        const drawMarkers = (selId?: string) => {
          for (const k in markersRef.current) map.removeLayer(markersRef.current[k]);
          markersRef.current = {};
          if (cluster) cluster.clearLayers();
          for (const s of list) {
            const isSel = s.id === selId;
            const marker = L.marker([s.lat, s.lng], {
              title: s.fullName,
              icon: makePin(isSel),
            });
            marker.bindTooltip(s.fullName, { direction: "top" });
            marker.on("click", () => onSelect(s));
            markersRef.current[s.id] = marker;
            if (cluster) cluster.addLayer(marker);
            else marker.addTo(map);
          }
          if (cluster && !map.hasLayer(cluster)) cluster.addTo(map);
        };
        drawMarkers(selectedId);

        // 지도 빈 곳 클릭 → 최근접 시군구 (전국 모드는 전체 중, region 모드는 해당 region 내)
        map.on("click", (e: any) => {
          const found = mode === "nationwide"
            ? nearestNationwide(e.latlng.lat, e.latlng.lng)
            : nearestSigunguInRegion(region!, e.latlng.lat, e.latlng.lng);
          if (found) onSelect(found);
        });

        if (selected) {
          map.panTo([selected.lat, selected.lng]);
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
    clusterRef.current = null;
    };
    }, [mode, region, list, selectedId, selected, onSelect]);

  if (list.length === 0) {
    return (
      <div className="text-xs text-bark-soft bg-cream-2 rounded-lg p-3">
        이 지역은 시군구 선택을 지원하지 않아요.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-bark-soft">
        {mode === "nationwide"
          ? "전국 지도를 자유롭게 움직여 아무 동네나 클릭하거나, 마커를 눌러 세부 지역을 선택하세요."
          : "지도에서 동네를 직접 클릭하거나 마커를 눌러 세부 지역을 선택하세요."}
      </p>
      <div
        ref={ref}
        className="w-full h-72 rounded-card border border-onsen/20 z-0"
        aria-label="세부 지역 선택 지도"
      />
    </div>
  );
}

// 전국 시군구 중 최근접 (haversine)
function nearestNationwide(lat: number, lng: number): Sigungu | null {
  const all = getAllSigungus();
  let best: Sigungu | null = null;
  let bestD = Infinity;
  for (const s of all) {
    const dLat = s.lat - lat;
    const dLng = s.lng - lng;
    const d = dLat * dLat + dLng * dLng;
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}
