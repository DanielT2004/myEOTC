import { describe, it, expect } from 'vitest';
import {
  isEventUpcoming,
  isEventPast,
  filterUpcomingEvents,
  splitEventsByUpcoming,
  isValidEventDate,
} from './eventUtils';
import type { ChurchEvent } from '../types';

function makeEvent(overrides: Partial<ChurchEvent> = {}): ChurchEvent {
  return {
    id: 'e1',
    title: 'Test Event',
    type: 'Holiday',
    date: new Date().toISOString(),
    location: 'Here',
    description: '',
    imageUrl: '',
    ...overrides,
  };
}

describe('isEventUpcoming', () => {
  const now = new Date('2025-06-15T12:00:00.000Z');

  it('returns true when event date is in the future', () => {
    const event = makeEvent({ date: new Date('2025-06-20T12:00:00.000Z').toISOString() });
    expect(isEventUpcoming(event, now)).toBe(true);
  });

  it('returns true when event date is exactly now', () => {
    const event = makeEvent({ date: new Date('2025-06-15T12:00:00.000Z').toISOString() });
    expect(isEventUpcoming(event, now)).toBe(true);
  });

  it('returns false when event date is in the past', () => {
    const event = makeEvent({ date: new Date('2025-06-10T12:00:00.000Z').toISOString() });
    expect(isEventUpcoming(event, now)).toBe(false);
  });

  it('uses current time when now is not provided', () => {
    const futureEvent = makeEvent({
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    const pastEvent = makeEvent({
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    });
    expect(isEventUpcoming(futureEvent)).toBe(true);
    expect(isEventUpcoming(pastEvent)).toBe(false);
  });
});

describe('isEventPast', () => {
  const now = new Date('2025-06-15T12:00:00.000Z');

  it('returns false when event is upcoming', () => {
    const event = makeEvent({ date: new Date('2025-06-20T12:00:00.000Z').toISOString() });
    expect(isEventPast(event, now)).toBe(false);
  });

  it('returns true when event date is in the past', () => {
    const event = makeEvent({ date: new Date('2025-06-10T12:00:00.000Z').toISOString() });
    expect(isEventPast(event, now)).toBe(true);
  });
});

describe('filterUpcomingEvents', () => {
  const now = new Date('2025-06-15T12:00:00.000Z');

  it('returns only events with date >= now', () => {
    const events: ChurchEvent[] = [
      makeEvent({ id: 'e1', date: new Date('2025-06-10T12:00:00.000Z').toISOString() }),
      makeEvent({ id: 'e2', date: new Date('2025-06-20T12:00:00.000Z').toISOString() }),
      makeEvent({ id: 'e3', date: new Date('2025-06-15T12:00:00.000Z').toISOString() }),
      makeEvent({ id: 'e4', date: new Date('2025-06-01T12:00:00.000Z').toISOString() }),
    ];
    const result = filterUpcomingEvents(events, now);
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(['e2', 'e3']);
  });

  it('returns empty array when all events are in the past', () => {
    const events: ChurchEvent[] = [
      makeEvent({ date: new Date('2025-06-01T12:00:00.000Z').toISOString() }),
      makeEvent({ date: new Date('2025-06-10T12:00:00.000Z').toISOString() }),
    ];
    expect(filterUpcomingEvents(events, now)).toHaveLength(0);
  });

  it('returns all when all events are upcoming', () => {
    const events: ChurchEvent[] = [
      makeEvent({ id: 'e1', date: new Date('2025-06-20T12:00:00.000Z').toISOString() }),
      makeEvent({ id: 'e2', date: new Date('2025-07-01T12:00:00.000Z').toISOString() }),
    ];
    expect(filterUpcomingEvents(events, now)).toHaveLength(2);
  });
});

describe('splitEventsByUpcoming', () => {
  const now = new Date('2025-06-15T12:00:00.000Z');

  it('splits events into upcoming and previous', () => {
    const events: ChurchEvent[] = [
      makeEvent({ id: 'past1', date: new Date('2025-06-01T12:00:00.000Z').toISOString() }),
      makeEvent({ id: 'upcoming1', date: new Date('2025-06-20T12:00:00.000Z').toISOString() }),
      makeEvent({ id: 'past2', date: new Date('2025-06-10T12:00:00.000Z').toISOString() }),
      makeEvent({ id: 'upcoming2', date: new Date('2025-06-15T12:00:00.000Z').toISOString() }),
    ];
    const { upcoming, previous } = splitEventsByUpcoming(events, now);
    expect(upcoming).toHaveLength(2);
    expect(previous).toHaveLength(2);
    expect(upcoming.map((e) => e.id).sort()).toEqual(['upcoming1', 'upcoming2']);
    expect(previous.map((e) => e.id).sort()).toEqual(['past1', 'past2']);
  });

  it('returns empty upcoming when all are past', () => {
    const events: ChurchEvent[] = [
      makeEvent({ date: new Date('2025-06-01T12:00:00.000Z').toISOString() }),
    ];
    const { upcoming, previous } = splitEventsByUpcoming(events, now);
    expect(upcoming).toHaveLength(0);
    expect(previous).toHaveLength(1);
  });

  it('returns empty previous when all are upcoming', () => {
    const events: ChurchEvent[] = [
      makeEvent({ date: new Date('2025-06-20T12:00:00.000Z').toISOString() }),
    ];
    const { upcoming, previous } = splitEventsByUpcoming(events, now);
    expect(upcoming).toHaveLength(1);
    expect(previous).toHaveLength(0);
  });
});

describe('isValidEventDate', () => {
  const now = new Date('2025-06-15T12:00:00.000Z');

  it('returns false for undefined or empty date', () => {
    expect(isValidEventDate(undefined, now)).toBe(false);
    expect(isValidEventDate('', now)).toBe(false);
  });

  it('returns true when date is in the future', () => {
    expect(isValidEventDate(new Date('2025-06-20T12:00:00.000Z').toISOString(), now)).toBe(true);
    expect(isValidEventDate('2025-07-01T18:00:00.000Z', now)).toBe(true);
  });

  it('returns true when date is exactly now', () => {
    expect(isValidEventDate(new Date('2025-06-15T12:00:00.000Z').toISOString(), now)).toBe(true);
  });

  it('returns false when date is in the past', () => {
    expect(isValidEventDate(new Date('2025-06-10T12:00:00.000Z').toISOString(), now)).toBe(false);
    expect(isValidEventDate('2025-06-01T00:00:00.000Z', now)).toBe(false);
  });

  it('uses current time when now is not provided', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const pastDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(isValidEventDate(futureDate)).toBe(true);
    expect(isValidEventDate(pastDate)).toBe(false);
  });
});
