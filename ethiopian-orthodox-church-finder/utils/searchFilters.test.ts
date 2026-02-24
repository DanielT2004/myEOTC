import { describe, it, expect } from 'vitest';
import {
  churchMatchesSearch,
  churchMatchesNameFilter,
  churchMatchesLocationFilter,
  churchMatchesDistance,
  churchMatchesServices,
  filterChurches,
  eventMatchesSearch,
  eventMatchesLocationFilter,
  eventMatchesTypes,
  eventMatchesDateRange,
  filterEvents,
} from './searchFilters';
import type { Church, ChurchEvent, FilterState, EventFilterState } from '../types';
import type { ChurchWithDistance } from './searchFilters';

function makeChurch(overrides: Partial<Church> = {}): Church {
  return {
    id: 'c1',
    name: 'St. Mary Ethiopian Orthodox Church',
    address: '5355 W 135th St',
    city: 'Hawthorne',
    state: 'CA',
    zip: '90250',
    phone: '',
    description: '',
    imageUrl: '',
    members: 0,
    clergy: [],
    events: [],
    services: ['Sunday Service', 'Bible Study'],
    serviceSchedule: [],
    languages: [],
    features: {
      hasEnglishService: true,
      hasParking: true,
      wheelchairAccessible: false,
      hasSchool: false,
    },
    donationInfo: {},
    isVerified: true,
    coordinates: { lat: 33.9, lng: -118.37 },
    ...overrides,
  };
}

function makeEvent(overrides: Partial<ChurchEvent> = {}): ChurchEvent {
  return {
    id: 'e1',
    title: 'Meskel Celebration',
    type: 'Holiday',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // next week
    location: '5355 W 135th St, Hawthorne, CA',
    description: '',
    imageUrl: '',
    churchName: 'St. Mary EOTC',
    churchId: 'c1',
    ...overrides,
  };
}

describe('churchMatchesSearch', () => {
  const church = makeChurch();

  it('returns true for empty or whitespace query', () => {
    expect(churchMatchesSearch(church, '')).toBe(true);
    expect(churchMatchesSearch(church, '   ')).toBe(true);
  });

  it('matches by church name (case insensitive)', () => {
    expect(churchMatchesSearch(church, 'St. Mary')).toBe(true);
    expect(churchMatchesSearch(church, 'ethiopian')).toBe(true);
    expect(churchMatchesSearch(church, 'OTHER')).toBe(false);
  });

  it('matches by city', () => {
    expect(churchMatchesSearch(church, 'Hawthorne')).toBe(true);
    expect(churchMatchesSearch(church, 'hawthorne')).toBe(true);
    expect(churchMatchesSearch(church, 'Los Angeles')).toBe(false);
  });

  it('matches by address (location)', () => {
    expect(churchMatchesSearch(church, '135th')).toBe(true);
    expect(churchMatchesSearch(church, '5355')).toBe(true);
    expect(churchMatchesSearch(church, 'W 135th St')).toBe(true);
  });

  it('matches by zip', () => {
    expect(churchMatchesSearch(church, '90250')).toBe(true);
    expect(churchMatchesSearch(church, '90251')).toBe(false);
  });
});

describe('churchMatchesNameFilter', () => {
  const church = makeChurch({ name: 'St. Mary Ethiopian Orthodox Church' });

  it('returns true for empty or whitespace filter', () => {
    expect(churchMatchesNameFilter(church, '')).toBe(true);
    expect(churchMatchesNameFilter(church, '   ')).toBe(true);
  });

  it('matches by church name substring (case insensitive)', () => {
    expect(churchMatchesNameFilter(church, 'St. Mary')).toBe(true);
    expect(churchMatchesNameFilter(church, 'ethiopian')).toBe(true);
    expect(churchMatchesNameFilter(church, 'ORTHODOX')).toBe(true);
    expect(churchMatchesNameFilter(church, 'Other')).toBe(false);
  });
});

describe('churchMatchesLocationFilter', () => {
  const church = makeChurch();

  it('returns true for empty filter', () => {
    expect(churchMatchesLocationFilter(church, '')).toBe(true);
  });

  it('matches by city', () => {
    expect(churchMatchesLocationFilter(church, 'Hawthorne')).toBe(true);
    expect(churchMatchesLocationFilter(church, 'Los Angeles')).toBe(false);
  });

  it('matches by zip', () => {
    expect(churchMatchesLocationFilter(church, '90250')).toBe(true);
  });
});

describe('churchMatchesDistance', () => {
  it('returns true when no user location', () => {
    const church = makeChurch({ distance: 100 });
    expect(churchMatchesDistance(church, 25, null)).toBe(true);
  });

  it('returns true when church has no distance', () => {
    const church = makeChurch();
    expect(churchMatchesDistance(church, 25, { lat: 34, lng: -118 })).toBe(true);
  });

  it('returns true when church within max distance', () => {
    const church = makeChurch({ distance: 10 });
    expect(churchMatchesDistance(church, 25, { lat: 34, lng: -118 })).toBe(true);
    expect(churchMatchesDistance(church, 10, { lat: 34, lng: -118 })).toBe(true);
  });

  it('returns false when church beyond max distance', () => {
    const church = makeChurch({ distance: 30 });
    expect(churchMatchesDistance(church, 25, { lat: 34, lng: -118 })).toBe(false);
  });
});

