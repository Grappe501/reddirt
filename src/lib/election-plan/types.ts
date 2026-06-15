/** Types for the /election-plan executive workbench snapshot. */

export type ElectionPlanScenario = {
  label: string;
  projectedVotes: number;
  inPluralityRange: boolean;
};

export type ElectionPlanLane = {
  id: string;
  name: string;
  goal: number;
  potential?: number;
  stretch?: number;
  note: string;
};

export type ElectionPlanCounty = {
  county: string;
  slug: string;
  tier: string;
  vciRank: number;
  vci: number;
  strategicRole: string;
  primaryMission: string;
  secondaryMission: string;
  registrationGoal: number;
  lane2Recovery50: number;
  gopConversionPotential: number;
  coverageCompleted: number;
  coveragePlanned: number;
  coveragePct: number;
  guardrailStatus: string;
  recommendedAction: string;
  playbookPath: string;
};

export type ElectionPlanCity = {
  rank: number;
  slug: string;
  name: string;
  county: string;
  targetVotes: number;
  voteGain: number;
  baselineVote: number;
  strategicRole: string;
  visitFrequency: string;
  influenceTags: string[];
  isTop10: boolean;
};

export type ElectionPlanCluster = {
  id: string;
  name: string;
  counties: string[];
  vci: number;
  shareOfExpected: number;
  recommendedVisits: number;
};

export type ElectionPlanWeekCandidate = {
  weekNumber: number;
  weekOf: string;
  rangeLabel: string;
  status: string;
  primaryCluster: string;
  clusterPriority: string;
  focusCities: string[];
  topEventCount: number;
};

export type ElectionPlanArchitectureSection = {
  id: string;
  title: string;
  description: string;
  path: string;
  children?: ElectionPlanArchitectureSection[];
};

