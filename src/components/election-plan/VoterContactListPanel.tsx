import Link from "next/link";

import type { VoterContactRow } from "@/lib/election-plan/voter-contact/types";
import { VOTER_CONTACT_STATUSES } from "@/lib/election-plan/voter-contact/types";

type Props = {
  workbenchSlug: string;
  workbenchName: string;
  contacts: VoterContactRow[];
};

export function VoterContactListPanel({ workbenchSlug, workbenchName, contacts }: Props) {
  function statusLabel(status: string) {
    return VOTER_CONTACT_STATUSES.find((s) => s.value === status)?.label ?? status;
  }

  return (
    <div>
      <Link
        href={`/election-plan/workbenches/${workbenchSlug}`}
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← {workbenchName} workbench
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Voter contacts</p>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{workbenchName}</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{contacts.length} captured · convert to volunteer, donor, or leadership</p>
        </div>
        <Link
          href={`/election-plan/workbenches/${workbenchSlug}/capture`}
          className="inline-flex min-h-[48px] items-center rounded-lg bg-[var(--ep-navy)] px-5 py-2 text-sm font-bold uppercase tracking-wide text-white"
        >
          + Capture contact
        </Link>
      </div>

      {contacts.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-[var(--ep-border)] p-8 text-center text-sm text-[var(--ep-navy-muted)]">
          No contacts yet — use the capture page at tonight&apos;s house party.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {contacts.map((c) => (
            <li key={c.id}>
              <Link
                href={`/election-plan/workbenches/${workbenchSlug}/contacts/${c.id}`}
                className="ep-card flex flex-wrap items-center justify-between gap-3 transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
              >
                <div className="flex items-center gap-3">
                  {c.photoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.photoDataUrl}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ep-cream)] text-xs font-bold text-[var(--ep-navy-muted)]">
                      {c.firstName[0]}
                      {c.lastName[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[var(--ep-navy)]">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-xs text-[var(--ep-navy-muted)]">
                      {c.phone ?? c.email ?? "No phone/email"} · {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[var(--ep-gold)]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ep-navy)]">
                  {statusLabel(c.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
