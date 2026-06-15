/** 9 statewide opportunity clusters for routing and deployment planning. */

export type OpportunityCluster = {
  id: string;
  name: string;
  counties: string[];
  cities: string[];
  description: string;
  recommendedVisits: number;
};

export const OPPORTUNITY_CLUSTERS: readonly OpportunityCluster[] = [
  {
    id: "nwa",
    name: "Northwest Arkansas Cluster",
    counties: ["Washington", "Benton", "Madison", "Carroll", "Boone"],
    cities: ["Fayetteville", "Springdale", "Rogers", "Bentonville", "Siloam Springs", "Bella Vista"],
    description: "NWA growth corridor — university pipeline, chamber networks, moderate Republican conversion.",
    recommendedVisits: 8,
  },
  {
    id: "central-metro",
    name: "Central Arkansas Metro Cluster",
    counties: ["Pulaski", "Saline", "Lonoke", "Faulkner"],
    cities: ["Little Rock", "North Little Rock", "Sherwood", "Jacksonville", "Maumelle", "Conway", "Cabot", "Bryant", "Benton"],
    description: "Statewide hub — media, fundraising, volunteer production, Lane 2 recovery at scale.",
    recommendedVisits: 10,
  },
  {
    id: "river-valley",
    name: "River Valley Cluster",
    counties: ["Sebastian", "Crawford", "Franklin", "Logan", "Johnson", "Pope", "Yell", "Perry"],
    cities: ["Fort Smith", "Van Buren", "Russellville"],
    description: "Western persuasion corridor — regional media, clerk relationships, moderate GOP outreach.",
    recommendedVisits: 5,
  },
  {
    id: "northeast-ridge",
    name: "Northeast Arkansas Cluster",
    counties: ["Craighead", "Greene", "Poinsett", "Cross", "Jackson", "Lawrence", "Randolph", "Sharp", "Clay"],
    cities: ["Jonesboro", "Paragould", "Wynne", "Batesville"],
    description: "Crowley's Ridge and northeast media — persuasion, regional chambers, volunteer hubs.",
    recommendedVisits: 5,
  },
  {
    id: "delta-southeast",
    name: "Southeast Delta Cluster",
    counties: ["Jefferson", "Arkansas", "Ashley", "Chicot", "Desha", "Drew", "Lincoln", "Cleveland", "Bradley", "Calhoun", "Dallas"],
    cities: ["Pine Bluff", "Stuttgart", "Camden", "El Dorado", "Hope"],
    description: "Delta Democratic recovery — Lane 2 reactivation, base turnout, faith and community organizing.",
    recommendedVisits: 6,
  },
  {
    id: "crittenden-memphis",
    name: "Crittenden / Memphis-Adjacent Cluster",
    counties: ["Crittenden", "Mississippi", "Lee", "Phillips", "Monroe"],
    cities: ["West Memphis", "Marion", "Blytheville", "Forrest City"],
    description: "East Arkansas turnout growth — Democratic recovery, Delta base mobilization.",
    recommendedVisits: 4,
  },
  {
    id: "hot-springs-ouachita",
    name: "Hot Springs & Ouachita Cluster",
    counties: ["Garland", "Hot Spring", "Montgomery", "Pike", "Clark", "Nevada", "Hempstead", "Little River"],
    cities: ["Hot Springs", "Malvern", "Arkadelphia", "Hope"],
    description: "Tourism, retiree persuasion, lake communities — relationship-based Lane 4.",
    recommendedVisits: 4,
  },
  {
    id: "southwest",
    name: "Southwest Arkansas Cluster",
    counties: ["Miller", "Union", "Columbia", "Lafayette", "Ouachita", "Nevada", "Hempstead"],
    cities: ["Texarkana", "El Dorado", "Magnolia"],
    description: "Timber and oil belt — chamber relationships, county seats, registration at schools.",
    recommendedVisits: 3,
  },
  {
    id: "north-central-ozarks",
    name: "North Central Ozarks Cluster",
    counties: ["Baxter", "Marion", "Searcy", "Stone", "Newton", "Izard", "Fulton", "Van Buren", "Cleburne", "Independence", "White"],
    cities: ["Mountain Home", "Harrison", "Searcy", "Beebe"],
    description: "Ozarks and Boston Mountains — event-driven presence, retiree persuasion, fair circuit.",
    recommendedVisits: 4,
  },
] as const;

export function clusterForCounty(county: string): OpportunityCluster {
  return (
    OPPORTUNITY_CLUSTERS.find((c) => c.counties.includes(county)) ?? {
      id: "statewide",
      name: "Statewide / unclustered",
      counties: [county],
      cities: [],
      description: "Assign to nearest cluster on travel calendar.",
      recommendedVisits: 1,
    }
  );
}
