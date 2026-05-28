"use client";

import type { KimHammerStrategicBriefingSections } from "@/lib/opposition/kimHammerBriefingTypes";

type KimHammerStrategicBriefingPanelProps = {
  strategicBriefing: KimHammerStrategicBriefingSections;
  governanceStatus?: string;
};

function Section({
  title,
  items,
}: {
  title: string;
  items: string[] | undefined;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-lg border border-kelly-text/10 bg-white p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-kelly-navy">{title}</h3>
      <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-kelly-muted">
        {items.map((item) => (
          <li key={item.slice(0, 48)}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function KimHammerStrategicBriefingPanel({
  strategicBriefing,
  governanceStatus,
}: KimHammerStrategicBriefingPanelProps) {
  const alignment = strategicBriefing.campaignAlignment;

  return (
    <section className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">
          Strategic messaging intelligence
        </h2>
        {governanceStatus ? (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
            {governanceStatus.replaceAll("_", " ")}
          </span>
        ) : null}
      </div>
      <p className="max-w-4xl text-sm text-kelly-muted">
        How to message, when to deploy in debate, how to set up follow-up questions, and how this
        supports Kelly&apos;s doctrine — without weakening publication-safety discipline.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="How do we use this to message?" items={strategicBriefing.howToMessage} />
        <Section title="How can this impact the debate?" items={strategicBriefing.debateImpact} />
        <Section title="Where & when to use" items={strategicBriefing.whenToUse} />
        <Section title="When not to use" items={strategicBriefing.whenNotToUse} />
        <Section title="Set up the opposition in debate" items={strategicBriefing.oppositionSetup} />
        <Section title="How this helps our message" items={strategicBriefing.kellyMessageHelp} />
      </div>

      {alignment ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Section title="Aligns with Kelly campaign ideals" items={alignment.alignsWithKelly} />
          <Section title="Conflicts with direct democracy / rights posture" items={alignment.conflictsWithKelly} />
          <Section title="Neutral / contextual" items={alignment.neutralOrContextual} />
        </div>
      ) : null}
    </section>
  );
}
