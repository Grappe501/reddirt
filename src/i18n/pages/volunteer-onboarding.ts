import { loc, resolveLocalizedString } from "@/i18n/resolve";
import type { AppLocale, LocalizedString } from "@/i18n/types";

const copy = {
  section1Eyebrow: loc("Section 1", "Sección 1"),
  section1Title: loc("How this works", "Cómo funciona"),
  section1Subtitle: loc("Small teams, clear lanes, steady progress.", "Equipos pequeños, roles claros, avance constante."),
  section1Intro: loc(
    "We organize in small 3-person teams. Each team has three coordinators:",
    "Organizamos equipos pequeños de 3 personas. Cada equipo tiene tres coordinadores:",
  ),
  section1EventsLane: loc(
    "Events — gatherings, tabling, and volunteer meetups.",
    "Eventos — reuniones, mesas informativas y encuentros de voluntarios.",
  ),
  section1SocialLane: loc(
    "Social media — sharing campaign-approved content and lifting up local activity.",
    "Redes sociales — compartir contenido aprobado por la campaña y dar visibilidad a la actividad local.",
  ),
  section1RelationalLane: loc(
    "Power of 5 / voter registration — relational organizing: people you know, respectful follow-up, and connecting folks to registration when it fits.",
    "Poder de 5 / registro de votantes — organización relacional: personas que usted conoce, seguimiento respetuoso y conexión con el registro cuando corresponda.",
  ),
  section1OwnLane: loc(
    "Each person owns one lane. The goal isn’t to overwhelm volunteers — it’s to make small weekly actions stack up across many people and many communities.",
    "Cada persona tiene un rol. La meta no es abrumar a los voluntarios — es lograr que pequeñas acciones semanales se sumen entre muchas personas y muchas comunidades.",
  ),
  discordBlurb: loc(
    "Discord is our day-to-day communication space. Your dashboard keeps the work organized; Discord helps your team stay connected. Joining Discord is encouraged. Automated Discord bot routing comes later — never post voter data or private voter information in Discord.",
    "Discord es nuestro espacio de comunicación del día a día. Su panel organiza el trabajo; Discord ayuda a su equipo a mantenerse conectado. Unirse a Discord es recomendable. El enrutamiento automático con bots llegará después — nunca publique datos de votantes ni información privada de votantes en Discord.",
  ),

  section2Eyebrow: loc("Section 2", "Sección 2"),
  section2Title: loc("How to build a 3-person team", "Cómo formar un equipo de 3 personas"),
  section2Subtitle: loc(
    "The model does not start with three people. It starts with one person willing to take the first step.",
    "El modelo no empieza con tres personas. Empieza con una persona dispuesta a dar el primer paso.",
  ),
  step1Title: loc("Start with one person", "Empiece con una persona"),
  step1Body: loc(
    "Every team starts with one person willing to take the first step. That person does not need to have all the answers. Their first job is simple: recruit one more person.",
    "Cada equipo empieza con una persona dispuesta a dar el primer paso. Esa persona no necesita tener todas las respuestas. Su primera tarea es simple: reclutar a una persona más.",
  ),
  step2Title: loc("Recruit the second person", "Reclute a la segunda persona"),
  step2Body: loc(
    "The first two people become the starting pair. They put their heads together, look at who has already signed up to volunteer, and identify people who may fit the missing roles.",
    "Las dos primeras personas forman la pareja inicial. Reúnen ideas, revisan quién ya se registró como voluntario e identifican personas que puedan encajar en los roles faltantes.",
  ),
  step3Title: loc("Recruit two more people", "Reclute a dos personas más"),
  step3Body: loc(
    "The starting pair recruits two more people so the team has coverage for the three lanes: Events, Social Media, and Power of 5 / Voter Registration.",
    "La pareja inicial recluta a dos personas más para cubrir los tres roles: Eventos, Redes sociales y Poder de 5 / Registro de votantes.",
  ),
  step3Note: loc(
    "Important note: The original recruiter becomes the campaign upstream contact for that team. They are responsible for helping information move up to the campaign and back down to the local team.",
    "Nota importante: quien recluta primero se convierte en el contacto con la campaña para ese equipo. Es responsable de que la información suba a la campaña y baje al equipo local.",
  ),
  flowMobileHint: loc("One person → pair → full three-lane team", "Una persona → pareja → equipo completo de tres roles"),

  buildGeoTitle: loc("Build geographically", "Organícese por geografía"),
  buildGeoLead: loc("All teams must be geographic in nature.", "Todos los equipos deben tener una base geográfica."),
  buildGeoCounty: loc(
    "If the three people are from different cities in the same county, they are a county team.",
    "Si las tres personas son de distintas ciudades del mismo condado, forman un equipo del condado.",
  ),
  buildGeoCity: loc(
    "If the three people are from the same city, they are a city team.",
    "Si las tres personas son de la misma ciudad, forman un equipo de ciudad.",
  ),
  buildGeoLocal: loc(
    "If the three people are from the same precinct, neighborhood, campus, church community, or local area, they are a local team.",
    "Si las tres personas son del mismo precinto, vecindario, campus, comunidad de fe o zona local, forman un equipo local.",
  ),
  buildGeoPower: loc(
    "The more local the team is, the more powerful the organizing becomes.",
    "Cuanto más local sea el equipo, más poderosa será la organización.",
  ),

  buildDownstreamTitle: loc("Build downstream teams", "Forme equipos en niveles más locales"),
  buildDownstreamLead: loc(
    "Every team's job is not to become bigger. Every team's job is to help build more teams.",
    "El trabajo de cada equipo no es crecer en tamaño. El trabajo de cada equipo es ayudar a formar más equipos.",
  ),
  buildDownstreamMotto: loc("More teams, not bigger teams.", "Más equipos, no equipos más grandes."),
  buildDownstream1: loc("A county team helps launch city teams.", "Un equipo del condado ayuda a lanzar equipos de ciudad."),
  buildDownstream2: loc("A city team helps launch precinct or neighborhood teams.", "Un equipo de ciudad ayuda a lanzar equipos de precinto o vecindario."),
  buildDownstream3: loc("A precinct team helps launch block, apartment, campus, or community teams.", "Un equipo de precinto ayuda a lanzar equipos de cuadra, edificio, campus o comunidad."),
  buildDownstream4: loc("There can be multiple teams at every level.", "Puede haber varios equipos en cada nivel."),
  buildDownstream5: loc(
    "Teams should multiply instead of expanding into large, hard-to-manage groups.",
    "Los equipos deben multiplicarse en lugar de expandirse en grupos grandes difíciles de manejar.",
  ),

  teamLevelsTitle: loc("Team levels", "Niveles de equipo"),
  teamLevelsSubtitle: loc(
    "Same three lanes at every level — geography decides which level you are.",
    "Los mismos tres roles en cada nivel — la geografía define en qué nivel está usted.",
  ),
  levelCountyTitle: loc("County team", "Equipo del condado"),
  levelCountyWhen: loc("Members are spread across multiple cities in the same county.", "Los miembros están repartidos en varias ciudades del mismo condado."),
  levelCountyJob: loc("Launch city teams.", "Lanzar equipos de ciudad."),
  levelCityTitle: loc("City team", "Equipo de ciudad"),
  levelCityWhen: loc("Members are in the same town or city.", "Los miembros están en el mismo pueblo o ciudad."),
  levelCityJob: loc("Launch precinct, neighborhood, campus, or community teams.", "Lanzar equipos de precinto, vecindario, campus o comunidad."),
  levelPrecinctTitle: loc("Precinct team", "Equipo de precinto"),
  levelPrecinctWhen: loc("Members are in the same precinct or voting area.", "Los miembros están en el mismo precinto o zona de votación."),
  levelPrecinctJob: loc("Organize voter contact and local relationships.", "Organizar contacto con votantes y relaciones locales."),
  levelNeighborhoodTitle: loc("Neighborhood / block / community team", "Equipo de vecindario / cuadra / comunidad"),
  levelNeighborhoodWhen: loc("Members share a very local area or natural community.", "Los miembros comparten una zona muy local o una comunidad natural."),
  levelNeighborhoodJob: loc(
    "Relational organizing, event turnout, and voter registration support.",
    "Organización relacional, asistencia a eventos y apoyo al registro de votantes.",
  ),

  bestWhenLabel: loc("Best when", "Mejor cuando"),
  primaryJobLabel: loc("Primary job", "Trabajo principal"),

  recommendedFlowTitle: loc("Recommended simple flow", "Flujo recomendado"),
  ruleOfThreeTitle: loc("The rule of three", "La regla de tres"),
  ruleOfThreeBody: loc(
    "A team should stay small enough to move quickly. If more people want to help, that is a win — but the next step is to launch another team, not make the original team bigger.",
    "Un equipo debe mantenerse lo bastante pequeño para moverse con rapidez. Si más personas quieren ayudar, eso es una victoria — pero el siguiente paso es lanzar otro equipo, no hacer más grande el original.",
  ),
  exampleTitle: loc("Example", "Ejemplo"),
  exampleBody: loc(
    "Sarah signs up in Creek County. She asks Marcus to help her start. Sarah and Marcus review volunteer signups and realize they need someone who likes events and someone who is comfortable posting online. They recruit Dana for Events and Luis for Social Media. Sarah stays the upstream contact. Because the team members live in different towns, they are a county team. Their first goal is not to grow to ten people. Their first goal is to help Sapulpa, Bristow, and Drumright each start their own 3-person city team.",
    "Sarah se registra en el condado de Creek. Pide a Marcus que la ayude a empezar. Revisan los registros de voluntarios y ven que necesitan a alguien que le gusten los eventos y a alguien cómodo publicando en línea. Reclutan a Dana para Eventos y a Luis para Redes sociales. Sarah sigue siendo el contacto con la campaña. Como viven en pueblos distintos, son un equipo del condado. Su primera meta no es crecer a diez personas. Su primera meta es ayudar a Sapulpa, Bristow y Drumright a formar cada uno su propio equipo de ciudad de 3 personas.",
  ),

  beforeLaunchTitle: loc("Before your team launches", "Antes de que su equipo arranque"),

  section3Eyebrow: loc("Section 3", "Sección 3"),
  section3Title: loc("The three roles", "Los tres roles"),
  section3Subtitle: loc(
    "Pick the lane that fits your gifts — you can adjust later with your team.",
    "Elija el rol que mejor encaje con sus dones — puede ajustarlo después con su equipo.",
  ),
  roleEventsTitle: loc("Events Coordinator", "Coordinador/a de eventos"),
  roleEventsDesc: loc(
    "Helps identify, plan, and support small local gatherings, tabling opportunities, house meetings, community events, and volunteer meetups.",
    "Ayuda a identificar, planear y apoyar reuniones locales pequeñas, mesas informativas, reuniones en casa, eventos comunitarios y encuentros de voluntarios.",
  ),
  roleSocialTitle: loc("Social Media Coordinator", "Coordinador/a de redes sociales"),
  roleSocialDesc: loc(
    "Helps amplify campaign-approved content and local volunteer activity online.",
    "Ayuda a amplificar contenido aprobado por la campaña y la actividad local de voluntarios en línea.",
  ),
  roleRelationalTitle: loc("Power of 5 / VR Coordinator", "Coordinador/a de Poder de 5 / registro"),
  roleRelationalDesc: loc(
    "Helps volunteers identify five people they personally know and move them toward support, signup, voter registration, or action.",
    "Ayuda a los voluntarios a identificar a cinco personas que conocen personalmente y moverlas hacia el apoyo, el registro, la inscripción de votante o la acción.",
  ),
  weeklyTasksLabel: loc("Weekly tasks", "Tareas semanales"),

  section4Eyebrow: loc("Section 4", "Sección 4"),
  section4Title: loc("Your first 15 minutes", "Sus primeros 15 minutos"),
  section4Subtitle: loc("A simple sequence anyone can finish today.", "Una secuencia sencilla que cualquiera puede completar hoy."),

  section5Eyebrow: loc("Section 5", "Sección 5"),
  section5Title: loc("Pick your lane", "Elija su rol"),
  section5Subtitle: loc(
    "No wrong answers — this just helps you orient before you sign up.",
    "No hay respuestas incorrectas — esto solo le ayuda a orientarse antes de registrarse.",
  ),
  laneEventsBtn: loc("I can help with events", "Puedo ayudar con eventos"),
  laneSocialBtn: loc("I can help with social media", "Puedo ayudar con redes sociales"),
  laneRelationalBtn: loc("I can help with Power of 5 / voter registration", "Puedo ayudar con Poder de 5 / registro de votantes"),
  laneUnsureBtn: loc("I'm not sure yet", "Aún no estoy seguro/a"),
  laneEventsMsg: loc(
    "Great — choose Events on the volunteer signup form when you get there.",
    "Excelente — elija Eventos en el formulario de registro de voluntario cuando llegue allí.",
  ),
  laneSocialMsg: loc(
    "Great — choose Social media on the volunteer signup form when you get there.",
    "Excelente — elija Redes sociales en el formulario de registro de voluntario cuando llegue allí.",
  ),
  laneRelationalMsg: loc(
    "Great — choose Power of 5 / voter registration on the volunteer signup form when you get there.",
    "Excelente — elija Poder de 5 / registro de votantes en el formulario cuando llegue allí.",
  ),
  laneUnsureMsg: loc(
    "Great — mark “not sure yet” on the signup form and we'll help you find the right fit.",
    "Excelente — marque «aún no estoy seguro/a» en el formulario y le ayudaremos a encontrar el rol adecuado.",
  ),

  section6Eyebrow: loc("Section 6", "Sección 6"),
  section6Title: loc("Want the full field guide?", "¿Quiere la guía de campo completa?"),
  section6Subtitle: loc(
    "The full playbook explains how county, city, precinct, and neighborhood teams work together.",
    "La guía completa explica cómo trabajan juntos los equipos del condado, ciudad, precinto y vecindario.",
  ),
  section6Body: loc(
    "When you are ready to go deeper, the field playbook walks through the same three roles at every level — so you always know what “good” looks like.",
    "Cuando quiera profundizar, la guía de campo recorre los mismos tres roles en cada nivel — para que siempre sepa cómo se ve «bien hecho».",
  ),
  openFieldPlaybook: loc("Open field playbook", "Abrir la guía de campo"),

  section7Eyebrow: loc("Section 7", "Sección 7"),
  section7Title: loc("Ready to join?", "¿Listo/a para unirse?"),
  section7Subtitle: loc(
    "Complete the volunteer signup form and someone from the campaign will be able to connect you to the right local team.",
    "Complete el formulario de registro de voluntario y alguien de la campaña podrá conectarlo/a con el equipo local adecuado.",
  ),
  preferLegacyForm: loc("Prefer the legacy Squarespace form?", "¿Prefiere el formulario anterior de Squarespace?"),
  afterSignupLead: loc("After you sign up, use the", "Después de registrarse, use la"),
  resourceLibraryLink: loc("volunteer resource library", "biblioteca de recursos para voluntarios"),
  afterSignupMid: loc(", bookmark this page, or open the", ", guarde esta página en favoritos, o abra la"),
  fieldPlaybookLink: loc("field playbook", "guía de campo"),
  afterSignupEnd: loc("— your team can run the weekly rhythm there.", "— su equipo puede seguir el ritmo semanal allí."),

  afterSignupEyebrow: loc("After signup", "Después del registro"),
  afterSignupTitle: loc("What happens after you sign up?", "¿Qué pasa después de registrarse?"),
  afterSignupSubtitle: loc(
    "A simple picture of what comes next — details may vary as we finish moving tools onto this site.",
    "Una imagen sencilla de lo que sigue — los detalles pueden variar mientras terminamos de mover herramientas a este sitio.",
  ),
  afterSignup1: loc("Your information is received by the campaign.", "La campaña recibe su información."),
  afterSignup2: loc(
    "Automated emails begin once campaign email automation is live.",
    "Los correos automáticos comienzan cuando la automatización de correo de la campaña esté activa.",
  ),
  afterSignup3: loc("You receive onboarding materials and next steps.", "Recibe materiales de incorporación y próximos pasos."),
  afterSignup4: loc("A coordinator may connect you with a local team.", "Un coordinador puede conectarlo/a con un equipo local."),
  afterSignup5: loc("If no team exists yet, you may be invited to help start one.", "Si aún no hay equipo, puede invitarlo/a a ayudar a formar uno."),
  afterSignup6Lead: loc("You can immediately use the", "Puede usar de inmediato la"),
  afterSignup6And: loc("and", "y la"),
  afterSignup6End: loc("to begin.", "para empezar."),
  resourceLibraryShort: loc("resource library", "biblioteca de recursos"),

  shareBlurb: loc(
    "Share this page with a QR code, text message, or social post. A new volunteer can start here without needing a long explanation.",
    "Comparta esta página con un código QR, mensaje de texto o publicación en redes. Un voluntario nuevo puede empezar aquí sin una explicación larga.",
  ),
  shareAriaLabel: loc("Share this page", "Compartir esta página"),
} as const;

