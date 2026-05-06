"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { AutomationPolicyEvalRow } from "@/lib/email-command-center/automation-policy-runner";
import {
  AUTOMATION_POLICY_EXPLAIN_BY_ID,
  type AutomationPolicyExplainSpec,
} from "@/lib/email-command-center/automation-policy-details";
import type { AutomationPolicyId } from "@/lib/email-command-center/automation-policies";

function policyStatusPill(s: "ok" | "warn" | "alert") {
  const cls =
    s === "ok"
      ? "bg-emerald-100 text-emerald-900"
      : s === "warn"
        ? "bg-amber-100 text-amber-950"
        : "bg-rose-100 text-rose-950";
  const label = s === "ok" ? "OK" : s === "warn" ? "Warn" : "Alert";
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${cls}`}>{label}</span>;
}

function ExplainDl({ spec }: { spec: AutomationPolicyExplainSpec }) {
  return (
    <dl className="mt-2 space-y-1.5 font-body text-[10px] text-kelly-navy/95">
      <div>
        <dt className="font-bold text-violet-950/90">What it watches</dt>
        <dd className="mt-0.5 text-kelly-text/88">{spec.watches}</dd>
      </div>
      <div>
        <dt className="font-bold text-violet-950/90">What it recommends</dt>
        <dd className="mt-0.5 text-kelly-text/88">{spec.recommends}</dd>
      </div>
      <div>
        <dt className="font-bold text-violet-950/90">What it can never do</dt>
        <dd className="mt-0.5 text-kelly-text/88">{spec.neverDoes}</dd>
      </div>
      <div>
        <dt className="font-bold text-violet-950/90">Data source</dt>
        <dd className="mt-0.5 font-mono text-[9px] text-kelly-text/80">{spec.dataSource}</dd>
      </div>
    </dl>
  );
}

export type AutomationPolicyDetailAccordionsProps = {
  policies: AutomationPolicyEvalRow[];
};

/** Expandable explainability — anchor per policy: `#policy-detail-{id}` on Automation route. */
export function AutomationPolicyDetailAccordions({ policies }: AutomationPolicyDetailAccordionsProps) {
  useEffect(() => {
    const applyHash = () => {
      const m = typeof window !== "undefined" ? window.location.hash.match(/^#policy-detail-(.+)$/) : null;
      const id = m?.[1];
      if (!id) return;
      const el = document.getElementById(`policy-detail-${id}`) as HTMLDetailsElement | null;
      if (el) {
        el.open = true;
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [policies]);

  return (
    <div className="space-y-2">
      <nav className="rounded border border-violet-200/60 bg-white/90 px-2 py-1.5 font-body text-[10px] text-violet-950">
        <span className="font-bold uppercase tracking-wide text-violet-900/80">Jump to policy</span>
        <span className="mx-1 text-violet-300">·</span>
        {policies.map((p, i) => (
          <span key={p.id}>
            {i > 0 ? <span className="mx-0.5 text-violet-300">·</span> : null}
            <a href={`#policy-detail-${p.id}`} className="font-semibold text-violet-800 underline">
              {p.id.replace(/_/g, " ")}
            </a>
          </span>
        ))}
      </nav>
      {policies.map((p) => {
        const spec = AUTOMATION_POLICY_EXPLAIN_BY_ID[p.id as AutomationPolicyId];
        if (!spec) return null;
        return (
          <details
            key={p.id}
            id={`policy-detail-${p.id}`}
            className="scroll-mt-24 rounded-lg border border-violet-200/70 bg-white/95 px-2 py-1.5"
          >
            <summary className="cursor-pointer list-none font-body text-[11px] text-violet-950 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex flex-wrap items-center gap-2">
                {policyStatusPill(p.status)}
                <span className="font-heading font-bold text-kelly-navy">{p.title}</span>
                <span className="font-mono text-[9px] text-violet-800/80">{p.id}</span>
              </span>
            </summary>
            <ExplainDl spec={spec} />
            <div className="mt-2 rounded border border-kelly-text/10 bg-kelly-fog/50 px-2 py-1.5">
              <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/55">Current evaluation</p>
              <p className="mt-0.5 font-mono text-[9px] text-kelly-navy">{p.detailSafe}</p>
              <p className="mt-1 text-[10px] text-kelly-text/88">{p.recommendedActionSafe}</p>
            </div>
            <p className="mt-2 font-body text-[10px] text-kelly-navy">
              <span className="font-bold">Route to act:</span>{" "}
              {p.href ? (
                <Link href={p.href} className="font-bold text-kelly-forest underline">
                  Open linked surface
                </Link>
              ) : (
                <span className="text-kelly-text/65">No deep link for this state — stay on Automation Studio.</span>
              )}
              {" · "}
              <a href="#automation-policy-top" className="text-kelly-text/70 underline">
                Back to top
              </a>
            </p>
          </details>
        );
      })}
    </div>
  );
}
