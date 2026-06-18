import type { Prisma } from "@prisma/client";
import { getOpenAIClient, getOpenAIConfigFromEnv, isOpenAIConfigured } from "@/lib/openai/client";
import { VAULT_MEDIA_ANALYSIS_PROMPT } from "@/lib/openai/prompts";
import { prisma } from "@/lib/db";
import { runTranscriptionForOwnedAsset } from "@/lib/owned-media/transcription/run";
import type { VaultAnalysisBlock, VaultEnrichmentMetadata, VaultSeoBlock } from "./types";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseEnrichment(raw: unknown): VaultEnrichmentMetadata {
  if (!raw || typeof raw !== "object") return {};
  return raw as VaultEnrichmentMetadata;
}

export async function runVaultDeepAnalysis(assetId: string): Promise<{ ok: boolean; message: string }> {
  const asset = await prisma.ownedMediaAsset.findUnique({
    where: { id: assetId },
    include: {
      transcripts: { orderBy: { updatedAt: "desc" }, take: 1 },
      county: { select: { displayName: true, slug: true } },
    },
  });
  if (!asset) return { ok: false, message: "Asset not found." };

  const prior = parseEnrichment(asset.enrichmentMetadata);
  const running: VaultEnrichmentMetadata = {
    ...prior,
    vaultAnalysis: { ...prior.vaultAnalysis, status: "running" },
  };
  await prisma.ownedMediaAsset.update({
    where: { id: assetId },
    data: { enrichmentMetadata: running as Prisma.InputJsonValue },
  });

  let transcriptText = asset.transcripts[0]?.transcriptText ?? "";
  const isAV = asset.kind === "VIDEO" || asset.kind === "AUDIO" || asset.mimeType.startsWith("video/") || asset.mimeType.startsWith("audio/");

  if (isAV && !transcriptText.trim()) {
    const tx = await runTranscriptionForOwnedAsset(assetId);
    if (tx.ok) {
      const refreshed = await prisma.ownedMediaTranscript.findFirst({
        where: { ownedMediaId: assetId },
        orderBy: { updatedAt: "desc" },
      });
      transcriptText = refreshed?.transcriptText ?? "";
    }
  }

  if (!isOpenAIConfigured()) {
    const fallback: VaultEnrichmentMetadata = {
      ...prior,
      vaultAnalysis: {
        status: "skipped",
        analyzedAt: new Date().toISOString(),
        summary: asset.description ?? `${asset.title} — county media from ${asset.county?.displayName ?? asset.countySlug ?? "Arkansas"}.`,
        error: "OPENAI_API_KEY not set — AI analysis skipped.",
      },
      seo: buildFallbackSeo(asset),
    };
    await prisma.ownedMediaAsset.update({
      where: { id: assetId },
      data: {
        enrichmentMetadata: fallback as Prisma.InputJsonValue,
        title: fallback.seo?.title?.slice(0, 200) ?? asset.title,
        description: fallback.seo?.description ?? asset.description,
      },
    });
    return { ok: true, message: "Fallback metadata saved (no OpenAI)." };
  }

  try {
    const { model } = getOpenAIConfigFromEnv();
    const openai = getOpenAIClient();
    const context = [
      `TITLE: ${asset.title}`,
      `KIND: ${asset.kind}`,
      `MIME: ${asset.mimeType}`,
      `COUNTY: ${asset.county?.displayName ?? asset.countySlug ?? "unknown"}`,
      `CITY: ${asset.city ?? ""}`,
      `SPEAKER: ${asset.speakerName ?? ""}`,
      `TAGS: ${asset.issueTags.join(", ")}`,
      `DESCRIPTION: ${asset.description ?? ""}`,
      transcriptText ? `TRANSCRIPT:\n${transcriptText.slice(0, 100_000)}` : "TRANSCRIPT: (none)",
    ].join("\n");

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: VAULT_MEDIA_ANALYSIS_PROMPT },
        { role: "user", content: context },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as {
      summary?: string;
      analysis?: string;
      topics?: string[];
      speakers?: string[];
      mood?: string;
      audience?: string;
      keyMoments?: VaultAnalysisBlock["keyMoments"];
      pullQuotes?: string[];
      claimsNotes?: string[];
      seo?: Partial<VaultSeoBlock>;
    };

    const countySlug = asset.countySlug ?? asset.county?.slug ?? "arkansas";
    const seoSlug = slugify(parsed.seo?.slug ?? asset.title);
    const canonicalPath = `/counties/${countySlug}/media/${assetId}`;

    const seo: VaultSeoBlock = {
      title: parsed.seo?.title ?? asset.title,
      description: parsed.seo?.description ?? parsed.summary ?? asset.title,
      keywords: parsed.seo?.keywords ?? asset.issueTags,
      slug: seoSlug,
      ogTitle: parsed.seo?.ogTitle ?? parsed.seo?.title ?? asset.title,
      ogDescription: parsed.seo?.ogDescription ?? parsed.seo?.description ?? parsed.summary ?? "",
      canonicalPath,
      fileTitle: parsed.seo?.fileTitle ?? asset.canonicalFileName ?? asset.fileName,
    };

    const vaultAnalysis: VaultAnalysisBlock = {
      status: "complete",
      analyzedAt: new Date().toISOString(),
      model,
      summary: parsed.summary ?? "",
      analysis: parsed.analysis ?? "",
      topics: parsed.topics ?? [],
      speakers: parsed.speakers ?? [],
      mood: parsed.mood,
      audience: parsed.audience,
      keyMoments: parsed.keyMoments ?? [],
      pullQuotes: parsed.pullQuotes ?? [],
      claimsNotes: parsed.claimsNotes ?? [],
    };

    const mergedTags = new Set([...asset.issueTags, ...(parsed.topics ?? [])]);

    await prisma.ownedMediaAsset.update({
      where: { id: assetId },
      data: {
        enrichmentMetadata: { ...prior, vaultAnalysis, seo } as Prisma.InputJsonValue,
        title: seo.title.slice(0, 200),
        description: seo.description.slice(0, 2000),
        issueTags: [...mergedTags].slice(0, 24),
        speakerName: asset.speakerName ?? parsed.speakers?.[0] ?? null,
      },
    });

    return { ok: true, message: "Vault analysis complete." };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    const failed: VaultEnrichmentMetadata = {
      ...prior,
      vaultAnalysis: {
        status: "error",
        analyzedAt: new Date().toISOString(),
        error: err,
        summary: prior.vaultAnalysis?.summary,
      },
    };
    await prisma.ownedMediaAsset.update({
      where: { id: assetId },
      data: { enrichmentMetadata: failed as Prisma.InputJsonValue },
    });
    return { ok: false, message: err };
  }
}

function buildFallbackSeo(asset: {
  id: string;
  title: string;
  countySlug: string | null;
  fileName: string;
  canonicalFileName: string | null;
  county: { displayName: string; slug: string } | null;
}): VaultSeoBlock {
  const countySlug = asset.countySlug ?? asset.county?.slug ?? "arkansas";
  const countyName = asset.county?.displayName ?? countySlug;
  return {
    title: `${asset.title} | ${countyName} County Media`,
    description: `Campaign photo and video from ${countyName} County — Kelly Grappe for Arkansas Secretary of State.`,
    keywords: ["arkansas", countySlug, "kelly grappe", "campaign", "county media"],
    slug: slugify(asset.title),
    ogTitle: asset.title,
    ogDescription: `${countyName} County campaign media`,
    canonicalPath: `/counties/${countySlug}/media/${asset.id}`,
    fileTitle: asset.canonicalFileName ?? asset.fileName,
  };
}

export async function runVaultAnalysisForAssets(assetIds: string[]): Promise<number> {
  let done = 0;
  for (const id of assetIds) {
    const r = await runVaultDeepAnalysis(id);
    if (r.ok) done += 1;
  }
  return done;
}
