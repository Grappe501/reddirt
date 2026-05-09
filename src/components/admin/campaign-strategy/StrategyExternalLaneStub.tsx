import Link from "next/link";
import { StrategyBreadcrumb } from "./StrategyBreadcrumb";

/**
 * Step 3 — External-share mode: LANE dollar / victory math is suppressed; operators send a safe URL with ?share=external
 */
export function StrategyExternalLaneStub() {
  const internalHref = "/admin/campaign-strategy/lane";
  return (
    <div className="max-w-[40rem]">
      <StrategyBreadcrumb pathKey="lane" />
      <div
        role="status"
        className="mt-4 rounded-xl border border-kelly-gold/40 bg-kelly-gold/15 px-5 py-6 text-kelly-deep"
      >
        <h2 className="font-heading text-xl font-bold">LANE — not shown in external-share mode</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">
          This chapter holds <strong>budget envelopes, dollar mix, and victory math</strong>. In{" "}
          <code className="rounded bg-white/80 px-1 text-xs">?share=external</code> mode we hide the body so you can
          pass a browser session or screenshot without those tables.
        </p>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">
          For Kelly: share the <strong>Executive summary</strong>, <strong>program chapters</strong>, or KPI sections
          instead, or route a redacted finance brief outside this UI.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 font-body text-sm text-kelly-slate">
          <li>
            <Link className="font-medium text-kelly-blue underline" href="/admin/campaign-strategy/executive-summary">
              Open executive summary
            </Link>
          </li>
          <li>
            <Link className="font-medium text-kelly-blue underline" href={internalHref}>
              Open full LANE (internal)
            </Link>{" "}
            — removes external-share for this chapter.
          </li>
        </ul>
      </div>
    </div>
  );
}
