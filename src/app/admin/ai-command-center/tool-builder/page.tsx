import { ToolBuilderQueueClient } from "@/components/admin/tool-builder/ToolBuilderQueueClient";
import { loadToolBuildQueue } from "@/lib/agents/tool-builder/tool-builder-queue";

export default function ToolBuilderPage() {
  const tickets = loadToolBuildQueue();
  return (
    <main className="min-h-screen bg-kelly-canvas px-4 py-8">
      <ToolBuilderQueueClient initialTickets={tickets} />
    </main>
  );
}
