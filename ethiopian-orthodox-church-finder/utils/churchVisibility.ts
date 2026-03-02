import type { Church } from '../types';

/**
 * Returns true if the church should be listed in public views (search, home).
 * Only approved churches (or churches with no status for backwards compatibility) are visible.
 */
export function isChurchListedPublicly(church: Church): boolean {
  return church.status === 'approved' || !church.status;
}

/**
 * Returns true if the church detail page should be shown to the current user.
 * - Approved (or no status): always visible.
 * - Pending: only visible to the church's admin (isAdminOfChurch === true).
 * - Rejected: not visible (same as pending for non-admin).
 */
export function canViewChurchDetail(church: Church, isAdminOfChurch: boolean): boolean {
  if (church.status === 'approved' || !church.status) return true;
  if (church.status === 'pending' && isAdminOfChurch) return true;
  return false;
}

/**
 * Returns true if the church admin dashboard should show the Events section (Add Event, event list).
 * Only approved churches can add/manage events; pending and rejected cannot.
 * Edit church form can still open for pending (e.g. from profile) via initialChurchId.
 */
export function canShowEventsSectionInAdminDashboard(church: Church): boolean {
  return church.status === 'approved';
}

/**
 * Filters a list of churches to only those that should be shown in public lists.
 */
export function filterPublicChurches(churches: Church[]): Church[] {
  return churches.filter(isChurchListedPublicly);
}
