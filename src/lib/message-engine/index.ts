/**
 * Message Content Engine — typed foundation (patterns, context, feedback shapes, starter registry).
 *
 * **No runtime I/O** in this package: safe to import from scripts, Storybook, and future UI.
 *
 * @see docs/MESSAGE_CONTENT_ENGINE_SYSTEM_PLAN.md
 * @see docs/MESSAGE_ENGINE_TYPES_AND_TEMPLATE_REGISTRY_REPORT.md
 */

export type {
  ConversationOutcome,
  FollowUpPrompt,
  LocalStoryPrompt,
  MessageAudience,
  MessageCategory,
  MessageContext,
  MessageEngineVisibilityTier,
  MessageFeedback,
  MessageGeographyScope,
  MessagePatternKind,
  MessageRecommendation,
  MessageRecommendationEngineResult,
  MessageResponseBucket,
  MessageSafetyLevel,
  MessageTemplate,
  MessageTemplateSlot,
  MessageTone,
  MessageUseEvent,
  MessageUseEventKind,
  ObjectionResponse,
  RecommendedMessage,
  RelationshipType,
} from "./types";

export {
  CONVERSATION_OUTCOMES,
  MESSAGE_AUDIENCES,
  MESSAGE_CATEGORIES,
  MESSAGE_GEOGRAPHY_SCOPES,
  MESSAGE_PATTERN_KINDS,
  MESSAGE_RELATIONSHIP_TYPES,
  MESSAGE_RESPONSE_BUCKETS,
  MESSAGE_SAFETY_LEVELS,
  MESSAGE_TONES,
} from "./types";

export {
  assertUniqueMessageTemplateIds,
  getMessageTemplateById,
  listAllMessageTemplateIds,
  listMessageTemplatesByAudience,
  listMessageTemplatesByCategory,
  MESSAGE_STARTER_FOLLOW_UP_PROMPTS,
  MESSAGE_STARTER_LOCAL_STORY_PROMPTS,
  MESSAGE_STARTER_OBJECTION_RESPONSES,
  MESSAGE_STARTER_TEMPLATES,
  MESSAGE_TEMPLATE_REGISTRY,
} from "./templates";

export {
  assertMessageRecommendationEngineInvariants,
  filterTemplatesByAudience,
  filterTemplatesByCategory,
  filterTemplatesByGeography,
  filterTemplatesByRelationship,
  getConversationStarterSet,
  getFollowUpSet,
  getMessageRecommendations,
  getPowerOf5OnboardingMessages,
  inferFinestGeographyRank,
  rankMessageTemplates,
} from "./recommendations";

export type {
  CategoryMovementSummary,
  ConversationPipelineMovement,
  CreateMessageUseEventInput,
  CreateMessageUseEventResult,
  FollowUpNeed,
  MessageFeedbackSummary,
  PipelineMovementHint,
  PipelineMomentum,
} from "./feedback";

export {
  calculateMessageCategoryMovement,
  createMessageUseEvent,
  getFollowUpNeeds,
  isConversationOutcome,
  mapConversationOutcomeToPipelineMovement,
  summarizeMessageFeedback,
} from "./feedback";
