import { loc } from "@/i18n/resolve";
import { resolveLocalizedString } from "@/i18n/resolve";
import type { AppLocale } from "@/i18n/types";

const copy = {
  metaTitle: loc("Voter registration", "Registro de votantes"),
  metaDescription: loc(
    "Check your Arkansas voter registration on official VoterView. The campaign can help with paper registration if you need a person.",
    "Verifique su registro de votante en VoterView, el sistema oficial de Arkansas. La campaña puede ayudarle con el registro en papel si necesita acompañamiento.",
  ),
  eyebrow: loc("Voter access", "Acceso al voto"),
  title: loc("Voter registration", "Registro de votantes"),
  subtitle: loc(
    "Check your registration on Arkansas VoterView — the official state lookup. If you need a paper form or a person to walk you through it, the campaign can help.",
    "Verifique su registro en VoterView de Arkansas — la consulta oficial del estado. Si necesita un formulario en papel o alguien que le acompañe, la campaña puede ayudar.",
  ),
  openVoterView: loc("Open VoterView", "Abrir VoterView"),
  paperTitle: loc("Paper registration — that’s how it works here", "Registro en papel — así funciona aquí"),
  paperLead: loc(
    "Arkansas does not offer online voter registration. Most new voters use a paper application (or in-person paths the county clerk can explain). VoterView is where you confirm you are already registered. If you are not sure where to start, we will connect you with a volunteer.",
    "Arkansas no ofrece registro de votante en línea. La mayoría de los votantes nuevos usan una solicitud en papel (o opciones en persona que el secretario del condado puede explicar). VoterView es donde usted confirma que ya está registrado. Si no sabe por dónde empezar, lo conectaremos con un voluntario.",
  ),
  askOutreach: loc("Ask the campaign to reach out", "Pida que la campaña le contacte"),
  hubEyebrow: loc("The office", "La oficina"),
  hubTitle: loc("A voter education hub, not a scavenger hunt", "Un centro de educación electoral, no un laberinto"),
  hubSubtitle: loc(
    "Kelly believes the Secretary of State should be proactive about voter education: clear dates, clear steps, plain-language ballot information, and explanations people can replay or share.",
    "Kelly cree que el Secretario de Estado debe ser proactivo en educación electoral: fechas claras, pasos claros, información de boleta en lenguaje sencillo, y explicaciones que la gente pueda repetir o compartir.",
  ),
  cardDates: loc("Key dates", "Fechas clave"),
  cardDatesBody: loc(
    "Registration deadlines, early voting windows, election day hours, and filing calendars should be easy to find in one place.",
    "Plazos de registro, votación anticipada, horario del día de elección y calendarios de presentación deben estar fáciles de encontrar en un solo lugar.",
  ),
  cardBallot: loc("What is on the ballot", "Qué hay en la boleta"),
  cardBallotBody: loc(
    "Voters deserve plain-language explanations of offices, measures, and what a vote can actually change.",
    "Los votantes merecen explicaciones claras de los cargos, medidas y lo que un voto puede cambiar.",
  ),
  cardHow: loc("How voting works", "Cómo funciona la votación"),
  cardHowBody: loc(
    "Early voting, absentee voting, ID questions, polling places, county clerk roles, and election commission roles should be explained before confusion spreads.",
    "Votación anticipada, voto ausente, identificación, lugares de votación, roles del secretario del condado y de la comisión electoral deben explicarse antes de que crezca la confusión.",
  ),
  cardTrust: loc("Results and trust", "Resultados y confianza"),
  cardTrustBody: loc(
    "Public education should explain counting timelines, certification, safeguards, and audits in language people can understand.",
    "La educación pública debe explicar plazos de conteo, certificación, salvaguardas y auditorías en un lenguaje que la gente entienda.",
  ),
} as const;

export type VoterRegistrationCopyKey = keyof typeof copy;

export function voterRegistrationCopy(key: VoterRegistrationCopyKey, locale: AppLocale): string {
  return resolveLocalizedString(copy[key], locale);
}
