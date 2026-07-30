import Link from "next/link";
import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { EvidenceAiCommandCenter } from "@/components/admin/evidence-workbench/EvidenceAiCommandCenter";
import { EvidenceCalendarPanel } from "@/components/admin/evidence-workbench/EvidenceCalendarPanel";
import { EvidenceCollapsedChrome } from "@/components/admin/evidence-workbench/EvidenceCollapsedChrome";
import { EvidenceEventNightLoopPanel } from "@/components/admin/evidence-workbench/EvidenceEventNightLoopPanel";
import { EvidenceFitBacklogPanel } from "@/components/admin/evidence-workbench/EvidenceFitBacklogPanel";
import { EvidenceIngestPanel } from "@/components/admin/evidence-workbench/EvidenceIngestPanel";
import { EvidenceNextActionsStrip } from "@/components/admin/evidence-workbench/EvidenceNextActionsStrip";
import { EvidencePhotoReadinessPanel } from "@/components/admin/evidence-workbench/EvidencePhotoReadinessPanel";
import { EvidencePlacementPanel } from "@/components/admin/evidence-workbench/EvidencePlacementPanel";
import { EvidencePhotosPanel } from "@/components/admin/evidence-workbench/EvidencePhotosPanel";
import { EvidencePublishQueuePanel } from "@/components/admin/evidence-workbench/EvidencePublishQueuePanel";
import { EvidenceShipPanel } from "@/components/admin/evidence-workbench/EvidenceShipPanel";
import { EvidenceSpeechConfirmPanel } from "@/components/admin/evidence-workbench/EvidenceSpeechConfirmPanel";
import { EvidenceSpeechesPanel } from "@/components/admin/evidence-workbench/EvidenceSpeechesPanel";
import { EvidenceToolingBanner } from "@/components/admin/evidence-workbench/EvidenceToolingBanner";
import { buildFitRankedBacklog } from "@/lib/campaign-media/evidence-fit-backlog";
import { rankEvidenceNextActions } from "@/lib/campaign-media/evidence-next-actions";
import { getEvidenceToolingReadiness } from "@/lib/campaign-media/evidence-tooling-readiness";
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
import { buildCountyPhotoCoverageHeat } from "@/lib/campaign-media/county-coverage-heat";
import { buildEvidenceShipReport } from "@/lib/campaign-media/evidence-ship-report";
import { buildSpeechConfirmQueue } from "@/lib/campaign-media/speech-confirm-queue";
import {
  getCurrentSpeechPlacementSnapshot,
  loadSpeechPlacementStore,
} from "@/lib/campaign-media/speech-placement";
import { buildSpeechReadinessMatrix } from "@/lib/campaign-media/speech-readiness";
import { getPhotoReadinessMatrix } from "@/lib/campaign-media/photo-readiness";
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
  const urlFilter = sp.filter?.trim() || undefined;

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
  const coverageHeat = buildCountyPhotoCoverageHeat();
  const shipReport = buildEvidenceShipReport({ persist: false, includeDerivativeScan: true });
  const nextActions = rankEvidenceNextActions(6);
  const tooling = getEvidenceToolingReadiness();
  const photoReadiness = getPhotoReadinessMatrix({ limit: 80 });
  const fitBacklog = buildFitRankedBacklog({ limit: 24 });
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
    <div className="ew-shell ew-display">
      <header className="ew-hero">
        <p className="ew-eyebrow">Campaign OS · Media evidence</p>
        <h1 className="ew-title">Evidence Workbench</h1>
        <p className="ew-lede">
          Local-first photo, video, and calendar confirmation — Fortune-50 confirmation console.
          Saves under <code className="rounded bg-kelly-fog px-1.5 py-0.5 font-mono text-[12px]">data/campaign-media/</code>{" "}
          on this machine. Prefer Unknown. Never invent geography.
        </p>
      </header>

      <EvidenceToolingBanner initial={tooling} />

      <EvidenceAiCommandCenter />

      <EvidenceNextActionsStrip actions={nextActions.actions} generatedAt={nextActions.generatedAt} />

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <div className="ew-stat">
          <p className="ew-stat-label">Publish queue</p>
          <p className="mt-1 font-body text-sm font-semibold text-kelly-text">
            {unknownCounty} unknown · {needsApproval} need approval · {publishQueue.totals.approvedPublic}{" "}
            approved
          </p>
        </div>
        <div className="ew-stat">
          <p className="ew-stat-label">Ship</p>
          <p className="mt-1 font-body text-sm font-semibold text-kelly-text">
            {shipReport.totals.overlayJsonDirty} overlay dirty · {shipReport.totals.derivativeLocalOnly}{" "}
            deriv local-only
          </p>
        </div>
        <div className="ew-stat">
          <p className="ew-stat-label">Intake</p>
          <p className="mt-1 font-body text-sm font-semibold text-kelly-text">
            {intakeStatus.newOnDisk} new on disk · {intakeStatus.queueCount} in queue
          </p>
        </div>
        <div className="ew-stat">
          <p className="ew-stat-label">Videos</p>
          <p className="mt-1 font-body text-sm font-semibold text-kelly-text">
            {speeches.length} speeches · {speechConfirmQueue.totals.noCounty} no county ·{" "}
            {speechConfirmQueue.totals.needsPublish} needs publish
          </p>
        </div>
        <div className="ew-stat">
          <p className="ew-stat-label">Media command</p>
          <p className="mt-1 font-body text-sm">
            <Link href="/admin/owned-media" className="os-link">
              Owned Media
            </Link>
            {" · "}
            <Link href="/admin/media/youtube" className="os-link">
              YouTube
            </Link>
            {" · "}
            <Link href="/campaign-photos" className="os-link">
              Public albums
            </Link>
          </p>
        </div>
      </div>

      <EvidenceCollapsedChrome />

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Evidence workbench tabs">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/evidence-workbench?tab=${t.id}`}
            className={cn("ew-tab", tab === t.id ? "ew-tab-active" : "ew-tab-idle")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="ew-panel mt-5">
        {tab === "queue" ? (
          <>
            <div id="ew-tonight-ritual">
              <EvidenceEventNightLoopPanel
                calendarRows={calendar.rows.map((r) => ({
                  id: r.id,
                  date: r.date,
                  summary: r.summary,
                  status: r.status,
                }))}
                initialNeedsApprovalIds={publishQueue.buckets.needsApproval.map((i) => i.id)}
              />
            </div>
            <EvidenceFitBacklogPanel initialBacklog={fitBacklog} />
            <EvidencePublishQueuePanel
              initialQueue={publishQueue}
              initialSpeechQueue={speechConfirmQueue}
              initialCoverageHeat={coverageHeat}
              initialUrlFilter={urlFilter}
            />
          </>
        ) : null}
        {tab === "ship" ? <EvidenceShipPanel initialReport={shipReport} /> : null}
        {tab === "placement" ? (
          <EvidencePlacementPanel initialProposal={placementProposal} current={placementCurrent} />
        ) : null}
        {tab === "calendar" ? (
          <>
            <div className="mb-4 rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-3">
              <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                Tonight ritual lives on Publish Queue
              </p>
              <p className="mt-1 font-body text-xs text-[#364272]">
                Confirm calendar places here, then run pack → identify → approve → ship on Queue (one
                desk — no duplicate ritual on this tab).
              </p>
              <Link
                href="/admin/evidence-workbench?tab=queue"
                className="mt-2 inline-flex rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white"
              >
                Open Tonight ritual on Queue →
              </Link>
            </div>
            <EvidenceCalendarPanel
              initialRows={calendar.rows}
              counties={counties}
              sourceNote={calendar.sourceNote}
              sinceDate={calendar.sinceDate}
              initialFilter={urlFilter}
            />
          </>
        ) : null}
        {tab === "photos" ? (
          <>
            <EvidencePhotoReadinessPanel initialMatrix={photoReadiness} />
            <EvidencePhotosPanel
              photos={photos}
              counties={counties}
              initialPhotoId={focusId}
              initialFilter={urlFilter}
              needsPromoteIds={photoReadiness.rows
                .filter((r) => r.assemblyCount > 0 && !r.hasPublicOverride)
                .map((r) => r.photoId)}
              stageCounts={{
                intake: publishQueue.totals.draftIngest + publishQueue.totals.intakeNewOnDisk,
                unknown: publishQueue.totals.unknownCounty,
                needsApproval: publishQueue.totals.needsApproval,
                needsPromote: photoReadiness.needsPromote,
                approved: publishQueue.totals.approvedPublic,
              }}
            />
          </>
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
            <EvidenceSpeechesPanel
              speeches={speeches}
              initialSpeechId={focusId}
              initialFilter={urlFilter}
            />
          </>
        ) : null}
        {tab === "ingest" ? (
          <EvidenceIngestPanel initialCandidates={ingestCandidates} initialStatus={intakeStatus} />
        ) : null}
      </div>
    </div>
  );
}
