import Link from "next/link";
import { buildAccaPanelOperatorSummary } from "@/lib/intelligence/v4/phase8AccaPanelOperatorRunbook";

export function AccaPanelPrepPanel() {
  const summary = buildAccaPanelOperatorSummary();

  return (
    <section className="mb-8 rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-50/50 to-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-kelly-navy">ACCA Mountain View panel runbook</h2>
          <p className="mt-2 text-sm text-kelly-muted">
            {summary.eventTitle} · Panel {summary.panelDate} {summary.panelTime} · T{summary.countdownDays >= 0 ? "-" : "+"}
            {Math.abs(summary.countdownDays)} days
          </p>
        </div>
        <p className="text-[10px] font-bold uppercase text-amber-950">
          Platinum sponsor: {summary.platinumSponsor}
        </p>
      </div>

      <p className="mt-3 text-xs text-kelly-text">
        Candidates: {summary.candidates.join(" · ")}
      </p>

      <ol className="mt-6 list-inside list-decimal space-y-3 text-sm text-kelly-text">
        {summary.steps.map((step) => (
          <li key={step.order}>
            <span className="font-bold text-kelly-navy">{step.phase}</span> — {step.action}
            {step.href ? (
              <>
                {" "}
                <Link href={step.href} className="text-[10px] font-bold uppercase text-amber-900 underline">
                  Open →
                </Link>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
