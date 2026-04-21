import type { Metadata } from "next";
import { VoterRegistrationCenter } from "@/components/voter/VoterRegistrationCenter";
import { listPublishedCounties } from "@/lib/county/get-county-command-data";
import { getLatestVoterFileSnapshot, getStatewideVoterRollupFromLatestSnapshot } from "@/lib/voter-file/queries";
import { prisma } from "@/lib/db";

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

  const [rows, latestSnapshot, statewide, focusCounty] = await Promise.all([
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

  return (
    <VoterRegistrationCenter
      counties={rows}
      focusCounty={focusCounty}
      latestSnapshot={latestSnapshot}
      statewide={statewide}
    />
  );
}
