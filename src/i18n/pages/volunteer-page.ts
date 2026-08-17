import { loc } from "@/i18n/resolve";
import { resolveLocalizedString } from "@/i18n/resolve";
import type { AppLocale } from "@/i18n/types";

const copy = {
  metaTitle: loc("Volunteer Onboarding", "Incorporación de voluntarios"),
  metaDescription: loc(
    "Start here to join the volunteer field team.",
    "Comience aquí para unirse al equipo de campo de voluntarios.",
  ),
  eyebrow: loc("Field team", "Equipo de campo"),
  title: loc("Join the Field Team", "Únase al equipo de campo"),
  subtitle: loc(
    "We’re building a volunteer network where everyone owns one small lane, does a little each week, and helps grow something powerful.",
    "Estamos construyendo una red donde cada persona tiene un rol pequeño, hace un poco cada semana y ayuda a crecer algo poderoso.",
  ),
  startOnboarding: loc("Start onboarding", "Iniciar incorporación"),
  fieldPlaybook: loc("Read the field playbook", "Leer la guía de campo"),
  resourceLibrary: loc("Volunteer resource library", "Biblioteca de recursos"),
} as const;

export type VolunteerPageCopyKey = keyof typeof copy;

export function volunteerPageCopy(key: VolunteerPageCopyKey, locale: AppLocale): string {
  return resolveLocalizedString(copy[key], locale);
}
