# Writing agent architecture (V1)

**Code:** `src/lib/agents/writing-agent/`

## No model training

V1 is **deterministic**: profile defaults + accepted-edit log + pattern replacements.

| File | Role |
|------|------|
| `writing-profile.ts` | Tone, themes, audience overrides |
| `writing-style-observations.ts` | `data/campaign-events/writing-style-observations.json` |
| `writing-suggestion-builder.ts` | `buildWritingSuggestion(text, audience)` |

## Audiences

candidate · host · volunteer · compliance · operator · public

## Tools (catalog)

`writing-voice-profile-builder`, `campaign-voice-style-matcher`, `plain-language-simplifier`, `email-tone-adapter`, etc. — see `sprint-agent-intelligence-tools.ts`

## Human gate

All sends and publishes require explicit operator approval.
