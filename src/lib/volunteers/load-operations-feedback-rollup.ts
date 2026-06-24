import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { getVolunteerLeaderRoster, countsInFieldLeaderRoster } from "@/lib/volunteers/leader-roster";
import { loadCommandCoverageHeatmap } from "@/lib/volunteers/load-command-coverage";
import { loadVolunteerIntakeDashboard } from "@/lib/volunteers/load-volunteer-intake-dashboard";
import { loadRealLeaderCommandDashboard } from "@/lib/volunteers/load-real-leader-dashboard";
import type { OperationsCommandTierId, OperationsFeedbackSignal } from "@/lib/volunteers/operations-command-ladder";

export type OperationsFeedbackRollup = {
  dbAvailable: boolean;
  fieldLogEntryCount: number;
  fieldLogQuantity: number;
  activeLeaders: number;
  quietLeaders: number;
  intakePending: number;
  intakeInReview: number;
  myFiveIncomplete: number;
  myFiveComplete: number;
  signals: OperationsFeedbackSignal[];
};

async function loadFieldLogTotals(): Promise<{ entryCount: number; totalQuantity: number }> {
  if (!isDatabaseConfigured()) return { entryCount: 0, totalQuantity: 0 };
  try {
    const [entryCount, agg] = await Promise.all([
      prisma.electionPlanFieldEntry.count(),
      prisma.electionPlanFieldEntry.aggregate({ _sum: { quantity: true } }),
    ]);
    return { entryCount, totalQuantity: agg._sum.quantity ?? 0 };
  } catch {
    return { entryCount: 0, totalQuantity: 0 };
  }
}

function severityFromCount(count: number, watchAt: number, actionAt: number): OperationsFeedbackSignal["severity"] {
  if (count >= actionAt) return "action";
  if (count >= watchAt) return "watch";
  return "ok";
}

export async function loadOperationsFeedbackRollup(): Promise<OperationsFeedbackRollup> {
  const dbAvailable = isDatabaseConfigured();
  const fieldLeaders = getVolunteerLeaderRoster().filter(countsInFieldLeaderRoster);

  const [heatmap, intake, leaderCommand, fieldTotals] = await Promise.all([
    loadCommandCoverageHeatmap(),
    loadVolunteerIntakeDashboard(),
    loadRealLeaderCommandDashboard(),
    loadFieldLogTotals(),
  ]);

  const activeLeaders = heatmap.filter((r) => r.activity === "active").length;
  const quietLeaders = heatmap.filter((r) => r.activity === "quiet").length;
  const myFiveIncomplete =
    leaderCommand.stats.myFivePartial + leaderCommand.stats.myFiveEmpty;
  const myFiveComplete = leaderCommand.stats.myFiveComplete;

  const signals: OperationsFeedbackSignal[] = [
    {
      id: "field-log",
      label: "Field log entries",
      count: fieldTotals.entryCount,
      href: "/election-plan/operators/leaders/me#field-log",
      severity: fieldTotals.entryCount > 0 ? "ok" : "watch",
      tierId: "volunteer_field",
      description: `${fieldTotals.totalQuantity} total qty tagged to operator initials — bubbles to leader command`,
    },
    {
      id: "quiet-leaders",
      label: "Quiet leaders",
      count: quietLeaders,
      href: "/election-plan/operators/leaders/command",
      severity: severityFromCount(quietLeaders, 10, 25),
      tierId: "leader_command",
      description: "No field log or leadership fills — needs first coaching touch",
    },
    {
      id: "my-five-gaps",
      label: "My Five incomplete",
      count: myFiveIncomplete,
      href: "/election-plan/operators/leader-dashboard",
      severity: severityFromCount(myFiveIncomplete, 15, 30),
      tierId: "leader_workbench",
      description: `${myFiveComplete} leaders at 5/5 — gaps roll up to operators and CM`,
    },
    {
      id: "intake-pending",
      label: "Volunteer intake pending",
      count: intake.stats.pending + intake.stats.inReview,
      href: "/election-plan/operators/volunteer-intake",
      severity: severityFromCount(intake.stats.pending + intake.stats.inReview, 5, 15),
      tierId: "operators_hub",
      description: "Website sign-up → review → placement — vol manager and CM see this queue",
    },
    {
      id: "active-leaders",
      label: "Active field leaders",
      count: activeLeaders,
      href: "/election-plan/operators/leaders/command",
      severity: activeLeaders >= Math.max(5, Math.floor(fieldLeaders.length * 0.15)) ? "ok" : "watch",
      tierId: "leader_command",
      description: `${activeLeaders} of ${fieldLeaders.length} with live field or leadership records`,
    },
    {
      id: "cm-intake-backlog",
      label: "Intake backlog (statewide)",
      count: intake.stats.pending + intake.stats.inReview,
      href: "/election-plan/operators/volunteer-intake",
      severity: severityFromCount(intake.stats.pending + intake.stats.inReview, 5, 15),
      tierId: "campaign_manager",
      description: "Volunteer sign-ups awaiting review — escalates from operators hub",
    },
    {
      id: "cm-quiet-leaders",
      label: "Quiet leaders (statewide)",
      count: quietLeaders,
      href: "/election-plan/operators/leaders/command",
      severity: severityFromCount(quietLeaders, 10, 25),
      tierId: "campaign_manager",
      description: "Field leaders with no recent activity — coach from leader command",
    },
    {
      id: "cm-field-log",
      label: "Field log entries (statewide)",
      count: fieldTotals.entryCount,
      href: "/election-plan/operators/leaders/command",
      severity: fieldTotals.entryCount > 0 ? "ok" : "watch",
      tierId: "campaign_manager",
      description: `${fieldTotals.totalQuantity} total qty — relational base feeding every tier`,
    },
  ];

  return {
    dbAvailable,
    fieldLogEntryCount: fieldTotals.entryCount,
    fieldLogQuantity: fieldTotals.totalQuantity,
    activeLeaders,
    quietLeaders,
    intakePending: intake.stats.pending,
    intakeInReview: intake.stats.inReview,
    myFiveIncomplete,
    myFiveComplete,
    signals,
  };
}
