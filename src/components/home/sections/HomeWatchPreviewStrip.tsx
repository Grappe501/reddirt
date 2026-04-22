import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";

export function HomeWatchPreviewStrip() {
  return (
    <section
      id="hear-kelly"
      className="border-y border-civic-ink/10 bg-white py-10 scroll-mt-[5.5rem]"
      aria-label="From the Road"
    >
      <ContentContainer>
        <div className="flex flex-col items-start justify-between gap-6 rounded-card border border-civic-ink/10 bg-civic-fog/80 px-6 py-6 md:flex-row md:items-center md:px-8">
          <div>
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-civic-blue">On the trail</p>
            <h2 className="mt-2 font-heading text-xl font-bold text-civic-ink md:text-2xl">Field, voices, and the notebook</h2>
            <p className="mt-2 max-w-xl font-body text-sm text-civic-slate">
              One hub for how we are showing up—stories, updates, and video when we publish the dedicated library.
            </p>
          </div>
          <Link
            href="/from-the-road"
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-btn bg-red-dirt px-6 py-3 text-sm font-bold uppercase tracking-wider text-cream-canvas shadow-soft hover:bg-[#8f3d24]"
          >
            Open From the Road
          </Link>
        </div>
      </ContentContainer>
    </section>
  );
}
