# Message Studio Architecture (V1)

**Route:** `/admin/communications/studio`  
**Server:** `routeCampaignWriting()` from `campaign-writing-router.ts`  
**Client:** `MessageStudioClient.tsx` — edit subject/body only

## Features

- Audience, purpose, tone selectors
- AI-orchestrated initial draft (deterministic V1)
- Escalation warnings (mass block, send gates, persuasion)
- Preview mode — **no live mass send button**
- Send path guidance → ECC (`/admin/workbench/email-command-center`)

## County context

County slug can be passed into writing router → `county-message-adapter` (read-only countyWorkbench bridge).
