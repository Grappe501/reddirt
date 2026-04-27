export default function WorkbenchLoading() {
  return (
    <div className="min-h-[40vh] animate-pulse border border-kelly-text/10 bg-kelly-page/50 p-4">
      <div className="h-6 w-48 rounded bg-kelly-text/10" />
      <div className="mt-3 grid grid-cols-2 gap-1 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 rounded border border-kelly-text/5 bg-white/40" />
        ))}
      </div>
    </div>
  );
}
