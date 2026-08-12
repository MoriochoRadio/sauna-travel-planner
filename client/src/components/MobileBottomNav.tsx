import { Compass, Map, Sparkles, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";

const items = [
  { href: "/#explore", label: "탐색", icon: Compass, match: "/" },
  { href: "/#ai-course", label: "AI 코스", icon: Sparkles, match: "/" },
  { href: "/#map", label: "지도", icon: Map, match: "/" },
  { href: "/me", label: "나의 여행", icon: UserRound, match: "/me" },
];

export default function MobileBottomNav() {
  const [location] = useLocation();
  return <nav aria-label="모바일 주요 메뉴" className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-2xl border border-[#e5d8ca] bg-[#fffaf3]/95 p-1.5 shadow-[0_16px_36px_-16px_rgba(40,29,19,.45)] backdrop-blur-xl md:hidden">
    {items.map(item => {
      const Icon = item.icon;
      const active = item.match === "/" ? location === "/" : location.startsWith(item.match);
      return <Link key={item.label} href={item.href} className={`grid place-items-center gap-1 rounded-xl py-2 text-[10px] font-bold transition ${active ? "bg-[#2d453a] text-white" : "text-[#766558]"}`}><Icon className="h-4 w-4" />{item.label}</Link>;
    })}
  </nav>;
}
