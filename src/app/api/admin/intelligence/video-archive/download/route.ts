import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  findManifestAssetById,
  findManualSponsorLinkById,
  findOpponentMediaUrl,
  findVideoCandidateById,
} from "@/lib/legislature/videoArchiveRoom";

export const dynamic = "force-dynamic";

/**
 * Download helper — redirects to source URL or owned media file route.
 * Harmony/Arkleg streams may require browser session; team often downloads locally then uploads cuts.
 */
export async function GET(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const url = new URL(req.url);
  const candidateId = url.searchParams.get("candidateId");
  const manualId = url.searchParams.get("manualId");
  const assetId = url.searchParams.get("assetId");
  const opponentMediaId = url.searchParams.get("opponentMediaId");

  if (assetId) {
    const asset = findManifestAssetById(assetId);
    if (!asset) {
      return Response.json({ ok: false, error: "asset_not_found" }, { status: 404 });
    }
    if (asset.ownedMediaAssetId) {
      return Response.redirect(new URL(`/api/owned-campaign-media/${asset.ownedMediaAssetId}/file`, url.origin), 302);
    }
    if (asset.externalUrl) {
      return Response.redirect(asset.externalUrl, 302);
    }
    return Response.json({ ok: false, error: "no_download_url" }, { status: 404 });
  }

  if (manualId) {
    const manual = findManualSponsorLinkById(manualId);
    if (!manual?.videoUrl) {
      return Response.json({ ok: false, error: "manual_not_found" }, { status: 404 });
    }
    return Response.redirect(manual.videoUrl, 302);
  }

  if (opponentMediaId) {
    const mediaUrl = findOpponentMediaUrl(opponentMediaId);
    if (!mediaUrl) {
      return Response.json({ ok: false, error: "opponent_media_not_found" }, { status: 404 });
    }
    return Response.redirect(mediaUrl, 302);
  }

  if (candidateId) {
    const candidate = findVideoCandidateById(candidateId);
    if (!candidate?.videoUrl) {
      return Response.json({ ok: false, error: "candidate_not_found" }, { status: 404 });
    }
    return Response.redirect(candidate.videoUrl, 302);
  }

  return Response.json({ ok: false, error: "missing_query" }, { status: 400 });
}