export type VolunteerOnboardingCopyKey = keyof typeof copy;

export function volunteerOnboardingCopy(key: VolunteerOnboardingCopyKey, locale: AppLocale): string {
  return resolveLocalizedString(copy[key], locale);
}

function resolveList(items: readonly LocalizedString[], locale: AppLocale): string[] {
  return items.map((item) => resolveLocalizedString(item, locale));
}

const ONBOARDING_CHECKLIST = [
  loc("Read this page.", "Lea esta página."),
  loc("Pick the role that feels easiest for you.", "Elija el rol que le resulte más fácil."),
  loc("Complete the volunteer signup form.", "Complete el formulario de registro de voluntario."),
  loc("Invite one friend to look at this page.", "Invite a un amigo o amiga a ver esta página."),
  loc("Join or help start a 3-person team in your area.", "Únase o ayude a formar un equipo de 3 personas en su zona."),
] as const;

const TEAM_BUILDER_CHECKLIST = [
  loc("We know our geography.", "Conocemos nuestra geografía."),
  loc("We know our level: county, city, precinct, neighborhood, or community.", "Conocemos nuestro nivel: condado, ciudad, precinto, vecindario o comunidad."),
  loc("We have someone covering Events.", "Tenemos a alguien en Eventos."),
  loc("We have someone covering Social Media.", "Tenemos a alguien en Redes sociales."),
  loc("We have someone covering Power of 5 / Voter Registration.", "Tenemos a alguien en Poder de 5 / Registro de votantes."),
  loc("We know who the upstream campaign contact is.", "Sabemos quién es el contacto con la campaña."),
  loc("We know where to send updates.", "Sabemos dónde enviar actualizaciones."),
  loc("We know our first weekly tasks.", "Conocemos nuestras primeras tareas semanales."),
  loc("We know what downstream team we want to help build next.", "Sabemos qué equipo local queremos ayudar a formar después."),
] as const;

