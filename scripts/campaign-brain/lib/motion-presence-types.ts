/** Phase 12 — Motion & Storytelling Engine types (operational, not strategy). */

export type PresenceStopType =
  | "county_fair"
  | "festival"
  | "church"
  | "school"
  | "diner"
  | "library"
  | "rotary"
  | "naacp"
  | "extension_homemakers"
  | "clerk_office"
  | "house_party"
  | "civic_club"
  | "sports"
  | "business"
  | "media"
  | "other";

export type StoryCategoryId =
  | "local_business"
  | "teacher"
  | "student"
  | "veteran"
  | "volunteer"
  | "faith_leader"
  | "community_organization"
  | "arkansas_success"
  | "arkansas_challenge"
  /** @deprecated legacy ids — normalized at build time */
  | "arkansas_story"
  | "community_spotlight"
  | "arkansas_problem"
  | "arkansas_hope";

export type CoverageStatus = "not_visited" | "visited" | "story_published";
export type RelationshipStatus = "none" | "building" | "established";

export type ContentPyramidLevel = {
  verticalVideo: boolean;
  photoCarousel: boolean;
  localStory: boolean;
  substack: boolean;
  emailRecap: boolean;
};

export type PresenceStop = {
  id: string;
  county: string;
  city: string;
  date: string;
  location: string;
  type: PresenceStopType | string;
  storyCategory?: StoryCategoryId | string;
  photos: boolean;
  video: boolean;
  storyPublished: boolean;
  socialPostsPublished: number;
  substackPublished: boolean;
  mediaCoverage: boolean;
  contentPyramid: ContentPyramidLevel;
  milesFromPrevious?: number;
  storyLink?: string;
  mobilizeLink?: string;
  attendanceEstimate?: number;
  storiesShared?: number;
  notes?: string;
};

export type PresenceStopsFile = {
  version: number;
  note: string;
  stops: PresenceStop[];
};

export type MotionMetrics = {
  version: number;
  generatedAt: string;
  countiesVisited: number;
  countiesTotal: number;
  citiesVisited: number;
  stopsCompleted: number;
  milesTraveled: number;
  eventsAttended: number;
  storiesPublished: number;
  storiesPending: number;
  storiesShared: number;
  countiesWithStories: number;
  citiesWithStories: number;
  substackPublished: number;
  videosPublished: number;
  socialPostsPublished: number;
  localBusinessesHighlighted: number;
  churchesHighlighted: number;
  schoolsHighlighted: number;
  faithOrganizationsVisited: number;
  clerkOfficesVisited: number;
  festivalsAttended: number;
  sportsEventsAttended: number;
  mediaMentions: number;
  peopleSpotlighted: number;
  contentPyramidCompletionPct: number;
  arkansasPresenceScore: number;
  septemberPersuasionReadiness: number;
};

export type ArkansasPresenceCounty = {
  county: string;
  slug: string;
  visitCount: number;
  lastVisitDate: string | null;
  daysSinceLastVisit: number | null;
  coverageStatus: CoverageStatus;
  relationshipStatus: RelationshipStatus;
  storiesPublished: number;
};
