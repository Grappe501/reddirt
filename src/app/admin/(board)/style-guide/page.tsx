import Link from "next/link";

const REPO = "https://github.com/Grappe501/reddirt-site";

type HubItem = {
  label: string;
  note: string;
  file?: string;
  href?: string;
};

const HUB: HubItem[] = [
  {
    label: "Public copy discipline",
    file: "docs/REDDIRT_PUBLIC_COPY_GUIDE.md",
    note: "No maintainer paths, no opponent name on palm cards without Steve, gate labels for data-dependent copy.",
  },
  {
    label: "Safe snippets (curated)",
    file: "docs/content/KELLY_SOS_SAFE_PUBLIC_COPY_SNIPPETS.md",
    note: "Short approved blocks for reuse.",
  },
  {
    label: "Brand + engine firewall (repo root)",
    file: "../brands/kelly-grappe-sos/ (from RedDirt; workspace root brands/)",
    note: "Public surface decisions; keep AJAX / PhatLip / county workbench out of Kelly bundles.",
  },
  {
    label: "Candidate briefs (CM)",
    href: "/admin/candidate-briefs",
    note: "Dense regional briefs from docs/briefs — rendered in admin; source markdown in repo.",
  },
  {
    label: "County brief rollout (75 counties)",
    file: "docs/briefs/COUNTY_CANDIDATE_BRIEF_75_COUNTY_ROLLOUT.md",
    note: "How we scale the same pattern as Pope and NWA — data, comms, and staff gates.",
  },
  {
    label: "Comms & follow-up (Day 4)",
    file: "docs/KELLY_SOS_COMMS_READINESS.md",
    note: "Intake → WorkflowIntake → workbench; SendGrid/Twilio env names; manual fallback; SLA placeholders.",
  },
  {
    label: "Community equity (Hispanic, Marshallese, Muslim)",
    file: "docs/campaign-ops/COMMUNITY_EQUITY_OUTREACH_MASTER_PLAN.md",
    note: "Full outreach plan; Muslim 25K/10K goals; Get Loud; mosque polling → Calendar MEETING + s4_event_faith_venue_polling_v1.",
  },
];

const UI = [
  { label: "Tailwind + design tokens", note: "globals.css, tailwind.config — cream canvas, red dirt, deep soil, civic slate." },
  { label: "Layout primitives", note: "SiteHeader, SiteFooter, CampaignPaidForBar — keep tap targets min-h-11 on mobile." },
  { label: "Admin shell", note: "AdminBoardShell — operations vs site content vs orchestrator groupings." },
] as const;

export default function AdminStyleGuideHubPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-deep-soil">Style & content hub</h1>
      <p className="mt-3 font-body text-sm text-deep-soil/75">
        One place for <strong>voice</strong>, <strong>governance</strong>, and <strong>UI patterns</strong> for Kelly SOS — not a
        full Storybook. Paths are repo-relative (open in your editor or GitHub).
      </p>

      <section className="mt-8" id="comms">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Comms &amp; public intake (ops)</h2>
        <p className="mt-2 text-sm text-deep-soil/70">
          Full runbook: <code className="text-xs">docs/KELLY_SOS_COMMS_READINESS.md</code> — workbench, webhooks, 24h follow-up
          expectations on form success, and what happens when API keys are missing.
        </p>
      </section>

      <section className="mt-8" id="public">
        <h2 className="font-heading text-lg font-bold text-deep-soil">Content &amp; brand</h2>
        <ul className="mt-3 space-y-2">
          {HUB.map((item) => (
            <li
              key={item.label}
              className="rounded-md border border-deep-soil/10 bg-cream-canvas/90 px-4 py-3 text-sm text-deep-soil/85"
            >
              <div className="font-semibold text-deep-soil">
                {item.href ? (
                  <Link href={item.href} className="text-civic-slate underline">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </div>
              {"file" in item && (
                <p className="mt-1 font-mono text-[11px] text-deep-soil/55">
                  {item.file}
                </p>
              )}
              <p className="mt-1 text-deep-soil/70">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-bold text-deep-soil">UI &amp; code</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-deep-soil/75">
          {UI.map((u) => (
            <li key={u.label}>
              <strong className="text-deep-soil">{u.label}.</strong> {u.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-md border border-deep-soil/10 bg-deep-soil/[0.03] px-4 py-3 text-sm text-deep-soil/70">
        <strong className="text-deep-soil">Bilingual (future):</strong> see workspace{" "}
        <code className="text-xs">HISPANIC_SPANISH_LOCALE_LAYER_PLAN.md</code> (repo root) for the Spanish toggle layer; glossary
        and <code className="text-xs">es-US</code> copy review before shipping voter-facing legal lines.
      </section>

      <p className="mt-6 text-xs text-deep-soil/50">
        Repo pointer (if mirrored): <span className="font-mono">{REPO}</span> — match branch to your deploy.
      </p>
    </div>
  );
}
