# Macroscopic Life — Pass 12B
## Chapter 11 — The Choice: Hostile Scientific Literature Grounding

Status: COMPLETE — ARCHITECTURE SURVIVES WITH IMPORTANT REVISIONS

Input architecture:
`research/macroscopic-life/manuscript/chapter-11/PASS-12A-CHAPTER-11-SCIENTIFIC-CONCEPT-ARCHITECTURE.md`

Working title: **The Choice**

Title status: PROVISIONAL

# Executive verdict

Chapter 11's central question survives:

> **What evidence shows that selection among viable actions belongs causally to the proposed whole?**

But the literature requires a major conceptual correction before narrative architecture:

**Agency cannot be defined as requiring multiple explicit policies, learning, novelty, or policy updating.** Serious biological-agency frameworks attribute genuine agency to much simpler autonomous systems. Barandiaran, Di Paolo, and Rohde (2009), for example, ground agency in individuality, interactional asymmetry, and normativity, defining an agent as an autonomous organization that adaptively regulates its coupling with its environment in a self-sustaining way. Moreno and Etxeberria (2005) likewise treat natural agency as rooted in autonomous organization rather than human-like deliberative choice.

Therefore Macroscopic Life must distinguish:

1. **agency as used in existing scientific/philosophical frameworks**, from
2. **the project's stronger action-selection/choice property**.

We must not redefine accepted minimal agency out of existence merely to make Chapter 11's ladder work.

The safest architecture is:

> Existing agency concepts may be satisfied by comparatively minimal autonomous regulation. Chapter 11 asks a narrower and stronger question: when can **choice-like action selection at a proposed higher level** be scientifically attributed to the whole?

This preserves the frozen Chapter 10 bridge — **Can the whole choose?** — while preventing terminology capture.

# 1. Agency is contested and plural

## Verified anchor

Xabier E. Barandiaran, Ezequiel Di Paolo, and Marieke Rohde, “Defining Agency: Individuality, Normativity, Asymmetry, and Spatio-temporality in Action,” *Adaptive Behavior* 17, no. 5 (2009): 367–386. DOI: `10.1177/1059712309343819`.

The paper explicitly argues that many agency definitions are too loose for a progressive research program and proposes three central conditions:
- individuality;
- interactional asymmetry / active source of activity;
- normativity.

Its positive definition ties agency to autonomous organization adaptively regulating organism-environment coupling in ways contributing to self-maintenance.

## Consequence for Macroscopic Life

Pass 12A's project definition is too narrow if presented as **the** definition of agency.

Repair for 12C:

Call the chapter's target **choice-like higher-level agency**, **policy-selection agency**, or simply make “choice” the property and reserve “agency” as a broader family term.

Preferred formulation:

> **This chapter does not attempt to settle the definition of agency. It asks whether a proposed whole can earn the narrower claim that it causally selects among viable courses of action.**

This is the most important result of Pass 12B.

# 2. Minimal agency may precede explicit alternatives

## Verified anchor

Álvaro Moreno and Arantza Etxeberria, “Agency in Natural and Artificial Systems,” *Artificial Life* 11, nos. 1–2 (2005): 161–175. DOI: `10.1162/1064546053278919`.

Their account connects basic natural agency to autonomous organization and the relation between self-construction and environmental activity. It does not require a menu of explicit alternative policies or a deliberative selector.

## Consequence

The following Pass 12A ideas must be demoted from necessary conditions to **discriminating tests for the stronger choice claim**:
- multiple policy classes;
- policy updating;
- novelty;
- component conflict;
- counterfactual alternatives.

They remain extremely useful experimentally. They are not universal prerequisites for agency.

# 3. Selector circuit remains a good minimum adversary

The selector circuit survives as an opening device precisely because it makes a limited point:

> causal selection among alternatives can occur without settling agency or ownership.

Do **not** use it to claim that deterministic selection can never instantiate agency. The literature does not support that categorical move.

Opening brake survives provisionally:

