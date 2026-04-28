import Link from "next/link";

/** Honest scaffold only — no fabricated metrics; live aggregates live on the orchestrator and workbench CM bands. */
export default function AdminInsightsPlaceholderPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Insights</h1>
      <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">
        Placeholder route—no report engine, charts, or engagement KPIs are claimed here. Aggregate pipeline health and
        inbound counts are on the{" "}
        <Link href="/admin/orchestrator" className="font-semibold text-kelly-slate underline-offset-2 hover:underline">
          content orchestrator
        </Link>
        ; campaign-manager summary bands sit on the{" "}
        <Link href="/admin/workbench" className="font-semibold text-kelly-slate underline-offset-2 hover:underline">
          workbench
        </Link>
        . Orch stores normalized items and optional metrics JSON for future reporting—never raw voter rows in this shell.
      </p>
      <p className="mt-6 font-body text-sm text-kelly-text/60">No charts in this deployment path—intake and routing first.</p>
    </div>
  );
}
