export type AdminElectionPlanLink = {
  label: string;
  href: string;
  /** One-line context under the label (e.g. event parent, goal, date) */
  detail?: string;
  /** Extra search tokens (slug, county name, etc.) */
  keywords?: string[];
  /** Secondary links shown inline on the row */
  related?: AdminElectionPlanLink[];
  /** UI hint for smoke-test / pilot rows */
  variant?: "event-workbench" | "city-workbench" | "county-playbook";
};

export type AdminElectionPlanSection = {
  id: string;
  title: string;
  description?: string;
  /** When true, section stays expanded by default in admin hub */
  pinned?: boolean;
  links: AdminElectionPlanLink[];
};

export type AdminElectionPlanCatalog = {
  generatedAt: string;
  /** Steve smoke-test doorway — always pinned at top of /admin/election-plan */
  smokeTestLinks: AdminElectionPlanLink[];
  stats: {
    totalLinks: number;
    sectionCount: number;
    workbenchCount: number;
    countyCount: number;
    cityCount: number;
    campusCount: number;
  };
  sections: AdminElectionPlanSection[];
};
