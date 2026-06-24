"use client";

import Link from "next/link";

import { EpButton } from "@/components/election-plan/ui/EpButton";
import { VOLUNTEER_BOARD_ACTIVITY_OPTIONS } from "@/lib/volunteers/board/constants";
import { completeVolunteerBoardOnboardingAction } from "@/lib/volunteers/board/volunteer-board-actions";
import type { VolunteerBoardSnapshot } from "@/lib/volunteers/board/load-volunteer-board";

type Props = {
  snapshot: VolunteerBoardSnapshot;
  error?: string | null;
};

export function VolunteerBoardOnboardingWizard({ snapshot, error }: Props) {
  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ep-navy-muted)]">
        Welcome, {snapshot.displayName}
      </p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">Set up your volunteer board</h1>
      <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
        We pre-filled what we know. Confirm contact info, tell us where you are, and pick how you want to help — then
        your board unlocks.
      </p>

      {error === "email" ? (
        <p className="ep-warning mt-4 text-sm">Enter a valid email address.</p>
      ) : null}
      {error === "activities" ? (
        <p className="ep-warning mt-4 text-sm">Pick at least one way you want to help.</p>
      ) : null}

      <form action={completeVolunteerBoardOnboardingAction} className="mt-6 space-y-5">
        <label className="block">
          <span className="ep-input-label">Email</span>
          <input type="email" name="email" required defaultValue={snapshot.email} className="ep-input" />
        </label>
        <label className="block">
          <span className="ep-input-label">Mobile (text)</span>
          <input
            type="tel"
            name="phone"
            defaultValue={snapshot.phone ?? ""}
            placeholder="501-555-0100"
            className="ep-input"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="ep-input-label">ZIP</span>
            <input type="text" name="zip" defaultValue={snapshot.zip ?? ""} className="ep-input" />
          </label>
          <label className="block">
            <span className="ep-input-label">County</span>
            <input type="text" name="county" defaultValue={snapshot.county ?? ""} className="ep-input" />
          </label>
        </div>

        <fieldset>
          <legend className="ep-input-label">How do you want to help?</legend>
          <div className="mt-2 space-y-2">
            {VOLUNTEER_BOARD_ACTIVITY_OPTIONS.map((opt) => (
              <label key={opt.id} className="flex items-start gap-2 text-sm text-[var(--ep-navy)]">
                <input
                  type="checkbox"
                  name={`activity_${opt.id}`}
                  defaultChecked={snapshot.interests.includes(opt.id)}
                  className="mt-1"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="ep-input-label">Availability (optional)</span>
          <textarea
            name="availability"
            rows={2}
            defaultValue={snapshot.availability ?? ""}
            placeholder="Weeknights, Saturday mornings, etc."
            className="ep-input"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-[var(--ep-navy)]">
          <input type="checkbox" name="leadershipInterest" defaultChecked={snapshot.leadershipInterest} />
          I&apos;m interested in team or county leadership later
        </label>

        <fieldset className="rounded-lg border border-[var(--ep-navy)]/10 bg-white/50 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">
            Contact preferences
          </legend>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="emailOptIn" defaultChecked />
            Email me campaign updates and volunteer opportunities
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="smsOptIn" />
            Text me for time-sensitive volunteer shifts
          </label>
        </fieldset>

        <EpButton type="submit" fullWidth size="lg">
          Open my board
        </EpButton>
      </form>

      <p className="mt-6 text-center text-xs text-[var(--ep-navy-muted)]">
        Already a field leader?{" "}
        <Link href="/election-plan/operators/leaders/sign-in" className="underline">
          Leader workbench sign-in
        </Link>
      </p>
    </div>
  );
}
