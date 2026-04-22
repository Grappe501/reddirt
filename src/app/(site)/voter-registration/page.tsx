import type { Metadata } from "next";
import type { County } from "@prisma/client";
import { VoterRegistrationCenter } from "@/components/voter/VoterRegistrationCenter";
import { listPublishedCounties } from "@/lib/county/get-county-command-data";
import { getLatestVoterFileSnapshot, getStatewideVoterRollupFromLatestSnapshot } from "@/lib/voter-file/queries";
import { prisma } from "@/lib/db";
import { isPrismaDatabaseUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";

type FocusCounty = Pick<County, "slug" | "displayName" | "regionLabel" | "leadName" | "leadTitle">;

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ county?: string }> };

export const metadata: Metadata = {
  title: "Voter registration center",
  description:
    "Register to vote, get help, and see how we measure new registrations in your county—with a clear handoff to Arkansas’s official VoterView lookup.",
};

export default async function VoterRegistrationPage({ searchParams }: Props) {
  const { county: countyParam } = await searchParams;
  const slug = countyParam?.trim();

  let rows: Awaited<ReturnType<typeof listPublishedCounties>> = [];
  let latestSnapshot: Awaited<ReturnType<typeof getLatestVoterFileSnapshot>> = null;
  let statewide: Awaited<ReturnType<typeof getStatewideVoterRollupFromLatestSnapshot>> = null;
  let focusCounty: FocusCounty | null = null;
  let liveMetricsUnavailableMessage: string | null = null;

  try {
    const tuple = await Promise.all([
      listPublishedCounties(),
      getLatestVoterFileSnapshot(),
      getStatewideVoterRollupFromLatestSnapshot(),
      slug
        ? prisma.county.findFirst({
            where: { slug, published: true },
            select: { slug: true, displayName: true, regionLabel: true, leadName: true, leadTitle: true },
          })
        : Promise.resolve(null),
    ]);
    rows = tuple[0];
    latestSnapshot = tuple[1];
    statewide = tuple[2];
    focusCounty = tuple[3];
  } catch (err) {
    if (!isPrismaDatabaseUnavailable(err)) throw err;
    logPrismaDatabaseUnavailable("voter-registration", err);
    liveMetricsUnavailableMessage =
      "The app could not connect to Postgres (check that your database is running and DATABASE_URL is correct—for local dev, see docker-compose and port 5433). Official VoterView, paper registration guidance, and the rest of this page still work.";
  }

  return (
    <VoterRegistrationCenter
      counties={rows}
      focusCounty={focusCounty}
      latestSnapshot={latestSnapshot}
      statewide={statewide}
      liveMetricsUnavailableMessage={liveMetricsUnavailableMessage}
    />
  );
}
