import Link from "next/link";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { BiographyPillarSection } from "@/components/biography/BiographyPillarSection";

/**
 * Meet Kelly — bridges campaign-facing essays (`KellyFullStory`) with manuscript arcs (`/biography`).
 */
export function AboutBiographyDrilldown() {
  return (
    <section id="kelly-biography-arcs" className="scroll-mt-24 border-t border-kelly-text/10 pt-10 md:pt-12">
      <SectionHeading
        align="left"
        eyebrow="Literary biography"
        title="Four arcs — manuscript chapters"
        subtitle="Campaign-ready summaries stay below on this page. Here you can jump straight into the long-form mini-novel by arc, then open gated chapter deep dives when rollout allows."
        className="max-w-2xl"
      />

      <p className="mt-6 max-w-2xl font-body text-sm leading-relaxed text-kelly-text/78">
        Start at the{" "}
        <Link href="/biography" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
          biography hub
        </Link>{" "}
        for the clean arc overview, or use{" "}
        <strong className="font-semibold text-kelly-text/90">Meet Kelly</strong> in the header — each arc links here and
        on <span className="whitespace-nowrap">/biography#pillar-…</span>.
      </p>

      <BiographyPillarSection showPerPillarChapterLinks className="mt-8" />

      <p className="mt-8 font-body text-sm text-kelly-text/70">
        <Link href="/biography" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
          Full manuscript table of contents →
        </Link>
      </p>
    </section>
  );
}
