import { loc } from "@/i18n/resolve";
import { resolveLocalizedString } from "@/i18n/resolve";
import type { AppLocale } from "@/i18n/types";

const copy = {
  metaTitle: loc("Invite Kelly · Share an event", "Invitar a Kelly · Compartir un evento"),
  metaDescription: loc(
    "Invite Kelly to your county or share a local fair, festival, civic club, church, chamber, or community gathering. Staff review every request—nothing is confirmed from this form alone.",
    "Invite a Kelly a su condado o comparta una feria, festival, club cívico, iglesia, cámara o reunión comunitaria. El equipo revisa cada solicitud — nada se confirma solo con este formulario.",
  ),
  eyebrow: loc("Schedule / invite", "Agenda / invitación"),
  title: loc("Invite Kelly · Share local events", "Invitar a Kelly · Compartir eventos locales"),
  subtitle: loc(
    "Help us find fairs, festivals, civic clubs, churches, chambers, and community gatherings. Tell us what you are hoping to host or convene—we route every request through staff review. Tentative only; never a public confirmation of Kelly’s private calendar.",
    "Ayúdenos a encontrar ferias, festivales, clubes cívicos, iglesias, cámaras y reuniones comunitarias. Cuéntenos qué quiere organizar — cada solicitud pasa por revisión del equipo. Solo tentativa; nunca una confirmación pública del calendario privado de Kelly.",
  ),
  shareOpportunity: loc("Share an opportunity", "Compartir una oportunidad"),
  invitePathway: loc("Invite Kelly pathway", "Ruta Invitar a Kelly"),
  whatToInclude: loc("What to include", "Qué incluir"),
  bullet1: loc(
    "Your county and the kind of gathering (fair, festival, club, faith community, chamber, backyard, etc.)",
    "Su condado y tipo de reunión (feria, festival, club, comunidad de fe, cámara, patio, etc.)",
  ),
  bullet2: loc(
    "Approximate date or window, expected audience size, and who is hosting",
    "Fecha o ventana aproximada, tamaño del público y quién organiza",
  ),
  bullet3: loc(
    "Whether the event is public, invitation-only, or still being planned",
    "Si el evento es público, solo por invitación o aún en planificación",
  ),
  preferPathway: loc("Prefer the step-by-step invite flow? Use", "¿Prefiere el flujo paso a paso? Use"),
} as const;

export type ScheduleCopyKey = keyof typeof copy;

export function scheduleCopy(key: ScheduleCopyKey, locale: AppLocale): string {
  return resolveLocalizedString(copy[key], locale);
}
