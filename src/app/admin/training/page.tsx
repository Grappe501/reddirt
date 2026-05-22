import { Suspense } from "react";
import { TrainingCenterClient } from "@/components/admin/training/TrainingCenterClient";

export default function TrainingPage() {
  return (
    <main className="min-h-screen bg-kelly-canvas px-4 py-8">
      <Suspense fallback={<p className="text-sm text-kelly-muted">Loading training…</p>}>
        <TrainingCenterClient />
      </Suspense>
    </main>
  );
}
