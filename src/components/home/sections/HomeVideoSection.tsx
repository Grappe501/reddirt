"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { VIDEO_SECTION } from "@/content/home/homepagePremium";
import { kellySpeakIngestClips } from "@/content/media/kelly-speak-clips.generated";
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
      className="bg-kelly-fog py-section-y lg:py-section-y-lg"
      aria-labelledby="video-heading"
    >
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">{VIDEO_SECTION.eyebrow}</p>
          <h2 id="video-heading" className="mt-4 font-heading text-[clamp(1.85rem,4vw,2.85rem)] font-bold tracking-tight text-kelly-ink">
            {VIDEO_SECTION.title}
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-kelly-slate md:text-xl">{VIDEO_SECTION.intro}</p>
        </FadeInWhenVisible>

        {!omitMainEmbed ? (
          <FadeInWhenVisible className="mt-12 md:mt-14" delay={0.08}>
            <div className="overflow-hidden rounded-card border border-kelly-ink/10 bg-kelly-navy shadow-2xl shadow-black/15">
              {embedUrl ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe title="Featured campaign video — Kelly Grappe" src={embedUrl} className="absolute inset-0 h-full w-full" allowFullScreen />
                </div>
              ) : (
                <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-5 bg-gradient-to-br from-kelly-navy via-kelly-deep to-kelly-blue p-8 text-center">
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-kelly-gold/50 text-3xl text-kelly-gold" aria-hidden>
                    ▶
                  </span>
                  <p className="max-w-lg font-body text-sm leading-relaxed text-kelly-mist/75 md:text-base">
                    Featured video will appear here when available—meanwhile, browse clips on{" "}
                    <Link href="/from-the-road" className="font-semibold text-kelly-gold underline-offset-2 hover:underline">
                      From the Road
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          </FadeInWhenVisible>
        ) : (
          <FadeInWhenVisible className="mt-8 md:mt-10" delay={0.06}>
            <p className="mx-auto max-w-2xl text-center font-body text-base text-kelly-slate">
              The featured conversation plays in <strong className="text-kelly-ink">Understand</strong> above—browse themed clips
              here or open <Link href="/from-the-road" className="font-semibold text-kelly-blue underline-offset-2 hover:underline">From the Road</Link>.
            </p>
          </FadeInWhenVisible>
        )}

        {kellySpeakIngestClips.length > 0 ? (
          <FadeInWhenVisible className="mt-10" delay={0.06}>
            <p className="mb-4 text-center font-body text-xs font-bold uppercase tracking-wider text-kelly-slate/70">
              Kellymedia — recent speech & B-roll
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kellySpeakIngestClips.slice(0, 9).map((c) => (
                <div
                  key={c.id}
                  className="overflow-hidden rounded-card border border-kelly-ink/10 bg-black shadow-lg shadow-black/20"
                >
                  <video
                    src={c.src}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full"
                    title={c.title}
                  />
                  <p className="border-t border-white/10 bg-kelly-navy px-3 py-2 font-body text-xs text-kelly-mist/90">
                    {c.title}
                    {c.countyLabel ? ` · ${c.countyLabel.replace(/-/g, " ")}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </FadeInWhenVisible>
        ) : null}

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
                  "group flex h-full flex-col overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-sm transition",
                  "hover:border-kelly-gold/40 hover:shadow-md",
                )}
              >
                <div className="relative flex aspect-video max-h-[140px] items-center justify-center bg-gradient-to-br from-kelly-blue/30 to-kelly-navy/80 md:max-h-[160px]">
                  <span className="rounded-full border border-kelly-mist/25 bg-kelly-navy/50 px-3 py-2 text-lg text-kelly-gold transition group-hover:scale-105" aria-hidden>
                    ▶
                  </span>
                  <p className="sr-only">Play: {clip.title}</p>
                </div>
                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-gold">{clip.category}</p>
                  <p className="mt-2 font-heading text-base font-bold leading-snug text-kelly-ink md:text-lg">{clip.title}</p>
                  <p className="mt-2 font-body text-xs text-kelly-slate/65">{clip.thumbHint}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <FadeInWhenVisible className="mt-10 flex justify-center" delay={0.12}>
          <Link
            href={VIDEO_SECTION.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-ink/20 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-ink transition hover:border-kelly-gold hover:bg-white"
          >
            {VIDEO_SECTION.ctaLabel}
          </Link>
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
