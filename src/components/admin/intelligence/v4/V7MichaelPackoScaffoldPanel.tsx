import Link from "next/link";
import {
  loadMichaelPackoScaffold,
  packoOpenTaskCount,
} from "@/lib/intelligence/opponents/loadMichaelPackoScaffold";

export function V7MichaelPackoScaffoldPanel() {
  const scaffold = loadMichaelPackoScaffold();
  if (!scaffold) {
    return (
      <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50/40 p-5 text-sm text-amber-950">
        Michael Packo opposition scaffold not found on disk — add{" "}
        <code className="text-xs">data/opposition/michael-packo-profile/michael-packo-opposition-scaffold.json</code>
      </section>
    );
  }

  const open = packoOpenTaskCount(scaffold);

  return (
    <section className="mb-8 rounded-xl border-2 border-amber-200/80 bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-900">Third candidate · opposition research</p>
      <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">
        {scaffold.displayName} ({scaffold.party}) — {scaffold.status}
      </h2>
      <p className="mt-2 text-sm text-kelly-muted">{scaffold.summary}</p>
      <p className="mt-3 text-xs font-bold text-amber-900">
        {open} open retrieval tasks — no public contrast until PACKO-01–04 at least PARTIAL
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-3 text-xs">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
          <p className="font-bold uppercase text-emerald-900">In clerk rooms</p>
          <p className="mt-2">{scaffold.kellyPositioning.inClerkRooms}</p>
        </div>
        <div className="rounded-lg border border-violet-100 bg-violet-50/40 p-3">
          <p className="font-bold uppercase text-violet-900">In debate</p>
          <p className="mt-2">{scaffold.kellyPositioning.inDebate}</p>
        </div>
        <div className="rounded-lg border border-rose-100 bg-rose-50/40 p-3">
          <p className="font-bold uppercase text-rose-900">Claims gate</p>
          <p className="mt-2">{scaffold.kellyPositioning.claimsGate}</p>
        </div>
      </div>

      <h3 className="mt-5 text-[10px] font-bold uppercase text-kelly-subtle">Research priorities</h3>
      <ul className="mt-2 space-y-2 text-xs">
        {scaffold.researchPriorities.map((t) => (
          <li key={t.id} className="flex flex-wrap gap-2 rounded border border-kelly-text/10 px-3 py-2">
            <span className="font-mono font-bold text-kelly-navy">{t.id}</span>
            <span className="text-kelly-text">{t.task}</span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
              {t.status}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-kelly-muted">
        Provisional themes: {scaffold.provisionalThemes.join(" · ")}
      </p>

      <Link
        href="/admin/intelligence/opponents"
        className="mt-4 inline-block text-xs font-bold text-kelly-navy underline"
      >
        Opponents hub →
      </Link>
    </section>
  );
}
