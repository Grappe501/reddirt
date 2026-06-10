#!/usr/bin/env tsx
/** Generate daily brief snapshot. Run: npm run victory:daily */
import { generateDailyDecisionBrief } from "../../src/lib/victory-os/daily-decisions/generate-daily-decisions";
import { persistDailyDecisionBrief, composeDailyBriefViewModel } from "../../src/lib/victory-os/daily-decisions/load-daily-brief";

const brief = generateDailyDecisionBrief();
persistDailyDecisionBrief(brief);
const vm = composeDailyBriefViewModel(brief.dayKey);
console.log(`Daily brief saved — ${brief.dayKey}`);
console.log(`Kelly today: ${vm.brief.kellyToday.length} · ${vm.intelligenceNarrative}`);
