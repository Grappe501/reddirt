import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  findChunkById,
  getCachedAllStrategyManualChunks,
  parseStrategyChunkId,
  STRATEGY_CHUNK_ROOT_PATH_TOKEN,
  toIndexRow,
} from "@/lib/campaign-strategy/strategy-chunking";

export const dynamic = "force-dynamic";

/**
 * Strategy manual chunk index + fetch (admin session). For RAG / “strategy partner” agents.
 *
 * - GET (no query): full index, `plainTextPreview` only
 * - GET ?pathKey=lane: filter by manual chapter
 * - GET ?manualDomain=strategic-plan|campaign-system: limit corpus (default: all)
 * - GET ?id=<chunkId>: one chunk; add &include=body for markdown
 */
export async function GET(req: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const url = new URL(req.url);
  const id = url.searchParams.get("id")?.trim();
  const pathKeyFilter = url.searchParams.get("pathKey");
  const manualDomainRaw = url.searchParams.get("manualDomain")?.trim();
  const includeBody = url.searchParams.get("include") === "body";

  const all = await getCachedAllStrategyManualChunks();

  if (id) {
    if (!parseStrategyChunkId(id)) {
      return NextResponse.json({ ok: false, error: "invalid_chunk_id" }, { status: 400 });
    }
    const chunk = findChunkById(all, id);
    if (!chunk) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    const row = toIndexRow(chunk);
    if (!includeBody) {
      return NextResponse.json({
        ok: true,
        chunk: { ...row, plainText: chunk.plainText },
      });
    }
    return NextResponse.json({
      ok: true,
      chunk: { ...row, plainText: chunk.plainText, markdown: chunk.markdown },
    });
  }

  let rows = all.map(toIndexRow);
  if (pathKeyFilter !== null && pathKeyFilter !== "") {
    rows = rows.filter((r) => r.pathKey === pathKeyFilter);
  }
  if (manualDomainRaw === "strategic-plan" || manualDomainRaw === "campaign-system") {
    rows = rows.filter((r) => r.manualDomain === manualDomainRaw);
  } else if (manualDomainRaw != null && manualDomainRaw !== "") {
    return NextResponse.json(
      { ok: false, error: "invalid_manualDomain", message: "Use strategic-plan or campaign-system." },
      { status: 400 },
    );
  }

  const strategicChunks = all.filter((c) => c.manualDomain === "strategic-plan").length;
  const campaignSystemChunks = all.filter((c) => c.manualDomain === "campaign-system").length;

  return NextResponse.json({
    ok: true,
    domain: "campaign_strategy_and_system_manuals",
    purpose: "strategy_partner_rag",
    classification: "internal_campaign_planning",
    corpora: {
      strategicPlan: {
        root: "docs/kelly-grappe-sos-strategic-plan-manual",
        chunkCount: strategicChunks,
        readerBasePath: "/admin/campaign-strategy",
      },
      campaignSystemManual: {
        root: "campaign-system-manual",
        chunkCount: campaignSystemChunks,
        note: "No admin reader route; use repoRelativePath / Doc: in RAG context.",
      },
    },
    idFormat: `${STRATEGY_CHUNK_ROOT_PATH_TOKEN} or <pathKey>::<githubHeadingSlug>::<ordinal>`,
    note: "Empty Kelly-SOS pathKey (overview) is encoded as __root__ in chunk ids. Campaign-system pathKeys are prefixed campaign-system/.",
    readerBasePath: "/admin/campaign-strategy",
    endpoints: {
      index: "GET /api/admin/campaign-strategy/chunks",
      filter: "GET /api/admin/campaign-strategy/chunks?pathKey=lane",
      byCorpus: "GET /api/admin/campaign-strategy/chunks?manualDomain=campaign-system",
      one: "GET /api/admin/campaign-strategy/chunks?id=<encodeURIComponent(id)>",
      oneWithMarkdown: "GET /api/admin/campaign-strategy/chunks?id=...&include=body",
    },
    chunkCount: rows.length,
    chunks: rows,
  });
}
