import { notFound } from "next/navigation";

import { RelationalOrganizingAdminCard } from "@/components/admin/RelationalOrganizingAdminCard";
import { AdminProfileConversationToolsSection } from "@/components/message-engine/AdminProfileConversationToolsSection";
import { listVoterInteractions } from "@/lib/campaign-engine/voter-interactions";
import {
  formatCountySlugForConversationContext,
  formatRelationalClosenessForStaff,
  formatRelationalRelationshipTypeForStaff,
  mapRelationalRelationshipForMessageEngine,
} from "@/lib/campaign-engine/relational-message-context";
import { listRelationalOrganizingLinksForVoter } from "@/lib/campaign-engine/voter-relational-organizing";
import { getVoterModelProfile, listVoterSignals } from "@/lib/campaign-engine/voter-model-queries";
import { buildAdminProfileConversationToolsPayload } from "@/lib/message-engine/admin-profile-conversation-tools";

export const dynamic = "force-dynamic";

export default async function AdminVoterModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getVoterModelProfile(id);
  if (!profile) notFound();

  const [signals, interactions, relationalLinks] = await Promise.all([
    listVoterSignals(id),
    listVoterInteractions(id),
    listRelationalOrganizingLinksForVoter(id),
  ]);

  const name = [profile.voter.firstName, profile.voter.lastName].filter(Boolean).join(" ") || "—";

  const countyDisplay = formatCountySlugForConversationContext(profile.voter.countySlug);
  const primaryLink = relationalLinks[0];
  const primaryCloseness = primaryLink
    ? formatRelationalClosenessForStaff(primaryLink.relationshipCloseness)
    : null;
  const relationshipContext = primaryLink
    ? [
        `This voter file row links to REL-2: ${formatRelationalRelationshipTypeForStaff(primaryLink.relationshipType)}${
          primaryCloseness ? ` · ${primaryCloseness}` : ""
        }.`,
        relationalLinks.length > 1
          ? `${relationalLinks.length} REL-2 records match this file row — confirm the active organizer before using personal detail.`
          : "One REL-2 record matches this file row.",
        `County label from file (for local examples only): ${countyDisplay}.`,
        "Classifications and signals on this page are operational modeling — do not repeat them as facts in conversation.",
      ].join(" ")
    : [
        "No REL-2 contact linked to this voter file row.",
        `County label from file (for local examples only): ${countyDisplay}.`,
        "Scripts stay generic until a trusted organizer owns the relationship in REL-2.",
      ].join(" ");

  const pipelineSummary = primaryLink
    ? `Organizing pipeline: ${primaryLink.pipelineStage}.${
        primaryLink.activity.nextFollowUpAt
          ? ` Next follow-up: ${primaryLink.activity.nextFollowUpAt.toLocaleString()}.`
          : ""
      }`
    : "Create or link REL-2 coverage before assigning relational pipeline steps.";

  const conversationPayload = buildAdminProfileConversationToolsPayload(
    {
      geographyScope: "county",
      countyDisplayName: countyDisplay,
      relationship: primaryLink
        ? mapRelationalRelationshipForMessageEngine(primaryLink.relationshipType)
        : undefined,
    },
    {
      surface: "voter_model",
      relationshipContext,
      pipelineSummary,
    },
  );

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-2xl font-bold text-kelly-text">Voter model (read-only)</h1>
      <p className="mt-2 font-body text-sm text-kelly-text/75">
        <strong className="text-kelly-text">Provisional layer.</strong> Classifications and signals are campaign modeling
        outputs, not SOS truth and not vote totals. Human-confirmed fields are stronger evidence but still not
        guaranteed votes.
      </p>

      <section className="mt-6 rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-semibold text-kelly-text">Identity</h2>
        <dl className="mt-3 grid gap-2 text-sm text-kelly-text/90 sm:grid-cols-2">
          <div>
            <dt className="text-kelly-text/55">Name</dt>
            <dd>{name}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">Voter file key</dt>
            <dd className="font-mono text-xs">{profile.voter.voterFileKey}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">County</dt>
            <dd>{profile.voter.countySlug}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">Precinct</dt>
            <dd>{profile.voter.precinct ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-kelly-text/55">In latest completed file</dt>
            <dd>{profile.voter.inLatestCompletedFile ? "yes" : "no"}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-kelly-text">Relational organizing</h2>
          <p className="mt-1 text-xs text-kelly-text/60">
            REL-2 + Power of 5 context when this voter is matched to a relational contact. Shown only in admin — never on public pages.
          </p>
        </div>
        {relationalLinks.length === 0 ? (
          <p className="rounded-card border border-kelly-text/10 bg-kelly-page p-4 text-sm text-kelly-text/70">
            No relational contact matched to this voter file row. Link a REL-2 record from the contact detail page when appropriate.
          </p>
        ) : (
          <div className="space-y-4">
            {relationalLinks.map((row) => (
              <RelationalOrganizingAdminCard key={row.relationalContactId} row={row} showRelationalContactLink />
            ))}
          </div>
        )}
      </section>

      <div className="mt-6">
        <AdminProfileConversationToolsSection payload={conversationPayload} />
      </div>

      <section className="mt-6 rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-semibold text-kelly-text">Current classification</h2>
        {profile.currentClassification ? (
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-kelly-text/90">
            <li>
              Tier: <span className="font-medium">{profile.currentClassification.classification}</span> · confidence{" "}
              {profile.currentClassification.confidence}
            </li>
            <li>Generated by: {profile.currentClassification.generatedBy}</li>
            <li>Model version: {profile.currentClassification.modelVersion}</li>
            {profile.currentClassification.sourceSummary ? (
              <li className="list-none pl-0">
                <span className="text-kelly-text/55">Summary: </span>
                {profile.currentClassification.sourceSummary}
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-kelly-text/60">No current classification row.</p>
        )}
      </section>

      <section className="mt-6 rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-semibold text-kelly-text">Signals by kind</h2>
        {Object.keys(profile.signalCountByKind).length === 0 ? (
          <p className="mt-3 text-sm text-kelly-text/60">No signals for this voter.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm text-kelly-text/90">
            {Object.entries(profile.signalCountByKind).map(([kind, n]) => (
              <li key={kind}>
                {kind}: {n}
              </li>
            ))}
          </ul>
        )}
        {signals.length > 0 ? (
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-kelly-text/80">Raw signal rows ({signals.length})</summary>
            <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto font-mono text-xs text-kelly-text/85">
              {signals.map((s) => (
                <li key={s.id} className="rounded border border-kelly-text/10 bg-kelly-wash/80 px-2 py-1">
                  {s.signalKind} · {s.signalStrength} · {s.confidence}
                  {s.signalDate ? ` · ${s.signalDate.toISOString()}` : ""}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>

      <section className="mt-6 rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-semibold text-kelly-text">Vote plan (latest)</h2>
        {profile.latestVotePlan ? (
          <p className="mt-3 text-sm text-kelly-text/90">
            Status <span className="font-medium">{profile.latestVotePlan.planStatus}</span> · updated{" "}
            {profile.latestVotePlan.updatedAt.toLocaleString()}
          </p>
        ) : (
          <p className="mt-3 text-sm text-kelly-text/60">No vote plan row.</p>
        )}
      </section>

      <section className="mt-6 rounded-card border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-semibold text-kelly-text">Interactions ({interactions.length})</h2>
        {interactions.length === 0 ? (
          <p className="mt-3 text-sm text-kelly-text/60">No logged interactions.</p>
        ) : (
          <ul className="mt-3 max-h-96 space-y-3 overflow-y-auto text-sm text-kelly-text/90">
            {interactions.map((i) => (
              <li key={i.id} className="rounded border border-kelly-text/10 bg-kelly-wash/80 px-3 py-2">
                <p className="font-medium text-kelly-text">
                  {i.interactionType} · {i.interactionChannel}
                </p>
                <p className="text-xs text-kelly-text/65">{i.interactionDate.toLocaleString()}</p>
                {i.supportLevel ? (
                  <p className="mt-1 text-xs">
                    Support recorded: <span className="font-medium">{i.supportLevel}</span>
                  </p>
                ) : null}
                {i.notes ? (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-kelly-text/80">{i.notes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
