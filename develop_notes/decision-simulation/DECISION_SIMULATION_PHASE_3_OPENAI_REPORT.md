# Decision Simulation Engine — Phase 3 OpenAI Intelligence Report

**Status:** Runtime built and committed  
**Repository:** `Grappe501/reddirt`  
**Scope:** First expected-path OpenAI runtime  
**Execution posture:** Advisory-only; no send/post automation

## What Phase 3 Adds

Phase 3 adds the first model-backed Decision Simulation runtime using RedDirt's existing server-only `OPENAI_API_KEY` environment convention.

The runtime uses the OpenAI Responses API and strict JSON Schema structured output. It does not expose the key to client code, does not log the key, and does not add any new secret to GitHub.

Primary files:

- `src/lib/agents/decision-simulation/structured-output.ts`
- `src/lib/agents/decision-simulation/prompt.ts`
- `src/lib/agents/decision-simulation/openai-runtime.ts`
- `scripts/test-decision-simulation-openai-runtime.ts`
- `scripts/run-decision-simulation-openai-smoke.ts`

## Model Configuration

Model resolution order:

1. `DECISION_SIMULATION_OPENAI_MODEL`
2. existing RedDirt `OPENAI_MODEL`
3. fallback `gpt-4o-mini`

The API key is read only from `OPENAI_API_KEY` on the server.

## Canonical AI Output

The model generates exactly six moves after the deterministic opening move:

1. Counterparty predicted response
2. Operator recommended response
3. Counterparty predicted response
4. Operator recommended response
5. Counterparty predicted response
6. Operator recommended response

The deterministic engine preserves move 0, merges the six structured AI moves, and validates the final seven-node sequence.

Every generated move includes:

- message
- strategic objective
- predicted frame
- concise rationale summary
- risks
- opportunities
- explicit assumptions
- confidence label
- model-estimated scenario probability
- confidence explanation

The run also includes an executive summary, strongest risk, strongest opportunity, model identifier, response id when returned, prompt version, and token usage.

## Evidence Rule

The model is explicitly prohibited from inventing evidence, citations, private knowledge, polling, donor information, quotations, voting records, biographies, or events not supplied in context.

Generated moves therefore receive no evidence references in Phase 3. Governed evidence attachment belongs to the later Memory & Evidence phase.

## Reasoning / Privacy Rule

The prompt requests concise decision rationales only. Hidden chain-of-thought is neither requested nor persisted.

## Safety / Execution Boundary

The runtime remains advisory-only. It contains no send, post, schedule, publish, or autonomous execution capability. The operator retains final authority over recommendations.

## Verification

`test-decision-simulation-openai-runtime.ts` mocks the network response so the structure can be tested without consuming API credits. It checks:

- strict JSON Schema is requested;
- the canonical seven-node sequence is valid;
- exactly six generated moves are merged after the opening;
- no evidence references are model-invented;
- token usage metadata is captured;
- autonomous sending/posting remain disabled.

`run-decision-simulation-openai-smoke.ts` is the live environment smoke test. It uses the existing RedDirt `OPENAI_API_KEY` and a generic campaign scenario. It never prints the API key.

Run from a RedDirt environment with the key already configured:

`npx tsx scripts/run-decision-simulation-openai-smoke.ts`

## Known Gate

This GitHub-connected build can commit the runtime, but it cannot read the operator's private local RedDirt `.env` value. A successful live API smoke must therefore be proven from the RedDirt runtime/CI environment where `OPENAI_API_KEY` is actually present.

## Netlify Launch Gate

Preview launch remains targeted after Phase 5, when the OpenAI runtime, actor model, complete six-move engine, and a minimal usable interface form one end-to-end vertical slice.

## Next Phase

**Phase 4 — Actor / Opponent Modeling**

Build versioned actor profiles with known frames, incentives, likely escalation patterns, vulnerabilities, preferred channels, evidence provenance, recency, and uncertainty. Actor context must improve the simulation without being treated as deterministic truth.
