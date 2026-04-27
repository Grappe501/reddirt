export default function AskKellyOnboardingLoading() {
  return (
    <div className="mx-auto max-w-3xl" role="status" aria-live="polite" aria-busy="true">
      <p className="font-body text-sm text-kelly-slate">Loading…</p>
      <p className="mt-1 font-body text-xs text-kelly-text/50">Preparing the onboarding page.</p>
    </div>
  );
}
