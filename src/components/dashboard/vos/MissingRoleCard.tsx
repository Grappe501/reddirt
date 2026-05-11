import type { VolunteerRole } from "@/types/dashboard";

const ROLE_COPY: Record<Extract<VolunteerRole, "events" | "social-media" | "power-of-5">, { title: string; blurb: string }> = {
  events: {
    title: "Events Coordinator",
    blurb: "Local calendar, pipeline, and Kelly’s itinerary in your geography.",
  },
  "social-media": {
    title: "Social Media Coordinator",
    blurb: "Authentic local posts, engagement, and field/social alignment.",
  },
  "power-of-5": {
    title: "Power of 5 / VR Coordinator",
    blurb: "Relational turnout networks, voter registration coaching, monthly P5 programs.",
  },
};

export function MissingRoleCard({ role }: { role: Extract<VolunteerRole, "events" | "social-media" | "power-of-5"> }) {
  const copy = ROLE_COPY[role];
  return (
    <div className="rounded-xl border border-dashed border-kelly-gold/50 bg-kelly-gold/[0.06] px-4 py-3">
      <p className="font-body text-[10px] font-bold uppercase tracking-wide text-kelly-deep/70">Open lane</p>
      <p className="mt-1 font-heading text-sm font-bold text-kelly-navy">{copy.title}</p>
      <p className="mt-2 font-body text-xs text-kelly-text/75">{copy.blurb}</p>
    </div>
  );
}
