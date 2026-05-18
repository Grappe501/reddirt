# Compliance release gate report

## Script

```bash
npm run compliance:qa-release
```

Output: `reports/compliance/release-gate-report.json`

## Checks

- Rule corpus source shape
- Retrieval / chunk citations
- Filing hard gates evaluation
- Reconciliation lock module present
- Synthetic filing export (draft watermark)
- Storage health
- Dashboard routes exist
- AI human-approval guardrails on advanced tools
- Finalization completion % (informational)

## Pass/fail policy

- **Fails (exit 1)** only on red structural checks (missing routes, missing lock module, broken AI guardrails).
- **Yellow** for pending legal verification, storage fallback, blocked hard gates — expected pre-launch.
- Legal verification pending does **not** fail the gate; status is reported honestly in `legalVerificationPending`.
