import type { ReactNode } from "react";
import { SchedulerShell } from "@/components/scheduler/SchedulerShell";
import { requireSchedulerPage } from "@/lib/scheduler/require-scheduler";

export const dynamic = "force-dynamic";

export default async function SchedulerDeskLayout({ children }: { children: ReactNode }) {
  const actor = await requireSchedulerPage();
  return (
    <SchedulerShell email={actor.email} name={actor.name}>
      {children}
    </SchedulerShell>
  );
}
