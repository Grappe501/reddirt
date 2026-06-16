import { AdminElectionPlanHubPanel } from "@/components/admin/election-plan/AdminElectionPlanHubPanel";
import { buildAdminElectionPlanCatalog } from "@/lib/election-plan/admin-election-plan-catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Election Plan OS",
  description: "Admin gateway to every election-plan workbench and portal route.",
  robots: { index: false, follow: false },
};

export default function AdminElectionPlanPage() {
  const catalog = buildAdminElectionPlanCatalog();
  return <AdminElectionPlanHubPanel catalog={catalog} />;
}
