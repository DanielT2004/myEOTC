import type { Church, ChurchEvent, FilterState, EventFilterState } from '../types';

/** Church with optional distance (set after processing with user location). */
export type ChurchWithDistance = Church & { distance?: number };

/**
 * Returns true if the church matches the search query (name, city, address, or zip).
 */
export function churchMatchesSearch(
  church: Church,
  searchQuery: string
): boolean {
  if (!searchQuery.trim()) return true;
  const q = searchQuery.toLowerCase().trim();
  return (
    church.name.toLowerCase().includes(q) ||
    church.city.toLowerCase().includes(q) ||
    church.address.toLowerCase().includes(q) ||
    church.state.toLowerCase().includes(q)||
    church.zip.includes(searchQuery.trim())
  );
}

/**
 * Returns true if the church name matches the church name filter (substring, case insensitive).
 */
export function churchMatchesNameFilter(
  church: Church,
  churchNameFilter: string
): boolean {
  if (!churchNameFilter.trim()) return true;
  return church.name.toLowerCase().includes(churchNameFilter.toLowerCase().trim());
}

/**
 * Returns true if the church matches the location filter (city or zip).
 */
export function churchMatchesLocationFilter(
  church: Church,
  locationFilter: string
): boolean {
  if (!locationFilter.trim()) return true;
  const loc = locationFilter.toLowerCase().trim();
  return (
    church.city.toLowerCase().includes(loc) ||
    church.state.toLowerCase().includes(loc) ||
    church.zip.includes(locationFilter.trim())
  );
}

/**
 * Returns true if the church is within the distance limit (when user location is set).
 */
export function churchMatchesDistance(
  church: ChurchWithDistance,
  maxDistanceMiles: number,
  userLocation: { lat: number; lng: number } | null
): boolean {
  if (!userLocation) return true;
  if (church.distance == null) return true;
  return church.distance <= maxDistanceMiles;
}

/**
 * Returns true if the church offers at least one of the selected services.
 */
export function churchMatchesServices(
  church: Church,
  selectedServices: Record<string, boolean>
): boolean {
  const active = Object.keys(selectedServices).filter((k) => selectedServices[k]);
  if (active.length === 0) return true;
  return active.some((s) => church.services.includes(s));
}

/**
 * Filters churches by search query, location filter, distance, and services.
 */
export function filterChurches(
  churches: ChurchWithDistance[],
  options: {
    searchQuery: string;
    filters: FilterState;
    userLocation: { lat: number; lng: number } | null;
  }
): ChurchWithDistance[] {
  const { searchQuery, filters, userLocation } = options;
  return churches.filter((church) => {
    if (!churchMatchesSearch(church, searchQuery)) return false;
    if (!churchMatchesNameFilter(church, filters.churchName)) return false;
    if (!churchMatchesLocationFilter(church, filters.location)) return false;
    if (!churchMatchesDistance(church, filters.distance, userLocation)) return false;
    if (!churchMatchesServices(church, filters.services)) return false;
    return true;
  });
}

/**
 * Returns true if the event matches the search query (title, church name, or location).
 */
export function eventMatchesSearch(
  event: ChurchEvent,
  searchQuery: string
): boolean {
  if (!searchQuery.trim()) return true;
  const q = searchQuery.toLowerCase().trim();
  const matchTitle = event.title.toLowerCase().includes(q);
  const matchChurch = (event.churchName ?? '').toLowerCase().includes(q);
  const matchLocation = event.location.toLowerCase().includes(q);
  return matchTitle || matchChurch || matchLocation;
}

/**
 * Returns true if the event matches the location filter (city, state, zip, address, or location string).
 */
export function eventMatchesLocationFilter(
  event: ChurchEvent,
  locationFilter: string
): boolean {
  if (!locationFilter.trim()) return true;
  const loc = locationFilter.toLowerCase().trim();
  const fields = [
    event.city,
    event.state,
    event.zip,
    event.address,
    event.location,
  ].filter(Boolean) as string[];
  return fields.some((f) => f.toLowerCase().includes(loc));
}

/**
 * Returns true if the event matches the selected types.
 */
export function eventMatchesTypes(
  event: ChurchEvent,
  selectedTypes: Record<string, boolean>
): boolean {
  const active = Object.keys(selectedTypes).filter((k) => selectedTypes[k]);
  if (active.length === 0) return true;
  return active.includes(event.type);
}

/**
 * Returns true if the event falls within the date range.
 */
export function eventMatchesDateRange(
  event: ChurchEvent,
  dateRange: EventFilterState['dateRange']
): boolean {
  if (dateRange === 'upcoming') return true;
  const eventDate = new Date(event.date);
  const now = new Date();
  if (dateRange === 'thisWeek') {
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    return eventDate >= now && eventDate <= nextWeek;
  }
  if (dateRange === 'thisMonth') {
    const nextMonth = new Date();
    nextMonth.setDate(now.getDate() + 30);
    return eventDate >= now && eventDate <= nextMonth;
  }
  return true;
}

/**
 * Filters events by search query and filter state (location, types, date range).
 */
export function filterEvents(
  events: ChurchEvent[],
  options: {
    searchQuery: string;
    filters: EventFilterState;
  }
): ChurchEvent[] {
  const { searchQuery, filters } = options;
  return events.filter((event) => {
    if (!eventMatchesSearch(event, searchQuery)) return false;
    if (!eventMatchesLocationFilter(event, filters.location)) return false;
    if (!eventMatchesTypes(event, filters.types)) return false;
    if (!eventMatchesDateRange(event, filters.dateRange)) return false;
    return true;
  });
}
