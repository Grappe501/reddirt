import type { CampaignRole, CurrentActor, MembershipStatus } from "./types";
import { EventPmAuthError } from "./types";

export const PERMISSIONS = {
  EVENT_VIEW_ALL: "event.view_all",
  EVENT_VIEW_ASSIGNED: "event.view_assigned",
  EVENT_CREATE: "event.create",
  EVENT_UPDATE: "event.update",
  EVENT_DUPLICATE: "event.duplicate",
  EVENT_DELETE: "event.delete",
  EVENT_PUBLISH: "event.publish",
  EVENT_PROJECT_LAUNCH: "event_project.launch",
  EVENT_PROJECT_VIEW: "event_project.view",
  EVENT_PROJECT_UPDATE: "event_project.update",
  EVENT_PROJECT_CLOSE: "event_project.close",
  EVENT_TASK_CREATE: "event_task.create",
  EVENT_TASK_ASSIGN: "event_task.assign",
  EVENT_TASK_UPDATE: "event_task.update",
  EVENT_TASK_COMPLETE: "event_task.complete",
  EVENT_STAFF_VIEW: "event_staff.view",
  EVENT_STAFF_MANAGE: "event_staff.manage",
  EVENT_COMMS_VIEW: "event_comms.view",
  EVENT_COMMS_MANAGE: "event_comms.manage",
  USER_VIEW: "user.view",
  USER_INVITE: "user.invite",
  USER_MANAGE: "user.manage",
  ROLE_MANAGE: "role.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

const ROLE_PERMISSIONS: Record<CampaignRole, readonly Permission[]> = {
  OWNER: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS,
  CAMPAIGN_MANAGER: [
    PERMISSIONS.EVENT_VIEW_ALL,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_UPDATE,
    PERMISSIONS.EVENT_DUPLICATE,
    PERMISSIONS.EVENT_PUBLISH,
    PERMISSIONS.EVENT_PROJECT_LAUNCH,
    PERMISSIONS.EVENT_PROJECT_VIEW,
    PERMISSIONS.EVENT_PROJECT_UPDATE,
    PERMISSIONS.EVENT_PROJECT_CLOSE,
    PERMISSIONS.EVENT_TASK_CREATE,
    PERMISSIONS.EVENT_TASK_ASSIGN,
    PERMISSIONS.EVENT_TASK_UPDATE,
    PERMISSIONS.EVENT_TASK_COMPLETE,
    PERMISSIONS.EVENT_STAFF_VIEW,
    PERMISSIONS.EVENT_STAFF_MANAGE,
    PERMISSIONS.EVENT_COMMS_VIEW,
    PERMISSIONS.EVENT_COMMS_MANAGE,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_INVITE,
  ],
  EVENT_MANAGER: [
    PERMISSIONS.EVENT_VIEW_ASSIGNED,
    PERMISSIONS.EVENT_UPDATE,
    PERMISSIONS.EVENT_PROJECT_VIEW,
    PERMISSIONS.EVENT_PROJECT_UPDATE,
    PERMISSIONS.EVENT_PROJECT_CLOSE,
    PERMISSIONS.EVENT_TASK_CREATE,
    PERMISSIONS.EVENT_TASK_ASSIGN,
    PERMISSIONS.EVENT_TASK_UPDATE,
    PERMISSIONS.EVENT_TASK_COMPLETE,
    PERMISSIONS.EVENT_STAFF_VIEW,
    PERMISSIONS.EVENT_STAFF_MANAGE,
    PERMISSIONS.EVENT_COMMS_VIEW,
  ],
  COMMUNICATIONS: [
    PERMISSIONS.EVENT_VIEW_ASSIGNED,
    PERMISSIONS.EVENT_PROJECT_VIEW,
    PERMISSIONS.EVENT_TASK_UPDATE,
    PERMISSIONS.EVENT_TASK_COMPLETE,
    PERMISSIONS.EVENT_COMMS_VIEW,
    PERMISSIONS.EVENT_COMMS_MANAGE,
  ],
  ORGANIZER: [
    PERMISSIONS.EVENT_VIEW_ASSIGNED,
    PERMISSIONS.EVENT_PROJECT_VIEW,
    PERMISSIONS.EVENT_TASK_UPDATE,
    PERMISSIONS.EVENT_TASK_COMPLETE,
    PERMISSIONS.EVENT_STAFF_VIEW,
  ],
  VOLUNTEER_COORDINATOR: [
    PERMISSIONS.EVENT_VIEW_ASSIGNED,
    PERMISSIONS.EVENT_PROJECT_VIEW,
    PERMISSIONS.EVENT_TASK_ASSIGN,
    PERMISSIONS.EVENT_TASK_UPDATE,
    PERMISSIONS.EVENT_TASK_COMPLETE,
    PERMISSIONS.EVENT_STAFF_VIEW,
    PERMISSIONS.EVENT_STAFF_MANAGE,
  ],
  VOLUNTEER: [
    PERMISSIONS.EVENT_VIEW_ASSIGNED,
    PERMISSIONS.EVENT_PROJECT_VIEW,
    PERMISSIONS.EVENT_TASK_UPDATE,
    PERMISSIONS.EVENT_TASK_COMPLETE,
  ],
  VIEWER: [
    PERMISSIONS.EVENT_VIEW_ALL,
    PERMISSIONS.EVENT_PROJECT_VIEW,
    PERMISSIONS.EVENT_STAFF_VIEW,
    PERMISSIONS.EVENT_COMMS_VIEW,
  ],
};

export function permissionsForRole(role: CampaignRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function assertActiveMembership(status: MembershipStatus): void {
  if (status === "ACTIVE") return;
  if (status === "INVITED") throw new EventPmAuthError(403, "membership_pending", "Campaign access is pending activation.");
  if (status === "SUSPENDED") throw new EventPmAuthError(403, "membership_suspended", "Campaign access is suspended.");
  throw new EventPmAuthError(403, "membership_disabled", "Campaign access is disabled.");
}

export function can(actor: CurrentActor, permission: Permission): boolean {
  return actor.permissions.includes(permission);
}

export function assertActorPermission(actor: CurrentActor | null, permission: Permission): asserts actor is CurrentActor {
  if (!actor) throw new EventPmAuthError(401, "not_authenticated", "Authentication is required.");
  assertActiveMembership(actor.status);
  if (!can(actor, permission)) {
    throw new EventPmAuthError(403, "permission_denied", `Missing permission: ${permission}`);
  }
}
