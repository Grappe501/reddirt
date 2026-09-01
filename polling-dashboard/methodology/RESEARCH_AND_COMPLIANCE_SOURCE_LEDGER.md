# Polling Research and Compliance Source Ledger

Purpose: keep methodological and compliance design grounded in named sources. This is a living engineering reference, not legal advice.

## AAPOR — Disclosure Standards
Source: https://aapor.org/standards-and-ethics/disclosure-standards/

Engineering implications:
- explicitly classify probability vs nonprobability sampling,
- describe the sampling frame/list and target-population coverage,
- document selection/recruitment/contact methods and oversampling,
- disclose weighting methodology and precision limitations.

## AAPOR — Transparency Initiative
Source: https://aapor.org/standards-and-ethics/transparency-initiative/

Engineering implications:
- store enough metadata to produce reproducible methodology disclosures,
- preserve frame/sample/weighting provenance,
- account for design effects when reporting probability-sample precision,
- do not provide probability-style precision for nonprobability samples without a separately documented model and assumptions,
- document AI involvement when AI is used in research processing.

## Pew Research Center — Writing Survey Questions
Source: https://www.pewresearch.org/writing-survey-questions/

Engineering implications:
- question order can change responses,
- telephone answer lists can show recency effects,
- self-administered surveys can show primacy effects,
- randomization/reversal should be supported and stored,
- baseline ballot questions should precede issue batteries when the goal is an unprimed baseline.

## Pew Research Center — 2026 methodology examples
Representative source: https://www.pewresearch.org/politics/2026/06/10/typology-2026-appendix-a-survey-methodology/

Engineering implications:
- begin probability weighting from selection probability,
- calibrate to documented population benchmarks when justified,
- trimming may be used to reduce precision loss from extreme weights,
- sampling error/uncertainty should account for weighting effects,
- data-quality checks should identify suspicious response patterns.

Additional 2026 methodology example:
https://www.pewresearch.org/science/2026/05/28/climate-change-may-2026-methodology/

Engineering implications:
- soft launches are normal before full fielding,
- repeated telephone attempts may be used under a defined protocol,
- field procedures and dispositions belong in methodology records.

## Pew Research Center — Online opt-in data quality, Aug. 27, 2026
Source: https://www.pewresearch.org/methods/2026/08/27/no-easy-fix-for-bogus-respondents-in-online-opt-in-polls/

Engineering implications:
- online opt-in quality controls cannot guarantee representative inference,
- response-order effects and inattentive/bogus respondents require explicit QA,
- keep online opt-in evidence separate from probability-oriented phone tracking.

## FCC — Political calls guidance
Source: https://docs.fcc.gov/public/attachments/DA-16-264A1_Rcd.pdf

Engineering implications:
- live manually dialed political calls and automated/prerecorded calls have materially different restrictions,
- automated/prerecorded calls to wireless numbers can trigger consent requirements,
- production design must not casually evolve from live volunteer calling into an automated dialer/robocall system.

## FCC — AI-generated voices and TCPA
Source: https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf

Engineering implications:
- AI-generated/artificial voice calls fall under artificial/prerecorded voice rules,
- no AI voice calling feature may be added under ordinary polling feature scope,
- such a feature requires separate legal/compliance architecture review.

## Arkansas — automated political call provisions
Legislative source example: https://www.arkleg.state.ar.us/Home/FTPDocument?path=%2FAMEND%2F2019R%2FPublic%2FSB514-S1.pdf

Engineering implication:
- Arkansas has specific automated political-call language and the exact current law/effect must be reviewed before any automated dialing/recorded-message feature.

## Arkansas Attorney General — Do Not Call / Telemarketing
Source: https://arkansasag.gov/divisions/public-protection/technology/do-not-call-telemarketing/

Engineering implications:
- retain explicit campaign/research do-not-contact handling even where commercial DNC rules may not govern the call,
- any telemarketing/calling-time/caller-ID rules relevant to the chosen operating mode must be reviewed before launch.

## Source governance rule

When a later POLL slice changes sampling, questionnaire, weighting, calling modality, precision language, or AI research behavior, Bert must:
1. cite the relevant ledger entry in its slice report,
2. state whether the change is consistent with current doctrine,
3. add a new authoritative source if the decision depends on information not represented here,
4. escalate legal interpretation rather than invent a conclusion.
