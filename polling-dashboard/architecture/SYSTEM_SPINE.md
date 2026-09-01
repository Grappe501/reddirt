# POLL-0 — System Spine

## Mission

Create a reusable Red Dirt polling and public-opinion intelligence subsystem that continuously samples from the existing Arkansas voter universe, serves multiple authenticated callers, records standardized research responses, measures sample quality, and produces transparent aggregate estimates and simulations.

## System flow

`Existing Red Dirt voter/person records`
→ `Callable-universe eligibility view`
→ `Sampling frame + geography/sample cells`
→ `Auditable selection engine`
→ `Atomic caller assignment queue`
→ `Volunteer calling workbench`
→ `Survey instrument + branching engine`
→ `Contact disposition + response ledger`
→ `Raw research store`
→ `Weighting / quality / uncertainty layer`
→ `Polling Intelligence Command Center`
→ `External poll + online survey lanes`
→ `AI aggregate research assistant`
→ `Election simulation layer`

## Hard architecture decisions

1. **One voter spine.** Existing Red Dirt voter/person records remain canonical. Polling tables reference them.
2. **Responses are research data, not ordinary CRM tags.** Individual political-opinion responses stay in a restricted polling layer and are surfaced operationally through aggregate analytics except where authorized research QA requires row-level access.
3. **Sampling is statistical, not generative AI.** The selector uses documented probability/randomization code, stratification or adaptive allocation rules, deterministic seeds where appropriate, and stored selection metadata.
4. **Question order is versioned.** Candidate order, experimental form, survey version, timestamps, interviewer, and branch path must be recorded for every completion.
5. **Raw data is immutable in meaning.** Weighting and modeling generate derived records rather than overwriting original answers.
6. **Multiple evidence lanes remain distinct.** Phone probability samples, online opt-in surveys, external/public polls, and model outputs must never be silently merged as if they share one methodology.
7. **Geographic estimates are suppressed when weak.** County/city drilldowns require minimum effective sample/quality gates.
8. **Concurrent caller safety is mandatory.** Assignment must prevent two volunteers from receiving the same live sampling unit simultaneously.
9. **Recontact is explicit.** Cross-sectional tracking, callbacks, panel/recontact research, and campaign contact are separate states.
10. **Campaign-agnostic core.** Election, office, candidates, geography, instruments, and waves are configuration/data rather than hard-coded Kelly-specific logic.

## Initial integration targets to audit before schema work

- Existing Prisma person/voter models.
- Voter registration identifiers and voter-history tables.
- Phone/contact tables and phone-quality/source fields.
- County, city, precinct, congressional-district, legislative-district, and other geography already stored.
- Existing authentication/RBAC and volunteer user models.
- Existing admin/workbench route conventions.
- Existing OpenAI integration patterns and AI registry/guardrails.
- Existing analytics/reporting infrastructure that can be reused.

## Proposed major domain objects

Names are conceptual until the schema audit is complete:

- PollingStudy
- PollingWave
- SurveyInstrument
- SurveyQuestion
- SurveyChoice
- SurveyFormVariant
- SamplingFrame
- SamplingCell
- SamplingTarget
- SamplingSelection
- CallerAssignment
- ContactAttempt
- ContactDisposition
- SurveyInterview
- SurveyResponse
- OpenEndedResponse
- ResponseCoding
- WeightingRun
- WeightedEstimate
- SampleQualitySnapshot
- ExternalPoll
- ExternalPollResult
- OnlineSurveySource
- SimulationRun
- SimulationResult

## First technical gate

No Prisma migration or production table creation occurs until POLL-1 audits the actual Red Dirt voter/person/phone/geography schema and produces a reuse map, proposed relational model, privacy classification, and migration plan.
