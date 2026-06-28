"use client";

import { useState, useTransition } from "react";

import { EpButton } from "@/components/election-plan/ui/EpButton";
import { provisionVolunteerBoardAction } from "@/app/election-plan/operators/volunteer-board-actions";

export function VolunteerBoardProvisionPanel() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    inviteUrl: string | null;
    created: boolean;
    email: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="mt-10 rounded-xl border border-[var(--ep-navy)]/15 bg-white p-6">
      <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Add volunteer to roster</h2>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Creates User + VolunteerProfile and returns an invite link for their personal board. Pre-fill what you know —
        they complete onboarding on first visit.
      </p>

      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setResult(null);
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            try {
              const res = await provisionVolunteerBoardAction(fd);
              setResult({
                inviteUrl: res.inviteUrl,
                created: res.created,
                email: String(fd.get("email") ?? ""),
              });
              e.currentTarget.reset();
            } catch {
              setError("Could not provision volunteer — check email and try again.");
            }
          });
        }}
      >
        <label className="block sm:col-span-2">
          <span className="ep-input-label">Email (required)</span>
          <input type="email" name="email" required className="ep-input" />
        </label>
        <label className="block">
          <span className="ep-input-label">Name</span>
          <input type="text" name="name" className="ep-input" />
        </label>
        <label className="block">
          <span className="ep-input-label">Mobile</span>
          <input type="tel" name="phone" className="ep-input" />
        </label>
        <label className="block">
          <span className="ep-input-label">ZIP</span>
          <input type="text" name="zip" className="ep-input" />
        </label>
        <label className="block">
          <span className="ep-input-label">County</span>
          <input type="text" name="county" className="ep-input" />
        </label>
        <div className="sm:col-span-2">
          <EpButton type="submit" disabled={pending} size="md">
            {pending ? "Saving…" : "Create board & invite link"}
          </EpButton>
        </div>
      </form>

      {error ? <p className="ep-warning mt-3 text-sm">{error}</p> : null}
      {result?.inviteUrl ? (
        <div className="mt-4 rounded-lg bg-[var(--ep-cream)] p-4 text-sm">
          <p className="font-semibold text-[var(--ep-navy)]">
            {result.created ? "Created" : "Updated"} board for {result.email}
          </p>
          <p className="mt-2 break-all text-xs text-[var(--ep-navy-muted)]">{result.inviteUrl}</p>
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
            Or they can sign in at <strong>/volunteers/sign-in</strong> with email + campaign password.
          </p>
        </div>
      ) : null}
    </section>
  );
}
