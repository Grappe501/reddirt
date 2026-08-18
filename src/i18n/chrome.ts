import type { NavGroup, NavItem } from "@/config/navigation";
import { loc } from "@/i18n/resolve";
import { resolveLocalizedString } from "@/i18n/resolve";
import { withLocaleHref } from "@/i18n/path";
import type { AppLocale } from "@/i18n/types";

const chrome = {
  skip: loc("Skip to main content", "Saltar al contenido principal"),
  search: loc("Search", "Buscar"),
  vote: loc("Vote", "Votar"),
  voteRegister: loc("Vote / Register", "Votar / Registrarse"),
  volunteer: loc("Volunteer", "Voluntario"),
  donate: loc("Donate", "Donar"),
  menu: loc("Menu", "Menú"),
  close: loc("Close", "Cerrar"),
  home: loc("Home", "Inicio"),
  forSos: loc("for Arkansas Secretary of State", "para Secretario de Estado de Arkansas"),
  english: loc("English", "English", "approved"),
  espanol: loc("Español", "Español", "approved"),
  language: loc("Language", "Idioma", "approved"),
  navMeet: loc("Meet Kelly", "Conozca a Kelly"),
  navPlan: loc("My Plan", "Mi plan"),
  navOffice: loc("The Office", "La oficina"),
  navVoice: loc("The People's Voice", "La voz del pueblo"),
  navRoad: loc("From the Road", "From the Road", "approved"),
  navEvents: loc("Events", "Eventos"),
  navInvolved: loc("Get Involved", "Participar"),
  itemMeetKelly: loc("Meet Kelly", "Conozca a Kelly"),
  itemExperience: loc("Professional experience", "Experiencia profesional"),
  itemWhy: loc("Why I'm Running", "Por qué me postulo"),
  itemJourney: loc("Journey", "Trayectoria"),
  itemVideos: loc("Campaign Videos", "Videos de campaña"),
  itemPhotos: loc("Campaign Photos", "Fotos de campaña"),
  itemEndorsements: loc("Endorsements", "Respaldos"),
  itemMyPlan: loc("My Plan", "Mi plan"),
  itemTrust: loc("Restore Trust", "Restaurar la confianza"),
  itemConstVoice: loc("The People's Constitutional Voice", "La voz constitucional del pueblo"),
  itemCounties: loc("Support All 75 Counties", "Apoyar los 75 condados"),
  itemTransparency: loc("Transparency", "Transparencia"),
  itemElectionProc: loc("Election Processes", "Procesos electorales"),
  itemEngaged: loc("A More Engaged Arkansas", "Un Arkansas más participativo"),
  itemBusiness: loc("Business Services", "Servicios a negocios"),
  itemWhatOffice: loc("What the Office Does", "Qué hace la oficina"),
  itemElections: loc("Elections", "Elecciones"),
  itemFilings: loc("Business & Filings", "Negocios y registros"),
  itemNotaries: loc("Notaries", "Notarios"),
  itemRecords: loc("Transparency & Records", "Transparencia y registros"),
  itemCapitol: loc("Capitol & Public Safety", "Capitolio y seguridad pública"),
  itemWhyRace: loc("Why This Race Matters", "Por qué importa esta contienda"),
  itemExplainers: loc("Explainers", "Explicaciones"),
  itemPetition: loc("Kelly's petition organizing", "Organización de peticiones de Kelly"),
  itemDirectDem: loc("Learn How Direct Democracy Works", "Cómo funciona la democracia directa"),
  itemFromRoad: loc("From the Road", "From the Road", "approved"),
  itemPress: loc("Press Coverage", "Cobertura de prensa"),
  itemEvents: loc("Events", "Eventos"),
  itemEventsCalendar: loc("Events calendar", "Calendario de eventos"),
  itemHowToHost: loc("How to host", "Cómo organizar"),
  itemInvite: loc("Invite Kelly", "Invitar a Kelly"),
  itemListening: loc("Listening Sessions", "Sesiones de escucha"),
  itemPower5: loc("Power of 5", "Poder de 5"),
  itemPower5Workshop: loc("Power of 5 Workshop Materials", "Materiales del taller Poder de 5"),
  itemHostKelly: loc("Host Kelly", "Recibir a Kelly"),
  itemStay: loc("Stay connected", "Manténgase en contacto"),
  itemLocalTeam: loc("Start a Local Team", "Formar un equipo local"),
  itemRegister: loc("Register / Check Registration", "Registrarse / Verificar registro"),
  itemRepresent: loc("Represent at local events", "Representar en eventos locales"),
  itemHostGathering: loc("Host a gathering", "Organizar una reunión"),
  itemSubstack: loc("Kelly’s Substack", "Substack de Kelly", "approved"),
  itemSubscribe: loc("Subscribe to Kelly’s Substack", "Suscribirse al Substack de Kelly", "approved"),
  footerMeet: loc("Meet Kelly", "Conozca a Kelly"),
  footerVoice: loc("The People's Voice", "La voz del pueblo"),
  footerOffice: loc("The Office", "La oficina"),
  footerRoad: loc("From the Road", "From the Road", "approved"),
  footerInvolved: loc("Get involved", "Participar"),
  footerLegal: loc("Legal", "Legal", "approved"),
  itemContact: loc("Contact", "Contacto"),
  itemPrivacy: loc("Privacy", "Privacy", "approved"),
  itemA11y: loc("Accessibility", "Accessibility", "approved"),
  itemTerms: loc("Terms of use", "Terms of use", "approved"),
  itemDisclaimer: loc("Disclaimer", "Disclaimer", "approved"),
  follow: loc("Follow the campaign", "Siga la campaña"),
  questions: loc("Questions?", "¿Preguntas?"),
  contactCampaign: loc("Contact the campaign", "Contacte a la campaña"),
  volunteerCta: loc("Volunteer with Kelly →", "Sea voluntario con Kelly →"),
  rights: loc("All rights reserved.", "Todos los derechos reservados."),
} as const;

