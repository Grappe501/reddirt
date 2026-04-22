import {
  CampaignEventType,
  CampaignTaskPriority,
  CampaignTaskType,
  EventWorkflowState,
  PrismaClient,
  WorkflowTemplateTrigger,
} from "@prisma/client";

type Line = {
  taskKey: string;
  titleTemplate: string;
  descriptionTemplate?: string;
  offsetMinutes: number;
  taskType: CampaignTaskType;
  priority: CampaignTaskPriority;
  roleTarget?: string;
  required?: boolean;
  blocksReadiness?: boolean;
  minEventStage?: EventWorkflowState | null;
  dependsOnTaskKey?: string;
};

const packs: {
  key: string;
  title: string;
  description: string;
  campaignEventType: CampaignEventType | null;
  tasks: Line[];
}[] = [
  {
    key: "s4_event_appearance_v1",
    title: "Candidate appearance",
    description: "Prep, day-of, media, and recap for a candidate appearance.",
    campaignEventType: CampaignEventType.APPEARANCE,
    tasks: [
      { taskKey: "app_brief", titleTemplate: "Draft briefing & success criteria: {{eventTitle}}", offsetMinutes: -10080, taskType: CampaignTaskType.PREP, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.DRAFT, blocksReadiness: true, required: true },
      { taskKey: "app_comms", titleTemplate: "Message calendar: invites & RSVP for {{eventTitle}}", descriptionTemplate: "Align with comms channel owners.", offsetMinutes: -7200, taskType: CampaignTaskType.COMMS, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.PENDING_APPROVAL, blocksReadiness: true },
      { taskKey: "app_travel", titleTemplate: "Travel & run-of-show for {{date}}", offsetMinutes: -180, taskType: CampaignTaskType.PREP, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.APPROVED, roleTarget: "field_director" },
      { taskKey: "app_dayof", titleTemplate: "Day-of check-in & volunteer briefing", offsetMinutes: -45, taskType: CampaignTaskType.FIELD, priority: CampaignTaskPriority.URGENT, minEventStage: EventWorkflowState.PUBLISHED, blocksReadiness: true, dependsOnTaskKey: "app_travel" },
      { taskKey: "app_media", titleTemplate: "Capture photos / video & upload", offsetMinutes: 30, taskType: CampaignTaskType.MEDIA, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.PUBLISHED, blocksReadiness: true },
      { taskKey: "app_recap", titleTemplate: "Post-event recap & press clip package", descriptionTemplate: "Thank yous and metrics.", offsetMinutes: 240, taskType: CampaignTaskType.FOLLOW_UP, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.COMPLETED, blocksReadiness: true },
    ],
  },
  {
    key: "s4_event_town_hall_v1",
    title: "Town hall",
    description: "Venue, agenda, and moderator prep for a town-hall program.",
    campaignEventType: CampaignEventType.MEETING,
    tasks: [
      { taskKey: "th_venue", titleTemplate: "Confirm venue, AV, and accessibility for {{eventTitle}}", offsetMinutes: -10080, taskType: CampaignTaskType.PREP, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.DRAFT, blocksReadiness: true },
      { taskKey: "th_agenda", titleTemplate: "Publish agenda & moderator prep notes", offsetMinutes: -2880, taskType: CampaignTaskType.PREP, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.APPROVED, blocksReadiness: true },
      { taskKey: "th_staffing", titleTemplate: "Sign-in, crowd flow, and question screening roles", offsetMinutes: -1440, taskType: CampaignTaskType.VOLUNTEER, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.APPROVED, roleTarget: "county_lead" },
      { taskKey: "th_gotv", titleTemplate: "RSVP nudge & calendar holds", offsetMinutes: -720, taskType: CampaignTaskType.COMMS, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.PUBLISHED },
      { taskKey: "th_follow", titleTemplate: "Thank-you, FAQ follow-up, and data export", offsetMinutes: 120, taskType: CampaignTaskType.FOLLOW_UP, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.COMPLETED, blocksReadiness: true },
    ],
  },
  {
    key: "s4_event_fundraiser_v1",
    title: "Fundraiser",
    description: "Host, finance compliance, and donor follow-up tasks.",
    campaignEventType: CampaignEventType.FUNDRAISER,
    tasks: [
      { taskKey: "fr_host", titleTemplate: "Host agreement & run-of-show ({{eventTitle}})", offsetMinutes: -14400, taskType: CampaignTaskType.ADMIN, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.DRAFT, blocksReadiness: true },
      { taskKey: "fr_invite", titleTemplate: "Segment donor invites & ask ladder", offsetMinutes: -7200, taskType: CampaignTaskType.COMMS, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.PENDING_APPROVAL, blocksReadiness: true },
      { taskKey: "fr_walkthrough", titleTemplate: "Compliance check & pledge capture setup", offsetMinutes: -1440, taskType: CampaignTaskType.ADMIN, priority: CampaignTaskPriority.URGENT, minEventStage: EventWorkflowState.APPROVED, blocksReadiness: true },
      { taskKey: "fr_day", titleTemplate: "Arrival, check-in, and auction timing", offsetMinutes: -60, taskType: CampaignTaskType.PREP, priority: CampaignTaskPriority.URGENT, minEventStage: EventWorkflowState.PUBLISHED, blocksReadiness: true },
      { taskKey: "fr_thank", titleTemplate: "Post-event thank-you and pledge fulfillment", offsetMinutes: 180, taskType: CampaignTaskType.FOLLOW_UP, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.COMPLETED },
    ],
  },
  {
    key: "s4_event_canvass_v1",
    title: "Canvass / field day",
    description: "Turfs, training, and debrief for canvassing.",
    campaignEventType: CampaignEventType.CANVASS,
    tasks: [
      { taskKey: "cv_turf", titleTemplate: "Lock turf, packets, and map QA for {{eventTitle}}", offsetMinutes: -4320, taskType: CampaignTaskType.FIELD, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.DRAFT, blocksReadiness: true },
      { taskKey: "cv_train", titleTemplate: "Huddle script & minivan logistics", offsetMinutes: -120, taskType: CampaignTaskType.VOLUNTEER, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.APPROVED },
      { taskKey: "cv_launch", titleTemplate: "Launch checklist & data hotwash lead", offsetMinutes: -20, taskType: CampaignTaskType.FIELD, priority: CampaignTaskPriority.URGENT, minEventStage: EventWorkflowState.PUBLISHED, blocksReadiness: true, roleTarget: "field_director" },
      { taskKey: "cv_data", titleTemplate: "Return packets & import results", offsetMinutes: 180, taskType: CampaignTaskType.DATA, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.COMPLETED, blocksReadiness: true },
    ],
  },
  {
    key: "s4_event_training_v1",
    title: "Volunteer training",
    description: "Curriculum, roster, and follow-up for a training block.",
    campaignEventType: CampaignEventType.TRAINING,
    tasks: [
      { taskKey: "tr_curriculum", titleTemplate: "Curriculum, slides, and materials for {{eventTitle}}", offsetMinutes: -10080, taskType: CampaignTaskType.PREP, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.DRAFT, blocksReadiness: true },
      { taskKey: "tr_roster", titleTemplate: "Roster, reminders, and attendance capture", offsetMinutes: -2880, taskType: CampaignTaskType.VOLUNTEER, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.APPROVED, blocksReadiness: true },
      { taskKey: "tr_room", titleTemplate: "Room setup, sign-in, and nametags", offsetMinutes: -60, taskType: CampaignTaskType.PREP, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.PUBLISHED },
      { taskKey: "tr_next", titleTemplate: "Next-step asks & 1:1 follow-ups", offsetMinutes: 90, taskType: CampaignTaskType.FOLLOW_UP, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.COMPLETED },
    ],
  },
  {
    key: "s4_event_internal_meeting_v1",
    title: "Internal staff meeting",
    description: "Light staff-only prep (no public execution tasks by default).",
    campaignEventType: null,
    tasks: [
      { taskKey: "in_agenda", titleTemplate: "Publish internal agenda: {{eventTitle}}", offsetMinutes: -2880, taskType: CampaignTaskType.PREP, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.DRAFT },
      { taskKey: "in_notes", titleTemplate: "Action items & follow-up list", offsetMinutes: 30, taskType: CampaignTaskType.ADMIN, priority: CampaignTaskPriority.LOW, minEventStage: EventWorkflowState.COMPLETED },
    ],
  },
  {
    key: "s4_event_press_v1",
    title: "Media / press",
    description: "Credentials, message discipline, and clip capture for press events.",
    campaignEventType: CampaignEventType.PRESS,
    tasks: [
      { taskKey: "pr_talking", titleTemplate: "Talking points & Q&A for {{eventTitle}}", offsetMinutes: -10080, taskType: CampaignTaskType.PREP, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.DRAFT, blocksReadiness: true },
      { taskKey: "pr_spokes", titleTemplate: "Spokespeople confirmed & on-site roles", offsetMinutes: -1440, taskType: CampaignTaskType.COMMS, priority: CampaignTaskPriority.HIGH, minEventStage: EventWorkflowState.APPROVED, blocksReadiness: true },
      { taskKey: "pr_live", titleTemplate: "Press check-in, credentialing, and statement timing", offsetMinutes: -30, taskType: CampaignTaskType.MEDIA, priority: CampaignTaskPriority.URGENT, minEventStage: EventWorkflowState.PUBLISHED, blocksReadiness: true },
      { taskKey: "pr_clips", titleTemplate: "Distribute b-roll, quotes, and local angles", offsetMinutes: 90, taskType: CampaignTaskType.MEDIA, priority: CampaignTaskPriority.MEDIUM, minEventStage: EventWorkflowState.COMPLETED, blocksReadiness: true },
    ],
  },
];

