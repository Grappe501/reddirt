import Link from "next/link";
import { notFound } from "next/navigation";

import { RelationalOrganizingAdminCard } from "@/components/admin/RelationalOrganizingAdminCard";
import { AdminProfileConversationToolsSection } from "@/components/message-engine/AdminProfileConversationToolsSection";
import { getRelationalContactDetail } from "@/lib/campaign-engine/relational-contacts";
import {
  formatRelationalClosenessForStaff,
  formatRelationalRelationshipTypeForStaff,
  mapRelationalRelationshipForMessageEngine,
} from "@/lib/campaign-engine/relational-message-context";
import { suggestVoterMatchesForRelationalContact } from "@/lib/campaign-engine/relational-matching";
import { relationalOrganizingSnapshotFromContactDetail } from "@/lib/campaign-engine/voter-relational-organizing";
import { buildAdminProfileConversationToolsPayload } from "@/lib/message-engine/admin-profile-conversation-tools";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminRelationalContactDetailPage({ params }: Props) {
  const { id } = await params;
  const contact = await getRelationalContactDetail(id);
  if (!contact) notFound();

  const suggestions = await suggestVoterMatchesForRelationalContact(id, 15);
  const organizingRow = relationalOrganizingSnapshotFromContactDetail(contact);

  const closenessLabel = formatRelationalClosenessForStaff(contact.relationshipCloseness);
  const countyLine = contact.county
    ? `${contact.county.displayName} (${contact.county.slug})`
    : "County not set on this REL-2 row";
  const relationshipContext = [
    `REL-2 relationship: ${formatRelationalRelationshipTypeForStaff(contact.relationshipType)}${
      closenessLabel ? ` · ${closenessLabel}` : ""
    }.`,
    `Place posture for scripts: ${countyLine}.`,
    "Use only what this person already chose to share with the listed organizer; conversation tools do not add new private facts.",
  ].join(" ");

  const pipelineBits = [`Organizing pipeline stage: ${organizingRow.pipelineStage}.`];
  if (contact.nextFollowUpAt) {
    pipelineBits.push(`Next follow-up on file: ${contact.nextFollowUpAt.toLocaleString()}.`);
  }
  const conversationPayload = buildAdminProfileConversationToolsPayload(
    {
      geographyScope: contact.county ? "county" : undefined,
      countyDisplayName: contact.county?.displayName,
      relationship: mapRelationalRelationshipForMessageEngine(contact.relationshipType),
    },
    {
      surface: "relational_contact",
      relationshipContext,
      pipelineSummary: pipelineBits.join(" "),
    },
  );

  return (
    <div className="max-w-4xl text-kelly-text">
      <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-navy/80">
        REL-2 · Contact
      </p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-heading text-3xl font-bold">{contact.displayName}</h1>
        <Link
          href="/admin/relational-contacts"
          className="text-sm font-medium text-kelly-navy underline-offset-2 hover:underline"
        >
          ← All contacts
        </Link>
      </div>
      <p className="mt-2 text-sm text-kelly-text/70">Id · {contact.id}</p>

      <section className="mt-8 space-y-2 rounded-card border border-kelly-text/10 bg-kelly-page p-6">
        <h2 className="font-heading text-lg font-bold">Basics</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-kelly-text/55">Owner</dt>
            <dd>{contact.owner.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-kelly-text/55">Names</dt>
            <dd>
              {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-kelly-text/55">Phone / email</dt>
            <dd>
              {contact.phone ?? "—"} · {contact.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-kelly-text/55">County / field</dt>
            <dd>
              {contact.county ? `${contact.county.displayName} (${contact.county.slug})` : "—"} ·{" "}
              {contact.fieldUnit ? contact.fieldUnit.name : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 space-y-4">
        <RelationalOrganizingAdminCard row={organizingRow} />
        <div className="space-y-2 rounded-card border border-kelly-text/10 p-6">
          <h2 className="font-heading text-lg font-bold">Relationship &amp; match</h2>
          <p className="text-sm">
            <span className="text-kelly-text/60">Relationship:</span> {contact.relationshipType}{" "}
            {contact.relationshipCloseness ? ` / ${contact.relationshipCloseness}` : ""}
          </p>
          <p className="text-sm">
            <span className="text-kelly-text/60">Match:</span> {contact.matchStatus}{" "}
            {contact.matchConfidence ? `· ${contact.matchConfidence}` : ""}
          </p>
          {contact.notes ? (
            <p className="mt-2 text-sm text-kelly-text/85">
              <span className="text-kelly-text/60">Notes:</span> {contact.notes}
            </p>
          ) : null}
          {contact.metadataJson != null ? (
            <pre className="mt-3 max-h-48 overflow-auto rounded border border-kelly-text/10 bg-kelly-text/5 p-3 font-mono text-xs">
              {JSON.stringify(contact.metadataJson, null, 2)}
            </pre>
          ) : null}
        </div>
      </section>

      <div className="mt-6">
        <AdminProfileConversationToolsSection payload={conversationPayload} />
      </div>

      <section className="mt-6 space-y-2 rounded-card border border-kelly-text/10 p-6">
        <h2 className="font-heading text-lg font-bold">Voter match</h2>
        {contact.matchedVoterRecord ? (
          <p className="text-sm">
            <span className="text-kelly-text/60">Matched record:</span>{" "}
            <Link
              className="text-kelly-navy underline-offset-2 hover:underline"
              href={`/admin/voters/${contact.matchedVoterRecord.id}/model`}
            >
              {contact.matchedVoterRecord.id.slice(0, 8)}…
            </Link>{" "}
            ({contact.matchedVoterRecord.countySlug})
          </p>
        ) : (
          <p className="text-sm text-kelly-text/70">No matched voter file row.</p>
        )}
        {suggestions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase text-kelly-text/55">Read-only suggestions (not applied)</p>
            <ul className="mt-2 space-y-1 text-sm">
              {suggestions.map((s) => (
                <li key={s.voterRecordId} className="font-mono text-xs text-kelly-text/85">
                  {s.voterFileKey} · {s.countySlug} · N:{s.reasons.nameMatch ? "Y" : "n"} C:
                  {s.reasons.countyMatch ? "Y" : "n"} P:{s.reasons.phoneMatch ? "Y" : "n"} · {s.voterRecordId}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-xs text-kelly-text/55">No conservative filename matches to show (or missing name/county/phone signals).</p>
        )}
      </section>

      <section className="mt-6 space-y-2 rounded-card border border-kelly-text/10 p-6">
        <h2 className="font-heading text-lg font-bold">Linked interactions</h2>
        {contact.voterInteractions.length === 0 ? (
          <p className="text-sm text-kelly-text/70">None</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {contact.voterInteractions.map((i) => (
              <li key={i.id} className="border-b border-kelly-text/10 pb-2">
                {i.interactionType} · {i.interactionChannel} · {i.interactionDate.toISOString().slice(0, 10)}
                {i.contactedBy ? ` · by ${i.contactedBy.email}` : ""}
                {i.notes ? <span className="mt-1 block text-xs text-kelly-text/70">{i.notes}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 space-y-2 rounded-card border border-kelly-text/10 p-6">
        <h2 className="font-heading text-lg font-bold">Linked signals</h2>
        {contact.voterSignals.length === 0 ? (
          <p className="text-sm text-kelly-text/70">None</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {contact.voterSignals.map((s) => (
              <li key={s.id} className="font-mono text-xs">
                {s.signalKind} · {s.signalStrength} · {s.confidence} · {s.id.slice(0, 8)}…
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
