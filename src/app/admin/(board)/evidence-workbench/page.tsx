import Link from "next/link";
import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { EvidenceAiCommandCenter } from "@/components/admin/evidence-workbench/EvidenceAiCommandCenter";
import { EvidenceCalendarPanel } from "@/components/admin/evidence-workbench/EvidenceCalendarPanel";
import { EvidenceIngestPanel } from "@/components/admin/evidence-workbench/EvidenceIngestPanel";
import { EvidenceNextActionsStrip } from "@/components/admin/evidence-workbench/EvidenceNextActionsStrip";
import { EvidencePlacementPanel } from "@/components/admin/evidence-workbench/EvidencePlacementPanel";
import { EvidencePhotosPanel } from "@/components/admin/evidence-workbench/EvidencePhotosPanel";
import { EvidencePublishQueuePanel } from "@/components/admin/evidence-workbench/EvidencePublishQueuePanel";
import { EvidenceShipPanel } from "@/components/admin/evidence-workbench/EvidenceShipPanel";
import { EvidenceSpeechConfirmPanel } from "@/components/admin/evidence-workbench/EvidenceSpeechConfirmPanel";
import { EvidenceSpeechesPanel } from "@/components/admin/evidence-workbench/EvidenceSpeechesPanel";
import { strategicPlacementNotes } from "@/content/media/strategic-photo-placements";
import { EVIDENCE_AI_TOOL_CATALOG } from "@/lib/campaign-media/evidence-ai-tool-defs";
import { listEvidenceAiModesForUi } from "@/lib/campaign-media/evidence-ai-modes";
import { rankEvidenceNextActions } from "@/lib/campaign-media/evidence-next-actions";
import { photoPublicSurfacesPreview } from "@/lib/campaign-media/county-albums-live";
import {
  loadCalendarPresenceStore,
  loadPhotoEvidenceStore,
  loadPhotoIngestDrafts,
  loadSpeechEvidenceStore,
} from "@/lib/campaign-media/evidence-store";
import { listPendingCuratedPlacementProposals } from "@/lib/campaign-media/curated-placement-store";
import { getCurrentCuratedPlacementSnapshot } from "@/lib/campaign-media/curated-placement-propose";
import { buildEvidencePublishQueue } from "@/lib/campaign-media/evidence-publish-queue";
import { buildEvidenceShipReport } from "@/lib/campaign-media/evidence-ship-report";
import { buildSpeechConfirmQueue } from "@/lib/campaign-media/speech-confirm-queue";
import {
  getCurrentSpeechPlacementSnapshot,
  loadSpeechPlacementStore,
} from "@/lib/campaign-media/speech-placement";
import { buildSpeechReadinessMatrix } from "@/lib/campaign-media/speech-readiness";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { listDiskPhotoIngestCandidates } from "@/lib/campaign-media/photo-ingest";
import { photoRequiresConsentHold } from "@/lib/campaign-media/photo-consent-hold";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ tab?: string; id?: string; filter?: string }>;
};

const TABS = [
  { id: "queue", label: "Publish Queue" },
  { id: "ship", label: "Ship" },
  { id: "placement", label: "Placement" },
  { id: "calendar", label: "Calendar" },
  { id: "photos", label: "Photos" },
  { id: "speeches", label: "Videos" },
  { id: "ingest", label: "Intake" },
] as const;

