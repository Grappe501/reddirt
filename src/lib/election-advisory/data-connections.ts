export type AeacDataConnection = {
  id: "census" | "bls" | "civic";
  label: string;
  ready: boolean;
  publicHref: string;
  envName: string;
};

export function getAeacDataConnections(): AeacDataConnection[] {
  return [
    {
      id: "census",
      label: "U.S. Census Bureau / ACS",
      ready: Boolean(process.env.CENSUS_API_KEY?.trim()),
      publicHref: "https://www.census.gov/data/developers/guidance/api-user-guide.html",
      envName: "CENSUS_API_KEY",
    },
    {
      id: "bls",
      label: "Bureau of Labor Statistics",
      ready: Boolean(process.env.BLS_API_KEY?.trim()),
      publicHref: "https://www.bls.gov/developers/",
      envName: "BLS_API_KEY",
    },
    {
      id: "civic",
      label: "Google Civic Information",
      ready: Boolean(process.env.GOOGLE_CIVIC_API_KEY?.trim()),
      publicHref: "https://developers.google.com/civic-information",
      envName: "GOOGLE_CIVIC_API_KEY",
    },
  ];
}
