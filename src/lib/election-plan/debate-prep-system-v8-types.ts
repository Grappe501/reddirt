/**
 * Client-safe debate prep v8 types — no server-only import chain.
 */

export type DebatePrepTonightStepV8 = {
  stepId: string;
  order: number;
  label: string;
  detail: string;
  minutes: number;
  href: string;
  moduleId: string;
  completed: boolean;
};

export type DebatePrepTonightPackageV8 = {
  headline: string;
  totalMinutes: number;
  forumFirst: boolean;
  steps: DebatePrepTonightStepV8[];
  stepsCompleted: number;
};
