import source from "../../../../data/campaign-brain/county-workbench-v4-framework.source.json";

export type CountyV4NavSection = { id: string; label: string };

export type CountyV4LeadershipRole = {
  key: string;
  label: string;
  strikeTeamKey: string | null;
};

export type CountyV4PipelineStage = {
  key: string;
  label: string;
  recordSource: string;
};

export type CountyV4MetricDef = { key: string; label: string };

const file = source as {
  navSections: CountyV4NavSection[];
  leadershipRoles: CountyV4LeadershipRole[];
  volunteerPipelineStages: CountyV4PipelineStage[];
  ppenMyFiveMetrics: CountyV4MetricDef[];
  ppenHelpTenMetrics: CountyV4MetricDef[];
};

export function getCountyV4NavSections(): CountyV4NavSection[] {
  return file.navSections;
}

export function getCountyV4LeadershipRoles(): CountyV4LeadershipRole[] {
  return file.leadershipRoles;
}

export function getCountyV4PipelineStages(): CountyV4PipelineStage[] {
  return file.volunteerPipelineStages;
}

export function getCountyV4MyFiveMetrics(): CountyV4MetricDef[] {
  return file.ppenMyFiveMetrics;
}

export function getCountyV4HelpTenMetrics(): CountyV4MetricDef[] {
  return file.ppenHelpTenMetrics;
}