const NUMBERED_FLOW = [
  loc("I will start.", "Yo empezaré."),
  loc("I will recruit one more person.", "Reclutaré a una persona más."),
  loc("We will look at volunteer signups and our own networks.", "Revisaremos registros de voluntarios y nuestras propias redes."),
  loc("We will recruit two people to cover the missing lanes.", "Reclutaremos a dos personas para cubrir los roles faltantes."),
  loc("We will define our geography.", "Definiremos nuestra geografía."),
  loc("We will choose our upstream contact.", "Elegiremos nuestro contacto con la campaña."),
  loc("We will begin weekly tasks.", "Comenzaremos las tareas semanales."),
  loc("We will help launch the next downstream team.", "Ayudaremos a lanzar el siguiente equipo local."),
] as const;

const ROLE_EVENTS_TASKS = [
  loc("Find or suggest one local event opportunity.", "Buscar o sugerir una oportunidad de evento local."),
  loc("Help invite people to one gathering.", "Ayudar a invitar personas a una reunión."),
  loc("Report event needs back to the team.", "Informar al equipo las necesidades del evento."),
] as const;

const ROLE_SOCIAL_TASKS = [
  loc("Share approved campaign content.", "Compartir contenido aprobado por la campaña."),
  loc("Invite friends to follow campaign channels.", "Invitar amigos a seguir los canales de la campaña."),
  loc("Capture photos or updates from local activity when appropriate.", "Capturar fotos o actualizaciones de la actividad local cuando corresponda."),
] as const;

