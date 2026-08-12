import PlaceCard from "@/components/PlaceCard";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowDown, ArrowLeft, ArrowUp, Bookmark, CalendarDays, Compass, History, MapPinned, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type PlanStop = { id: number; placeId: string; position: number; note: string | null };
type PlanView = { id: number; title: string; region: string; updatedAt: Date; stops: PlanStop[] };
type CatalogPlace = { id: string; name: string; region: string };

export default function MyPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const { data: catalog = [] } = trpc.travel.catalog.list.useQuery();
  const favoritesQuery = trpc.travel.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const plansQuery = trpc.travel.planner.list.useQuery(undefined, { enabled: isAuthenticated });
  const visitsQuery = trpc.travel.profile.visits.useQuery(undefined, { enabled: isAuthenticated });
  const recommendationsQuery = trpc.travel.profile.recommendations.useQuery(undefined, { enabled: isAuthenticated });
  const refreshPlans = () => utils.travel.planner.list.invalidate();
  const addStop = trpc.travel.planner.addStop.useMutation({ onSuccess: () => { refreshPlans(); toast.success("플랜에 장소를 더했어요."); } });
  const removeStop = trpc.travel.planner.removeStop.useMutation({ onSuccess: () => { refreshPlans(); toast.success("플랜에서 장소를 뺐어요."); } });
  const moveStop = trpc.travel.planner.moveStop.useMutation({ onSuccess: refreshPlans });
  const updateStop = trpc.travel.planner.updateStop.useMutation({ onSuccess: () => { refreshPlans(); toast.success("메모를 저장했어요."); } });
  const favoriteIds = favoritesQuery.data ?? [];
  const plans = plansQuery.data ?? [];
  const visits = visitsQuery.data ?? [];
  const recommendations = recommendationsQuery.data ?? [];
  const savedPlaces = catalog.filter(place => favoriteIds.includes(place.id));
  const hasQueryError = favoritesQuery.isError || plansQuery.isError || visitsQuery.isError || recommendationsQuery.isError;

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f7f3ed] text-sm text-[#706156]">나의 여행을 준비하는 중입니다.</div>;
  if (!isAuthenticated) return <SignedOutState />;

  return <div className="min-h-screen bg-[#f7f3ed] pb-20 text-[#322820] md:pb-0">
    <header className="border-b border-[#e9dfd4] bg-[#f7f3ed]/90 backdrop-blur"><div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 lg:px-8"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#63564c]"><ArrowLeft className="h-4 w-4" /> 탐색으로</Link><Link href="/" className="font-serif text-xl font-semibold">온기행</Link><span className="text-xs font-bold text-[#7c6c5f]">{user?.name ?? "나의"} 여행</span></div></header>
    <main className="mx-auto max-w-7xl px-5 py-9 lg:px-8 lg:py-12">
      <p className="text-xs font-bold tracking-[0.17em] text-[#aa6442]">MY TRAVEL NOTE</p><h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">쉬었던 순간을 모아 봐요.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#706155]">가고 싶은 온기와 이미 지나온 하루를 차분히 기록하는 개인 여행장입니다.</p>
      {hasQueryError && <div role="alert" className="mt-5 rounded-2xl border border-[#e8c1b0] bg-[#fff2ea] px-4 py-3 text-sm text-[#954729]">일부 여행 기록을 불러오지 못했어요. 새로고침하거나 잠시 후 다시 시도해 주세요.</div>}
      <div className="mt-8 grid gap-4 sm:grid-cols-3"><Stat icon={<Bookmark />} label="저장한 장소" value={savedPlaces.length} /><Stat icon={<CalendarDays />} label="내 여행 플랜" value={plans.length} /><Stat icon={<History />} label="방문 기록" value={visits.length} /></div>
      <section className="mt-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold tracking-widest text-[#a55d3b]">SAVED PLACES</p><h2 className="mt-1 font-serif text-2xl font-semibold">다음에 가고 싶은 온기</h2></div><Link href="/#explore" className="text-sm font-bold text-[#a55231]">더 찾아보기</Link></div>{savedPlaces.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{savedPlaces.map(place => <PlaceCard key={place.id} place={place} saved canSave />)}</div> : <Empty icon={<Compass />} text="아직 저장한 장소가 없어요." detail="탐색에서 마음에 드는 장소를 하트로 담아 보세요." />}</section>
      <section className="mt-10 grid gap-5 lg:grid-cols-2"><div className="rounded-[1.6rem] border border-[#e4dad0] bg-white p-6"><div className="flex items-center gap-2 text-[#a55d3b]"><MapPinned className="h-4 w-4" /><p className="text-xs font-bold tracking-widest">TRIP PLANS</p></div><h2 className="mt-2 font-serif text-2xl font-semibold">나의 여행 플랜</h2>{plans.length ? <div className="mt-5 space-y-4">{plans.map(plan => <PlanEditor key={plan.id} plan={plan} catalog={catalog} onAdd={placeId => addStop.mutate({ planId: plan.id, placeId })} onMove={(stopId, direction) => moveStop.mutate({ planId: plan.id, stopId, direction })} onRemove={stopId => removeStop.mutate({ planId: plan.id, stopId })} onNote={(stopId, note) => updateStop.mutate({ planId: plan.id, stopId, note })} />)}</div> : <Empty icon={<CalendarDays />} text="아직 만든 플랜이 없어요." detail="장소 상세 페이지에서 ‘플랜에 담기’를 눌러 시작하세요." compact />}</div>
        <div className="rounded-[1.6rem] bg-[#e9efe9] p-6"><div className="flex items-center gap-2 text-[#496552]"><SparkleIcon /><p className="text-xs font-bold tracking-widest">AI HISTORY</p></div><h2 className="mt-2 font-serif text-2xl font-semibold">추천 받은 여행의 결</h2>{recommendations.length ? <div className="mt-5 space-y-3">{recommendations.map(item => <div key={item.id} className="rounded-xl bg-white/70 p-4"><p className="text-sm font-bold">{item.region} 여행 제안</p><p className="mt-1 text-xs text-[#647369]">{item.source === "ai" ? "AI 큐레이터" : "큐레이션"} · {new Date(item.createdAt).toLocaleDateString("ko-KR")}</p></div>)}</div> : <Empty icon={<History />} text="아직 추천 이력이 없어요." detail="AI 코스 만들기에서 오늘의 여행을 시작해 보세요." compact />}</div></section>
      <section className="mt-5 rounded-[1.6rem] border border-[#e4dad0] bg-white p-6"><div className="flex items-center gap-2 text-[#a55d3b]"><History className="h-4 w-4" /><p className="text-xs font-bold tracking-widest">VISITED MOMENTS</p></div><h2 className="mt-2 font-serif text-2xl font-semibold">다녀온 온기</h2>{visits.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visits.map(visit => { const place = catalog.find(item => item.id === visit.placeId); return <div key={visit.id} className="rounded-xl bg-[#faf6f0] p-4"><p className="font-serif text-lg font-semibold">{place?.name ?? "기록한 장소"}</p><p className="mt-1 text-xs text-[#786a5d]">{new Date(visit.visitedAt).toLocaleDateString("ko-KR")}</p>{visit.note && <p className="mt-3 text-sm leading-5 text-[#675b51]">{visit.note}</p>}</div>; })}</div> : <Empty icon={<History />} text="아직 남긴 방문 기록이 없어요." detail="장소 상세 페이지에서 ‘다녀왔어요’를 눌러 하루를 기록해 보세요." compact />}</section>
    </main>
  </div>;
}

