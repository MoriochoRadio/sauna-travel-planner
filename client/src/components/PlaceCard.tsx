import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import type { TravelPlace } from "@shared/travelCatalog";
import { ArrowUpRight, Bookmark, Heart, Sparkles } from "lucide-react";
import { Link } from "wouter";

const categoryLabel = { sauna: "사우나", jjimjilbang: "찜질방", "hot-spring": "온천" } as const;
const priceLabel = { light: "가벼운 예산", balanced: "균형 예산", signature: "프리미엄" } as const;

type PlaceCardProps = {
  place: TravelPlace;
  saved: boolean;
  canSave: boolean;
};

export default function PlaceCard({ place, saved, canSave }: PlaceCardProps) {
  const utils = trpc.useUtils();
  const favorite = trpc.travel.favorites.toggle.useMutation({
    onSuccess: () => utils.travel.favorites.list.invalidate(),
  });

  const onSave = () => {
    if (!canSave) return startLogin();
    favorite.mutate({ placeId: place.id });
  };

  return (
    <article className="group relative overflow-hidden rounded-[1.65rem] border border-[#e9dfd3] bg-[#fffcf7] p-5 shadow-[0_12px_32px_-25px_rgba(58,38,20,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(58,38,20,0.35)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f3e7da] px-2.5 py-1 text-[11px] font-bold tracking-wide text-[#92512d]">{categoryLabel[place.category]}</span>
            <span className="rounded-full bg-[#f6f1e9] px-2.5 py-1 text-[11px] font-medium text-[#6f6254]">{place.region} · {place.city}</span>
          </div>
          <h3 className="font-serif text-xl font-semibold tracking-tight text-[#2f2620]">{place.name}</h3>
        </div>
        <button aria-label={`${place.name} 저장`} onClick={onSave} disabled={favorite.isPending} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${saved ? "border-[#ba6038] bg-[#ba6038] text-white" : "border-[#e6dbce] bg-white text-[#765e4b] hover:border-[#ba6038] hover:text-[#ba6038]"}`}>
          <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>
      <p className="min-h-[3rem] text-sm leading-6 text-[#675b51]">{place.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {place.mood.slice(0, 2).map(tag => <span key={tag} className="rounded-full bg-[#edf1eb] px-2.5 py-1 text-xs text-[#425c4d]">{tag}</span>)}
        {place.facilities.slice(0, 2).map(tag => <span key={tag} className="rounded-full bg-[#f5f1eb] px-2.5 py-1 text-xs text-[#6c6156]">{tag}</span>)}
      </div>
      <div className="mt-6 flex items-end justify-between border-t border-[#eee5db] pt-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-[#947d67]">{priceLabel[place.priceBand]}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-[#86644f]"><Sparkles className="h-3.5 w-3.5" /> {place.highlight}</p>
        </div>
        <Link href={`/places/${place.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#9d4f2f] underline-offset-4 hover:underline">자세히 <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
      <Button className="sr-only"><Bookmark /></Button>
    </article>
  );
}
