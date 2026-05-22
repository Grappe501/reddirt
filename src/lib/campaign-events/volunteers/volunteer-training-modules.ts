export type VolunteerTrainingModule = {
  id: string;
  title: string;
  role: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  prerequisites: string[];
  learningObjectives: string[];
  checklist: string[];
  completionCriteria: string;
};

export const VOLUNTEER_TRAINING_MODULES: VolunteerTrainingModule[] = [
  { id: "campaign-basics", title: "Campaign basics", role: ["volunteer", "intern"], difficulty: "beginner", estimatedMinutes: 20, prerequisites: [], learningObjectives: ["Know Kelly SOS mission", "Understand volunteer code"], checklist: ["Read welcome packet", "Sign conduct acknowledgment"], completionCriteria: "Checklist complete" },
  { id: "kelly-message", title: "Kelly message", role: ["volunteer", "county_lead"], difficulty: "beginner", estimatedMinutes: 25, prerequisites: ["campaign-basics"], learningObjectives: ["Deliver consistent message"], checklist: ["Review talking points"], completionCriteria: "Quiz or CM sign-off" },
  { id: "volunteer-code-of-conduct", title: "Volunteer code of conduct", role: ["volunteer"], difficulty: "beginner", estimatedMinutes: 15, prerequisites: [], learningObjectives: ["Compliance-safe behavior"], checklist: ["Read conduct doc"], completionCriteria: "Acknowledged" },
  { id: "event-setup", title: "Event setup", role: ["volunteer"], difficulty: "beginner", estimatedMinutes: 30, prerequisites: ["campaign-basics"], learningObjectives: ["Setup timeline", "Safety"], checklist: ["Arrival time", "Equipment list"], completionCriteria: "Shadow one event" },
  { id: "check-in-table", title: "Check-in table", role: ["volunteer"], difficulty: "beginner", estimatedMinutes: 20, prerequisites: ["event-setup"], learningObjectives: ["Guest check-in flow"], checklist: ["Sign-in sheets", "Data privacy"], completionCriteria: "Supervised shift" },
  { id: "literature-table", title: "Literature table", role: ["volunteer"], difficulty: "beginner", estimatedMinutes: 20, prerequisites: ["campaign-basics"], learningObjectives: ["Materials handling"], checklist: ["Inventory", "Distribution rules"], completionCriteria: "One event shift" },
  { id: "house-party-support", title: "House party support", role: ["volunteer", "host_helper"], difficulty: "intermediate", estimatedMinutes: 35, prerequisites: ["event-setup"], learningObjectives: ["Host support", "Room flow"], checklist: ["Host briefing", "Cleanup"], completionCriteria: "CM review" },
  { id: "phone-bank-basics", title: "Phone bank basics", role: ["volunteer"], difficulty: "intermediate", estimatedMinutes: 40, prerequisites: ["kelly-message", "data-privacy-rules"], learningObjectives: ["Call script", "Opt-out"], checklist: ["TCPA awareness", "Script practice"], completionCriteria: "Supervised calls — no auto dialer" },
  { id: "text-bank-basics", title: "Text bank basics", role: ["volunteer"], difficulty: "intermediate", estimatedMinutes: 35, prerequisites: ["data-privacy-rules"], learningObjectives: ["P2P rules", "Consent"], checklist: ["Locked send posture review"], completionCriteria: "Coordinator approval" },
  { id: "canvassing-basics", title: "Canvassing basics", role: ["volunteer", "field"], difficulty: "intermediate", estimatedMinutes: 45, prerequisites: ["kelly-message", "data-privacy-rules"], learningObjectives: ["Door etiquette", "No voter file write"], checklist: ["Partner required", "Materials"], completionCriteria: "Field manager sign-off" },
  { id: "power-of-five", title: "Power of 5", role: ["volunteer", "county_lead"], difficulty: "intermediate", estimatedMinutes: 30, prerequisites: ["campaign-basics"], learningObjectives: ["Relational ask", "Five contacts"], checklist: ["List five people", "Follow-up plan"], completionCriteria: "Five slots documented" },
  { id: "voter-registration-basics", title: "Voter registration basics", role: ["volunteer"], difficulty: "intermediate", estimatedMinutes: 25, prerequisites: ["campaign-basics"], learningObjectives: ["VR rules", "Handoff"], checklist: ["Forms", "County deadlines"], completionCriteria: "Training module complete" },
  { id: "county-organizing", title: "County organizing", role: ["county_lead", "field_manager"], difficulty: "advanced", estimatedMinutes: 50, prerequisites: ["power-of-five", "kelly-message"], learningObjectives: ["County plan", "Captain coaching"], checklist: ["County KPI review", "Weekly rhythm"], completionCriteria: "CM approval" },
  { id: "social-media-sharing", title: "Social media sharing", role: ["volunteer", "communications"], difficulty: "beginner", estimatedMinutes: 20, prerequisites: ["campaign-basics"], learningObjectives: ["Approved assets only"], checklist: ["Brand kit", "No unsourced claims"], completionCriteria: "Comms lead review" },
  { id: "hot-wash-notes", title: "Hot wash notes", role: ["volunteer", "intern"], difficulty: "beginner", estimatedMinutes: 15, prerequisites: ["event-setup"], learningObjectives: ["Capture learnings"], checklist: ["Template", "County impact"], completionCriteria: "One hot wash submitted" },
  { id: "receipt-upload-basics", title: "Receipt / document upload", role: ["volunteer", "treasurer_helper"], difficulty: "beginner", estimatedMinutes: 20, prerequisites: [], learningObjectives: ["Finance hygiene"], checklist: ["Redact PII", "Upload path"], completionCriteria: "Sample upload" },
  { id: "data-privacy-rules", title: "Data & privacy rules", role: ["volunteer", "intern", "field"], difficulty: "beginner", estimatedMinutes: 25, prerequisites: [], learningObjectives: ["No voter file writes", "Consent"], checklist: ["Read privacy doc"], completionCriteria: "Acknowledged" },
];

export function getTrainingModule(id: string): VolunteerTrainingModule | undefined {
  return VOLUNTEER_TRAINING_MODULES.find((m) => m.id === id);
}
