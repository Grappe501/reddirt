import Link from "next/link";
import { SocialGlyph } from "@/components/layout/SocialFooterIcons";
import type { PublicSocialId, PublicSocialLink } from "@/config/social";
import { getPublicSocialLinks } from "@/config/social";
import { cn } from "@/lib/utils";

const PITCH: Partial<Record<PublicSocialId, string>> = {
  facebook: "Day-of updates, events, and conversation with neighbors.",
  instagram: "Photos and reels from counties and community stops.",
  x: "News nuggets, retweets, and rapid response.",
  youtube: "Speeches, interviews, and longer-form video.",
  substack: "Essays and the notebook—read without an algorithm.",
  tiktok: "Short clips that meet people where they scroll.",
};

const ACCENT: Partial<Record<PublicSocialId, string>> = {
  facebook: "from-civic-blue/12 via-white to-civic-midnight/8",
  instagram: "from-fuchsia-500/10 via-white to-amber-500/10",
  x: "from-civic-ink/10 via-white to-civic-slate/10",
  youtube: "from-red-600/10 via-white to-civic-ink/8",
  substack: "from-civic-copper/15 via-white to-civic-gold/10",
  tiktok: "from-civic-midnight/12 via-white to-civic-blue/8",
};

function hubLinks(links: PublicSocialLink[]): PublicSocialLink[] {
  return links.filter((l) => l.id !== "email");
}

/**
 * Env-driven “command center” for every public channel (same `NEXT_PUBLIC_SOCIAL_*` as the site footer).
 */
export function FromTheRoadSocialHub() {
  const all = getPublicSocialLinks();
  const channels = hubLinks(all);
  const email = all.find((l) => l.id === "email");

  return (
    <section
      id="channels"
      className="scroll-mt-24 rounded-[1.35rem] border border-civic-ink/10 bg-gradient-to-br from-white via-civic-fog/40 to-white p-6 shadow-lg shadow-civic-ink/[0.04] md:p-10"
      aria-label="Official campaign channels"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.28em] text-civic-gold">No app required</p>
        <h2 className="mt-3 font-heading text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-tight text-civic-ink">
          Every feed, one place
        </h2>
        <p className="mt-4 font-body text-base leading-relaxed text-civic-slate md:text-lg">
          Same official destinations as the site footer—one tap to the channel you use, no hunting for handles. Live
          previews sit just below when embeds are enabled in deployment settings.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {channels.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex h-full flex-col rounded-card border border-civic-ink/10 bg-gradient-to-br p-5 shadow-sm transition",
                "hover:border-civic-blue/25 hover:shadow-md hover:shadow-civic-ink/5",
                ACCENT[item.id] ?? "from-white to-civic-fog/30",
              )}
            >
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-civic-ink/10 bg-white/90 text-civic-ink shadow-sm",
                    "transition group-hover:border-civic-blue/20 group-hover:text-civic-blue",
                  )}
                  aria-hidden
                >
                  <SocialGlyph id={item.id} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-lg font-bold text-civic-ink">{item.label}</p>
                  {PITCH[item.id] ? (
                    <p className="mt-1.5 font-body text-sm leading-relaxed text-civic-slate/90">{PITCH[item.id]}</p>
                  ) : null}
                </div>
              </div>
              <span className="mt-4 inline-flex items-center font-body text-sm font-bold uppercase tracking-wider text-civic-blue group-hover:underline">
                Open {item.label} ↗
              </span>
            </a>
          </li>
        ))}
      </ul>

      {email ? (
        <p className="mt-8 text-center font-body text-sm text-civic-slate/80">
          Prefer email?{" "}
          <a href={email.href} className="font-semibold text-civic-blue underline-offset-2 hover:underline">
            {email.label} the campaign
          </a>
          {" · "}
          <Link href="#live-embeds" className="font-semibold text-civic-blue underline-offset-2 hover:underline">
            Scroll live windows
          </Link>
        </p>
      ) : null}
    </section>
  );
}
