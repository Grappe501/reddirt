"use server";

import { createHash, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  BlogDisplayMode,
  ContentCollection,
  ContentHubKind,
  ContentPlatform,
  MediaKind,
  Prisma,
} from "@prisma/client";
import { upsertInboundFromSyncedPost } from "@/lib/orchestrator/upsert-inbound-from-synced-post";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSecret,
  verifyAdminSessionToken,
} from "@/lib/admin/session";
import { prisma } from "@/lib/db";
import { HOMEPAGE_SECTION_IDS } from "@/lib/content/homepage-merge";
import { invalidateContentOverridesCache } from "@/lib/content/public-overrides";
import { parsePageKey, type HeroBlockPayload } from "@/lib/content/page-blocks";
import { syncSubstackPosts } from "@/lib/integrations/substack/sync";

async function requireAdminAction() {
  const secret = getAdminSecret();
  if (!secret) redirect("/admin/login?error=config");
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) redirect("/admin/login");
}

function hashEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a, "utf8").digest();
  const bh = createHash("sha256").update(b, "utf8").digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}

export async function adminLoginAction(formData: FormData) {
  const secret = getAdminSecret();
  if (!secret) redirect("/admin/login?error=config");
  const password = String(formData.get("password") ?? "");
  if (!hashEqual(password, secret)) redirect("/admin/login?error=auth");

  const token = createAdminSessionToken(secret);
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin/content");
}

export async function adminLogoutAction() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

export async function triggerSubstackSyncAction() {
  await requireAdminAction();
  await syncSubstackPosts();
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/orchestrator");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin/platforms");
  revalidatePath("/updates");
  revalidatePath("/");
  revalidatePath("/from-the-road");
  redirect("/admin/blog?sync=1");
}

