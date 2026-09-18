# V2-02 — Universal Knowledge Object Contract

Status: CANONICAL v1.0
Date: 2026-09-18

## Purpose

The Universal Knowledge Object (UKO) is the reusable educational unit behind every tooltip, explanation, lesson, research deep dive, formula, metric, chart term, strategy term and simulator exercise in Wealth Builder V2.

One concept is authored once, versioned, sourced and reused everywhere.

## Progressive disclosure contract

Every knowledge object may expose these depths:

1. GLANCE — one/two sentence hover or tap definition.
2. EXPLAIN — plain-English meaning, why it matters, analogy and basic example.
3. LEARN — practical lesson, visual model, worked example, misconceptions and application.
4. ADVANCED — formula/methodology, assumptions, edge cases, alternatives and limitations.
5. RESEARCH — research-level treatment, empirical questions, methodological debates, citations and source lineage.
6. TRY — quiz/calculation/scenario/simulator exercise.

Content can be absent while an object is being developed, but GLANCE, EXPLAIN, source state and review state are required before an object is publishable.

## Canonical object fields

Identity:
- id: stable machine ID
- slug: stable URL/key slug
- canonicalTerm
- aliases[]
- objectType: term | metric | indicator | formula | accounting_item | market_structure | strategy | risk | order_type | asset_class | company_concept | industry_concept | regulatory_concept | other
- domainTags[]
- version
- status: draft | reviewed | published | deprecated
- supersedesId?
- createdAt / updatedAt / reviewedAt?
- reviewedBy?

Education:
- glance.definition
- glance.expansion?
- explain.plainEnglish
- explain.whyItMatters
- explain.analogy?
- explain.basicExample?
- learn.lesson
- learn.visualSpec?
- learn.workedExamples[]
- learn.commonMisconceptions[]
- learn.tradingApplications[]
- learn.investorApplications[]
- learn.warnings[]
- advanced.definition?
- advanced.formula?
- advanced.variables[]
- advanced.methodology?
- advanced.assumptions[]
- advanced.edgeCases[]
- advanced.alternatives[]
- advanced.limitations[]
- research.treatment?
- research.empiricalQuestions[]
- research.methodologicalDebates[]
- research.furtherReading[]

Relationships:
- prerequisites[]
- relatedConcepts[]
- contrastsWith[]
- usedByStrategies[]
- appearsInMetrics[]
- relevantAssetClasses[]
- relevantIndustries[]

Interactive:
- exercises[]
- simulatorScenarios[]
- quizItems[]

Evidence/provenance:
- sources[]
- factualClaims[]
- sourceState: sourced | partially_sourced | unsourced
- evidenceNotes?
- generatedContentDisclosure?
- lastSourceReviewAt?

Presentation:
- readingTimeMinutesByDepth
- difficultyByDepth
- searchKeywords[]
- preferredDisplayTerm?
- accessibilityNotes?
- locale

## Source object

Each source records sourceId, title, publisher/author, sourceType, publicationDate if known, URL/reference locator, accessedAt, authority tier, and notes. A source may support multiple claim IDs. Sources are not decorative bibliography; factual claims should be traceable.

## Claim object

Each factualClaim has claimId, text/summary, sourceIds[], claimType (definition | historical | empirical | accounting | regulatory | market_data | methodology | other), confidence state, and review state.

## Exercise object

Each exercise has exerciseId, type (multiple_choice | calculation | chart_reading | scenario | simulator | reflection), prompt, learningObjective, difficulty, expectedAnswer/evaluation contract, explanation, relatedConceptIds and optional simulator configuration.

## Formula contract

Formula-bearing concepts must store a human-readable formula, machine-safe variable definitions, units/dimensions where relevant, assumptions, and at least one worked example before publication at ADVANCED depth.

## Contextual explanation contract

The UKO defines the concept. A separate contextual layer may explain a live value. Example:
UKO: Relative Volume explains what relative volume is.
Context: "NVDA relative volume is 3.7x at 10:45 ET" explains the current observation.
The contextual layer must never mutate the canonical concept definition.

## Publication gates

A publishable object requires:
- stable ID and slug
- canonical term and aliases as applicable
- object type/domain
- GLANCE definition
- EXPLAIN plain English + why it matters
- sourceState
- status/review metadata
- no unsupported probability/performance claims
- accessible text that does not rely on color
- no hidden implication that an indicator predicts future returns

ADVANCED requires formula/methodology provenance when applicable.
RESEARCH requires citations/source lineage and explicit limitations.
TRY requires an evaluation/explanation contract.

## Rendering rule

Any UI component may request a depth but must gracefully fall back to the deepest available reviewed content. The UI must visibly distinguish sourced factual content, generated teaching explanation where relevant, live market observations and simulator-generated hypothetical outcomes.

## Seed acceptance test

V2-02 is accepted when the schema/validator and at least five representative seed objects prove the model across distinct domains:
VWAP, P/E Ratio, ATR, Short Selling and Sharpe Ratio.
