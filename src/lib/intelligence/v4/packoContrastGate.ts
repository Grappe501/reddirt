import { loadMichaelPackoScaffold } from "@/lib/intelligence/opponents/loadMichaelPackoScaffold";

export type PackoContrastGateStatus = {
  blocked: boolean;
  openTaskIds: string[];
  message: string;
  claimsGate: string;
};

const REQUIRED_TASKS = ["PACKO-01", "PACKO-02"] as const;

/** Hard-block Pakko contrast UI until PACKO-01 and PACKO-02 reach PARTIAL or better. */
export function getPackoContrastGateStatus(): PackoContrastGateStatus {
  const scaffold = loadMichaelPackoScaffold();
  const claimsGate =
    scaffold?.kellyPositioning.claimsGate ??
    "No Packo attack lines until PACKO-02 quote ledger at PARTIAL minimum";

  if (!scaffold) {
    return {
      blocked: true,
      openTaskIds: [...REQUIRED_TASKS],
      message: "Pakko scaffold missing — contrast blocked.",
      claimsGate,
    };
  }

  const openTaskIds = REQUIRED_TASKS.filter((id) => {
    const task = scaffold.researchPriorities.find((t) => t.id === id);
    return !task || task.status === "OPEN";
  });

  return {
    blocked: openTaskIds.length > 0,
    openTaskIds: [...openTaskIds],
    message:
      openTaskIds.length > 0
        ? `Pakko contrast locked — complete ${openTaskIds.join(" and ")} before debate attack lines or contrast modules.`
        : "Pakko contrast gate open — quote ledger and finance summary at PARTIAL minimum.",
    claimsGate,
  };
}

export function isPackoContrastBlocked(): boolean {
  return getPackoContrastGateStatus().blocked;
}
