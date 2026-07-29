import "server-only";

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { writeEvidencePacketFile } from "@/lib/campaign-media/evidence-ai-memory";
import type { EvidenceOutgoingMetadataPacket } from "@/lib/campaign-media/evidence-ai-types";
import type { PhotoEvidenceOverlay, SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import {
  formatOpenAIErrorForClient,
  getOpenAIClient,
  getOpenAIConfigFromEnv,
  isOpenAIConfigured,
} from "@/lib/openai/client";
import { prisma } from "@/lib/db";

function geoConfidence(county: string, city: string, operatorConfirmed: boolean): "confirmed" | "suggested" | "unknown" {
  if (operatorConfirmed && county !== "Unknown" && city !== "Unknown") return "confirmed";
  if (county === "Unknown" || city === "Unknown") return "unknown";
  return "suggested";
}

function basePacket(partial: Omit<EvidenceOutgoingMetadataPacket, "version" | "generatedAt" | "generator">): EvidenceOutgoingMetadataPacket {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    generator: "evidence-workbench-ai",
    ...partial,
  };
}

export async function buildPhotoOutgoingMetadataPacket(input: {
  photo: CampaignPhotoRecord;
  overlay: PhotoEvidenceOverlay | null;
  operatorConfirmedGeography: boolean;
}): Promise<{ ok: true; packet: EvidenceOutgoingMetadataPacket; relativePath: string } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY not configured." };
  }

  const county = input.overlay?.county?.trim() || input.photo.campaign.county;
  const city = input.overlay?.city?.trim() || input.photo.campaign.city;
  const venue = input.overlay?.venue?.trim() || input.photo.campaign.venue;
  const eventName = input.overlay?.eventName?.trim() || input.photo.campaign.eventName;
  const eventDate = input.overlay?.eventDate?.trim() || input.photo.campaign.eventDate;
  const photographer = input.overlay?.photographer?.trim() || input.photo.campaign.photographer;
  const people =
    input.overlay?.peopleVisible?.length ? input.overlay.peopleVisible : input.photo.campaign.peopleVisible;
  const proves = input.overlay?.whatThisProves?.trim() || "";

  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();

  const prompt = `Build an extensive OUTGOING metadata packet for campaign intelligence reuse.
Rules: Do not invent county/city/venue/people/dates beyond the provided confirmed or Unknown fields. Expand captions and intelligence only from what is given. Prefer honesty in doNotClaim and openQuestions.

Return JSON with keys:
accessibility { altText, caption, seoDescription, extendedDescription }
outgoing { pressCaption, socialCaption, countyPageBlurb, journeyCaption, keywords[], searchHints[] }
intelligence { entities[], places[], reusableFacts[], openQuestions[], doNotClaim[] }
proof { whatThisProves, journeyVerbs[], campaignThemes[], relatedIssues[] }
rawModelNotes (string)

Provided facts:
id=${input.photo.id}
src=${input.photo.src}
filename=${input.photo.basic.originalFilename}
county=${county}
city=${city}
venue=${venue}
eventName=${eventName}
eventDate=${eventDate}
photographer=${photographer}
people=${people.join(", ")}
existingCaption=${input.photo.accessibility.caption}
existingAlt=${input.photo.accessibility.altText}
operatorProofNote=${proves}
operatorConfirmedGeography=${input.operatorConfirmedGeography}`;

  try {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write campaign evidence metadata packets for Arkansas SOS campaign intelligence. Unknown stays Unknown. No unsourced opponent claims.",
        },
        { role: "user", content: prompt },
      ],
    });
    const raw = res.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = JSON.parse(raw) as Partial<EvidenceOutgoingMetadataPacket>;

    const packetId = `photo__${input.photo.id}__${Date.now()}`;
    const packet = basePacket({
      packetId,
      assetKind: "photo",
      assetId: input.photo.id,
      model,
      status: input.operatorConfirmedGeography ? "operator_ready" : "draft",
      identity: {
        src: input.photo.src,
        originalFilename: input.photo.basic.originalFilename,
        title: eventName !== "Unknown" ? eventName : input.photo.accessibility.caption,
      },
      geography: {
        county,
        city,
        venue,
        confidence: geoConfidence(county, city, input.operatorConfirmedGeography),
      },
      event: {
        eventName,
        eventDate,
        photographer,
        peopleVisible: people,
        organizations: input.photo.campaign.organizations ?? [],
      },
      proof: {
        whatThisProves: parsed.proof?.whatThisProves || proves || input.photo.accessibility.caption,
        journeyVerbs: parsed.proof?.journeyVerbs ?? [],
        campaignThemes: parsed.proof?.campaignThemes ?? [],
        relatedIssues: parsed.proof?.relatedIssues ?? [],
      },
      accessibility: {
        altText: parsed.accessibility?.altText || input.photo.accessibility.altText,
        caption: parsed.accessibility?.caption || input.photo.accessibility.caption,
        seoDescription: parsed.accessibility?.seoDescription || input.photo.accessibility.seoDescription || "",
        extendedDescription:
          parsed.accessibility?.extendedDescription || input.photo.accessibility.extendedDescription || "",
      },
      outgoing: {
        pressCaption: parsed.outgoing?.pressCaption || "",
        socialCaption: parsed.outgoing?.socialCaption || "",
        countyPageBlurb: parsed.outgoing?.countyPageBlurb || "",
        journeyCaption: parsed.outgoing?.journeyCaption || "",
        keywords: parsed.outgoing?.keywords ?? [],
        searchHints: parsed.outgoing?.searchHints ?? [],
      },
      intelligence: {
        entities: parsed.intelligence?.entities ?? [],
        places: parsed.intelligence?.places ?? [],
        reusableFacts: parsed.intelligence?.reusableFacts ?? [],
        openQuestions: parsed.intelligence?.openQuestions ?? [],
        doNotClaim: parsed.intelligence?.doNotClaim ?? [],
      },
      provenance: {
        overlaySource: input.overlay ? "photo-evidence.json" : "registry",
        operatorConfirmedGeography: input.operatorConfirmedGeography,
        aiAssisted: true,
        warnings: [
          ...(county === "Unknown" || city === "Unknown"
            ? ["Geography Unknown — do not publish as county presence until confirmed."]
            : []),
        ],
      },
      rawModelNotes: typeof parsed.rawModelNotes === "string" ? parsed.rawModelNotes : undefined,
    });

    const relativePath = writeEvidencePacketFile(packetId, packet);
    await persistPacketToOwnedMediaIfPossible(packet);
    return { ok: true, packet, relativePath };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}

