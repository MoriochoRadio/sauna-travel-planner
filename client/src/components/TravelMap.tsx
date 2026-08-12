import { MapView } from "@/components/Map";
import type { TravelPlace } from "@shared/travelCatalog";
import { MapPinned } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type TravelMapProps = {
  places: TravelPlace[];
  className?: string;
};

export default function TravelMap({ places, className }: TravelMapProps) {
  const markers = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [mapUnavailable, setMapUnavailable] = useState(false);

  const onMapReady = useCallback((map: google.maps.Map) => {
    markers.current.forEach(marker => (marker.map = null));
    markers.current = [];
    const bounds = new google.maps.LatLngBounds();
    places.forEach((place, index) => {
      const pin = document.createElement("div");
      pin.className = "travel-map-pin";
      pin.innerHTML = `<span>${index + 1}</span>`;
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: place.coordinates,
        title: place.name,
        content: pin,
      });
      markers.current.push(marker);
      bounds.extend(place.coordinates);
    });
    if (places.length > 1) {
      new google.maps.Polyline({
        path: places.map(place => place.coordinates),
        strokeColor: "#B8653A",
        strokeOpacity: 0.78,
        strokeWeight: 3,
        map,
      });
      map.fitBounds(bounds, 56);
    }
  }, [places]);

  const center = places[0]?.coordinates ?? { lat: 36.5, lng: 127.8 };
  if (mapUnavailable) return <MapFallback places={places} className={className} />;
  return <MapView initialCenter={center} initialZoom={places.length > 1 ? 7 : 12} onMapReady={onMapReady} onMapError={() => setMapUnavailable(true)} className={className ?? "h-[340px]"} />;
}

function MapFallback({ places, className }: TravelMapProps) {
  return <div className={`${className ?? "h-[340px]"} relative overflow-hidden bg-[radial-gradient(circle_at_22%_20%,#e8ddc7_0%,transparent_24%),radial-gradient(circle_at_80%_72%,#d4e0d4_0%,transparent_27%),linear-gradient(135deg,#eee6d8_0%,#f8f4ed_42%,#dfe8e0_100%)]`}>
    <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(#b7ab9b_1px,transparent_1px),linear-gradient(90deg,#b7ab9b_1px,transparent_1px)] [background-size:44px_44px]" />
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><path d="M10 78 C 30 50, 38 85, 54 52 S 74 18, 91 34" fill="none" stroke="#b8653a" strokeDasharray="2 2" strokeLinecap="round" strokeWidth="1.15" /></svg>
    {places.slice(0, 5).map((place, index) => { const positions = [[10, 76], [30, 55], [53, 53], [72, 27], [90, 33]]; const [left, top] = positions[index] ?? positions[0]; return <div key={place.id} style={{ left: `${left}%`, top: `${top}%` }} className="absolute -translate-x-1/2 -translate-y-1/2"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#fff8ef] bg-[#b8653a] text-xs font-bold text-white shadow-lg">{index + 1}</span><span className="absolute left-1/2 top-10 w-28 -translate-x-1/2 rounded-full bg-white/90 px-2 py-1 text-center text-[10px] font-semibold text-[#56483d] shadow-sm">{place.name}</span></div>; })}
    <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-[11px] font-semibold text-[#655448] shadow-sm"><MapPinned className="h-3.5 w-3.5 text-[#b8653a]" /> 장소와 동선을 시각화한 여행 지도</div>
  </div>;
}
