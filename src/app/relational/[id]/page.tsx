import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRelationalUserPage } from "@/lib/campaign/relational-user-session";
import { getRelationalContactDetailForOwner } from "@/lib/campaign-engine/relational-contacts";
import { findPotentialDuplicates } from "@/lib/campaign-engine/relational-dedupe";
import { suggestVoterMatchesForRelationalContact } from "@/lib/campaign-engine/relational-matching";
import { prisma } from "@/lib/db";
import { RelationalRelationshipType, VoterInteractionChannel, VoterInteractionType } from "@prisma/client";

import { recordRelationalTouchUserAction, updateRelationalContactUserAction } from "../actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; touched?: string }>;
};

export default async function RelationalContactDetailPage({ params, searchParams }: Props) {
  const userId = await requireRelationalUserPage();
  const { id } = await params;
  const sp = await searchParams;

  const contact = await getRelationalContactDetailForOwner(id, userId);
  if (!contact) notFound();

  const [suggestions, dupIds] = await Promise.all([
    suggestVoterMatchesForRelationalContact(id, 12),
    findPotentialDuplicates(id, userId),
  ]);
  const dupRows =
    dupIds.length > 0
      ? await prisma.relationalContact.findMany({
          where: { id: { in: dupIds } },
          select: { id: true, displayName: true },
        })
      : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-dirt/80">REL-3</p>
          <h1 className="font-heading text-3xl font-bold">{contact.displayName}</h1>
          <p className="mt-1 text-sm text-deep-soil/60">
            {contact.matchStatus} · {contact.isCoreFive ? `Core five slot ${contact.powerOfFiveSlot ?? "—"}` : "Not in core five"}
          </p>
        </div>
        <Link href="/relational" className="text-sm text-red-dirt hover:underline">
          ← All people
        </Link>
      </div>

      {sp.error ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {(() => {
            try {
              return decodeURIComponent(sp.error);
            } catch {
              return sp.error;
            }
          })()}
        </p>
      ) : null}
      {sp.saved ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Saved.
        </p>
      ) : null}
      {sp.touched ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Touch logged.
        </p>
      ) : null}

      {dupRows.length > 0 ? (
        <p className="rounded border border-amber-300 bg-amber-50/80 px-3 py-2 text-sm text-amber-950">
          <strong>Possible duplicate found</strong> — you have other contacts that share phone,
          email, or a similar name. This is a signal only; nothing was merged. Review:{" "}
          {dupRows.map((d) => (
            <span key={d.id} className="inline-block after:content-[',_'] last:after:content-['']">
              <Link href={`/relational/${d.id}`} className="font-medium text-red-dirt underline">
                {d.displayName}
              </Link>
            </span>
          ))}
        </p>
      ) : null}

      <section className="space-y-4 rounded-card border border-deep-soil/10 p-6">
        <h2 className="font-heading text-lg font-bold">Edit</h2>
        <form action={updateRelationalContactUserAction.bind(null, id)} className="space-y-3">
          <label className="block text-sm">
            <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Name</span>
            <input
              name="displayName"
              required
              defaultValue={contact.displayName}
              className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">First</span>
              <input
                name="firstName"
                defaultValue={contact.firstName ?? ""}
                className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Last</span>
              <input
                name="lastName"
                defaultValue={contact.lastName ?? ""}
                className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Phone</span>
            <input
              name="phone"
              defaultValue={contact.phone ?? ""}
              className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={contact.email ?? ""}
              className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Relationship</span>
            <select
              name="relationshipType"
              className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
              defaultValue={contact.relationshipType}
            >
              {Object.values(RelationalRelationshipType).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Notes</span>
            <textarea
              name="notes"
              rows={3}
              defaultValue={contact.notes ?? ""}
              className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
            />
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isCoreFive"
                defaultChecked={contact.isCoreFive}
                className="rounded border-deep-soil/30"
              />
              <span>Core five</span>
            </label>
            <label className="block text-sm">
              <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Slot 1–5</span>
              <input
                name="powerOfFiveSlot"
                type="number"
                min={1}
                max={5}
                defaultValue={contact.powerOfFiveSlot ?? ""}
                className="mt-1 w-24 rounded border border-deep-soil/15 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="submit"
            className="rounded bg-red-dirt px-4 py-2 text-sm font-semibold text-cream-canvas"
          >
            Save changes
          </button>
        </form>
      </section>

      <section className="space-y-2 rounded-card border border-deep-soil/10 p-6">
        <h2 className="font-heading text-lg font-bold">Suggested file matches (read-only)</h2>
        <p className="text-xs text-deep-soil/60">
          Suggestions are not auto-applied. Ask an admin to link a voter if needed.
        </p>
        {suggestions.length === 0 ? (
          <p className="text-sm text-deep-soil/55">No suggestions from current fields.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {suggestions.map((s) => (
              <li key={s.voterRecordId} className="rounded border border-deep-soil/10 px-3 py-2">
                {s.voterFileKey} · {s.countySlug} · {s.firstName} {s.lastName}{" "}
                <span className="text-deep-soil/50">(candidates, not a match)</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-card border border-deep-soil/10 p-6">
        <h2 className="font-heading text-lg font-bold">Interactions</h2>
        {contact.voterInteractions.length === 0 ? (
          <p className="text-sm text-deep-soil/55">No interactions logged yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {contact.voterInteractions.map((vi) => (
              <li key={vi.id} className="border-b border-deep-soil/10 pb-2">
                <span className="text-deep-soil/60">
                  {vi.interactionDate.toLocaleString()} · {vi.interactionType} · {vi.interactionChannel}
                </span>
                {vi.notes ? <p className="mt-0.5">{vi.notes}</p> : null}
              </li>
            ))}
          </ul>
        )}

        <h3 className="pt-2 text-sm font-bold">Log interaction</h3>
        <p className="text-xs text-deep-soil/60">
          Notes are required for logging when there is no matched voter (campaign rule).
        </p>
        <form action={recordRelationalTouchUserAction.bind(null, id)} className="space-y-2">
          <label className="block text-sm">
            <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Notes *</span>
            <textarea
              name="notes"
              required
              rows={2}
              className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Type</span>
              <select
                name="interactionType"
                className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
                defaultValue={VoterInteractionType.OTHER}
              >
                {Object.values(VoterInteractionType).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-[10px] font-bold uppercase tracking-wide text-deep-soil/55">Channel</span>
              <select
                name="channel"
                className="mt-1 w-full rounded border border-deep-soil/15 px-3 py-2 text-sm"
                defaultValue={VoterInteractionChannel.IN_PERSON}
              >
                {Object.values(VoterInteractionChannel).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            className="rounded border border-deep-soil/20 px-3 py-2 text-sm font-semibold hover:bg-deep-soil/5"
          >
            Log interaction
          </button>
        </form>
      </section>
    </div>
  );
}