export type ElectionPlanWorkbenchSnapshot = {
  version: number;
  generatedAt: string;
  classification: string;
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
    metrics: Array<{ label: string; value: string; detail?: string }>;
  };
  executive: {
    summary: string;
    constraints: string[];
    cards: Array<{ label: string; value: string; detail?: string }>;
    brainStatus: string;
    calendarTruthRequirement: string;
  };
  theoryOfVictory: {
    lanes: ElectionPlanLane[];
    doctrine: {
      title: string;
      pillars: string[];
      tableBeliefs: string[];
    };
  };
  electoralMath: {
    baselineD: number;
    traditionalMajorityTarget: number;
    pluralityRange: { low: number; high: number };
    scenarios: ElectionPlanScenario[];
    dropOff: {
      presidential2024Dem: number;
      midterm2022Dem: number;
      rawDropOff: number;
      recovery50: number;
      recovery75: number;
    };
    explanation: string;
  };
  counties: ElectionPlanCounty[];
  cities: ElectionPlanCity[];
  top10TargetVotes: number;
  top40TargetVotes: number;
  campaignBrain: {
    flow: string;
    modules: Array<{ name: string; description: string; path: string }>;
  };
  calendarTruth: {
    verifiedEvents: number;
    verifiedGoal: number;
    tentativeEvents: number;
    missingDates: number;
    countyFairsVerified: string;
    tierAEventsVerified: string;
    countyContactOwners: string;
    outcomeReportPct: number;
    phase9Ready: boolean;
    warning: string;
    exitCriteria: Array<{ label: string; met: boolean; current: string }>;
  };
  relationshipCapital: {
    doctrine: string;
    index: number;
    assets: Array<{ name: string; current: number; goal: number }>;
    programs: Array<{ name: string; completed: number; scheduled: number; goal: number }>;
    channels: string[];
  };
  execution: {
    lockNotice: string;
    clusters: ElectionPlanCluster[];
    weekCandidates: ElectionPlanWeekCandidate[];
  };
  architecture: ElectionPlanArchitectureSection[];
  peoplePower: {
    foundingVolunteersGoal: number;
    foundingVolunteersCurrent: number;
    launchLabel: string;
    retreatLocation: string;
    monthlyCalls: string;
    mobilizeEventsLinked: number;
    mobilizeRsvpTotal: number;
    substackStoriesPublished: number;
    strikeTeamCoveragePct: number;
    powerOf5Commitments: number;
    storyWorkflow: string[];
    communityRelationshipIndex: Array<{ label: string; current: number; goal?: number }>;
    sections: Array<{ id: string; title: string; description: string }>;
  };
  motionPresence: {
    doctrine: string;
    goal: string;
    arkansasPresenceScore: number;
    septemberPersuasionReadiness: number;
    countiesVisited: number;
    countiesTotal: number;
    citiesVisited: number;
    stopsCompleted: number;
    milesTraveled: number;
    eventsAttended: number;
    storiesPublished: number;
    storiesPending: number;
    storiesShared: number;
    substackPublished: number;
    videosPublished: number;
    socialPostsPublished: number;
    localBusinessesHighlighted: number;
    churchesHighlighted: number;
    schoolsHighlighted: number;
    mediaMentions: number;
    peopleSpotlighted: number;
    contentPyramidCompletionPct: number;
    storyCategories: Array<{ id: string; label: string; count: number; goal: number }>;
    countyMap: Array<{
      county: string;
      visited: boolean;
      stops: number;
      lastDate: string | null;
      daysSinceLastVisit: number | null;
      coverageStatus: string;
      relationshipStatus: string;
    }>;
    recentStops: Array<{ county: string; city: string; date: string; location: string; type: string }>;
    cadence: Array<{ day: string; activity: string }>;
    storyWorkflow: string[];
    components: Array<{ id: string; title: string; description: string }>;
  };
  forwardMotion: {
    heroLine: string;
    upcomingCount: number;
    nextWeekCount: number;
    priorityWindowCount: number;
    avgActivationReadiness: number;
    stops: Array<{
      eventId: string;
      eventName: string;
      county: string;
      city: string;
      date: string;
      assignment: string;
      effectiveScore: number;
      verificationStatus: string;
      activationReadinessPct: number;
      mobilizeStatus: string;
      facebookStatus: string;
      newsReleaseStatus: string;
      graphicsStatus: string;
      phoneBankStatus: string;
      postcardStatus: string;
      storyWorkflowStatus: string;
      nextAction: string;
    }>;
    missingPieces: string[];
    components: Array<{ id: string; title: string; description: string }>;
  };
  coalitionPowerMap: {
    heroLine: string;
    naacp: { branchesTotal: number; called: number; meetingsRequested: number; speakingScheduled: number };
    aea: { countiesActive: number; teacherSupporters: number; meetingsCompleted: number };
    muslim: { contactsTotal: number; meetingsOpen: number; meetingsRequested: number };
    hispanic: { frameworkStatus: string; lead: string; pendingJasmineReview: boolean };
    labor: { unionsTotal: number; contacted: number; meetingsCompleted: number; endorsementsInProgress: number };
    electedOfficials: { contacted: number; total: number; meetingsCompleted: number; introductionsRequested: number };
    candidates: { activePartnerships: number; sharedEvents: number; jointMobilize: number };
    pastOfficials: { engaged: number; total: number };
    sherwood: { goal: string; vipTablesSold: number; vipTablesGoal: number; ticketsSold: number; status: string; onTrack: boolean };
    cityForums: { planned: number; booked: number; total: number; fortSmithBooked: boolean };
    ruralTownhalls: { planned: number; total: number };
    standardAskPackage: string[];
    components: Array<{ id: string; title: string; description: string }>;
  };
  endorsementAcquisition: {
    heroLine: string;
    requested: number;
    meetingsScheduled: number;
    presentationsGiven: number;
    endorsed: number;
    pending: number;
    declined: number;
    activated: number;
    volunteerLeadsGenerated: number;
    donorLeadsGenerated: number;
    institutional: { labor: number; teacher: number; civilRights: number; total: number };
    currentOfficialsEndorsed: number;
    formerOfficialsEndorsed: number;
    communityLeadersEndorsed: number;
    candidatePartnerships: number;
    byTier: { tier1: number; tier2: number; tier3: number; tier4: number; tier5: number };
    valueCriteria: string[];
    activationChecklist: string[];
    pendingTargets: Array<{ name: string; organization: string; tier: number; status: string; county: string }>;
    components: Array<{ id: string; title: string; description: string }>;
  };
  voterContact: {
    heroLine: string;
    doctrine: string;
    humanContactIndex: {
      total: number;
      goal: number;
      completionPct: number;
      components: {
        phoneCalls: number;
        postcards: number;
        doorsKnocked: number;
        housePartyAttendees: number;
        powerOf5Conversations: number;
        volunteerRecruits: number;
        eventAttendees: number;
      };
    };
    tracks: {
      lane2Reactivation: {
        contacted: number;
        engaged: number;
        committed: number;
        turnoutTarget: number;
        completionPct: number;
      };
      lane3Registration: {
        registrationsStarted: number;
        registrationsCompleted: number;
        registrationEvents: number;
        volunteerRegistrars: number;
        goal: number;
        completionPct: number;
      };
      lane4Persuasion: {
        conversations: number;
        followUps: number;
        eventAttendance: number;
        endorsementsGenerated: number;
      };
    };
    funnel: {
      volunteersActive: number;
      voterContacts: number;
      commitments: number;
      turnoutTargets: number;
    };
    channels: Array<{
      id: string;
      label: string;
      primaryMetric: number;
      goal: number;
      completionPct: number;
      detail: string;
    }>;
    components: Array<{ id: string; title: string; description: string }>;
  };
  candidateDashboard: {
    weeksRemaining: number;
    projectedVotes: number;
    lane2Potential: number;
    registrationGoal: number;
    countiesCovered: number;
    countiesTotal: number;
    upcomingStops: number;
    volunteerLeadersGoal: number;
    volunteerLeadersCurrent: number;
    sherwoodGoal: string;
    sherwoodVipSold: number;
    sherwoodVipGoal: number;
    topPrioritiesThisWeek: string[];
    currentWeek: number;
    weekRange: string;
  };
  weekPlans: Array<{
    weekNumber: number;
    range: string;
    status: string;
    cluster: string;
    cities: string[];
    focus: string;
    clusterFocus?: string;
    counties?: string[];
    events?: string[];
    volunteerGoals?: string[];
    coalitionGoals?: string[];
    storytellingGoals?: string[];
    endorsementGoals?: string[];
    gotvGoals?: string[];
    metrics?: Array<{ label: string; target: number | string }>;
  }>;
  warRoom: {
    weeksRemaining: number;
    currentWeek: number;
    weekRange: string;
    projectedVotes: number;
    lane2Potential: number;
    registrationGoal: number;
    registrationProgress: number;
    endorsementsRequested: number;
    endorsementsEndorsed: number;
    volunteerLeadersGoal: number;
    volunteerLeadersCurrent: number;
    upcomingEvents: number;
    countiesCovered: number;
    countiesTotal: number;
    hciTotal: number;
    hciGoal: number;
    hciCompletionPct: number;
    calendarTruthVerified: number;
    calendarTruthGoal: number;
    calendarTruthPct: number;
    phase9Ready: boolean;
    sherwoodGoal: string;
    sherwoodVipSold: number;
    sherwoodVipGoal: number;
    sherwoodTicketsSold: number;
    sherwoodVolunteers: number;
    topPrioritiesThisWeek: string[];
  };
  campaignTimeline: Array<{
    weekNumber: number;
    date: string;
    label: string;
    category: string;
    importance: string;
  }>;
  coverageReality: {
    disclaimer: string;
    referenceDate: string;
    doctrine: string;
    visitedCount: number;
    neverVisitedCount: number;
    deltaGapCount: number;
    tier1RevisitDue: number;
    brainPreviouslyReported: number;
    reconciliationDelta: number;
    visitedCounties: Array<{
      county: string;
      vciRank: number | null;
      visitCount: number;
      lastVisitDate: string | null;
      daysSinceLastVisit: number | null;
    }>;
    neverVisitedCounties: Array<{
      county: string;
      vciRank: number | null;
      priorityScore: number;
      planningCategory: string;
    }>;
    deltaGapCounties: Array<{
      county: string;
      vciRank: number | null;
      priorityScore: number;
      recommendedAction: string;
    }>;
    tier1RevisitQueue: Array<{
      county: string;
      vciRank: number | null;
      visitCount: number;
      lastVisitDate: string | null;
      daysSinceLastVisit: number | null;
      recommendedAction: string;
    }>;
    priorityQueue: Array<{
      county: string;
      vciRank: number | null;
      visitCount: number;
      daysSinceLastVisit: number | null;
      planningCategory: string;
      priorityScore: number;
      recommendedAction: string;
    }>;
  };
  calendarSettlement: {
    windowStart: string;
    windowEnd: string;
    earlyVotingStart: string;
    lockedEventCount: number;
    openDayCount: number;
    protectedWorkDayCount: number;
    projectedCountiesAfterLocked: number;
    stillMissingCount: number;
    stillMissingCounties: string[];
    visitedBaseline: number;
    lockedBackbone: Array<{
      date: string;
      dateEnd: string | null;
      eventName: string;
      county: string;
      city: string;
      eventType: string;
      travelClass: string;
      overnightLikely: boolean;
    }>;
    topOpenRecommendations: Array<{
      date: string;
      weekday: string;
      city: string;
      county: string;
      score: number;
      travelClass: string;
    }>;
    tier1RevisitStatus: Array<{
      county: string;
      vciRank: number | null;
      lastVisitDate: string | null;
      nextLockedDate: string | null;
      nextLockedEvent: string | null;
      status: string;
    }>;
    deltaGapCountiesOpen: string[];
  };
  calendarFillPhaseA: {
    disclaimer: string;
    datesAssigned: boolean;
    corridorCount: number;
    remainingCountyCount: number;
    openWeekendCount: number;
    corridors: Array<{ id: string; name: string; counties: string[]; anchorCity: string; category: string }>;
    topTradeoffConflicts: string[];
    septemberGaps: string[];
    topWeekendTradeoffs: Array<{ weekend: string; optionA: string; optionB: string }>;
    septemberGate: Array<{ criterion: string; status: string; detail: string }>;
  };
  calendarFillPhaseB: {
    disclaimer: string;
    status: string;
    strategyLabel: string;
    leadershipApprovalRequired: boolean;
    proposedBlockCount: number;
    proposedTotalAfterFill: number;
    stillMissingAfterFill: number;
    deltaCountiesScheduled: number;
    proposedBlocks: Array<{
      label: string;
      startDate: string;
      endDate: string;
      countiesNew: string[];
      countiesRevisit: string[];
      category: string;
      travelClass: string;
    }>;
    tier1RevisitsProposed: string[];
  };
  calendarFillPhaseC: {
    disclaimer: string;
    status: string;
    strategyLabel: string;
    leadershipSignOffRequired: boolean;
    conditionalBlocksResolved: number;
    protectedBlocks: number;
    mustHitCountyCount: number;
    bonusCountyCount: number;
    leadershipDecisionsPending: number;
    pathwayMustHit: string;
    pathwayFull: string;
    refinedBlocks: Array<{
      id: string;
      label: string;
      startDate: string;
      endDate: string;
      countiesNew: string[];
      approvalStatus: string;
      mustHitCounties: string[];
      bonusIfTimeCounties: string[];
    }>;
    timeAudits: Array<{
      blockId: string;
      block: string;
      candidateHours: number;
      travelHours: number;
      eventHours: number;
      relationshipHours: number;
      relationshipDensity: string;
    }>;
  };
  executiveBookV1: {
    version: string;
    status: string;
    laborDayDeadline: string;
    unassignedOwners: number;
    weeklyScorecard: Array<{
      metric: string;
      goal: string | number;
      actual: string | number;
      status?: string;
      current?: string | number;
    }>;
  };
  executiveCalendar: {
    disclaimer: string;
    referenceDate: string;
    summary: {
      pastVisitCount: number;
      lockedCount: number;
      scheduledCount: number;
      proposedCount: number;
      totalEntries: number;
      countiesVisited: number;
      countiesScheduled: number;
    };
    entries: Array<{
      id: string;
      startDate: string;
      endDate: string | null;
      label: string;
      city: string | null;
      county: string;
      category: "past_visit" | "locked" | "scheduled" | "proposed";
      status: string;
      source: string;
      eventType?: string;
      notes?: string;
    }>;
  };
  executiveBookHub: {
    version: string;
    status: string;
    laborDayDeadline: string;
    completenessEstimate: string;
    chapters: Array<{
      slug: string;
      number: number;
      title: string;
      subtitle: string;
      href: string;
      statusLines: string[];
      metrics: Array<{ label: string; value: string }>;
    }>;
  };
};
