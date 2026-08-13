import { Waves } from "lucide-react";

export default function BrandSeal({ compact = false, tone = "light" }: { compact?: boolean; tone?: "light" | "dark" }) {
  const text = tone === "dark" ? "text-[#fdf9f3]" : "text-[#302720]";
  const subText = tone === "dark" ? "text-[#e9c29f]" : "text-[#a15d3c]";
  return <div className="inline-flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full border border-[#d9b596] bg-[#2d453a] text-[#f6d2af] shadow-[inset_0_0_0_3px_rgba(255,255,255,.08)]"><Waves className="h-4 w-4" /></span><span className="leading-none"><span className={`block font-serif text-xl font-semibold tracking-tight ${text}`}>온기행</span>{!compact && <span className={`mt-1 block text-[8px] font-bold tracking-[0.16em] ${subText}`}>SLOW WELLNESS GUIDE</span>}</span></div>;
}
