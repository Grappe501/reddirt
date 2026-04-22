"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ContentDecisionStatus,
  ContentHubKind,
  ContentPlatform,
  ContentRoutingDestination,
  InboundReviewStatus,
} from "@prisma/client";
import { upsertInboundFromSyncedPost } from "@/lib/orchestrator/upsert-inbound-from-synced-post";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSecret,
  verifyAdminSessionToken,
} from "@/lib/admin/session";
import { prisma } from "@/lib/db";

async function guard() {
  const secret = getAdminSecret();
  if (!secret) redirect("/admin/login?error=config");
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) redirect("/admin/login");
}

function parseReviewStatus(raw: string): InboundReviewStatus | null {
  return Object.values(InboundReviewStatus).includes(raw as InboundReviewStatus)
    ? (raw as InboundReviewStatus)
    : null;
}

function splitComma(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseHubKind(raw: string): ContentHubKind | null {
  const t = raw.trim();
  if (!t) return null;
  return Object.values(ContentHubKind).includes(t as ContentHubKind) ? (t as ContentHubKind) : null;
}

function parseOptionalInt(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

export async function runPlatformSyncAction(formData: FormData) {
  await guard();
  const platform = String(formData.get("platform") ?? "").trim();

  if (platform === ContentPlatform.SUBSTACK) {
    const { syncSubstackPosts } = await import("@/lib/integrations/substack/sync");
    await syncSubstackPosts();
  } else if (platform === ContentPlatform.FACEBOOK) {
    const { syncFacebookPageFeed } = await import("@/lib/integrations/facebook/sync");
    await syncFacebookPageFeed();
  } else if (platform === ContentPlatform.INSTAGRAM) {
    const { syncInstagramMedia } = await import("@/lib/integrations/instagram/sync");
    await syncInstagramMedia();
  } else if (platform === ContentPlatform.YOUTUBE) {
    const { syncYouTubeChannelSearch } = await import("@/lib/integrations/youtube/sync");
    await syncYouTubeChannelSearch();
  }

  revalidatePath("/admin/platforms");
  revalidatePath("/admin/orchestrator");
  revalidatePath("/admin/inbox");
  revalidatePath("/from-the-road");
  revalidatePath("/");
  revalidatePath("/from-the-road");
  revalidatePath("/from-the-road");
  redirect(`/admin/platforms?sync=${encodeURIComponent(platform)}`);
}

export async function updateInboundReviewAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/inbox?error=id");
  const status = parseReviewStatus(String(formData.get("reviewStatus") ?? ""));
  if (!status) redirect(`/admin/inbox/${id}?error=status`);

  await prisma.inboundContentItem.update({
    where: { id },
    data: { reviewStatus: status },
  });

  let decisionStatus: ContentDecisionStatus;
  switch (status) {
    case InboundReviewStatus.PENDING:
      decisionStatus = ContentDecisionStatus.NEW;
      break;
    case InboundReviewStatus.REVIEWED:
      decisionStatus = ContentDecisionStatus.REVIEWED;
      break;
    case InboundReviewStatus.FEATURED:
      decisionStatus = ContentDecisionStatus.FEATURED;
      break;
    case InboundReviewStatus.SUPPRESSED:
      decisionStatus = ContentDecisionStatus.SUPPRESSED;
      break;
    case InboundReviewStatus.ARCHIVED:
      decisionStatus = ContentDecisionStatus.ARCHIVED;
      break;
    default:
      decisionStatus = ContentDecisionStatus.NEW;
  }

  await prisma.contentDecision.create({
    data: {
      inboundItemId: id,
      status: decisionStatus,
      destination: ContentRoutingDestination.NONE,
      notes: String(formData.get("notes") ?? "").trim() || null,
      editor: String(formData.get("editor") ?? "").trim() || null,
    },
  });

  revalidatePath("/admin/inbox");
  revalidatePath("/admin/review-queue");
  revalidatePath("/admin/distribution");
  revalidatePath("/from-the-road");
  revalidatePath("/");
  revalidatePath("/from-the-road");
  revalidatePath("/from-the-road");
  redirect(`/admin/inbox/${id}?saved=1`);
}

export async function updateInboundDistributionAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/distribution?error=id");

  const visibleOnUpdatesPage = formData.get("visibleOnUpdatesPage") === "on";
  const visibleOnHomepageRail = formData.get("visibleOnHomepageRail") === "on";
  const routeToBlog = formData.get("routeToBlog") === "on";
  const storySeed = formData.get("storySeed") === "on";
  const editorialSeed = formData.get("editorialSeed") === "on";
  const publishCandidate = formData.get("publishCandidate") === "on";

  const inbound = await prisma.inboundContentItem.update({
    where: { id },
    data: {
      visibleOnUpdatesPage,
      visibleOnHomepageRail,
      routeToBlog,
      storySeed,
      editorialSeed,
      publishCandidate,
    },
  });

  if (inbound.syncedPostId) {
    await prisma.syncedPost.update({
      where: { id: inbound.syncedPostId },
      data: {
        showOnBlogLanding: routeToBlog,
      },
    });
    await upsertInboundFromSyncedPost(inbound.syncedPostId);
  }

  await prisma.contentDecision.create({
    data: {
      inboundItemId: id,
      status: ContentDecisionStatus.ROUTED,
      destination: visibleOnUpdatesPage
        ? ContentRoutingDestination.PUBLIC_UPDATES
        : visibleOnHomepageRail
          ? ContentRoutingDestination.HOMEPAGE_RAIL
          : routeToBlog
            ? ContentRoutingDestination.BLOG
            : storySeed
              ? ContentRoutingDestination.STORIES_SEED
              : editorialSeed
                ? ContentRoutingDestination.EDITORIAL_SEED
                : ContentRoutingDestination.NONE,
      notes: String(formData.get("notes") ?? "").trim() || null,
      editor: String(formData.get("editor") ?? "").trim() || null,
    },
  });

  revalidatePath("/admin/distribution");
  revalidatePath("/admin/inbox");
  revalidatePath("/from-the-road");
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/from-the-road");
  revalidatePath("/from-the-road");
  redirect(`/admin/distribution?saved=${encodeURIComponent(id)}`);
}

