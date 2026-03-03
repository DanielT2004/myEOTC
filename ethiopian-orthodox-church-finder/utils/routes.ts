import { ViewState } from '../types';

export interface RouteParams {
  view: ViewState;
  churchId?: string;
  eventId?: string;
}

/**
 * Parse current pathname into view and optional ids.
 */
export function getViewFromPathname(pathname: string): RouteParams {
  const normalized = pathname.replace(/\/$/, '') || '/';
  if (normalized === '/') return { view: ViewState.HOME };
  if (normalized === '/search') return { view: ViewState.SEARCH };
  if (normalized === '/events') return { view: ViewState.EVENTS };
  const eventMatch = normalized.match(/^\/events\/([^/]+)$/);
  if (eventMatch) return { view: ViewState.EVENT_DETAIL, eventId: eventMatch[1] };
  const churchEditMatch = normalized.match(/^\/churches\/([^/]+)\/edit$/);
  if (churchEditMatch) return { view: ViewState.CHURCH_ADMIN_DASHBOARD, churchId: churchEditMatch[1] };
  const churchMatch = normalized.match(/^\/churches\/([^/]+)$/);
  if (churchMatch) return { view: ViewState.CHURCH_DETAIL, churchId: churchMatch[1] };
  if (normalized === '/admin') return { view: ViewState.ADMIN_DASHBOARD };
  if (normalized === '/admin/no-church') return { view: ViewState.NO_CHURCH_PROMPT };
  if (normalized === '/register') return { view: ViewState.REGISTER_CHURCH };
  return { view: ViewState.HOME };
}

export interface NavigateOptions {
  churchId?: string;
  eventId?: string;
  addEvent?: boolean;
}

/**
 * Return path for a view (and optional ids). Used for programmatic navigation.
 */
export function getPathForView(view: ViewState, opts?: NavigateOptions): string {
  switch (view) {
    case ViewState.HOME:
      return '/';
    case ViewState.SEARCH:
      return '/search';
    case ViewState.EVENTS:
      return '/events';
    case ViewState.EVENT_DETAIL:
      return opts?.eventId ? `/events/${opts.eventId}` : '/events';
    case ViewState.CHURCH_DETAIL:
      return opts?.churchId ? `/churches/${opts.churchId}` : '/search';
    case ViewState.CHURCH_ADMIN_DASHBOARD:
      return opts?.churchId ? `/churches/${opts.churchId}/edit` : '/';
    case ViewState.ADMIN_DASHBOARD:
      return '/admin';
    case ViewState.NO_CHURCH_PROMPT:
      return '/admin/no-church';
    case ViewState.REGISTER_CHURCH:
      return '/register';
    default:
      return '/';
  }
}