export default async function EvidenceWorkbenchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = TABS.some((t) => t.id === sp.tab) ? (sp.tab as (typeof TABS)[number]["id"]) : "queue";
  const focusId = sp.id?.trim() || undefined;
  const photoFilter = sp.filter?.trim() || undefined;

  const calendar = loadCalendarPresenceStore();
  const photoStore = loadPhotoEvidenceStore();
  const speechStore = loadSpeechEvidenceStore();
  const ingestDrafts = loadPhotoIngestDrafts();
  const livePhotos = listCampaignPhotosLive(photoStore);
  const liveById = new Map(livePhotos.map((p) => [p.id, p]));
  const ingestCandidates = listDiskPhotoIngestCandidates();
  const { getPhotoIntakeStatus } = await import("@/lib/campaign-media/photo-ingest");
  const intakeStatus = getPhotoIntakeStatus();
  const publishQueue = buildEvidencePublishQueue();
  const shipReport = buildEvidenceShipReport({ persist: false, includeDerivativeScan: true });
  const nextActions = rankEvidenceNextActions(6);
  const placementCurrent = getCurrentCuratedPlacementSnapshot();
  const placementProposal = listPendingCuratedPlacementProposals()[0] ?? null;
  const speechConfirmQueue = buildSpeechConfirmQueue();
  const speechReadiness = buildSpeechReadinessMatrix();
  const speechPlacementCurrent = getCurrentSpeechPlacementSnapshot();
  const speechPlacementStore = loadSpeechPlacementStore();
  const speechPlacementProposal =
    speechPlacementStore.proposals.find((p) => p.status === "pending") ??
    speechPlacementStore.proposals[0] ??
    null;

  const counties = ARKANSAS_COUNTY_REGISTRY.map((c) => ({
    slug: c.slug,
    displayName: c.displayName,
    shortName: c.displayName.replace(/\s+County$/i, ""),
  }));

  const unknownCounty = publishQueue.totals.unknownCounty;
  const needsApproval = publishQueue.totals.needsApproval;
  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const rawPhotos = [
    ...CAMPAIGN_PHOTO_REGISTRY,
    ...ingestDrafts.photos.filter((d) => !registryIds.has(d.id)),
  ];

  const photos = rawPhotos.map((p) => {
    const live = liveById.get(p.id) ?? p;
    const overlay = photoStore.photos[p.id] ?? null;
    return {
      id: p.id,
      /** Public delivery src (may be a promoted derivative). */
      src: live.src,
      registrySrc: p.src,
      caption: p.accessibility.caption,
      alt: p.accessibility.altText,
      notes: p.notes,
      requiresConsentHold: photoRequiresConsentHold(p.id, p.notes),
      placementPreview: photoPublicSurfacesPreview(live),
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
        approvedForPublic: p.campaign.approvedForPublic,
      },
      overlay,
    };
  });

  const speeches = CAMPAIGN_MEDIA_REGISTRY.map((m) => ({
    id: m.id,
    title: m.title,
    slug: m.slug,
    youtubeVideoId: m.youtubeVideoId,
    thumbnailUrl: m.thumbnailUrl,
    baseCounties: m.counties ?? [],
    basePublicationStatus: m.publicationStatus,
    overlay: speechStore.speeches[m.id] ?? null,
  }));

  return (
    <div className="mx-auto max-w-6xl text-[#12124a]">
      <h1 className="font-heading text-3xl font-bold text-[#000066]">Evidence Workbench</h1>
      <p className="mt-2 max-w-3xl font-body text-sm text-[#364272]">
        Local-first photo / video / calendar confirmation. Saves under{" "}
        <code className="rounded bg-[#f4f7fc] px-1">data/campaign-media/</code> on this machine — commit that folder
        to publish overlays. Use <code className="rounded bg-[#f4f7fc] px-1">http://127.0.0.1</code>. Unknown stays
        Unknown. Uncheck <strong>Approved for public</strong> to hold a still off county albums; check it (or set
        APPROVED/PUBLISHED) when ready.
      </p>

      <EvidenceAiCommandCenter />

      <EvidenceNextActionsStrip actions={nextActions.actions} generatedAt={nextActions.generatedAt} />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border-2 border-[#000066]/15 bg-white px-3 py-2">
          <p className="font-heading text-xs font-bold uppercase text-[#000066]">Publish queue</p>
          <p className="font-body text-sm">
            {unknownCounty} unknown · {needsApproval} need approval · {publishQueue.totals.approvedPublic}{" "}
            approved
          </p>
        </div>
        <div className="rounded-lg border-2 border-[#000066]/15 bg-white px-3 py-2">
          <p className="font-heading text-xs font-bold uppercase text-[#000066]">Ship</p>
          <p className="font-body text-sm">
            {shipReport.totals.overlayJsonDirty} overlay dirty · {shipReport.totals.derivativeLocalOnly}{" "}
            deriv local-only
          </p>
        </div>
        <div className="rounded-lg border-2 border-[#000066]/15 bg-white px-3 py-2">
          <p className="font-heading text-xs font-bold uppercase text-[#000066]">Intake</p>
          <p className="font-body text-sm">
            {intakeStatus.newOnDisk} new on disk · {intakeStatus.queueCount} in queue
          </p>
        </div>
        <div className="rounded-lg border-2 border-[#000066]/15 bg-white px-3 py-2">
          <p className="font-heading text-xs font-bold uppercase text-[#000066]">Videos</p>
          <p className="font-body text-sm">
            {speeches.length} speeches · {speechConfirmQueue.totals.noCounty} no county ·{" "}
            {speechConfirmQueue.totals.needsPublish} needs publish ·{" "}
            {speechConfirmQueue.totals.overlaysSaved} overlays
          </p>
        </div>
        <div className="rounded-lg border-2 border-[#000066]/15 bg-white px-3 py-2">
          <p className="font-heading text-xs font-bold uppercase text-[#000066]">Media command</p>
          <p className="font-body text-sm">
            <Link href="/admin/owned-media" className="font-semibold text-[#000066] underline">
              Owned Media
            </Link>
            {" · "}
            <Link href="/admin/media/youtube" className="font-semibold text-[#000066] underline">
              YouTube
            </Link>
            {" · "}
            <Link href="/campaign-photos" className="font-semibold text-[#000066] underline">
              Public albums
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border-2 border-[#000066]/20 bg-white p-4">
        <p className="font-heading text-sm font-bold text-[#000066]">Where photos go on the site</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-xs text-[#364272]">
          {strategicPlacementNotes().map((n) => (
            <li key={n.surface}>
              <span className="font-semibold text-[#12124a]">{n.surface}:</span> {n.how}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-lg border-2 border-[#000066]/20 bg-white p-4">
        <p className="font-heading text-sm font-bold text-[#000066]">
          OpenAI evidence brain — tools (OPENAI_API_KEY)
        </p>
        <p className="mt-1 font-body text-xs text-[#364272]">
          Suggest with AI is mode-routed (Identify · Fit · Photo/Video prep · Publish · Command · General).
          Command is freeform across the whole workbench. Prefer Unknown — never auto-confirm geography. Full
          catalog below.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2 font-body text-[11px] text-[#364272]">
          {(["photo", "video"] as const).flatMap((kind) =>
            listEvidenceAiModesForUi(kind).map((m) => (
              <li
                key={`${kind}-${m.id}`}
                className="rounded border border-[#8eb6dc]/50 bg-[#f4f7fc] px-2 py-1"
              >
                <span className="font-semibold text-[#000066]">
                  {kind}/{m.label}
                </span>
                {" · "}
                {m.toolCount === "all" ? "all tools" : `${m.toolCount} tools`}
              </li>
            )),
          )}
        </ul>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EVIDENCE_AI_TOOL_CATALOG.map((t) => (
            <li key={t.name} className="rounded border border-[#8eb6dc]/50 bg-[#f4f7fc] px-3 py-2">
              <p className="font-mono text-[11px] font-bold text-[#000066]">{t.name}</p>
              <p className="mt-0.5 font-body text-[11px] uppercase tracking-wide text-[#364272]">{t.audience}</p>
              <p className="mt-1 font-body text-xs text-[#12124a]">{t.summary}</p>
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
                ? "border-[#000066] bg-[#000066] text-white"
                : "border-[#8eb6dc] bg-white text-[#12124a] hover:border-[#000066]/40",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "queue" ? (
          <EvidencePublishQueuePanel
            initialQueue={publishQueue}
            initialSpeechQueue={speechConfirmQueue}
          />
        ) : null}
        {tab === "ship" ? <EvidenceShipPanel initialReport={shipReport} /> : null}
        {tab === "placement" ? (
          <EvidencePlacementPanel initialProposal={placementProposal} current={placementCurrent} />
        ) : null}
        {tab === "calendar" ? (
          <EvidenceCalendarPanel
            initialRows={calendar.rows}
            counties={counties}
            sourceNote={calendar.sourceNote}
            sinceDate={calendar.sinceDate}
          />
        ) : null}
        {tab === "photos" ? (
          <EvidencePhotosPanel
            photos={photos}
            counties={counties}
            initialPhotoId={focusId}
            initialFilter={photoFilter}
          />
        ) : null}
        {tab === "speeches" ? (
          <>
            <EvidenceSpeechConfirmPanel
              speeches={speeches}
              initialQueue={speechConfirmQueue}
              initialRows={speechReadiness.rows}
              initialPlacement={speechPlacementProposal}
              placementCurrent={speechPlacementCurrent}
            />
            <EvidenceSpeechesPanel speeches={speeches} initialSpeechId={focusId} />
          </>
        ) : null}
        {tab === "ingest" ? (
          <EvidenceIngestPanel initialCandidates={ingestCandidates} initialStatus={intakeStatus} />
        ) : null}
      </div>
    </div>
  );
}
