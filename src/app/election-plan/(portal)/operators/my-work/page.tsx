import Link from "next/link";

import { ElectionPlanOperatorsSubnav } from "@/components/election-plan/ElectionPlanOperatorsSubnav";
import { OperationsMyWorkPanel } from "@/components/volunteers/OperationsMyWorkPanel";
import { loadOpsMyWork } from "@/lib/volunteers/ops-work-items";

export const metadata = {
  title: "My work | Operators",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams?: Promise<{ opsWork?: string }>;
};

export default async function OperatorsMyWorkPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const [operatorsWork, adminWork] = await Promise.all([
    loadOpsMyWork({ visibility: ["operators"], limit: 40 }),
    loadOpsMyWork({ visibility: ["admin"], limit: 20 }),
  ]);

  const items = [...adminWork.items, ...operatorsWork.items].filter(
    (item, index, arr) => arr.findIndex((x) => x.id === item.id) === index,
  );

  return (
    <>
      <div className="ep-classification">Internal · Operators command</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <Link href="/election-plan/operators" className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
            ← Operators hub
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">My work</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--ep-navy-muted)]">
            Open tasks created from ladder signals — volunteer intake, quiet leaders, My Five gaps, and CM escalations.
          </p>
          <div className="mt-6">
            <ElectionPlanOperatorsSubnav />
          </div>
          <div className="mt-6">
            <OperationsMyWorkPanel
              payload={{ dbAvailable: operatorsWork.dbAvailable || adminWork.dbAvailable, items }}
              statusMessage={params.opsWork ?? null}
            />
          </div>
        </div>
      </div>
    </>
  );
}
