# GOTV commitment allocation V1

This model allocates a **statewide 5,000 GOTV commitment-card goal** across counties for operations planning.

Commitment message:

> I commit to help 5 people make a plan to vote.

This is **not** a voter-level targeting or automated persuasion engine. It is county-level capacity math for opt-in commitments, house-party host planning, follow-up workload, event staffing, local guide coverage, and compliance-reviewed automation preparation.

## Source Priority

The builder prefers database values when available:

- `CountyCampaignStats.registrationGoal` -> registration goal
- `CountyCampaignStats.volunteerTarget` -> current county GOTV commitment goal
- `CountyCampaignStats.volunteerCount` -> current commitments / volunteers
- `CountyCampaignStats.campaignVisits` -> known county visit count
- `CountyCampaignStats.newRegistrationsSinceBaseline`
- `CountyCampaignStats.registrationBaselineDate`

If the DB is unavailable, the script falls back to staged JSON.

## Formula

Each county gets an explainable `countyVolunteerNeedWeight` and visible percent:

```text
countyVolunteerNeedWeight =
  0.35 * targetVoteGainShare +
  0.20 * registrationGoalShare +
  0.15 * turnoutHeadroomShare +
  0.10 * opportunityLoadShare +
  0.10 * localInfrastructureGapShare +
  0.05 * lowTouchCountyBoost +
  0.05 * accessSupportNeedShare
```

Then:

```text
rawCountyTarget = round(5000 * countyVolunteerNeedWeight)
```

Minimum guardrails:

- `minimumPerCounty = 10`
- `priorityCountyMinimum = 25`
- `highOpportunityCountyMinimum = 50`

After minimums, rows are rebalanced so the statewide target equals exactly **5,000**.

## House-party model

Assumptions:

```ts
{
  statewideCommitmentGoal: 5000,
  relationalPowerOfFive: 5,
  housePartyAverageAttendance: 10,
  usableCommitmentRateFromHouseParty: 0.5,
  phoneBankContactsPerHour: 20,
  postcardBatchPerVolunteerHour: 40,
  textConversationsPerVolunteerHour: 60
}
```

Derived:

```text
estimatedRelationalCoverage = volunteerCommitmentTarget * 5

housePartyGoal = ceil(
  volunteerCommitmentTarget /
  (housePartyAverageAttendance * usableCommitmentRateFromHouseParty)
)
```

## Human approval

The model can prepare:

- staff tasks
- compliance checklists
- opt-in audience draft queues
- county capacity summaries

It does **not** send email, SMS, phone calls, texts, or public content. It does **not** generate voter-level targeting lists.
