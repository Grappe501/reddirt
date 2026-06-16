"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  VOTER_CONTACT_STATUSES,
  type VoterContactRow,
  type VoterContactStatus,
} from "@/lib/election-plan/voter-contact/types";
import { cn } from "@/lib/utils";

type Props = {
  contact: VoterContactRow;
  operatorInitials: string | null;
  workbenchSlug: string;
};

function statusLabel(status: VoterContactStatus) {
  return VOTER_CONTACT_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function VoterContactDetailPanel({ contact, operatorInitials, workbenchSlug }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(contact.status);
  const [notes, setNotes] = useState(contact.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(updates: Record<string, unknown>) {
    if (!operatorInitials) {
      setError("Sign in with operator initials to update.");
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/election-plan/voter-contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contact.id, ...updates }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  const convertButtons: Array<{ status: VoterContactStatus; label: string }> = [
    { status: "converted_volunteer", label: "→ Volunteer page" },
    { status: "converted_donor", label: "→ Donor page" },
    { status: "converted_leader", label: "→ Leadership page" },
  ];

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/election-plan/workbenches/${workbenchSlug}/contacts`}
        className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
      >
        ← All contacts
      </Link>

      <div className="mt-4 flex flex-wrap items-start gap-4">
        {contact.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={contact.photoDataUrl}
            alt={`${contact.firstName} ${contact.lastName}`}
            className="h-40 w-40 rounded-lg border-2 border-[var(--ep-border)] object-cover"
          />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-[var(--ep-cream)] text-sm text-[var(--ep-navy-muted)]">
            No photo
          </div>
        )}
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">
            {contact.firstName} {contact.lastName}
          </h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Captured {new Date(contact.createdAt).toLocaleString()} · [{contact.operatorInitials}]
          </p>
          {contact.eventLabel ? (
            <p className="mt-1 text-sm font-semibold text-[var(--ep-navy)]">{contact.eventLabel}</p>
          ) : null}
          <span className="mt-2 inline-block rounded-full bg-[var(--ep-gold)]/20 px-3 py-1 text-xs font-bold uppercase text-[var(--ep-navy)]">
            {statusLabel(status)}
          </span>
        </div>
      </div>

      <div className="mt-6 ep-card space-y-2 text-sm">
        {contact.phone ? (
          <p>
            <span className="font-semibold">Phone:</span>{" "}
            <a href={`tel:${contact.phone}`} className="text-[var(--ep-navy)] underline">
              {contact.phone}
            </a>
          </p>
        ) : null}
        {contact.email ? (
          <p>
            <span className="font-semibold">Email:</span>{" "}
            <a href={`mailto:${contact.email}`} className="text-[var(--ep-navy)] underline">
              {contact.email}
            </a>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-2">
          {contact.interestVolunteer ? (
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">Volunteer</span>
          ) : null}
          {contact.interestDonor ? (
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900">Donor</span>
          ) : null}
          {contact.interestLeadership ? (
            <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-900">Leadership</span>
          ) : null}
          {contact.interestHost ? (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Host</span>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Convert pathway</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {convertButtons.map((btn) => (
            <button
              key={btn.status}
              type="button"
              disabled={busy || !operatorInitials || status === btn.status}
              onClick={() => {
                setStatus(btn.status);
                void save({ status: btn.status });
              }}
              className={cn(
                "min-h-[44px] rounded-lg border-2 px-4 py-2 text-sm font-semibold",
                status === btn.status
                  ? "border-[var(--ep-navy)] bg-[var(--ep-navy)] text-white"
                  : "border-[var(--ep-border)] text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]",
                "disabled:opacity-50",
              )}
            >
              {btn.label}
            </button>
          ))}
          <button
            type="button"
            disabled={busy || !operatorInitials}
            onClick={() => {
              setStatus("follow_up");
              void save({ status: "follow_up" });
            }}
            className="min-h-[44px] rounded-lg border-2 border-amber-400 px-4 py-2 text-sm font-semibold text-amber-900"
          >
            Mark follow-up
          </button>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-bold uppercase tracking-wide text-[var(--ep-navy-muted)]">Notes</label>
        <textarea
          className="mt-1 w-full rounded-lg border-2 border-[var(--ep-border)] px-4 py-3 text-sm"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          type="button"
          disabled={busy || !operatorInitials}
          onClick={() => void save({ notes })}
          className="mt-2 rounded-lg bg-[var(--ep-navy)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save notes
        </button>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
      {saved ? <p className="mt-3 text-sm font-semibold text-emerald-700">Saved.</p> : null}

      <Link
        href={`/election-plan/workbenches/${workbenchSlug}/capture`}
        className="mt-8 inline-flex min-h-[48px] items-center text-sm font-semibold text-[var(--ep-navy)] underline"
      >
        + Capture another contact
      </Link>
    </div>
  );
}
