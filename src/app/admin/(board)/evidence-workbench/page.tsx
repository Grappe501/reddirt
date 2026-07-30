import Link from "next/link";
import { CAMPAIGN_MEDIA_REGISTRY } from "@/content/media/campaign-media-registry";
import { CAMPAIGN_PHOTO_REGISTRY } from "@/content/media/campaign-photo-registry";
import { EvidenceAiCommandCenter } from "@/components/admin/evidence-workbench/EvidenceAiCommandCenter";
import { EvidenceCalendarPanel } from "@/components/admin/evidence-workbench/EvidenceCalendarPanel";
import { EvidenceCollapsedChrome } from "@/components/admin/evidence-workbench/EvidenceCollapsedChrome";
import { EvidenceEditIntentRail } from "@/components/admin/evidence-workbench/EvidenceEditIntentRail";
import { EvidenceEventNightLoopPanel } from "@/components/admin/evidence-workbench/EvidenceEventNightLoopPanel";
import { EvidenceFitBacklogPanel } from "@/components/admin/evidence-workbench/EvidenceFitBacklogPanel";
import { EvidenceIngestPanel } from "@/components/admin/evidence-workbench/EvidenceIngestPanel";
import { EvidenceNextActionsStrip } from "@/components/admin/evidence-workbench/EvidenceNextActionsStrip";
import { EvidencePhotoReadinessPanel } from "@/components/admin/evidence-workbench/EvidencePhotoReadinessPanel";
import { EvidencePhotosPanel } from "@/components/admin/evidence-workbench/EvidencePhotosPanel";
import { EvidencePublicSurfaceDesk } from "@/components/admin/evidence-workbench/EvidencePublicSurfaceDesk";
import { EvidencePublishQueuePanel } from "@/components/admin/evidence-workbench/EvidencePublishQueuePanel";
import { EvidenceShipPanel } from "@/components/admin/evidence-workbench/EvidenceShipPanel";
import { EvidenceSpeechConfirmPanel } from "@/components/admin/evidence-workbench/EvidenceSpeechConfirmPanel";
import { EvidenceSpeechesPanel } from "@/components/admin/evidence-workbench/EvidenceSpeechesPanel";
import { EvidenceToolingBanner } from "@/components/admin/evidence-workbench/EvidenceToolingBanner";
import { buildFitRankedBacklog } from "@/lib/campaign-media/evidence-fit-backlog";
import {
  EVIDENCE_DESK_TABS,
  resolveEvidenceDeskTab,
} from "@/lib/campaign-media/evidence-desk-tabs";
import {
  parseEvidenceEditIntent,
  parseEvidenceEditSiteSurface,
} from "@/lib/campaign-media/evidence-edit-intents";
import { rankEvidenceNextActions } from "@/lib/campaign-media/evidence-next-actions";
import { getEvidenceToolingReadiness } from "@/lib/campaign-media/evidence-tooling-readiness";
import {
  photoPublicSurfacesPreview,
  speechPublicSurfacesPreview,
} from "@/lib/campaign-media/county-albums-live";
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
import {
  listSpeechOptionsForArrival,
  listVideoMasterArrival,
} from "@/lib/campaign-media/video-master-arrival";
import { photoRequiresConsentHold } from "@/lib/campaign-media/photo-consent-hold";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ tab?: string; id?: string; filter?: string; intent?: string; surface?: string }>;
};

