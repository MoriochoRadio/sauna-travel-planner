export function CourseSkeleton() {
  return (
    <section className="card p-5 mt-6 animate-pulse" aria-busy="true" aria-label="코스 생성 중">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-5" />
      <div className="space-y-4">
        {[0, 1].map((d) => (
          <div key={d}>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="space-y-3 pl-4">
              {[0, 1, 2].map((s) => (
                <div key={s} className="flex gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-200 shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-1" />
                    <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/4 mt-5" />
    </section>
  );
}
