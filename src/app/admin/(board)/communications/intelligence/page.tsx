import { composeCommunicationsIntelligenceContext } from "@/lib/communications/communications-intelligence-engine";
import { CommunicationsIntelligencePanel } from "@/components/admin/communications/CommunicationsIntelligencePanel";

export const dynamic = "force-dynamic";

export default function CommunicationsIntelligencePage() {
  const ctx = composeCommunicationsIntelligenceContext();
  return <CommunicationsIntelligencePanel ctx={ctx} />;
}