> **SELECTION IS REAL. AGENCY HAS NOT YET BEEN EARNED.**

Better scientific gloss:

> Observing selection is insufficient to decide which agency framework, if any, applies and at what level the selection belongs.

# 4. Determinism/randomness firewall survives

No serious agency architecture should use unpredictability as evidence of agency.

Pass 12A's doctrine survives:

`Determinism ≠ automatic absence of agency`

`Indeterminism ≠ agency`

`Unpredictability ≠ freedom`

The chapter should avoid drifting into libertarian free-will metaphysics. Its counterfactuals are intervention/capability claims under physically realizable conditions.

# 5. “Policy” is useful but too RL-specific as the master biological term

Pass 12A uses *policy* extensively. In reinforcement learning, policy has a precise technical meaning: a mapping/distribution governing action selection given state/observation/history. That is useful for engineered positive controls, but it risks making biological agency look like reinforcement learning by definition.

Repair:

Use **course of action**, **response strategy**, **action organization**, or **action-selection rule** in general prose.

Reserve *policy* for:
- formal models;
- RL examples;
- explicit model-comparison notation.

Rename the provisional **Policy Ownership Test** to the broader:

> **Action-Selection Ownership Test**

This is a substantive improvement.

# 6. Fixed policies do not automatically eliminate agency

Pass 12A's fixed-policy adversary is scientifically useful but must be softened.

A system can count as an agent under some frameworks while exhibiting stable or highly constrained action rules. Therefore:

> A fixed-policy model explaining behavior does not prove “no agency” universally.

What it can show is narrower:

> The stronger Macroscopic Life claim that a proposed higher level contributes distinctive context-sensitive action selection has not been demonstrated if a capacity-matched fixed lower-level controller replaces it without scientific loss.

This preserves the Replacement Test without overclaim.

# 7. Learning does not equal agency — survives

Learning and agency overlap but neither universally entails the other.

A learning algorithm can update without satisfying biological-autonomy accounts of agency. Conversely, minimal agency accounts do not require learning in the ordinary behavioral sense.

Therefore Pass 12A's distinction survives:

`Learning ≠ sufficient evidence of higher-level choice ownership`

But replace the categorical `Learning ≠ agency` in reader prose with the more precise form above.

# 8. Reinforcement-learning reward is not desire

The architecture's reward/value firewall is important.

## Verified anchors

Wolfram Schultz, “Dopamine Reward Prediction Error Coding,” *Dialogues in Clinical Neuroscience* 18, no. 1 (2016): 23–32. DOI: `10.31887/DCNS.2016.18.1/wschultz`.

Wolfram Schultz, “Dopamine Reward Prediction-Error Signalling: A Two-Component Response,” *Nature Reviews Neuroscience* 17 (2016): 183–195. DOI: `10.1038/nrn.2015.26`.

Schultz's work grounds dopamine reward-prediction-error signals and their relationship to learning. It does not license the folk reduction “dopamine = pleasure” or “dopamine = desire.”

## Required firewall

`Algorithmic reward ≠ subjective reward`

`Reward prediction error ≠ desire`

`Value function ≠ felt value`

`Utility fitted by observer ≠ preference owned by system`

Narrative architecture should keep this section compact; it is a guardrail, not the chapter's center.

# 9. Collective decision-making is established scientific language

This part of Pass 12A is strongly supported.

## Honeybee/social insect anchors

P. Kirk Visscher, “Group Decision Making in Nest-Site Selection Among Social Insects,” *Annual Review of Entomology* 52 (2007): 255–275. DOI: `10.1146/annurev.ento.51.110104.151025`.

Thomas D. Seeley and P. Kirk Visscher, “Quorum Sensing During Nest-Site Selection by Honeybee Swarms,” *Behavioral Ecology and Sociobiology* 56 (2004): 594–601. DOI: `10.1007/s00265-004-0814-5`.

Thomas D. Seeley, Kevin M. Passino, and P. Kirk Visscher, “Group Decision Making in Honey Bee Swarms,” *American Scientist* 94, no. 3 (2006): 220–229. DOI: `10.1511/2006.59.220`.

