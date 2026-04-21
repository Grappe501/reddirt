import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ProcessSteps, type ProcessStepItem } from "@/components/blocks/ProcessSteps";

const defaultSteps: ProcessStepItem[] = [
  { step: 1, title: "Listen", description: "Name fears and hopes without fixing—yet." },
  { step: 2, title: "Gather", description: "Small circles beat big stages for trust." },
  { step: 3, title: "Organize", description: "Roles, rhythms, and shared agreements." },
  { step: 4, title: "Train", description: "Skills for doors, meetings, and conflict." },
  { step: 5, title: "Act", description: "Visible steps neighbors can join." },
];

type OrganizingStepBandProps = {
  id?: string;
  steps?: ProcessStepItem[];
};

export function OrganizingStepBand({ id = "how-teams-grow", steps = defaultSteps }: OrganizingStepBandProps) {
  return (
    <div className="space-y-10">
      <SectionHeading
        id={`${id}-heading`}
        eyebrow="Momentum"
        title="How local teams grow"
        subtitle="Not a ladder you climb alone—a loop your community repeats with care."
      />
      <ProcessSteps id={id} steps={steps} />
    </div>
  );
}
