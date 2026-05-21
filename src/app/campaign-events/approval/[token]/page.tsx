import { ApprovalTokenPublicClient } from "@/components/admin/campaign-events/ApprovalTokenPublicClient";
import { loadApprovalPublicPage } from "@/lib/campaign-events/approval-email/load-approval-public-page";

export const dynamic = "force-dynamic";

export default async function ApprovalTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: tokenId } = await params;
  const { token, payload, canDecide } = await loadApprovalPublicPage(tokenId);
  return <ApprovalTokenPublicClient token={token} payload={payload} canDecide={canDecide} />;
}
