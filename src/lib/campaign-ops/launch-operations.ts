import { CampaignTaskOpsSourceType, CampaignTaskOpsVisibility, CampaignTaskPriority, CampaignTaskType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { initializeTaskPackageMetadata, writeTaskPackageMetadata } from "@/lib/campaign-ops/task-packages";

export const LAUNCH_OPERATIONS_VERSION = 1 as const;

export type OperationsWorkstream = "PROJECT_MANAGEMENT" | "COMMUNICATIONS" | "EVENT_OPERATIONS";

type TaskBlueprint = {
  key: string;
  workstream: OperationsWorkstream;
  title: string;
  objective: string;
  taskType: CampaignTaskType;
  priority: CampaignTaskPriority;
  daysBefore: number;
  blocksReadiness: boolean;
  assignedRole: string;
  instructions: string[];
  acceptanceCriteria: string[];
  dependsOn?: string[];
};

const BLUEPRINTS: TaskBlueprint[] = [
  { key: "pm.complete-event-record", workstream: "PROJECT_MANAGEMENT", title: "Complete and verify master event record", objective: "Make the event record complete enough that every downstream team can work without chasing routine details.", taskType: "ADMIN", priority: "URGENT", daysBefore: 21, blocksReadiness: true, assignedRole: "event_project_manager", instructions: ["Open the canonical event record.", "Verify date, public time, Kelly arrival/departure, venue, full address, city, county, host and on-site contacts.", "Fill every known operational field and explicitly flag missing information.", "Confirm Kelly's role, speaking expectations and why the campaign is attending.", "Record who owns each unresolved item."], acceptanceCriteria: ["Core event details are verified.", "Missing information is explicitly identified and assigned.", "Downstream teams have one canonical source of truth."] },
  { key: "pm.72-hour-verification", workstream: "PROJECT_MANAGEMENT", title: "Run 72-hour event verification", objective: "Reconfirm the event shortly before execution so stale details do not surprise the campaign.", taskType: "PREP", priority: "URGENT", daysBefore: 3, blocksReadiness: true, assignedRole: "event_project_manager", instructions: ["Contact the host or venue.", "Reconfirm time, address, parking, arrival instructions and on-site contact.", "Confirm speaking expectations and any schedule changes.", "Confirm indoor/outdoor status and weather contingency.", "Update the event record immediately with changes."], acceptanceCriteria: ["Host or venue has been reconfirmed.", "Arrival and parking instructions are current.", "Any changes are reflected in the canonical event record."], dependsOn: ["pm.complete-event-record"] },

  { key: "comms.graphics", workstream: "COMMUNICATIONS", title: "Prepare event graphics package", objective: "Create the approved visual assets every downstream communications channel needs.", taskType: "COMMS", priority: "HIGH", daysBefore: 18, blocksReadiness: true, assignedRole: "communications_graphics", instructions: ["Use the canonical event record for date, time, location and event title.", "Create the standard event graphic variants required by campaign templates.", "Check campaign disclaimer and website treatment.", "Store final approved asset links on the worksheet."], acceptanceCriteria: ["Required graphic variants exist.", "Event details match the canonical record.", "Approved asset location is recorded."], dependsOn: ["pm.complete-event-record"] },
  { key: "comms.facebook-event", workstream: "COMMUNICATIONS", title: "Create Facebook event", objective: "Give the community a shareable event destination with accurate details.", taskType: "COMMS", priority: "HIGH", daysBefore: 16, blocksReadiness: false, assignedRole: "social_media", instructions: ["Open the canonical event record and approved graphic.", "Create the Facebook event using the approved naming and description format.", "Confirm date, time, venue and campaign links.", "Record the live event URL as proof."], acceptanceCriteria: ["Facebook event is live or ready under campaign approval rules.", "Details match the canonical event record.", "URL is recorded."], dependsOn: ["pm.complete-event-record", "comms.graphics"] },
  { key: "comms.announcement-email", workstream: "COMMUNICATIONS", title: "Prepare event announcement email", objective: "Tell the initial qualified local audience that Kelly is coming to their community.", taskType: "COMMS", priority: "HIGH", daysBefore: 14, blocksReadiness: false, assignedRole: "email", instructions: ["Use the approved event details and audience plan.", "Prepare the announcement using the campaign event-email template.", "Position the stop as Kelly coming to listen to the community.", "Route through existing campaign approval/send controls; do not bypass them.", "Record the draft/send artifact in the worksheet."], acceptanceCriteria: ["Announcement is prepared for the approved audience.", "Copy uses verified event information.", "Existing approval/send controls are respected."], dependsOn: ["pm.complete-event-record", "comms.graphics"] },
  { key: "comms.kelly-video", workstream: "COMMUNICATIONS", title: "Produce Kelly direct-to-camera invitation", objective: "Create one authentic invitation asset that can be reused across campaign channels.", taskType: "MEDIA", priority: "HIGH", daysBefore: 10, blocksReadiness: false, assignedRole: "content", instructions: ["Prepare short talking points: where Kelly is coming, why she is excited, local connection, when/where, and invitation to attend.", "Keep the message focused on listening to the community.", "Record the direct-to-camera video.", "Upload/store the approved source asset and record its location."], acceptanceCriteria: ["Usable direct-to-camera invitation exists.", "Event details are accurate.", "Source asset is available to social/email teams."], dependsOn: ["pm.complete-event-record"] },
  { key: "comms.local-media", workstream: "COMMUNICATIONS", title: "Personally invite local media", objective: "Contact relevant local media outlets directly and invite them to Kelly's stop.", taskType: "MEDIA", priority: "HIGH", daysBefore: 9, blocksReadiness: false, assignedRole: "media_outreach", instructions: ["Open the approved local media list.", "Call every relevant outlet.", "Invite the outlet to attend and explain that Kelly is coming to listen to the community.", "Confirm or collect the best email address when possible.", "Email the approved event information where an address is available.", "Record a disposition and follow-up need for every outlet."], acceptanceCriteria: ["Every listed outlet has a disposition.", "Available email contacts received the approved information.", "Follow-ups are recorded."], dependsOn: ["pm.complete-event-record", "comms.graphics"] },
  { key: "comms.invitation-email", workstream: "COMMUNICATIONS", title: "Prepare one-week event invitation email", objective: "Send the detailed event invitation approximately one week before the stop.", taskType: "COMMS", priority: "HIGH", daysBefore: 7, blocksReadiness: false, assignedRole: "email", instructions: ["Use the verified event details.", "Prepare the true invitation with date, time, venue and why Kelly wants the community there.", "Use the approved audience universe.", "Route through existing approval/send controls.", "Record the draft/send artifact."], acceptanceCriteria: ["Detailed invitation is prepared for the approved audience.", "All logistics match the event record.", "Approval/send controls are respected."], dependsOn: ["pm.complete-event-record", "comms.graphics"] },
  { key: "comms.power-of-five", workstream: "COMMUNICATIONS", title: "Run local Power of Five invitation push", objective: "Turn strong local supporters and local campaign helpers into personal invitation multipliers.", taskType: "VOLUNTEER", priority: "HIGH", daysBefore: 6, blocksReadiness: false, assignedRole: "relational_organizing", instructions: ["Start with the strongest available supporter universe and local campaign team.", "Personally invite each contact to meet Kelly.", "Ask each willing person to invite five friends, family members, neighbors or coworkers.", "Explain that Kelly is coming to listen and wants their community represented.", "Send the approved forwardable email/text invitation kit.", "Record asks, commitments and kits delivered."], acceptanceCriteria: ["Power of Five asks are recorded.", "Willing participants received the forwardable kit.", "Results are available for campaign follow-up."], dependsOn: ["pm.complete-event-record"] },
  { key: "comms.door-hangers", workstream: "COMMUNICATIONS", title: "Order and distribute 200 event door hangers", objective: "Put the standard Secretary of State explainer and event invitation into the immediate event area.", taskType: "FIELD", priority: "HIGH", daysBefore: 5, blocksReadiness: false, assignedRole: "field", instructions: ["Send verified event variables to the approved printer using the standard door-hanger template.", "Approve the proof under campaign procedure.", "Confirm 200 copies.", "Assign the immediate-radius distribution turf.", "Record number distributed and area covered."], acceptanceCriteria: ["200 door hangers were produced or accounted for.", "Event information is accurate.", "Distribution result is recorded."], dependsOn: ["pm.complete-event-record"] },
  { key: "comms.day-before-text", workstream: "COMMUNICATIONS", title: "Prepare day-before radius text", objective: "Remind the approved local SMS universe that Kelly will be nearby tomorrow.", taskType: "COMMS", priority: "URGENT", daysBefore: 1, blocksReadiness: false, assignedRole: "sms", instructions: ["Use the approved radius/audience universe.", "Prepare the concise event invitation with verified time and location.", "Route through existing SMS consent, approval and send controls.", "Record the campaign artifact/result."], acceptanceCriteria: ["Text is prepared for the approved universe.", "Event details are verified.", "Consent and send controls are respected."], dependsOn: ["pm.72-hour-verification"] },
  { key: "comms.follow-up", workstream: "COMMUNICATIONS", title: "Complete attendee communications follow-up", objective: "Thank attendees and carry the relationship forward after the event.", taskType: "FOLLOW_UP", priority: "HIGH", daysBefore: -1, blocksReadiness: false, assignedRole: "email", instructions: ["Use captured attendance/contact information under campaign consent rules.", "Prepare the thank-you/follow-up message.", "Include an appropriate next action.", "Route through existing approval/send controls.", "Record the completed artifact/result."], acceptanceCriteria: ["Follow-up is prepared/completed for eligible contacts.", "Next action is clear.", "Campaign controls are respected."], dependsOn: ["ops.closeout"] },

  { key: "ops.candidate-brief", workstream: "EVENT_OPERATIONS", title: "Prepare Kelly event brief", objective: "Give Kelly a concise pre-arrival briefing with the people, purpose, logistics and local context she needs.", taskType: "PREP", priority: "HIGH", daysBefore: 3, blocksReadiness: true, assignedRole: "candidate_prep", instructions: ["Summarize where Kelly is going and why.", "List host/on-site contacts and people Kelly should meet.", "Record Kelly's role, speaking expectations and timing.", "Include arrival, parking and departure instructions.", "Add concise local issues/listening context from verified campaign information."], acceptanceCriteria: ["Kelly can understand the stop from one brief.", "Logistics and contacts are current.", "No unverified claims are presented as fact."], dependsOn: ["pm.complete-event-record"] },
  { key: "ops.staffing", workstream: "EVENT_OPERATIONS", title: "Fill event volunteer roles", objective: "Make sure the stop has enough people to execute setup, welcome, candidate support, capture and breakdown.", taskType: "VOLUNTEER", priority: "HIGH", daysBefore: 5, blocksReadiness: true, assignedRole: "event_project_manager", instructions: ["Review event size/type and required roles.", "Assign or recruit setup, welcome/check-in, Kelly arrival support, contact/listening capture, photo/video and breakdown coverage as needed.", "Combine roles for small events when practical.", "Record names, arrival times and gaps."], acceptanceCriteria: ["Required roles have owners or explicit gaps.", "Volunteers know arrival time and meeting point.", "Unfilled critical roles are escalated."], dependsOn: ["pm.complete-event-record"] },
  { key: "ops.materials", workstream: "EVENT_OPERATIONS", title: "Prepare event materials kit", objective: "Have the campaign materials required for the stop packed, accounted for and ready to travel.", taskType: "PREP", priority: "HIGH", daysBefore: 2, blocksReadiness: true, assignedRole: "event_materials", instructions: ["Review the event materials checklist.", "Pack required signs, literature, voter/SOS information, QR materials, shirts and table/setup items as applicable.", "Record quantities leaving campaign custody.", "Flag missing items immediately."], acceptanceCriteria: ["Required materials are packed or exceptions are recorded.", "Quantities are documented.", "Kit is assigned to a person/vehicle."], dependsOn: ["pm.72-hour-verification"] },
  { key: "ops.setup", workstream: "EVENT_OPERATIONS", title: "Set up campaign presence", objective: "Create a professional, welcoming campaign footprint before Kelly arrives.", taskType: "PREP", priority: "URGENT", daysBefore: 0, blocksReadiness: true, assignedRole: "event_setup", instructions: ["Find the approved campaign location at the venue.", "Set up table/banner/signage and approved materials as applicable.", "Place contact/QR materials where volunteers can use them.", "Check that the area is clean, accessible and ready.", "Upload or record setup proof."], acceptanceCriteria: ["Campaign area is ready before Kelly's arrival.", "Required materials are visible/usable.", "Setup proof is recorded."], dependsOn: ["ops.materials", "ops.staffing"] },
  { key: "ops.kelly-arrival", workstream: "EVENT_OPERATIONS", title: "Manage Kelly arrival and handoff", objective: "Meet Kelly, get her to the right people and protect the event timeline without making her inaccessible.", taskType: "PREP", priority: "URGENT", daysBefore: 0, blocksReadiness: true, assignedRole: "candidate_handler", instructions: ["Be at the agreed meeting point before Kelly arrives.", "Know parking, entrance, host and first required interaction.", "Brief Kelly on any last-minute change.", "Connect Kelly to the host/key people.", "Track required departure time."], acceptanceCriteria: ["Kelly is met and handed off cleanly.", "Last-minute changes are communicated.", "Departure timing is protected."], dependsOn: ["pm.72-hour-verification", "ops.candidate-brief", "ops.staffing"] },
  { key: "ops.listening-capture", workstream: "EVENT_OPERATIONS", title: "Capture what the community tells Kelly", objective: "Turn the campaign promise to listen into structured community learning and follow-up.", taskType: "DATA", priority: "HIGH", daysBefore: 0, blocksReadiness: false, assignedRole: "listening_capture", instructions: ["Capture community issues and themes raised during the stop without unnecessary sensitive personal detail.", "Record useful stories/context and the community/location.", "Flag any specific follow-up Kelly or the campaign committed to.", "Submit notes against the event."], acceptanceCriteria: ["Major themes heard are recorded.", "Campaign commitments/follow-ups are identifiable.", "Notes avoid unnecessary sensitive personal information."], dependsOn: ["ops.staffing"] },
  { key: "ops.contact-capture", workstream: "EVENT_OPERATIONS", title: "Capture event contacts and attendance", objective: "Make sure people met at the event can appropriately remain connected to the campaign.", taskType: "DATA", priority: "HIGH", daysBefore: 0, blocksReadiness: false, assignedRole: "contact_capture", instructions: ["Use the approved campaign contact/attendance capture method.", "Collect only appropriate information and consent.", "Record attendance estimate.", "Route captured contacts into the campaign's existing data process."], acceptanceCriteria: ["Attendance estimate is recorded.", "Captured contacts are handed into the approved data process.", "Consent rules are respected."], dependsOn: ["ops.staffing"] },
  { key: "ops.content-capture", workstream: "EVENT_OPERATIONS", title: "Capture required event photo and video", objective: "Create usable proof of Kelly listening, engaging and showing up in the community.", taskType: "MEDIA", priority: "HIGH", daysBefore: 0, blocksReadiness: false, assignedRole: "event_content", instructions: ["Capture Kelly interacting and listening.", "Capture a wide event/environment image and recognizable local context.", "Capture Kelly with the host and speaking if applicable.", "Capture useful vertical video clips.", "Record names/context when appropriate and upload assets to the approved campaign location."], acceptanceCriteria: ["Required shot categories are represented where possible.", "Assets are uploaded/linked.", "Useful context is recorded."], dependsOn: ["ops.staffing"] },
  { key: "ops.breakdown", workstream: "EVENT_OPERATIONS", title: "Break down and account for campaign materials", objective: "Leave the venue clean, thank the host and return campaign property with losses documented.", taskType: "PREP", priority: "HIGH", daysBefore: 0, blocksReadiness: false, assignedRole: "event_setup", instructions: ["Collect campaign signs, literature and equipment.", "Restore/clean the campaign area.", "Personally thank the host or designated contact.", "Record returned quantities and missing/damaged items.", "Confirm who is transporting materials back."], acceptanceCriteria: ["Campaign area is left clean.", "Host is thanked.", "Materials are accounted for."], dependsOn: ["ops.setup"] },
  { key: "ops.closeout", workstream: "EVENT_OPERATIONS", title: "Close out event operations", objective: "Return the event's operational results, assets, follow-ups and lessons to the campaign system.", taskType: "FOLLOW_UP", priority: "HIGH", daysBefore: -1, blocksReadiness: true, assignedRole: "event_project_manager", instructions: ["Record final attendance estimate and volunteer participation/hours when available.", "Confirm contacts and listening notes were submitted.", "Confirm photos/video were uploaded.", "Record host/candidate follow-ups and anything Kelly promised.", "Record materials exceptions, media outcomes, problems and lessons learned.", "Do not close until critical missing outputs are assigned."], acceptanceCriteria: ["Required event outputs are accounted for.", "Follow-ups have owners.", "Lessons/problems are recorded.", "Event can be reviewed without reconstructing it from texts or memory."], dependsOn: ["ops.listening-capture", "ops.contact-capture", "ops.content-capture", "ops.breakdown"] },
];

function dueAt(startAt: Date, daysBefore: number): Date {
  const due = new Date(startAt);
  due.setUTCDate(due.getUTCDate() - daysBefore);
  return due;
}

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export async function launchEventOperations(input: { eventId: string; actorUserId?: string | null }) {
  const event = await prisma.campaignEvent.findUnique({ where: { id: input.eventId }, select: { id: true, title: true, startAt: true, countyId: true, ownerUserId: true, isTravelLeg: true, status: true } });
  if (!event) throw new Error("Event not found");
  if (event.isTravelLeg) throw new Error("Travel legs do not receive first-class event operations packages");
  if (String(event.status) === "CANCELED") throw new Error("Canceled events cannot launch operations");

  const existing = await prisma.campaignTask.findMany({ where: { eventId: event.id, sourceTemplateTaskKey: { in: BLUEPRINTS.map((item) => `campaign-ops-v${LAUNCH_OPERATIONS_VERSION}:${item.key}`) } }, select: { sourceTemplateTaskKey: true } });
  const existingKeys = new Set(existing.map((row) => row.sourceTemplateTaskKey).filter(Boolean));
  const createdByKey = new Map<string, string>();
  const createdTaskIds: string[] = [];

  for (const blueprint of BLUEPRINTS) {
    const sourceTemplateTaskKey = `campaign-ops-v${LAUNCH_OPERATIONS_VERSION}:${blueprint.key}`;
    if (existingKeys.has(sourceTemplateTaskKey)) continue;

    const dependencyIds: string[] = [];
    for (const dependencyKey of blueprint.dependsOn ?? []) {
      const justCreated = createdByKey.get(dependencyKey);
      if (justCreated) {
        dependencyIds.push(justCreated);
        continue;
      }
      const prior = await prisma.campaignTask.findFirst({ where: { eventId: event.id, sourceTemplateTaskKey: `campaign-ops-v${LAUNCH_OPERATIONS_VERSION}:${dependencyKey}` }, select: { id: true } });
      if (prior) dependencyIds.push(prior.id);
    }

    const packageMetadata = initializeTaskPackageMetadata({ objective: blueprint.objective, instructions: blueprint.instructions, acceptanceCriteria: blueprint.acceptanceCriteria, dependencyTaskIds: dependencyIds });
    const opsMetadata = writeTaskPackageMetadata({ launchOperations: { version: LAUNCH_OPERATIONS_VERSION, workstream: blueprint.workstream, blueprintKey: blueprint.key, launchedAt: new Date().toISOString() } }, packageMetadata);
    const task = await prisma.campaignTask.create({
      data: {
        title: blueprint.title,
        description: blueprint.objective,
        taskType: blueprint.taskType,
        priority: blueprint.priority,
        dueAt: dueAt(event.startAt, blueprint.daysBefore),
        assignedRole: blueprint.assignedRole,
        blocksReadiness: blueprint.blocksReadiness,
        sourceTemplateTaskKey,
        countyId: event.countyId,
        eventId: event.id,
        createdByUserId: input.actorUserId ?? null,
        opsSourceType: CampaignTaskOpsSourceType.event_template,
        opsVisibility: CampaignTaskOpsVisibility.operators,
        opsMetadataJson: json(opsMetadata),
      },
      select: { id: true },
    });
    createdByKey.set(blueprint.key, task.id);
    createdTaskIds.push(task.id);
  }

  const allTasks = await prisma.campaignTask.findMany({ where: { eventId: event.id, sourceTemplateTaskKey: { startsWith: `campaign-ops-v${LAUNCH_OPERATIONS_VERSION}:` } }, select: { id: true, status: true, blocksReadiness: true, opsMetadataJson: true } });
  return { eventId: event.id, eventTitle: event.title, createdTaskIds, createdCount: createdTaskIds.length, totalOperationalTasks: allTasks.length, readinessBlockers: allTasks.filter((task) => task.blocksReadiness && String(task.status) !== "DONE").length };
}

export async function listLaunchableEvents(take = 100) {
  const events = await prisma.campaignEvent.findMany({ where: { isTravelLeg: false, status: { not: "CANCELED" }, startAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, orderBy: { startAt: "asc" }, take, select: { id: true, title: true, startAt: true, city: true, locationName: true, ownerUserId: true, _count: { select: { tasks: true } } } });
  const taskCounts = await prisma.campaignTask.groupBy({ by: ["eventId"], where: { eventId: { in: events.map((event) => event.id) }, sourceTemplateTaskKey: { startsWith: `campaign-ops-v${LAUNCH_OPERATIONS_VERSION}:` } }, _count: { _all: true } });
  const counts = new Map(taskCounts.map((row) => [row.eventId, row._count._all]));
  return events.map((event) => ({ ...event, operationsTaskCount: counts.get(event.id) ?? 0, expectedOperationsTaskCount: BLUEPRINTS.length, operationsLaunched: (counts.get(event.id) ?? 0) > 0, operationsComplete: (counts.get(event.id) ?? 0) >= BLUEPRINTS.length }));
}

export function launchOperationsBlueprintSummary() {
  return BLUEPRINTS.map(({ key, workstream, title, daysBefore, assignedRole, blocksReadiness }) => ({ key, workstream, title, daysBefore, assignedRole, blocksReadiness }));
}
