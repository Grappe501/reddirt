import Link from "next/link";
import {
  COMMUNITY_PILLARS,
  FAITH_VENUE_POLLING_WORKFLOW_KEY,
  MUSLIM_ACTIVE_INITIATIVES,
  MUSLIM_TURNOUT_GOALS,
} from "@/lib/campaign-ops/community-equity-plan";

export const metadata = {
  title: "Community equity outreach | Kelly SOS admin",
};

export default function CommunityEquityOpsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Community equity &amp; faith outreach</h1>
      <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">
        Strategic pillars — <strong>Hispanic / Latine</strong>, <strong>Marshallese</strong>, and{" "}
        <strong>Muslim</strong> Arkansans — integrated into field, comms, and data. This is a{" "}
        <strong>full campaign</strong>, not a secondary translation track. Master plan:{" "}
        <code className="rounded bg-deep-soil/5 px-1 text-xs">docs/campaign-ops/COMMUNITY_EQUITY_OUTREACH_MASTER_PLAN.md</code>
      </p>

      <section className="mt-8 rounded-card border border-deep-soil/10 bg-cream-canvas p-5 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Muslim community — turnout goals (planning)</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-deep-soil/80">
          <li>
            <strong>Statewide:</strong> ~{MUSLIM_TURNOUT_GOALS.statewideVoterActivations.toLocaleString()} voter activations (define
            measurement with data)
          </li>
          <li>
            <strong>Central Arkansas:</strong> ~{MUSLIM_TURNOUT_GOALS.centralArkansasActivations.toLocaleString()} in the Central AR
            plan
          </li>
        </ul>
        <p className="mt-3 text-xs text-deep-soil/55">
          Numbers are organizing targets, not census claims. Segment and model with counsel and the data lead.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Active initiatives (Muslim — Central AR)</h2>
        <ul className="mt-2 space-y-2">
          {MUSLIM_ACTIVE_INITIATIVES.map((i) => (
            <li
              key={i.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-deep-soil/10 bg-white/60 px-3 py-2 text-sm"
            >
              <span className="text-deep-soil/90">{i.label}</span>
              <span
                className={
                  i.status === "in_progress"
                    ? "rounded-full bg-sunlight-gold/25 px-2 py-0.5 text-[10px] font-bold uppercase text-deep-soil"
                    : "rounded-full bg-field-green/15 px-2 py-0.5 text-[10px] font-bold uppercase text-field-green"
                }
              >
                {i.status.replaceAll("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Three pillars (all communities)</h2>
        <ul className="mt-3 space-y-4">
          {COMMUNITY_PILLARS.map((p) => (
            <li key={p.id} className="rounded-md border border-deep-soil/10 bg-cream-canvas/90 px-4 py-3 text-sm">
              <h3 className="font-heading font-bold text-deep-soil">{p.label}</h3>
              <p className="mt-1 text-deep-soil/75">{p.focus}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-card border border-civic-slate/20 bg-civic-midnight/[0.04] p-5">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Campaign manager workflow — mosque polling place</h2>
        <p className="mt-2 text-sm leading-relaxed text-deep-soil/80">
          To put the <strong>Central AR mosque polling site</strong> into the same system as other field work:
        </p>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-deep-soil/85">
          <li>
            Open{" "}
            <Link href="/admin/workbench/calendar" className="font-semibold text-civic-slate underline">
              Calendar HQ
            </Link>{" "}
            and create a <strong>MEETING</strong>-type campaign event (e.g. planning milestone or host-facing deadline). Use
            internal visibility if the date is not public yet.
          </li>
          <li>
            Apply the workflow template <code className="rounded bg-deep-soil/5 px-1 text-xs">{FAITH_VENUE_POLLING_WORKFLOW_KEY}</code>{" "}
            — <strong>Faith venue — polling place (mosque / community anchor)</strong>. This spawns tasks: stakeholder MOU, county
            clerk, language/access, Get Loud + reg drive, counsel sign-off, day-of field leads.
          </li>
          <li>
            Track tasks on{" "}
            <Link href="/admin/tasks" className="font-semibold text-civic-slate underline">
              /admin/tasks
            </Link>{" "}
            and the workbench open-work bands.
          </li>
        </ol>
        <p className="mt-3 text-xs text-amber-900/90">
          Run <code className="rounded bg-amber-100/50 px-1">npm run db:seed</code> (or deploy migration path) on environments that
          have not yet picked up the new template row.
        </p>
      </section>

      <section className="mt-6 text-sm text-deep-soil/70">
        <h2 className="font-heading text-base font-bold text-deep-soil">Related</h2>
        <ul className="mt-2 list-inside list-disc">
          <li>
            <Link href="/admin/style-guide" className="text-civic-slate underline">
              Style &amp; content hub
            </Link>{" "}
            — voice + upcoming Spanish layer (root doc).
          </li>
          <li>
            <Link href="/admin/candidate-briefs" className="text-civic-slate underline">
              Candidate briefs
            </Link>{" "}
            — regional field briefs.
          </li>
        </ul>
      </section>
    </div>
  );
}
