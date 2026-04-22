import Link from "next/link";
import { getContentHubJoinHref, isOffSitePublicHref } from "@/config/external-campaign";
import { cn } from "@/lib/utils";

function hubActionItems(): { id: string; label: string; href: string; detail: string }[] {
  return [
    {
      id: "join",
      label: "Join the campaign",
      href: getContentHubJoinHref(),
      detail: "Add your name and stay in the loop.",
    },
    {
      id: "invite-county",
      label: "Invite us to your county",
      href: "/get-involved#join",
      detail: "Party, civic club, or community meeting.",
    },
    {
      id: "host",
      label: "Host a gathering",
      href: "/host-a-gathering",
      detail: "Coffee, porch, or roundtable—your place matters.",
    },
    {
      id: "volunteer",
      label: "Volunteer locally",
      href: "/get-involved#volunteer",
      detail: "Field, digital, or voter education.",
    },
    {
      id: "resources",
      label: "Resources & ballot access",
      href: "/resources",
      detail: "Plain-language help for voters and clerks.",
    },
  ];
}

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
  const actions = hubActionItems();
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
        {actions.map((a) => {
          const offSite = isOffSitePublicHref(a.href);
          return (
            <li key={a.id}>
              <Link
                href={a.href}
                target={offSite ? "_blank" : undefined}
                rel={offSite ? "noopener noreferrer" : undefined}
                className="flex h-full flex-col rounded-lg border border-white/15 bg-white/5 px-4 py-3 transition hover:border-civic-gold/40 hover:bg-white/10"
              >
                <span className="font-heading text-sm font-bold text-white">{a.label}</span>
                <span className="mt-1 font-body text-xs leading-snug text-civic-mist/75">{a.detail}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
