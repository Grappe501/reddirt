/** Field fundraising OS — scaffold types (DB wiring in a later pass). */

export type FundraisingLeadTrack = "adult" | "college";

export type FundraisingLeadStatus =
  | "prospect"
  | "invited"
  | "training"
  | "active"
  | "needs_support"
  | "paused";

export type FundraisingLead = {
  id: string;
  name: string;
  geography: string;
  track: FundraisingLeadTrack;
  status: FundraisingLeadStatus;
  personalFundraisingUrl: string | null;
  personalQrCodeUrl: string | null;
  donorCount: number;
  dollarsRaised: number;
  eventsHosted: number;
  hostsRecruited: number;
  newDonors: number;
  notes?: string;
};
