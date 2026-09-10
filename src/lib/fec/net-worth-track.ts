import netWorthData from "./net-worth.json";

export type NetWorthLink = {
  label: string;
  href: string;
};

export type NetWorthHighlight = {
  label: string;
  value: string;
};

export type NetWorthPreOffice = {
  year: string;
  item: string;
  detail: string;
  source: string;
  href: string;
};

export type NetWorthRow = {
  year: string;
  period: string;
  estimate: string;
  range: string;
  source: string;
  href: string;
  midpoint: number | null;
  series: string;
};

export type NetWorthPerson = {
  id: string;
  name: string;
  office: string;
  inOfficeSince: string;
  beforeNote: string;
  links: NetWorthLink[];
  highlights: NetWorthHighlight[];
  preOffice: NetWorthPreOffice[];
  rows: NetWorthRow[];
};

export type NetWorthReport = {
  disclaimer: string;
  people: NetWorthPerson[];
};

export const NET_WORTH_REPORT = netWorthData as NetWorthReport;
