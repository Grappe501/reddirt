import type { Metadata } from "next";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { listPublishedWithTranscript } from "@/content/media/campaign-media-registry";
import {
  buildTranscriptSearchIndex,
  searchTranscriptIndex,
} from "@/lib/media/youtube-transcripts/search-index";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Search transcripts | Kelly Speaks | ${siteConfig.name}`,
  description: "Search published campaign video transcripts from Kelly Grappe.",
  alternates: { canonical: `${siteConfig.url}/kelly-speaks/search` },
};

type Props = { searchParams: Promise<{ q?: string; county?: string; topic?: string }> };

export default async function KellySpeaksSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const index = buildTranscriptSearchIndex(listPublishedWithTranscript());
  const results = searchTranscriptIndex(index, {
    q: sp.q,
    county: sp.county,
    topic: sp.topic,
  });

  return (
    <div className="bg-kelly-cream pb-20 pt-10 md:pt-14">
      <ContentContainer>
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Kelly Speaks</p>
        <h1 className="mt-3 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold text-kelly-ink">
          Search transcripts
        </h1>
        <p className="mt-3 max-w-2xl font-body text-kelly-slate">
          Only published, editor-approved transcripts are searchable. Draft and AI drafts never appear here.
        </p>

        <form className="mt-8 grid max-w-2xl gap-3 md:grid-cols-[1fr_auto]" method="get">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Keyword, quote, county, or topic"
            className="rounded-md border border-kelly-ink/15 bg-white px-3 py-2 font-body"
          />
          <button type="submit" className="rounded-md bg-kelly-navy px-4 py-2 font-body text-sm font-semibold text-white">
            Search
          </button>
        </form>

        <ul className="mt-10 space-y-6">
          {results.map((doc) => (
            <li key={doc.youtubeVideoId} className="max-w-3xl border-b border-kelly-ink/10 pb-6">
              <Link href={`/kelly-speaks/${doc.slug}`} className="font-heading text-xl font-bold text-kelly-ink underline-offset-2 hover:underline">
                {doc.title}
              </Link>
              <p className="mt-2 font-body text-sm text-kelly-slate">{doc.excerpt}</p>
              {doc.topics.length ? (
                <p className="mt-2 font-body text-xs text-kelly-muted">Topics: {doc.topics.join(" · ")}</p>
              ) : null}
            </li>
          ))}
        </ul>

        {!results.length ? (
          <p className="mt-10 font-body text-kelly-slate">
            {listPublishedWithTranscript().length
              ? "No matches for that query."
              : "No published transcripts yet. Check back after editorial review."}
          </p>
        ) : null}

        <p className="mt-10">
          <Link href="/kelly-speaks" className="font-body text-sm font-semibold text-kelly-navy underline">
            ← All Kelly Speaks videos
          </Link>
        </p>
      </ContentContainer>
    </div>
  );
}
