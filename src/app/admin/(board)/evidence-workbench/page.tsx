import Link from "next/link";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import { EvidenceCalendarPanel } from "@/components/admin/evidence-workbench/EvidenceCalendarPanel";
import { EvidencePhotosPanel } from "@/components/admin/evidence-workbench/EvidencePhotosPanel";
import { EvidenceSpeechesPanel } from "@/components/admin/evidence-workbench/EvidenceSpeechesPanel";
import {
  loadCalendarPresenceStore,
  loadPhotoEvidenceStore,
  loadSpeechEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { strategicPlacementNotes } from "@/content/media/strategic-photo-placements";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

const TABS = [
  { id: "calendar", label: "Calendar" },
  { id: "photos", label: "Photos" },
  { id: "speeches", label: "Speeches" },
] as const;

export default async function EvidenceWorkbenchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = TABS.some((t) => t.id === sp.tab) ? (sp.tab as (typeof TABS)[number]["id"]) : "calendar";

  const calendar = loadCalendarPresenceStore();
  const photoStore = loadPhotoEvidenceStore();
  const speechStore = loadSpeechEvidenceStore();

  const counties = ARKANSAS_COUNTY_REGISTRY.map((c) => ({
    slug: c.slug,
    displayName: c.displayName,
    shortName: c.displayName.replace(/\s+County$/i, ""),
  }));

  const photos = CAMPAIGN_PHOTO_REGISTRY.map((p) => ({
    id: p.id,
    src: p.src,
    caption: p.accessibility.caption,
    alt: p.accessibility.altText,
    base: {
      county: p.campaign.county,
      city: p.campaign.city,
      venue: p.campaign.venue,
      eventDate: p.campaign.eventDate,
      eventName: p.campaign.eventName,
      photographer: p.campaign.photographer,
      peopleVisible: p.campaign.peopleVisible,
      homepageCandidate: p.campaign.homepageCandidate,
      featuredPhoto: p.campaign.featuredPhoto,
      heroLevel: p.heroLevel,
      publicationStatus: p.publicationStatus,
    },
    overlay: photoStore.photos[p.id] ?? null,
  }));

  const speeches = CAMPAIGN_MEDIA_REGISTRY.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    youtubeVideoId: m.youtubeVideoId,
    thumbnailUrl: m.thumbnailUrl,
    baseCounties: m.counties ?? [],
    overlay: speechStore.speeches[m.id] ?? null,
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Evidence Workbench</h1>
      <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75">
        Local-first confirmations for calendar presence, campaign photos, and speeches. Saves JSON under{" "}
        <code className="rounded bg-kelly-text/5 px-1">data/campaign-media/</code> on this machine — use{" "}
        <code className="rounded bg-kelly-text/5 px-1">http://127.0.0.1</code> (writes blocked on remote hosts).
        Unknown stays Unknown. Photos/Speeches: <strong>Suggest with AI</strong> (uses{" "}
        <code className="rounded bg-kelly-text/5 px-1">OPENAI_API_KEY</code>), then Save, then{" "}
        <strong>Build outgoing metadata packet</strong> for intelligence reuse. Saving photos rebuilds{" "}
        <Link href="/campaign-photos" className="font-semibold text-kelly-blue underline">
          county albums
        </Link>{" "}
        (county → event folders under <code className="rounded bg-kelly-text/5 px-1">public/media/county-albums/</code>
        ).
      </p>

      <div className="mt-4 rounded-lg border-2 border-[#000066]/20 bg-white p-4 text-[#12124a]">
        <p className="font-heading text-sm font-bold text-[#000066]">Where photos go on the site</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-xs text-[#364272]">
          {strategicPlacementNotes().map((n) => (
            <li key={n.surface}>
              <span className="font-semibold text-[#12124a]">{n.surface}:</span> {n.how}
            </li>
          ))}
        </ul>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Evidence workbench tabs">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/evidence-workbench?tab=${t.id}`}
            className={cn(
              "rounded-md border px-3 py-1.5 font-body text-sm font-semibold",
              tab === t.id
                ? "border-kelly-navy bg-kelly-navy text-white"
                : "border-kelly-text/15 bg-white text-kelly-ink hover:border-kelly-navy/40",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "calendar" ? (
          <EvidenceCalendarPanel
            initialRows={calendar.rows}
            counties={counties}
            sourceNote={calendar.sourceNote}
          />
        ) : null}
        {tab === "photos" ? <EvidencePhotosPanel photos={photos} counties={counties} /> : null}
        {tab === "speeches" ? <EvidenceSpeechesPanel speeches={speeches} /> : null}
      </div>
    </div>
  );
}
