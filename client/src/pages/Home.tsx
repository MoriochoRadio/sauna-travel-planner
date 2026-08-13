import PlaceCard from "@/components/PlaceCard";
import RecommendationStudio from "@/components/RecommendationStudio";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowDown, ArrowRight, Bookmark, ChevronRight, Compass, MapPinned, Search, SlidersHorizontal, Sparkles, Waves } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "wouter";
import { getPlace, type TravelPlace } from "@shared/travelCatalog";
import { travelGuides } from "@shared/travelGuides";

const TravelMap = lazy(() => import("@/components/TravelMap"));

const categoryCopy = [
  { key: "도시의 여백", description: "복잡한 일정 사이, 가장 가까운 곳에서 잠깐의 회복을 찾습니다.", gradient: "from-[#d9b39c] via-[#f3e4d5] to-[#e6ede7]" },
  { key: "자연의 온도", description: "산과 바다의 리듬 속에서, 오래 머무는 온천 여행을 만듭니다.", gradient: "from-[#8da99a] via-[#d8e0ce] to-[#f5e4cf]" },
  { key: "함께 쉬는 시간", description: "동행의 속도까지 생각한 가족·연인·친구의 하루를 제안합니다.", gradient: "from-[#c89576] via-[#edd4be] to-[#f8f0e2]" },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: facets } = trpc.travel.catalog.facets.useQuery();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | undefined>();
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
  const [selectedFacility, setSelectedFacility] = useState<string | undefined>();
  const [selectedCompanion, setSelectedCompanion] = useState<string | undefined>();
  const [selectedBudget, setSelectedBudget] = useState<"light" | "balanced" | "signature" | undefined>();
  const [coursePlaceIds, setCoursePlaceIds] = useState<string[]>([]);
  const listInput = useMemo(() => ({ query: query || undefined, region, moods: selectedMood ? [selectedMood] : undefined, facilities: selectedFacility ? [selectedFacility] : undefined, companions: selectedCompanion ? [selectedCompanion] : undefined, priceBands: selectedBudget ? [selectedBudget] : undefined }), [query, region, selectedMood, selectedFacility, selectedCompanion, selectedBudget]);
  const { data: places = [], isLoading, isError } = trpc.travel.catalog.list.useQuery(listInput);
  const { data: favoriteIds = [] } = trpc.travel.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const saved = new Set(favoriteIds);
  const mapPlaces = coursePlaceIds.length ? coursePlaceIds.map(id => getPlace(id)).filter((place): place is TravelPlace => Boolean(place)) : places;

  const resetFilters = () => { setQuery(""); setRegion(undefined); setSelectedMood(undefined); setSelectedFacility(undefined); setSelectedCompanion(undefined); setSelectedBudget(undefined); };

  return <div className="min-h-screen overflow-x-hidden bg-[#f7f3ed] pb-20 text-[#302720] md:pb-0">
    <header className="sticky top-0 z-30 border-b border-[#eee4d9]/80 bg-[#f7f3ed]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#2d453a] text-[#f7debf]"><Waves className="h-4 w-4" /></span><span className="font-serif text-xl font-semibold tracking-tight">온기행</span></Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#675c52] md:flex"><a href="#explore" className="hover:text-[#a55231]">탐색</a><a href="#ai-course" className="hover:text-[#a55231]">AI 코스</a><a href="#map" className="hover:text-[#a55231]">지도</a><Link href="/guides" className="hover:text-[#a55231]">가이드</Link><Link href="/me" className="hover:text-[#a55231]">나의 여행</Link></nav>
        {isAuthenticated ? <Link href="/me" className="rounded-full bg-[#2d453a] px-4 py-2 text-xs font-bold text-white">{user?.name ?? "나의 여행"}</Link> : <button onClick={startLogin} className="rounded-full bg-[#2d453a] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#22372e]">여행 저장하기</button>}
      </div>
    </header>

    <main>
      <section className="relative isolate overflow-hidden border-b border-[#e6dcd0] bg-[#2a3e35]">
        <img src="/manus-storage/sauna-journey-hero_e1e8dfeb.jpg" alt="증기가 피어오르는 산속 노천 온천" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-68" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(22,35,29,0.96)_0%,rgba(28,46,38,0.8)_45%,rgba(25,39,33,0.22)_100%)]" />
        <div className="absolute -left-20 top-10 -z-10 h-72 w-72 rounded-full bg-[#cc7a50]/25 blur-3xl" />
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-16 sm:pb-20 sm:pt-24 lg:px-8 lg:py-28">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-[#f1c8a6]"><span className="h-px w-7 bg-current" /> KOREAN WELLNESS JOURNEY</p>
          <h1 className="max-w-2xl font-serif text-5xl font-semibold leading-[1.04] tracking-[-0.04em] text-[#fffbf5] sm:text-6xl lg:text-7xl">몸의 온도로,<br />여행의 결을 고르다.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#e5e3db] sm:text-lg">사우나·찜질방·온천을 중심으로, 나에게 맞는 쉼과 주변의 좋은 장면을 연결합니다.</p>
          <div className="mt-9 flex flex-wrap gap-3"><a href="#ai-course" className="inline-flex h-12 items-center gap-2 rounded-full bg-[#e78f61] px-5 text-sm font-bold text-[#2e2119] shadow-[0_12px_25px_-15px_rgba(0,0,0,.6)] transition hover:-translate-y-0.5 hover:bg-[#f5aa7e]">AI에게 코스 부탁하기 <ArrowRight className="h-4 w-4" /></a><a href="#explore" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20">장소부터 둘러보기 <ArrowDown className="h-4 w-4" /></a></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold tracking-[0.17em] text-[#aa6442]">CURATED MOMENTS</p><h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">어떤 쉼이 필요한가요?</h2></div><p className="max-w-sm text-sm leading-6 text-[#776b60]">좋아하는 장면부터 고르면, 장소와 동선의 결이 한결 또렷해집니다.</p></div>
        <div className="grid gap-4 md:grid-cols-3">{categoryCopy.map((item, index) => <button key={item.key} onClick={() => document.getElementById(index === 0 ? "explore" : "ai-course")?.scrollIntoView({ behavior: "smooth" })} className={`group relative min-h-44 overflow-hidden rounded-[1.5rem] bg-gradient-to-br ${item.gradient} p-6 text-left transition hover:-translate-y-1 hover:shadow-xl`}><span className="absolute -right-6 -top-9 font-serif text-9xl text-white/30">0{index + 1}</span><span className="relative text-xs font-bold tracking-widest text-[#715342]">SCENE 0{index + 1}</span><h3 className="relative mt-7 font-serif text-2xl font-semibold text-[#3b2d24]">{item.key}</h3><p className="relative mt-2 max-w-xs text-sm leading-5 text-[#5e4c40]">{item.description}</p><ChevronRight className="relative mt-4 h-4 w-4 text-[#714832] transition group-hover:translate-x-1" /></button>)}</div>
      </section>

      <section className="border-y border-[#e5ddd2] bg-[#fffaf5] py-12 lg:py-16"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold tracking-[0.17em] text-[#a65d3a]">TRAVEL GUIDEBOOK</p><h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">온천 여행을 더 잘 쉬는 법</h2></div><Link href="/guides" className="inline-flex items-center gap-1 text-sm font-bold text-[#9f552f] hover:underline">가이드 전체 보기 <ArrowRight className="h-4 w-4" /></Link></div><div className="grid gap-4 lg:grid-cols-3">{travelGuides.map((guide, index) => <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group rounded-[1.5rem] border border-[#eadfd3] bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_36px_-28px_rgba(58,38,20,.38)]"><span className="text-xs font-bold tracking-[0.14em] text-[#aa6442]">0{index + 1} · {guide.eyebrow}</span><h3 className="mt-5 font-serif text-2xl font-semibold">{guide.title}</h3><p className="mt-3 min-h-20 text-sm leading-6 text-[#6e6156]">{guide.intro}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#9b522e]">읽어보기 <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div></div></section>

      <section id="explore" className="scroll-mt-20 border-y border-[#e9e0d5] bg-[#fbf8f3] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-xs font-bold tracking-[0.17em] text-[#aa6442]">FIND YOUR PLACE</p><h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">나만의 온기, 찾아보기</h2></div><div className="flex items-center gap-2 text-sm text-[#7f6d5d]"><Compass className="h-4 w-4 text-[#b8653a]" /> 큐레이션 장소 {places.length}곳</div></div>
          <div className="rounded-[1.65rem] border border-[#e8ddd1] bg-white p-4 shadow-[0_10px_35px_-28px_rgba(58,38,20,0.55)] sm:p-5">
            <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c7765]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="지역, 시설, 분위기로 찾아보세요" className="h-13 w-full rounded-xl border border-[#e8ddd1] bg-[#fcfaf7] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#a99a8d] focus:border-[#b8653a]" /></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <FilterPill label="지역" value={region} options={facets?.regions ?? []} onChange={setRegion} />
              <FilterPill label="분위기" value={selectedMood} options={facets?.moods ?? []} onChange={setSelectedMood} />
              <FilterPill label="시설" value={selectedFacility} options={facets?.facilities ?? []} onChange={setSelectedFacility} />
              <FilterPill label="동행" value={selectedCompanion} options={facets?.companions ?? []} onChange={setSelectedCompanion} />
              <FilterPill label="예산" value={selectedBudget} options={["light", "balanced", "signature"]} labels={{ light: "가벼운 예산", balanced: "균형 예산", signature: "프리미엄" }} onChange={value => setSelectedBudget(value as typeof selectedBudget)} />
              {(query || region || selectedMood || selectedFacility || selectedCompanion || selectedBudget) && <button onClick={resetFilters} className="px-2 text-xs font-semibold text-[#a55231] hover:underline">초기화</button>}
            </div>
          </div>
          {isError && <div role="alert" className="mt-6 rounded-2xl border border-[#eac2b2] bg-[#fff2ea] px-4 py-3 text-sm text-[#954729]">장소 정보를 불러오지 못했어요. 새로고침하거나 잠시 후 다시 시도해 주세요.</div>}
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{isLoading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-[1.65rem] bg-[#ede5dc]" />) : places.map(place => <PlaceCard key={place.id} place={place} saved={saved.has(place.id)} canSave={isAuthenticated} />)}</div>
          {!isLoading && places.length === 0 && <div className="mt-7 rounded-[1.5rem] border border-dashed border-[#d9cbbb] bg-white px-5 py-12 text-center"><SlidersHorizontal className="mx-auto h-6 w-6 text-[#b8653a]" /><p className="mt-3 font-serif text-xl">조건을 조금 바꿔 볼까요?</p><p className="mt-2 text-sm text-[#76695e]">선택한 필터에 맞는 장소를 아직 찾지 못했습니다.</p><button onClick={resetFilters} className="mt-4 text-sm font-bold text-[#a55231]">전체 장소 보기</button></div>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><RecommendationStudio onCourse={course => setCoursePlaceIds(Array.from(new Set(course.stops.map(stop => stop.placeId))))} /></section>

      <section id="map" className="scroll-mt-20 bg-[#eee6db] py-12 lg:py-16"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-xs font-bold tracking-[0.17em] text-[#aa6442]">PLACE & PATH</p><h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{coursePlaceIds.length ? "AI 코스의 온기 지도" : "한눈에 보는 온기 지도"}</h2></div><p className="max-w-sm text-sm leading-6 text-[#74675b]">{coursePlaceIds.length ? "AI가 제안한 장소 순서가 핀과 점선 동선으로 표시됩니다." : "마음에 든 장소를 저장하면, 나만의 여행 플랜에서 동선을 이어 볼 수 있습니다."}</p></div><div className="overflow-hidden rounded-[1.75rem] border border-[#ded1c1] bg-white p-2 shadow-[0_18px_40px_-30px_rgba(58,38,20,0.4)]"><Suspense fallback={<MapLoading className="h-[320px] sm:h-[420px]" />}><TravelMap places={mapPlaces} className="h-[320px] overflow-hidden rounded-[1.3rem] sm:h-[420px]" /></Suspense></div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20"><div className="grid gap-8 rounded-[2rem] bg-[#f3eadf] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-bold tracking-[0.17em] text-[#a75b39]">YOUR TRAVEL NOTE</p><h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">좋았던 쉼은, 다음 여행의 시작이 됩니다.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#706155]">저장한 장소, 다녀온 기록, AI가 제안한 코스를 나의 여행 페이지에서 차분히 모아 보세요.</p></div>{isAuthenticated ? <Link href="/me" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2d453a] px-5 text-sm font-bold text-white hover:bg-[#22372e]"><Bookmark className="h-4 w-4" /> 나의 여행 보기</Link> : <Button onClick={startLogin} className="h-12 rounded-full bg-[#2d453a] px-5 text-sm font-bold text-white hover:bg-[#22372e]"><Bookmark className="mr-2 h-4 w-4" /> 로그인하고 여행 저장</Button>}</div></section>
    </main>
    <footer className="border-t border-[#e6dbd0] bg-[#fbf8f3] px-5 py-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs leading-5 text-[#77695c] sm:flex-row lg:px-3"><p>온기행은 검토된 큐레이션을 바탕으로 여행 영감을 돕습니다. 운영 정보는 방문 전 공식 채널에서 확인하세요.</p><p>건강 관련 내용은 일반적인 연구 정보이며 의료 조언이 아닙니다.</p></div></footer>
  </div>;
}

function MapLoading({ className }: { className: string }) { return <div className={`grid place-items-center bg-[#f8f4ee] text-sm text-[#77695e] ${className}`}>온기 지도를 불러오는 중입니다.</div>; }

function FilterPill({ label, value, options, labels, onChange }: { label: string; value?: string; options: string[]; labels?: Record<string, string>; onChange: (value?: string) => void }) {
  return <div className="relative"><select aria-label={label} value={value ?? ""} onChange={event => onChange(event.target.value || undefined)} className={`h-9 appearance-none rounded-full border px-3 pr-8 text-xs font-semibold outline-none transition ${value ? "border-[#c97249] bg-[#fff2ea] text-[#9e4f2d]" : "border-[#e8ddd1] bg-[#fcfaf7] text-[#695d53]"}`}><option value="">{label}</option>{options.map(option => <option key={option} value={option}>{labels?.[option] ?? option}</option>)}</select><ChevronRight className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 rotate-90 text-[#947e6b]" /></div>;
}