export type ChromeKey = keyof typeof chrome;

export function chromeText(key: ChromeKey, locale: AppLocale): string {
  return resolveLocalizedString(chrome[key], locale);
}

const NAV_GROUP_KEYS: Record<string, ChromeKey> = {
  meet: "navMeet",
  plan: "navPlan",
  office: "navOffice",
  "peoples-voice": "navVoice",
  road: "navRoad",
  events: "navEvents",
  involved: "navInvolved",
};

const NAV_ITEM_KEYS: Record<string, ChromeKey> = {
  "Meet Kelly": "itemMeetKelly",
  "Professional experience": "itemExperience",
  "Why I'm Running": "itemWhy",
  Journey: "itemJourney",
  "Campaign Videos": "itemVideos",
  "Campaign Photos": "itemPhotos",
  Endorsements: "itemEndorsements",
  "My Plan": "itemMyPlan",
  "Restore Trust": "itemTrust",
  "The People's Constitutional Voice": "itemConstVoice",
  "Support All 75 Counties": "itemCounties",
  Transparency: "itemTransparency",
  "Election Processes": "itemElectionProc",
  "A More Engaged Arkansas": "itemEngaged",
  "Business Services": "itemBusiness",
  "What the Office Does": "itemWhatOffice",
  Elections: "itemElections",
  "Business & Filings": "itemFilings",
  Notaries: "itemNotaries",
  "Transparency & Records": "itemRecords",
  "Capitol & Public Safety": "itemCapitol",
  "Why This Race Matters": "itemWhyRace",
  Explainers: "itemExplainers",
  "Kelly's petition organizing": "itemPetition",
  "Learn How Direct Democracy Works": "itemDirectDem",
  "From the Road": "itemFromRoad",
  "Press Coverage": "itemPress",
  Events: "itemEvents",
  "Events calendar": "itemEventsCalendar",
  "How to host": "itemHowToHost",
  "Invite Kelly": "itemInvite",
  "Listening Sessions": "itemListening",
  "Power of 5": "itemPower5",
  "Power of 5 Workshop Materials": "itemPower5Workshop",
  "Host Kelly": "itemHostKelly",
  "Stay connected": "itemStay",
  "Start a Local Team": "itemLocalTeam",
  Donate: "donate",
  "Register / Check Registration": "itemRegister",
};

export function localizeNavItem(item: NavItem, locale: AppLocale): NavItem {
  const key = NAV_ITEM_KEYS[item.label];
  const label = key ? chromeText(key as ChromeKey, locale) : item.label;
  const volunteerFix = item.label === "Volunteer" ? chromeText("volunteer", locale) : label;
  return {
    ...item,
    label: volunteerFix,
    href: withLocaleHref(item.href, locale),
  };
}

export function localizeNavGroups(groups: NavGroup[], locale: AppLocale): NavGroup[] {
  return groups.map((group) => ({
    ...group,
    label: chromeText(NAV_GROUP_KEYS[group.id] ?? "navInvolved", locale),
    groupLandingHref: group.groupLandingHref ? withLocaleHref(group.groupLandingHref, locale) : undefined,
    items: group.items.map((item) => localizeNavItem(item, locale)),
  }));
}

export function localizeFooterGroups(
  groups: { title: string; items: NavItem[] }[],
  locale: AppLocale,
): { title: string; items: NavItem[] }[] {
  const titleKey: Record<string, ChromeKey> = {
    "Meet Kelly": "footerMeet",
    "The People's Voice": "footerVoice",
    "The Office": "footerOffice",
    "From the Road": "footerRoad",
    "Get involved": "footerInvolved",
    Legal: "footerLegal",
  };
  const itemKey: Record<string, ChromeKey> = {
    ...NAV_ITEM_KEYS,
    Volunteer: "volunteer",
    "Represent at local events": "itemRepresent",
    "Host a gathering": "itemHostGathering",
    "Listening sessions": "itemListening",
    "Kelly’s Substack": "itemSubstack",
    "Subscribe to Kelly’s Substack": "itemSubscribe",
    Contact: "itemContact",
    Privacy: "itemPrivacy",
    Accessibility: "itemA11y",
    "Terms of use": "itemTerms",
    Disclaimer: "itemDisclaimer",
    Español: "espanol",
  };
  return groups.map((group) => ({
    title: titleKey[group.title] ? chromeText(titleKey[group.title]!, locale) : group.title,
    items: group.items.map((item) => {
      if (item.label === "Español") {
        return { ...item, href: "/es", label: chromeText("espanol", locale) };
      }
      const key = itemKey[item.label];
      return {
        ...item,
        label: key ? chromeText(key, locale) : item.label,
        href: withLocaleHref(item.href, locale),
      };
    }),
  }));
}
