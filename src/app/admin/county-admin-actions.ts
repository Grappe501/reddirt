"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CountyContentReviewStatus, PublicDemographicsSource } from "@prisma/client";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSecret,
  verifyAdminSessionToken,
} from "@/lib/admin/session";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const secret = getAdminSecret();
  if (!secret) redirect("/admin/login?error=config");
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) redirect("/admin/login");
}

function toInt(s: string | null): number | null {
  if (s == null || s.trim() === "") return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function toFloat(s: string | null): number | null {
  if (s == null || s.trim() === "") return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

const COUNTY_REVIEW: CountyContentReviewStatus[] = ["DRAFT", "PENDING_REVIEW", "APPROVED"];

function parseCountyReviewStatus(v: FormDataEntryValue | null): CountyContentReviewStatus {
  const s = String(v ?? "PENDING_REVIEW");
  return (COUNTY_REVIEW.includes(s as CountyContentReviewStatus) ? s : "PENDING_REVIEW") as CountyContentReviewStatus;
}

export async function saveCountyCommandPageAction(formData: FormData) {
  await requireAdmin();
  const countyId = String(formData.get("countyId") ?? "");
  if (!countyId) throw new Error("countyId required");

  const county = await prisma.county.findUnique({ where: { id: countyId } });
  if (!county) throw new Error("County not found");

  const displayName = String(formData.get("displayName") ?? "").trim() || county.displayName;
  const published = String(formData.get("published") ?? "") === "on";
  const heroIntro = String(formData.get("heroIntro") ?? "").trim() || null;
  const heroEyebrow = String(formData.get("heroEyebrow") ?? "").trim() || null;
  const leadName = String(formData.get("leadName") ?? "").trim() || null;
  const leadTitle = String(formData.get("leadTitle") ?? "").trim() || null;
  const regionLabel = String(formData.get("regionLabel") ?? "").trim() || null;
  const featured = String(formData.get("featuredEventSlugs") ?? "")
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.county.update({
    where: { id: countyId },
    data: {
      displayName,
      published,
      heroIntro,
      heroEyebrow,
      leadName,
      leadTitle,
      regionLabel,
      featuredEventSlugs: featured,
    },
  });

  const stats = await prisma.countyCampaignStats.findUnique({ where: { countyId } });
  if (stats) {
    await prisma.countyCampaignStats.update({
      where: { id: stats.id },
      data: {
        registrationGoal: toInt(formData.get("registrationGoal") as string | null),
        newRegistrationsSinceBaseline: toInt(formData.get("newRegistrationsSinceBaseline") as string | null),
        volunteerTarget: toInt(formData.get("volunteerTarget") as string | null),
        volunteerCount: toInt(formData.get("volunteerCount") as string | null),
        campaignVisits: toInt(formData.get("campaignVisits") as string | null),
        dataPipelineSource: String(formData.get("dataPipelineSource") ?? "").trim() || null,
        pipelineError: String(formData.get("pipelineError") ?? "").trim() || null,
        reviewStatus: parseCountyReviewStatus(formData.get("statsReviewStatus")),
      },
    });
  } else {
    await prisma.countyCampaignStats.create({
      data: {
        countyId,
        registrationGoal: toInt(formData.get("registrationGoal") as string | null),
        newRegistrationsSinceBaseline: toInt(formData.get("newRegistrationsSinceBaseline") as string | null),
        volunteerTarget: toInt(formData.get("volunteerTarget") as string | null),
        volunteerCount: toInt(formData.get("volunteerCount") as string | null),
        campaignVisits: toInt(formData.get("campaignVisits") as string | null),
        dataPipelineSource: String(formData.get("dataPipelineSource") ?? "").trim() || null,
        pipelineError: String(formData.get("pipelineError") ?? "").trim() || null,
        reviewStatus: parseCountyReviewStatus(formData.get("statsReviewStatus")),
      },
    });
  }

  const demo = await prisma.countyPublicDemographics.findUnique({ where: { countyId } });
  const sourceRaw = String(formData.get("demographicsSource") ?? "CENSUS_ACS").trim();
  const source = Object.values(PublicDemographicsSource).includes(sourceRaw as PublicDemographicsSource)
    ? (sourceRaw as PublicDemographicsSource)
    : PublicDemographicsSource.CENSUS_ACS;
  const demoPayload = {
    population: toInt(formData.get("population") as string | null),
    votingAgePopulation: toInt(formData.get("votingAgePopulation") as string | null),
    medianHouseholdIncome: toInt(formData.get("medianHouseholdIncome") as string | null),
    povertyRatePercent: toFloat(formData.get("povertyRatePercent") as string | null),
    bachelorsOrHigherPercent: toFloat(formData.get("bachelorsOrHigherPercent") as string | null),
    laborEmploymentNote: String(formData.get("laborEmploymentNote") ?? "").trim() || null,
    source,
    sourceDetail: String(formData.get("sourceDetail") ?? "").trim() || null,
    asOfYear: toInt(formData.get("asOfYear") as string | null),
    reviewStatus: parseCountyReviewStatus(formData.get("demographicsReviewStatus")),
  };

  if (demo) {
    await prisma.countyPublicDemographics.update({
      where: { id: demo.id },
      data: { ...demoPayload, fetchedAt: new Date() },
    });
  } else {
    await prisma.countyPublicDemographics.create({
      data: { countyId, ...demoPayload, fetchedAt: new Date() },
    });
  }

  revalidatePath("/counties");
  revalidatePath(`/counties/${county.slug}`);
  redirect(`/admin/counties/${county.slug}?saved=1`);
}
