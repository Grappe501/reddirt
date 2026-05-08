import "server-only";

import { cache } from "react";
import { getEmailReadinessLite } from "@/lib/email-command-center/email-readiness-lite";
import { getCalendarReadinessLite } from "@/lib/calendar/calendar-readiness-lite";
import { getCalendarRequestPipelineCounts } from "@/lib/calendar/calendar-requests";

/**
 * Request-level memoization for read-only dashboard snapshots.
 * Do not use for mutation responses, send results, or user-specific secrets.
 */
export const getCachedEmailReadinessLite = cache(getEmailReadinessLite);

export const getCachedCalendarReadinessLite = cache(getCalendarReadinessLite);

export const getCachedCalendarRequestPipelineCounts = cache(getCalendarRequestPipelineCounts);
