import type { ChurchEvent } from '../types';

/**
 * Reference time for "now" — can be overridden in tests for deterministic results.
 */
function getNow(now?: Date): Date {
  return now ?? new Date();
}

/**
 * Returns true if the event's date is in the future or exactly now (upcoming).
 * Optional `now` parameter for testing.
 */
export function isEventUpcoming(event: ChurchEvent, now?: Date): boolean {
  const ref = getNow(now);
  const eventDate = new Date(event.date);
  return eventDate.getTime() >= ref.getTime();
}

/**
 * Returns true if the event's date has passed (in the past).
 */
export function isEventPast(event: ChurchEvent, now?: Date): boolean {
  return !isEventUpcoming(event, now);
}

/**
 * Filters events to only those that are upcoming (date >= now).
 */
export function filterUpcomingEvents(events: ChurchEvent[], now?: Date): ChurchEvent[] {
  return events.filter((e) => isEventUpcoming(e, now));
}

/**
 * Splits events into upcoming and previous (past) for display (e.g. church profile).
 */
export function splitEventsByUpcoming(
  events: ChurchEvent[],
  now?: Date
): { upcoming: ChurchEvent[]; previous: ChurchEvent[] } {
  const ref = getNow(now);
  const upcoming: ChurchEvent[] = [];
  const previous: ChurchEvent[] = [];
  for (const event of events) {
    if (new Date(event.date).getTime() >= ref.getTime()) {
      upcoming.push(event);
    } else {
      previous.push(event);
    }
  }
  return { upcoming, previous };
}

/**
 * Returns true if the given date string is in the future (valid for new/edited event).
 * Used to validate event form: users cannot add or set an event date in the past.
 */
export function isValidEventDate(date: string | undefined, now?: Date): boolean {
  if (!date) return false;
  const ref = getNow(now);
  const eventDate = new Date(date);
  return eventDate.getTime() >= ref.getTime();
}