export async function buildSpeechOutgoingMetadataPacket(input: {
  media: CampaignMediaRecord;
  overlay: SpeechEvidenceOverlay | null;
  operatorConfirmedGeography: boolean;
}): Promise<{ ok: true; packet: EvidenceOutgoingMetadataPacket; relativePath: string } | { ok: false; error: string }> {
  if (!isOpenAIConfigured()) {
    return { ok: false, error: "OPENAI_API_KEY not configured." };
  }

  const counties = input.overlay?.counties?.length ? input.overlay.counties : input.media.counties ?? [];
  const county = counties[0] || "Unknown";
  const city = input.overlay?.city?.trim() || "Unknown";
  const proves = input.overlay?.whatThisProves?.trim() || "";

  const client = getOpenAIClient();
  const { model } = getOpenAIConfigFromEnv();
  const prompt = `Build an extensive OUTGOING metadata packet for a campaign speech/video.
Do not invent geography beyond provided counties/city. Return JSON with accessibility, outgoing, intelligence, proof, rawModelNotes (same shape as photo packets).

id=${input.media.id}
title=${input.media.title}
description=${input.media.description}
counties=${counties.join(", ") || "Unknown"}
city=${city}
proof=${proves}
topics=${input.media.topics.join(", ")}
operatorConfirmedGeography=${input.operatorConfirmedGeography}`;

  try {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You write campaign speech metadata packets for Arkansas SOS campaign intelligence. Unknown stays Unknown.",
        },
        { role: "user", content: prompt },
      ],
    });
    const raw = res.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = JSON.parse(raw) as Partial<EvidenceOutgoingMetadataPacket>;
    const packetId = `speech__${input.media.id}__${Date.now()}`;
    const packet = basePacket({
      packetId,
      assetKind: "speech",
      assetId: input.media.id,
      model,
      status: input.operatorConfirmedGeography ? "operator_ready" : "draft",
      identity: {
        title: input.media.title,
        slug: input.media.slug,
        youtubeVideoId: input.media.youtubeVideoId,
      },
      geography: {
        county,
        city,
        venue: "Unknown",
        confidence: geoConfidence(county, city, input.operatorConfirmedGeography),
      },
      event: {
        eventName: input.media.title,
        eventDate: input.media.uploadDate || "Unknown",
        photographer: "Unknown",
        peopleVisible: ["Kelly Grappe"],
        organizations: [],
      },
      proof: {
        whatThisProves: parsed.proof?.whatThisProves || proves || input.media.summary || input.media.description,
        journeyVerbs: parsed.proof?.journeyVerbs ?? ["spoke"],
        campaignThemes: parsed.proof?.campaignThemes ?? input.media.topics,
        relatedIssues: parsed.proof?.relatedIssues ?? [],
      },
      accessibility: {
        altText: parsed.accessibility?.altText || input.media.title,
        caption: parsed.accessibility?.caption || input.media.shortTitle || input.media.title,
        seoDescription: parsed.accessibility?.seoDescription || input.media.description.slice(0, 160),
        extendedDescription: parsed.accessibility?.extendedDescription || input.media.description,
      },
      outgoing: {
        pressCaption: parsed.outgoing?.pressCaption || "",
        socialCaption: parsed.outgoing?.socialCaption || "",
        countyPageBlurb: parsed.outgoing?.countyPageBlurb || "",
        journeyCaption: parsed.outgoing?.journeyCaption || "",
        keywords: parsed.outgoing?.keywords ?? input.media.topics,
        searchHints: parsed.outgoing?.searchHints ?? [],
      },
      intelligence: {
        entities: parsed.intelligence?.entities ?? ["Kelly Grappe"],
        places: parsed.intelligence?.places ?? counties,
        reusableFacts: parsed.intelligence?.reusableFacts ?? [],
        openQuestions: parsed.intelligence?.openQuestions ?? [],
        doNotClaim: parsed.intelligence?.doNotClaim ?? [],
      },
      provenance: {
        overlaySource: input.overlay ? "speech-evidence.json" : "registry",
        operatorConfirmedGeography: input.operatorConfirmedGeography,
        aiAssisted: true,
        warnings: county === "Unknown" ? ["County Unknown — not countable as presence."] : [],
      },
      rawModelNotes: typeof parsed.rawModelNotes === "string" ? parsed.rawModelNotes : undefined,
    });

    const relativePath = writeEvidencePacketFile(packetId, packet);
    await persistPacketToOwnedMediaIfPossible(packet);
    return { ok: true, packet, relativePath };
  } catch (err) {
    return { ok: false, error: formatOpenAIErrorForClient(err) };
  }
}

