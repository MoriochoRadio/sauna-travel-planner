import { PlannerForm } from "@/components/PlannerForm";

export default function Home() {
  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">🔥 사우나 여행 코스 메이커</h1>
        <p className="text-sm text-bark/70 mt-1">사우나를 축으로 맛집·볼거리를 엮은 맞춤 여행</p>
      </header>
      <PlannerForm />
      <footer className="text-center text-xs text-bark/50 mt-8">
        curated 데이터 기반 · v1
      </footer>
    </main>
  );
}
