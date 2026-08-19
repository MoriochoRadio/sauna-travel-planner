export function CourseSkeleton() {
  return (
    <section className="card mt-6 animate-pulse p-5" aria-busy="true" aria-label="코스 생성 중">
      <div className="mb-3 h-6 w-1/3 rounded-pill bg-cream-2" />
      <div className="mb-5 h-3 w-2/3 rounded-pill bg-cream-2" />
      <div className="space-y-4">
        {[0, 1].map((d) => (
          <div key={d}>
            <div className="mb-3 h-4 w-1/4 rounded-pill bg-cream-2" />
            <div className="space-y-3 pl-4">
              {[0, 1, 2].map((s) => (
                <div key={s} className="flex gap-2">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-pill bg-clay/30" />
                  <div className="flex-1">
                    <div className="mb-1 h-3 w-1/2 rounded-pill bg-cream-2" />
                    <div className="h-2.5 w-3/4 rounded-pill bg-clay-soft" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 h-3 w-1/4 rounded-pill bg-cream-2" />
    </section>
  );
}
