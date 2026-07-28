import Link from "next/link";
import { OwnedMediaDerivativeType } from "@prisma/client";
import {
  disablePublicMediaPlacementAction,
  runPublicDerivativeWorkerAction,
  upsertPublicMediaPlacementAction,
} from "@/app/admin/public-media-placement-actions";
import { prisma } from "@/lib/db";
import { canPublicReadOwnedMedia } from "@/lib/owned-media/public-read-access";
import { focalToObjectPosition, resolveEffectiveFocal } from "@/lib/public-media/focal";
import { collectPublicMediaDiagnostics } from "@/lib/public-media/diagnostics";
import { listPublicMediaSlotsForPage } from "@/lib/public-media/slot-registry";

export const dynamic = "force-dynamic";

export default async function PublicMediaPlacementsAdminPage() {
  const slots = listPublicMediaSlotsForPage("home");
  const [placements, approvedAssets, diagnostics] = await Promise.all([
    prisma.publicMediaPlacement.findMany({ include: { ownedMediaAsset: true } }),
    prisma.ownedMediaAsset.findMany({
      where: { approvedForPublicSite: true, kind: "IMAGE" },
      orderBy: { updatedAt: "desc" },
      take: 80,
      select: {
        id: true,
        title: true,
        fileName: true,
        approvedForPublicSite: true,
        isPublic: true,
        reviewStatus: true,
        focalX: true,
        focalY: true,
        width: true,
        height: true,
      },
    }),
    collectPublicMediaDiagnostics(),
  ]);

  const bySlot = new Map(placements.map((p) => [p.slotKey, p]));

  const derivativeReady = await prisma.ownedMediaAsset.findMany({
    where: {
      parentAssetId: { in: approvedAssets.map((a) => a.id) },
      derivativeType: { in: [OwnedMediaDerivativeType.WEB_JPEG, OwnedMediaDerivativeType.THUMBNAIL] },
    },
    select: { parentAssetId: true, derivativeType: true },
  });
  const readyMap = new Map<string, Set<string>>();
  for (const d of derivativeReady) {
    if (!d.parentAssetId) continue;
    const set = readyMap.get(d.parentAssetId) ?? new Set();
    set.add(d.derivativeType);
    readyMap.set(d.parentAssetId, set);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-kelly-gold">Media Center</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-ink">Public site placements</h1>
          <p className="mt-2 max-w-2xl text-sm text-kelly-slate">
            Assign approved Owned Media to typed homepage slots. Placement is not approval —{" "}
            <code className="rounded bg-kelly-fog px-1">approvedForPublicSite</code> remains required.
          </p>
        </div>
        <Link href="/admin/owned-media" className="text-sm font-semibold text-kelly-blue underline">
          ← Media library
        </Link>
      </div>

      <section className="rounded-card border border-kelly-ink/10 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Diagnostics</h2>
        <ul className="mt-3 grid gap-2 text-sm text-kelly-slate sm:grid-cols-2">
          <li>Public-approved assets: {diagnostics.publicApprovedAssets}</li>
          <li>Missing focal points: {diagnostics.assetsMissingFocal}</li>
          <li>Active placements: {diagnostics.activePlacements}</li>
          <li>Blocked by approval: {diagnostics.blockedByApproval}</li>
          <li>Blocked by missing derivative: {diagnostics.blockedByMissingDerivative}</li>
          <li>WEB derivatives: {diagnostics.webDerivativeReady}</li>
          <li>THUMB derivatives: {diagnostics.thumbDerivativeReady}</li>
          <li>Owned-resolving slots: {diagnostics.slotsResolvingOwnedMedia.length}</li>
          <li>Static-fallback slots: {diagnostics.slotsUsingStaticFallback.length}</li>
        </ul>
        <form action={runPublicDerivativeWorkerAction} className="mt-4">
          <button
            type="submit"
            className="rounded-btn bg-kelly-navy px-4 py-2 text-sm font-bold uppercase tracking-wider text-white"
          >
            Run WEB/THUMB derivative worker (10)
          </button>
        </form>
      </section>

      <div className="space-y-8">
        {slots.map((slot) => {
          const current = bySlot.get(slot.slotKey);
          const asset = current?.ownedMediaAsset;
          const publishable = asset ? canPublicReadOwnedMedia(asset) && Boolean(current?.enabled) : false;
          const ready = asset ? readyMap.get(asset.id) : undefined;
          const focal = resolveEffectiveFocal({
            placementFocalX: current?.focalXOverride,
            placementFocalY: current?.focalYOverride,
            assetFocalX: asset?.focalX,
            assetFocalY: asset?.focalY,
          });
          return (
            <section key={slot.slotKey} className="rounded-card border border-kelly-ink/10 bg-kelly-fog/40 p-5">
              <h2 className="font-heading text-lg font-bold text-kelly-navy">{slot.slotKey}</h2>
              <p className="mt-1 text-sm text-kelly-slate">
                Needs {slot.requiredDerivative} · {slot.aspectRatioGuidance} · video{" "}
                {slot.videoAllowed ? "allowed" : "not allowed"}
              </p>
              <ul className="mt-3 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-kelly-slate">
                <li className={asset ? "text-kelly-navy" : ""}>Uploaded: {asset ? "yes" : "—"}</li>
                <li className={asset && canPublicReadOwnedMedia(asset) ? "text-kelly-success" : ""}>
                  Approved for public: {asset && canPublicReadOwnedMedia(asset) ? "yes" : "no"}
                </li>
                <li className={ready?.has(slot.requiredDerivative) ? "text-kelly-success" : "text-amber-700"}>
                  Derivative ready: {ready?.has(slot.requiredDerivative) ? "yes" : "no"}
                </li>
                <li>Assigned: {current ? "yes" : "no"}</li>
                <li className={publishable ? "text-kelly-success" : ""}>
                  Publishable: {publishable ? "yes" : "no"}
                </li>
              </ul>
              {asset ? (
                <p className="mt-2 text-sm text-kelly-slate">
                  Current: {asset.title} · preview crop{" "}
                  <code className="rounded bg-white px-1">{focalToObjectPosition(focal.x, focal.y)}</code>
                </p>
              ) : null}

              <form action={upsertPublicMediaPlacementAction} className="mt-4 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="slotKey" value={slot.slotKey} />
                <label className="block text-sm sm:col-span-2">
                  <span className="font-semibold text-kelly-ink">Approved asset</span>
                  <select
                    name="ownedMediaAssetId"
                    required
                    defaultValue={current?.ownedMediaAssetId ?? ""}
                    className="mt-1 w-full rounded-md border border-kelly-ink/20 bg-white px-3 py-2"
                  >
                    <option value="" disabled>
                      Select asset…
                    </option>
                    {approvedAssets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.id.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-semibold">Enabled</span>
                  <select
                    name="enabled"
                    defaultValue={current?.enabled === false ? "false" : "true"}
                    className="mt-1 w-full rounded-md border border-kelly-ink/20 bg-white px-3 py-2"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-semibold">Placement kind</span>
                  <select
                    name="placementKind"
                    defaultValue={current?.placementKind ?? "IMAGE"}
                    className="mt-1 w-full rounded-md border border-kelly-ink/20 bg-white px-3 py-2"
                  >
                    <option value="IMAGE">IMAGE</option>
                    <option value="BACKGROUND">BACKGROUND</option>
                    <option value="PORTRAIT">PORTRAIT</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="POSTER">POSTER</option>
                    <option value="GALLERY">GALLERY</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="font-semibold">Asset focal X (0–1)</span>
                  <input
                    name="assetFocalX"
                    defaultValue={asset?.focalX ?? ""}
                    placeholder="0.5"
                    className="mt-1 w-full rounded-md border border-kelly-ink/20 bg-white px-3 py-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold">Asset focal Y (0–1)</span>
                  <input
                    name="assetFocalY"
                    defaultValue={asset?.focalY ?? ""}
                    placeholder="0.5"
                    className="mt-1 w-full rounded-md border border-kelly-ink/20 bg-white px-3 py-2"
                  />
                </label>
                {slot.focalOverrideAllowed ? (
                  <>
                    <label className="block text-sm">
                      <span className="font-semibold">Placement focal X override</span>
                      <input
                        name="focalXOverride"
                        defaultValue={current?.focalXOverride ?? ""}
                        className="mt-1 w-full rounded-md border border-kelly-ink/20 bg-white px-3 py-2"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="font-semibold">Placement focal Y override</span>
                      <input
                        name="focalYOverride"
                        defaultValue={current?.focalYOverride ?? ""}
                        className="mt-1 w-full rounded-md border border-kelly-ink/20 bg-white px-3 py-2"
                      />
                    </label>
                  </>
                ) : null}
                <label className="block text-sm sm:col-span-2">
                  <span className="font-semibold">Alt override</span>
                  <input
                    name="altTextOverride"
                    defaultValue={current?.altTextOverride ?? ""}
                    className="mt-1 w-full rounded-md border border-kelly-ink/20 bg-white px-3 py-2"
                  />
                </label>
                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    className="rounded-btn bg-kelly-gold px-4 py-2 text-sm font-bold uppercase tracking-wider text-kelly-navy"
                  >
                    Save placement
                  </button>
                </div>
              </form>
              {current ? (
                <form action={disablePublicMediaPlacementAction} className="mt-3">
                  <input type="hidden" name="slotKey" value={slot.slotKey} />
                  <button type="submit" className="text-sm font-semibold text-red-700 underline">
                    Disable placement
                  </button>
                </form>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
