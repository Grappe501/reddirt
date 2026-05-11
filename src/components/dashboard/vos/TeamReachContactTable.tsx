import Link from "next/link";
import type { ReactNode } from "react";

import type { TeamReachContact } from "@/types/dashboard";

function labelSupport(s: TeamReachContact["supportStatus"]): string {
  const m: Record<TeamReachContact["supportStatus"], string> = {
    unknown: "Unknown",
    supportive: "Supportive",
    persuadable: "Persuadable",
    "needs-follow-up": "Needs follow-up",
    "not-interested": "Not interested",
  };
  return m[s];
}

function labelReg(s: TeamReachContact["registrationStatus"]): string {
  const m: Record<TeamReachContact["registrationStatus"], string> = {
    unknown: "Unknown",
    registered: "Registered",
    "needs-registration": "Needs registration",
    "helped-register": "Helped register",
  };
  return m[s];
}

function labelVolunteer(s: TeamReachContact["volunteerInterest"]): ReactNode {
  switch (s) {
    case "not-asked":
      return "Not asked";
    case "interested":
      return (
        <Link href="/volunteer" className="font-semibold text-kelly-blue underline">
          Route to /volunteer
        </Link>
      );
    case "referred-to-volunteer":
      return "Referred · /volunteer";
    case "joined-team":
      return "Joined triad";
    default:
      return s;
  }
}

export function TeamReachContactTable({
  contacts,
  memberLabel = () => "",
  variant = "full",
}: {
  contacts: TeamReachContact[];
  memberLabel?: (volunteerId: string) => string;
  /** `compact` stacks one line per contact for member cards. */
  variant?: "full" | "compact";
}) {
  if (!contacts.length) {
    return (
      <p className="font-body text-sm text-kelly-text/70">
        {variant === "compact"
          ? "No contacts logged yet."
          : "Reach-style contacts will appear here once your team seeds relational rows (mock data on demo teams)."}
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <ul className="divide-y divide-kelly-text/10 rounded-lg border border-kelly-text/10">
        {contacts.map((c) => (
          <li key={c.id} className="space-y-0.5 px-2 py-2 font-body text-[11px] leading-snug text-kelly-text/85">
            <div className="font-semibold text-kelly-deep">{c.displayName}</div>
            <div className="text-kelly-text/70">
              {c.relationship} · {labelSupport(c.supportStatus)} · {labelReg(c.registrationStatus)}
            </div>
            <div className="text-kelly-text/65">Last: {c.lastTouch}</div>
            <div className="text-kelly-text/65">Next: {c.nextAction}</div>
            <div className="text-kelly-text/70">Volunteer: {labelVolunteer(c.volunteerInterest)}</div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-kelly-text/10">
      <table className="min-w-[720px] w-full border-collapse font-body text-left text-sm">
        <thead>
          <tr className="border-b border-kelly-text/15 bg-kelly-fog/50 text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">
            <th className="px-3 py-2">Contact</th>
            <th className="px-3 py-2">Relationship</th>
            <th className="px-3 py-2">Support</th>
            <th className="px-3 py-2">Registration</th>
            <th className="px-3 py-2">Last touch</th>
            <th className="px-3 py-2">Next action</th>
            <th className="px-3 py-2">Volunteer interest</th>
            <th className="px-3 py-2">Owner</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id} className="border-b border-kelly-text/10 last:border-0">
              <td className="px-3 py-2 font-medium text-kelly-deep">{c.displayName}</td>
              <td className="px-3 py-2 text-kelly-text/80">{c.relationship}</td>
              <td className="px-3 py-2 text-kelly-text/80">{labelSupport(c.supportStatus)}</td>
              <td className="px-3 py-2 text-kelly-text/80">{labelReg(c.registrationStatus)}</td>
              <td className="px-3 py-2 text-xs text-kelly-text/75">{c.lastTouch}</td>
              <td className="px-3 py-2 text-xs text-kelly-text/75">{c.nextAction}</td>
              <td className="px-3 py-2 text-xs">{labelVolunteer(c.volunteerInterest)}</td>
              <td className="px-3 py-2 text-xs text-kelly-text/65">{memberLabel(c.ownerMemberId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
