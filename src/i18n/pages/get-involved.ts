import { loc } from "@/i18n/resolve";
import { resolveLocalizedString } from "@/i18n/resolve";
import type { AppLocale } from "@/i18n/types";

const copy = {
  metaTitle: loc("Get Involved", "Participar"),
  metaDescription: loc(
    "The Power of 5, volunteer, host Kelly, or donate — this campaign grows through relationships.",
    "Poder de 5, voluntariado, recibir a Kelly o donar — esta campaña crece por relaciones.",
  ),
  eyebrow: loc("Participation ladder", "Escalera de participación"),
  title: loc("Get Involved", "Participar"),
  subtitle: loc(
    "Stay connected. Volunteer. Activate your Power of 5. Host Kelly. Donate when you are ready.",
    "Manténgase en contacto. Sea voluntario. Active su Poder de 5. Reciba a Kelly. Done cuando esté listo.",
  ),
  activatePower5: loc("Activate Your Power of 5 →", "Active su Poder de 5 →"),
  joinTitle: loc("Stay connected", "Manténgase en contacto"),
  joinLead: loc(
    "Name, best way to reach you, and a sentence about what sounds fun. If you are hosting or inviting us local, say so.",
    "Nombre, mejor forma de contacto y una frase sobre qué le interesa. Si va a recibirnos o invitarnos localmente, dígalo.",
  ),
  volunteerTitle: loc("Volunteer signup", "Registro de voluntario"),
  volunteerLead: loc(
    "Check what fits—even one line helps.",
    "Marque lo que le encaje — aunque sea una línea ayuda.",
  ),
  inviteTitle: loc("Invite Kelly", "Invitar a Kelly"),
  inviteSubtitle: loc(
    "Coffee, backyard, barn, or county room—we align before anything is public.",
    "Café, patio, granero o sala del condado — alineamos antes de hacer algo público.",
  ),
} as const;

export type GetInvolvedCopyKey = keyof typeof copy;

export function getInvolvedCopy(key: GetInvolvedCopyKey, locale: AppLocale): string {
  return resolveLocalizedString(copy[key], locale);
}
