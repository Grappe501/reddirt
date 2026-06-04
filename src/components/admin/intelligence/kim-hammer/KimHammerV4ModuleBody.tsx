import Link from "next/link";
import { V3MarkdownSectionList } from "@/components/admin/intelligence/v3/V3SectionStack";
import { V4ArgumentMap } from "@/components/admin/intelligence/v4/V4ArgumentMap";
import { V4ThemeMatrix } from "@/components/admin/intelligence/v4/V4ThemeMatrix";
import {
  loadDebateIntelligenceV4HubPacket,
  loadDebateIntelligenceV4Packet,
  loadDebateIntelligenceV4SurfacePacket,
} from "@/lib/intelligence/v4/debateIntelligenceV4";
import type { KimHammerV4ModuleEntry } from "@/lib/intelligence/kimHammerV4ModuleRegistry";
import { KIM_HAMMER_COMMAND_CENTER_HREF } from "@/lib/opposition/kimHammerBriefingRegistry";

function loadPacketForEntry(entry: KimHammerV4ModuleEntry) {
  if (entry.profile === "surface") return loadDebateIntelligenceV4SurfacePacket();
  if (entry.profile === "full") return loadDebateIntelligenceV4Packet("full");
  return loadDebateIntelligenceV4HubPacket();
}

