import type { TrainingModule } from "./training-types";
import { TRAINING_MODULES_DATA } from "./training-modules-data";

export function getTrainingModule(id: string): TrainingModule | undefined {
  return TRAINING_MODULES_DATA.find((m) => m.id === id);
}

export function listTrainingModules(): TrainingModule[] {
  return [...TRAINING_MODULES_DATA];
}

export function listTrainingModulesForRole(role: string): TrainingModule[] {
  return TRAINING_MODULES_DATA.filter((m) => m.roleTargets.includes(role as TrainingModule["roleTargets"][number]));
}

export function listTrainingModulesByCategory(category: TrainingModule["category"]): TrainingModule[] {
  return TRAINING_MODULES_DATA.filter((m) => m.category === category);
}

export function countTrainingModules(): number {
  return TRAINING_MODULES_DATA.length;
}
