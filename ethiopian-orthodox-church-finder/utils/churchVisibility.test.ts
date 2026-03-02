import { describe, it, expect } from 'vitest';
import {
  isChurchListedPublicly,
  canViewChurchDetail,
  canShowEventsSectionInAdminDashboard,
  filterPublicChurches,
} from './churchVisibility';
import type { Church } from '../types';

function makeChurch(overrides: Partial<Church> = {}): Church {
  return {
    id: 'c1',
    name: 'Test Church',
    address: '123 Main St',
    city: 'City',
    state: 'CA',
    zip: '90250',
    phone: '',
    description: '',
    imageUrl: '',
    members: 0,
    clergy: [],
    events: [],
    services: [],
    serviceSchedule: [],
    languages: [],
    features: {
      hasEnglishService: false,
      hasParking: false,
      wheelchairAccessible: false,
      hasSchool: false,
    },
    donationInfo: {},
    isVerified: false,
    coordinates: { lat: 0, lng: 0 },
    ...overrides,
  };
}

describe('isChurchListedPublicly', () => {
  it('returns true for church with status approved', () => {
    expect(isChurchListedPublicly(makeChurch({ status: 'approved' }))).toBe(true);
  });

  it('returns true for church with no status (backwards compatibility)', () => {
    expect(isChurchListedPublicly(makeChurch())).toBe(true);
    expect(isChurchListedPublicly(makeChurch({ status: undefined }))).toBe(true);
  });

  it('returns false for church with status pending', () => {
    expect(isChurchListedPublicly(makeChurch({ status: 'pending' }))).toBe(false);
  });

  it('returns false for church with status rejected', () => {
    expect(isChurchListedPublicly(makeChurch({ status: 'rejected' }))).toBe(false);
  });
});

describe('canViewChurchDetail', () => {
  it('allows viewing approved church for non-admin', () => {
    expect(canViewChurchDetail(makeChurch({ status: 'approved' }), false)).toBe(true);
  });

  it('allows viewing approved church for admin', () => {
    expect(canViewChurchDetail(makeChurch({ status: 'approved' }), true)).toBe(true);
  });

  it('allows viewing church with no status for anyone', () => {
    expect(canViewChurchDetail(makeChurch(), false)).toBe(true);
    expect(canViewChurchDetail(makeChurch({ status: undefined }), true)).toBe(true);
  });

  it('allows viewing pending church only for admin of that church', () => {
    expect(canViewChurchDetail(makeChurch({ status: 'pending' }), true)).toBe(true);
    expect(canViewChurchDetail(makeChurch({ status: 'pending' }), false)).toBe(false);
  });

  it('does not allow viewing rejected church for non-admin', () => {
    expect(canViewChurchDetail(makeChurch({ status: 'rejected' }), false)).toBe(false);
  });

  it('does not allow viewing rejected church for admin (still rejected)', () => {
    expect(canViewChurchDetail(makeChurch({ status: 'rejected' }), true)).toBe(false);
  });
});

describe('filterPublicChurches', () => {
  it('returns only approved churches and those with no status', () => {
    const churches: Church[] = [
      makeChurch({ id: 'c1', status: 'approved' }),
      makeChurch({ id: 'c2', status: 'pending' }),
      makeChurch({ id: 'c3', status: undefined }),
      makeChurch({ id: 'c4', status: 'rejected' }),
    ];
    const result = filterPublicChurches(churches);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(['c1', 'c3']);
  });

  it('returns empty array when all are pending or rejected', () => {
    const churches: Church[] = [
      makeChurch({ id: 'c1', status: 'pending' }),
      makeChurch({ id: 'c2', status: 'rejected' }),
    ];
    expect(filterPublicChurches(churches)).toHaveLength(0);
  });

  it('returns all when all are approved or no status', () => {
    const churches: Church[] = [
      makeChurch({ id: 'c1', status: 'approved' }),
      makeChurch({ id: 'c2' }),
    ];
    expect(filterPublicChurches(churches)).toHaveLength(2);
  });
});

describe('canShowEventsSectionInAdminDashboard', () => {
  it('returns true only for approved churches (Add Event and event list visible)', () => {
    expect(canShowEventsSectionInAdminDashboard(makeChurch({ status: 'approved' }))).toBe(true);
  });

  it('returns false for pending church (edit is still possible via profile, but Add Event is restricted)', () => {
    expect(canShowEventsSectionInAdminDashboard(makeChurch({ status: 'pending' }))).toBe(false);
  });

  it('returns false for rejected church', () => {
    expect(canShowEventsSectionInAdminDashboard(makeChurch({ status: 'rejected' }))).toBe(false);
  });

  it('returns false for church with no status (treated as not approved for events)', () => {
    expect(canShowEventsSectionInAdminDashboard(makeChurch())).toBe(false);
    expect(canShowEventsSectionInAdminDashboard(makeChurch({ status: undefined }))).toBe(false);
  });
});
