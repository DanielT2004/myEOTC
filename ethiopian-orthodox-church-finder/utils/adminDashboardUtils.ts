import type { ChurchStatus } from '../types';

/**
 * When a super admin updates a church's status, reject means delete from DB
 * (so the user can register again); approve/pending mean update status only.
 */
export type StatusUpdateAction = 'delete' | 'update';

export function getStatusUpdateAction(status: ChurchStatus): StatusUpdateAction {
  return status === 'rejected' ? 'delete' : 'update';
}
