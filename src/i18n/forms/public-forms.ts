import { loc } from "@/i18n/resolve";
import { resolveLocalizedString } from "@/i18n/resolve";
import type { AppLocale } from "@/i18n/types";

const join = {
  fullName: loc("Full name", "Nombre completo"),
  email: loc("Email", "Correo electrónico"),
  phoneOptional: loc("Phone (optional)", "Teléfono (opcional)"),
  zip: loc("ZIP", "Código postal"),
  countyOptional: loc("County (optional)", "Condado (opcional)"),
  interests: loc("How you want to help (optional)", "Cómo quiere ayudar (opcional)"),
  message: loc("Anything we should know? (optional)", "¿Algo que debamos saber? (opcional)"),
  submit: loc("Stay connected", "Manténgase en contacto"),
  successTitle: loc("You’re in.", "Quedó registrado."),
  successBody: loc(
    "Thanks for raising your hand. A real human will review your note—especially meeting invites—and route it to the right contact.",
    "Gracias por escribirnos. Una persona del equipo revisará su mensaje—especialmente invitaciones a reuniones—y lo enviará al contacto correcto.",
  ),
  successNext: loc("What happens next:", "Qué sigue:"),
  submitAnother: loc("Submit another", "Enviar otro"),
  sending: loc("Sending…", "Enviando…"),
  serverError: loc("Something went wrong.", "Algo salió mal."),
  interestField: loc("Field / events", "Campo / eventos"),
  interestDigital: loc("Digital help", "Ayuda digital"),
  interestFaith: loc("Faith communities", "Comunidades de fe"),
  interestVoterEd: loc("Voter education", "Educación electoral"),
  interestParty: loc("Party or civic meeting invite", "Invitación a reunión cívica o partidaria"),
  interestDD: loc("Ballot access & initiatives", "Acceso a la boleta e iniciativas"),
} as const;

const volunteer = {
  firstName: loc("First name", "Nombre"),
  lastName: loc("Last name", "Apellido"),
  email: loc("Email", "Correo electrónico"),
  phone: loc("Phone", "Teléfono"),
  zip: loc("ZIP code", "Código postal"),
  county: loc("County", "Condado"),
  city: loc("City", "Ciudad"),
  preferredRole: loc("Preferred role", "Rol preferido"),
  preferredLanguage: loc("Preferred language", "Idioma preferido"),
  notes: loc("Notes (optional)", "Notas (opcional)"),
  availability: loc("Availability (optional)", "Disponibilidad (opcional)"),
  skills: loc("Skills / experience (optional)", "Habilidades / experiencia (opcional)"),
  submit: loc("Volunteer", "Enviar voluntario"),
  sending: loc("Sending…", "Enviando…"),
  successTitle: loc("Thank you — you’re in the system.", "Gracias — quedó en el sistema."),
  successLead: loc(
    "A coordinator can follow up using what you submitted. Until automated email is fully live, the campaign still sees your signup immediately in our operations queue.",
    "Un coordinador puede dar seguimiento con lo que envió. Hasta que el correo automático esté completo, la campaña ve su registro de inmediato en nuestra cola de operaciones.",
  ),
  submitAnother: loc("Submit another volunteer form", "Enviar otro formulario de voluntario"),
  serverError: loc("Something went wrong.", "Algo salió mal."),
  roleEvents: loc("Events", "Eventos"),
  roleSocial: loc("Social media", "Redes sociales"),
  rolePower5: loc("Power of 5 / voter registration", "Poder de 5 / registro de votantes"),
  roleYouth: loc("Youth outreach", "Alcance juvenil"),
  roleWomen: loc("Women's outreach", "Alcance con mujeres"),
  roleFundraising: loc("Fundraising", "Recaudación"),
  roleNotSure: loc("Not sure yet", "Aún no estoy seguro/a"),
  langEnglish: loc("English", "Inglés"),
  langSpanish: loc("Spanish", "Español"),
  langMarshallese: loc("Marshallese", "Marshalés"),
} as const;