function SignedOutState() { return <div className="grid min-h-screen place-items-center bg-[#f7f3ed] px-5"><div className="max-w-md text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e9efe9] text-[#45604e]"><Bookmark className="h-6 w-6" /></div><h1 className="mt-5 font-serif text-3xl font-semibold">나의 여행을 남겨 보세요.</h1><p className="mt-3 text-sm leading-6 text-[#6e6258]">저장한 장소와 다녀온 기록, AI가 제안한 여행 코스를 한곳에서 관리할 수 있습니다.</p><Button onClick={startLogin} className="mt-6 h-12 rounded-full bg-[#2d453a] px-5 text-sm font-bold text-white hover:bg-[#22372e]">로그인하고 시작하기</Button><Link href="/" className="mt-5 flex items-center justify-center gap-1 text-sm font-bold text-[#a55231]"><ArrowLeft className="h-4 w-4" /> 탐색으로 돌아가기</Link></div></div>; }

function PlanEditor({ plan, catalog, onAdd, onMove, onRemove, onNote }: { plan: PlanView; catalog: CatalogPlace[]; onAdd: (placeId: string) => void; onMove: (stopId: number, direction: "up" | "down") => void; onRemove: (stopId: number) => void; onNote: (stopId: number, note: string) => void }) {
  const choices = catalog.filter(place => place.region === plan.region);
  return <div className="rounded-2xl bg-[#faf6f0] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-serif text-lg font-semibold">{plan.title}</p><p className="mt-1 text-xs text-[#786a5d]">{plan.region} · {new Date(plan.updatedAt).toLocaleDateString("ko-KR")}</p></div><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#9f5d3d]">{plan.stops.length}곳</span></div><div className="mt-4 space-y-2">{plan.stops.map((stop, index) => <PlanStopRow key={stop.id} stop={stop} index={index} catalog={catalog} total={plan.stops.length} onMove={onMove} onRemove={onRemove} onNote={onNote} />)}</div>{choices.length > 0 && <select aria-label={`${plan.title}에 장소 추가`} defaultValue="" onChange={event => { if (event.target.value) { onAdd(event.target.value); event.currentTarget.value = ""; } }} className="mt-3 h-10 w-full rounded-xl border border-dashed border-[#d9cbbb] bg-white px-3 text-xs font-semibold text-[#846856] outline-none"><option value="">+ 이 플랜에 장소 추가</option>{choices.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}</select>}</div>;
}

