/** Canonical public routes — Direct Democracy is a campaign center pillar. */

export const ballotInitiativeProcessHref = "/direct-democracy/ballot-initiative-process" as const;
/**
 * People’s Voice hub (`/direct-democracy`) and Kelly’s petition chapter (`/about/initiatives-petitions`)
 * are parked — public CTAs use the process page until those routes return.
 */
export const directDemocracyHubHref = ballotInitiativeProcessHref;
export const kellyInitiativesChapterHref = ballotInitiativeProcessHref;
/** Former commitment-network form was removed from `/direct-democracy`; send leftover CTAs to Get Involved. */
export const directDemocracyCommitmentHref = "/get-involved" as const;
