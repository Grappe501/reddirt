"use client";

import { cn } from "@/lib/utils";

export function FormErrorSummary({ errors }: { errors: Record<string, string> }) {
  const keys = Object.keys(errors);
  if (!keys.length) return null;
  return (
    <div
      role="alert"
      className="rounded-card border border-red-dirt/35 bg-red-dirt/10 p-4 font-body text-sm text-deep-soil"
    >
      <p className="font-semibold">Please fix the highlighted fields.</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {keys.map((k) => (
          <li key={k}>
            <span className="font-medium">{k}:</span> {errors[k]}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Shown under public form success (Day 4 comms: expectations without promising instant automation). */
export function PublicFormFollowUpBlurb() {
  return (
    <p className="mt-4 border-t border-field-green/25 pt-4 text-sm leading-relaxed text-deep-soil/70">
      <span className="font-semibold text-deep-soil/85">What happens next: </span>
      Your information is in our secure campaign system. A coordinator typically follows up within{" "}
      <strong>one business day</strong> (we aim for 24 hours when staffing allows). We do not always send
      an automatic confirmation—if you do not hear from us, check spam, or use the contact options on this site
      to reach the team.
    </p>
  );
}

export function FormSuccessPanel({
  title,
  children,
  className,
  showResponseExpectation = true,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Day 4: consistent follow-up promise on public /api/forms success states */
  showResponseExpectation?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-field-green/35 bg-field-green/10 p-8 shadow-[var(--shadow-soft)] transition duration-slow",
        className,
      )}
    >
      <h3 className="font-heading text-2xl font-bold text-deep-soil">{title}</h3>
      <div className="mt-4 space-y-3 font-body text-base leading-relaxed text-deep-soil/80">{children}</div>
      {showResponseExpectation ? <PublicFormFollowUpBlurb /> : null}
    </div>
  );
}
