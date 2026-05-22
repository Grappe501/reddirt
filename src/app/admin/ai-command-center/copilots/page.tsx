import { Suspense } from "react";
import { CopilotCommandCenterClient } from "@/components/admin/copilots/CopilotCommandCenterClient";

export default function CopilotCommandCenterPage() {
  return (
    <main className="min-h-screen bg-kelly-canvas px-4 py-8">
      <Suspense fallback={<p className="text-sm text-kelly-muted">Loading copilots…</p>}>
        <CopilotCommandCenterClient />
      </Suspense>
    </main>
  );
}
