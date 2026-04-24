import Link from "next/link";
import { notFound } from "next/navigation";

import { getRelationalContactDetail } from "@/lib/campaign-engine/relational-contacts";
import { suggestVoterMatchesForRelationalContact } from "@/lib/campaign-engine/relational-matching";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminRelationalContactDetailPage({ params }: Props) {
  const { id } = await params;
  const contact = await getRelationalContactDetail(id);
  if (!contact) notFound();

  const suggestions = await suggestVoterMatchesForRelationalContact(id, 15);

  return (
    <div className="max-w-4xl text-deep-soil">
      <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-red-dirt/80">
        REL-2 · Contact
      </p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-heading text-3xl font-bold">{contact.displayName}</h1>
        <Link
          href="/admin/relational-contacts"
          className="text-sm font-medium text-red-dirt underline-offset-2 hover:underline"
        >
          ← All contacts
        </Link>
      </div>
      <p className="mt-2 text-sm text-deep-soil/70">Id · {contact.id}</p>

      <section className="mt-8 space-y-2 rounded-card border border-deep-soil/10 bg-cream-canvas p-6">
        <h2 className="font-heading text-lg font-bold">Basics</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-deep-soil/55">Owner</dt>
            <dd>{contact.owner.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-deep-soil/55">Names</dt>
            <dd>
              {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-deep-soil/55">Phone / email</dt>
            <dd>
              {contact.phone ?? "—"} · {contact.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-deep-soil/55">County / field</dt>
            <dd>
              {contact.county ? `${contact.county.displayName} (${contact.county.slug})` : "—"} ·{" "}
              {contact.fieldUnit ? contact.fieldUnit.name : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 space-y-2 rounded-card border border-deep-soil/10 p-6">
        <h2 className="font-heading text-lg font-bold">Organizing</h2>
        <p className="text-sm">
          <span className="text-deep-soil/60">Relationship:</span> {contact.relationshipType}{" "}
          {contact.relationshipCloseness ? ` / ${contact.relationshipCloseness}` : ""}
        </p>
        <p className="text-sm">
          <span className="text-deep-soil/60">Match:</span> {contact.matchStatus}{" "}
          {contact.matchConfidence ? `· ${contact.matchConfidence}` : ""}
        </p>
        <p className="text-sm">
          <span className="text-deep-soil/60">Organizing status:</span> {contact.organizingStatus}
        </p>
        <p className="text-sm">
          <span className="text-deep-soil/60">Core five:</span> {contact.isCoreFive ? "yes" : "no"}{" "}
          {contact.powerOfFiveSlot != null ? `· slot ${contact.powerOfFiveSlot}` : ""}
        </p>
        {contact.notes ? (
          <p className="mt-2 text-sm text-deep-soil/85">
            <span className="text-deep-soil/60">Notes:</span> {contact.notes}
          </p>
        ) : null}
        {contact.metadataJson != null ? (
          <pre className="mt-3 max-h-48 overflow-auto rounded border border-deep-soil/10 bg-deep-soil/5 p-3 font-mono text-xs">
            {JSON.stringify(contact.metadataJson, null, 2)}
          </pre>
        ) : null}
      </section>

      <section className="mt-6 space-y-2 rounded-card border border-deep-soil/10 p-6">
        <h2 className="font-heading text-lg font-bold">Voter match</h2>
        {contact.matchedVoterRecord ? (
          <p className="text-sm">
            <span className="text-deep-soil/60">Matched record:</span>{" "}
            <Link
              className="text-red-dirt underline-offset-2 hover:underline"
              href={`/admin/voters/${contact.matchedVoterRecord.id}/model`}
            >
              {contact.matchedVoterRecord.id.slice(0, 8)}…
            </Link>{" "}
            ({contact.matchedVoterRecord.countySlug})
          </p>
        ) : (
          <p className="text-sm text-deep-soil/70">No matched voter file row.</p>
        )}
        {suggestions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase text-deep-soil/55">Read-only suggestions (not applied)</p>
            <ul className="mt-2 space-y-1 text-sm">
              {suggestions.map((s) => (
                <li key={s.voterRecordId} className="font-mono text-xs text-deep-soil/85">
                  {s.voterFileKey} · {s.countySlug} · N:{s.reasons.nameMatch ? "Y" : "n"} C:
                  {s.reasons.countyMatch ? "Y" : "n"} P:{s.reasons.phoneMatch ? "Y" : "n"} · {s.voterRecordId}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-xs text-deep-soil/55">No conservative filename matches to show (or missing name/county/phone signals).</p>
        )}
      </section>

      <section className="mt-6 space-y-2 rounded-card border border-deep-soil/10 p-6">
        <h2 className="font-heading text-lg font-bold">Linked interactions</h2>
        {contact.voterInteractions.length === 0 ? (
          <p className="text-sm text-deep-soil/70">None</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {contact.voterInteractions.map((i) => (
              <li key={i.id} className="border-b border-deep-soil/10 pb-2">
                {i.interactionType} · {i.interactionChannel} · {i.interactionDate.toISOString().slice(0, 10)}
                {i.contactedBy ? ` · by ${i.contactedBy.email}` : ""}
                {i.notes ? <span className="mt-1 block text-xs text-deep-soil/70">{i.notes}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 space-y-2 rounded-card border border-deep-soil/10 p-6">
        <h2 className="font-heading text-lg font-bold">Linked signals</h2>
        {contact.voterSignals.length === 0 ? (
          <p className="text-sm text-deep-soil/70">None</p>
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
