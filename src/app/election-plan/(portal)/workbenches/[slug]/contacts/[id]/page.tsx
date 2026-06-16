import { notFound } from "next/navigation";

import { VoterContactDetailPanel } from "@/components/election-plan/VoterContactDetailPanel";
import { loadCurrentElectionPlanOperator } from "@/lib/election-plan/auth/load-current-operator";
import { loadCommunityWorkbench } from "@/lib/election-plan/community-workbench/load-workbench";
import { loadVoterContactById } from "@/lib/election-plan/voter-contact/load-voter-contacts";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; id: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug, id } = await params;
  const contact = await loadVoterContactById(id);
  if (!contact || contact.workbenchSlug !== slug) return { title: "Not found" };
  return {
    title: `${contact.firstName} ${contact.lastName} · Contact`,
    robots: { index: false, follow: false },
  };
}

export default async function VoterContactDetailPage({ params }: Props) {
  const { slug, id } = await params;
  const [workbench, contact, operator] = await Promise.all([
    loadCommunityWorkbench(slug),
    loadVoterContactById(id),
    loadCurrentElectionPlanOperator(),
  ]);

  if (!workbench || !contact || contact.workbenchSlug !== slug) notFound();

  return (
    <>
      <div className="ep-classification">Internal · Voter contact · {workbench.name}</div>
      <div className="ep-chapter-body px-4 py-8 sm:px-6 lg:px-10">
        <VoterContactDetailPanel
          contact={contact}
          operatorInitials={operator?.initials ?? null}
          workbenchSlug={slug}
        />
      </div>
    </>
  );
}