export default async function EvidenceWorkbenchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const urlFilter = sp.filter?.trim() || undefined;
  const intent = parseEvidenceEditIntent(sp.intent);
  const surface = parseEvidenceEditSiteSurface(sp.surface);
  const tab = resolveEvidenceDeskTab(sp.tab, urlFilter);
  const focusId = sp.id?.trim() || undefined;

  const calendar = loadCalendarPresenceStore();
  const photoStore = loadPhotoEvidenceStore();
  const speechStore = loadSpeechEvidenceStore();
  const ingestDrafts = loadPhotoIngestDrafts();
  const livePhotos = listCampaignPhotosLive(photoStore);
  const liveById = new Map(livePhotos.map((p) => [p.id, p]));
  const ingestCandidates = listDiskPhotoIngestCandidates();
  const { getPhotoIntakeStatus } = await import("@/lib/campaign-media/photo-ingest");
  const intakeStatus = getPhotoIntakeStatus();
  const videoArrival = listVideoMasterArrival();
  const arrivalSpeeches = listSpeechOptionsForArrival();
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

  const focusedLivePhoto = focusId ? liveById.get(focusId) : undefined;
  const focusedSpeechRow = focusId ? speeches.find((s) => s.id === focusId) : undefined;
  const focusedPhotoPreview =
    focusedLivePhoto != null
      ? {
          id: focusedLivePhoto.id,
          title:
            focusedLivePhoto.accessibility.caption ||
            focusedLivePhoto.campaign.eventName ||
            focusedLivePhoto.id,
          surfaces: photoPublicSurfacesPreview(focusedLivePhoto),
        }
      : null;
  const focusedSpeechPreview =
    focusedSpeechRow != null
      ? {
          id: focusedSpeechRow.id,
          title: focusedSpeechRow.title,
          surfaces: speechPublicSurfacesPreview({
            speechId: focusedSpeechRow.id,
            approvedForPublic: focusedSpeechRow.overlay?.approvedForPublic,
            homepageCandidate: focusedSpeechRow.overlay?.homepageCandidate,
            counties: focusedSpeechRow.overlay?.counties?.length
              ? focusedSpeechRow.overlay.counties
              : focusedSpeechRow.baseCounties,
          }),
        }
      : null;

  const photoStageCounts = {
    intake: publishQueue.totals.draftIngest + publishQueue.totals.intakeNewOnDisk,
    unknown: publishQueue.totals.unknownCounty,
    needsApproval: publishQueue.totals.needsApproval,
    needsPromote: photoReadiness.needsPromote,
    approved: publishQueue.totals.approvedPublic,
  };
  const needsPromoteIds = photoReadiness.rows
    .filter((r) => r.assemblyCount > 0 && !r.hasPublicOverride)
    .map((r) => r.photoId);

  const identifyFilter = urlFilter ?? "unknown";
  const editFilter = urlFilter ?? "needsPromote";

  return (
    <div className="ew-shell ew-display">
      <header className="ew-hero">
        <p className="ew-eyebrow">Campaign OS · Media evidence</p>
        <h1 className="ew-title">Evidence Workbench</h1>
        <p className="ew-lede">
          Phase 4 Publish & deliver: surfaces + Ship last mile only. Prefer Unknown. Never invent
          geography. Saves under{" "}
          <code className="rounded bg-kelly-fog px-1.5 py-0.5 font-mono text-[12px]">
            data/campaign-media/
          </code>
          .
        </p>
      </header>

      <EvidenceToolingBanner initial={tooling} />

      <EvidenceAiCommandCenter />

      <EvidenceNextActionsStrip actions={nextActions.actions} generatedAt={nextActions.generatedAt} />

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <div className="ew-stat">
          <p className="ew-stat-label">Identify</p>
          <p className="mt-1 font-body text-sm font-semibold text-kelly-text">
            {unknownCounty} unknown · {intakeStatus.newOnDisk} new on disk
          </p>
        </div>
        <div className="ew-stat">
          <p className="ew-stat-label">County</p>
          <p className="mt-1 font-body text-sm font-semibold text-kelly-text">
            {needsApproval} need approval · {publishQueue.totals.approvedPublic} approved
          </p>
        </div>
        <div className="ew-stat">
          <p className="ew-stat-label">Edit</p>
          <p className="mt-1 font-body text-sm font-semibold text-kelly-text">
            {photoReadiness.needsPromote} need promote · videos cuts on Edit
          </p>
        </div>
        <div className="ew-stat">
          <p className="ew-stat-label">Publish</p>
          <p className="mt-1 font-body text-sm font-semibold text-kelly-text">
            {shipReport.totals.overlayJsonDirty} overlay dirty ·{" "}
            {shipReport.totals.derivativeLocalOnly} deriv local-only
          </p>
        </div>
        <div className="ew-stat">
          <p className="ew-stat-label">Media command</p>
          <p className="mt-1 font-body text-sm">
            <Link href="/edit" className="os-link">
              Website edit
            </Link>
            {" · "}
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

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Evidence workbench desks">
        {EVIDENCE_DESK_TABS.map((t) => (
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
        {tab === "ingest" ? (
          <>
            <div className="mb-4 rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] p-3">
              <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                Arrival · stills + video masters
              </p>
              <p className="mt-1 font-body text-xs text-[#364272]">
                Drop zone routes images and videos. Soft-watch polls while Arrival is open (detect
                only — never auto-Intake). Bring into system intakes stills; attach unmatched masters
                to speeches. Labeling stays on Identify.
              </p>
              <Link
                href="/admin/evidence-workbench?tab=identify&filter=draft"
                className="mt-2 inline-flex rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white"
              >
                Send queue to Identify →
              </Link>
            </div>
            <EvidenceIngestPanel
              initialCandidates={ingestCandidates}
              initialStatus={intakeStatus}
              initialVideoSummary={videoArrival}
              initialSpeeches={arrivalSpeeches}
            />
          </>
        ) : null}

        {tab === "identify" ? (
          <>
            <div className="mb-4 rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-3">
              <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                Identify Board · Board A
              </p>
              <p className="mt-1 font-body text-xs text-[#364272]">
                One asset at a time. AI-first Suggest / Vision → review → Save → Route (required
                before Prev/Next). Prefer Unknown. No Pro Edit on this desk.
              </p>
            </div>
            <EvidenceFitBacklogPanel initialBacklog={fitBacklog} />
            <EvidencePhotosPanel
              photos={photos}
              counties={counties}
              initialPhotoId={focusId}
              initialFilter={identifyFilter}
              needsPromoteIds={needsPromoteIds}
              stageCounts={photoStageCounts}
              deskMode="identify"
            />
            <div className="mt-6 border-t-2 border-[#000066]/10 pt-4">
              <EvidenceSpeechConfirmPanel
                speeches={speeches}
                initialQueue={speechConfirmQueue}
                initialRows={speechReadiness.rows}
                initialPlacement={speechPlacementProposal}
                placementCurrent={speechPlacementCurrent}
                hidePlacement
                identifyDesk
              />
            </div>
          </>
        ) : null}

        {tab === "county" ? (
          <>
            <div className="mb-4 rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] p-3">
              <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                County desk · fast path
              </p>
              <p className="mt-1 font-body text-xs text-[#364272]">
                After Identify: approve into county albums with full metadata. No creative edit here.
                Special-use assets go to Edit, then Publish.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/admin/evidence-workbench?tab=identify&filter=unknown"
                  className="rounded-md border-2 border-[#000066] bg-white px-3 py-1.5 font-body text-xs font-bold text-[#000066]"
                >
                  ← Identify Unknown
                </Link>
                <Link
                  href="/admin/evidence-workbench?tab=publish"
                  className="rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white"
                >
                  Publish desk →
                </Link>
              </div>
            </div>
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
            <EvidencePublishQueuePanel
              initialQueue={publishQueue}
              initialSpeechQueue={speechConfirmQueue}
              initialCoverageHeat={coverageHeat}
              initialUrlFilter={urlFilter}
            />
          </>
        ) : null}

        {tab === "edit" ? (
          <>
            <EvidenceEditIntentRail focusId={focusId} intent={intent} surface={surface} />
            <EvidencePhotoReadinessPanel initialMatrix={photoReadiness} />
            <EvidencePhotosPanel
              photos={photos}
              counties={counties}
              initialPhotoId={focusId}
              initialFilter={editFilter}
              needsPromoteIds={needsPromoteIds}
              stageCounts={photoStageCounts}
              deskMode="edit"
              editIntent={intent}
              editSurface={surface}
            />
            <div className="mt-6 border-t-2 border-[#000066]/10 pt-4">
              <EvidenceSpeechesPanel
                speeches={speeches}
                initialSpeechId={focusId}
                initialFilter={urlFilter}
                deskMode="edit"
                editIntent={intent}
              />
            </div>
          </>
        ) : null}

        {tab === "publish" ? (
          <>
            <div className="mb-4 rounded-lg border-2 border-[#000066]/15 bg-[#f4f7fc] p-3">
              <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                Publish & deliver · Phase 4
              </p>
              <p className="mt-1 font-body text-xs text-[#364272]">
                One Ship home. Curate public surfaces above, then Ship last mile below (overlays →
                campaign-shipped → graduation → commit). Tonight / Command no longer ship binaries —
                they link here.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href="#ew-public-surfaces"
                  className="rounded-md border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-xs font-semibold text-[#12124a]"
                >
                  Public surfaces ↓
                </a>
                <a
                  href="#ew-ship-last-mile"
                  className="rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white"
                >
                  Ship last mile ↓
                </a>
              </div>
            </div>
            <div id="ew-public-surfaces">
              <EvidencePublicSurfaceDesk
                photoProposal={placementProposal}
                photoCurrent={placementCurrent}
                speechProposal={speechPlacementProposal}
                speechCurrent={speechPlacementCurrent}
                focusedPhoto={focusedPhotoPreview}
                focusedSpeech={focusedSpeechPreview}
                embedOnPublishDesk
              />
            </div>
            <div id="ew-ship-last-mile" className="mt-6 border-t-2 border-[#000066]/10 pt-4">
              <EvidenceShipPanel initialReport={shipReport} />
            </div>
          </>
        ) : null}

        {tab === "calendar" ? (
          <>
            <div className="mb-4 rounded-lg border-2 border-[#ca913d]/50 bg-[#fff8ef] p-3">
              <p className="font-heading text-xs font-bold uppercase text-[#000066]">
                Calendar · side desk
              </p>
              <p className="mt-1 font-body text-xs text-[#364272]">
                Confirm places here. Event-night pack / approve runs on County desk after Identify.
              </p>
              <Link
                href="/admin/evidence-workbench?tab=county"
                className="mt-2 inline-flex rounded-md border-2 border-[#000066] bg-[#000066] px-3 py-1.5 font-body text-xs font-bold text-white"
              >
                Open County desk →
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
      </div>
    </div>
  );
}