const ROLE_RELATIONAL_TASKS = [
  loc("Ask each volunteer to choose five people.", "Pedir a cada voluntario que elija a cinco personas."),
  loc("Encourage one relational organizing touch per week.", "Animar un contacto de organización relacional por semana."),
  loc("Help connect voter registration opportunities to local activity.", "Ayudar a conectar oportunidades de registro con la actividad local."),
] as const;

export function volunteerOnboardingChecklist(locale: AppLocale): string[] {
  return resolveList(ONBOARDING_CHECKLIST, locale);
}

export function volunteerTeamBuilderChecklist(locale: AppLocale): string[] {
  return resolveList(TEAM_BUILDER_CHECKLIST, locale);
}

export function volunteerNumberedFlow(locale: AppLocale): string[] {
  return resolveList(NUMBERED_FLOW, locale);
}

export function volunteerRoleWeeklyTasks(role: "events" | "social" | "relational", locale: AppLocale): string[] {
  if (role === "events") return resolveList(ROLE_EVENTS_TASKS, locale);
  if (role === "social") return resolveList(ROLE_SOCIAL_TASKS, locale);
  return resolveList(ROLE_RELATIONAL_TASKS, locale);
}

export function volunteerBuildDownstreamBullets(locale: AppLocale): string[] {
  return resolveList(
    [
      copy.buildDownstream1,
      copy.buildDownstream2,
      copy.buildDownstream3,
      copy.buildDownstream4,
      copy.buildDownstream5,
    ],
    locale,
  );
}

export function volunteerBuildGeoBullets(locale: AppLocale): string[] {
  return resolveList([copy.buildGeoCounty, copy.buildGeoCity, copy.buildGeoLocal], locale);
}