describe('churchMatchesServices', () => {
  const church = makeChurch({ services: ['Sunday Service', 'Bible Study'] });

  it('returns true when no services selected', () => {
    expect(churchMatchesServices(church, {})).toBe(true);
    expect(churchMatchesServices(church, { 'Youth Programs': false })).toBe(true);
  });

  it('returns true when church offers at least one selected service', () => {
    expect(churchMatchesServices(church, { 'Bible Study': true })).toBe(true);
    expect(churchMatchesServices(church, { 'Sunday Service': true, 'Choir': true })).toBe(true);
  });

  it('returns false when church does not offer any selected service', () => {
    expect(churchMatchesServices(church, { 'Choir': true })).toBe(false);
    expect(churchMatchesServices(church, { 'Youth Programs': true })).toBe(false);
  });
});

describe('filterChurches', () => {
  const churches: ChurchWithDistance[] = [
    { ...makeChurch({ id: 'c1', name: 'St. Mary', city: 'Hawthorne', zip: '90250' }), distance: 5 },
    { ...makeChurch({ id: 'c2', name: 'Tekle Haimanot', city: 'Los Angeles', zip: '90026' }), distance: 15 },
    { ...makeChurch({ id: 'c3', name: 'Virgin Mary', city: 'Los Angeles', zip: '90011', address: '4544 S Compton Ave' }), distance: 30 },
  ];

  const defaultFilters: FilterState = {
    churchName: '',
    location: '',
    distance: 25,
    services: {},
  };

  it('returns all churches when no filters and empty query', () => {
    const result = filterChurches(churches, {
      searchQuery: '',
      filters: defaultFilters,
      userLocation: null,
    });
    expect(result).toHaveLength(3);
  });

  it('filters by search query (name)', () => {
    const result = filterChurches(churches, {
      searchQuery: 'Virgin',
      filters: defaultFilters,
      userLocation: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Virgin Mary');
  });

  it('filters by search query (city)', () => {
    const result = filterChurches(churches, {
      searchQuery: 'Hawthorne',
      filters: defaultFilters,
      userLocation: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].city).toBe('Hawthorne');
  });

  it('filters by search query (address)', () => {
    const result = filterChurches(churches, {
      searchQuery: 'Compton',
      filters: defaultFilters,
      userLocation: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].address).toContain('Compton');
  });

  it('filters by search query (zip)', () => {
    const result = filterChurches(churches, {
      searchQuery: '90250',
      filters: defaultFilters,
      userLocation: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].zip).toBe('90250');
  });

  it('filters by location filter (city)', () => {
    const result = filterChurches(churches, {
      searchQuery: '',
      filters: { ...defaultFilters, location: 'Los Angeles' },
      userLocation: null,
    });
    expect(result).toHaveLength(2);
  });

  it('filters by distance when user location is set', () => {
    const result = filterChurches(churches, {
      searchQuery: '',
      filters: { ...defaultFilters, distance: 20 },
      userLocation: { lat: 34, lng: -118 },
    });
    expect(result).toHaveLength(2); // distance 5 and 15, not 30
  });

  it('filters by services', () => {
    const withServices = churches.map((c) => ({
      ...c,
      services: c.id === 'c1' ? ['Sunday Service', 'Bible Study'] : c.id === 'c2' ? ['Bible Study', 'Choir'] : ['Sunday Service'],
    }));
    const result = filterChurches(withServices, {
      searchQuery: '',
      filters: { ...defaultFilters, services: { Choir: true } },
      userLocation: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c2');
  });

  it('filters by church name (sidebar filter)', () => {
    const result = filterChurches(churches, {
      searchQuery: '',
      filters: { ...defaultFilters, churchName: 'Virgin' },
      userLocation: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Virgin Mary');
  });

  it('combines search query and location filter', () => {
    const result = filterChurches(churches, {
      searchQuery: 'Mary',
      filters: { ...defaultFilters, location: 'Los Angeles' },
      userLocation: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Virgin Mary');
  });
});

describe('eventMatchesSearch', () => {
  const event = makeEvent();

  it('returns true for empty or whitespace query', () => {
    expect(eventMatchesSearch(event, '')).toBe(true);
    expect(eventMatchesSearch(event, '   ')).toBe(true);
  });

  it('matches by event title', () => {
    expect(eventMatchesSearch(event, 'Meskel')).toBe(true);
    expect(eventMatchesSearch(event, 'Celebration')).toBe(true);
    expect(eventMatchesSearch(event, 'Picnic')).toBe(false);
  });

  it('matches by church name', () => {
    expect(eventMatchesSearch(event, 'St. Mary')).toBe(true);
    expect(eventMatchesSearch(event, 'EOTC')).toBe(true);
    expect(eventMatchesSearch(event, 'Other Church')).toBe(false);
  });

  it('matches by event location', () => {
    expect(eventMatchesSearch(event, 'Hawthorne')).toBe(true);
    expect(eventMatchesSearch(event, '135th')).toBe(true);
    expect(eventMatchesSearch(event, 'Compton')).toBe(false);
  });

  it('handles missing churchName', () => {
    const noChurch = makeEvent({ churchName: undefined });
    expect(eventMatchesSearch(noChurch, 'Meskel')).toBe(true);
    expect(eventMatchesSearch(noChurch, 'St. Mary')).toBe(false);
  });
});

describe('eventMatchesLocationFilter', () => {
  const event = makeEvent({ location: '5355 W 135th St, Hawthorne, CA' });

  it('returns true for empty filter', () => {
    expect(eventMatchesLocationFilter(event, '')).toBe(true);
  });

  it('matches by location substring', () => {
    expect(eventMatchesLocationFilter(event, 'Hawthorne')).toBe(true);
    expect(eventMatchesLocationFilter(event, '135th')).toBe(true);
    expect(eventMatchesLocationFilter(event, 'Los Angeles')).toBe(false);
  });
});

describe('eventMatchesTypes', () => {
  const event = makeEvent({ type: 'Holiday' });

  it('returns true when no types selected', () => {
    expect(eventMatchesTypes(event, {})).toBe(true);
  });

  it('returns true when event type is selected', () => {
    expect(eventMatchesTypes(event, { Holiday: true })).toBe(true);
    expect(eventMatchesTypes(event, { Holiday: true, 'Bible Study': true })).toBe(true);
  });

  it('returns false when different type selected', () => {
    expect(eventMatchesTypes(event, { 'Bible Study': true })).toBe(false);
  });
});

describe('eventMatchesDateRange', () => {
  it('returns true for upcoming (no date filter)', () => {
    const event = makeEvent({ date: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString() });
    expect(eventMatchesDateRange(event, 'upcoming')).toBe(true);
  });

  it('returns true for thisWeek when event is within next 7 days', () => {
    const event = makeEvent({ date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() });
    expect(eventMatchesDateRange(event, 'thisWeek')).toBe(true);
  });

  it('returns false for thisWeek when event is beyond 7 days', () => {
    const event = makeEvent({ date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() });
    expect(eventMatchesDateRange(event, 'thisWeek')).toBe(false);
  });

  it('returns true for thisMonth when event is within next 30 days', () => {
    const event = makeEvent({ date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() });
    expect(eventMatchesDateRange(event, 'thisMonth')).toBe(true);
  });
});

describe('filterEvents', () => {
  const events: ChurchEvent[] = [
    makeEvent({ id: 'e1', title: 'Meskel Celebration', churchName: 'St. Mary EOTC', location: 'Hawthorne, CA' }),
    makeEvent({ id: 'e2', title: 'Youth Gospel Night', churchName: 'Tekle Haimanot', location: 'Los Angeles, CA', type: 'Bible Study' }),
    makeEvent({ id: 'e3', title: 'Annual Parish Picnic', churchName: 'Virgin Mary', location: 'Kenneth Hahn Park, LA', type: 'Community' }),
  ];

  const defaultFilters: EventFilterState = {
    query: '',
    location: '',
    types: {},
    dateRange: 'upcoming',
  };

  it('returns all events when no filters and empty query', () => {
    const result = filterEvents(events, { searchQuery: '', filters: defaultFilters });
    expect(result).toHaveLength(3);
  });

  it('filters by search query (event title)', () => {
    const result = filterEvents(events, { searchQuery: 'Meskel', filters: defaultFilters });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Meskel Celebration');
  });

  it('filters by search query (church name)', () => {
    const result = filterEvents(events, { searchQuery: 'Virgin Mary', filters: defaultFilters });
    expect(result).toHaveLength(1);
    expect(result[0].churchName).toBe('Virgin Mary');
  });

  it('filters by search query (event location)', () => {
    const result = filterEvents(events, { searchQuery: 'Kenneth Hahn', filters: defaultFilters });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Annual Parish Picnic');
  });

  it('filters by location filter', () => {
    const result = filterEvents(events, {
      searchQuery: '',
      filters: { ...defaultFilters, location: 'Los Angeles' },
    });
    expect(result).toHaveLength(1); // e2 has "Los Angeles, CA"; e3 has "LA" (substring no)
    expect(result[0].location).toContain('Los Angeles');
  });

  it('filters by event type', () => {
    const result = filterEvents(events, {
      searchQuery: '',
      filters: { ...defaultFilters, types: { 'Bible Study': true } },
    });
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('Bible Study');
  });

  it('combines search query and type filter', () => {
    const result = filterEvents(events, {
      searchQuery: 'Mary',
      filters: { ...defaultFilters, types: { Holiday: true } },
    });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Meskel Celebration');
  });
});
