import { notFound } from "next/navigation";

import { VoterContactListPanel } from "@/components/election-plan/VoterContactListPanel";
import { loadCommunityWorkbench } from "@/lib/election-plan/community-workbench/load-workbench";
import { loadVoterContactsForWorkbench } from "@/lib/election-plan/voter-contact/load-voter-contacts";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const wb = await loadCommunityWorkbench(slug);
  if (!wb) return { title: "Not found" };
  return {
    title: `Voter contacts · ${wb.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function VoterContactListPage({ params }: Props) {
  const { slug } = await params;
  const workbench = await loadCommunityWorkbench(slug);
  if (!workbench) notFound();

  const { contacts } = await loadVoterContactsForWorkbench(slug);

  return (
    <>
      <div className="ep-classification">Internal · Voter contacts · {workbench.name}</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <VoterContactListPanel
            workbenchSlug={slug}
            workbenchName={workbench.name}
            contacts={contacts}
          />
        </div>
      </div>
    </>
  );
}
