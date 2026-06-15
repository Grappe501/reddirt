import { notFound } from "next/navigation";

import { KellySosPlatformPlankPanel } from "@/components/election-plan/KellySosPlatformPlankPanel";
import { getPlatformPlank, KELLY_SOS_PLATFORM } from "@/lib/election-plan/kelly-sos-platform";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return KELLY_SOS_PLATFORM.planks.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const plank = getPlatformPlank(slug);
  if (!plank) return { title: "Platform plank" };
  return {
    title: `${plank.title} | Kelly Grappe SOS Platform`,
    description: plank.summary,
    robots: { index: false, follow: false },
  };
}

export default async function KellySosPlatformPlankPage({ params }: Props) {
  const { slug } = await params;
  const plank = getPlatformPlank(slug);
  if (!plank) notFound();

  return (
    <>
      <div className="ep-classification">Internal · Platform plank · Secretary of State</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <KellySosPlatformPlankPanel plank={plank} />
        </div>
      </div>
    </>
  );
}
