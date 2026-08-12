import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

const purposeOptions = [
  ["recovery", "회복이 필요한 주말"],
  ["slow-travel", "천천히 머무는 여행"],
  ["family-time", "가족과 보내는 시간"],
  ["date", "둘만의 데이트"],
  ["solo-reset", "혼자 리셋하는 하루"],
] as const;

type CourseView = {
  title: string;
  rationale: string;
  generatedWith: "ai" | "curated";
  wellbeingNote: string;
  stops: Array<{ period: "오전" | "오후" | "저녁"; placeId: string; title: string; description: string; tip: string }>;
};

type PreferenceView = {
  region: string;
  purpose: "recovery" | "slow-travel" | "family-time" | "date" | "solo-reset";
  mood: string;
  budget: "light" | "balanced" | "signature";
  companion: string;
};

export default function RecommendationStudio({ onCourse }: { onCourse?: (course: CourseView) => void }) {
  const { data: facets } = trpc.travel.catalog.facets.useQuery();
  const [preference, setPreference] = useState<PreferenceView>({ region: "부산", purpose: "date", mood: "세련된", budget: "signature", companion: "연인" });
  const [course, setCourse] = useState<CourseView | null>(null);
  const generate = trpc.travel.itinerary.generate.useMutation({ onSuccess: data => { setCourse(data); onCourse?.(data); } });

  useEffect(() => {
    if (facets && !facets.regions.includes(preference.region)) setPreference(current => ({ ...current, region: facets.regions[0] }));
  }, [facets, preference.region]);

  const fieldClass = "h-12 rounded-xl border-[#dcd0c2] bg-white text-sm font-medium text-[#463a31] shadow-none focus:ring-[#b8653a]";
  return (
    <section id="ai-course" className="scroll-mt-24 overflow-hidden rounded-[2rem] bg-[#293d34] px-5 py-7 text-[#fffbf5] shadow-[0_28px_65px_-38px_rgba(24,38,30,0.9)] sm:p-8 lg:p-10">
      <div className="grid gap-9 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div>
          <div className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-[#eab48f]"><Sparkles className="h-4 w-4" /> AI CURATOR</div>
          <h2 className="max-w-md font-serif text-3xl leading-[1.12] sm:text-4xl">오늘의 온도와<br />당신의 리듬을 맞춥니다.</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#d8ded6]">지역과 여행의 결을 알려 주세요. 운영 시간·가격·효능을 지어내지 않고, 검토된 장소 정보 안에서 쉬어 갈 여백이 있는 코스를 제안합니다.</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-[#d4dcd4]">AI 결과는 여행 영감을 위한 제안입니다. 실제 운영 정보는 방문 전 공식 채널에서 확인해 주세요.</div>
        </div>
        <div className="rounded-[1.55rem] bg-[#f8f2e9] p-4 text-[#3d3028] sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={preference.region} onValueChange={region => setPreference(current => ({ ...current, region }))}>
              <SelectTrigger className={fieldClass}><SelectValue placeholder="지역" /></SelectTrigger>
              <SelectContent>{facets?.regions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={preference.purpose} onValueChange={purpose => setPreference(current => ({ ...current, purpose: purpose as typeof preference.purpose }))}>
              <SelectTrigger className={fieldClass}><SelectValue placeholder="여행 목적" /></SelectTrigger>
              <SelectContent>{purposeOptions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={preference.mood} onValueChange={mood => setPreference(current => ({ ...current, mood }))}>
              <SelectTrigger className={fieldClass}><SelectValue placeholder="분위기" /></SelectTrigger>
              <SelectContent>{facets?.moods.map(mood => <SelectItem key={mood} value={mood}>{mood}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={preference.companion} onValueChange={companion => setPreference(current => ({ ...current, companion }))}>
              <SelectTrigger className={fieldClass}><SelectValue placeholder="동행" /></SelectTrigger>
              <SelectContent>{facets?.companions.map(companion => <SelectItem key={companion} value={companion}>{companion}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["light", "balanced", "signature"] as const).map(budget => <button key={budget} onClick={() => setPreference(current => ({ ...current, budget }))} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${preference.budget === budget ? "bg-[#b8653a] text-white" : "bg-[#eee5da] text-[#6f5b4b] hover:bg-[#e4d7c9]"}`}>{({ light: "가벼운 예산", balanced: "균형 예산", signature: "프리미엄" })[budget]}</button>)}
          </div>
          <Button onClick={() => generate.mutate(preference)} disabled={generate.isPending} className="mt-5 h-12 w-full rounded-xl bg-[#b8653a] text-sm font-bold text-white hover:bg-[#a45530]">
            {generate.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 코스를 다듬는 중</> : <>나만의 코스 만들기 <ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
          {generate.isError && <p role="alert" className="mt-3 rounded-xl bg-[#fff0ec] px-3 py-2 text-xs leading-5 text-[#9b4e31]">코스를 만들지 못했어요. 잠시 후 다시 시도해 주세요. 검토된 큐레이션 코스는 연결 상태에 따라 제공됩니다.</p>}
          {course && <CourseResult course={course} />}
        </div>
      </div>
    </section>
  );
}

function CourseResult({ course }: { course: CourseView }) {
  return <div aria-live="polite" className="mt-5 rounded-2xl border border-[#e3d7c9] bg-white p-4">
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-[11px] font-bold tracking-widest text-[#9c6447]">YOUR SLOW DAY</p><h3 className="mt-1 font-serif text-xl font-semibold">{course.title}</h3></div>
      <span className="rounded-full bg-[#edf2ec] px-2.5 py-1 text-[10px] font-bold text-[#46634f]">{course.generatedWith === "ai" ? "AI 제안" : "큐레이션 코스"}</span>
    </div>
    <p className="mt-3 text-sm leading-6 text-[#66594e]">{course.rationale}</p>
    <div className="mt-4 space-y-3">
      {course.stops.map(stop => <Link key={`${stop.period}-${stop.title}`} href={`/places/${stop.placeId}`} className="group flex gap-3 rounded-xl bg-[#faf6f0] p-3 transition hover:bg-[#f3eadf]">
        <span className="mt-0.5 w-8 shrink-0 text-xs font-bold text-[#ad603d]">{stop.period}</span>
        <span><strong className="block text-sm text-[#3b3029]">{stop.title}</strong><span className="mt-1 block text-xs leading-5 text-[#75685d]">{stop.description}</span></span>
      </Link>)}
    </div>
    <p className="mt-4 flex gap-2 border-t border-[#eee5dc] pt-3 text-[11px] leading-5 text-[#806f60]"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b8653a]" />{course.wellbeingNote}</p>
  </div>;
}
