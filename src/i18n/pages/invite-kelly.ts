import { loc } from "@/i18n/resolve";
import { resolveLocalizedString } from "@/i18n/resolve";
import type { AppLocale } from "@/i18n/types";

const layer1 = {
  eyebrow: loc("Invite Kelly · Why", "Invitar a Kelly · Por qué"),
  title: loc("Invite Kelly", "Invitar a Kelly"),
  subtitle: loc(
    "Bring Kelly into your community, your table, or your backyard.",
    "Traiga a Kelly a su comunidad, su mesa o su patio.",
  ),
  nextCta: loc("How inviting Kelly works →", "Cómo funciona invitar a Kelly →"),
} as const;

const pathway = {
  label: loc("Pathway", "Ruta"),
  why: loc("Why", "Por qué"),
  how: loc("How & what to host", "Cómo y qué organizar"),
  nextStep: loc("Next step", "Siguiente paso"),
} as const;

export function inviteKellyLayer1Copy(key: keyof typeof layer1, locale: AppLocale): string {
  return resolveLocalizedString(layer1[key], locale);
}

export function inviteKellyPathwayCopy(key: keyof typeof pathway, locale: AppLocale): string {
  return resolveLocalizedString(pathway[key], locale);
}
