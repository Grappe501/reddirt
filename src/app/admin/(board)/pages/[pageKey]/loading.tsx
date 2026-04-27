export default function AdminPageKeyLoading() {
  return (
    <div
      className="mx-auto max-w-xl rounded-lg border border-kelly-text/15 bg-kelly-fog/50 p-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="font-body text-sm text-kelly-slate">Loading editor…</p>
      <p className="mt-1 font-body text-xs text-kelly-text/50">Preparing the page hero editor.</p>
    </div>
  );
}
