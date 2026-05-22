import fs from "node:fs";
import path from "node:path";
import type {
  VolunteerAssignment,
  VolunteerImportBatch,
  VolunteerObservation,
  VolunteerProfile,
  VolunteerTeam,
  VolunteerTrainingRecord,
  VolunteersStore,
} from "./volunteer-types";

const REL = path.join("data", "campaign-events", "volunteers");

function filePath(name: string): string {
  return path.join(process.cwd(), REL, name);
}

function readJson<T>(name: string, fallback: T): T {
  const p = filePath(name);
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(name: string, data: unknown): void {
  const p = filePath(name);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function loadVolunteersStore(): VolunteersStore {
  return {
    version: 1,
    profiles: readJson("volunteer-profiles.json", []),
    teams: readJson("volunteer-teams.json", []),
    assignments: readJson("volunteer-assignments.json", []),
    training: readJson("volunteer-training.json", []),
    observations: readJson("volunteer-observations.json", []),
    imports: readJson("volunteer-imports.json", []),
  };
}

export function saveVolunteerProfiles(profiles: VolunteerProfile[]): void {
  writeJson("volunteer-profiles.json", profiles);
}

export function saveVolunteerAssignments(assignments: VolunteerAssignment[]): void {
  writeJson("volunteer-assignments.json", assignments);
}

export function appendVolunteerObservation(obs: Omit<VolunteerObservation, "id" | "at"> & { id?: string; at?: string }): VolunteerObservation {
  const list = readJson<VolunteerObservation[]>("volunteer-observations.json", []);
  const full: VolunteerObservation = {
    ...obs,
    id: obs.id ?? `vo_${Date.now().toString(36)}`,
    at: obs.at ?? new Date().toISOString(),
  };
  writeJson("volunteer-observations.json", [...list, full].slice(-300));
  return full;
}

export function getVolunteerById(id: string): VolunteerProfile | undefined {
  return loadVolunteersStore().profiles.find((p) => p.id === id);
}

export function upsertVolunteerProfile(profile: VolunteerProfile): VolunteerProfile {
  const profiles = loadVolunteersStore().profiles;
  const idx = profiles.findIndex((p) => p.id === profile.id);
  const next = idx >= 0 ? profiles.map((p, i) => (i === idx ? profile : p)) : [...profiles, profile];
  saveVolunteerProfiles(next);
  return profile;
}

export function ensureSampleVolunteerForTests(): VolunteerProfile {
  const existing = loadVolunteersStore().profiles.find((p) => p.id === "vol_sample_001");
  if (existing) return existing;
  const sample: VolunteerProfile = {
    id: "vol_sample_001",
    firstName: "Sample",
    lastName: "Volunteer",
    email: "sample.volunteer@example.test",
    phone: "",
    city: "Little Rock",
    county: "pulaski",
    zip: "72201",
    source: "campaign_os_test",
    consentStatus: "explicit",
    communicationPreferences: ["email"],
    skills: ["check_in", "event_setup"],
    interests: ["events", "voter_registration"],
    availability: [{ day: "sat", period: "morning" }],
    preferredTasks: ["check-in table"],
    trainingCompleted: ["campaign-basics"],
    trainingNeeded: ["canvassing-basics"],
    assignedEvents: [],
    assignedTasks: [],
    reliabilityScore: 72,
    leadershipPotential: "medium",
    progressLevel: "event_volunteer_l2",
    tags: ["test", "sample"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  upsertVolunteerProfile(sample);
  return sample;
}

export function seedEmptyVolunteerDataFiles(): void {
  const files: [string, unknown][] = [
    ["volunteer-profiles.json", []],
    ["volunteer-teams.json", []],
    ["volunteer-assignments.json", []],
    ["volunteer-training.json", []],
    ["volunteer-observations.json", []],
    ["volunteer-imports.json", []],
  ];
  for (const [name, fallback] of files) {
    const p = filePath(name);
    if (!fs.existsSync(p)) writeJson(name, fallback);
  }
}
