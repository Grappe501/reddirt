import type { EventItem } from "@/content/types";
import { eventCardActionHref, isKellyNotAttending } from "@/lib/events/public-event-kind";

export type EventMarkChip = {
  key: "kellyRole" | "tabling" | "volunteers" | "mobilize";
  label: string;
  href?: string;
};

export function isMobilizeHref(href: string | undefined): boolean {
  if (!href) return false;
  return /(?:^|[/.])mobilize\.us(?:\/|$|\?)/i.test(href) || href.includes("mobilize.us");
}

export function resolveMobilizeHref(event: EventItem): string | undefined {
  const fromMarks = event.marks?.mobilizeHref?.trim();
  if (fromMarks) return fromMarks;
  if (isMobilizeHref(event.rsvpHref)) return event.rsvpHref;
  return undefined;
}

/** Neighbor-facing chips. Unset fields stay off the card. */
export function publicEventMarkChips(event: EventItem): EventMarkChip[] {
  const m = event.marks;
  if (!m) return [];
  const chips: EventMarkChip[] = [];
  const redCard = isKellyNotAttending(event);

  if (m.kellyRole === "speaking" && !redCard) {
    chips.push({ key: "kellyRole", label: "Kelly speaking" });
  } else if (m.kellyRole === "present") {
    chips.push({ key: "kellyRole", label: "Kelly will be there" });
  } else if (m.kellyRole === "not_attending") {
    chips.push({ key: "kellyRole", label: "Kelly not attending" });
  } else if (m.kellyRole === "tba") {
    chips.push({ key: "kellyRole", label: "Speaking TBA" });
  }

  if (m.tabling === "yes") {
    chips.push({ key: "tabling", label: "Campaign table" });
  } else if (m.tabling === "planned") {
    chips.push({ key: "tabling", label: "Table planned" });
  }

  if (m.volunteers === "needed") {
    chips.push({ key: "volunteers", label: "Volunteers needed" });
  } else if (m.volunteers === "shifts_open") {
    const volunteerHref = m.volunteerHref?.trim();
    chips.push({
      key: "volunteers",
      label: "Volunteer shifts open",
      href: volunteerHref || undefined,
    });
  }

  if (m.mobilize === "live") {
    chips.push({
      key: "mobilize",
      label: "RSVP on Mobilize",
      href: resolveMobilizeHref(event),
    });
  } else if (m.mobilize === "needed") {
    chips.push({ key: "mobilize", label: "Signup coming" });
  }

  return chips;
}

/** Mobilize-aware card CTA. Null means keep the existing details button. */
export function eventMarksCta(event: EventItem): { href: string; label: string } | null {
  const status = event.marks?.mobilize;
  if (status === "live") {
    return {
      href: resolveMobilizeHref(event) ?? eventCardActionHref(event),
      label: "RSVP on Mobilize",
    };
  }
  if (status === "needed") {
    return {
      href: event.detailHref ?? `/events/${event.slug}`,
      label: "Signup coming",
    };
  }
  return null;
}
