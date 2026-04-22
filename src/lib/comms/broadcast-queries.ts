import { prisma } from "@/lib/db";

export async function listRecentCampaigns(take: number) {
  return prisma.communicationCampaign.findMany({
    take,
    orderBy: { updatedAt: "desc" },
    include: { createdBy: { select: { name: true, email: true } } },
  });
}

export async function getBroadcastCampaign(id: string) {
  return prisma.communicationCampaign.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } },
      approvedBy: { select: { name: true, email: true } },
      template: true,
      event: { select: { id: true, title: true, startAt: true, eventWorkflowState: true, status: true } },
      audienceSegment: { select: { id: true, name: true } },
    },
  });
}

export async function listTemplates() {
  return prisma.communicationTemplate.findMany({ orderBy: { updatedAt: "desc" }, take: 50 });
}

export async function listSegments() {
  return prisma.audienceSegment.findMany({ orderBy: { updatedAt: "desc" }, take: 50 });
}

export async function listUpcomingEventsForComms() {
  return prisma.campaignEvent.findMany({
    where: { startAt: { gte: new Date(Date.now() - 2 * 86400 * 1000) } },
    orderBy: { startAt: "asc" },
    take: 100,
    select: { id: true, title: true, startAt: true, eventWorkflowState: true, status: true },
  });
}

export async function listTags() {
  return prisma.communicationTag.findMany({ orderBy: { label: "asc" }, take: 200 });
}

export async function listCounties() {
  return prisma.county.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, take: 200 });
}
