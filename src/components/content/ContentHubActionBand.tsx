import Link from "next/link";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Join the campaign",
    href: getJoinCampaignHref(),
    detail: "Add your name and stay in the loop.",
    external: true,
  },
  {
    label: "Invite us to your county",
    href: "/get-involved#join",
    detail: "Party, civic club, or community meeting.",
    external: false,
  },
  {
    label: "Host a gathering",
    href: "/host-a-gathering",
    detail: "Coffee, porch, or roundtable—your place matters.",
    external: false,
  },
  {
    label: "Volunteer locally",
    href: "/get-involved#volunteer",
    detail: "Field, digital, or voter education.",
    external: false,
  },
  {
    label: "Resources & ballot access",
    href: "/resources",
    detail: "Plain-language help for voters and clerks.",
    external: false,
  },
] as const;

export type ContentHubActionBandProps = {
  /** Page-specific line above the grid */
  intro: string;
  className?: string;
  /** Anchor for in-page links (e.g. <Link href="#take-action">). */
  id?: string;
  eyebrow?: string;
  title?: string;
};

/**
 * Shared “don’t dead-end” module for content hubs — connects watching/reading to real campaign moves.
 */
export function ContentHubActionBand({
  intro,
  className,
  id = "content-hub-actions",
  eyebrow = "Your move",
  title = "This isn’t a feed—it’s a doorway",
}: ContentHubActionBandProps) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      className={cn("rounded-card border border-civic-ink/10 bg-gradient-to-br from-civic-midnight via-civic-deep to-civic-blue px-5 py-8 text-civic-mist shadow-lg md:px-8 md:py-10", className)}
      aria-labelledby={headingId}
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-civic-gold/90">{eyebrow}</p>
        <h2 id={headingId} className="mt-3 font-heading text-xl font-bold text-white md:text-2xl">
          {title}
        </h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-civic-mist/85 md:text-base">{intro}</p>
      </div>
      <ul className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {actions.map((a) => (
          <li key={a.href}>
            <Link
              href={a.href}
              target={a.external ? "_blank" : undefined}
              rel={a.external ? "noopener noreferrer" : undefined}
              className="flex h-full flex-col rounded-lg border border-white/15 bg-white/5 px-4 py-3 transition hover:border-civic-gold/40 hover:bg-white/10"
            >
              <span className="font-heading text-sm font-bold text-white">{a.label}</span>
              <span className="mt-1 font-body text-xs leading-snug text-civic-mist/75">{a.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
