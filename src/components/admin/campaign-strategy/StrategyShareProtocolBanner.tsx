/**
 * Step 3 — Persistent operator guidance for sharing (server component).
 */
export function StrategyShareProtocolBanner() {
  return (
    <div className="mb-6 rounded-xl border border-kelly-blue/15 bg-kelly-fog/50 px-4 py-3 font-body text-[12px] leading-snug text-kelly-slate print:hidden">
      <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-deep/80">
        Share protocol — Kelly & partners
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-4 marker:text-kelly-gold">
        <li>
          <strong className="text-kelly-text">Internal classification</strong> — treat all chapters as campaign
          planning unless you intentionally use external-share links.
        </li>
        <li>
          <strong className="text-kelly-text">LANE / dollars</strong> — do not forward budget tables externally; use{" "}
          <code className="rounded bg-white px-1 text-[11px]">?share=external</code> on the LANE URL to hide that
          chapter, or share other routes from the sidebar.
        </li>
        <li>
          <strong className="text-kelly-text">Copy link</strong> in the toolbar copies the current URL{" "}
          <strong>including #anchors</strong> after you scroll to a section.
        </li>
      </ul>
    </div>
  );
}
