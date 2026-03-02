import { describe, it, expect } from 'vitest';
import { getStatusUpdateAction } from './adminDashboardUtils';

describe('getStatusUpdateAction', () => {
  it('returns "delete" when status is rejected (church is removed from DB so user can register again)', () => {
    expect(getStatusUpdateAction('rejected')).toBe('delete');
  });

  it('returns "update" when status is approved', () => {
    expect(getStatusUpdateAction('approved')).toBe('update');
  });

  it('returns "update" when status is pending', () => {
    expect(getStatusUpdateAction('pending')).toBe('update');
  });
});