These sources support the use of group/collective decision terminology for nest-site selection. Seeley and Visscher's quorum work is especially valuable because it makes a falsifiable causal prediction: delaying quorum formation should delay preparation/takeoff, rather than merely redescribing the final consensus.

## Consequence

Honeybee nest-site selection should become Chapter 11's primary biological worked example.

It is stronger than an abstract “collective mind” analogy because the component mechanisms are experimentally tractable.

# 10. Collective decision ≠ collective individuality — strongly supported as a conceptual firewall

The literature routinely studies collective decisions without requiring that every deciding group be treated as a single organism or individual.

Therefore this project brake survives and should probably be promoted:

> **COLLECTIVE DECISION-MAKING CAN BE REAL BEFORE COLLECTIVE INDIVIDUALITY IS ESTABLISHED.**

This is especially important because Chapter 12 is likely to address individuality directly.

Honeybee colonies may be discussed as superorganismal in some literatures, but Chapter 11 should not use that label as evidence. The decision process and the individuality question must remain separable.

# 11. Animal-group decisions broaden the positive-control space

## Verified anchor

Iain D. Couzin, Jens Krause, Nigel R. Franks, and Simon A. Levin, “Effective Leadership and Decision-Making in Animal Groups on the Move,” *Nature* 433 (2005): 513–516. DOI: `10.1038/nature03236`.

The work shows how small proportions of informed individuals can guide group movement through local interaction rules, including conditions where individuals need not know which group members possess information.

## Consequence

This is an excellent hostile rival to naive group-agent inference:

**accurate group-level decisions can emerge from local interaction rules without centralized controller or explicit group representation.**

That is not a failure. It is exactly the sort of Model B-compatible higher-level phenomenon the book must respect.

# 12. Microbial collective decision language is legitimate but contested in mechanism/function

## Verified anchors

Kevin R. Foster/related quorum-sensing literature should not be generalized from one mechanism. A particularly useful review is:

R. Popat, D. M. Cornforth, L. McNally, and S. P. Brown, “Collective Sensing and Collective Responses in Quorum-Sensing Bacteria,” *Journal of the Royal Society Interface* 12 (2015): 20140882. DOI should be independently rechecked before manuscript freeze.

A second useful conceptual source:

A. Ross-Gillespie and R. Kümmerli, “Collective Decision-Making in Microbes,” *Frontiers in Microbiology* 5 (2014): 54. Bibliographic metadata/DOI must be verified before reader-facing use.

These sources use collective sensing/decision terminology while also emphasizing that the function and interpretation of quorum sensing can be contested.

## Consequence

Microbes are useful as a secondary example, not the main Chapter 11 wonder beat. Honeybees provide a cleaner narrative and causal architecture.

# 13. Component conflict is useful but not necessary

Pass 12A suggested that agency may be especially revealing when component tendencies conflict.

Literature on collective decisions supports conflict-of-interest and information-pooling questions as important, but **component conflict cannot be a necessary condition for agency or collective decision**.

Repair:

Reframe as a **stress test**:

> When components do not all favor the same outcome, successful conflict resolution can expose organizational structure that simple aggregation hides.

Keep candidate line only as prose:

> The whole becomes especially informative when its parts do not all point the same way.

Do not make it a signature or criterion.

# 14. Counterfactual alternatives need no metaphysical free will

Pass 12A's operationalization survives with wording repair.

Rather than “could have done otherwise,” use:

> **alternative physically realizable response trajectories under controlled changes in state/context.**

The test is whether the proposed higher-level state helps explain or causally organize movement among those trajectories.

This is compatible with deterministic dynamics.

# 15. The observer-action partition is a real methodological risk

The project is correct that analysts choose behavioral variables, state spaces, actions, rewards, utilities, and temporal grain.

Therefore the observer trap survives:

