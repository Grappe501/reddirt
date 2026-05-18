export type FinalizationInspectorResult = {
  id: string;
  label: string;
  score: number;
  status: "green" | "yellow" | "red";
  explanation: string;
};
