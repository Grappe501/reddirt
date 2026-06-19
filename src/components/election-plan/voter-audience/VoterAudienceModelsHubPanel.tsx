import Link from "next/link";

import { KellyPageSummary } from "@/components/election-plan/KellyPageSummary";
import { VoterAudienceAvatar } from "@/components/election-plan/voter-audience/VoterAudienceAvatar";
import { epVoterAudienceProfileHref } from "@/lib/election-plan/debate-prep-links";
import {
  listVoterAudienceProfiles,
  voterAudienceModelsMeta,
} from "@/lib/election-plan/voter-audience-models/load";

export function VoterAudienceModelsHubPanel() {
  const meta = voterAudienceModelsMeta();
  const profiles = listVoterAudienceProfiles();

  return (
    <>
      <KellyPageSummary summary={meta.pageSummary} />

      <article className="ep-card mb-6 p-5 text-sm text-[var(--ep-navy-muted)]">
        <p className="text-xs font-bold uppercase text-[var(--ep-navy)]">Where these live</p>
        <p className="mt-2 leading-relaxed">
          Named fictional personas in{" "}
          <code className="rounded bg-[var(--ep-cream)] px-1 text-xs">data/campaign-brain/kelly-voter-audience-models.json</code>{" "}
          — built from seeds, city intelligence, and aggregate SOS registration mix. Not voter-file rows. Use them in
          debate prep, county playbooks, and message work all campaign.
        </p>
        <p className="mt-2 text-xs">{meta.modelNote}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          {meta.profileCount} personas · {meta.countyCount} county overlays · {meta.cityCount} city overlays · built{" "}
          {new Date(meta.builtAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
        </p>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <Link
            key={p.id}
            href={epVoterAudienceProfileHref(p.id)}
            className="ep-card block p-5 transition hover:border-[var(--ep-gold)]"
          >
            <div className="flex items-start gap-3">
              <VoterAudienceAvatar profile={p} size="lg" />
              <div className="min-w-0">
                <p className="font-heading text-lg font-bold text-[var(--ep-navy)]">{p.displayName}</p>
                <p className="text-xs font-bold uppercase text-violet-900">{p.segmentLabel}</p>
                <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{p.tagline}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">{p.demographicSketch}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