> **A POLICY CAN EXIST IN OUR MODEL BEFORE A CHOICE EXISTS IN THE SYSTEM.**

However, this line risks becoming too structurally repetitive after Chapter 10's objective-function signature.

Recommendation for 12C:

Keep the concept but demote the exact rhetorical template unless it becomes indispensable in the narrative.

Better prose question:

> Did the system distinguish these alternatives, or did we?

# 16. Causal emergence is relevant but must not be treated as agency evidence

## Verified anchor

Erik P. Hoel, Larissa Albantakis, and Giulio Tononi, “Quantifying Causal Emergence Shows That Macro Can Beat Micro,” *Proceedings of the National Academy of Sciences* 110, no. 49 (2013): 19790–19795. DOI: `10.1073/pnas.1314922110`.

This work provides a formal example of macro-level causal descriptions outperforming micro descriptions under an effective-information framework.

## Consequence

It can support the general proposition that a macro description can have causal/explanatory advantages without new physical forces.

It does **not** establish:
- biological agency;
- choice;
- goal ownership;
- consciousness;
- macroscopic individuality.

Use, if at all, in a technical endnote or later causal-level synthesis. Chapter 11 probably does not need it in the main narrative.

# 17. Organizational closure/autonomy is a serious alternative route to agency

Agency literature rooted in autonomy and organizational closure is not merely a lower-level rival; it may provide the positive theory against which Macroscopic Life's level question should be tested.

Relevant verified sources include:
- Moreno & Etxeberria 2005, DOI `10.1162/1064546053278919`;
- Barandiaran, Di Paolo & Rohde 2009, DOI `10.1177/1059712309343819`;
- J. Collier, “Autonomy and Process Closure as the Basis for Functionality,” *Annals of the New York Academy of Sciences* 901 (2000): 280–290, DOI `10.1111/j.1749-6632.2000.tb06287.x`.

## Consequence

Chapter 11 should ask:

> Does organization satisfying or approximating accepted agency criteria exist at the proposed higher-level boundary?

not:

> Can Macroscopic Life invent a stronger definition and declare everything else non-agentic?

This change materially improves the project.

# 18. Stronger “choice” property should remain project synthesis

After literature grounding, the safest project-specific target is:

> **Higher-Level Choice Claim** — an independently justified whole contributes causal organization to selection among multiple physically realizable response strategies in relation to system-level constraints, in a way that adds prospective prediction, explanatory compression, or intervention leverage beyond capacity-matched component, environmental, fixed-rule, and stochastic accounts.

This is deliberately not presented as a universal definition of agency.

A stronger property-specific Model C can be called:

> **Model C — Higher-Level Choice/Action-Selection Agency (project operationalization)**

with an explicit note that other agency frameworks use different criteria.

# 19. Action-Selection Ownership Test — revised

Rename Pass 12A's Policy Ownership Test.

A higher-level choice claim strengthens with:

1. **Boundary Independence** — proposed whole justified before behavioral success.
2. **Alternative Trajectories** — more than one physically realizable response strategy under relevant nearby conditions.
3. **State Specification** — candidate whole-level state/history specified prospectively.
4. **Selection Dependence** — perturbing that state changes action organization as predicted.
5. **Constraint Relevance** — response differences bear a measurable relation to independently specified goals/constraints where such goals are claimed.
6. **Context Discrimination** — model predicts when response organization changes.
7. **Component Rival** — nonlinear interactions, history, local controllers, thresholds, and component heterogeneity modeled seriously.
8. **External Driver Rival** — shared forcing tested.
9. **Fixed/Hidden-State Rival** — capacity-matched rule-based controller tested.
10. **Stochastic Rival** — structured selection distinguished from noise/randomization.
11. **Alternative Boundary Rival** — neighboring candidate wholes tested.
12. **Prediction Advantage** — inherited four-part standard.
13. **Intervention Advantage** — distinct causal leverage where feasible.
14. **Replication Distance** — new contexts, compositions, implementations, or sites.

Removed as universal requirements:
- learning;
- policy updating;
- novelty;
- component conflict.

