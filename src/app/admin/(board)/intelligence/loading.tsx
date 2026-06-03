export default function IntelligenceSectionLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4 py-4" aria-busy="true" aria-label="Loading intelligence">
      <div className="h-28 rounded-2xl bg-violet-100/60" />
      <div className="h-10 rounded-lg bg-kelly-text/5" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-24 rounded-lg bg-kelly-text/5" />
        <div className="h-24 rounded-lg bg-kelly-text/5" />
        <div className="h-24 rounded-lg bg-kelly-text/5" />
      </div>
      <div className="h-48 rounded-xl bg-kelly-text/5" />
    </div>
  );
}
