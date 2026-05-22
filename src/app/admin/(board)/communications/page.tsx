import { CommunicationsCommandCenterClient } from "@/components/admin/communications/CommunicationsCommandCenterClient";
import { loadCommunicationsBundle } from "@/lib/campaign-events/communications/load-communications-bundle";

export const dynamic = "force-dynamic";

export default function CommunicationsPage() {
  const bundle = loadCommunicationsBundle();
  return <CommunicationsCommandCenterClient bundle={JSON.parse(JSON.stringify(bundle))} />;
}