function PlanStopRow({ stop, index, catalog, total, onMove, onRemove, onNote }: { stop: PlanStop; index: number; catalog: CatalogPlace[]; total: number; onMove: (stopId: number, direction: "up" | "down") => void; onRemove: (stopId: number) => void; onNote: (stopId: number, note: string) => void }) {
  const place = catalog.find(item => item.id === stop.placeId);
  const [note, setNote] = useState(stop.note ?? "");
  const changed = note !== (stop.note ?? "");
  const saveNote = () => { if (changed) onNote(stop.id, note); };
  return <div className="rounded-xl border border-[#e8ddd1] bg-white p-3"><div className="flex items-center gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f0e3d5] text-[11px] font-bold text-[#a55d3b]">{index + 1}</span><p className="min-w-0 flex-1 truncate text-sm font-bold">{place?.name ?? "장소"}</p><button aria-label="순서 위로" disabled={index === 0} onClick={() => onMove(stop.id, "up")} className="text-[#846b59] disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button><button aria-label="순서 아래로" disabled={index === total - 1} onClick={() => onMove(stop.id, "down")} className="text-[#846b59] disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button><button aria-label="장소 삭제" onClick={() => onRemove(stop.id)} className="text-[#a65737]"><Trash2 className="h-3.5 w-3.5" /></button></div><div className="mt-2 flex gap-2 border-t border-[#eee5dc] pt-2"><input aria-label={`${place?.name ?? "장소"} 메모`} value={note} onChange={event => setNote(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); saveNote(); } }} placeholder="이 장소에서의 메모" className="min-w-0 flex-1 border-0 text-xs text-[#695c51] outline-none placeholder:text-[#aa9d91] focus:ring-0" /><button aria-label={`${place?.name ?? "장소"} 메모 저장`} onClick={saveNote} disabled={!changed} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#f0e3d5] px-2 py-1 text-[10px] font-bold text-[#9a5232] disabled:opacity-40"><Save className="h-3 w-3" /> 저장</button></div></div>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="rounded-[1.4rem] border border-[#e4dad0] bg-white p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f3e7dc] text-[#a55d3b]">{icon}</span><p className="mt-4 text-xs font-bold tracking-wide text-[#8a7869]">{label}</p><p className="mt-1 font-serif text-3xl font-semibold">{value}</p></div>; }
function Empty({ icon, text, detail, compact = false }: { icon: React.ReactNode; text: string; detail: string; compact?: boolean }) { return <div className={`grid place-items-center text-center ${compact ? "py-8" : "rounded-[1.5rem] border border-dashed border-[#dccfbf] bg-white px-5 py-12"}`}><span className="text-[#b8653a]">{icon}</span><p className="mt-3 font-serif text-lg">{text}</p><p className="mt-1 max-w-xs text-xs leading-5 text-[#76695e]">{detail}</p></div>; }
function SparkleIcon() { return <span className="grid h-4 w-4 place-items-center text-sm">✦</span>; }