const schedule = {
  intro: loc(
    "This form starts a tentative request — not a confirmation. Staff reviews every submission.",
    "Este formulario inicia una solicitud tentativa — no una confirmación. El equipo revisa cada envío.",
  ),
  contactHeading: loc("Your contact", "Su contacto"),
  eventHeading: loc("Event", "Evento"),
  name: loc("Name", "Nombre"),
  organization: loc("Organization", "Organización"),
  email: loc("Email", "Correo electrónico"),
  phone: loc("Phone", "Teléfono"),
  eventTitle: loc("Event title", "Título del evento"),
  eventType: loc("Event type", "Tipo de evento"),
  county: loc("County", "Condado"),
  city: loc("City", "Ciudad"),
  address: loc("Venue / address", "Lugar / dirección"),
  preferredDate: loc("Preferred date (YYYY-MM-DD)", "Fecha preferida (AAAA-MM-DD)"),
  alternateDates: loc("Alternate dates (optional)", "Fechas alternas (opcional)"),
  startTime: loc("Preferred start (local)", "Hora de inicio preferida"),
  endTime: loc("Preferred end", "Hora de fin preferida"),
  flexibility: loc("Flexibility", "Flexibilidad de fecha"),
  audienceSize: loc("Expected audience size", "Tamaño estimado del público"),
  purpose: loc("Purpose / what you want from the visit", "Propósito / qué busca de la visita"),
  visibility: loc("Visibility", "Visibilidad"),
  pressInvited: loc("Press invited", "Prensa invitada"),
  pressRelease: loc("Press release interest", "Interés en comunicado de prensa"),
  localAngle: loc("Local issue angle", "Tema local"),
  speaking: loc("Speaking requested", "¿Desea que Kelly hable?"),
  localHost: loc("Local host available", "Anfitrión local disponible"),
  notes: loc("Notes", "Notas"),
  permission: loc("Campaign may contact me about this request", "La campaña puede contactarme sobre esta solicitud"),
  submit: loc("Submit request", "Enviar solicitud"),
  submitting: loc("Submitting…", "Enviando…"),
  successTitle: loc("Request received — tentative only", "Solicitud recibida — solo tentativa"),
  submitAnother: loc("Submit another request", "Enviar otra solicitud"),
  serverError: loc("Something went wrong.", "Algo salió mal."),
  pressHeading: loc("Press & roles", "Prensa y roles"),
  pressInvited: loc("Press invited?", "¿Prensa invitada?"),
  speakingRequested: loc("Speaking requested?", "¿Desea que hable?"),
  localHost: loc("Local host / guide available?", "¿Anfitrión o guía local disponible?"),
  notesHeading: loc("Notes", "Notas"),
  notesLabel: loc("Anything else we should know?", "¿Algo más que debamos saber?"),
  permissionLabel: loc(
    "I give the campaign permission to contact me about this request. (Required — we need a way to reply.)",
    "Autorizo a la campaña a contactarme sobre esta solicitud. (Requerido — necesitamos una forma de responder.)",
  ),
  introLead: loc(
    "This form starts a tentative request — not a confirmation. Staff reviews every submission.",
    "Este formulario inicia una solicitud tentativa — no una confirmación. El equipo revisa cada envío.",
  ),
} as const;

export function formText(
  bundle: typeof join | typeof volunteer | typeof schedule,
  key: keyof typeof join,
  locale: AppLocale,
): string {
  return resolveLocalizedString(bundle[key as keyof typeof bundle] as never, locale);
}

export function joinFormText(key: keyof typeof join, locale: AppLocale) {
  return resolveLocalizedString(join[key], locale);
}

export function volunteerFormText(key: keyof typeof volunteer, locale: AppLocale) {
  return resolveLocalizedString(volunteer[key], locale);
}

export function scheduleFormText(key: keyof typeof schedule, locale: AppLocale) {
  return resolveLocalizedString(schedule[key], locale);
}

export { join, volunteer, schedule };