These become optional stress tests when the specific claim includes them.

# 20. The honeybee worked experiment

Chapter 11 should use honeybees before returning to the forest.

Narrative scientific structure:

1. A swarm has multiple candidate nest sites.
2. Scouts independently inspect alternatives.
3. Recruitment processes alter support.
4. Local interaction/threshold/quorum processes contribute to commitment.
5. The swarm eventually moves as a coordinated whole.

The important lesson is not “the swarm has a mind.”

It is:

> A distributed group can produce a scientifically legitimate collective decision without a central decider.

Then attack it:

- Can local rules fully explain the decision?
- Does colony-level description improve prediction/compression?
- Does the colony boundary earn causal status?
- Does intervention on quorum organization alter collective commitment as predicted?
- Does any of this establish individuality? No.

The 2004 quorum experiment is especially valuable because it links a hypothesized collective decision mechanism to an intervention-sensitive timing prediction.

# 21. Forest experiment survives, but “policy classes” should be generalized

Use **candidate response strategies** rather than policy classes.

Forest sequence:

1. independently justify forest boundary;
2. inherit candidate constraint G from Chapter 10;
3. identify multiple physically realizable response trajectories capable of preserving G;
4. pre-specify context in which different trajectories are predicted;
5. identify candidate whole-level state H before divergence;
6. perturb H where physically meaningful;
7. compare capacity-matched component/environment/fixed-rule/stochastic rivals;
8. held-out context/site/time tests;
9. retain nulls and losing response hypotheses.

Key question survives:

> **Does the proposed whole contribute causal organization to which viable response trajectory occurs?**

# 22. Higher-level intervention requires no new force

Pass 12A's doctrine survives conceptually:

> Higher-level agency requires no new force. It requires a scientifically useful causal organization of existing physical processes.

But the phrase `higher-level agency` may be premature before the chapter earns it.

Preferred pre-result wording:

> **A HIGHER-LEVEL CHOICE CLAIM REQUIRES NO NEW FORCE. IT REQUIRES A USEFUL CAUSAL ORGANIZATION OF EXISTING FORCES.**

Likely technical prose, not signature.

# 23. Prediction Advantage survives unchanged in structure

`PA_choice = Performance(Higher-Level Action-Selection Model) - Performance(Best Fair Rival)`

Prefer `PA_choice` over `PA_agency` because the chapter's operational property is now choice/action selection rather than agency universally.

Inherited four-part doctrine remains mandatory:
1. prospective prediction target;
2. Fair Rival Resource;
3. held-out/new-condition evaluation;
4. meaningful difference with uncertainty/calibration appropriate to task.

`PA_choice > 0` means the higher-level action-selection model has predictive utility.

It does **not** by itself establish:
- agency under every framework;
- individuality;
- consciousness;
- free will;
- intelligence;
- purpose.

# 24. Intervention Advantage remains separate

A useful intervention test is not “push the macro without touching the micro,” which is physically incoherent if the macro is realized by microstates.

Instead:

> identify different lower-level implementations corresponding to the same higher-level action-selection state, and test whether interventions organized around the higher-level variable generalize across those implementations.

This is a causal-compression/generalization test, not magical downward causation.

# 25. Failure architecture strengthened

Legitimate failure outcomes:

A. routing/threshold mechanism fully explains result;
B. fixed or hidden-state controller replaces higher-level selection variable;
C. adaptive component controller explains changes;
D. stochastic model explains variability;
E. external forcing explains divergence;
F. rich component-interaction model matches prediction/intervention;
G. proposed boundary loses to another boundary;
H. analyst-defined actions/options are not physically discriminated by system;
I. retrospective fit disappears prospectively;
J. higher-level model advantage vanishes after capacity matching;
K. intervention organized around H fails to generalize across implementations.

All are legitimate scientific results.

# 26. Model outcomes — revised

## Model A — Lower-Level Sufficiency

No scientifically useful higher-level action-selection variable is needed for the tested phenomenon.

