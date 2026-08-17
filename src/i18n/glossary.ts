import type { LocalizedString } from "@/i18n/types";

function term(en: string, es: string): LocalizedString {
  return { en, es, status: "approved" };
}

/**
 * Canonical civic language for Arkansas conversational Spanish.
 * English remains the source of truth. Do not invent Spain-isms.
 * Proper names stay in English: Kelly Grappe, Arkansas, county names, From the Road.
 */
export const GLOSSARY = {
  secretaryOfState: term("Secretary of State", "Secretario de Estado"),
  voterRegistration: term("voter registration", "registro de votante"),
  checkRegistration: term("check your registration", "verifique su registro"),
  pollingPlace: term("polling place", "lugar de votación"),
  ballot: term("ballot", "boleta"),
  ballotInitiative: term("ballot initiative", "iniciativa ciudadana"),
  county: term("county", "condado"),
  election: term("election", "elección"),
  elections: term("elections", "elecciones"),
  volunteer: term("volunteer", "voluntario"),
  join: term("join the campaign", "únete a la campaña"),
  inviteKelly: term("Invite Kelly", "Invitar a Kelly"),
  getInvolved: term("Get Involved", "Participar"),
  stayConnected: term("Stay connected", "Manténgase en contacto"),
  donate: term("Donate", "Donar"),
  vote: term("Vote", "Votar"),
  register: term("Register", "Registrarse"),
} as const;