export async function seedSlice4WorkflowTemplates(prisma: PrismaClient) {
  for (const pack of packs) {
    const tpl = await prisma.workflowTemplate.upsert({
      where: { key: pack.key },
      create: {
        key: pack.key,
        title: pack.title,
        description: pack.description,
        triggerType: WorkflowTemplateTrigger.MANUAL,
        isActive: true,
        configJson: {},
        campaignEventType: pack.campaignEventType,
      },
      update: {
        title: pack.title,
        description: pack.description,
        isActive: true,
        campaignEventType: pack.campaignEventType,
      },
    });
    for (const t of pack.tasks) {
      await prisma.workflowTemplateTask.upsert({
        where: {
          workflowTemplateId_taskKey: { workflowTemplateId: tpl.id, taskKey: t.taskKey },
        },
        create: {
          workflowTemplateId: tpl.id,
          taskKey: t.taskKey,
          titleTemplate: t.titleTemplate,
          descriptionTemplate: t.descriptionTemplate,
          offsetMinutes: t.offsetMinutes,
          taskType: t.taskType,
          priority: t.priority,
          required: t.required ?? true,
          blocksReadiness: t.blocksReadiness ?? false,
          minEventStage: t.minEventStage ?? null,
          roleTarget: t.roleTarget,
          dependsOnTaskKey: t.dependsOnTaskKey,
        },
        update: {
          titleTemplate: t.titleTemplate,
          descriptionTemplate: t.descriptionTemplate,
          offsetMinutes: t.offsetMinutes,
          taskType: t.taskType,
          priority: t.priority,
          required: t.required ?? true,
          blocksReadiness: t.blocksReadiness ?? false,
          minEventStage: t.minEventStage ?? null,
          roleTarget: t.roleTarget,
          dependsOnTaskKey: t.dependsOnTaskKey,
        },
      });
    }
  }
}
