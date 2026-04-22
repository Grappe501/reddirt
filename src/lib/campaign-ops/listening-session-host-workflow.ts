/**
 * Campaign operations: connect public “invite your town” interest to workbench planning.
 *
 * - `host_gathering` form submissions with `gatheringType: "listening_session"` are stored on
 *   `Submission` / `User` and surface in admin intake; staff can link them to {@link CampaignEvent}
 *   and task packs.
 * - **Future:** seed a `WorkflowTemplate` with this key to auto-spawn planning tasks
 *   (venue check, comms, RSVP page, day-of run sheet).
 */
export const LISTENING_SESSION_TOWN_PLAN_WORKFLOW_KEY = "listening_session_town_plan" as const;
