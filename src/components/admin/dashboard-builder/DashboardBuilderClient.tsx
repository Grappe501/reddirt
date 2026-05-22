"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { buildDashboardBlueprint, type DashboardBlueprint } from "@/lib/agents/dashboard-builder/dashboard-blueprint-builder";

const EXAMPLES = [
  "Build me a treasurer dashboard for April reimbursement.",
  "Create a volunteer coordinator dashboard for house parties.",
  "Show a candidate-only approval dashboard.",
  "Build a county lead dashboard for Pulaski County.",
  "Make a simple new-user dashboard for someone helping with events.",
];

export function DashboardBuilderClient() {
  const [roleLabel, setRoleLabel] = useState("Treasurer");
  const [task, setTask] = useState("Close April reimbursement packet");
  const [experience, setExperience] = useState("experienced");
  const [detail, setDetail] = useState<"simple" | "standard" | "power">("standard");
  const [freeform, setFreeform] = useState("");
  const [blueprint, setBlueprint] = useState<DashboardBlueprint | null>(null);

  const build = () => {
    setBlueprint(
      buildDashboardBlueprint({
        roleLabel,
        taskDescription: task,
        experience,
        detailLevel: detail,
        freeformRequest: freeform || undefined,
        month: "2026-04",
      }),
    );
  };

  const savedKey = useMemo(() => blueprint?.saveKey ?? null, [blueprint]);

  const saveLocal = () => {
    if (!blueprint) return;
    try {
      localStorage.setItem(blueprint.saveKey, JSON.stringify(blueprint));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/15 bg-kelly-navy/[0.04] p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Kelly Campaign OS</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">On-demand dashboard builder</h1>
        <p className="mt-2 text-sm text-kelly-text/70">
          Produces a <strong>safe blueprint</strong> from the component registry — not arbitrary code. Human-supervised,
          Kelly SOS only.
        </p>
        <Link href="/admin/ai-command-center" className="mt-3 inline-block text-xs font-bold text-kelly-navy underline">
          ← Command center
        </Link>
      </header>

      <section className="space-y-4 rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
        <label className="block text-xs font-bold text-kelly-slate">What role or job is this dashboard for?</label>
        <input className="w-full rounded-lg border px-3 py-2 text-sm" value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)} />

        <label className="block text-xs font-bold text-kelly-slate">What are they trying to accomplish?</label>
        <textarea className="w-full rounded-lg border px-3 py-2 text-sm" rows={2} value={task} onChange={(e) => setTask(e.target.value)} />

        <label className="block text-xs font-bold text-kelly-slate">Experience level</label>
        <select className="w-full rounded-lg border px-3 py-2 text-sm" value={experience} onChange={(e) => setExperience(e.target.value)}>
          <option value="new">New helper</option>
          <option value="some">Some campaign experience</option>
          <option value="experienced">Experienced</option>
        </select>

        <label className="block text-xs font-bold text-kelly-slate">How much detail?</label>
        <select
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={detail}
          onChange={(e) => setDetail(e.target.value as "simple" | "standard" | "power")}
        >
          <option value="simple">Simple — calm, minimal panels</option>
          <option value="standard">Standard</option>
          <option value="power">Power operator — more blocks</option>
        </select>

        <label className="block text-xs font-bold text-kelly-slate">Or describe in plain language (optional)</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={freeform}
          onChange={(e) => setFreeform(e.target.value)}
          placeholder={EXAMPLES[0]}
        />
        <div className="flex flex-wrap gap-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              className="rounded-full border px-2 py-0.5 text-[10px] font-semibold text-kelly-navy"
              onClick={() => setFreeform(ex)}
            >
              Example
            </button>
          ))}
        </div>

        <button type="button" onClick={build} className="rounded-full bg-kelly-navy px-5 py-2 text-sm font-bold text-white">
          Build dashboard blueprint
        </button>
      </section>

      {blueprint ? (
        <section className="space-y-4 rounded-2xl border border-kelly-navy/20 bg-kelly-page p-5">
          <h2 className="font-heading text-lg font-bold text-kelly-navy">{blueprint.title}</h2>
          <p className="text-xs text-kelly-text/65">{blueprint.request.naturalLanguageSummary}</p>
          {blueprint.humanSupervisorRequired ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              Human supervisor recommended for this role.
            </p>
          ) : null}

          <h3 className="text-xs font-bold uppercase text-kelly-slate">Preview cards</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {blueprint.blocks.map((b) => (
              <article key={b.id} className={`rounded-xl border p-4 ${b.emphasis === "primary" ? "border-kelly-navy/25 bg-kelly-navy/[0.03]" : "border-kelly-text/10"}`}>
                <p className="font-bold text-kelly-navy">{b.title}</p>
                <p className="mt-1 text-xs text-kelly-text/70">{b.purpose}</p>
                <p className="mt-2 text-[10px] text-kelly-slate">{b.aiExplanation}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {b.routeLinks.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[10px] font-bold text-kelly-navy underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {blueprint.missingCapabilities.length ? (
            <div>
              <h3 className="text-xs font-bold uppercase text-kelly-slate">Missing capabilities</h3>
              <ul className="mt-1 text-xs text-kelly-text/65">
                {blueprint.missingCapabilities.map((m) => (
                  <li key={m}>• {m}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveLocal} className="rounded-full border px-4 py-2 text-xs font-bold">
              Save blueprint locally
            </button>
            {savedKey ? <span className="text-[10px] text-kelly-text/45">Key: {savedKey}</span> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
