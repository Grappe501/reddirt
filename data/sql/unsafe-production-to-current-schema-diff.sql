-- CreateEnum
CREATE TYPE "public"."ComplianceDocumentType" AS ENUM ('SOS_ETHICS_FORM', 'FILING_INSTRUCTIONS', 'PRIOR_SUBMITTED_REPORT', 'RECEIPT', 'REIMBURSEMENT', 'BANK_OR_EXPORT_STATEMENT', 'POLICY_MEMO', 'COUNSEL_GUIDANCE', 'DEADLINE_CALENDAR', 'DISCLAIMER_OR_TEMPLATE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FinancialTransactionType" AS ENUM ('EXPENSE', 'REIMBURSEMENT', 'CONTRIBUTION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FinancialSourceType" AS ENUM ('MANUAL', 'SUBMISSION', 'DOCUMENT', 'FUTURE_INTEGRATION');

-- CreateEnum
CREATE TYPE "public"."FinancialTransactionStatus" AS ENUM ('DRAFT', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "public"."FieldUnitType" AS ENUM ('COUNTY', 'REGION');

-- CreateEnum
CREATE TYPE "public"."BudgetPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."PositionSeatStatus" AS ENUM ('VACANT', 'FILLED', 'ACTING', 'SHADOW');

-- CreateEnum
CREATE TYPE "public"."EmailOptInStatus" AS ENUM ('UNKNOWN', 'OPT_IN', 'OPT_OUT');

-- CreateEnum
CREATE TYPE "public"."SmsOptInStatus" AS ENUM ('UNKNOWN', 'OPT_IN', 'OPT_OUT');

-- CreateEnum
CREATE TYPE "public"."WorkflowIntakeStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'AWAITING_INFO', 'READY_FOR_CALENDAR', 'CONVERTED', 'DECLINED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."WorkflowActionKind" AS ENUM ('STATUS_CHANGE', 'ASSIGNMENT', 'NOTE', 'DECISION', 'EVENT_LINKED', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EventRequestStatus" AS ENUM ('OPEN', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AnalyticsRecommendationOutcomeStatus" AS ENUM ('GENERATED', 'DRAFT_CREATED', 'INTAKE_CREATED', 'EXECUTED', 'EVALUATED', 'DISMISSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."SocialPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'X', 'TIKTOK', 'YOUTUBE', 'BLUESKY', 'THREADS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SocialContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'ARCHIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SocialVariantStatus" AS ENUM ('DRAFT', 'READY', 'SCHEDULED', 'PUBLISHED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SocialContentKind" AS ENUM ('EVENT_PROMO', 'RAPID_RESPONSE', 'POST_EVENT_RECAP', 'CLIP_REPURPOSE', 'ORGANIC', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SocialMessageToneMode" AS ENUM ('CALM_CLARIFICATION', 'COMMUNITY_STORYTELLING', 'FAITH_CENTERED', 'ISSUE_EDUCATION', 'BOLD_CONTRAST', 'INVITATIONAL_CTA');

-- CreateEnum
CREATE TYPE "public"."SocialMessageTacticMode" AS ENUM ('NARRATIVE', 'ISSUE_BRIEF', 'VALUES_STORY', 'INVITE_ACTION', 'RUMOR_CLARIFY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SocialStrategicFollowupType" AS ENUM ('NONE', 'GENERAL_ENGAGEMENT', 'COUNTY_STORY', 'VOLUNTEER_PATHWAY', 'CLARIFICATION', 'RAPID_RESPONSE', 'CLARIFICATION_POST', 'COUNTY_VARIANT', 'VOLUNTEER_CTA', 'EVENT_PROMO', 'POST_EVENT_RECAP', 'NO_ACTION');

-- CreateEnum
CREATE TYPE "public"."SocialSentimentType" AS ENUM ('SUPPORTER', 'CURIOUS', 'SKEPTICAL', 'CONFUSED', 'HOSTILE', 'MEDIA', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."SocialPerformanceDataSource" AS ENUM ('MANUAL', 'API_IMPORT', 'ESTIMATE', 'AGGREGATOR');

-- CreateEnum
CREATE TYPE "public"."ConversationSourceKind" AS ENUM ('SOCIAL_PLATFORM', 'NEWS_SITE', 'RSS', 'PRESS_RELEASE', 'MANUAL_ENTRY', 'API_IMPORT');

-- CreateEnum
CREATE TYPE "public"."ConversationSignalActorType" AS ENUM ('OFFICIAL_ORG', 'PRESS', 'ELECTED_OR_COMMENTARY', 'COMMUNITY_THREAD', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."ConversationItemStatus" AS ENUM ('NEW', 'ENRICHED', 'CLUSTERED', 'DISMISSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ConversationClassification" AS ENUM ('ISSUE_ECONOMY', 'ISSUE_HEALTH', 'ISSUE_EDUCATION', 'ISSUE_INFRA', 'ISSUE_VOTING', 'ISSUE_LOCAL', 'MISINFO_RISK', 'QUESTION', 'SUPPORT', 'CRITIQUE', 'NEUTRAL_REPORT', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."ConversationSentimentLabel" AS ENUM ('POSITIVE', 'NEUTRAL', 'MIXED', 'NEGATIVE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."ConversationUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'BREAKING');

-- CreateEnum
CREATE TYPE "public"."ConversationSuggestedTone" AS ENUM ('CALM', 'FACTUAL', 'EMPATHETIC', 'FIRM', 'CELEBRATORY', 'DEFERRING', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ConversationWatchlistStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ConversationClusterStatus" AS ENUM ('ACTIVE', 'MERGED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ConversationOpportunityStatus" AS ENUM ('OPEN', 'ROUTED', 'CONVERTED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "public"."SocialContentMediaRefPurpose" AS ENUM ('SOCIAL_PLAN', 'VIDEO_REPURPOSE', 'VISUAL', 'PLATFORM_VARIANT');

-- CreateEnum
CREATE TYPE "public"."MediaKind" AS ENUM ('IMAGE', 'VIDEO_EMBED');

-- CreateEnum
CREATE TYPE "public"."ContentCollection" AS ENUM ('STORY', 'EDITORIAL', 'EXPLAINER');

-- CreateEnum
CREATE TYPE "public"."BlogDisplayMode" AS ENUM ('SUMMARY_LINK', 'EXCERPT_LINK', 'INTERNAL_MIRROR_TODO');

-- CreateEnum
CREATE TYPE "public"."ContentPlatform" AS ENUM ('SUBSTACK', 'FACEBOOK', 'INSTAGRAM', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "public"."PlatformConnectionStatus" AS ENUM ('INACTIVE', 'CONFIGURED', 'SYNCING', 'ERROR', 'OK');

-- CreateEnum
CREATE TYPE "public"."InboundSourceType" AS ENUM ('ARTICLE', 'POST', 'NOTE', 'VIDEO', 'REEL', 'SHORT', 'COMMENT', 'PODCAST_EPISODE', 'LIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."InboundReviewStatus" AS ENUM ('PENDING', 'REVIEWED', 'FEATURED', 'SUPPRESSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ContentRoutingDestination" AS ENUM ('NONE', 'HOMEPAGE_RAIL', 'PUBLIC_UPDATES', 'BLOG', 'STORIES_SEED', 'EDITORIAL_SEED', 'MEDIA_LIBRARY', 'CAMPAIGN_BRIEF');

-- CreateEnum
CREATE TYPE "public"."ContentDecisionStatus" AS ENUM ('NEW', 'REVIEWED', 'FEATURED', 'SUPPRESSED', 'ARCHIVED', 'ROUTED');

-- CreateEnum
CREATE TYPE "public"."ContentHubKind" AS ENUM ('VIDEO', 'STORY', 'SPEECH', 'ROAD_UPDATE', 'EXPLAINER', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "public"."OwnedMediaKind" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."OwnedMediaRole" AS ENUM ('SPEECH', 'ROAD_CLIP', 'PHOTO', 'EVENT', 'AD_CREATIVE', 'B_ROLL', 'GRAPHIC', 'INTERVIEW', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."OwnedMediaSourceType" AS ENUM ('DIRECT_UPLOAD', 'UPLOADED_CAMPAIGN', 'LOCAL_INDEXED', 'IMPORT', 'MIGRATED', 'SUPPORTER_UPLOAD', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."OwnedMediaStorageBackend" AS ENUM ('LOCAL_DISK', 'SUPABASE');

-- CreateEnum
CREATE TYPE "public"."GeoMetadataSource" AS ENUM ('NONE', 'EXIF', 'MANUAL', 'INFERRED', 'REVERSE_GEO');

-- CreateEnum
CREATE TYPE "public"."OwnedMediaReviewStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."TranscriptionJobStatus" AS ENUM ('NOT_REQUESTED', 'QUEUED', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."TranscriptSource" AS ENUM ('HUMAN', 'ASR', 'ASR_DRAFT', 'IMPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."TranscriptReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_EDIT');

-- CreateEnum
CREATE TYPE "public"."QuoteCandidateType" AS ENUM ('SUGGESTED', 'EDITOR_PICK', 'SOCIAL_CROP', 'PRESS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."QuoteReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."OwnedMediaPickStatus" AS ENUM ('UNRATED', 'PICK', 'REJECT');

-- CreateEnum
CREATE TYPE "public"."OwnedMediaColorLabel" AS ENUM ('NONE', 'RED', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE');

-- CreateEnum
CREATE TYPE "public"."OwnedMediaDerivativeType" AS ENUM ('ORIGINAL', 'THUMBNAIL', 'WEB_JPEG', 'CROP_SQUARE', 'CROP_PORTRAIT', 'CROP_STORY', 'VIDEO_PROXY', 'VIDEO_POSTER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."OwnedMediaDerivativeJobStatus" AS ENUM ('PLANNED', 'QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."OwnedMediaNoteType" AS ENUM ('DESCRIPTION', 'PEOPLE', 'LOCATION', 'EVENT_CONTEXT', 'MESSAGE_ANGLE', 'CAPTION', 'TRANSCRIPT_CORRECTION', 'INTERNAL_NOTE');

-- CreateEnum
CREATE TYPE "public"."CountyContentReviewStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED');

-- CreateEnum
CREATE TYPE "public"."ElectedJurisdiction" AS ENUM ('FEDERAL', 'STATE', 'COUNTY', 'LOCAL');

-- CreateEnum
CREATE TYPE "public"."PublicDemographicsSource" AS ENUM ('CENSUS_ACS', 'CENSUS_DECENNIAL', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ElectionResultSourceType" AS ENUM ('JSON_FILE', 'MANUAL_UPLOAD', 'OFFICIAL_EXPORT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."VoterFileIngestStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'COMPLETE', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."VoterParticipationProvenance" AS ENUM ('VENDOR_VOTER_FILE', 'IMPORT_CSV', 'STAFF', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."VoterSnapshotChangeType" AS ENUM ('NEW', 'UPDATED', 'REMOVED', 'REACTIVATED');

-- CreateEnum
CREATE TYPE "public"."VoterSignalKind" AS ENUM ('DONOR', 'VOLUNTEER', 'EVENT_ATTENDEE', 'INITIATIVE_SIGNER', 'RELATIONAL_CONTACT', 'CONTACT_LIST', 'VOTER_HISTORY', 'POLLING', 'MANUAL_NOTE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."VoterSignalSource" AS ENUM ('INTERNAL', 'UPLOADED_FILE', 'VOTER_FILE', 'ELECTION_RESULTS', 'FEC', 'STATE_DONOR_DATA', 'RELATIONAL_ORGANIZING', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."VoterSignalStrength" AS ENUM ('STRONG', 'MODERATE', 'WEAK', 'NEGATIVE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."ModelConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'HUMAN_CONFIRMED');

-- CreateEnum
CREATE TYPE "public"."VoterClassification" AS ENUM ('STRONG_BASE', 'LIKELY_SUPPORTER', 'LEANING_SUPPORTER', 'PERSUADABLE', 'LOW_PROPENSITY_SUPPORTER', 'UNKNOWN', 'UNLIKELY_OR_OPPOSED');

-- CreateEnum
CREATE TYPE "public"."ModelGeneratedBy" AS ENUM ('HUMAN', 'RULE_BASED', 'AI_ASSISTED', 'IMPORTED');

-- CreateEnum
CREATE TYPE "public"."VoterInteractionType" AS ENUM ('INTRODUCTION', 'REGISTRATION_CHECK', 'ISSUE_CONVERSATION', 'SUPPORT_ID', 'VOLUNTEER_ASK', 'DONATION_ASK', 'EVENT_INVITE', 'GOTV_CONTACT', 'VOTE_PLAN', 'FOLLOW_UP', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."VoterInteractionChannel" AS ENUM ('IN_PERSON', 'PHONE', 'TEXT', 'EMAIL', 'SOCIAL_DM', 'EVENT', 'DOOR', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."VoterSupportLevel" AS ENUM ('STRONG_SUPPORT', 'LEAN_SUPPORT', 'PERSUADABLE', 'UNDECIDED', 'LEAN_OPPOSE', 'STRONG_OPPOSE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."RelationalRelationshipType" AS ENUM ('FAMILY', 'FRIEND', 'NEIGHBOR', 'COWORKER', 'CHURCH_COMMUNITY', 'SCHOOL_COMMUNITY', 'COMMUNITY_GROUP', 'ONLINE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."RelationalRelationshipCloseness" AS ENUM ('VERY_CLOSE', 'CLOSE', 'FAMILIAR', 'WEAK_TIE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."RelationalMatchStatus" AS ENUM ('UNMATCHED', 'POSSIBLE_MATCH', 'MATCHED', 'CONFLICT', 'NOT_REGISTERED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "public"."RelationalOrganizingStatus" AS ENUM ('IDENTIFIED', 'NEEDS_REGISTRATION_CHECK', 'REGISTRATION_CHECKED', 'CONTACTED', 'ENGAGED', 'SUPPORT_ASSESSED', 'FOLLOW_UP_NEEDED', 'VOTE_PLAN_NEEDED', 'VOTE_PLAN_CREATED', 'INVITED_TO_POWER_OF_FIVE', 'INVITED_TO_VOLUNTEER', 'NOT_INTERESTED', 'DO_NOT_CONTACT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."VotePlanStatus" AS ENUM ('NOT_STARTED', 'NEEDS_PLAN', 'PLAN_CREATED', 'NEEDS_REMINDER', 'VOTED_CONFIRMED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."CampaignEventType" AS ENUM ('RALLY', 'APPEARANCE', 'TRAINING', 'MEETING', 'CANVASS', 'PHONE_BANK', 'FUNDRAISER', 'PRESS', 'DEADLINE', 'ORIENTATION', 'FESTIVAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CampaignEventStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CampaignEventVisibility" AS ENUM ('INTERNAL', 'STAFF', 'PUBLIC_STAFF');

-- CreateEnum
CREATE TYPE "public"."EventWorkflowState" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'CANCELED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."TimeMatrixQuadrant" AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

-- CreateEnum
CREATE TYPE "public"."EventReadinessStatus" AS ENUM ('UNKNOWN', 'NOT_STARTED', 'IN_PROGRESS', 'READY', 'AT_RISK', 'N_A');

-- CreateEnum
CREATE TYPE "public"."GoogleEventSyncState" AS ENUM ('IDLE', 'PENDING_PUSH', 'PENDING_PULL', 'SYNCED', 'CONFLICT', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."CalendarProvider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "public"."CalendarSourceVisibility" AS ENUM ('STAFF', 'MANAGER', 'PUBLIC_CONNECTOR');

-- CreateEnum
CREATE TYPE "public"."CalendarSourceType" AS ENUM ('CAMPAIGN_MASTER', 'CANDIDATE_PUBLIC_APPEARANCES', 'TRAVEL_LOGISTICS', 'INTERNAL_STAFF_PLANNING', 'CONTENT_MEDIA', 'PERSONAL_OVERLAY');

-- CreateEnum
CREATE TYPE "public"."EventApprovalState" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."FestivalIngestReviewStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "public"."FestivalSourceChannel" AS ENUM ('RSS', 'WEB', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE', 'MANUAL', 'OTHER', 'PUBLIC_FORM');

-- CreateEnum
CREATE TYPE "public"."EventSyncDirection" AS ENUM ('PUSH_TO_GOOGLE', 'PULL_FROM_GOOGLE', 'WATCH_PING');

-- CreateEnum
CREATE TYPE "public"."EventSyncLogStatus" AS ENUM ('OK', 'ERROR', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."CampaignTaskType" AS ENUM ('PREP', 'COMMS', 'FIELD', 'DATA', 'VOLUNTEER', 'MEDIA', 'ADMIN', 'FOLLOW_UP', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CampaignTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CampaignTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."WorkflowTemplateTrigger" AS ENUM ('EVENT_CREATED', 'EVENT_SIGNUP_CREATED', 'MENTION_REVIEWED', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."WorkflowRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."VolunteerAskType" AS ENUM ('SHARE', 'RSVP', 'CANVASS', 'PHONE_BANK', 'HOST', 'RECRUIT', 'AMPLIFY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."VolunteerAskStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."EventSignupAttendeeStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'CANCELLED', 'ATTENDED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."MediaIngestBatchStatus" AS ENUM ('STARTED', 'COMPLETE', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."SignupSheetDocumentStatus" AS ENUM ('DRAFT', 'QUEUED', 'EXTRACTING', 'EXTRACTED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."SignupSheetExtractionStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."SignupSheetEntryStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."CommunicationChannel" AS ENUM ('SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "public"."CommunicationThreadStatus" AS ENUM ('ACTIVE', 'NEEDS_REPLY', 'FOLLOW_UP', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "public"."CommsSendProvider" AS ENUM ('TWILIO', 'SENDGRID', 'GMAIL', 'MANUAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."MessageDeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'OPENED', 'CLICKED', 'RECEIVED');

-- CreateEnum
CREATE TYPE "public"."CommunicationActionType" AS ENUM ('SEND_SMS', 'SEND_EMAIL', 'SEND_REMINDER', 'AI_SUGGEST_FOLLOWUP', 'CAL_REMINDER_DUE', 'CAL_EVENT_CHANGED', 'CAL_CANCELLATION_NOTICE', 'CAL_RSVP_FOLLOWUP', 'CAL_THANK_YOU_FOLLOWUP', 'CAL_COUNTY_LEAD_MISSING', 'CAL_MEDIA_CAPTURE_MISSING', 'CAL_COMMS_PREP_MISSING', 'CAL_STAFFING_GAP');

-- CreateEnum
CREATE TYPE "public"."CommsQueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."CommunicationCampaignChannel" AS ENUM ('SMS', 'EMAIL', 'MIXED');

-- CreateEnum
CREATE TYPE "public"."CommunicationCampaignType" AS ENUM ('BROADCAST', 'EVENT_REMINDER', 'FOLLOW_UP', 'FUNDRAISING', 'VOLUNTEER_RECRUITMENT', 'INTERNAL', 'EVENT_CANCELLATION', 'EVENT_THANK_YOU', 'RSVP_FOLLOWUP');

-- CreateEnum
CREATE TYPE "public"."CommunicationCampaignStatus" AS ENUM ('DRAFT', 'APPROVAL_NEEDED', 'APPROVED', 'QUEUED', 'SENDING', 'PAUSED', 'COMPLETE', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."CommunicationCampaignAutomationStatus" AS ENUM ('NONE', 'SHELL');

-- CreateEnum
CREATE TYPE "public"."CommunicationTemplateType" AS ENUM ('BROADCAST', 'EVENT_REMINDER', 'QUICK_REPLY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."CampaignRecipientSendStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED_SUPPRESSION', 'SKIPPED_NO_ADDRESS', 'CANCELED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "public"."CommunicationObjective" AS ENUM ('VOLUNTEER_RECRUITMENT', 'VOLUNTEER_ACTIVATION', 'EVENT_PROMOTION', 'EVENT_REMINDER', 'POST_EVENT_FOLLOWUP', 'RAPID_RESPONSE', 'CLARIFICATION', 'SUPPORTER_MOBILIZATION', 'DONOR_ENGAGEMENT', 'INTERNAL_COORDINATION', 'PRESS_OUTREACH', 'MEDIA_RESPONSE', 'GENERAL_UPDATE');

-- CreateEnum
CREATE TYPE "public"."CommsWorkbenchChannel" AS ENUM ('EMAIL', 'SMS', 'INTERNAL_NOTICE', 'PRESS_OUTREACH', 'PHONE_SCRIPT', 'TALKING_POINTS');

-- CreateEnum
CREATE TYPE "public"."CommunicationPlanStatus" AS ENUM ('DRAFT', 'PLANNING', 'READY_FOR_REVIEW', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."CommunicationDraftStatus" AS ENUM ('DRAFT', 'READY_FOR_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."CommunicationSendStatus" AS ENUM ('DRAFT', 'QUEUED', 'SCHEDULED', 'SENDING', 'SENT', 'PARTIALLY_SENT', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."MediaOutreachStatus" AS ENUM ('NEW', 'RESEARCHING', 'READY', 'CONTACTED', 'FOLLOW_UP_DUE', 'RESPONDED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."CommunicationReviewDecision" AS ENUM ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "public"."CommunicationVariantStatus" AS ENUM ('DRAFT', 'READY', 'READY_FOR_REVIEW', 'REJECTED', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."CommunicationVariantType" AS ENUM ('AUDIENCE_SEGMENT', 'COPY_ALT', 'CHANNEL_OVERRIDE', 'AB_TEST', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CommunicationSendType" AS ENUM ('BROADCAST', 'SCHEDULED', 'TEST', 'AD_HOC', 'RETRY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MediaOutreachItemType" AS ENUM ('INQUIRY', 'PITCH', 'FOLLOW_UP', 'OPPORTUNITY', 'CRISIS', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EmailWorkflowStatus" AS ENUM ('NEW', 'ENRICHED', 'IN_REVIEW', 'READY_TO_RESPOND', 'APPROVED', 'ESCALATED', 'SPAM', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."EmailWorkflowPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."EmailWorkflowSourceType" AS ENUM ('INBOUND_EMAIL', 'OUTBOUND_FOLLOWUP', 'WORKFLOW_TRIGGER', 'SEGMENT_TRIGGER', 'VOLUNTEER_TRIGGER', 'EVENT_TRIGGER', 'MANUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EmailWorkflowTriggerType" AS ENUM ('MANUAL', 'INBOUND_MESSAGE', 'OUTBOUND_DRAFT', 'SCHEDULED', 'MONITORING', 'INTAKE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EmailWorkflowIntent" AS ENUM ('QUESTION', 'VOLUNTEER_INTEREST', 'COMPLAINT', 'SUPPORT', 'MEDIA_INQUIRY', 'UNSUBSCRIBE', 'SPAM', 'FOLLOW_UP', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."EmailWorkflowTone" AS ENUM ('SUPPORTIVE', 'CURIOUS', 'CONFUSED', 'FRUSTRATED', 'HOSTILE', 'NEUTRAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."EmailWorkflowEscalationLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."EmailWorkflowSpamDisposition" AS ENUM ('UNKNOWN', 'CLEAN', 'SUSPECTED_SPAM', 'CONFIRMED_SPAM', 'SUPPRESSED');

-- CreateEnum
CREATE TYPE "public"."EmailContactProfileFactStatus" AS ENUM ('ACTIVE', 'SUPERSEDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "public"."EmailContactProfileFactSuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "public"."EmailAudienceHintStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."EmailAudienceDefinitionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."MessageStudioDraftStatus" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'IN_REVIEW', 'APPROVED_FOR_SEND_GOVERNANCE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."EmailContactImportBatchStatus" AS ENUM ('UPLOADED', 'PARSED', 'VALIDATED', 'READY_FOR_APPROVAL', 'APPROVED', 'COMMITTED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."EmailContactImportRowValidationStatus" AS ENUM ('VALID', 'WARNING', 'INVALID', 'DUPLICATE', 'EXISTING_MATCH');

-- CreateEnum
CREATE TYPE "public"."EmailContactImportDecisionType" AS ENUM ('APPROVE_BATCH', 'REJECT_BATCH', 'SKIP_ROW', 'INCLUDE_ROW', 'MERGE_WITH_EXISTING', 'CREATE_PROFILE');

-- CreateEnum
CREATE TYPE "public"."SendGridContactSyncStatus" AS ENUM ('NOT_SYNCED', 'READY', 'SYNCED', 'ERROR', 'SUPPRESSED');

-- CreateEnum
CREATE TYPE "public"."SendGridAudienceSyncStatus" AS ENUM ('NOT_SYNCED', 'READY', 'SYNCED', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."SendGridSuppressionType" AS ENUM ('UNSUBSCRIBE', 'GROUP_UNSUBSCRIBE', 'BOUNCE', 'SPAM_REPORT', 'MANUAL', 'INVALID');

-- CreateEnum
CREATE TYPE "public"."SendGridContactSyncRunStatus" AS ENUM ('PREVIEWED', 'APPROVED', 'SYNCED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."EmailSendExecutionStatus" AS ENUM ('DRAFT', 'PREFLIGHT_FAILED', 'READY_FOR_TEST', 'TEST_SENT', 'READY_FOR_FINAL_APPROVAL', 'FINAL_APPROVED', 'SENDING', 'SENT', 'PARTIAL_FAILURE', 'FAILED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."EmailSendExecutionSendType" AS ENUM ('SENDGRID_TEST', 'SENDGRID_BROADCAST', 'GMAIL_ONE_TO_ONE_FUTURE');

-- CreateEnum
CREATE TYPE "public"."EmailSendRecipientStatus" AS ENUM ('CANDIDATE', 'EXCLUDED_SUPPRESSED', 'EXCLUDED_MISSING_CONSENT', 'READY', 'SUBMITTED', 'DELIVERED', 'BOUNCED', 'UNSUBSCRIBED', 'SPAM_REPORTED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."EmailSendApprovalType" AS ENUM ('OPERATOR_REVIEW', 'COMMS_REVIEW', 'PRINCIPAL_REVIEW', 'LEGAL_REVIEW', 'FINANCE_REVIEW', 'FINAL_SEND_APPROVAL');

-- CreateEnum
CREATE TYPE "public"."EmailSendApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "public"."CommunicationRecipientStatus" AS ENUM ('PLANNED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'REPLIED', 'FAILED', 'BOUNCED', 'UNSUBSCRIBED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."CommunicationRecipientEventType" AS ENUM ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'REPLIED', 'FAILED', 'BOUNCED', 'UNSUBSCRIBED', 'OPTED_OUT_SMS', 'WEB_VISIT', 'FORM_SUBMITTED');

-- CreateEnum
CREATE TYPE "public"."CommsDeliveryHealthStatus" AS ENUM ('HEALTHY', 'SUPPRESSED', 'UNSUBSCRIBED', 'INVALID_EMAIL', 'INVALID_PHONE', 'HARD_BOUNCED', 'SMS_OPT_OUT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "public"."CommsPlanAudienceSegmentType" AS ENUM ('STATIC', 'DYNAMIC', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."CommsPlanAudienceSegmentStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."CommsPlanAudienceSegmentMemberSource" AS ENUM ('MANUAL', 'IMPORT', 'DYNAMIC_SNAPSHOT', 'API', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ExternalMediaSourceType" AS ENUM ('NEWSPAPER', 'NEWS_MAGAZINE', 'DIGITAL_LOCAL', 'TV', 'RADIO', 'BLOG', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ExternalMediaMentionType" AS ENUM ('NEWS_ARTICLE', 'EDITORIAL', 'OPINION', 'LETTER_TO_EDITOR', 'TV_WEB_STORY', 'CANDIDATE_LISTING', 'EVENT_RECAP', 'ENDORSEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ExternalMediaReviewStatus" AS ENUM ('PENDING', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ExternalMediaIngestMethod" AS ENUM ('RSS', 'SITEMAP', 'SEARCH_PAGE', 'MANUAL_SEED', 'HOMEPAGE_SECTION', 'TAG_PAGE', 'CATEGORY_PAGE');

-- CreateEnum
CREATE TYPE "public"."ExternalMediaMatchTier" AS ENUM ('DEFINITE', 'LIKELY', 'UNCERTAIN', 'NOT_RELEVANT');

-- CreateEnum
CREATE TYPE "public"."OppositionEntityType" AS ENUM ('CANDIDATE', 'OFFICEHOLDER', 'PAC', 'ORGANIZATION', 'DONOR', 'INFLUENCER', 'MEDIA_OUTLET', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."OppositionConfidence" AS ENUM ('VERIFIED', 'LIKELY', 'UNVERIFIED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "public"."OppositionReviewStatus" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'REVIEWED', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."OppositionSourceType" AS ENUM ('PUBLIC_FILING', 'LEGISLATIVE_RECORD', 'VIDEO', 'NEWS', 'WEBSITE', 'SOCIAL_MEDIA', 'USER_PROVIDED_DOCUMENT', 'OTHER');

-- DropForeignKey
ALTER TABLE "auth"."identities" DROP CONSTRAINT "identities_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."mfa_amr_claims" DROP CONSTRAINT "mfa_amr_claims_session_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."mfa_challenges" DROP CONSTRAINT "mfa_challenges_auth_factor_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."mfa_factors" DROP CONSTRAINT "mfa_factors_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."oauth_authorizations" DROP CONSTRAINT "oauth_authorizations_client_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."oauth_authorizations" DROP CONSTRAINT "oauth_authorizations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."oauth_consents" DROP CONSTRAINT "oauth_consents_client_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."oauth_consents" DROP CONSTRAINT "oauth_consents_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."one_time_tokens" DROP CONSTRAINT "one_time_tokens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_session_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."saml_providers" DROP CONSTRAINT "saml_providers_sso_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."saml_relay_states" DROP CONSTRAINT "saml_relay_states_flow_state_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."saml_relay_states" DROP CONSTRAINT "saml_relay_states_sso_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."sessions" DROP CONSTRAINT "sessions_oauth_client_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."sso_domains" DROP CONSTRAINT "sso_domains_sso_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."webauthn_challenges" DROP CONSTRAINT "webauthn_challenges_user_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."webauthn_credentials" DROP CONSTRAINT "webauthn_credentials_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ballot_items" DROP CONSTRAINT "ballot_items_geographic_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."candidates" DROP CONSTRAINT "candidates_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contest_partisan_index" DROP CONSTRAINT "contest_partisan_index_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."contests" DROP CONSTRAINT "contests_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."county_results" DROP CONSTRAINT "county_results_county_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."county_results" DROP CONSTRAINT "county_results_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."county_turnout" DROP CONSTRAINT "county_turnout_county_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."county_turnout" DROP CONSTRAINT "county_turnout_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."donations" DROP CONSTRAINT "donations_event_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."donations" DROP CONSTRAINT "donations_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."election_candidates" DROP CONSTRAINT "election_candidates_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."election_contests" DROP CONSTRAINT "election_contests_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."election_results" DROP CONSTRAINT "election_results_candidate_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."election_results" DROP CONSTRAINT "election_results_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."events" DROP CONSTRAINT "events_host_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."events" DROP CONSTRAINT "events_location_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."events" DROP CONSTRAINT "events_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."events" DROP CONSTRAINT "events_submission_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."external_records" DROP CONSTRAINT "external_records_source_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."geographic_units" DROP CONSTRAINT "geographic_units_parent_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."geography_leaders" DROP CONSTRAINT "geography_leaders_geographic_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."geography_leaders" DROP CONSTRAINT "geography_leaders_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."geography_leaders" DROP CONSTRAINT "geography_leaders_role_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ingestion_entities" DROP CONSTRAINT "ingestion_entities_ingestion_job_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ingestion_extractions" DROP CONSTRAINT "ingestion_extractions_ingestion_job_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ingestion_files" DROP CONSTRAINT "ingestion_files_ingestion_job_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ingestion_jobs" DROP CONSTRAINT "ingestion_jobs_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."ingestion_mapping_suggestions" DROP CONSTRAINT "ingestion_mapping_suggestions_ingestion_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ingestion_reviews" DROP CONSTRAINT "ingestion_reviews_ingestion_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ingestion_reviews" DROP CONSTRAINT "ingestion_reviews_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ingestion_write_events" DROP CONSTRAINT "ingestion_write_events_ingestion_entity_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."initiative_signatures" DROP CONSTRAINT "initiative_signatures_initiative_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."interactions" DROP CONSTRAINT "interactions_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."interactions" DROP CONSTRAINT "interactions_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."media_assets" DROP CONSTRAINT "media_assets_ingestion_job_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."media_assets" DROP CONSTRAINT "media_assets_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."media_entity_links" DROP CONSTRAINT "media_entity_links_media_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."media_tags" DROP CONSTRAINT "media_tags_media_asset_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_audience_members" DROP CONSTRAINT "message_audience_members_audience_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_events" DROP CONSTRAINT "message_events_queue_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."message_queue" DROP CONSTRAINT "message_queue_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizer_assignments" DROP CONSTRAINT "organizer_assignments_geographic_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizer_assignments" DROP CONSTRAINT "organizer_assignments_leader_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizing_targets" DROP CONSTRAINT "organizing_targets_assigned_to_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizing_targets" DROP CONSTRAINT "organizing_targets_geographic_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizing_targets" DROP CONSTRAINT "organizing_targets_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizing_unit_hierarchy" DROP CONSTRAINT "organizing_unit_hierarchy_child_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizing_unit_hierarchy" DROP CONSTRAINT "organizing_unit_hierarchy_parent_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizing_unit_memberships" DROP CONSTRAINT "organizing_unit_memberships_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizing_unit_memberships" DROP CONSTRAINT "organizing_unit_memberships_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizing_units" DROP CONSTRAINT "organizing_units_parent_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."organizing_units" DROP CONSTRAINT "organizing_units_unit_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."person_geography" DROP CONSTRAINT "person_geography_geographic_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."person_geography" DROP CONSTRAINT "person_geography_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."person_profiles" DROP CONSTRAINT "person_profiles_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."petition_signatures" DROP CONSTRAINT "petition_signatures_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."petition_signatures" DROP CONSTRAINT "petition_signatures_petition_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."results" DROP CONSTRAINT "results_candidate_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."results" DROP CONSTRAINT "results_contest_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."results" DROP CONSTRAINT "results_election_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."shifts" DROP CONSTRAINT "shifts_related_event_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."shifts" DROP CONSTRAINT "shifts_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_assigned_to_fkey";

-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_related_event_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_related_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."tasks" DROP CONSTRAINT "tasks_submission_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."training_certifications" DROP CONSTRAINT "training_certifications_path_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."training_enrollments" DROP CONSTRAINT "training_enrollments_path_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."training_events" DROP CONSTRAINT "training_events_module_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."training_modules" DROP CONSTRAINT "training_modules_course_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."training_path_modules" DROP CONSTRAINT "training_path_modules_module_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."training_path_modules" DROP CONSTRAINT "training_path_modules_path_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."training_progress" DROP CONSTRAINT "training_progress_module_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."training_records" DROP CONSTRAINT "training_records_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."turf_people" DROP CONSTRAINT "turf_people_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."turf_people" DROP CONSTRAINT "turf_people_turf_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."turfs" DROP CONSTRAINT "turfs_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."turfs" DROP CONSTRAINT "turfs_geographic_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_auth_methods" DROP CONSTRAINT "user_auth_methods_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_intake_submissions" DROP CONSTRAINT "volunteer_intake_submissions_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_profiles" DROP CONSTRAINT "volunteer_profiles_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."volunteer_sources" DROP CONSTRAINT "volunteer_sources_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."voter_profiles" DROP CONSTRAINT "voter_profiles_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_feature_flags" DROP CONSTRAINT "workspace_feature_flags_configured_by_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_feature_flags" DROP CONSTRAINT "workspace_feature_flags_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_geography_scope" DROP CONSTRAINT "workspace_geography_scope_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_geography_scope" DROP CONSTRAINT "workspace_geography_scope_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_members" DROP CONSTRAINT "workspace_members_invited_by_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_members" DROP CONSTRAINT "workspace_members_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_members" DROP CONSTRAINT "workspace_members_role_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_members" DROP CONSTRAINT "workspace_members_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspace_roles" DROP CONSTRAINT "workspace_roles_workspace_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspaces" DROP CONSTRAINT "workspaces_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."workspaces" DROP CONSTRAINT "workspaces_workspace_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."youth_profiles" DROP CONSTRAINT "youth_profiles_person_id_fkey";

-- DropIndex
DROP INDEX "public"."idx_submissions_created_at";

-- DropIndex
DROP INDEX "public"."idx_submissions_module";

-- AlterTable
ALTER TABLE "public"."counties" DROP CONSTRAINT "counties_pkey",
DROP COLUMN "created_at",
DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "featuredEventSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "heroEyebrow" TEXT,
ADD COLUMN     "heroIntro" TEXT,
ADD COLUMN     "leadBio" TEXT,
ADD COLUMN     "leadName" TEXT,
ADD COLUMN     "leadPhotoUrl" TEXT,
ADD COLUMN     "leadTitle" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "regionLabel" TEXT,
ADD COLUMN     "showOnStatewideMap" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "fips" SET NOT NULL,
ADD CONSTRAINT "counties_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."media_assets" DROP CONSTRAINT "media_assets_pkey",
DROP COLUMN "captured_at",
DROP COLUMN "context",
DROP COLUMN "created_at",
DROP COLUMN "ingestion_job_id",
DROP COLUMN "media_type",
DROP COLUMN "storage_path",
DROP COLUMN "uploaded_by",
ADD COLUMN     "alt" TEXT,
ADD COLUMN     "caption" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "kind" "public"."MediaKind" NOT NULL DEFAULT 'IMAGE',
ADD COLUMN     "originExternalId" TEXT,
ADD COLUMN     "originPlatform" "public"."ContentPlatform",
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ADD COLUMN     "usageNotes" TEXT,
ADD COLUMN     "width" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."submissions" DROP CONSTRAINT "submissions_pkey",
DROP COLUMN "created_at",
DROP COLUMN "module_id",
DROP COLUMN "processed",
DROP COLUMN "raw_data",
DROP COLUMN "source",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "structuredData" JSONB,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "auth"."audit_log_entries";

-- DropTable
DROP TABLE "auth"."custom_oauth_providers";

-- DropTable
DROP TABLE "auth"."flow_state";

-- DropTable
DROP TABLE "auth"."identities";

-- DropTable
DROP TABLE "auth"."instances";

-- DropTable
DROP TABLE "auth"."mfa_amr_claims";

-- DropTable
DROP TABLE "auth"."mfa_challenges";

-- DropTable
DROP TABLE "auth"."mfa_factors";

-- DropTable
DROP TABLE "auth"."oauth_authorizations";

-- DropTable
DROP TABLE "auth"."oauth_client_states";

-- DropTable
DROP TABLE "auth"."oauth_clients";

-- DropTable
DROP TABLE "auth"."oauth_consents";

-- DropTable
DROP TABLE "auth"."one_time_tokens";

-- DropTable
DROP TABLE "auth"."refresh_tokens";

-- DropTable
DROP TABLE "auth"."saml_providers";

-- DropTable
DROP TABLE "auth"."saml_relay_states";

-- DropTable
DROP TABLE "auth"."schema_migrations";

-- DropTable
DROP TABLE "auth"."sessions";

-- DropTable
DROP TABLE "auth"."sso_domains";

-- DropTable
DROP TABLE "auth"."sso_providers";

-- DropTable
DROP TABLE "auth"."users";

-- DropTable
DROP TABLE "auth"."webauthn_challenges";

-- DropTable
DROP TABLE "auth"."webauthn_credentials";

-- DropTable
DROP TABLE "public"."ar02_voter_dem_lean";

-- DropTable
DROP TABLE "public"."ar02_voter_race";

-- DropTable
DROP TABLE "public"."ar02_voters";

-- DropTable
DROP TABLE "public"."ballot_initiatives";

-- DropTable
DROP TABLE "public"."ballot_items";

-- DropTable
DROP TABLE "public"."bls_county_economics";

-- DropTable
DROP TABLE "public"."candidates";

-- DropTable
DROP TABLE "public"."census_block_groups";

-- DropTable
DROP TABLE "public"."census_demographics";

-- DropTable
DROP TABLE "public"."census_tracts";

-- DropTable
DROP TABLE "public"."civic_engagement_index";

-- DropTable
DROP TABLE "public"."contact_origins";

-- DropTable
DROP TABLE "public"."contact_voter_matches";

-- DropTable
DROP TABLE "public"."contacts";

-- DropTable
DROP TABLE "public"."contest_partisan_index";

-- DropTable
DROP TABLE "public"."contests";

-- DropTable
DROP TABLE "public"."county_campaign_targets";

-- DropTable
DROP TABLE "public"."county_results";

-- DropTable
DROP TABLE "public"."county_turnout";

-- DropTable
DROP TABLE "public"."donations";

-- DropTable
DROP TABLE "public"."election_candidates";

-- DropTable
DROP TABLE "public"."election_contests";

-- DropTable
DROP TABLE "public"."election_results";

-- DropTable
DROP TABLE "public"."elections";

-- DropTable
DROP TABLE "public"."event_notifications";

-- DropTable
DROP TABLE "public"."event_requests";

-- DropTable
DROP TABLE "public"."events";

-- DropTable
DROP TABLE "public"."external_intelligence_sources";

-- DropTable
DROP TABLE "public"."external_records";

-- DropTable
DROP TABLE "public"."followups";

-- DropTable
DROP TABLE "public"."geographic_scores";

-- DropTable
DROP TABLE "public"."geographic_units";

-- DropTable
DROP TABLE "public"."geography_leaders";

-- DropTable
DROP TABLE "public"."ingestion_entities";

-- DropTable
DROP TABLE "public"."ingestion_extractions";

-- DropTable
DROP TABLE "public"."ingestion_files";

-- DropTable
DROP TABLE "public"."ingestion_jobs";

-- DropTable
DROP TABLE "public"."ingestion_mapping_suggestions";

-- DropTable
DROP TABLE "public"."ingestion_reviews";

-- DropTable
DROP TABLE "public"."ingestion_write_events";

-- DropTable
DROP TABLE "public"."initiative_signatures";

-- DropTable
DROP TABLE "public"."intelligence_links";

-- DropTable
DROP TABLE "public"."interactions";

-- DropTable
DROP TABLE "public"."leadership_roles";

-- DropTable
DROP TABLE "public"."locations";

-- DropTable
DROP TABLE "public"."media_entity_links";

-- DropTable
DROP TABLE "public"."media_tags";

-- DropTable
DROP TABLE "public"."message_audience_members";

-- DropTable
DROP TABLE "public"."message_audiences";

-- DropTable
DROP TABLE "public"."message_campaigns";

-- DropTable
DROP TABLE "public"."message_events";

-- DropTable
DROP TABLE "public"."message_queue";

-- DropTable
DROP TABLE "public"."message_templates";

-- DropTable
DROP TABLE "public"."organization_types";

-- DropTable
DROP TABLE "public"."organizations";

-- DropTable
DROP TABLE "public"."organizer_assignments";

-- DropTable
DROP TABLE "public"."organizing_targets";

-- DropTable
DROP TABLE "public"."organizing_unit_hierarchy";

-- DropTable
DROP TABLE "public"."organizing_unit_memberships";

-- DropTable
DROP TABLE "public"."organizing_unit_types";

-- DropTable
DROP TABLE "public"."organizing_units";

-- DropTable
DROP TABLE "public"."path_to_victory";

-- DropTable
DROP TABLE "public"."people";

-- DropTable
DROP TABLE "public"."person_geography";

-- DropTable
DROP TABLE "public"."person_profiles";

-- DropTable
DROP TABLE "public"."petition_signatures";

-- DropTable
DROP TABLE "public"."petitions";

-- DropTable
DROP TABLE "public"."precinct_scores";

-- DropTable
DROP TABLE "public"."profiles";

-- DropTable
DROP TABLE "public"."results";

-- DropTable
DROP TABLE "public"."runoff_fracture_index";

-- DropTable
DROP TABLE "public"."shifts";

-- DropTable
DROP TABLE "public"."statewide_win_targets";

-- DropTable
DROP TABLE "public"."target_universes";

-- DropTable
DROP TABLE "public"."tasks";

-- DropTable
DROP TABLE "public"."telemetry_events";

-- DropTable
DROP TABLE "public"."training_certifications";

-- DropTable
DROP TABLE "public"."training_courses";

-- DropTable
DROP TABLE "public"."training_enrollments";

-- DropTable
DROP TABLE "public"."training_events";

-- DropTable
DROP TABLE "public"."training_modules";

-- DropTable
DROP TABLE "public"."training_path_modules";

-- DropTable
DROP TABLE "public"."training_paths";

-- DropTable
DROP TABLE "public"."training_progress";

-- DropTable
DROP TABLE "public"."training_records";

-- DropTable
DROP TABLE "public"."turf_people";

-- DropTable
DROP TABLE "public"."turfs";

-- DropTable
DROP TABLE "public"."user_auth_methods";

-- DropTable
DROP TABLE "public"."users";

-- DropTable
DROP TABLE "public"."volunteer_intake_submissions";

-- DropTable
DROP TABLE "public"."volunteer_profiles";

-- DropTable
DROP TABLE "public"."volunteer_signups";

-- DropTable
DROP TABLE "public"."volunteer_sources";

-- DropTable
DROP TABLE "public"."volunteers";

-- DropTable
DROP TABLE "public"."voter_block_group_map";

-- DropTable
DROP TABLE "public"."voter_geocoded";

-- DropTable
DROP TABLE "public"."voter_import_batches";

-- DropTable
DROP TABLE "public"."voter_party_model";

-- DropTable
DROP TABLE "public"."voter_profiles";

-- DropTable
DROP TABLE "public"."voter_registry";

-- DropTable
DROP TABLE "public"."voter_scores";

-- DropTable
DROP TABLE "public"."voter_vote_history";

-- DropTable
DROP TABLE "public"."voter_vote_history_raw";

-- DropTable
DROP TABLE "public"."voters";

-- DropTable
DROP TABLE "public"."workspace_feature_flags";

-- DropTable
DROP TABLE "public"."workspace_geography_scope";

-- DropTable
DROP TABLE "public"."workspace_members";

-- DropTable
DROP TABLE "public"."workspace_roles";

-- DropTable
DROP TABLE "public"."workspace_types";

-- DropTable
DROP TABLE "public"."workspaces";

-- DropTable
DROP TABLE "public"."youth_profiles";

-- DropEnum
DROP TYPE "auth"."aal_level";

-- DropEnum
DROP TYPE "auth"."code_challenge_method";

-- DropEnum
DROP TYPE "auth"."factor_status";

-- DropEnum
DROP TYPE "auth"."factor_type";

-- DropEnum
DROP TYPE "auth"."oauth_authorization_status";

-- DropEnum
DROP TYPE "auth"."oauth_client_type";

-- DropEnum
DROP TYPE "auth"."oauth_registration_type";

-- DropEnum
DROP TYPE "auth"."oauth_response_type";

-- DropEnum
DROP TYPE "auth"."one_time_token_type";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "zip" TEXT,
    "county" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "linkedVoterRecordId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ComplianceDocument" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "documentType" "public"."ComplianceDocumentType" NOT NULL DEFAULT 'OTHER',
    "reportingPeriod" TEXT,
    "periodDate" TIMESTAMP(3),
    "notes" TEXT,
    "approvedForAiReference" BOOLEAN NOT NULL DEFAULT false,
    "uploadedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FinancialTransaction" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "transactionType" "public"."FinancialTransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceType" "public"."FinancialSourceType" NOT NULL,
    "sourceId" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "relatedUserId" TEXT,
    "relatedEventId" TEXT,
    "notes" TEXT,
    "status" "public"."FinancialTransactionStatus" NOT NULL DEFAULT 'DRAFT',
    "confirmedByUserId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FieldUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."FieldUnitType" NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FieldUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FieldAssignment" (
    "id" TEXT NOT NULL,
    "fieldUnitId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "userId" TEXT,
    "positionSeatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FieldAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BudgetPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "public"."BudgetPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BudgetLine" (
    "id" TEXT NOT NULL,
    "budgetPlanId" TEXT NOT NULL,
    "costBearingWireKind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "plannedAmount" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PositionSeat" (
    "id" TEXT NOT NULL,
    "positionKey" TEXT NOT NULL,
    "userId" TEXT,
    "status" "public"."PositionSeatStatus" NOT NULL DEFAULT 'VACANT',
    "actingForPositionKey" TEXT,
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PositionSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContactPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "communicationThreadId" TEXT,
    "emailOptInStatus" "public"."EmailOptInStatus" NOT NULL DEFAULT 'UNKNOWN',
    "smsOptInStatus" "public"."SmsOptInStatus" NOT NULL DEFAULT 'UNKNOWN',
    "globalUnsubscribeAt" TIMESTAMP(3),
    "smsOptOutAt" TIMESTAMP(3),
    "sendgridSuppressionState" JSONB DEFAULT '{}',
    "twilioOptOutState" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VolunteerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "availability" TEXT,
    "skills" TEXT,
    "leadershipInterest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VolunteerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Commitment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowIntake" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT,
    "assignedUserId" TEXT,
    "countyId" TEXT,
    "status" "public"."WorkflowIntakeStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT,
    "source" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowIntake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventRequest" (
    "id" TEXT NOT NULL,
    "workflowIntakeId" TEXT NOT NULL,
    "campaignEventId" TEXT,
    "status" "public"."EventRequestStatus" NOT NULL DEFAULT 'OPEN',
    "requestedStartAt" TIMESTAMP(3),
    "requestedEndAt" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "locationName" TEXT,
    "address" TEXT,
    "requestDetails" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowAction" (
    "id" TEXT NOT NULL,
    "workflowIntakeId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "kind" "public"."WorkflowActionKind" NOT NULL DEFAULT 'OTHER',
    "fromStatus" "public"."WorkflowIntakeStatus",
    "toStatus" "public"."WorkflowIntakeStatus",
    "summary" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialContentItem" (
    "id" TEXT NOT NULL,
    "workflowIntakeId" TEXT,
    "campaignEventId" TEXT,
    "kind" "public"."SocialContentKind" NOT NULL DEFAULT 'OTHER',
    "status" "public"."SocialContentStatus" NOT NULL DEFAULT 'DRAFT',
    "messageToneMode" "public"."SocialMessageToneMode",
    "messageTacticMode" "public"."SocialMessageTacticMode",
    "title" TEXT,
    "bodyCopy" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnalyticsRecommendationOutcome" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'analytics',
    "recommendationType" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "heuristicVersion" TEXT NOT NULL DEFAULT 'v1',
    "status" "public"."AnalyticsRecommendationOutcomeStatus" NOT NULL DEFAULT 'GENERATED',
    "dateRangeStart" TIMESTAMP(3) NOT NULL,
    "dateRangeEnd" TIMESTAMP(3) NOT NULL,
    "platform" "public"."SocialPlatform",
    "contentKind" "public"."SocialContentKind",
    "toneMode" "public"."SocialMessageToneMode",
    "eventId" TEXT,
    "sourceSocialContentItemId" TEXT,
    "provenanceJson" JSONB NOT NULL DEFAULT '{}',
    "createdSocialContentItemId" TEXT,
    "createdWorkflowIntakeId" TEXT,
    "executedSocialContentItemId" TEXT,
    "evaluatedAt" TIMESTAMP(3),
    "outcomeJson" JSONB,
    "notes" TEXT,

    CONSTRAINT "AnalyticsRecommendationOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialContentDraft" (
    "id" TEXT NOT NULL,
    "socialContentItemId" TEXT NOT NULL,
    "title" TEXT,
    "sourceRoute" TEXT,
    "sourceIntent" TEXT,
    "bodyCopy" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "isApplied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialContentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialPlatformVariant" (
    "id" TEXT NOT NULL,
    "socialContentItemId" TEXT NOT NULL,
    "socialAccountId" TEXT,
    "platform" "public"."SocialPlatform" NOT NULL,
    "status" "public"."SocialVariantStatus" NOT NULL DEFAULT 'DRAFT',
    "copyText" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "externalPostId" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPlatformVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialPerformanceSnapshot" (
    "id" TEXT NOT NULL,
    "socialContentItemId" TEXT NOT NULL,
    "socialPlatformVariantId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saves" INTEGER,
    "clickThroughs" INTEGER,
    "clickThroughRate" DOUBLE PRECISION,
    "videoCompletionRate" DOUBLE PRECISION,
    "engagementQualityScore" DOUBLE PRECISION,
    "dominantSentiment" "public"."SocialSentimentType",
    "sentimentBreakdownJson" JSONB DEFAULT '{}',
    "conversionCampaignEventId" TEXT,
    "volunteerLeadCount" INTEGER,
    "dataSource" "public"."SocialPerformanceDataSource" NOT NULL DEFAULT 'MANUAL',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPerformanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialContentStrategicInsight" (
    "id" TEXT NOT NULL,
    "socialContentItemId" TEXT NOT NULL,
    "timingInsight" TEXT,
    "tonePerformance" TEXT,
    "retentionSignal" TEXT,
    "conversionSignal" TEXT,
    "aiCommentClassifyStub" TEXT,
    "aiSummarizePerformanceStub" TEXT,
    "aiSuggestImprovementsStub" TEXT,
    "lastAiRunAt" TIMESTAMP(3),
    "recommendedNextTone" "public"."SocialMessageToneMode",
    "recommendedBestWindow" TEXT,
    "recommendedFollowupType" "public"."SocialStrategicFollowupType" NOT NULL DEFAULT 'NONE',
    "recommendedCountyFocus" TEXT,
    "recommendedCtaType" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialContentStrategicInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConversationWatchlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ConversationWatchlistStatus" NOT NULL DEFAULT 'ACTIVE',
    "filterSpec" JSONB NOT NULL DEFAULT '{}',
    "countyId" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationWatchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConversationItem" (
    "id" TEXT NOT NULL,
    "sourceKind" "public"."ConversationSourceKind" NOT NULL,
    "externalKey" TEXT,
    "publicPermalink" TEXT,
    "channel" TEXT NOT NULL,
    "title" TEXT,
    "bodyText" TEXT NOT NULL,
    "signalActorType" "public"."ConversationSignalActorType" NOT NULL DEFAULT 'UNKNOWN',
    "publishedAt" TIMESTAMP(3),
    "countyId" TEXT,
    "watchlistId" TEXT,
    "status" "public"."ConversationItemStatus" NOT NULL DEFAULT 'NEW',
    "rawMetadata" JSONB DEFAULT '{}',
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConversationAnalysis" (
    "id" TEXT NOT NULL,
    "conversationItemId" TEXT NOT NULL,
    "summary" TEXT,
    "classification" "public"."ConversationClassification" NOT NULL DEFAULT 'UNKNOWN',
    "sentiment" "public"."ConversationSentimentLabel" NOT NULL DEFAULT 'UNKNOWN',
    "urgency" "public"."ConversationUrgency" NOT NULL DEFAULT 'MEDIUM',
    "suggestedTone" "public"."ConversationSuggestedTone" NOT NULL DEFAULT 'FACTUAL',
    "issueTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "countyInferenceNote" TEXT,
    "suggestedAction" TEXT,
    "confidenceJson" JSONB DEFAULT '{}',
    "analyzerVersion" TEXT,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConversationCluster" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" "public"."ConversationClusterStatus" NOT NULL DEFAULT 'ACTIVE',
    "clusterKey" TEXT,
    "countyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConversationClusterItem" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "conversationItemId" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationClusterItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConversationOpportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" "public"."ConversationOpportunityStatus" NOT NULL DEFAULT 'OPEN',
    "urgency" "public"."ConversationUrgency" NOT NULL DEFAULT 'MEDIUM',
    "suggestedTone" "public"."ConversationSuggestedTone" NOT NULL DEFAULT 'FACTUAL',
    "actionTemplate" TEXT,
    "countyId" TEXT,
    "primaryConversationItemId" TEXT,
    "clusterId" TEXT,
    "workflowIntakeId" TEXT,
    "socialContentItemId" TEXT,
    "createdByUserId" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialContentMediaRef" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "socialContentItemId" TEXT NOT NULL,
    "socialPlatformVariantId" TEXT,
    "purpose" "public"."SocialContentMediaRefPurpose" NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,

    CONSTRAINT "SocialContentMediaRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialAccount" (
    "id" TEXT NOT NULL,
    "platform" "public"."SocialPlatform" NOT NULL,
    "label" TEXT NOT NULL,
    "handle" TEXT,
    "externalId" TEXT,
    "profileUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SearchChunk" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payload" JSONB,
    "path" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SyncedPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'substack',
    "feedGuid" TEXT,
    "slug" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "featuredImageUrl" TEXT,
    "tagsFromFeed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "localCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "localTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "issueTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "countySlug" TEXT,
    "countyFips" TEXT,
    "city" TEXT,
    "campaignPhase" TEXT,
    "contentSeries" TEXT,
    "playlistId" TEXT,
    "featuredWeight" INTEGER,
    "contentKind" "public"."ContentHubKind",
    "featuredRoadPreview" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "teaserOverride" TEXT,
    "heroMediaId" TEXT,
    "displayMode" "public"."BlogDisplayMode" NOT NULL DEFAULT 'SUMMARY_LINK',
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "showOnBlogLanding" BOOLEAN NOT NULL DEFAULT true,
    "rawItem" JSONB,

    CONSTRAINT "SyncedPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminContentBlock" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pageKey" TEXT NOT NULL,
    "blockKey" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "label" TEXT,

    CONSTRAINT "AdminContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomepageConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "hero" JSONB,
    "sectionOrder" JSONB,
    "heardItems" JSONB,
    "movementBeliefs" JSONB,
    "pathwayCards" JSONB,
    "splitDemocracy" JSONB,
    "splitLabor" JSONB,
    "arkansasBand" JSONB,
    "quoteBand" JSONB,
    "finalCta" JSONB,
    "featuredStorySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredEditorialSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredSyncedPostSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredExplainerSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredHomepageVideoInboundId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentItemOverride" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "collection" "public"."ContentCollection" NOT NULL,
    "slug" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "teaserOverride" TEXT,
    "summaryOverride" TEXT,
    "heroMediaId" TEXT,

    CONSTRAINT "ContentItemOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "substackFeedUrl" TEXT,
    "canonicalSiteUrlNote" TEXT,
    "adminNotes" TEXT,
    "lastSubstackSyncAt" TIMESTAMP(3),
    "lastSubstackSyncOk" BOOLEAN,
    "lastSubstackSyncError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlatformConnection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "platform" "public"."ContentPlatform" NOT NULL,
    "status" "public"."PlatformConnectionStatus" NOT NULL DEFAULT 'INACTIVE',
    "externalAccountId" TEXT,
    "accountName" TEXT,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "metadata" JSONB,

    CONSTRAINT "PlatformConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InboundContentItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourcePlatform" "public"."ContentPlatform" NOT NULL,
    "sourceType" "public"."InboundSourceType" NOT NULL DEFAULT 'ARTICLE',
    "externalId" TEXT NOT NULL,
    "authorName" TEXT,
    "title" TEXT,
    "body" TEXT,
    "excerpt" TEXT,
    "canonicalUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "mediaAssetId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "issueTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "countySlug" TEXT,
    "countyFips" TEXT,
    "city" TEXT,
    "campaignPhase" TEXT,
    "contentSeries" TEXT,
    "playlistId" TEXT,
    "featuredWeight" INTEGER,
    "contentKind" "public"."ContentHubKind",
    "siteHidden" BOOLEAN NOT NULL DEFAULT false,
    "metrics" JSONB,
    "rawPayload" JSONB,
    "syncTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStatus" "public"."InboundReviewStatus" NOT NULL DEFAULT 'PENDING',
    "visibleOnUpdatesPage" BOOLEAN NOT NULL DEFAULT false,
    "visibleOnHomepageRail" BOOLEAN NOT NULL DEFAULT false,
    "routeToBlog" BOOLEAN NOT NULL DEFAULT false,
    "storySeed" BOOLEAN NOT NULL DEFAULT false,
    "editorialSeed" BOOLEAN NOT NULL DEFAULT false,
    "publishCandidate" BOOLEAN NOT NULL DEFAULT false,
    "syncedPostId" TEXT,

    CONSTRAINT "InboundContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentDecision" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inboundItemId" TEXT NOT NULL,
    "status" "public"."ContentDecisionStatus" NOT NULL,
    "destination" "public"."ContentRoutingDestination" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "editor" TEXT,

    CONSTRAINT "ContentDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlatformMetricSnapshot" (
    "id" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platformConnectionId" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,

    CONSTRAINT "PlatformMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OwnedMediaAsset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageBackend" "public"."OwnedMediaStorageBackend" NOT NULL DEFAULT 'LOCAL_DISK',
    "publicUrl" TEXT,
    "thumbStorageKey" TEXT,
    "thumbPublicUrl" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "kind" "public"."OwnedMediaKind" NOT NULL,
    "role" "public"."OwnedMediaRole" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationSeconds" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "capturedAt" TIMESTAMP(3),
    "eventDate" TIMESTAMP(3),
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "geoSource" "public"."GeoMetadataSource" NOT NULL DEFAULT 'NONE',
    "geoConfidence" DOUBLE PRECISION,
    "needsGeoReview" BOOLEAN NOT NULL DEFAULT false,
    "countySlug" TEXT,
    "countyFips" TEXT,
    "countyId" TEXT,
    "city" TEXT,
    "issueTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "campaignPhase" TEXT,
    "contentSeries" TEXT,
    "speakerName" TEXT,
    "metadataJson" JSONB,
    "sourceType" "public"."OwnedMediaSourceType" NOT NULL DEFAULT 'DIRECT_UPLOAD',
    "reviewStatus" "public"."OwnedMediaReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "consentCampaignUse" BOOLEAN,
    "uploaderName" TEXT,
    "uploaderEmail" TEXT,
    "operatorNotes" TEXT,
    "captionDraft" TEXT,
    "shootDateOverride" TIMESTAMP(3),
    "linkedCampaignEventId" TEXT,
    "enrichmentMetadata" JSONB,
    "transcriptJobStatus" "public"."TranscriptionJobStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
    "transcriptionLastError" TEXT,
    "ingestContentSha256" TEXT,
    "localIngestRelativePath" TEXT,
    "indexSourceLabel" TEXT,
    "originalFileName" TEXT,
    "canonicalFileName" TEXT,
    "rating" INTEGER,
    "pickStatus" "public"."OwnedMediaPickStatus" NOT NULL DEFAULT 'UNRATED',
    "colorLabel" "public"."OwnedMediaColorLabel" NOT NULL DEFAULT 'NONE',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "stackGroupId" TEXT,
    "parentAssetId" TEXT,
    "rootAssetId" TEXT,
    "derivativeType" "public"."OwnedMediaDerivativeType" NOT NULL DEFAULT 'ORIGINAL',
    "approvedForPress" BOOLEAN NOT NULL DEFAULT false,
    "approvedForPublicSite" BOOLEAN NOT NULL DEFAULT false,
    "staffReviewNotes" TEXT,
    "importDuplicateNote" TEXT,
    "approvedForSocial" BOOLEAN NOT NULL DEFAULT false,
    "mediaIngestBatchId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "reviewNotes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedMediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OwnedMediaAnnotation" (
    "id" TEXT NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "noteType" "public"."OwnedMediaNoteType" NOT NULL,
    "noteText" TEXT NOT NULL,
    "tagsJson" JSONB,
    "isSearchable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedMediaAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OwnedMediaTranscript" (
    "id" TEXT NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "transcriptText" TEXT NOT NULL,
    "source" "public"."TranscriptSource" NOT NULL,
    "language" TEXT,
    "confidence" DOUBLE PRECISION,
    "segmentsJson" JSONB,
    "reviewStatus" "public"."TranscriptReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedMediaTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OwnedMediaQuoteCandidate" (
    "id" TEXT NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "transcriptId" TEXT,
    "quoteText" TEXT NOT NULL,
    "startSeconds" DOUBLE PRECISION,
    "endSeconds" DOUBLE PRECISION,
    "issueTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "countySlug" TEXT,
    "quoteType" "public"."QuoteCandidateType" NOT NULL DEFAULT 'SUGGESTED',
    "reviewStatus" "public"."QuoteReviewStatus" NOT NULL DEFAULT 'PENDING',
    "featuredWeight" INTEGER,
    "enrichmentMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedMediaQuoteCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ElectionResultSource" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "sourceType" "public"."ElectionResultSourceType" NOT NULL DEFAULT 'UNKNOWN',
    "electionName" TEXT NOT NULL,
    "electionDate" TIMESTAMP(3) NOT NULL,
    "electionIdExternal" TEXT,
    "isOfficial" BOOLEAN,
    "parserVariant" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionResultSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ElectionContestResult" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "contestName" TEXT NOT NULL,
    "contestType" TEXT,
    "jurisdictionLevel" TEXT,
    "totalVotes" INTEGER,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionContestResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ElectionCountyResult" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "contestId" TEXT,
    "countyId" TEXT,
    "countyNameRaw" TEXT NOT NULL,
    "countyFips" TEXT,
    "totalVotes" INTEGER,
    "registeredVoters" INTEGER,
    "ballotsCast" INTEGER,
    "votePercent" DECIMAL(9,4),
    "reportingPercent" DECIMAL(9,4),
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionCountyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ElectionCandidateResult" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "countyResultId" TEXT,
    "candidateName" TEXT NOT NULL,
    "partyName" TEXT,
    "totalVotes" INTEGER NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionCandidateResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ElectionPrecinctResult" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "contestId" TEXT,
    "countyId" TEXT,
    "countyNameRaw" TEXT,
    "countyFips" TEXT,
    "precinctNameRaw" TEXT,
    "precinctExternalId" TEXT,
    "totalVotes" INTEGER,
    "registeredVoters" INTEGER,
    "ballotsCast" INTEGER,
    "votePercent" DECIMAL(9,4),
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionPrecinctResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ElectionPrecinctCandidateResult" (
    "id" TEXT NOT NULL,
    "precinctResultId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "partyName" TEXT,
    "totalVotes" INTEGER NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionPrecinctCandidateResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CountyCampaignStats" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "registrationGoal" INTEGER,
    "newRegistrationsSinceBaseline" INTEGER,
    "registrationBaselineDate" TIMESTAMP(3),
    "volunteerTarget" INTEGER,
    "volunteerCount" INTEGER,
    "campaignVisits" INTEGER,
    "dataPipelineSource" TEXT,
    "pipelineLastSyncAt" TIMESTAMP(3),
    "pipelineError" TEXT,
    "reviewStatus" "public"."CountyContentReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountyCampaignStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CountyPublicDemographics" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "population" INTEGER,
    "votingAgePopulation" INTEGER,
    "medianHouseholdIncome" INTEGER,
    "povertyRatePercent" DOUBLE PRECISION,
    "bachelorsOrHigherPercent" DOUBLE PRECISION,
    "laborEmploymentNote" TEXT,
    "ageBandsJson" JSONB,
    "raceEthnicityJson" JSONB,
    "educationJson" JSONB,
    "employmentJson" JSONB,
    "unemploymentRatePercent" DOUBLE PRECISION,
    "blsIndustryMixJson" JSONB,
    "source" "public"."PublicDemographicsSource" NOT NULL DEFAULT 'CENSUS_ACS',
    "sourceDetail" TEXT,
    "asOfYear" INTEGER,
    "fetchedAt" TIMESTAMP(3),
    "reviewStatus" "public"."CountyContentReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountyPublicDemographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CountyRegistrationSnapshot" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "sourceFile" TEXT,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "totalRegistered" INTEGER NOT NULL,
    "activeRegistered" INTEGER,
    "inactiveRegistered" INTEGER,
    "metadataJson" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CountyRegistrationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CountyStrategyKpi" (
    "id" TEXT NOT NULL,
    "countyId" TEXT,
    "countyName" TEXT,
    "metricKey" TEXT NOT NULL,
    "metricValue" TEXT,
    "metricNumber" DOUBLE PRECISION,
    "metricLabel" TEXT,
    "source" TEXT,
    "confidence" TEXT,
    "metadataJson" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountyStrategyKpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CountyElectedOfficial" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "jurisdiction" "public"."ElectedJurisdiction" NOT NULL,
    "officeTitle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "party" TEXT,
    "termEnd" TEXT,
    "sourceUrl" TEXT,
    "sourceLabel" TEXT,
    "externalId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "reviewStatus" "public"."CountyContentReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountyElectedOfficial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoterFileSnapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileReceivedAt" TIMESTAMP(3),
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileAsOfDate" TIMESTAMP(3) NOT NULL,
    "previousSnapshotId" TEXT,
    "sourceFilename" TEXT,
    "sourceFileHash" TEXT,
    "rowCountProcessed" INTEGER,
    "status" "public"."VoterFileIngestStatus" NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "operatorNotes" TEXT,

    CONSTRAINT "VoterFileSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CountyVoterMetrics" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "countySlug" TEXT NOT NULL,
    "voterFileSnapshotId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "registrationBaselineDate" TIMESTAMP(3) NOT NULL,
    "totalRegisteredCount" INTEGER,
    "newRegistrationsSinceBaseline" INTEGER NOT NULL DEFAULT 0,
    "newRegistrationsSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
    "droppedSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
    "netChangeSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
    "countyGoal" INTEGER,
    "progressPercent" DOUBLE PRECISION,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStatus" "public"."CountyContentReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',

    CONSTRAINT "CountyVoterMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoterRecord" (
    "id" TEXT NOT NULL,
    "voterFileKey" TEXT NOT NULL,
    "countyFips" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "countySlug" TEXT NOT NULL,
    "city" TEXT,
    "precinct" TEXT,
    "registrationDate" TIMESTAMP(3),
    "firstSeenSnapshotId" TEXT NOT NULL,
    "lastSeenSnapshotId" TEXT NOT NULL,
    "updatedFromSnapshotId" TEXT,
    "droppedAtSnapshotId" TEXT,
    "droppedOffAt" TIMESTAMP(3),
    "inLatestCompletedFile" BOOLEAN NOT NULL DEFAULT true,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone10" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoterElectionParticipation" (
    "id" TEXT NOT NULL,
    "voterRecordId" TEXT NOT NULL,
    "contestKey" TEXT NOT NULL,
    "participated" BOOLEAN NOT NULL,
    "primaryBallotParty" TEXT,
    "provenance" "public"."VoterParticipationProvenance" NOT NULL DEFAULT 'VENDOR_VOTER_FILE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterElectionParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoterSignal" (
    "id" TEXT NOT NULL,
    "voterRecordId" TEXT,
    "userId" TEXT,
    "relationalContactId" TEXT,
    "signalKind" "public"."VoterSignalKind" NOT NULL,
    "signalSource" "public"."VoterSignalSource" NOT NULL,
    "signalStrength" "public"."VoterSignalStrength" NOT NULL,
    "signalDate" TIMESTAMP(3),
    "confidence" "public"."ModelConfidence" NOT NULL,
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoterModelClassification" (
    "id" TEXT NOT NULL,
    "voterRecordId" TEXT NOT NULL,
    "classification" "public"."VoterClassification" NOT NULL,
    "confidence" "public"."ModelConfidence" NOT NULL,
    "sourceSummary" TEXT,
    "modelVersion" TEXT NOT NULL DEFAULT 'voter-model-v1',
    "generatedBy" "public"."ModelGeneratedBy" NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "overriddenByUserId" TEXT,
    "overriddenAt" TIMESTAMP(3),
    "overrideReason" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterModelClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoterInteraction" (
    "id" TEXT NOT NULL,
    "voterRecordId" TEXT,
    "relationalContactId" TEXT,
    "contactedByUserId" TEXT,
    "relatedVolunteerUserId" TEXT,
    "interactionType" "public"."VoterInteractionType" NOT NULL,
    "interactionChannel" "public"."VoterInteractionChannel" NOT NULL,
    "interactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supportLevel" "public"."VoterSupportLevel",
    "registrationChecked" BOOLEAN NOT NULL DEFAULT false,
    "registrationStatusAtContact" TEXT,
    "wantsFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpNotes" TEXT,
    "votePlanStatus" "public"."VotePlanStatus",
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RelationalContact" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "matchedVoterRecordId" TEXT,
    "countyId" TEXT,
    "fieldUnitId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "relationshipType" "public"."RelationalRelationshipType" NOT NULL,
    "relationshipCloseness" "public"."RelationalRelationshipCloseness",
    "matchStatus" "public"."RelationalMatchStatus" NOT NULL DEFAULT 'UNMATCHED',
    "matchConfidence" "public"."ModelConfidence",
    "organizingStatus" "public"."RelationalOrganizingStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "supportLevel" "public"."VoterSupportLevel",
    "isCoreFive" BOOLEAN NOT NULL DEFAULT false,
    "powerOfFiveSlot" INTEGER,
    "lastContactedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelationalContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoterVotePlan" (
    "id" TEXT NOT NULL,
    "voterRecordId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "planStatus" "public"."VotePlanStatus" NOT NULL DEFAULT 'NEEDS_PLAN',
    "votingMethod" TEXT,
    "plannedVoteDate" TIMESTAMP(3),
    "pollingPlaceNotes" TEXT,
    "transportationNeeded" BOOLEAN NOT NULL DEFAULT false,
    "reminderNeeded" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterVotePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoterSnapshotChange" (
    "id" TEXT NOT NULL,
    "voterFileSnapshotId" TEXT NOT NULL,
    "voterRecordId" TEXT,
    "voterFileKey" TEXT NOT NULL,
    "changeType" "public"."VoterSnapshotChangeType" NOT NULL,
    "countyId" TEXT NOT NULL,
    "countySlug" TEXT NOT NULL,
    "summaryJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoterSnapshotChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CampaignEvent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "public"."CampaignEventType" NOT NULL,
    "status" "public"."CampaignEventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "visibility" "public"."CampaignEventVisibility" NOT NULL DEFAULT 'INTERNAL',
    "countyId" TEXT,
    "locationName" TEXT,
    "address" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "ownerUserId" TEXT,
    "relatedInboundContentId" TEXT,
    "relatedSyncedPostId" TEXT,
    "relatedOwnedMediaAssetId" TEXT,
    "notes" TEXT,
    "eventWorkflowState" "public"."EventWorkflowState" NOT NULL DEFAULT 'DRAFT',
    "isPublicOnWebsite" BOOLEAN NOT NULL DEFAULT false,
    "submittedForReviewAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedByUserId" TEXT,
    "completedAt" TIMESTAMP(3),
    "publicSummary" TEXT,
    "calendarSourceId" TEXT,
    "googleEventId" TEXT,
    "googleEtag" TEXT,
    "googleSyncState" "public"."GoogleEventSyncState" NOT NULL DEFAULT 'IDLE',
    "lastGoogleSyncAt" TIMESTAMP(3),
    "googleSyncError" TEXT,
    "syncReviewNeeded" BOOLEAN NOT NULL DEFAULT false,
    "inboundTimeChangedAt" TIMESTAMP(3),
    "commsStateJson" JSONB DEFAULT '{}',
    "staffingStateJson" JSONB DEFAULT '{}',
    "lastAiScanAt" TIMESTAMP(3),
    "timeMatrixQuadrant" "public"."TimeMatrixQuadrant" NOT NULL DEFAULT 'Q2',
    "campaignIntent" TEXT,
    "executionChecklistJson" JSONB DEFAULT '{}',
    "contentOpportunityNotes" TEXT,
    "isBigRock" BOOLEAN NOT NULL DEFAULT false,
    "bigRockOrder" INTEGER,
    "internalSummary" TEXT,
    "cancellationReason" TEXT,
    "commsReadiness" "public"."EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
    "staffingReadiness" "public"."EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
    "prepReadiness" "public"."EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
    "followupReadiness" "public"."EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
    "reminderPlanStatus" "public"."EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
    "attendeeCommsStatus" "public"."EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
    "followupCommsStatus" "public"."EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
    "lastReminderSentAt" TIMESTAMP(3),
    "nextReminderDueAt" TIMESTAMP(3),
    "lastAttendeeNoticeAt" TIMESTAMP(3),
    "lastCancellationNoticeAt" TIMESTAMP(3),
    "thankYouQueuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FestivalIngestRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "label" TEXT,
    "summaryJson" JSONB,
    "inserted" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "FestivalIngestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ArkansasFestivalIngest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "city" TEXT,
    "countyId" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "venueName" TEXT,
    "sourceChannel" "public"."FestivalSourceChannel" NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceFingerprint" TEXT,
    "rawPayload" JSONB,
    "submitterInfoUrl" TEXT,
    "submitterName" TEXT,
    "submitterEmail" TEXT,
    "reviewStatus" "public"."FestivalIngestReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "isVisibleOnSite" BOOLEAN NOT NULL DEFAULT false,
    "estimatedAttendance" INTEGER,
    "promotedCampaignEventId" TEXT,
    "ingestRunId" TEXT,
    "lastSeenInIngestAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArkansasFestivalIngest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FestivalCoveragePlanSnapshot" (
    "id" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "modelName" TEXT,
    "payload" JSONB NOT NULL,

    CONSTRAINT "FestivalCoveragePlanSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CampaignTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "public"."CampaignTaskType" NOT NULL DEFAULT 'OTHER',
    "status" "public"."CampaignTaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "public"."CampaignTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueAt" TIMESTAMP(3),
    "startAt" TIMESTAMP(3),
    "assignedUserId" TEXT,
    "assignedRole" TEXT,
    "blocksReadiness" BOOLEAN NOT NULL DEFAULT false,
    "sourceTemplateTaskKey" TEXT,
    "countyId" TEXT,
    "eventId" TEXT,
    "socialContentItemId" TEXT,
    "workflowRunId" TEXT,
    "parentTaskId" TEXT,
    "createdByUserId" TEXT,
    "completionNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "timeMatrixQuadrant" "public"."TimeMatrixQuadrant",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowTemplate" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" "public"."WorkflowTemplateTrigger" NOT NULL,
    "campaignEventType" "public"."CampaignEventType",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowTemplateTask" (
    "id" TEXT NOT NULL,
    "workflowTemplateId" TEXT NOT NULL,
    "taskKey" TEXT NOT NULL,
    "titleTemplate" TEXT NOT NULL,
    "descriptionTemplate" TEXT,
    "offsetMinutes" INTEGER NOT NULL DEFAULT 0,
    "roleTarget" TEXT,
    "taskType" "public"."CampaignTaskType" NOT NULL DEFAULT 'OTHER',
    "priority" "public"."CampaignTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "blocksReadiness" BOOLEAN NOT NULL DEFAULT false,
    "minEventStage" "public"."EventWorkflowState",
    "dependsOnTaskKey" TEXT,
    "configJson" JSONB DEFAULT '{}',

    CONSTRAINT "WorkflowTemplateTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowTemplateId" TEXT NOT NULL,
    "triggerType" "public"."WorkflowTemplateTrigger" NOT NULL,
    "triggerSourceType" TEXT NOT NULL,
    "triggerSourceId" TEXT NOT NULL,
    "status" "public"."WorkflowRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "contextJson" JSONB DEFAULT '{}',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VolunteerAsk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "askType" "public"."VolunteerAskType" NOT NULL,
    "status" "public"."VolunteerAskStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "countyId" TEXT,
    "eventId" TEXT,
    "workflowRunId" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "recurrenceRule" TEXT,
    "targetAudienceJson" JSONB DEFAULT '{}',
    "actionUrl" TEXT,
    "completionMode" TEXT NOT NULL DEFAULT 'HONOR_SYSTEM',
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerAsk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventSignup" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobilePhone" TEXT,
    "countyId" TEXT,
    "signupSource" TEXT NOT NULL DEFAULT 'web',
    "notes" TEXT,
    "status" "public"."EventSignupAttendeeStatus" NOT NULL DEFAULT 'REGISTERED',
    "attendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL,
    "countyId" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaIngestBatch" (
    "id" TEXT NOT NULL,
    "clientBatchCode" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "ingestPath" TEXT,
    "status" "public"."MediaIngestBatchStatus" NOT NULL DEFAULT 'STARTED',
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "duplicateCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaIngestBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OwnedMediaCollection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSmart" BOOLEAN NOT NULL DEFAULT false,
    "filterJson" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedMediaCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OwnedMediaCollectionItem" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnedMediaCollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OwnedMediaReviewLog" (
    "id" TEXT NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "fromSnapshot" JSONB,
    "toSnapshot" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnedMediaReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OwnedMediaDerivativeJob" (
    "id" TEXT NOT NULL,
    "sourceAssetId" TEXT NOT NULL,
    "targetDerivativeType" "public"."OwnedMediaDerivativeType" NOT NULL,
    "status" "public"."OwnedMediaDerivativeJobStatus" NOT NULL DEFAULT 'PLANNED',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "payloadJson" JSONB,
    "lastError" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedMediaDerivativeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SignupSheetDocument" (
    "id" TEXT NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "status" "public"."SignupSheetDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "lastExtractionId" TEXT,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignupSheetDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SignupSheetExtraction" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" "public"."SignupSheetExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "model" TEXT,
    "rawOcrText" TEXT,
    "parsedOutputJson" JSONB,
    "errorMessage" TEXT,
    "avgConfidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupSheetExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SignupSheetEntry" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "extractionId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "countyText" TEXT,
    "countyId" TEXT,
    "rawRowText" TEXT NOT NULL,
    "parsedJson" JSONB,
    "confidenceScore" DOUBLE PRECISION,
    "approvalStatus" "public"."SignupSheetEntryStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "matchedVoterRecordId" TEXT,
    "matchedUserId" TEXT,
    "notes" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,

    CONSTRAINT "SignupSheetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VolunteerMatchCandidate" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "voterRecordId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasonJson" JSONB NOT NULL DEFAULT '{}',
    "rank" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerMatchCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationThread" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "primaryEmail" TEXT,
    "primaryPhone" TEXT,
    "preferredChannel" "public"."CommunicationChannel",
    "threadStatus" "public"."CommunicationThreadStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastInboundAt" TIMESTAMP(3),
    "lastOutboundAt" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "priorityScore" INTEGER NOT NULL DEFAULT 0,
    "countyId" TEXT,
    "assignedUserId" TEXT,
    "assignedRoleKey" TEXT,
    "notes" TEXT,
    "aiThreadSummary" TEXT,
    "aiNextBestAction" TEXT,
    "lastStaffTouchAt" TIMESTAMP(3),
    "nextActionDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "communicationCampaignId" TEXT,
    "communicationCampaignRecipientId" TEXT,
    "channel" "public"."CommunicationChannel" NOT NULL,
    "direction" "public"."MessageDirection" NOT NULL,
    "provider" "public"."CommsSendProvider" NOT NULL,
    "providerMessageId" TEXT,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "subject" TEXT,
    "bodyText" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "deliveryStatus" "public"."MessageDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPromptSummary" TEXT,
    "sentByUserId" TEXT,
    "gmailMessageId" TEXT,
    "gmailThreadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "public"."CommunicationChannel" NOT NULL,
    "templateType" "public"."CommunicationTemplateType" NOT NULL DEFAULT 'BROADCAST',
    "subjectTemplate" TEXT,
    "bodyTemplate" TEXT NOT NULL,
    "tone" TEXT,
    "isAiSeeded" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "eventType" "public"."CampaignEventType",
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AudienceSegment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "definitionJson" JSONB NOT NULL DEFAULT '{}',
    "estimatedCount" INTEGER,
    "isDynamic" BOOLEAN NOT NULL DEFAULT true,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudienceSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "public"."CommunicationCampaignChannel" NOT NULL,
    "campaignType" "public"."CommunicationCampaignType" NOT NULL DEFAULT 'BROADCAST',
    "status" "public"."CommunicationCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "templateId" TEXT,
    "audienceDefinitionJson" JSONB NOT NULL DEFAULT '{}',
    "audienceSegmentId" TEXT,
    "subjectText" TEXT,
    "bodyText" TEXT,
    "eventId" TEXT,
    "createdByUserId" TEXT,
    "approvedByUserId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "suppressedCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "optOutCount" INTEGER NOT NULL DEFAULT 0,
    "engagementOpenCount" INTEGER NOT NULL DEFAULT 0,
    "engagementClickCount" INTEGER NOT NULL DEFAULT 0,
    "statsJson" JSONB DEFAULT '{}',
    "notes" TEXT,
    "lastProcessError" TEXT,
    "processingLockUntil" TIMESTAMP(3),
    "lastProcessedAt" TIMESTAMP(3),
    "orchestrationIdempotencyKey" TEXT,
    "triggerSourceType" TEXT,
    "triggerSourceId" TEXT,
    "generatedFromTemplateKey" TEXT,
    "automationStatus" "public"."CommunicationCampaignAutomationStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationCampaignRecipient" (
    "id" TEXT NOT NULL,
    "communicationCampaignId" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "communicationThreadId" TEXT,
    "channel" "public"."CommunicationChannel" NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "personalizationJson" JSONB NOT NULL DEFAULT '{}',
    "sendStatus" "public"."CampaignRecipientSendStatus" NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "responseAt" TIMESTAMP(3),
    "unsubscribeStateSnapshot" JSONB DEFAULT '{}',
    "lastError" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "idempotencyKey" TEXT,
    "engagementOpenedAt" TIMESTAMP(3),
    "engagementClickedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationCampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationActionQueue" (
    "id" TEXT NOT NULL,
    "actionType" "public"."CommunicationActionType" NOT NULL,
    "eventId" TEXT,
    "threadId" TEXT,
    "targetUserId" TEXT,
    "targetVolunteerProfileId" TEXT,
    "payloadJson" JSONB NOT NULL DEFAULT '{}',
    "queueStatus" "public"."CommsQueueStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationActionQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationTag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationThreadTag" (
    "threadId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationThreadTag_pkey" PRIMARY KEY ("threadId","tagId")
);

-- CreateTable
CREATE TABLE "public"."CommunicationPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" "public"."CommunicationObjective" NOT NULL,
    "status" "public"."CommunicationPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "public"."CampaignTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "summary" TEXT,
    "ownerUserId" TEXT,
    "requestedByUserId" TEXT,
    "sourceType" TEXT,
    "sourceWorkflowIntakeId" TEXT,
    "sourceCampaignTaskId" TEXT,
    "sourceEventId" TEXT,
    "sourceSocialContentItemId" TEXT,
    "dueAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationDraft" (
    "id" TEXT NOT NULL,
    "communicationPlanId" TEXT NOT NULL,
    "channel" "public"."CommsWorkbenchChannel" NOT NULL,
    "title" TEXT,
    "subjectLine" TEXT,
    "previewText" TEXT,
    "bodyCopy" TEXT NOT NULL DEFAULT '',
    "shortCopy" TEXT,
    "messageToneMode" "public"."SocialMessageToneMode",
    "messageTacticMode" "public"."SocialMessageTacticMode",
    "ctaType" TEXT,
    "status" "public"."CommunicationDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "reviewRequestedAt" TIMESTAMP(3),
    "reviewRequestedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "reviewDecision" "public"."CommunicationReviewDecision",
    "reviewNotes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationVariant" (
    "id" TEXT NOT NULL,
    "communicationDraftId" TEXT NOT NULL,
    "variantType" "public"."CommunicationVariantType" NOT NULL DEFAULT 'OTHER',
    "targetSegmentId" TEXT,
    "targetSegmentLabel" TEXT,
    "channelOverride" "public"."CommsWorkbenchChannel",
    "subjectLineOverride" TEXT,
    "bodyCopyOverride" TEXT,
    "ctaOverride" TEXT,
    "status" "public"."CommunicationVariantStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewRequestedAt" TIMESTAMP(3),
    "reviewRequestedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "reviewDecision" "public"."CommunicationReviewDecision",
    "reviewNotes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationSend" (
    "id" TEXT NOT NULL,
    "communicationPlanId" TEXT NOT NULL,
    "communicationDraftId" TEXT NOT NULL,
    "communicationVariantId" TEXT,
    "channel" "public"."CommsWorkbenchChannel" NOT NULL,
    "sendType" "public"."CommunicationSendType",
    "targetSegmentId" TEXT,
    "status" "public"."CommunicationSendStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "queuedAt" TIMESTAMP(3),
    "queuedByUserId" TEXT,
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "sentByUserId" TEXT,
    "outcomeSummaryJson" JSONB,
    "providerMessageId" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastRetriedAt" TIMESTAMP(3),
    "lastRetriedByUserId" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationSend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailWorkflowItem" (
    "id" TEXT NOT NULL,
    "status" "public"."EmailWorkflowStatus" NOT NULL DEFAULT 'NEW',
    "priority" "public"."EmailWorkflowPriority" NOT NULL DEFAULT 'NORMAL',
    "sourceType" "public"."EmailWorkflowSourceType" NOT NULL DEFAULT 'MANUAL',
    "triggerType" "public"."EmailWorkflowTriggerType" NOT NULL DEFAULT 'MANUAL',
    "title" VARCHAR(500),
    "queueReason" TEXT,
    "whoSummary" TEXT,
    "whatSummary" TEXT,
    "whenSummary" TEXT,
    "whereSummary" TEXT,
    "whySummary" TEXT,
    "impactSummary" TEXT,
    "recommendedResponseSummary" TEXT,
    "recommendedResponseRationale" TEXT,
    "sentiment" VARCHAR(120),
    "tone" "public"."EmailWorkflowTone" NOT NULL DEFAULT 'UNKNOWN',
    "intent" "public"."EmailWorkflowIntent" NOT NULL DEFAULT 'UNKNOWN',
    "escalationLevel" "public"."EmailWorkflowEscalationLevel" NOT NULL DEFAULT 'NONE',
    "spamDisposition" "public"."EmailWorkflowSpamDisposition" NOT NULL DEFAULT 'UNKNOWN',
    "spamScore" DOUBLE PRECISION,
    "needsDeescalation" BOOLEAN NOT NULL DEFAULT false,
    "occurredAt" TIMESTAMP(3),
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "communicationThreadId" TEXT,
    "communicationPlanId" TEXT,
    "communicationSendId" TEXT,
    "workflowIntakeId" TEXT,
    "campaignTaskId" TEXT,
    "conversationOpportunityId" TEXT,
    "socialContentItemId" TEXT,
    "comsPlanAudienceSegmentId" TEXT,
    "communicationMessageId" TEXT,
    "assignedToUserId" TEXT,
    "createdByUserId" TEXT,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "emailContactProfileId" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailWorkflowItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailContactProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "relationalContactId" TEXT,
    "primaryEmail" VARCHAR(320),
    "displayName" VARCHAR(500),
    "county" VARCHAR(120),
    "city" VARCHAR(120),
    "state" VARCHAR(32),
    "source" VARCHAR(120) NOT NULL DEFAULT 'email_workflow_queue',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailContactProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailContactProfileFact" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "factType" VARCHAR(120) NOT NULL,
    "factKey" VARCHAR(200) NOT NULL,
    "factValue" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "sourceType" VARCHAR(120) NOT NULL DEFAULT 'EMAIL_AI_APPROVED',
    "sourceEmailWorkflowItemId" TEXT,
    "sourceMetadataJson" JSONB NOT NULL DEFAULT '{}',
    "status" "public"."EmailContactProfileFactStatus" NOT NULL DEFAULT 'ACTIVE',
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailContactProfileFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailContactProfileFactSuggestion" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "emailWorkflowItemId" TEXT NOT NULL,
    "suggestionType" VARCHAR(120) NOT NULL DEFAULT 'EMAIL_AI_V1',
    "factKey" VARCHAR(200) NOT NULL,
    "factValue" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "rationale" TEXT,
    "sourceLimitations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "public"."EmailContactProfileFactSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailContactProfileFactSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailAudienceHint" (
    "id" TEXT NOT NULL,
    "emailWorkflowItemId" TEXT NOT NULL,
    "profileId" TEXT,
    "hintType" VARCHAR(120) NOT NULL DEFAULT 'EMAIL_AI_V1',
    "label" VARCHAR(500) NOT NULL,
    "rationale" TEXT,
    "confidence" DOUBLE PRECISION,
    "status" "public"."EmailAudienceHintStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAudienceHint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailAudienceDefinition" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(240) NOT NULL,
    "description" TEXT,
    "status" "public"."EmailAudienceDefinitionStatus" NOT NULL DEFAULT 'DRAFT',
    "criteriaJson" JSONB NOT NULL DEFAULT '{}',
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAudienceDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailAudiencePreviewRun" (
    "id" TEXT NOT NULL,
    "audienceDefinitionId" TEXT,
    "criteriaJson" JSONB NOT NULL DEFAULT '{}',
    "matchCount" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedByUserId" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "EmailAudiencePreviewRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageStudioDraft" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "draftType" VARCHAR(240) NOT NULL DEFAULT '',
    "status" "public"."MessageStudioDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT NOT NULL DEFAULT '',
    "preheader" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "audienceNote" TEXT NOT NULL DEFAULT '',
    "primaryCta" VARCHAR(500) NOT NULL DEFAULT '',
    "tone" VARCHAR(240) NOT NULL DEFAULT '',
    "approvalStatus" VARCHAR(64) NOT NULL DEFAULT 'draft',
    "approvalNotes" TEXT NOT NULL DEFAULT '',
    "complianceNotes" TEXT NOT NULL DEFAULT '',
    "campaignVoiceJson" JSONB NOT NULL DEFAULT '{}',
    "qualityChecklistJson" JSONB NOT NULL DEFAULT '{}',
    "editorialReviewJson" JSONB NOT NULL DEFAULT '{}',
    "templateJson" JSONB NOT NULL DEFAULT '{}',
    "sendPacketJson" JSONB,
    "sourceContextJson" JSONB NOT NULL DEFAULT '{}',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "assignedReviewerUserId" TEXT,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageStudioDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MessageStudioDraftRevision" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "note" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageStudioDraftRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailContactImportBatch" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(240) NOT NULL,
    "sourceLabel" VARCHAR(320),
    "originalFilename" VARCHAR(500) NOT NULL,
    "status" "public"."EmailContactImportBatchStatus" NOT NULL DEFAULT 'UPLOADED',
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "validRowCount" INTEGER NOT NULL DEFAULT 0,
    "invalidRowCount" INTEGER NOT NULL DEFAULT 0,
    "duplicateRowCount" INTEGER NOT NULL DEFAULT 0,
    "existingProfileMatchCount" INTEGER NOT NULL DEFAULT 0,
    "consentWarningCount" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "committedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailContactImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailContactImportRow" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "rawJson" JSONB NOT NULL DEFAULT '{}',
    "normalizedEmail" VARCHAR(320),
    "firstName" VARCHAR(200),
    "lastName" VARCHAR(200),
    "phone" VARCHAR(80),
    "county" VARCHAR(120),
    "city" VARCHAR(120),
    "state" VARCHAR(32),
    "sourceList" VARCHAR(320),
    "sourceDate" VARCHAR(80),
    "consentStatus" VARCHAR(120),
    "tagsJson" JSONB NOT NULL DEFAULT '[]',
    "organization" VARCHAR(320),
    "role" VARCHAR(200),
    "notes" TEXT,
    "volunteerInterest" VARCHAR(320),
    "donorInterest" VARCHAR(320),
    "issueInterest" VARCHAR(320),
    "validationStatus" "public"."EmailContactImportRowValidationStatus" NOT NULL DEFAULT 'VALID',
    "validationMessagesJson" JSONB NOT NULL DEFAULT '[]',
    "matchedProfileId" TEXT,
    "committedProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailContactImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailContactImportDecision" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowId" TEXT,
    "decisionType" "public"."EmailContactImportDecisionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "decidedByUserId" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "EmailContactImportDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SendGridContactMap" (
    "id" TEXT NOT NULL,
    "emailContactProfileId" TEXT,
    "emailAudienceDefinitionId" TEXT,
    "email" VARCHAR(320) NOT NULL,
    "sendgridContactId" VARCHAR(120),
    "syncStatus" "public"."SendGridContactSyncStatus" NOT NULL DEFAULT 'NOT_SYNCED',
    "lastSyncAt" TIMESTAMP(3),
    "lastErrorSafe" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SendGridContactMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SendGridAudienceMap" (
    "id" TEXT NOT NULL,
    "emailAudienceDefinitionId" TEXT NOT NULL,
    "sendgridListId" VARCHAR(120),
    "sendgridSegmentId" VARCHAR(120),
    "syncStatus" "public"."SendGridAudienceSyncStatus" NOT NULL DEFAULT 'NOT_SYNCED',
    "lastPreviewAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SendGridAudienceMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SendGridSuppression" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "suppressionType" "public"."SendGridSuppressionType" NOT NULL,
    "sendgridEventId" VARCHAR(200),
    "source" VARCHAR(120) NOT NULL DEFAULT 'sendgrid_webhook',
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SendGridSuppression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SendGridEvent" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320),
    "eventType" VARCHAR(80) NOT NULL,
    "sendgridEventId" VARCHAR(200),
    "sendgridMessageId" VARCHAR(240),
    "sendgridMarketingCampaignId" VARCHAR(120),
    "emailAudienceDefinitionId" TEXT,
    "emailContactProfileId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "rawEventJson" JSONB NOT NULL DEFAULT '{}',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SendGridEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SendGridContactSyncRun" (
    "id" TEXT NOT NULL,
    "audienceDefinitionId" TEXT,
    "status" "public"."SendGridContactSyncRunStatus" NOT NULL DEFAULT 'PREVIEWED',
    "candidateCount" INTEGER NOT NULL DEFAULT 0,
    "excludedSuppressedCount" INTEGER NOT NULL DEFAULT 0,
    "excludedMissingEmailCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "sendgridListId" VARCHAR(120),
    "sendgridSegmentId" VARCHAR(120),
    "previewJson" JSONB NOT NULL,
    "resultJson" JSONB NOT NULL DEFAULT '{}',
    "createdByUserId" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SendGridContactSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailSendExecution" (
    "id" TEXT NOT NULL,
    "status" "public"."EmailSendExecutionStatus" NOT NULL DEFAULT 'DRAFT',
    "sendType" "public"."EmailSendExecutionSendType" NOT NULL DEFAULT 'SENDGRID_BROADCAST',
    "messageStudioDraftId" TEXT,
    "emailAudienceDefinitionId" TEXT,
    "sendGridContactSyncRunId" TEXT,
    "sendPacketJson" JSONB NOT NULL DEFAULT '{}',
    "subject" TEXT NOT NULL DEFAULT '',
    "preheader" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "fromEmail" VARCHAR(320) NOT NULL DEFAULT '',
    "fromName" VARCHAR(320) NOT NULL DEFAULT '',
    "replyToEmail" VARCHAR(320),
    "testRecipientEmail" VARCHAR(320),
    "candidateRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "suppressedRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "finalRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "preflightJson" JSONB NOT NULL DEFAULT '{}',
    "approvalJson" JSONB NOT NULL DEFAULT '{}',
    "providerResultJson" JSONB NOT NULL DEFAULT '{}',
    "errorSafe" TEXT,
    "createdByUserId" TEXT,
    "preflightByUserId" TEXT,
    "approvedByUserId" TEXT,
    "sentByUserId" TEXT,
    "preflightAt" TIMESTAMP(3),
    "finalApprovedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSendExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailSendRecipient" (
    "id" TEXT NOT NULL,
    "sendExecutionId" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "emailContactProfileId" TEXT,
    "status" "public"."EmailSendRecipientStatus" NOT NULL DEFAULT 'CANDIDATE',
    "suppressionReason" VARCHAR(500),
    "providerMessageId" VARCHAR(200),
    "providerEventJson" JSONB,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSendRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailSendApproval" (
    "id" TEXT NOT NULL,
    "sendExecutionId" TEXT NOT NULL,
    "approvalType" "public"."EmailSendApprovalType" NOT NULL,
    "status" "public"."EmailSendApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT NOT NULL DEFAULT '',
    "approvedByUserId" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSendApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationRecipient" (
    "id" TEXT NOT NULL,
    "communicationSendId" TEXT NOT NULL,
    "comsPlanAudienceSegmentId" TEXT,
    "channel" "public"."CommsWorkbenchChannel" NOT NULL,
    "addressUsed" TEXT NOT NULL,
    "crmContactKey" TEXT,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "communicationThreadId" TEXT,
    "targetSegmentId" TEXT,
    "targetSegmentLabel" TEXT,
    "status" "public"."CommunicationRecipientStatus" NOT NULL DEFAULT 'PLANNED',
    "providerRecipientId" TEXT,
    "deliveryHealthStatus" "public"."CommsDeliveryHealthStatus" NOT NULL DEFAULT 'UNKNOWN',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationRecipientEvent" (
    "id" TEXT NOT NULL,
    "communicationRecipientId" TEXT NOT NULL,
    "eventType" "public"."CommunicationRecipientEventType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "providerEventId" TEXT,
    "providerName" TEXT,
    "linkUrl" TEXT,
    "linkLabel" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationRecipientEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunicationLinkDefinition" (
    "id" TEXT NOT NULL,
    "communicationSendId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "trackingKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationLinkDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommsPlanAudienceSegment" (
    "id" TEXT NOT NULL,
    "communicationPlanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "segmentType" "public"."CommsPlanAudienceSegmentType" NOT NULL DEFAULT 'STATIC',
    "status" "public"."CommsPlanAudienceSegmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "ruleDefinitionJson" JSONB NOT NULL DEFAULT '{}',
    "isDynamic" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommsPlanAudienceSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommsPlanAudienceSegmentMember" (
    "id" TEXT NOT NULL,
    "comsPlanAudienceSegmentId" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "crmContactKey" TEXT,
    "sourceType" "public"."CommsPlanAudienceSegmentMemberSource" NOT NULL DEFAULT 'MANUAL',
    "addedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommsPlanAudienceSegmentMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaOutreachItem" (
    "id" TEXT NOT NULL,
    "type" "public"."MediaOutreachItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "contactName" TEXT,
    "outletName" TEXT,
    "status" "public"."MediaOutreachStatus" NOT NULL DEFAULT 'NEW',
    "urgency" "public"."ConversationUrgency",
    "linkedCommunicationPlanId" TEXT,
    "linkedWorkflowIntakeId" TEXT,
    "linkedConversationOpportunityId" TEXT,
    "notes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaOutreachItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StaffGmailAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sendAsEmail" TEXT NOT NULL,
    "oauthJson" JSONB NOT NULL DEFAULT '{}',
    "gmailSyncState" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffGmailAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CalendarSource" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "displayName" TEXT,
    "sourceType" "public"."CalendarSourceType" NOT NULL DEFAULT 'INTERNAL_STAFF_PLANNING',
    "isPublicFacing" BOOLEAN NOT NULL DEFAULT false,
    "provider" "public"."CalendarProvider" NOT NULL DEFAULT 'GOOGLE',
    "externalCalendarId" TEXT NOT NULL,
    "color" TEXT,
    "visibility" "public"."CalendarSourceVisibility" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "syncToken" TEXT,
    "oauthJson" JSONB DEFAULT '{}',
    "lastFullSyncAt" TIMESTAMP(3),
    "lastIncrementalAt" TIMESTAMP(3),
    "ownerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CalendarWatchChannel" (
    "id" TEXT NOT NULL,
    "calendarSourceId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "token" TEXT,
    "expiration" TIMESTAMP(3) NOT NULL,
    "lastRenewedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarWatchChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeeklyCampaignPlan" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "missionStatement" TEXT,
    "outcome1" TEXT,
    "outcome2" TEXT,
    "outcome3" TEXT,
    "roleCommitmentsJson" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyCampaignPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeeklyBigRock" (
    "id" TEXT NOT NULL,
    "weekPlanId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "eventId" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyBigRock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventApproval" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "state" "public"."EventApprovalState" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "submittedByUserId" TEXT,
    "approverUserId" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventStageChangeLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "fromState" "public"."EventWorkflowState",
    "toState" "public"."EventWorkflowState" NOT NULL,
    "actorUserId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventStageChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventSyncLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "calendarSourceId" TEXT,
    "direction" "public"."EventSyncDirection" NOT NULL,
    "status" "public"."EventSyncLogStatus" NOT NULL,
    "message" TEXT,
    "detailJson" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventAnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL,
    "eventId" TEXT,
    "countyId" TEXT,
    "metricsJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventAnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExternalMediaSource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" "public"."ExternalMediaSourceType" NOT NULL,
    "region" TEXT NOT NULL,
    "coveredCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "homepage" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "rssUrl" TEXT,
    "sitemapUrl" TEXT,
    "searchUrlTemplate" TEXT,
    "discoveryMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalMediaSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExternalMediaMention" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceType" "public"."ExternalMediaSourceType" NOT NULL,
    "sourceRegion" TEXT,
    "cityCoverage" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "author" TEXT,
    "section" TEXT,
    "summary" TEXT,
    "fullText" TEXT,
    "transcriptText" TEXT,
    "transcriptMissing" BOOLEAN NOT NULL DEFAULT false,
    "mentionType" "public"."ExternalMediaMentionType" NOT NULL DEFAULT 'NEWS_ARTICLE',
    "confidenceScore" DOUBLE PRECISION,
    "matchTier" "public"."ExternalMediaMatchTier" NOT NULL,
    "matchedEntityName" TEXT NOT NULL DEFAULT 'Kelly Grappe',
    "matchedPersonName" TEXT,
    "isOpinion" BOOLEAN NOT NULL DEFAULT false,
    "isEditorial" BOOLEAN NOT NULL DEFAULT false,
    "sentimentHint" TEXT,
    "ingestionMethod" "public"."ExternalMediaIngestMethod" NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL,
    "reviewStatus" "public"."ExternalMediaReviewStatus" NOT NULL DEFAULT 'PENDING',
    "campaignSummary" TEXT,
    "markForSocialShare" BOOLEAN NOT NULL DEFAULT false,
    "markForEmailRoundup" BOOLEAN NOT NULL DEFAULT false,
    "markForSurrogateAmplification" BOOLEAN NOT NULL DEFAULT false,
    "responseNeeded" BOOLEAN NOT NULL DEFAULT false,
    "needsAmplification" BOOLEAN NOT NULL DEFAULT false,
    "showOnPublicSite" BOOLEAN NOT NULL DEFAULT false,
    "relatedEventId" TEXT,
    "relatedCountyId" TEXT,
    "openAiRefined" BOOLEAN NOT NULL DEFAULT false,
    "rawPayload" JSONB,

    CONSTRAINT "ExternalMediaMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExternalMediaIngestRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "label" TEXT,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "sourceSlug" TEXT,
    "incrementalSince" TIMESTAMP(3),
    "summaryJson" JSONB,
    "itemsDiscovered" INTEGER NOT NULL DEFAULT 0,
    "itemsInserted" INTEGER NOT NULL DEFAULT 0,
    "itemsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errorsJson" JSONB,
    "error" TEXT,

    CONSTRAINT "ExternalMediaIngestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OppositionEntity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."OppositionEntityType" NOT NULL,
    "description" TEXT,
    "currentOffice" TEXT,
    "party" TEXT,
    "geography" TEXT,
    "tagsJson" JSONB NOT NULL DEFAULT '[]',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OppositionEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OppositionSource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" "public"."OppositionSourceType" NOT NULL,
    "sourceUrl" TEXT,
    "sourcePath" TEXT,
    "publisher" TEXT,
    "publishedAt" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3),
    "confidence" "public"."OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
    "reviewStatus" "public"."OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "notes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OppositionSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OppositionBillRecord" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT,
    "billNumber" TEXT,
    "title" TEXT,
    "summary" TEXT,
    "role" TEXT,
    "policyArea" TEXT,
    "impactArea" TEXT,
    "session" TEXT,
    "status" TEXT,
    "introducedAt" TIMESTAMP(3),
    "lastActionAt" TIMESTAMP(3),
    "confidence" "public"."OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
    "reviewStatus" "public"."OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "notes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OppositionBillRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OppositionVoteRecord" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT,
    "billNumber" TEXT,
    "vote" TEXT,
    "voteDate" TIMESTAMP(3),
    "chamber" TEXT,
    "category" TEXT,
    "impactGroup" TEXT,
    "confidence" "public"."OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
    "reviewStatus" "public"."OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "notes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OppositionVoteRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OppositionFinanceRecord" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT,
    "donorName" TEXT,
    "donorType" TEXT,
    "amount" DECIMAL(14,2),
    "date" TIMESTAMP(3),
    "employer" TEXT,
    "industry" TEXT,
    "geography" TEXT,
    "confidence" "public"."OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
    "reviewStatus" "public"."OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "notes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OppositionFinanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OppositionMessageRecord" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT,
    "messageType" TEXT,
    "topic" TEXT,
    "summary" TEXT,
    "tone" TEXT,
    "messageDate" TIMESTAMP(3),
    "confidence" "public"."OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
    "reviewStatus" "public"."OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "notes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OppositionMessageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OppositionVideoRecord" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT,
    "eventType" TEXT,
    "topic" TEXT,
    "billNumber" TEXT,
    "videoDate" TIMESTAMP(3),
    "timestampLabel" TEXT,
    "transcriptStatus" TEXT,
    "confidence" "public"."OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
    "reviewStatus" "public"."OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "notes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OppositionVideoRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OppositionNewsMention" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT,
    "outlet" TEXT,
    "headline" TEXT,
    "topic" TEXT,
    "sentiment" TEXT,
    "mentionDate" TIMESTAMP(3),
    "confidence" "public"."OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
    "reviewStatus" "public"."OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "notes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OppositionNewsMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OppositionElectionPattern" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT,
    "electionYear" INTEGER,
    "county" TEXT,
    "voteShare" DOUBLE PRECISION,
    "turnout" DOUBLE PRECISION,
    "comparisonGroup" TEXT,
    "confidence" "public"."OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
    "reviewStatus" "public"."OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "notes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OppositionElectionPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OppositionAccountabilityItem" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "sourceId" TEXT,
    "title" TEXT,
    "category" TEXT,
    "description" TEXT,
    "impact" TEXT,
    "billNumber" TEXT,
    "actionDate" TIMESTAMP(3),
    "confidence" "public"."OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
    "reviewStatus" "public"."OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "notes" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OppositionAccountabilityItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "ComplianceDocument_documentType_createdAt_idx" ON "public"."ComplianceDocument"("documentType", "createdAt");

-- CreateIndex
CREATE INDEX "ComplianceDocument_createdAt_idx" ON "public"."ComplianceDocument"("createdAt");

-- CreateIndex
CREATE INDEX "ComplianceDocument_approvedForAiReference_createdAt_idx" ON "public"."ComplianceDocument"("approvedForAiReference", "createdAt");

-- CreateIndex
CREATE INDEX "FinancialTransaction_transactionDate_status_idx" ON "public"."FinancialTransaction"("transactionDate", "status");

-- CreateIndex
CREATE INDEX "FinancialTransaction_sourceType_sourceId_idx" ON "public"."FinancialTransaction"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "FinancialTransaction_category_transactionDate_idx" ON "public"."FinancialTransaction"("category", "transactionDate");

-- CreateIndex
CREATE INDEX "FinancialTransaction_status_transactionDate_idx" ON "public"."FinancialTransaction"("status", "transactionDate");

-- CreateIndex
CREATE INDEX "FinancialTransaction_confirmedByUserId_idx" ON "public"."FinancialTransaction"("confirmedByUserId");

-- CreateIndex
CREATE INDEX "FieldUnit_type_name_idx" ON "public"."FieldUnit"("type", "name");

-- CreateIndex
CREATE INDEX "FieldUnit_parentId_idx" ON "public"."FieldUnit"("parentId");

-- CreateIndex
CREATE INDEX "FieldAssignment_fieldUnitId_positionId_idx" ON "public"."FieldAssignment"("fieldUnitId", "positionId");

-- CreateIndex
CREATE INDEX "FieldAssignment_userId_idx" ON "public"."FieldAssignment"("userId");

-- CreateIndex
CREATE INDEX "FieldAssignment_positionSeatId_idx" ON "public"."FieldAssignment"("positionSeatId");

-- CreateIndex
CREATE INDEX "BudgetPlan_status_createdAt_idx" ON "public"."BudgetPlan"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BudgetLine_budgetPlanId_idx" ON "public"."BudgetLine"("budgetPlanId");

-- CreateIndex
CREATE INDEX "BudgetLine_costBearingWireKind_idx" ON "public"."BudgetLine"("costBearingWireKind");

-- CreateIndex
CREATE UNIQUE INDEX "PositionSeat_positionKey_key" ON "public"."PositionSeat"("positionKey");

-- CreateIndex
CREATE INDEX "PositionSeat_userId_idx" ON "public"."PositionSeat"("userId");

-- CreateIndex
CREATE INDEX "PositionSeat_status_positionKey_idx" ON "public"."PositionSeat"("status", "positionKey");

-- CreateIndex
CREATE UNIQUE INDEX "ContactPreference_userId_key" ON "public"."ContactPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactPreference_volunteerProfileId_key" ON "public"."ContactPreference"("volunteerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactPreference_communicationThreadId_key" ON "public"."ContactPreference"("communicationThreadId");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerProfile_userId_key" ON "public"."VolunteerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowIntake_submissionId_key" ON "public"."WorkflowIntake"("submissionId");

-- CreateIndex
CREATE INDEX "WorkflowIntake_status_createdAt_idx" ON "public"."WorkflowIntake"("status", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowIntake_assignedUserId_status_idx" ON "public"."WorkflowIntake"("assignedUserId", "status");

-- CreateIndex
CREATE INDEX "WorkflowIntake_countyId_status_idx" ON "public"."WorkflowIntake"("countyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EventRequest_workflowIntakeId_key" ON "public"."EventRequest"("workflowIntakeId");

-- CreateIndex
CREATE INDEX "EventRequest_status_createdAt_idx" ON "public"."EventRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EventRequest_campaignEventId_idx" ON "public"."EventRequest"("campaignEventId");

-- CreateIndex
CREATE INDEX "WorkflowAction_workflowIntakeId_createdAt_idx" ON "public"."WorkflowAction"("workflowIntakeId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowAction_actorUserId_createdAt_idx" ON "public"."WorkflowAction"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "SocialContentItem_workflowIntakeId_status_idx" ON "public"."SocialContentItem"("workflowIntakeId", "status");

-- CreateIndex
CREATE INDEX "SocialContentItem_campaignEventId_status_idx" ON "public"."SocialContentItem"("campaignEventId", "status");

-- CreateIndex
CREATE INDEX "SocialContentItem_status_kind_createdAt_idx" ON "public"."SocialContentItem"("status", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "SocialContentItem_messageToneMode_kind_updatedAt_idx" ON "public"."SocialContentItem"("messageToneMode", "kind", "updatedAt");

-- CreateIndex
CREATE INDEX "SocialContentItem_messageTacticMode_kind_updatedAt_idx" ON "public"."SocialContentItem"("messageTacticMode", "kind", "updatedAt");

-- CreateIndex
CREATE INDEX "SocialContentItem_createdByUserId_idx" ON "public"."SocialContentItem"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsRecommendationOutcome_createdSocialContentItemId_key" ON "public"."AnalyticsRecommendationOutcome"("createdSocialContentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsRecommendationOutcome_createdWorkflowIntakeId_key" ON "public"."AnalyticsRecommendationOutcome"("createdWorkflowIntakeId");

-- CreateIndex
CREATE INDEX "AnalyticsRecommendationOutcome_sourceSocialContentItemId_cr_idx" ON "public"."AnalyticsRecommendationOutcome"("sourceSocialContentItemId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsRecommendationOutcome_status_createdAt_idx" ON "public"."AnalyticsRecommendationOutcome"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsRecommendationOutcome_recommendationType_createdAt_idx" ON "public"."AnalyticsRecommendationOutcome"("recommendationType", "createdAt");

-- CreateIndex
CREATE INDEX "SocialContentDraft_socialContentItemId_createdAt_idx" ON "public"."SocialContentDraft"("socialContentItemId", "createdAt");

-- CreateIndex
CREATE INDEX "SocialContentDraft_createdByUserId_idx" ON "public"."SocialContentDraft"("createdByUserId");

-- CreateIndex
CREATE INDEX "SocialPlatformVariant_socialContentItemId_platform_idx" ON "public"."SocialPlatformVariant"("socialContentItemId", "platform");

-- CreateIndex
CREATE INDEX "SocialPlatformVariant_status_scheduledAt_idx" ON "public"."SocialPlatformVariant"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "SocialPlatformVariant_socialAccountId_status_idx" ON "public"."SocialPlatformVariant"("socialAccountId", "status");

-- CreateIndex
CREATE INDEX "SocialPlatformVariant_platform_status_idx" ON "public"."SocialPlatformVariant"("platform", "status");

-- CreateIndex
CREATE INDEX "SocialPerformanceSnapshot_socialContentItemId_periodStart_idx" ON "public"."SocialPerformanceSnapshot"("socialContentItemId", "periodStart");

-- CreateIndex
CREATE INDEX "SocialPerformanceSnapshot_socialPlatformVariantId_periodSta_idx" ON "public"."SocialPerformanceSnapshot"("socialPlatformVariantId", "periodStart");

-- CreateIndex
CREATE INDEX "SocialPerformanceSnapshot_conversionCampaignEventId_idx" ON "public"."SocialPerformanceSnapshot"("conversionCampaignEventId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialContentStrategicInsight_socialContentItemId_key" ON "public"."SocialContentStrategicInsight"("socialContentItemId");

-- CreateIndex
CREATE INDEX "ConversationWatchlist_countyId_status_idx" ON "public"."ConversationWatchlist"("countyId", "status");

-- CreateIndex
CREATE INDEX "ConversationWatchlist_status_updatedAt_idx" ON "public"."ConversationWatchlist"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "ConversationItem_sourceKind_publishedAt_idx" ON "public"."ConversationItem"("sourceKind", "publishedAt");

-- CreateIndex
CREATE INDEX "ConversationItem_countyId_status_idx" ON "public"."ConversationItem"("countyId", "status");

-- CreateIndex
CREATE INDEX "ConversationItem_status_createdAt_idx" ON "public"."ConversationItem"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ConversationItem_watchlistId_createdAt_idx" ON "public"."ConversationItem"("watchlistId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationItem_sourceKind_externalKey_key" ON "public"."ConversationItem"("sourceKind", "externalKey");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationAnalysis_conversationItemId_key" ON "public"."ConversationAnalysis"("conversationItemId");

-- CreateIndex
CREATE INDEX "ConversationAnalysis_classification_urgency_idx" ON "public"."ConversationAnalysis"("classification", "urgency");

-- CreateIndex
CREATE INDEX "ConversationAnalysis_analyzedAt_idx" ON "public"."ConversationAnalysis"("analyzedAt");

-- CreateIndex
CREATE INDEX "ConversationCluster_countyId_status_idx" ON "public"."ConversationCluster"("countyId", "status");

-- CreateIndex
CREATE INDEX "ConversationCluster_status_updatedAt_idx" ON "public"."ConversationCluster"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "ConversationClusterItem_conversationItemId_idx" ON "public"."ConversationClusterItem"("conversationItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationClusterItem_clusterId_conversationItemId_key" ON "public"."ConversationClusterItem"("clusterId", "conversationItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationOpportunity_primaryConversationItemId_key" ON "public"."ConversationOpportunity"("primaryConversationItemId");

-- CreateIndex
CREATE INDEX "ConversationOpportunity_status_urgency_idx" ON "public"."ConversationOpportunity"("status", "urgency");

-- CreateIndex
CREATE INDEX "ConversationOpportunity_countyId_status_idx" ON "public"."ConversationOpportunity"("countyId", "status");

-- CreateIndex
CREATE INDEX "ConversationOpportunity_workflowIntakeId_idx" ON "public"."ConversationOpportunity"("workflowIntakeId");

-- CreateIndex
CREATE INDEX "ConversationOpportunity_socialContentItemId_idx" ON "public"."ConversationOpportunity"("socialContentItemId");

-- CreateIndex
CREATE INDEX "ConversationOpportunity_clusterId_idx" ON "public"."ConversationOpportunity"("clusterId");

-- CreateIndex
CREATE INDEX "SocialContentMediaRef_socialContentItemId_purpose_sortOrder_idx" ON "public"."SocialContentMediaRef"("socialContentItemId", "purpose", "sortOrder");

-- CreateIndex
CREATE INDEX "SocialContentMediaRef_ownedMediaId_idx" ON "public"."SocialContentMediaRef"("ownedMediaId");

-- CreateIndex
CREATE INDEX "SocialContentMediaRef_socialPlatformVariantId_idx" ON "public"."SocialContentMediaRef"("socialPlatformVariantId");

-- CreateIndex
CREATE INDEX "SocialContentMediaRef_createdAt_idx" ON "public"."SocialContentMediaRef"("createdAt");

-- CreateIndex
CREATE INDEX "SocialAccount_platform_isActive_idx" ON "public"."SocialAccount"("platform", "isActive");

-- CreateIndex
CREATE INDEX "SocialAccount_handle_platform_idx" ON "public"."SocialAccount"("handle", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "SearchChunk_path_chunkIndex_key" ON "public"."SearchChunk"("path", "chunkIndex");

-- CreateIndex
CREATE UNIQUE INDEX "SyncedPost_feedGuid_key" ON "public"."SyncedPost"("feedGuid");

-- CreateIndex
CREATE UNIQUE INDEX "SyncedPost_slug_key" ON "public"."SyncedPost"("slug");

-- CreateIndex
CREATE INDEX "SyncedPost_publishedAt_idx" ON "public"."SyncedPost"("publishedAt");

-- CreateIndex
CREATE INDEX "SyncedPost_hidden_featured_idx" ON "public"."SyncedPost"("hidden", "featured");

-- CreateIndex
CREATE INDEX "SyncedPost_hidden_contentKind_publishedAt_idx" ON "public"."SyncedPost"("hidden", "contentKind", "publishedAt");

-- CreateIndex
CREATE INDEX "AdminContentBlock_pageKey_idx" ON "public"."AdminContentBlock"("pageKey");

-- CreateIndex
CREATE UNIQUE INDEX "AdminContentBlock_pageKey_blockKey_key" ON "public"."AdminContentBlock"("pageKey", "blockKey");

-- CreateIndex
CREATE UNIQUE INDEX "ContentItemOverride_collection_slug_key" ON "public"."ContentItemOverride"("collection", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConnection_platform_key" ON "public"."PlatformConnection"("platform");

-- CreateIndex
CREATE INDEX "PlatformConnection_platform_status_idx" ON "public"."PlatformConnection"("platform", "status");

-- CreateIndex
CREATE UNIQUE INDEX "InboundContentItem_syncedPostId_key" ON "public"."InboundContentItem"("syncedPostId");

-- CreateIndex
CREATE INDEX "InboundContentItem_sourcePlatform_reviewStatus_idx" ON "public"."InboundContentItem"("sourcePlatform", "reviewStatus");

-- CreateIndex
CREATE INDEX "InboundContentItem_reviewStatus_visibleOnUpdatesPage_idx" ON "public"."InboundContentItem"("reviewStatus", "visibleOnUpdatesPage");

-- CreateIndex
CREATE INDEX "InboundContentItem_publishedAt_idx" ON "public"."InboundContentItem"("publishedAt");

-- CreateIndex
CREATE INDEX "InboundContentItem_sourcePlatform_siteHidden_reviewStatus_idx" ON "public"."InboundContentItem"("sourcePlatform", "siteHidden", "reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "InboundContentItem_sourcePlatform_externalId_key" ON "public"."InboundContentItem"("sourcePlatform", "externalId");

-- CreateIndex
CREATE INDEX "PlatformMetricSnapshot_platformConnectionId_capturedAt_idx" ON "public"."PlatformMetricSnapshot"("platformConnectionId", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "OwnedMediaAsset_storageKey_key" ON "public"."OwnedMediaAsset"("storageKey");

-- CreateIndex
CREATE UNIQUE INDEX "OwnedMediaAsset_ingestContentSha256_key" ON "public"."OwnedMediaAsset"("ingestContentSha256");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_countyId_capturedAt_idx" ON "public"."OwnedMediaAsset"("countyId", "capturedAt");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_approvedForSocial_kind_idx" ON "public"."OwnedMediaAsset"("approvedForSocial", "kind");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_countySlug_eventDate_idx" ON "public"."OwnedMediaAsset"("countySlug", "eventDate");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_countySlug_capturedAt_idx" ON "public"."OwnedMediaAsset"("countySlug", "capturedAt");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_city_capturedAt_idx" ON "public"."OwnedMediaAsset"("city", "capturedAt");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_capturedAt_idx" ON "public"."OwnedMediaAsset"("capturedAt");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_eventDate_idx" ON "public"."OwnedMediaAsset"("eventDate");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_reviewStatus_idx" ON "public"."OwnedMediaAsset"("reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_transcriptJobStatus_idx" ON "public"."OwnedMediaAsset"("transcriptJobStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_isPublic_reviewStatus_idx" ON "public"."OwnedMediaAsset"("isPublic", "reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_sourceType_reviewStatus_idx" ON "public"."OwnedMediaAsset"("sourceType", "reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_kind_capturedAt_idx" ON "public"."OwnedMediaAsset"("kind", "capturedAt");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_needsGeoReview_idx" ON "public"."OwnedMediaAsset"("needsGeoReview");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_gpsLat_gpsLng_idx" ON "public"."OwnedMediaAsset"("gpsLat", "gpsLng");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_linkedCampaignEventId_idx" ON "public"."OwnedMediaAsset"("linkedCampaignEventId");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_mediaIngestBatchId_reviewStatus_idx" ON "public"."OwnedMediaAsset"("mediaIngestBatchId", "reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_stackGroupId_idx" ON "public"."OwnedMediaAsset"("stackGroupId");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_pickStatus_reviewStatus_idx" ON "public"."OwnedMediaAsset"("pickStatus", "reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_colorLabel_idx" ON "public"."OwnedMediaAsset"("colorLabel");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_rating_idx" ON "public"."OwnedMediaAsset"("rating");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_isFavorite_idx" ON "public"."OwnedMediaAsset"("isFavorite");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_parentAssetId_idx" ON "public"."OwnedMediaAsset"("parentAssetId");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_rootAssetId_idx" ON "public"."OwnedMediaAsset"("rootAssetId");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_derivativeType_idx" ON "public"."OwnedMediaAsset"("derivativeType");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_approvedForPress_idx" ON "public"."OwnedMediaAsset"("approvedForPress");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_approvedForPublicSite_idx" ON "public"."OwnedMediaAsset"("approvedForPublicSite");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_reviewedAt_idx" ON "public"."OwnedMediaAsset"("reviewedAt");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_reviewedByUserId_idx" ON "public"."OwnedMediaAsset"("reviewedByUserId");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_countyId_pickStatus_capturedAt_idx" ON "public"."OwnedMediaAsset"("countyId", "pickStatus", "capturedAt");

-- CreateIndex
CREATE INDEX "OwnedMediaAnnotation_ownedMediaId_createdAt_idx" ON "public"."OwnedMediaAnnotation"("ownedMediaId", "createdAt");

-- CreateIndex
CREATE INDEX "OwnedMediaAnnotation_ownedMediaId_noteType_idx" ON "public"."OwnedMediaAnnotation"("ownedMediaId", "noteType");

-- CreateIndex
CREATE INDEX "OwnedMediaAnnotation_isSearchable_idx" ON "public"."OwnedMediaAnnotation"("isSearchable");

-- CreateIndex
CREATE INDEX "OwnedMediaTranscript_ownedMediaId_reviewStatus_idx" ON "public"."OwnedMediaTranscript"("ownedMediaId", "reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaQuoteCandidate_ownedMediaId_reviewStatus_idx" ON "public"."OwnedMediaQuoteCandidate"("ownedMediaId", "reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaQuoteCandidate_transcriptId_idx" ON "public"."OwnedMediaQuoteCandidate"("transcriptId");

-- CreateIndex
CREATE INDEX "OwnedMediaQuoteCandidate_countySlug_idx" ON "public"."OwnedMediaQuoteCandidate"("countySlug");

-- CreateIndex
CREATE INDEX "ElectionResultSource_electionDate_idx" ON "public"."ElectionResultSource"("electionDate");

-- CreateIndex
CREATE INDEX "ElectionResultSource_sourcePath_idx" ON "public"."ElectionResultSource"("sourcePath");

-- CreateIndex
CREATE INDEX "ElectionContestResult_sourceId_idx" ON "public"."ElectionContestResult"("sourceId");

-- CreateIndex
CREATE INDEX "ElectionCountyResult_sourceId_idx" ON "public"."ElectionCountyResult"("sourceId");

-- CreateIndex
CREATE INDEX "ElectionCountyResult_contestId_idx" ON "public"."ElectionCountyResult"("contestId");

-- CreateIndex
CREATE INDEX "ElectionCountyResult_countyId_idx" ON "public"."ElectionCountyResult"("countyId");

-- CreateIndex
CREATE INDEX "ElectionCandidateResult_contestId_idx" ON "public"."ElectionCandidateResult"("contestId");

-- CreateIndex
CREATE INDEX "ElectionCandidateResult_countyResultId_idx" ON "public"."ElectionCandidateResult"("countyResultId");

-- CreateIndex
CREATE INDEX "ElectionPrecinctResult_sourceId_idx" ON "public"."ElectionPrecinctResult"("sourceId");

-- CreateIndex
CREATE INDEX "ElectionPrecinctResult_contestId_idx" ON "public"."ElectionPrecinctResult"("contestId");

-- CreateIndex
CREATE INDEX "ElectionPrecinctResult_countyId_idx" ON "public"."ElectionPrecinctResult"("countyId");

-- CreateIndex
CREATE INDEX "ElectionPrecinctCandidateResult_precinctResultId_idx" ON "public"."ElectionPrecinctCandidateResult"("precinctResultId");

-- CreateIndex
CREATE UNIQUE INDEX "CountyCampaignStats_countyId_key" ON "public"."CountyCampaignStats"("countyId");

-- CreateIndex
CREATE UNIQUE INDEX "CountyPublicDemographics_countyId_key" ON "public"."CountyPublicDemographics"("countyId");

-- CreateIndex
CREATE INDEX "CountyRegistrationSnapshot_countyId_snapshotDate_idx" ON "public"."CountyRegistrationSnapshot"("countyId", "snapshotDate");

-- CreateIndex
CREATE INDEX "CountyStrategyKpi_countyId_metricKey_idx" ON "public"."CountyStrategyKpi"("countyId", "metricKey");

-- CreateIndex
CREATE INDEX "CountyStrategyKpi_metricKey_idx" ON "public"."CountyStrategyKpi"("metricKey");

-- CreateIndex
CREATE INDEX "CountyElectedOfficial_countyId_jurisdiction_sortOrder_idx" ON "public"."CountyElectedOfficial"("countyId", "jurisdiction", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VoterFileSnapshot_sourceFileHash_key" ON "public"."VoterFileSnapshot"("sourceFileHash");

-- CreateIndex
CREATE INDEX "VoterFileSnapshot_fileAsOfDate_idx" ON "public"."VoterFileSnapshot"("fileAsOfDate");

-- CreateIndex
CREATE INDEX "VoterFileSnapshot_status_fileAsOfDate_idx" ON "public"."VoterFileSnapshot"("status", "fileAsOfDate");

-- CreateIndex
CREATE INDEX "CountyVoterMetrics_countySlug_asOfDate_idx" ON "public"."CountyVoterMetrics"("countySlug", "asOfDate");

-- CreateIndex
CREATE INDEX "CountyVoterMetrics_asOfDate_idx" ON "public"."CountyVoterMetrics"("asOfDate");

-- CreateIndex
CREATE INDEX "CountyVoterMetrics_countyId_asOfDate_idx" ON "public"."CountyVoterMetrics"("countyId", "asOfDate");

-- CreateIndex
CREATE UNIQUE INDEX "CountyVoterMetrics_countyId_voterFileSnapshotId_key" ON "public"."CountyVoterMetrics"("countyId", "voterFileSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "VoterRecord_voterFileKey_key" ON "public"."VoterRecord"("voterFileKey");

-- CreateIndex
CREATE INDEX "VoterRecord_countyId_inLatestCompletedFile_idx" ON "public"."VoterRecord"("countyId", "inLatestCompletedFile");

-- CreateIndex
CREATE INDEX "VoterRecord_countyId_lastName_firstName_idx" ON "public"."VoterRecord"("countyId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "VoterRecord_phone10_idx" ON "public"."VoterRecord"("phone10");

-- CreateIndex
CREATE INDEX "VoterRecord_countySlug_idx" ON "public"."VoterRecord"("countySlug");

-- CreateIndex
CREATE INDEX "VoterRecord_countyFips_idx" ON "public"."VoterRecord"("countyFips");

-- CreateIndex
CREATE INDEX "VoterRecord_registrationDate_idx" ON "public"."VoterRecord"("registrationDate");

-- CreateIndex
CREATE INDEX "VoterElectionParticipation_voterRecordId_idx" ON "public"."VoterElectionParticipation"("voterRecordId");

-- CreateIndex
CREATE INDEX "VoterElectionParticipation_contestKey_participated_idx" ON "public"."VoterElectionParticipation"("contestKey", "participated");

-- CreateIndex
CREATE INDEX "VoterElectionParticipation_contestKey_primaryBallotParty_idx" ON "public"."VoterElectionParticipation"("contestKey", "primaryBallotParty");

-- CreateIndex
CREATE UNIQUE INDEX "VoterElectionParticipation_voterRecordId_contestKey_key" ON "public"."VoterElectionParticipation"("voterRecordId", "contestKey");

-- CreateIndex
CREATE INDEX "VoterSignal_voterRecordId_idx" ON "public"."VoterSignal"("voterRecordId");

-- CreateIndex
CREATE INDEX "VoterSignal_userId_idx" ON "public"."VoterSignal"("userId");

-- CreateIndex
CREATE INDEX "VoterSignal_relationalContactId_idx" ON "public"."VoterSignal"("relationalContactId");

-- CreateIndex
CREATE INDEX "VoterSignal_signalKind_idx" ON "public"."VoterSignal"("signalKind");

-- CreateIndex
CREATE INDEX "VoterModelClassification_voterRecordId_idx" ON "public"."VoterModelClassification"("voterRecordId");

-- CreateIndex
CREATE INDEX "VoterModelClassification_voterRecordId_isCurrent_idx" ON "public"."VoterModelClassification"("voterRecordId", "isCurrent");

-- CreateIndex
CREATE INDEX "VoterInteraction_voterRecordId_idx" ON "public"."VoterInteraction"("voterRecordId");

-- CreateIndex
CREATE INDEX "VoterInteraction_relationalContactId_idx" ON "public"."VoterInteraction"("relationalContactId");

-- CreateIndex
CREATE INDEX "VoterInteraction_contactedByUserId_idx" ON "public"."VoterInteraction"("contactedByUserId");

-- CreateIndex
CREATE INDEX "VoterInteraction_relatedVolunteerUserId_idx" ON "public"."VoterInteraction"("relatedVolunteerUserId");

-- CreateIndex
CREATE INDEX "VoterInteraction_interactionDate_idx" ON "public"."VoterInteraction"("interactionDate");

-- CreateIndex
CREATE INDEX "RelationalContact_ownerUserId_idx" ON "public"."RelationalContact"("ownerUserId");

-- CreateIndex
CREATE INDEX "RelationalContact_matchedVoterRecordId_idx" ON "public"."RelationalContact"("matchedVoterRecordId");

-- CreateIndex
CREATE INDEX "RelationalContact_countyId_idx" ON "public"."RelationalContact"("countyId");

-- CreateIndex
CREATE INDEX "RelationalContact_fieldUnitId_idx" ON "public"."RelationalContact"("fieldUnitId");

-- CreateIndex
CREATE INDEX "RelationalContact_matchStatus_organizingStatus_idx" ON "public"."RelationalContact"("matchStatus", "organizingStatus");

-- CreateIndex
CREATE INDEX "VoterVotePlan_voterRecordId_idx" ON "public"."VoterVotePlan"("voterRecordId");

-- CreateIndex
CREATE INDEX "VoterSnapshotChange_voterFileSnapshotId_changeType_idx" ON "public"."VoterSnapshotChange"("voterFileSnapshotId", "changeType");

-- CreateIndex
CREATE INDEX "VoterSnapshotChange_countySlug_voterFileSnapshotId_idx" ON "public"."VoterSnapshotChange"("countySlug", "voterFileSnapshotId");

-- CreateIndex
CREATE INDEX "VoterSnapshotChange_voterFileKey_idx" ON "public"."VoterSnapshotChange"("voterFileKey");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignEvent_slug_key" ON "public"."CampaignEvent"("slug");

-- CreateIndex
CREATE INDEX "CampaignEvent_startAt_status_idx" ON "public"."CampaignEvent"("startAt", "status");

-- CreateIndex
CREATE INDEX "CampaignEvent_countyId_startAt_idx" ON "public"."CampaignEvent"("countyId", "startAt");

-- CreateIndex
CREATE INDEX "CampaignEvent_status_startAt_idx" ON "public"."CampaignEvent"("status", "startAt");

-- CreateIndex
CREATE INDEX "CampaignEvent_eventWorkflowState_startAt_idx" ON "public"."CampaignEvent"("eventWorkflowState", "startAt");

-- CreateIndex
CREATE INDEX "CampaignEvent_isPublicOnWebsite_eventWorkflowState_startAt_idx" ON "public"."CampaignEvent"("isPublicOnWebsite", "eventWorkflowState", "startAt");

-- CreateIndex
CREATE INDEX "CampaignEvent_googleEventId_idx" ON "public"."CampaignEvent"("googleEventId");

-- CreateIndex
CREATE INDEX "CampaignEvent_googleSyncState_updatedAt_idx" ON "public"."CampaignEvent"("googleSyncState", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ArkansasFestivalIngest_sourceUrl_key" ON "public"."ArkansasFestivalIngest"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ArkansasFestivalIngest_promotedCampaignEventId_key" ON "public"."ArkansasFestivalIngest"("promotedCampaignEventId");

-- CreateIndex
CREATE INDEX "ArkansasFestivalIngest_startAt_reviewStatus_idx" ON "public"."ArkansasFestivalIngest"("startAt", "reviewStatus");

-- CreateIndex
CREATE INDEX "ArkansasFestivalIngest_countyId_startAt_idx" ON "public"."ArkansasFestivalIngest"("countyId", "startAt");

-- CreateIndex
CREATE INDEX "ArkansasFestivalIngest_isVisibleOnSite_startAt_reviewStatus_idx" ON "public"."ArkansasFestivalIngest"("isVisibleOnSite", "startAt", "reviewStatus");

-- CreateIndex
CREATE INDEX "CampaignTask_status_dueAt_idx" ON "public"."CampaignTask"("status", "dueAt");

-- CreateIndex
CREATE INDEX "CampaignTask_assignedUserId_status_idx" ON "public"."CampaignTask"("assignedUserId", "status");

-- CreateIndex
CREATE INDEX "CampaignTask_eventId_idx" ON "public"."CampaignTask"("eventId");

-- CreateIndex
CREATE INDEX "CampaignTask_eventId_sourceTemplateTaskKey_idx" ON "public"."CampaignTask"("eventId", "sourceTemplateTaskKey");

-- CreateIndex
CREATE INDEX "CampaignTask_dueAt_status_idx" ON "public"."CampaignTask"("dueAt", "status");

-- CreateIndex
CREATE INDEX "CampaignTask_socialContentItemId_status_idx" ON "public"."CampaignTask"("socialContentItemId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTemplate_key_key" ON "public"."WorkflowTemplate"("key");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_campaignEventType_idx" ON "public"."WorkflowTemplate"("campaignEventType");

-- CreateIndex
CREATE INDEX "WorkflowTemplateTask_workflowTemplateId_idx" ON "public"."WorkflowTemplateTask"("workflowTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTemplateTask_workflowTemplateId_taskKey_key" ON "public"."WorkflowTemplateTask"("workflowTemplateId", "taskKey");

-- CreateIndex
CREATE INDEX "WorkflowRun_status_createdAt_idx" ON "public"."WorkflowRun"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRun_workflowTemplateId_triggerSourceType_triggerSou_key" ON "public"."WorkflowRun"("workflowTemplateId", "triggerSourceType", "triggerSourceId");

-- CreateIndex
CREATE INDEX "VolunteerAsk_status_startsAt_idx" ON "public"."VolunteerAsk"("status", "startsAt");

-- CreateIndex
CREATE INDEX "VolunteerAsk_countyId_status_idx" ON "public"."VolunteerAsk"("countyId", "status");

-- CreateIndex
CREATE INDEX "EventSignup_eventId_createdAt_idx" ON "public"."EventSignup"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "EventSignup_email_idx" ON "public"."EventSignup"("email");

-- CreateIndex
CREATE INDEX "TeamRoleAssignment_userId_roleKey_idx" ON "public"."TeamRoleAssignment"("userId", "roleKey");

-- CreateIndex
CREATE INDEX "TeamRoleAssignment_countyId_roleKey_idx" ON "public"."TeamRoleAssignment"("countyId", "roleKey");

-- CreateIndex
CREATE UNIQUE INDEX "MediaIngestBatch_clientBatchCode_key" ON "public"."MediaIngestBatch"("clientBatchCode");

-- CreateIndex
CREATE INDEX "MediaIngestBatch_status_createdAt_idx" ON "public"."MediaIngestBatch"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OwnedMediaCollection_slug_key" ON "public"."OwnedMediaCollection"("slug");

-- CreateIndex
CREATE INDEX "OwnedMediaCollection_sortOrder_name_idx" ON "public"."OwnedMediaCollection"("sortOrder", "name");

-- CreateIndex
CREATE INDEX "OwnedMediaCollectionItem_ownedMediaId_idx" ON "public"."OwnedMediaCollectionItem"("ownedMediaId");

-- CreateIndex
CREATE INDEX "OwnedMediaCollectionItem_collectionId_sortOrder_idx" ON "public"."OwnedMediaCollectionItem"("collectionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "OwnedMediaCollectionItem_collectionId_ownedMediaId_key" ON "public"."OwnedMediaCollectionItem"("collectionId", "ownedMediaId");

-- CreateIndex
CREATE INDEX "OwnedMediaReviewLog_ownedMediaId_createdAt_idx" ON "public"."OwnedMediaReviewLog"("ownedMediaId", "createdAt");

-- CreateIndex
CREATE INDEX "OwnedMediaReviewLog_userId_createdAt_idx" ON "public"."OwnedMediaReviewLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OwnedMediaDerivativeJob_sourceAssetId_status_idx" ON "public"."OwnedMediaDerivativeJob"("sourceAssetId", "status");

-- CreateIndex
CREATE INDEX "OwnedMediaDerivativeJob_status_priority_idx" ON "public"."OwnedMediaDerivativeJob"("status", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "SignupSheetDocument_ownedMediaId_key" ON "public"."SignupSheetDocument"("ownedMediaId");

-- CreateIndex
CREATE INDEX "SignupSheetDocument_status_updatedAt_idx" ON "public"."SignupSheetDocument"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "SignupSheetExtraction_documentId_createdAt_idx" ON "public"."SignupSheetExtraction"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "SignupSheetEntry_documentId_approvalStatus_idx" ON "public"."SignupSheetEntry"("documentId", "approvalStatus");

-- CreateIndex
CREATE INDEX "SignupSheetEntry_extractionId_rowIndex_idx" ON "public"."SignupSheetEntry"("extractionId", "rowIndex");

-- CreateIndex
CREATE INDEX "SignupSheetEntry_approvalStatus_confidenceScore_idx" ON "public"."SignupSheetEntry"("approvalStatus", "confidenceScore");

-- CreateIndex
CREATE INDEX "VolunteerMatchCandidate_entryId_score_idx" ON "public"."VolunteerMatchCandidate"("entryId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerMatchCandidate_entryId_voterRecordId_key" ON "public"."VolunteerMatchCandidate"("entryId", "voterRecordId");

-- CreateIndex
CREATE INDEX "CommunicationThread_threadStatus_lastMessageAt_idx" ON "public"."CommunicationThread"("threadStatus", "lastMessageAt");

-- CreateIndex
CREATE INDEX "CommunicationThread_unreadCount_priorityScore_idx" ON "public"."CommunicationThread"("unreadCount", "priorityScore");

-- CreateIndex
CREATE INDEX "CommunicationThread_countyId_threadStatus_idx" ON "public"."CommunicationThread"("countyId", "threadStatus");

-- CreateIndex
CREATE INDEX "CommunicationThread_userId_idx" ON "public"."CommunicationThread"("userId");

-- CreateIndex
CREATE INDEX "CommunicationThread_lastMessageAt_idx" ON "public"."CommunicationThread"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationMessage_communicationCampaignRecipientId_key" ON "public"."CommunicationMessage"("communicationCampaignRecipientId");

-- CreateIndex
CREATE INDEX "CommunicationMessage_threadId_createdAt_idx" ON "public"."CommunicationMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunicationMessage_provider_providerMessageId_idx" ON "public"."CommunicationMessage"("provider", "providerMessageId");

-- CreateIndex
CREATE INDEX "CommunicationMessage_communicationCampaignId_createdAt_idx" ON "public"."CommunicationMessage"("communicationCampaignId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunicationMessage_gmailMessageId_idx" ON "public"."CommunicationMessage"("gmailMessageId");

-- CreateIndex
CREATE INDEX "CommunicationTemplate_templateType_channel_idx" ON "public"."CommunicationTemplate"("templateType", "channel");

-- CreateIndex
CREATE INDEX "AudienceSegment_name_idx" ON "public"."AudienceSegment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationCampaign_orchestrationIdempotencyKey_key" ON "public"."CommunicationCampaign"("orchestrationIdempotencyKey");

-- CreateIndex
CREATE INDEX "CommunicationCampaign_status_scheduledAt_idx" ON "public"."CommunicationCampaign"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "CommunicationCampaign_eventId_status_idx" ON "public"."CommunicationCampaign"("eventId", "status");

-- CreateIndex
CREATE INDEX "CommunicationCampaign_status_createdAt_idx" ON "public"."CommunicationCampaign"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CommunicationCampaign_automationStatus_status_idx" ON "public"."CommunicationCampaign"("automationStatus", "status");

-- CreateIndex
CREATE INDEX "CommunicationCampaign_triggerSourceType_triggerSourceId_idx" ON "public"."CommunicationCampaign"("triggerSourceType", "triggerSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationCampaignRecipient_idempotencyKey_key" ON "public"."CommunicationCampaignRecipient"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CommunicationCampaignRecipient_communicationCampaignId_send_idx" ON "public"."CommunicationCampaignRecipient"("communicationCampaignId", "sendStatus");

-- CreateIndex
CREATE INDEX "CommunicationCampaignRecipient_communicationCampaignId_id_idx" ON "public"."CommunicationCampaignRecipient"("communicationCampaignId", "id");

-- CreateIndex
CREATE INDEX "CommunicationCampaignRecipient_userId_idx" ON "public"."CommunicationCampaignRecipient"("userId");

-- CreateIndex
CREATE INDEX "CommunicationCampaignRecipient_sendStatus_updatedAt_idx" ON "public"."CommunicationCampaignRecipient"("sendStatus", "updatedAt");

-- CreateIndex
CREATE INDEX "CommunicationActionQueue_queueStatus_scheduledAt_idx" ON "public"."CommunicationActionQueue"("queueStatus", "scheduledAt");

-- CreateIndex
CREATE INDEX "CommunicationActionQueue_threadId_idx" ON "public"."CommunicationActionQueue"("threadId");

-- CreateIndex
CREATE INDEX "CommunicationActionQueue_queueStatus_createdAt_idx" ON "public"."CommunicationActionQueue"("queueStatus", "createdAt");

-- CreateIndex
CREATE INDEX "CommunicationActionQueue_eventId_queueStatus_idx" ON "public"."CommunicationActionQueue"("eventId", "queueStatus");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationTag_key_key" ON "public"."CommunicationTag"("key");

-- CreateIndex
CREATE INDEX "CommunicationThreadTag_tagId_idx" ON "public"."CommunicationThreadTag"("tagId");

-- CreateIndex
CREATE INDEX "CommunicationPlan_status_updatedAt_idx" ON "public"."CommunicationPlan"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "CommunicationPlan_objective_status_idx" ON "public"."CommunicationPlan"("objective", "status");

-- CreateIndex
CREATE INDEX "CommunicationPlan_scheduledAt_idx" ON "public"."CommunicationPlan"("scheduledAt");

-- CreateIndex
CREATE INDEX "CommunicationPlan_ownerUserId_idx" ON "public"."CommunicationPlan"("ownerUserId");

-- CreateIndex
CREATE INDEX "CommunicationPlan_status_scheduledAt_idx" ON "public"."CommunicationPlan"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "CommunicationPlan_sourceWorkflowIntakeId_idx" ON "public"."CommunicationPlan"("sourceWorkflowIntakeId");

-- CreateIndex
CREATE INDEX "CommunicationPlan_sourceCampaignTaskId_idx" ON "public"."CommunicationPlan"("sourceCampaignTaskId");

-- CreateIndex
CREATE INDEX "CommunicationPlan_sourceEventId_idx" ON "public"."CommunicationPlan"("sourceEventId");

-- CreateIndex
CREATE INDEX "CommunicationPlan_sourceSocialContentItemId_idx" ON "public"."CommunicationPlan"("sourceSocialContentItemId");

-- CreateIndex
CREATE INDEX "CommunicationDraft_communicationPlanId_idx" ON "public"."CommunicationDraft"("communicationPlanId");

-- CreateIndex
CREATE INDEX "CommunicationDraft_status_idx" ON "public"."CommunicationDraft"("status");

-- CreateIndex
CREATE INDEX "CommunicationDraft_channel_idx" ON "public"."CommunicationDraft"("channel");

-- CreateIndex
CREATE INDEX "CommunicationDraft_isPrimary_idx" ON "public"."CommunicationDraft"("isPrimary");

-- CreateIndex
CREATE INDEX "CommunicationDraft_messageToneMode_idx" ON "public"."CommunicationDraft"("messageToneMode");

-- CreateIndex
CREATE INDEX "CommunicationDraft_messageTacticMode_idx" ON "public"."CommunicationDraft"("messageTacticMode");

-- CreateIndex
CREATE INDEX "CommunicationVariant_communicationDraftId_idx" ON "public"."CommunicationVariant"("communicationDraftId");

-- CreateIndex
CREATE INDEX "CommunicationVariant_targetSegmentId_idx" ON "public"."CommunicationVariant"("targetSegmentId");

-- CreateIndex
CREATE INDEX "CommunicationVariant_status_idx" ON "public"."CommunicationVariant"("status");

-- CreateIndex
CREATE INDEX "CommunicationVariant_reviewRequestedByUserId_idx" ON "public"."CommunicationVariant"("reviewRequestedByUserId");

-- CreateIndex
CREATE INDEX "CommunicationVariant_reviewedByUserId_idx" ON "public"."CommunicationVariant"("reviewedByUserId");

-- CreateIndex
CREATE INDEX "CommunicationSend_communicationPlanId_idx" ON "public"."CommunicationSend"("communicationPlanId");

-- CreateIndex
CREATE INDEX "CommunicationSend_communicationDraftId_idx" ON "public"."CommunicationSend"("communicationDraftId");

-- CreateIndex
CREATE INDEX "CommunicationSend_communicationVariantId_idx" ON "public"."CommunicationSend"("communicationVariantId");

-- CreateIndex
CREATE INDEX "CommunicationSend_status_idx" ON "public"."CommunicationSend"("status");

-- CreateIndex
CREATE INDEX "CommunicationSend_scheduledAt_idx" ON "public"."CommunicationSend"("scheduledAt");

-- CreateIndex
CREATE INDEX "CommunicationSend_channel_idx" ON "public"."CommunicationSend"("channel");

-- CreateIndex
CREATE INDEX "CommunicationSend_queuedByUserId_idx" ON "public"."CommunicationSend"("queuedByUserId");

-- CreateIndex
CREATE INDEX "CommunicationSend_providerMessageId_idx" ON "public"."CommunicationSend"("providerMessageId");

-- CreateIndex
CREATE INDEX "CommunicationSend_lastRetriedByUserId_idx" ON "public"."CommunicationSend"("lastRetriedByUserId");

-- CreateIndex
CREATE INDEX "EmailWorkflowItem_status_priority_createdAt_idx" ON "public"."EmailWorkflowItem"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "EmailWorkflowItem_assignedToUserId_status_idx" ON "public"."EmailWorkflowItem"("assignedToUserId", "status");

-- CreateIndex
CREATE INDEX "EmailWorkflowItem_sourceType_status_idx" ON "public"."EmailWorkflowItem"("sourceType", "status");

-- CreateIndex
CREATE INDEX "EmailWorkflowItem_communicationThreadId_idx" ON "public"."EmailWorkflowItem"("communicationThreadId");

-- CreateIndex
CREATE INDEX "EmailWorkflowItem_communicationPlanId_idx" ON "public"."EmailWorkflowItem"("communicationPlanId");

-- CreateIndex
CREATE INDEX "EmailWorkflowItem_escalationLevel_status_idx" ON "public"."EmailWorkflowItem"("escalationLevel", "status");

-- CreateIndex
CREATE INDEX "EmailWorkflowItem_spamDisposition_status_idx" ON "public"."EmailWorkflowItem"("spamDisposition", "status");

-- CreateIndex
CREATE INDEX "EmailWorkflowItem_createdAt_idx" ON "public"."EmailWorkflowItem"("createdAt");

-- CreateIndex
CREATE INDEX "EmailWorkflowItem_emailContactProfileId_idx" ON "public"."EmailWorkflowItem"("emailContactProfileId");

-- CreateIndex
CREATE INDEX "EmailContactProfile_userId_idx" ON "public"."EmailContactProfile"("userId");

-- CreateIndex
CREATE INDEX "EmailContactProfile_volunteerProfileId_idx" ON "public"."EmailContactProfile"("volunteerProfileId");

-- CreateIndex
CREATE INDEX "EmailContactProfile_relationalContactId_idx" ON "public"."EmailContactProfile"("relationalContactId");

-- CreateIndex
CREATE INDEX "EmailContactProfile_primaryEmail_idx" ON "public"."EmailContactProfile"("primaryEmail");

-- CreateIndex
CREATE INDEX "EmailContactProfileFact_profileId_status_idx" ON "public"."EmailContactProfileFact"("profileId", "status");

-- CreateIndex
CREATE INDEX "EmailContactProfileFact_sourceEmailWorkflowItemId_idx" ON "public"."EmailContactProfileFact"("sourceEmailWorkflowItemId");

-- CreateIndex
CREATE INDEX "EmailContactProfileFactSuggestion_emailWorkflowItemId_statu_idx" ON "public"."EmailContactProfileFactSuggestion"("emailWorkflowItemId", "status");

-- CreateIndex
CREATE INDEX "EmailContactProfileFactSuggestion_profileId_status_idx" ON "public"."EmailContactProfileFactSuggestion"("profileId", "status");

-- CreateIndex
CREATE INDEX "EmailAudienceHint_emailWorkflowItemId_status_idx" ON "public"."EmailAudienceHint"("emailWorkflowItemId", "status");

-- CreateIndex
CREATE INDEX "EmailAudienceHint_profileId_status_idx" ON "public"."EmailAudienceHint"("profileId", "status");

-- CreateIndex
CREATE INDEX "EmailAudienceDefinition_status_updatedAt_idx" ON "public"."EmailAudienceDefinition"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "EmailAudiencePreviewRun_generatedAt_idx" ON "public"."EmailAudiencePreviewRun"("generatedAt");

-- CreateIndex
CREATE INDEX "EmailAudiencePreviewRun_audienceDefinitionId_idx" ON "public"."EmailAudiencePreviewRun"("audienceDefinitionId");

-- CreateIndex
CREATE INDEX "MessageStudioDraft_status_updatedAt_idx" ON "public"."MessageStudioDraft"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "MessageStudioDraft_updatedAt_idx" ON "public"."MessageStudioDraft"("updatedAt");

-- CreateIndex
CREATE INDEX "MessageStudioDraftRevision_draftId_createdAt_idx" ON "public"."MessageStudioDraftRevision"("draftId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageStudioDraftRevision_draftId_revisionNumber_key" ON "public"."MessageStudioDraftRevision"("draftId", "revisionNumber");

-- CreateIndex
CREATE INDEX "EmailContactImportBatch_status_createdAt_idx" ON "public"."EmailContactImportBatch"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EmailContactImportBatch_createdByUserId_idx" ON "public"."EmailContactImportBatch"("createdByUserId");

-- CreateIndex
CREATE INDEX "EmailContactImportRow_batchId_rowNumber_idx" ON "public"."EmailContactImportRow"("batchId", "rowNumber");

-- CreateIndex
CREATE INDEX "EmailContactImportRow_batchId_normalizedEmail_idx" ON "public"."EmailContactImportRow"("batchId", "normalizedEmail");

-- CreateIndex
CREATE INDEX "EmailContactImportRow_matchedProfileId_idx" ON "public"."EmailContactImportRow"("matchedProfileId");

-- CreateIndex
CREATE INDEX "EmailContactImportRow_committedProfileId_idx" ON "public"."EmailContactImportRow"("committedProfileId");

-- CreateIndex
CREATE INDEX "EmailContactImportDecision_batchId_decidedAt_idx" ON "public"."EmailContactImportDecision"("batchId", "decidedAt");

-- CreateIndex
CREATE INDEX "SendGridContactMap_email_idx" ON "public"."SendGridContactMap"("email");

-- CreateIndex
CREATE INDEX "SendGridContactMap_syncStatus_idx" ON "public"."SendGridContactMap"("syncStatus");

-- CreateIndex
CREATE INDEX "SendGridContactMap_emailContactProfileId_idx" ON "public"."SendGridContactMap"("emailContactProfileId");

-- CreateIndex
CREATE INDEX "SendGridContactMap_emailAudienceDefinitionId_idx" ON "public"."SendGridContactMap"("emailAudienceDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "SendGridAudienceMap_emailAudienceDefinitionId_key" ON "public"."SendGridAudienceMap"("emailAudienceDefinitionId");

-- CreateIndex
CREATE INDEX "SendGridSuppression_email_idx" ON "public"."SendGridSuppression"("email");

-- CreateIndex
CREATE INDEX "SendGridSuppression_suppressionType_occurredAt_idx" ON "public"."SendGridSuppression"("suppressionType", "occurredAt");

-- CreateIndex
CREATE INDEX "SendGridSuppression_occurredAt_idx" ON "public"."SendGridSuppression"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "SendGridEvent_sendgridEventId_key" ON "public"."SendGridEvent"("sendgridEventId");

-- CreateIndex
CREATE INDEX "SendGridEvent_eventType_occurredAt_idx" ON "public"."SendGridEvent"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "SendGridEvent_occurredAt_idx" ON "public"."SendGridEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "SendGridEvent_email_idx" ON "public"."SendGridEvent"("email");

-- CreateIndex
CREATE INDEX "SendGridContactSyncRun_audienceDefinitionId_createdAt_idx" ON "public"."SendGridContactSyncRun"("audienceDefinitionId", "createdAt");

-- CreateIndex
CREATE INDEX "SendGridContactSyncRun_status_createdAt_idx" ON "public"."SendGridContactSyncRun"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EmailSendExecution_status_updatedAt_idx" ON "public"."EmailSendExecution"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "EmailSendExecution_createdAt_idx" ON "public"."EmailSendExecution"("createdAt");

-- CreateIndex
CREATE INDEX "EmailSendExecution_messageStudioDraftId_idx" ON "public"."EmailSendExecution"("messageStudioDraftId");

-- CreateIndex
CREATE INDEX "EmailSendExecution_emailAudienceDefinitionId_idx" ON "public"."EmailSendExecution"("emailAudienceDefinitionId");

-- CreateIndex
CREATE INDEX "EmailSendRecipient_sendExecutionId_status_idx" ON "public"."EmailSendRecipient"("sendExecutionId", "status");

-- CreateIndex
CREATE INDEX "EmailSendRecipient_email_idx" ON "public"."EmailSendRecipient"("email");

-- CreateIndex
CREATE INDEX "EmailSendApproval_sendExecutionId_approvalType_idx" ON "public"."EmailSendApproval"("sendExecutionId", "approvalType");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_communicationSendId_idx" ON "public"."CommunicationRecipient"("communicationSendId");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_comsPlanAudienceSegmentId_idx" ON "public"."CommunicationRecipient"("comsPlanAudienceSegmentId");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_userId_idx" ON "public"."CommunicationRecipient"("userId");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_volunteerProfileId_idx" ON "public"."CommunicationRecipient"("volunteerProfileId");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_communicationThreadId_idx" ON "public"."CommunicationRecipient"("communicationThreadId");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_status_updatedAt_idx" ON "public"."CommunicationRecipient"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_crmContactKey_idx" ON "public"."CommunicationRecipient"("crmContactKey");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_deliveryHealthStatus_idx" ON "public"."CommunicationRecipient"("deliveryHealthStatus");

-- CreateIndex
CREATE INDEX "CommunicationRecipient_targetSegmentId_idx" ON "public"."CommunicationRecipient"("targetSegmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationRecipient_communicationSendId_channel_addressU_key" ON "public"."CommunicationRecipient"("communicationSendId", "channel", "addressUsed");

-- CreateIndex
CREATE INDEX "CommunicationRecipientEvent_communicationRecipientId_occurr_idx" ON "public"."CommunicationRecipientEvent"("communicationRecipientId", "occurredAt");

-- CreateIndex
CREATE INDEX "CommunicationRecipientEvent_eventType_occurredAt_idx" ON "public"."CommunicationRecipientEvent"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "CommunicationRecipientEvent_providerEventId_idx" ON "public"."CommunicationRecipientEvent"("providerEventId");

-- CreateIndex
CREATE INDEX "CommunicationLinkDefinition_communicationSendId_idx" ON "public"."CommunicationLinkDefinition"("communicationSendId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationLinkDefinition_communicationSendId_trackingKey_key" ON "public"."CommunicationLinkDefinition"("communicationSendId", "trackingKey");

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegment_communicationPlanId_idx" ON "public"."CommsPlanAudienceSegment"("communicationPlanId");

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegment_status_idx" ON "public"."CommsPlanAudienceSegment"("status");

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegment_segmentType_idx" ON "public"."CommsPlanAudienceSegment"("segmentType");

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegment_isDynamic_idx" ON "public"."CommsPlanAudienceSegment"("isDynamic");

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegment_name_idx" ON "public"."CommsPlanAudienceSegment"("name");

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegment_createdByUserId_idx" ON "public"."CommsPlanAudienceSegment"("createdByUserId");

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegmentMember_comsPlanAudienceSegmentId_idx" ON "public"."CommsPlanAudienceSegmentMember"("comsPlanAudienceSegmentId");

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegmentMember_userId_idx" ON "public"."CommsPlanAudienceSegmentMember"("userId");

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegmentMember_volunteerProfileId_idx" ON "public"."CommsPlanAudienceSegmentMember"("volunteerProfileId");

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegmentMember_crmContactKey_idx" ON "public"."CommsPlanAudienceSegmentMember"("crmContactKey");

-- CreateIndex
CREATE UNIQUE INDEX "CommsPlanAudienceSegmentMember_comsPlanAudienceSegmentId_us_key" ON "public"."CommsPlanAudienceSegmentMember"("comsPlanAudienceSegmentId", "userId");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_status_updatedAt_idx" ON "public"."MediaOutreachItem"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_type_status_idx" ON "public"."MediaOutreachItem"("type", "status");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_linkedCommunicationPlanId_idx" ON "public"."MediaOutreachItem"("linkedCommunicationPlanId");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_linkedWorkflowIntakeId_idx" ON "public"."MediaOutreachItem"("linkedWorkflowIntakeId");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_linkedConversationOpportunityId_idx" ON "public"."MediaOutreachItem"("linkedConversationOpportunityId");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_updatedAt_idx" ON "public"."MediaOutreachItem"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StaffGmailAccount_userId_key" ON "public"."StaffGmailAccount"("userId");

-- CreateIndex
CREATE INDEX "CalendarSource_sourceType_isActive_syncEnabled_idx" ON "public"."CalendarSource"("sourceType", "isActive", "syncEnabled");

-- CreateIndex
CREATE INDEX "CalendarSource_isPublicFacing_isActive_syncEnabled_idx" ON "public"."CalendarSource"("isPublicFacing", "isActive", "syncEnabled");

-- CreateIndex
CREATE INDEX "CalendarWatchChannel_calendarSourceId_expiration_idx" ON "public"."CalendarWatchChannel"("calendarSourceId", "expiration");

-- CreateIndex
CREATE INDEX "CalendarWatchChannel_channelId_idx" ON "public"."CalendarWatchChannel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyCampaignPlan_weekStart_key" ON "public"."WeeklyCampaignPlan"("weekStart");

-- CreateIndex
CREATE INDEX "WeeklyCampaignPlan_weekStart_idx" ON "public"."WeeklyCampaignPlan"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyBigRock_eventId_key" ON "public"."WeeklyBigRock"("eventId");

-- CreateIndex
CREATE INDEX "WeeklyBigRock_weekPlanId_sortOrder_idx" ON "public"."WeeklyBigRock"("weekPlanId", "sortOrder");

-- CreateIndex
CREATE INDEX "EventApproval_eventId_state_idx" ON "public"."EventApproval"("eventId", "state");

-- CreateIndex
CREATE INDEX "EventApproval_state_createdAt_idx" ON "public"."EventApproval"("state", "createdAt");

-- CreateIndex
CREATE INDEX "EventStageChangeLog_eventId_createdAt_idx" ON "public"."EventStageChangeLog"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "EventStageChangeLog_toState_createdAt_idx" ON "public"."EventStageChangeLog"("toState", "createdAt");

-- CreateIndex
CREATE INDEX "EventSyncLog_eventId_createdAt_idx" ON "public"."EventSyncLog"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "EventSyncLog_calendarSourceId_createdAt_idx" ON "public"."EventSyncLog"("calendarSourceId", "createdAt");

-- CreateIndex
CREATE INDEX "EventAnalyticsSnapshot_day_scope_idx" ON "public"."EventAnalyticsSnapshot"("day", "scope");

-- CreateIndex
CREATE INDEX "EventAnalyticsSnapshot_countyId_day_idx" ON "public"."EventAnalyticsSnapshot"("countyId", "day");

-- CreateIndex
CREATE INDEX "EventAnalyticsSnapshot_eventId_day_idx" ON "public"."EventAnalyticsSnapshot"("eventId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalMediaSource_slug_key" ON "public"."ExternalMediaSource"("slug");

-- CreateIndex
CREATE INDEX "ExternalMediaSource_isActive_priority_idx" ON "public"."ExternalMediaSource"("isActive", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalMediaMention_dedupeKey_key" ON "public"."ExternalMediaMention"("dedupeKey");

-- CreateIndex
CREATE INDEX "ExternalMediaMention_sourceId_publishedAt_idx" ON "public"."ExternalMediaMention"("sourceId", "publishedAt");

-- CreateIndex
CREATE INDEX "ExternalMediaMention_reviewStatus_publishedAt_idx" ON "public"."ExternalMediaMention"("reviewStatus", "publishedAt");

-- CreateIndex
CREATE INDEX "ExternalMediaMention_matchTier_publishedAt_idx" ON "public"."ExternalMediaMention"("matchTier", "publishedAt");

-- CreateIndex
CREATE INDEX "ExternalMediaMention_showOnPublicSite_publishedAt_idx" ON "public"."ExternalMediaMention"("showOnPublicSite", "publishedAt");

-- CreateIndex
CREATE INDEX "ExternalMediaMention_relatedCountyId_idx" ON "public"."ExternalMediaMention"("relatedCountyId");

-- CreateIndex
CREATE INDEX "ExternalMediaMention_relatedEventId_idx" ON "public"."ExternalMediaMention"("relatedEventId");

-- CreateIndex
CREATE INDEX "ExternalMediaIngestRun_startedAt_idx" ON "public"."ExternalMediaIngestRun"("startedAt");

-- CreateIndex
CREATE INDEX "OppositionEntity_name_idx" ON "public"."OppositionEntity"("name");

-- CreateIndex
CREATE INDEX "OppositionEntity_type_idx" ON "public"."OppositionEntity"("type");

-- CreateIndex
CREATE INDEX "OppositionSource_sourceType_idx" ON "public"."OppositionSource"("sourceType");

-- CreateIndex
CREATE INDEX "OppositionSource_reviewStatus_idx" ON "public"."OppositionSource"("reviewStatus");

-- CreateIndex
CREATE INDEX "OppositionSource_publishedAt_idx" ON "public"."OppositionSource"("publishedAt");

-- CreateIndex
CREATE INDEX "OppositionBillRecord_entityId_idx" ON "public"."OppositionBillRecord"("entityId");

-- CreateIndex
CREATE INDEX "OppositionBillRecord_sourceId_idx" ON "public"."OppositionBillRecord"("sourceId");

-- CreateIndex
CREATE INDEX "OppositionVoteRecord_entityId_idx" ON "public"."OppositionVoteRecord"("entityId");

-- CreateIndex
CREATE INDEX "OppositionVoteRecord_sourceId_idx" ON "public"."OppositionVoteRecord"("sourceId");

-- CreateIndex
CREATE INDEX "OppositionFinanceRecord_entityId_idx" ON "public"."OppositionFinanceRecord"("entityId");

-- CreateIndex
CREATE INDEX "OppositionFinanceRecord_sourceId_idx" ON "public"."OppositionFinanceRecord"("sourceId");

-- CreateIndex
CREATE INDEX "OppositionMessageRecord_entityId_idx" ON "public"."OppositionMessageRecord"("entityId");

-- CreateIndex
CREATE INDEX "OppositionMessageRecord_sourceId_idx" ON "public"."OppositionMessageRecord"("sourceId");

-- CreateIndex
CREATE INDEX "OppositionVideoRecord_entityId_idx" ON "public"."OppositionVideoRecord"("entityId");

-- CreateIndex
CREATE INDEX "OppositionVideoRecord_sourceId_idx" ON "public"."OppositionVideoRecord"("sourceId");

-- CreateIndex
CREATE INDEX "OppositionNewsMention_entityId_idx" ON "public"."OppositionNewsMention"("entityId");

-- CreateIndex
CREATE INDEX "OppositionNewsMention_sourceId_idx" ON "public"."OppositionNewsMention"("sourceId");

-- CreateIndex
CREATE INDEX "OppositionElectionPattern_entityId_idx" ON "public"."OppositionElectionPattern"("entityId");

-- CreateIndex
CREATE INDEX "OppositionElectionPattern_sourceId_idx" ON "public"."OppositionElectionPattern"("sourceId");

-- CreateIndex
CREATE INDEX "OppositionAccountabilityItem_entityId_idx" ON "public"."OppositionAccountabilityItem"("entityId");

-- CreateIndex
CREATE INDEX "OppositionAccountabilityItem_sourceId_idx" ON "public"."OppositionAccountabilityItem"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "counties_slug_key" ON "public"."counties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "counties_fips_key" ON "public"."counties"("fips");

-- CreateIndex
CREATE INDEX "counties_published_sortOrder_idx" ON "public"."counties"("published", "sortOrder");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_linkedVoterRecordId_fkey" FOREIGN KEY ("linkedVoterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComplianceDocument" ADD CONSTRAINT "ComplianceDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_relatedUserId_fkey" FOREIGN KEY ("relatedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FieldUnit" ADD CONSTRAINT "FieldUnit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."FieldUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FieldAssignment" ADD CONSTRAINT "FieldAssignment_fieldUnitId_fkey" FOREIGN KEY ("fieldUnitId") REFERENCES "public"."FieldUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FieldAssignment" ADD CONSTRAINT "FieldAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FieldAssignment" ADD CONSTRAINT "FieldAssignment_positionSeatId_fkey" FOREIGN KEY ("positionSeatId") REFERENCES "public"."PositionSeat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BudgetLine" ADD CONSTRAINT "BudgetLine_budgetPlanId_fkey" FOREIGN KEY ("budgetPlanId") REFERENCES "public"."BudgetPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PositionSeat" ADD CONSTRAINT "PositionSeat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactPreference" ADD CONSTRAINT "ContactPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactPreference" ADD CONSTRAINT "ContactPreference_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactPreference" ADD CONSTRAINT "ContactPreference_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Commitment" ADD CONSTRAINT "Commitment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowIntake" ADD CONSTRAINT "WorkflowIntake_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowIntake" ADD CONSTRAINT "WorkflowIntake_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowIntake" ADD CONSTRAINT "WorkflowIntake_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventRequest" ADD CONSTRAINT "EventRequest_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventRequest" ADD CONSTRAINT "EventRequest_campaignEventId_fkey" FOREIGN KEY ("campaignEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowAction" ADD CONSTRAINT "WorkflowAction_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowAction" ADD CONSTRAINT "WorkflowAction_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialContentItem" ADD CONSTRAINT "SocialContentItem_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialContentItem" ADD CONSTRAINT "SocialContentItem_campaignEventId_fkey" FOREIGN KEY ("campaignEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialContentItem" ADD CONSTRAINT "SocialContentItem_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_sourceSocialContentItemId_fkey" FOREIGN KEY ("sourceSocialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_createdSocialContentItemId_fkey" FOREIGN KEY ("createdSocialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_createdWorkflowIntakeId_fkey" FOREIGN KEY ("createdWorkflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_executedSocialContentItemId_fkey" FOREIGN KEY ("executedSocialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialContentDraft" ADD CONSTRAINT "SocialContentDraft_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialContentDraft" ADD CONSTRAINT "SocialContentDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialPlatformVariant" ADD CONSTRAINT "SocialPlatformVariant_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialPlatformVariant" ADD CONSTRAINT "SocialPlatformVariant_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "public"."SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialPerformanceSnapshot" ADD CONSTRAINT "SocialPerformanceSnapshot_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialPerformanceSnapshot" ADD CONSTRAINT "SocialPerformanceSnapshot_socialPlatformVariantId_fkey" FOREIGN KEY ("socialPlatformVariantId") REFERENCES "public"."SocialPlatformVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialPerformanceSnapshot" ADD CONSTRAINT "SocialPerformanceSnapshot_conversionCampaignEventId_fkey" FOREIGN KEY ("conversionCampaignEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialContentStrategicInsight" ADD CONSTRAINT "SocialContentStrategicInsight_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationWatchlist" ADD CONSTRAINT "ConversationWatchlist_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationWatchlist" ADD CONSTRAINT "ConversationWatchlist_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationItem" ADD CONSTRAINT "ConversationItem_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationItem" ADD CONSTRAINT "ConversationItem_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "public"."ConversationWatchlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationAnalysis" ADD CONSTRAINT "ConversationAnalysis_conversationItemId_fkey" FOREIGN KEY ("conversationItemId") REFERENCES "public"."ConversationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationCluster" ADD CONSTRAINT "ConversationCluster_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationClusterItem" ADD CONSTRAINT "ConversationClusterItem_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "public"."ConversationCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationClusterItem" ADD CONSTRAINT "ConversationClusterItem_conversationItemId_fkey" FOREIGN KEY ("conversationItemId") REFERENCES "public"."ConversationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_primaryConversationItemId_fkey" FOREIGN KEY ("primaryConversationItemId") REFERENCES "public"."ConversationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "public"."ConversationCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_socialPlatformVariantId_fkey" FOREIGN KEY ("socialPlatformVariantId") REFERENCES "public"."SocialPlatformVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SyncedPost" ADD CONSTRAINT "SyncedPost_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentItemOverride" ADD CONSTRAINT "ContentItemOverride_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InboundContentItem" ADD CONSTRAINT "InboundContentItem_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "public"."media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InboundContentItem" ADD CONSTRAINT "InboundContentItem_syncedPostId_fkey" FOREIGN KEY ("syncedPostId") REFERENCES "public"."SyncedPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentDecision" ADD CONSTRAINT "ContentDecision_inboundItemId_fkey" FOREIGN KEY ("inboundItemId") REFERENCES "public"."InboundContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlatformMetricSnapshot" ADD CONSTRAINT "PlatformMetricSnapshot_platformConnectionId_fkey" FOREIGN KEY ("platformConnectionId") REFERENCES "public"."PlatformConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_linkedCampaignEventId_fkey" FOREIGN KEY ("linkedCampaignEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_parentAssetId_fkey" FOREIGN KEY ("parentAssetId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_rootAssetId_fkey" FOREIGN KEY ("rootAssetId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_mediaIngestBatchId_fkey" FOREIGN KEY ("mediaIngestBatchId") REFERENCES "public"."MediaIngestBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaAnnotation" ADD CONSTRAINT "OwnedMediaAnnotation_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaAnnotation" ADD CONSTRAINT "OwnedMediaAnnotation_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaTranscript" ADD CONSTRAINT "OwnedMediaTranscript_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaQuoteCandidate" ADD CONSTRAINT "OwnedMediaQuoteCandidate_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaQuoteCandidate" ADD CONSTRAINT "OwnedMediaQuoteCandidate_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "public"."OwnedMediaTranscript"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionContestResult" ADD CONSTRAINT "ElectionContestResult_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."ElectionResultSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionCountyResult" ADD CONSTRAINT "ElectionCountyResult_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."ElectionResultSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionCountyResult" ADD CONSTRAINT "ElectionCountyResult_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "public"."ElectionContestResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionCountyResult" ADD CONSTRAINT "ElectionCountyResult_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionCandidateResult" ADD CONSTRAINT "ElectionCandidateResult_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "public"."ElectionContestResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionCandidateResult" ADD CONSTRAINT "ElectionCandidateResult_countyResultId_fkey" FOREIGN KEY ("countyResultId") REFERENCES "public"."ElectionCountyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionPrecinctResult" ADD CONSTRAINT "ElectionPrecinctResult_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."ElectionResultSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionPrecinctResult" ADD CONSTRAINT "ElectionPrecinctResult_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "public"."ElectionContestResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionPrecinctResult" ADD CONSTRAINT "ElectionPrecinctResult_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ElectionPrecinctCandidateResult" ADD CONSTRAINT "ElectionPrecinctCandidateResult_precinctResultId_fkey" FOREIGN KEY ("precinctResultId") REFERENCES "public"."ElectionPrecinctResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CountyCampaignStats" ADD CONSTRAINT "CountyCampaignStats_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CountyPublicDemographics" ADD CONSTRAINT "CountyPublicDemographics_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CountyRegistrationSnapshot" ADD CONSTRAINT "CountyRegistrationSnapshot_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CountyStrategyKpi" ADD CONSTRAINT "CountyStrategyKpi_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CountyElectedOfficial" ADD CONSTRAINT "CountyElectedOfficial_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterFileSnapshot" ADD CONSTRAINT "VoterFileSnapshot_previousSnapshotId_fkey" FOREIGN KEY ("previousSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CountyVoterMetrics" ADD CONSTRAINT "CountyVoterMetrics_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CountyVoterMetrics" ADD CONSTRAINT "CountyVoterMetrics_voterFileSnapshotId_fkey" FOREIGN KEY ("voterFileSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterRecord" ADD CONSTRAINT "VoterRecord_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterRecord" ADD CONSTRAINT "VoterRecord_firstSeenSnapshotId_fkey" FOREIGN KEY ("firstSeenSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterRecord" ADD CONSTRAINT "VoterRecord_lastSeenSnapshotId_fkey" FOREIGN KEY ("lastSeenSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterRecord" ADD CONSTRAINT "VoterRecord_updatedFromSnapshotId_fkey" FOREIGN KEY ("updatedFromSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterRecord" ADD CONSTRAINT "VoterRecord_droppedAtSnapshotId_fkey" FOREIGN KEY ("droppedAtSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterElectionParticipation" ADD CONSTRAINT "VoterElectionParticipation_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterSignal" ADD CONSTRAINT "VoterSignal_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterSignal" ADD CONSTRAINT "VoterSignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterSignal" ADD CONSTRAINT "VoterSignal_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "public"."RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterModelClassification" ADD CONSTRAINT "VoterModelClassification_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterModelClassification" ADD CONSTRAINT "VoterModelClassification_overriddenByUserId_fkey" FOREIGN KEY ("overriddenByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterInteraction" ADD CONSTRAINT "VoterInteraction_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterInteraction" ADD CONSTRAINT "VoterInteraction_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "public"."RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterInteraction" ADD CONSTRAINT "VoterInteraction_contactedByUserId_fkey" FOREIGN KEY ("contactedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterInteraction" ADD CONSTRAINT "VoterInteraction_relatedVolunteerUserId_fkey" FOREIGN KEY ("relatedVolunteerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RelationalContact" ADD CONSTRAINT "RelationalContact_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RelationalContact" ADD CONSTRAINT "RelationalContact_matchedVoterRecordId_fkey" FOREIGN KEY ("matchedVoterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RelationalContact" ADD CONSTRAINT "RelationalContact_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RelationalContact" ADD CONSTRAINT "RelationalContact_fieldUnitId_fkey" FOREIGN KEY ("fieldUnitId") REFERENCES "public"."FieldUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterVotePlan" ADD CONSTRAINT "VoterVotePlan_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterVotePlan" ADD CONSTRAINT "VoterVotePlan_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_voterFileSnapshotId_fkey" FOREIGN KEY ("voterFileSnapshotId") REFERENCES "public"."VoterFileSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignEvent" ADD CONSTRAINT "CampaignEvent_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignEvent" ADD CONSTRAINT "CampaignEvent_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignEvent" ADD CONSTRAINT "CampaignEvent_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignEvent" ADD CONSTRAINT "CampaignEvent_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "public"."CalendarSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArkansasFestivalIngest" ADD CONSTRAINT "ArkansasFestivalIngest_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArkansasFestivalIngest" ADD CONSTRAINT "ArkansasFestivalIngest_promotedCampaignEventId_fkey" FOREIGN KEY ("promotedCampaignEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ArkansasFestivalIngest" ADD CONSTRAINT "ArkansasFestivalIngest_ingestRunId_fkey" FOREIGN KEY ("ingestRunId") REFERENCES "public"."FestivalIngestRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "public"."WorkflowRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "public"."CampaignTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignTask" ADD CONSTRAINT "CampaignTask_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowTemplateTask" ADD CONSTRAINT "WorkflowTemplateTask_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "public"."WorkflowTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "public"."WorkflowTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "public"."WorkflowRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventSignup" ADD CONSTRAINT "EventSignup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventSignup" ADD CONSTRAINT "EventSignup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventSignup" ADD CONSTRAINT "EventSignup_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventSignup" ADD CONSTRAINT "EventSignup_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamRoleAssignment" ADD CONSTRAINT "TeamRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamRoleAssignment" ADD CONSTRAINT "TeamRoleAssignment_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaIngestBatch" ADD CONSTRAINT "MediaIngestBatch_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaCollectionItem" ADD CONSTRAINT "OwnedMediaCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."OwnedMediaCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaCollectionItem" ADD CONSTRAINT "OwnedMediaCollectionItem_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaReviewLog" ADD CONSTRAINT "OwnedMediaReviewLog_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaReviewLog" ADD CONSTRAINT "OwnedMediaReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OwnedMediaDerivativeJob" ADD CONSTRAINT "OwnedMediaDerivativeJob_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SignupSheetDocument" ADD CONSTRAINT "SignupSheetDocument_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "public"."OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SignupSheetDocument" ADD CONSTRAINT "SignupSheetDocument_lastExtractionId_fkey" FOREIGN KEY ("lastExtractionId") REFERENCES "public"."SignupSheetExtraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SignupSheetDocument" ADD CONSTRAINT "SignupSheetDocument_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SignupSheetExtraction" ADD CONSTRAINT "SignupSheetExtraction_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."SignupSheetDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."SignupSheetDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_extractionId_fkey" FOREIGN KEY ("extractionId") REFERENCES "public"."SignupSheetExtraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_matchedVoterRecordId_fkey" FOREIGN KEY ("matchedVoterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_matchedUserId_fkey" FOREIGN KEY ("matchedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VolunteerMatchCandidate" ADD CONSTRAINT "VolunteerMatchCandidate_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."SignupSheetEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VolunteerMatchCandidate" ADD CONSTRAINT "VolunteerMatchCandidate_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "public"."VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationThread" ADD CONSTRAINT "CommunicationThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationThread" ADD CONSTRAINT "CommunicationThread_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationThread" ADD CONSTRAINT "CommunicationThread_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationThread" ADD CONSTRAINT "CommunicationThread_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_communicationCampaignId_fkey" FOREIGN KEY ("communicationCampaignId") REFERENCES "public"."CommunicationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_communicationCampaignRecipientId_fkey" FOREIGN KEY ("communicationCampaignRecipientId") REFERENCES "public"."CommunicationCampaignRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationTemplate" ADD CONSTRAINT "CommunicationTemplate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AudienceSegment" ADD CONSTRAINT "AudienceSegment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."CommunicationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_audienceSegmentId_fkey" FOREIGN KEY ("audienceSegmentId") REFERENCES "public"."AudienceSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_communicationCampaignId_fkey" FOREIGN KEY ("communicationCampaignId") REFERENCES "public"."CommunicationCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_targetVolunteerProfileId_fkey" FOREIGN KEY ("targetVolunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationThreadTag" ADD CONSTRAINT "CommunicationThreadTag_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationThreadTag" ADD CONSTRAINT "CommunicationThreadTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."CommunicationTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceWorkflowIntakeId_fkey" FOREIGN KEY ("sourceWorkflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceCampaignTaskId_fkey" FOREIGN KEY ("sourceCampaignTaskId") REFERENCES "public"."CampaignTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceEventId_fkey" FOREIGN KEY ("sourceEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceSocialContentItemId_fkey" FOREIGN KEY ("sourceSocialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "public"."CommunicationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_reviewRequestedByUserId_fkey" FOREIGN KEY ("reviewRequestedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationVariant" ADD CONSTRAINT "CommunicationVariant_communicationDraftId_fkey" FOREIGN KEY ("communicationDraftId") REFERENCES "public"."CommunicationDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationVariant" ADD CONSTRAINT "CommunicationVariant_reviewRequestedByUserId_fkey" FOREIGN KEY ("reviewRequestedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationVariant" ADD CONSTRAINT "CommunicationVariant_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "public"."CommunicationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_communicationDraftId_fkey" FOREIGN KEY ("communicationDraftId") REFERENCES "public"."CommunicationDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_communicationVariantId_fkey" FOREIGN KEY ("communicationVariantId") REFERENCES "public"."CommunicationVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_queuedByUserId_fkey" FOREIGN KEY ("queuedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationSend" ADD CONSTRAINT "CommunicationSend_lastRetriedByUserId_fkey" FOREIGN KEY ("lastRetriedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "public"."CommunicationPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationSendId_fkey" FOREIGN KEY ("communicationSendId") REFERENCES "public"."CommunicationSend"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_campaignTaskId_fkey" FOREIGN KEY ("campaignTaskId") REFERENCES "public"."CampaignTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_conversationOpportunityId_fkey" FOREIGN KEY ("conversationOpportunityId") REFERENCES "public"."ConversationOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "public"."SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_comsPlanAudienceSegmentId_fkey" FOREIGN KEY ("comsPlanAudienceSegmentId") REFERENCES "public"."CommsPlanAudienceSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationMessageId_fkey" FOREIGN KEY ("communicationMessageId") REFERENCES "public"."CommunicationMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactProfile" ADD CONSTRAINT "EmailContactProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactProfile" ADD CONSTRAINT "EmailContactProfile_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactProfile" ADD CONSTRAINT "EmailContactProfile_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "public"."RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactProfileFact" ADD CONSTRAINT "EmailContactProfileFact_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactProfileFact" ADD CONSTRAINT "EmailContactProfileFact_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactProfileFactSuggestion" ADD CONSTRAINT "EmailContactProfileFactSuggestion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactProfileFactSuggestion" ADD CONSTRAINT "EmailContactProfileFactSuggestion_emailWorkflowItemId_fkey" FOREIGN KEY ("emailWorkflowItemId") REFERENCES "public"."EmailWorkflowItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactProfileFactSuggestion" ADD CONSTRAINT "EmailContactProfileFactSuggestion_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAudienceHint" ADD CONSTRAINT "EmailAudienceHint_emailWorkflowItemId_fkey" FOREIGN KEY ("emailWorkflowItemId") REFERENCES "public"."EmailWorkflowItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAudienceHint" ADD CONSTRAINT "EmailAudienceHint_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAudienceHint" ADD CONSTRAINT "EmailAudienceHint_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAudienceDefinition" ADD CONSTRAINT "EmailAudienceDefinition_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAudienceDefinition" ADD CONSTRAINT "EmailAudienceDefinition_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAudiencePreviewRun" ADD CONSTRAINT "EmailAudiencePreviewRun_audienceDefinitionId_fkey" FOREIGN KEY ("audienceDefinitionId") REFERENCES "public"."EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAudiencePreviewRun" ADD CONSTRAINT "EmailAudiencePreviewRun_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_assignedReviewerUserId_fkey" FOREIGN KEY ("assignedReviewerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageStudioDraftRevision" ADD CONSTRAINT "MessageStudioDraftRevision_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "public"."MessageStudioDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageStudioDraftRevision" ADD CONSTRAINT "MessageStudioDraftRevision_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactImportBatch" ADD CONSTRAINT "EmailContactImportBatch_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactImportBatch" ADD CONSTRAINT "EmailContactImportBatch_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactImportRow" ADD CONSTRAINT "EmailContactImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."EmailContactImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactImportRow" ADD CONSTRAINT "EmailContactImportRow_matchedProfileId_fkey" FOREIGN KEY ("matchedProfileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactImportRow" ADD CONSTRAINT "EmailContactImportRow_committedProfileId_fkey" FOREIGN KEY ("committedProfileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactImportDecision" ADD CONSTRAINT "EmailContactImportDecision_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."EmailContactImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactImportDecision" ADD CONSTRAINT "EmailContactImportDecision_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."EmailContactImportRow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContactImportDecision" ADD CONSTRAINT "EmailContactImportDecision_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SendGridContactMap" ADD CONSTRAINT "SendGridContactMap_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SendGridContactMap" ADD CONSTRAINT "SendGridContactMap_emailAudienceDefinitionId_fkey" FOREIGN KEY ("emailAudienceDefinitionId") REFERENCES "public"."EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SendGridAudienceMap" ADD CONSTRAINT "SendGridAudienceMap_emailAudienceDefinitionId_fkey" FOREIGN KEY ("emailAudienceDefinitionId") REFERENCES "public"."EmailAudienceDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SendGridContactSyncRun" ADD CONSTRAINT "SendGridContactSyncRun_audienceDefinitionId_fkey" FOREIGN KEY ("audienceDefinitionId") REFERENCES "public"."EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SendGridContactSyncRun" ADD CONSTRAINT "SendGridContactSyncRun_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SendGridContactSyncRun" ADD CONSTRAINT "SendGridContactSyncRun_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_messageStudioDraftId_fkey" FOREIGN KEY ("messageStudioDraftId") REFERENCES "public"."MessageStudioDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_emailAudienceDefinitionId_fkey" FOREIGN KEY ("emailAudienceDefinitionId") REFERENCES "public"."EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_sendGridContactSyncRunId_fkey" FOREIGN KEY ("sendGridContactSyncRunId") REFERENCES "public"."SendGridContactSyncRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_preflightByUserId_fkey" FOREIGN KEY ("preflightByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendRecipient" ADD CONSTRAINT "EmailSendRecipient_sendExecutionId_fkey" FOREIGN KEY ("sendExecutionId") REFERENCES "public"."EmailSendExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendRecipient" ADD CONSTRAINT "EmailSendRecipient_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "public"."EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendApproval" ADD CONSTRAINT "EmailSendApproval_sendExecutionId_fkey" FOREIGN KEY ("sendExecutionId") REFERENCES "public"."EmailSendExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSendApproval" ADD CONSTRAINT "EmailSendApproval_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_communicationSendId_fkey" FOREIGN KEY ("communicationSendId") REFERENCES "public"."CommunicationSend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_comsPlanAudienceSegmentId_fkey" FOREIGN KEY ("comsPlanAudienceSegmentId") REFERENCES "public"."CommsPlanAudienceSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "public"."CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationRecipientEvent" ADD CONSTRAINT "CommunicationRecipientEvent_communicationRecipientId_fkey" FOREIGN KEY ("communicationRecipientId") REFERENCES "public"."CommunicationRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunicationLinkDefinition" ADD CONSTRAINT "CommunicationLinkDefinition_communicationSendId_fkey" FOREIGN KEY ("communicationSendId") REFERENCES "public"."CommunicationSend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommsPlanAudienceSegment" ADD CONSTRAINT "CommsPlanAudienceSegment_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "public"."CommunicationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommsPlanAudienceSegment" ADD CONSTRAINT "CommsPlanAudienceSegment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommsPlanAudienceSegment" ADD CONSTRAINT "CommsPlanAudienceSegment_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_comsPlanAudienceSegmentId_fkey" FOREIGN KEY ("comsPlanAudienceSegmentId") REFERENCES "public"."CommsPlanAudienceSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "public"."VolunteerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaOutreachItem" ADD CONSTRAINT "MediaOutreachItem_linkedCommunicationPlanId_fkey" FOREIGN KEY ("linkedCommunicationPlanId") REFERENCES "public"."CommunicationPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaOutreachItem" ADD CONSTRAINT "MediaOutreachItem_linkedWorkflowIntakeId_fkey" FOREIGN KEY ("linkedWorkflowIntakeId") REFERENCES "public"."WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaOutreachItem" ADD CONSTRAINT "MediaOutreachItem_linkedConversationOpportunityId_fkey" FOREIGN KEY ("linkedConversationOpportunityId") REFERENCES "public"."ConversationOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StaffGmailAccount" ADD CONSTRAINT "StaffGmailAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CalendarSource" ADD CONSTRAINT "CalendarSource_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CalendarWatchChannel" ADD CONSTRAINT "CalendarWatchChannel_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "public"."CalendarSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyBigRock" ADD CONSTRAINT "WeeklyBigRock_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "public"."WeeklyCampaignPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeeklyBigRock" ADD CONSTRAINT "WeeklyBigRock_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventApproval" ADD CONSTRAINT "EventApproval_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventApproval" ADD CONSTRAINT "EventApproval_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventApproval" ADD CONSTRAINT "EventApproval_approverUserId_fkey" FOREIGN KEY ("approverUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventStageChangeLog" ADD CONSTRAINT "EventStageChangeLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventStageChangeLog" ADD CONSTRAINT "EventStageChangeLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventSyncLog" ADD CONSTRAINT "EventSyncLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventSyncLog" ADD CONSTRAINT "EventSyncLog_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "public"."CalendarSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventAnalyticsSnapshot" ADD CONSTRAINT "EventAnalyticsSnapshot_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventAnalyticsSnapshot" ADD CONSTRAINT "EventAnalyticsSnapshot_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExternalMediaMention" ADD CONSTRAINT "ExternalMediaMention_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."ExternalMediaSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExternalMediaMention" ADD CONSTRAINT "ExternalMediaMention_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "public"."CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExternalMediaMention" ADD CONSTRAINT "ExternalMediaMention_relatedCountyId_fkey" FOREIGN KEY ("relatedCountyId") REFERENCES "public"."counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionBillRecord" ADD CONSTRAINT "OppositionBillRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionBillRecord" ADD CONSTRAINT "OppositionBillRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionVoteRecord" ADD CONSTRAINT "OppositionVoteRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionVoteRecord" ADD CONSTRAINT "OppositionVoteRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionFinanceRecord" ADD CONSTRAINT "OppositionFinanceRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionFinanceRecord" ADD CONSTRAINT "OppositionFinanceRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionMessageRecord" ADD CONSTRAINT "OppositionMessageRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionMessageRecord" ADD CONSTRAINT "OppositionMessageRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionVideoRecord" ADD CONSTRAINT "OppositionVideoRecord_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionVideoRecord" ADD CONSTRAINT "OppositionVideoRecord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionNewsMention" ADD CONSTRAINT "OppositionNewsMention_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionNewsMention" ADD CONSTRAINT "OppositionNewsMention_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionElectionPattern" ADD CONSTRAINT "OppositionElectionPattern_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionElectionPattern" ADD CONSTRAINT "OppositionElectionPattern_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionAccountabilityItem" ADD CONSTRAINT "OppositionAccountabilityItem_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OppositionAccountabilityItem" ADD CONSTRAINT "OppositionAccountabilityItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
