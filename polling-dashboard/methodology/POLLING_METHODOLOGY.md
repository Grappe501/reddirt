# Polling Methodology — Governing Draft

This document records research rules that the Red Dirt polling system must enforce in code and reporting. It is a design standard, not a claim that a completed poll is scientifically representative before weighting, nonresponse analysis, and quality gates are implemented.

## 1. Sampling frame

The initial frame is the existing Red Dirt Arkansas voter universe with usable phone data. Every selected unit must be traceable to the frame version and selection procedure used at the time.

The system may intentionally allocate more interviewing effort to under-sampled geographies, but selection within eligible sampling cells must remain auditable and probabilistic. Stored metadata should permit analysts to calculate inclusion/selection probabilities when the design requires them.

## 2. Geographic coverage

Primary hierarchy should support statewide, region, congressional district, county, and city/local geography where data quality permits. Small-area estimates must be suppressed until minimum sample and effective-sample thresholds are met.

The engine should distinguish population targets, sample targets, completed interviews, attempted contacts, response rates, coverage gaps, and weighting corrections.

## 3. Baseline ballot question

Candidate preference is asked before issue batteries to preserve an unprimed baseline. Candidate names/order are rotated or randomized by software, with assignment stored on the interview record. Undecided/not sure and other appropriate responses remain valid outcomes.

## 4. Issue battery

The first tracking instrument should be designed around a short recurring core:

- Arkansas Secretary of State ballot preference.
- Attitudes toward Arkansas direct democracy / citizen-initiated constitutional and statutory processes using neutrally pretested language.
- Confidence in Arkansas election security and accuracy.
- Open-ended or structured follow-up for respondents expressing low election confidence.
- One concise Secretary of State responsibility/priorities question that can include the office's business-filing responsibilities without becoming a knowledge quiz.
- Past presidential vote recall as an analytical baseline.
- Party identification and strength/leaning as an analytical baseline.
- A post-battery ballot question, clearly classified as a post-treatment/context measure rather than the primary horse-race estimate.

Exact wording is not frozen by this spine and must be researched, reviewed, piloted, versioned, and then held stable for tracking comparisons.

## 5. Questionnaire effects

The system must store survey version, question order/form variant, candidate order, branch path, interviewer, timestamps, and completion/disposition data. Where question-order or message effects are being studied, respondents should be randomly assigned to experimental forms so differences can be estimated rather than guessed.

## 6. Response lifecycle

The call system records attempts as well as completions. Dispositions should include at minimum completed, partial, refusal, no answer, voicemail, callback, wrong number, disconnected, language barrier, ineligible, and do-not-contact where applicable.

Repeated attempts and recontact rules must be explicit. A tracking cross-section must not quietly become a convenience panel because the same responsive voters are repeatedly surveyed.

## 7. Raw versus derived results

Raw observations are preserved. Weighting, recoding, imputation if ever approved, rolling estimates, modeled estimates, and simulations are separate derived artifacts with versioned methods.

Dashboard results should distinguish:

- unweighted completed interviews,
- weighted estimate,
- effective sample size,
- response/coverage metrics,
- model-based estimate,
- external polling average,
- online opt-in results,
- simulation outputs.

## 8. Online surveys

Campaign web surveys are a separate evidence lane unless a defensible probability/recruitment design says otherwise. Supporter-list or open-link surveys must not be displayed as equivalent to the controlled phone sampling stream.

## 9. OpenAI / AI use

Permitted initial uses include aggregate trend explanation, coding/summarizing open-ended responses using an analyst-reviewed taxonomy, anomaly/data-quality detection, methodological documentation assistance, and natural-language querying of aggregated research outputs.

AI should not select individual voters for contact, infer sensitive political traits for individual targeting, overwrite raw responses, or manufacture missing survey data.

## 10. Reporting discipline

The dashboard must communicate uncertainty and data-quality limitations prominently. Tiny samples must not be presented as precise county/city horse-race results. Any election simulation must display assumptions and distributions rather than being labeled as observed voter intent.

## 11. Compliance gate

Before live calling, the project requires a documented review of applicable federal and Arkansas calling rules, campaign rules, voter-file restrictions, privacy practices, consent/recording requirements, opt-out handling, data retention, volunteer access controls, and survey disclosure practices. Compliance review is a build gate, not a footer note.
