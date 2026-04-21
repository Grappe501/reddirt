import { ContentPlatform, PlatformConnectionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const DEFAULTS: { platform: ContentPlatform; accountName: string }[] = [
  { platform: ContentPlatform.SUBSTACK, accountName: "Substack (RSS)" },
  { platform: ContentPlatform.FACEBOOK, accountName: "Facebook Page" },
  { platform: ContentPlatform.INSTAGRAM, accountName: "Instagram" },
  { platform: ContentPlatform.YOUTUBE, accountName: "YouTube channel" },
];

/** Ensures one `PlatformConnection` row per platform for the command-center UI. */
export async function ensurePlatformConnections(): Promise<void> {
  for (const d of DEFAULTS) {
    await prisma.platformConnection.upsert({
      where: { platform: d.platform },
      create: {
        platform: d.platform,
        status: PlatformConnectionStatus.INACTIVE,
        accountName: d.accountName,
        syncEnabled: false,
        updatedAt: new Date(),
      },
      update: {
        updatedAt: new Date(),
      },
    });
  }
}