export async function saveSiteSettingsAction(formData: FormData) {
  await requireAdminAction();
  const substackFeedUrl = String(formData.get("substackFeedUrl") ?? "").trim() || null;
  const canonicalSiteUrlNote = String(formData.get("canonicalSiteUrlNote") ?? "").trim() || null;
  const adminNotes = String(formData.get("adminNotes") ?? "").trim() || null;

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      substackFeedUrl,
      canonicalSiteUrlNote,
      adminNotes,
      updatedAt: new Date(),
    },
    update: {
      substackFeedUrl,
      canonicalSiteUrlNote,
      adminNotes,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

function parseSectionOrder(formData: FormData) {
  const raw = String(formData.get("section_order") ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const order = raw.length ? raw : [...HOMEPAGE_SECTION_IDS];
  return order.map((id) => ({
    id,
    enabled: formData.get(`sec_${id}`) === "on",
  }));
}

function splitLines(name: string, formData: FormData): string[] {
  return String(formData.get(name) ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitCommaField(formData: FormData, name: string): string[] {
  return String(formData.get(name) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseContentHubKindForm(formData: FormData, name: string): ContentHubKind | null {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return null;
  return Object.values(ContentHubKind).includes(raw as ContentHubKind) ? (raw as ContentHubKind) : null;
}

function parseOptionalIntForm(formData: FormData, name: string): number | null {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

export async function saveHomepageAction(formData: FormData) {
  await requireAdminAction();

  const hero = {
    eyebrow: String(formData.get("hero_eyebrow") ?? "").trim(),
    titleBefore: String(formData.get("hero_title_before") ?? "").trim(),
    titleAccent: String(formData.get("hero_title_accent") ?? "").trim(),
    titleAfter: String(formData.get("hero_title_after") ?? "").trim(),
    subtitle: String(formData.get("hero_subtitle") ?? "").trim(),
    ctaPrimaryLabel: String(formData.get("hero_cta_primary_label") ?? "").trim(),
    ctaPrimaryHref: String(formData.get("hero_cta_primary_href") ?? "").trim(),
    ctaSecondaryLabel: String(formData.get("hero_cta_secondary_label") ?? "").trim(),
    ctaSecondaryHref: String(formData.get("hero_cta_secondary_href") ?? "").trim(),
  };

  const featuredStorySlugs = String(formData.get("featured_story_slugs") ?? "")
    .split(/[,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const featuredSyncedPostSlugs = String(formData.get("featured_synced_slugs") ?? "")
    .split(/[,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const featuredEditorialSlugs = String(formData.get("featured_editorial_slugs") ?? "")
    .split(/[,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const featuredExplainerSlugs = String(formData.get("featured_explainer_slugs") ?? "")
    .split(/[,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const featuredHomepageVideoInboundId =
    String(formData.get("featured_homepage_video_inbound_id") ?? "").trim() || null;

  const quoteBand = {
    quote: String(formData.get("quote_text") ?? "").trim(),
    attribution: String(formData.get("quote_attr") ?? "").trim(),
  };

  const finalCta = {
    eyebrow: String(formData.get("final_eyebrow") ?? "").trim(),
    title: String(formData.get("final_title") ?? "").trim(),
    description: String(formData.get("final_description") ?? "").trim(),
    primaryLabel: String(formData.get("final_primary_label") ?? "").trim(),
    primaryHref: String(formData.get("final_primary_href") ?? "").trim(),
    secondaryLabel: String(formData.get("final_secondary_label") ?? "").trim(),
    secondaryHref: String(formData.get("final_secondary_href") ?? "").trim(),
  };

  const sdKicker = String(formData.get("sd_kicker") ?? "").trim();
  const sdTitle = String(formData.get("sd_title") ?? "").trim();
  const sdBody = String(formData.get("sd_body") ?? "").trim();
  const sdBullets = splitLines("sd_bullets", formData);
  const splitDemocracy =
    sdKicker || sdTitle || sdBody || sdBullets.length
      ? {
          kicker: sdKicker || undefined,
          title: sdTitle || undefined,
          body: sdBody || undefined,
          bullets: sdBullets.length ? sdBullets : undefined,
        }
      : null;

  const slKicker = String(formData.get("sl_kicker") ?? "").trim();
  const slTitle = String(formData.get("sl_title") ?? "").trim();
  const slBody = String(formData.get("sl_body") ?? "").trim();
  const slBullets = splitLines("sl_bullets", formData);
  const splitLabor =
    slKicker || slTitle || slBody || slBullets.length
      ? {
          kicker: slKicker || undefined,
          title: slTitle || undefined,
          body: slBody || undefined,
          bullets: slBullets.length ? slBullets : undefined,
        }
      : null;

  const arkIntro = String(formData.get("ark_intro") ?? "").trim();
  const arkQuote = String(formData.get("ark_quote") ?? "").trim();
  const arkAttr = String(formData.get("ark_attr") ?? "").trim();
  const arkansasBand =
    arkIntro || arkQuote || arkAttr
      ? { intro: arkIntro || undefined, quote: arkQuote || undefined, attribution: arkAttr || undefined }
      : null;

  const sdJson: Prisma.InputJsonValue | typeof Prisma.DbNull = splitDemocracy
    ? (splitDemocracy as Prisma.InputJsonValue)
    : Prisma.DbNull;
  const slJson: Prisma.InputJsonValue | typeof Prisma.DbNull = splitLabor
    ? (splitLabor as Prisma.InputJsonValue)
    : Prisma.DbNull;
  const arkJson: Prisma.InputJsonValue | typeof Prisma.DbNull = arkansasBand
    ? (arkansasBand as Prisma.InputJsonValue)
    : Prisma.DbNull;

  await prisma.homepageConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      hero,
      sectionOrder: parseSectionOrder(formData),
      splitDemocracy: splitDemocracy ?? undefined,
      splitLabor: splitLabor ?? undefined,
      arkansasBand: arkansasBand ?? undefined,
      quoteBand,
      finalCta,
      featuredStorySlugs,
      featuredEditorialSlugs,
      featuredSyncedPostSlugs,
      featuredExplainerSlugs,
      featuredHomepageVideoInboundId,
      updatedAt: new Date(),
    },
    update: {
      hero,
      sectionOrder: parseSectionOrder(formData),
      splitDemocracy: sdJson,
      splitLabor: slJson,
      arkansasBand: arkJson,
      quoteBand,
      finalCta,
      featuredStorySlugs,
      featuredEditorialSlugs,
      featuredSyncedPostSlugs,
      featuredExplainerSlugs,
      featuredHomepageVideoInboundId,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/watch");
  revalidatePath("/admin/homepage");
  redirect("/admin/homepage?saved=1");
}

export async function savePageHeroAction(formData: FormData) {
  await requireAdminAction();
  const rawKey = String(formData.get("pageKey") ?? "");
  const pageKey = parsePageKey(rawKey);
  if (!pageKey) redirect("/admin/pages?error=invalid");

  const payload: HeroBlockPayload = {
    eyebrow: String(formData.get("eyebrow") ?? "").trim() || undefined,
    title: String(formData.get("title") ?? "").trim() || undefined,
    subtitle: String(formData.get("subtitle") ?? "").trim() || undefined,
  };

  await prisma.adminContentBlock.upsert({
    where: { pageKey_blockKey: { pageKey, blockKey: "hero" } },
    create: {
      pageKey,
      blockKey: "hero",
      blockType: "hero",
      payload,
      label: "Hero",
    },
    update: {
      payload,
      blockType: "hero",
    },
  });

  const path = `/${pageKey}` as const;
  revalidatePath(path);
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${pageKey}?saved=1`);
}

export async function createMediaAssetAction(formData: FormData) {
  await requireAdminAction();
  const url = String(formData.get("url") ?? "").trim();
  if (!url) redirect("/admin/media?error=url");

  const kindRaw = String(formData.get("kind") ?? "IMAGE").trim();
  const kind = Object.values(MediaKind).includes(kindRaw as MediaKind) ? (kindRaw as MediaKind) : MediaKind.IMAGE;

  const widthRaw = String(formData.get("width") ?? "").trim();
  const heightRaw = String(formData.get("height") ?? "").trim();
  const widthParsed = widthRaw ? Number.parseInt(widthRaw, 10) : NaN;
  const heightParsed = heightRaw ? Number.parseInt(heightRaw, 10) : NaN;
  const width = Number.isFinite(widthParsed) ? widthParsed : null;
  const height = Number.isFinite(heightParsed) ? heightParsed : null;

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const originPlatformRaw = String(formData.get("originPlatform") ?? "").trim();
  const originPlatform =
    originPlatformRaw && Object.values(ContentPlatform).includes(originPlatformRaw as ContentPlatform)
      ? (originPlatformRaw as ContentPlatform)
      : null;
  const originExternalId = String(formData.get("originExternalId") ?? "").trim() || null;

  await prisma.mediaAsset.create({
    data: {
      url,
      kind,
      width,
      height,
      alt: String(formData.get("alt") ?? "").trim() || null,
      caption: String(formData.get("caption") ?? "").trim() || null,
      tags,
      usageNotes: String(formData.get("usageNotes") ?? "").trim() || null,
      originPlatform,
      originExternalId,
    },
  });

  revalidatePath("/admin/media");
  redirect("/admin/media?saved=1");
}

export async function saveContentOverrideAction(formData: FormData) {
  await requireAdminAction();
  const collectionRaw = String(formData.get("collection") ?? "");
  if (!Object.values(ContentCollection).includes(collectionRaw as ContentCollection)) {
    redirect("/admin/stories?error=collection");
  }
  const collection = collectionRaw as ContentCollection;
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/stories?error=slug");

  const hidden = formData.get("hidden") === "on";
  const featured = formData.get("featured") === "on";
  const teaserOverride = String(formData.get("teaserOverride") ?? "").trim() || null;
  const summaryOverride = String(formData.get("summaryOverride") ?? "").trim() || null;
  const heroMediaIdRaw = String(formData.get("heroMediaId") ?? "").trim();
  const heroMediaId = heroMediaIdRaw ? heroMediaIdRaw : null;

  await prisma.contentItemOverride.upsert({
    where: { collection_slug: { collection, slug } },
    create: {
      collection,
      slug,
      hidden,
      featured,
      teaserOverride,
      summaryOverride,
      heroMediaId,
    },
    update: {
      hidden,
      featured,
      teaserOverride,
      summaryOverride,
      heroMediaId,
    },
  });

  invalidateContentOverridesCache();
  revalidatePath("/");
  revalidatePath("/stories");
  revalidatePath("/editorial");
  revalidatePath("/explainers");
  revalidatePath(`/stories/${slug}`);
  revalidatePath(`/editorial/${slug}`);
  revalidatePath(`/explainers/${slug}`);

  const dest =
    collection === ContentCollection.STORY
      ? "/admin/stories"
      : collection === ContentCollection.EDITORIAL
        ? "/admin/editorial"
        : "/admin/explainers";
  redirect(`${dest}?saved=${encodeURIComponent(slug)}`);
}

export async function saveSyncedPostAction(formData: FormData) {
  await requireAdminAction();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/blog?error=slug");

  const featured = formData.get("featured") === "on";
  const hidden = formData.get("hidden") === "on";
  const showOnHomepage = formData.get("showOnHomepage") === "on";
  const showOnBlogLanding = formData.get("showOnBlogLanding") === "on";
  const teaserOverride = String(formData.get("teaserOverride") ?? "").trim() || null;
  const localCategories = String(formData.get("localCategories") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const localTags = String(formData.get("localTags") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const displayModeRaw = String(formData.get("displayMode") ?? "SUMMARY_LINK");
  const displayMode = Object.values(BlogDisplayMode).includes(displayModeRaw as BlogDisplayMode)
    ? (displayModeRaw as BlogDisplayMode)
    : BlogDisplayMode.SUMMARY_LINK;
  const heroMediaIdRaw = String(formData.get("heroMediaId") ?? "").trim();
  const heroMediaId = heroMediaIdRaw ? heroMediaIdRaw : null;

  const featuredRoadPreview = formData.get("featuredRoadPreview") === "on";
  const issueTags = splitCommaField(formData, "issueTags");
  const countySlug = String(formData.get("countySlug") ?? "").trim() || null;
  const countyFips = String(formData.get("countyFips") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const campaignPhase = String(formData.get("campaignPhase") ?? "").trim() || null;
  const contentSeries = String(formData.get("contentSeries") ?? "").trim() || null;
  const playlistId = String(formData.get("playlistId") ?? "").trim() || null;
  const featuredWeight = parseOptionalIntForm(formData, "featuredWeight");
  const contentKind = parseContentHubKindForm(formData, "contentKind");

  const updated = await prisma.syncedPost.update({
    where: { slug },
    data: {
      featured,
      hidden,
      showOnHomepage,
      showOnBlogLanding,
      teaserOverride,
      localCategories,
      localTags,
      displayMode,
      heroMediaId,
      featuredRoadPreview,
      issueTags,
      countySlug,
      countyFips,
      city,
      campaignPhase,
      contentSeries,
      playlistId,
      featuredWeight,
      contentKind,
    },
  });

  await upsertInboundFromSyncedPost(updated.id);

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  revalidatePath("/from-the-road");
  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${slug}?saved=1`);
}

export async function clearContentOverrideAction(formData: FormData) {
  await requireAdminAction();
  const collectionRaw = String(formData.get("collection") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/stories");
  if (!Object.values(ContentCollection).includes(collectionRaw as ContentCollection)) redirect("/admin/stories");
  const collection = collectionRaw as ContentCollection;

  await prisma.contentItemOverride.deleteMany({ where: { collection, slug } });
  invalidateContentOverridesCache();
  revalidatePath("/");

  const dest =
    collection === ContentCollection.STORY
      ? "/admin/stories"
      : collection === ContentCollection.EDITORIAL
        ? "/admin/editorial"
        : "/admin/explainers";
  redirect(dest);
}
