# Polling Engineering Invariants

These invariants are mandatory for every POLL slice. A slice that violates one is blocked regardless of UI or feature completion.

1. Canonical Red Dirt voter/person records remain authoritative.
2. No LLM selects individual voters for sampling or persuasion.
3. Every sample draw is auditable and reconstructible.
4. Frame coverage is measured and exposed; weighting is never described as curing unobserved coverage bias.
5. Raw responses are immutable.
6. Phone probability-frame, online opt-in, external polls, model estimates, simulations, and AI analysis remain separate evidence classes.
7. Baseline ballot preference precedes potentially priming issue batteries.
8. Randomization/order assignment is software-controlled and persisted.
9. Caller UI does not expose live horse-race results or targeting scores.
10. Individual political-opinion responses remain restricted research data and do not become ordinary CRM targeting tags.
11. Assignment leases are atomic; no simultaneous duplicate ownership.
12. Instrument versions cannot change after field activation.
13. Every weighting/estimate/simulation output is versioned and reproducible.
14. Small-area outputs are suppressed when quality rules fail.
15. Live manual calling is the initial approved modality; automated/prerecorded/artificial/AI voice and automated text require separate legal/architecture approval.
16. Secrets, including OpenAI credentials, remain server-side.
17. Sensitive logging and exports are minimized and audited.
18. Every state transition is validated and auditable.
19. Every production-affecting slice includes rollback/failure-recovery proof.
20. Every slice closes with tests, build/typecheck proof, Git commit/push, and a structured return report.

## Stop-work triggers

Bert/Cursor must stop the slice and return an architecture decision request if implementation would require:
- duplicating a canonical voter/person/phone/geography model,
- changing the approved target population definition,
- changing evidence classification rules,
- changing respondent-level privacy boundaries,
- adding an automated calling/texting mode,
- weakening RBAC or audit requirements,
- modifying a field-active instrument,
- publishing estimates without the required quality gate,
- changing the sampling design in a way that makes inclusion probabilities unreconstructible,
- making a legal/compliance assumption not already approved.
