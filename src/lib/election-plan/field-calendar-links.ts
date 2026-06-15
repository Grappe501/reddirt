export function fieldCalendarHref(): string {
  return "/election-plan?tab=fieldCalendar";
}

export function fieldEventWorksheetHref(eventId: string): string {
  return `/election-plan/field-calendar/${encodeURIComponent(eventId)}`;
}

export function fieldOperationalCalendarHref(): string {
  return "/election-plan/field-calendar/operations";
}