export async function updateInboundHubMetaAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/inbox?error=id");

  const issueTags = splitComma(String(formData.get("issueTags") ?? ""));
  const countySlug = String(formData.get("countySlug") ?? "").trim() || null;
  const countyFips = String(formData.get("countyFips") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const campaignPhase = String(formData.get("campaignPhase") ?? "").trim() || null;
  const contentSeries = String(formData.get("contentSeries") ?? "").trim() || null;
  const playlistId = String(formData.get("playlistId") ?? "").trim() || null;
  const featuredWeight = parseOptionalInt(String(formData.get("featuredWeight") ?? ""));
  const rawKind = String(formData.get("contentKind") ?? "").trim();
  const contentKind: ContentHubKind | null = rawKind ? parseHubKind(rawKind) : null;
  const siteHidden = formData.get("siteHidden") === "on";

  const inbound = await prisma.inboundContentItem.findUnique({ where: { id } });
  if (!inbound) redirect("/admin/inbox?error=missing");

  const shared = {
    issueTags,
    countySlug,
    countyFips,
    city,
    campaignPhase,
    contentSeries,
    playlistId,
    featuredWeight,
    contentKind,
  };

  if (inbound.syncedPostId) {
    await prisma.syncedPost.update({
      where: { id: inbound.syncedPostId },
      data: {
        ...shared,
        hidden: siteHidden,
      },
    });
    await upsertInboundFromSyncedPost(inbound.syncedPostId);
  } else {
    await prisma.inboundContentItem.update({
      where: { id },
      data: {
        ...shared,
        siteHidden,
      },
    });
  }

  revalidatePath("/admin/inbox");
  revalidatePath("/");
  revalidatePath("/from-the-road");
  revalidatePath("/from-the-road");
  redirect(`/admin/inbox/${id}?saved=1`);
}
