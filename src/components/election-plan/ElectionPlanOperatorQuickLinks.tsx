import Link from "next/link";

import {
  ELECTION_PLAN_OPERATOR_QUICK_LINK_GROUPS,
  type ElectionPlanQuickLink,
} from "@/lib/election-plan/operator-quick-links";

const emphasisClass = {
  gold: "border-[var(--ep-gold)]/60 bg-[var(--ep-gold)]/10 hover:border-[var(--ep-gold)]",
  rose: "border-rose-300/60 bg-rose-50/80 hover:border-rose-400",
  default: "border-white/15 bg-white/10 hover:border-white/40 hover:bg-white/15",
} as const;

function QuickLinkCard({ link, variant }: { link: ElectionPlanQuickLink; variant: "hero" | "panel" }) {
  const emphasis = link.emphasis ?? "default";
  const hero = variant === "hero";

  return (
    <Link
      href={link.href}
      className={`block rounded-lg border p-3 transition ${
        hero ? emphasisClass[emphasis] : "border-[var(--ep-border)] bg-white hover:border-[var(--ep-gold)]"
      }`}
    >
      <p className={`text-sm font-bold ${hero ? "text-white" : "text-[var(--ep-navy)]"}`}>{link.label}</p>
      {link.detail ? (
        <p className={`mt-1 text-xs ${hero ? "text-white/70" : "text-[var(--ep-navy-muted)]"}`}>{link.detail}</p>
      ) : null}
    </Link>
  );
}

export function ElectionPlanOperatorQuickLinks({ variant = "hero" }: { variant?: "hero" | "panel" }) {
  const hero = variant === "hero";

  return (
    <section
      className={hero ? "mt-8 rounded-xl border border-white/20 bg-black/20 p-5 backdrop-blur-sm" : "mb-8"}
      aria-label="Operator quick links"
    >
      <div className="mb-4">
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${hero ? "text-[var(--ep-gold)]" : "text-[var(--ep-gold)]"}`}>
          Operator quick links
        </p>
        <p className={`mt-1 text-sm ${hero ? "text-white/80" : "text-[var(--ep-navy-muted)]"}`}>
          Debate prep v5, opposition, field ops, and plan search — one click from War Room home.
        </p>
      </div>

      <div className="space-y-6">
        {ELECTION_PLAN_OPERATOR_QUICK_LINK_GROUPS.map((group) => (
          <div key={group.id}>
            <h3 className={`mb-3 text-xs font-bold uppercase tracking-wide ${hero ? "text-white/90" : "text-[var(--ep-navy)]"}`}>
              {group.label}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.links.map((link) => (
                <QuickLinkCard key={link.href} link={link} variant={variant} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