/** Best-effort: attach packet onto OwnedMediaAsset.enrichmentMetadata when a filename match exists. */
async function persistPacketToOwnedMediaIfPossible(packet: EvidenceOutgoingMetadataPacket): Promise<void> {
  try {
    const filename = packet.identity.originalFilename?.trim();
    if (!filename) return;
    const asset = await prisma.ownedMediaAsset.findFirst({
      where: {
        OR: [{ originalFileName: filename }, { fileName: filename }, { canonicalFileName: filename }],
      },
      select: { id: true, enrichmentMetadata: true },
    });
    if (!asset) return;
    const prev =
      asset.enrichmentMetadata && typeof asset.enrichmentMetadata === "object"
        ? (asset.enrichmentMetadata as Record<string, unknown>)
        : {};
    await prisma.ownedMediaAsset.update({
      where: { id: asset.id },
      data: {
        enrichmentMetadata: {
          ...prev,
          evidenceWorkbenchPacket: packet,
          evidenceWorkbenchPacketId: packet.packetId,
          evidenceWorkbenchUpdatedAt: packet.generatedAt,
        },
        captionDraft: packet.outgoing.pressCaption || packet.accessibility.caption || undefined,
        staffReviewNotes: packet.proof.whatThisProves || undefined,
      },
    });
  } catch {
    // DB optional for local workbench loop — file packet is source of truth when Prisma unavailable.
  }
}