export function KimHammerV4ModuleBody({ entry }: { entry: KimHammerV4ModuleEntry }) {
  const v4 = loadPacketForEntry(entry);
  const render = entry.render;

  if (render.type === "staff-stub") {
    return (
      <section className="rounded-xl border border-amber-200/60 bg-amber-50/40 p-5 text-sm text-kelly-muted">
        <p>
          This module is deferred to the lightweight debate-week path on Netlify. Kelly should use the hub, debate prep,
          and bill drill-downs on debate night; staff can open the full module after launch mode.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={render.primaryHref ?? "/admin/intelligence"}
            className="rounded-full border border-kelly-navy/30 bg-white px-3 py-1 text-xs font-bold text-kelly-navy"
          >
            {render.primaryLabel ?? "Debate hub"} →
          </Link>
          <Link
            href={KIM_HAMMER_COMMAND_CENTER_HREF}
            className="rounded-full border border-kelly-navy/30 px-3 py-1 text-xs font-bold text-kelly-navy"
          >
            Opponent record
          </Link>
        </div>
      </section>
    );
  }

  if (render.type === "markdown") {
    const sections = v4.researchLayers[render.layer].slice(0, render.sectionLimit ?? 12);
    return (
      <V3MarkdownSectionList sections={sections} />
    );
  }

  if (render.type === "rebuttal-playbook") {
    return (
      <section className="grid gap-4">
        {v4.rebuttalPlaybook.map((item) => (
          <div key={item.prompt} className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{item.prompt}</h2>
            <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
              <li>Agree where valid: {item.agreeWhereValid}</li>
              <li>Contrast method: {item.contrastMethod}</li>
              <li>Bridge line: {item.kellyBridge}</li>
              <li>Evidence status: {item.evidenceStatus}</li>
            </ul>
          </div>
        ))}
      </section>
    );
  }

  if (render.type === "likely-arguments") {
    return (
      <section className="grid gap-4">
        {v4.likelyArguments.map((arg) => (
          <div key={arg.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs text-kelly-muted">
            <p className="font-bold text-kelly-navy">{arg.argument}</p>
            <p className="mt-2">Evidence he may cite: {arg.evidenceHeMayCite.join("; ")}</p>
            <p className="mt-1">Source anchors: {arg.sourceAnchors.join("; ") || "—"}</p>
          </div>
        ))}
      </section>
    );
  }

  if (render.type === "argument-map") {
    return <V4ArgumentMap arguments={v4.likelyArguments} rebuttals={v4.rebuttalPlaybook} />;
  }

  if (render.type === "strengths-weaknesses") {
    return (
      <section className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Strengths</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {v4.strengths.map((item) => (
              <li key={item.id}>
                {item.label} ({item.evidenceStatus}; {item.sourceConfidence})
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Debate-safe vulnerabilities</h2>
          <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
            {v4.weaknesses.map((item) => (
              <li key={item.id}>
                {item.saferWording ?? item.label} (debate {item.debateUsefulness ?? "—"}; {item.sourceConfidence})
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (render.type === "retrieval-gaps") {
    return (
      <section className="space-y-4">
        {v4.retrievalQueue.map((gap) => (
          <article key={gap.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <p className="font-bold text-kelly-navy">
              [{gap.priority}] {gap.description}
            </p>
            <p className="mt-1 text-kelly-muted">
              Status: {gap.taskStatus} · Closure: {gap.closureStatus}
            </p>
            <p className="mt-1 text-[10px] text-kelly-subtle">{gap.recommendedHumanAction}</p>
          </article>
        ))}
        {v4.intelligenceGaps.length > 0 ? (
          <div className="rounded-xl border border-violet-200/40 bg-violet-50/30 p-4 text-xs">
            <p className="font-bold uppercase text-violet-950">Structured gap register</p>
            <ul className="mt-2 list-inside list-disc text-kelly-muted">
              {v4.intelligenceGaps.map((g) => (
                <li key={g.id}>
                  [{g.priority}] {g.description} — {g.externalMessageReadiness}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    );
  }

  if (render.type === "integrity-2021") {
    const pkg = v4.integrity2021;
    if (!pkg) {
      return <p className="text-sm text-kelly-muted">2021 integrity package JSON not loaded on this deploy.</p>;
    }
    return (
      <section className="space-y-4 text-xs text-kelly-muted">
        <p className="text-sm text-kelly-text">{pkg.plainEnglishSummary}</p>
        <ul className="list-inside list-disc">
          {pkg.narrativeArc.map((line) => (
            <li key={line.slice(0, 40)}>{line}</li>
          ))}
        </ul>
        <p className="font-semibold text-kelly-navy">Bills: {pkg.billNumbers.join(", ")}</p>
        <div className="flex flex-wrap gap-2">
          {pkg.billNumbers.map((billNumber) => (
            <Link
              key={billNumber}
              href={`${KIM_HAMMER_COMMAND_CENTER_HREF}/bills/${encodeURIComponent(billNumber)}`}
              className="rounded border border-kelly-navy/20 px-2 py-1 font-bold text-kelly-navy"
            >
              {billNumber}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (render.type === "theme-matrix") {
    return <V4ThemeMatrix rows={v4.themeMatrix} />;
  }

  if (render.type === "timeline") {
    return (
      <section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-kelly-text/10 text-kelly-muted">
                <th className="py-1.5 pr-3 font-semibold">Year</th>
                <th className="py-1.5 pr-3 font-semibold">Bill/Act</th>
                <th className="py-1.5 pr-3 font-semibold">Role</th>
                <th className="py-1.5 pr-3 font-semibold">Impact</th>
                <th className="py-1.5 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {v4.timeline.map((row) => (
                <tr key={`${row.year}-${row.billOrAct}`} className="border-b border-kelly-text/5">
                  <td className="py-1.5 pr-3">{row.year}</td>
                  <td className="py-1.5 pr-3">{row.billOrAct}</td>
                  <td className="py-1.5 pr-3">{row.hammerRole}</td>
                  <td className="py-1.5 pr-3 max-w-md">{row.whatChanged}</td>
                  <td className="py-1.5">{row.sourceConfidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (render.type === "rapid-response") {
    return (
      <ul className="list-inside list-disc text-xs text-kelly-muted">
        {v4.rapidResponseAssets.map((a) => (
          <li key={a.id}>
            {a.category}: {a.asset} ({a.verificationStatus})
          </li>
        ))}
      </ul>
    );
  }

  if (render.type === "hub-claims-summary") {
    const { claims } = v4.hub;
    return (
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/40 p-4">
          <p className="text-[10px] font-bold uppercase text-emerald-900">Supported</p>
          <p className="mt-1 text-2xl font-bold">{claims.supported.length}</p>
        </div>
        <div className="rounded-xl border border-amber-200/50 bg-amber-50/40 p-4">
          <p className="text-[10px] font-bold uppercase text-amber-900">Partial</p>
          <p className="mt-1 text-2xl font-bold">{claims.partial.length}</p>
        </div>
        <div className="rounded-xl border border-rose-200/50 bg-rose-50/40 p-4">
          <p className="text-[10px] font-bold uppercase text-rose-900">Needs research</p>
          <p className="mt-1 text-2xl font-bold">{claims.needsResearch.length}</p>
        </div>
        <Link href="/admin/intelligence/claims" className="text-sm font-bold text-kelly-navy underline sm:col-span-3">
          Open full claims ledger →
        </Link>
      </section>
    );
  }

  return null;
}