## Model B — Higher-Level Organizational Utility

A whole-level decision/action-selection description improves prediction, compression, or intervention but stronger choice ownership remains unresolved or unearned.

Collective decision-making can comfortably live here and still be a major discovery.

## Model C — Higher-Level Choice / Action-Selection Ownership

For this project's operational claim, an independently justified whole has a higher-level state/organization that contributes causally to selection among physically realizable response strategies in relation to independently specified constraints; the higher-level description survives serious component, environmental, fixed-rule, stochastic, and boundary rivals; and prospective prediction plus causal/intervention evidence generalizes beyond discovery cases.

This remains a **project property classification**, not a universal definition of agency.

# 27. Individuality dependency becomes even more important

Barandiaran et al. place individuality inside their agency criteria. Macroscopic Life's planned sequence currently asks choice before individuality.

This is not fatal, but Chapter 11 must say explicitly:

> Some agency theories require individuality as part of agency itself. Macroscopic Life temporarily separates the questions so each can be tested rather than assumed.

This is a major architectural guardrail.

The next chapter can then ask whether the boundary that proved useful for collective choice also qualifies as an individual under biological/evolutionary/organizational criteria.

Therefore the provisional bridge survives:

> **Can the whole become an individual?**

But Chapter 12 must acknowledge that for some frameworks this is not “after” agency; it is constitutive of it.

# 28. Figure 13 decision

Frozen Figure 13:

> **FUNCTIONAL ANALOGY ≠ BIOLOGICAL IDENTITY**
>
> **WE HAVE SHOWN THAT THE FUNCTIONS CAN SCALE. WE HAVE NOT YET SHOWN THAT THE INDIVIDUAL DOES.**

Pass 12B verdict:

**Reserve Figure 13 for the Chapter 11 ending / Chapter 12 individuality transition, not the honeybee decision section.**

It is almost perfectly matched to the new literature-derived warning: collective decision functions may scale before individuality is established.

Do not alter the frozen figure.

# 29. Signature recommendations after literature grounding

## Strongest opening candidate

> **SELECTION IS REAL. AGENCY HAS NOT YET BEEN EARNED.**

Keep provisionally, but body prose must acknowledge plural agency frameworks.

## Strongest collective brake

> **COLLECTIVE DECISION-MAKING CAN BE REAL BEFORE COLLECTIVE INDIVIDUALITY IS ESTABLISHED.**

High confidence.

## Observer-policy line

> A policy can exist in our model before a choice exists in the system.

Concept survives; likely demote because Chapter 10 already uses the same rhetorical architecture.

## Randomness line

> Unpredictability is not freedom.

Good prose. Do not promote unless narrative needs it.

## New architecture line

> **THE QUESTION IS NOT WHETHER A DECISION OCCURRED. THE QUESTION IS WHERE THE DECISION BELONGS.**

This may be Chapter 11's strongest candidate signature because it captures level ownership without redefining agency.

Needs hostile narrative testing in 12C/12E.

# 30. Claim → source map

| Claim | Source | Status |
|---|---|---|
| Agency has serious autonomous/organizational definitions not requiring deliberative choice | Barandiaran, Di Paolo & Rohde 2009; Moreno & Etxeberria 2005 | VERIFIED |
| Individuality can be constitutive of agency in an influential framework | Barandiaran et al. 2009 | VERIFIED |
| Collective decision is established scientific terminology in social insects | Visscher 2007; Seeley & Visscher 2004 | VERIFIED |
| Honeybee nest-site commitment uses quorum-sensitive mechanisms | Seeley & Visscher 2004 | VERIFIED |
| Group-level movement decisions can emerge from local interaction with few informed individuals | Couzin et al. 2005 | VERIFIED |
| Microbial collective sensing/decision language exists | Popat et al.; Ross-Gillespie & Kümmerli | WORKING — metadata recheck before manuscript use |
| Dopamine carries reward-prediction-error signals relevant to learning | Schultz 2016 reviews | VERIFIED |
| Dopamine reward signal is not equivalent to folk “desire” | Supported as a required interpretive restraint; do not claim a single signal exhausts reward/desire | SAFE WITH WORDING |
| Macro causal descriptions can outperform micro descriptions under effective-information formalism | Hoel et al. 2013 | VERIFIED, OPTIONAL |
| Macro causal advantage establishes agency | No | REJECTED |
| Component conflict is necessary for agency | No | REJECTED |
| Learning is necessary for agency | No | REJECTED |
| Multiple explicit policies are necessary for agency | No | REJECTED |
| Collective decision automatically establishes individuality | No | REJECTED |

