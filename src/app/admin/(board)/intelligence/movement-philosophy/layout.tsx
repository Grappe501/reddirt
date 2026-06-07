import type { ReactNode } from "react";
import { MovementPhilosophyExperience } from "@/components/admin/intelligence/movement-philosophy/MovementPhilosophyExperience";

export const dynamic = "force-dynamic";

export default function MovementPhilosophyLayout({ children }: { children: ReactNode }) {
  return <MovementPhilosophyExperience>{children}</MovementPhilosophyExperience>;
}
