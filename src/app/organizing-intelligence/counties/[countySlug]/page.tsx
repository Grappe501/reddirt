import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo/metadata";

const COUNTY_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LEN = 80;

type Props = { params: Promise<{ countySlug: string }> };

function titleFromCountySlug(slug: string): string {
  const words = slug.split("-").filter(Boolean);
  if (words.length === 0) return "County";
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function isAllowedCountySlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= MAX_SLUG_LEN && COUNTY_SLUG_RE.test(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  if (!isAllowedCountySlug(countySlug)) return { title: "County" };
  const display = titleFromCountySlug(countySlug);
  return pageMeta({
    title: `${display} — county organizing (placeholder)`,
    description: `Placeholder under organizing intelligence for ${display}, Arkansas. County command and published briefings may appear at /counties/${countySlug}. No live rollups or voter data.`,
    path: `/organizing-intelligence/counties/${countySlug}`,
    imageSrc: "/media/placeholders/og-default.svg",
  });
}

/**
 * Safe placeholder: fills the public OIS county URL without DB, auth, or voter data.
 */
export default async function OrganizingIntelligenceCountyPlaceholderPage({ params }: Props) {
  const { countySlug } = await params;
  if (!isAllowedCountySlug(countySlug)) notFound();

  const display = titleFromCountySlug(countySlug);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-kelly-text">
      <p className="text-sm text-kelly-text/60">
        <Link className="text-kelly-slate underline" href="/organizing-intelligence">
          ← State organizing intelligence
        </Link>
      </p>
      <h1 className="font-heading mt-4 text-2xl font-bold text-kelly-navy">{display}</h1>
      <p className="mt-2 text-sm text-kelly-text/75">
        County route under organizing intelligence — <strong>placeholder</strong> only. No county rollup UI, Power of 5 hydration, or voter-linked
        metrics here yet; wiring comes in a later packet.
      </p>
      <p className="mt-4 text-sm text-kelly-text/60">
        Public county command (when published) stays at{" "}
        <Link className="font-semibold text-kelly-slate underline" href={`/counties/${countySlug}`}>
          /counties/{countySlug}
        </Link>
        . Gold-sample dashboard:{" "}
        <Link className="font-semibold text-kelly-slate underline" href="/county-briefings/pope/v2">
          Pope v2
        </Link>
        .
      </p>
    </div>
  );
}
