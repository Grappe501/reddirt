import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CountyCommandExperience } from "@/components/county/CountyCommandExperience";
import { getCountyPageSnapshot } from "@/lib/county/get-county-command-data";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCountyPageSnapshot(slug);
  if (!data) return { title: "County" };
  return {
    title: `${data.county.displayName} — County command`,
    description:
      data.county.heroIntro?.slice(0, 155) ||
      `Organizing and voter information for ${data.county.displayName} — goals, local actions, and what matters in this county.`,
  };
}

export default async function CountyCommandPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCountyPageSnapshot(slug);
  if (!data) notFound();
  return <CountyCommandExperience data={data} />;
}
