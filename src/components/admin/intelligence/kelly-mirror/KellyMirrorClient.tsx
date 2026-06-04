"use client";

import Link from "next/link";
import type { KellyAdversarialMirrorFile } from "@/lib/intelligence/kellyAdversarialMirrorTypes";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-kelly-text/10 bg-white p-5 text-xs">
      <h2 className="text-sm font-bold uppercase text-kelly-navy">{title}</h2>
      <div className="mt-3 space-y-3 text-kelly-muted">{children}</div>
    </section>
  );
}

function SimBlock({ sim, label }: { sim: KellyAdversarialMirrorFile["hammerRedTeam"]; label: string }) {
  return (
    <div className="space-y-4">
      <p className="rounded border border-rose-200 bg-rose-50/50 p-3 text-[10px] font-bold uppercase text-rose-950">
        {label} — {sim.simulationId} · opponent posture simulation only
      </p>
      <p className="text-sm text-kelly-text">{sim.strategicObjective}</p>
      <div>
        <p className="font-bold text-rose-950">Offensive debate plan</p>
        <ol className="mt-2 list-inside list-decimal">
          {sim.offensiveDebatePlan.map((line) => (
            <li key={line.slice(0, 40)}>{line}</li>
          ))}
        </ol>
      </div>
      <div>
        <p className="font-bold text-emerald-950">Their defensive plan</p>
        <ol className="mt-2 list-inside list-decimal">
          {sim.defensiveDebatePlan.map((line) => (
            <li key={line.slice(0, 40)}>{line}</li>
          ))}
        </ol>
      </div>
      {sim.attackVectors.map((v) => (
        <article key={v.vectorId} className="rounded-lg border border-kelly-text/10 p-4">
          <p className="font-bold text-kelly-navy">
            {v.label} <span className="text-[10px] text-kelly-subtle">({v.personalOrProfessional})</span>
          </p>
          <p className="mt-1 italic text-kelly-subtle">Trap: {v.trapSetup}</p>
          <ul className="mt-2 list-inside list-disc text-rose-950/90">
            {v.likelyLines.map((l) => (
              <li key={l.slice(0, 48)}>{l}</li>
            ))}
          </ul>
        </article>
      ))}
      <div>
        <p className="font-bold text-violet-950">How they rebuttal you</p>
        <ul className="mt-2 list-inside list-disc">
          {sim.rebuttalToKelly.map((l) => (
            <li key={l.slice(0, 48)}>{l}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-bold text-amber-950">Hard-core takedown sequence</p>
        <ol className="mt-2 list-inside list-decimal">
          {sim.hardCoreTakedownSequence.map((l) => (
            <li key={l.slice(0, 48)}>{l}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function KellyMirrorClient({ mirror }: { mirror: KellyAdversarialMirrorFile }) {
  const tabs = [
    { id: "dossier", label: "Research dossier" },
    { id: "hammer", label: "Hammer red team" },
    { id: "packo", label: "Packo red team" },
    { id: "counter", label: "Counter playbook" },
    { id: "plan", label: "Build plan" },
  ] as const;

  return (
    <div className="space-y-6">
      <article className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4 text-xs text-rose-950">
        <p className="font-bold uppercase">{mirror.governance.classification}</p>
        <p className="mt-2">{mirror.governance.purpose}</p>
        <p className="mt-2 font-semibold">{mirror.governance.simulationDisclaimer}</p>
      </article>

      <nav className="flex flex-wrap gap-2 text-[10px] font-bold">
        {tabs.map((t) => (
          <a key={t.id} href={`#mirror-${t.id}`} className="rounded-full border border-kelly-navy/30 px-3 py-1 text-kelly-navy">
            {t.label}
          </a>
        ))}
        <Link href="/admin/intelligence/claims" className="rounded-full border px-3 py-1 text-kelly-navy">
          Claims gate
        </Link>
        <Link href="/admin/intelligence/debate-depth/culture-war" className="rounded-full border px-3 py-1 text-kelly-navy">
          Culture-war defense
        </Link>
      </nav>

      <div id="mirror-dossier">
        <Section title="Kelly research dossier — deeper than Packo/Hammer modules">
          <p>{mirror.researchDossier.summary}</p>
          {mirror.researchDossier.findings.map((f) => (
            <article key={f.id} className="rounded-lg border border-kelly-text/10 p-4">
              <div className="flex flex-wrap gap-2">
                <span className="font-bold text-kelly-navy">{f.title}</span>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    f.verificationStatus === "NEEDS_RESEARCH"
                      ? "bg-amber-100 text-amber-950"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {f.verificationStatus}
                </span>
                <span className="text-[10px] text-rose-950">Attack potential: {f.attackPotential}</span>
              </div>
              <p className="mt-2 text-kelly-text">{f.knownInRepo}</p>
              <p className="mt-2 font-bold text-kelly-subtle">What opponents will search</p>
              <ul className="mt-1 list-inside list-disc">
                {f.whatOpponentsWillSearch.map((q) => (
                  <li key={q.slice(0, 48)}>{q}</li>
                ))}
              </ul>
              <p className="mt-2 font-bold text-emerald-950">Kelly rule: {f.kellyRule}</p>
            </article>
          ))}
        </Section>
      </div>

      <div id="mirror-hammer">
        <Section title="Hammer — hard-core takedown simulation">
          <SimBlock sim={mirror.hammerRedTeam} label="Kim Hammer" />
        </Section>
      </div>

      <div id="mirror-packo">
        <Section title="Packo — hard-core takedown simulation">
          <SimBlock sim={mirror.packoRedTeam} label="Michael Packo" />
        </Section>
      </div>

      <div id="mirror-counter">
        <Section title="Counter playbook — combat every attack">
          <p>{mirror.counterPlaybook.summary}</p>
          {mirror.counterPlaybook.responses.map((r) => (
            <article key={r.attackId} className="rounded-lg border-2 border-emerald-200/60 p-4">
              <p className="font-bold text-kelly-navy">vs {r.attackId}</p>
              <p className="mt-2">
                <span className="font-bold text-emerald-900">Agree:</span> {r.kellyAcknowledge}
              </p>
              <p className="mt-1">
                <span className="font-bold text-violet-900">Contrast:</span> {r.kellyContrast}
              </p>
              <p className="mt-1">
                <span className="font-bold text-kelly-navy">Bridge:</span> {r.kellyBridge}
              </p>
              <p className="mt-2 text-amber-900">{r.claimsGate}</p>
              <p className="mt-1 font-bold text-rose-950">Do not say: {r.doNotSay.join(" · ")}</p>
            </article>
          ))}
        </Section>
      </div>

      <div id="mirror-plan">
        <Section title={mirror.buildPlan.title}>
          <p>{mirror.buildPlan.passwordPolicy}</p>
          <p className="mt-2">{mirror.buildPlan.staffExclusion}</p>
          {mirror.buildPlan.phases.map((ph) => (
            <article key={ph.phase} className="mt-4 rounded border border-kelly-text/10 p-3">
              <p className="font-bold">
                Phase {ph.phase}: {ph.label}
              </p>
              <p className="text-[10px] text-kelly-subtle">Owner: {ph.owner}</p>
              <ul className="mt-2 list-inside list-disc">
                {ph.tasks.map((t) => (
                  <li key={t.slice(0, 48)}>{t}</li>
                ))}
              </ul>
            </article>
          ))}
        </Section>
      </div>
    </div>
  );
}
