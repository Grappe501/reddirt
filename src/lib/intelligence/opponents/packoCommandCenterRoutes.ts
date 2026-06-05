/** Michael Pakko command center — Phase 0 findability front door. */

export const MICHAEL_PACKO_COMMAND_CENTER_HREF = "/admin/intelligence/opponents/michael-packo";

export const PACKO_COMMAND_CENTER_ROUTES = {
  hub: MICHAEL_PACKO_COMMAND_CENTER_HREF,
  quotes: `${MICHAEL_PACKO_COMMAND_CENTER_HREF}/quotes`,
  contrast: `${MICHAEL_PACKO_COMMAND_CENTER_HREF}/contrast-vs-kelly`,
  finance: `${MICHAEL_PACKO_COMMAND_CENTER_HREF}/finance`,
  dossier: "/admin/intelligence/opponents/dossiers/michael-packo",
  diligence: "/admin/intelligence/diligence/michael-packo",
  coaching: "/admin/intelligence/kelly-debate-coaching",
  media: "/admin/intelligence/video-archive-room",
  opponentsHub: "/admin/intelligence/opponents",
} as const;

export function getPackoCommandCenterLinkAuditRoutes(): string[] {
  return [
    PACKO_COMMAND_CENTER_ROUTES.hub,
    PACKO_COMMAND_CENTER_ROUTES.quotes,
    PACKO_COMMAND_CENTER_ROUTES.contrast,
    PACKO_COMMAND_CENTER_ROUTES.finance,
  ];
}
