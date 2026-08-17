import { loc } from "@/i18n/resolve";
import { resolveLocalizedString } from "@/i18n/resolve";
import type { AppLocale } from "@/i18n/types";

const copy = {
  metaTitle: loc("Español — acceso al voto", "Español — acceso al voto"),
  metaDescription: loc(
    "Recursos en español para registrarse, participar y contactar la campaña de Kelly Grappe para Secretario de Estado de Arkansas.",
    "Recursos en español para registrarse, participar y contactar la campaña de Kelly Grappe para Secretario de Estado de Arkansas.",
  ),
  eyebrow: loc("Acceso al voto", "Acceso al voto"),
  title: loc("Participar en Arkansas", "Participar en Arkansas"),
  subtitle: loc(
    "Esta campaña ofrece español en las páginas que más importan para votar, registrarse, ser voluntario e invitar a Kelly. El resto del sitio permanece en inglés hasta que haya traducción revisada.",
    "Esta campaña ofrece español en las páginas que más importan para votar, registrarse, ser voluntario e invitar a Kelly. El resto del sitio permanece en inglés hasta que haya traducción revisada.",
  ),
  registerTitle: loc("Registro de votantes", "Registro de votantes"),
  registerBody: loc(
    "Verifique su registro en VoterView y encuentre orientación sobre el registro en papel en Arkansas.",
    "Verifique su registro en VoterView y encuentre orientación sobre el registro en papel en Arkansas.",
  ),
  involvedTitle: loc("Participar", "Participar"),
  involvedBody: loc(
    "Manténgase en contacto, sea voluntario y encuentre su lugar en la campaña.",
    "Manténgase en contacto, sea voluntario y encuentre su lugar en la campaña.",
  ),
  volunteerTitle: loc("Voluntario", "Voluntario"),
  volunteerBody: loc(
    "Inicie la incorporación al equipo de campo y cuéntenos cómo puede ayudar.",
    "Inicie la incorporación al equipo de campo y cuéntenos cómo puede ayudar.",
  ),
  inviteTitle: loc("Invitar a Kelly", "Invitar a Kelly"),
  inviteBody: loc(
    "Comparta una reunión local o inicie una solicitud tentativa para que Kelly visite su comunidad.",
    "Comparta una reunión local o inicie una solicitud tentativa para que Kelly visite su comunidad.",
  ),
  englishNote: loc(
    "¿Prefiere inglés? Use el selector English | Español en el encabezado.",
    "¿Prefiere inglés? Use el selector English | Español en el encabezado.",
  ),
} as const;

export type EsHubCopyKey = keyof typeof copy;

export function esHubCopy(key: EsHubCopyKey, locale: AppLocale): string {
  return resolveLocalizedString(copy[key], locale);
}
