"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { VIDEO_SECTION } from "@/content/home/homepagePremium";
import { siteConfig } from "@/config/site";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";

export type HomeVideoSectionProps = {
  /**
   * When a DB-backed featured player is shown earlier in the journey (`HomeFeaturedVideoSection`),
   * skip the heavy embed here—keep thematic clips + CTA only.
   */
  omitMainEmbed?: boolean;
};

export function HomeVideoSection({ omitMainEmbed = false }: HomeVideoSectionProps) {
  const embedUrl = siteConfig.featureVideoEmbedUrl;
  const clips = VIDEO_SECTION.secondaryClips;

  return (
    <section
      id={omitMainEmbed ? "hear-kelly-more" : "hear-kelly"}
      className="bg-civic-fog py-section-y lg:py-section-y-lg"
      aria-labelledby="video-heading"
    >
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-red-dirt">{VIDEO_SECTION.eyebrow}</p>
          <h2 id="video-heading" className="mt-4 font-heading text-[clamp(1.85rem,4vw,2.85rem)] font-bold tracking-tight text-civic-ink">
            {VIDEO_SECTION.title}
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-civic-slate md:text-xl">{VIDEO_SECTION.intro}</p>
        </FadeInWhenVisible>

        {!omitMainEmbed ? (
          <FadeInWhenVisible className="mt-12 md:mt-14" delay={0.08}>
            <div className="overflow-hidden rounded-card border border-civic-ink/10 bg-civic-midnight shadow-2xl shadow-black/15">
              {embedUrl ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe title="Featured campaign video — Kelly Grappe" src={embedUrl} className="absolute inset-0 h-full w-full" allowFullScreen />
                </div>
              ) : (
                <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-5 bg-gradient-to-br from-civic-midnight via-civic-deep to-civic-blue p-8 text-center">
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-civic-gold/50 text-3xl text-civic-gold" aria-hidden>
                    ▶
                  </span>
                  <p className="max-w-lg font-body text-sm leading-relaxed text-civic-mist/75 md:text-base">
                    Set <code className="rounded bg-civic-mist/10 px-1.5 py-0.5 font-mono text-xs text-civic-gold">NEXT_PUBLIC_FEATURE_VIDEO_EMBED_URL</code>{" "}
                    for a fallback embed, or curate video in admin + run YouTube sync.
                  </p>
                </div>
              )}
            </div>
          </FadeInWhenVisible>
        ) : (
          <FadeInWhenVisible className="mt-8 md:mt-10" delay={0.06}>
            <p className="mx-auto max-w-2xl text-center font-body text-base text-civic-slate">
              The featured conversation plays in <strong className="text-civic-ink">Understand</strong> above—browse themed clips
              here or open the full <Link href="/watch" className="font-semibold text-civic-blue underline-offset-2 hover:underline">Watch Kelly</Link> library.
            </p>
          </FadeInWhenVisible>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {clips.map((clip, i) => (
            <motion.div
              key={clip.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={clip.href}
                className={cn(
                  "group flex h-full flex-col overflow-hidden rounded-card border border-civic-ink/10 bg-white shadow-sm transition",
                  "hover:border-civic-gold/40 hover:shadow-md",
                )}
              >
                <div className="relative flex aspect-video max-h-[140px] items-center justify-center bg-gradient-to-br from-civic-blue/30 to-civic-midnight/80 md:max-h-[160px]">
                  <span className="rounded-full border border-civic-mist/25 bg-civic-midnight/50 px-3 py-2 text-lg text-civic-gold transition group-hover:scale-105" aria-hidden>
                    ▶
                  </span>
                  <p className="sr-only">Play: {clip.title}</p>
                </div>
                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-civic-gold">{clip.category}</p>
                  <p className="mt-2 font-heading text-base font-bold leading-snug text-civic-ink md:text-lg">{clip.title}</p>
                  <p className="mt-2 font-body text-xs text-civic-slate/65">{clip.thumbHint}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <FadeInWhenVisible className="mt-10 flex justify-center" delay={0.12}>
          <Link
            href={VIDEO_SECTION.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-civic-ink/20 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-civic-ink transition hover:border-civic-gold hover:bg-white"
          >
            {VIDEO_SECTION.ctaLabel}
          </Link>
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
