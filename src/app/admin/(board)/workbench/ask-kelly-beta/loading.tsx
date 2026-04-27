export default function AskKellyBetaTriageLoading() {
  return (
    <div className="min-w-0 p-4 md:p-6" role="status" aria-live="polite" aria-busy="true">
      <p className="font-body text-sm text-kelly-slate">Loading…</p>
      <p className="mt-1 font-body text-xs text-kelly-text/50">Opening Ask Kelly beta triage.</p>
    </div>
  );
}