# 31. Terminology changes required before 12C

1. `Policy Ownership Test` → **Action-Selection Ownership Test**.
2. `PA_agency` → **PA_choice**.
3. General prose `policy` → response strategy/course of action/action organization unless formal RL context.
4. `agency definition` → **project operationalization of higher-level choice/action selection**.
5. Learning/novelty/component conflict → stress tests, not universal criteria.
6. Fixed-policy success → defeats stronger project choice claim under tested conditions, not agency universally.
7. Individuality → explicitly acknowledged as constitutive of agency in some frameworks.

# 32. Hostile literature gate

1. Universal agency definition avoided — PASS AFTER REQUIRED REPAIR
2. Minimal agency literature represented — PASS
3. Individuality/agency dependency recognized — PASS
4. Selector adversary survives — PASS
5. Determinism firewall — PASS
6. Randomness firewall — PASS
7. Policy terminology — REPAIR REQUIRED
8. Fixed-policy overclaim — REPAIR REQUIRED
9. Learning overclaim — REPAIR REQUIRED
10. Reward/desire firewall — PASS
11. Honeybee collective decision terminology — PASS
12. Honeybee quorum mechanism — PASS
13. Centralized-decider inference blocked — PASS
14. Collective decision ≠ individuality — PASS
15. Animal-group local-rule rival — PASS
16. Microbial collective-decision example — PASS WITH SOURCE RECHECK
17. Component conflict necessity — REJECTED/DEMOTED
18. Counterfactual metaphysics avoided — PASS
19. Observer action partition — PASS
20. Causal emergence ≠ agency — PASS
21. Organizational closure fairly represented — PASS
22. Higher-level choice property operationalized — PASS
23. Boundary independence — PASS
24. Action-selection state dependence — PASS
25. Component rival — PASS
26. Environmental rival — PASS
27. Stochastic rival — PASS
28. Alternative-boundary rival — PASS
29. Prediction Advantage doctrine — PASS
30. Prediction Advantage ≠ property ownership — PASS
31. Intervention Advantage separate — PASS
32. No new forces — PASS
33. Model A legitimate — PASS
34. Model B legitimate — PASS
35. Model C property-specific — PASS
36. Consciousness firewall — PASS
37. Free-will firewall — PASS
38. Moral responsibility firewall — PASS
39. Individuality bridge — PASS WITH CONSTITUTIVE-DEPENDENCY WARNING
40. Figure 13 mapping — PASS

# Final disposition

`PASS 12B — CHAPTER 11 HOSTILE SCIENTIFIC LITERATURE GROUNDING: COMPLETE.`

The architecture survives, but it is now scientifically cleaner.

The decisive correction is:

> **Macroscopic Life must not define agency so narrowly that legitimate minimal-agency theories disappear. Chapter 11 instead tests a stronger and more specific property: whether action selection among viable alternatives can be causally attributed to the proposed whole.**

The strongest empirical worked case is now honeybee nest-site selection.

The strongest level-ownership question is:

> **THE QUESTION IS NOT WHETHER A DECISION OCCURRED. THE QUESTION IS WHERE THE DECISION BELONGS.**

The next-property bridge remains individuality, with an explicit warning that some theories treat individuality as constitutive of agency rather than a later property.

Next: PASS 12C — Chapter 11 narrative architecture using the corrected choice/action-selection framework.