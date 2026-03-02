import { supabase } from '../lib/supabase';

/**
 * Thorough email validation: must contain exactly one "@", valid local part, and valid domain with TLD.
 * Ensures only properly formatted addresses are stored.
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length > 254) return false;

  // Must contain exactly one "@"
  const atIndex = trimmed.indexOf('@');
  if (atIndex === -1 || atIndex !== trimmed.lastIndexOf('@')) return false;

  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);

  // Local part: non-empty, max 64 chars, no spaces, allowed: letters, numbers, . _ -
  if (localPart.length === 0 || localPart.length > 64) return false;
  if (/\s/.test(localPart)) return false;
  if (!/^[a-z0-9._+-]+$/.test(localPart)) return false;
  // No leading/trailing dot or consecutive dots in local part
  if (localPart.startsWith('.') || localPart.endsWith('.') || /\.\./.test(localPart)) return false;

  // Domain: non-empty, has at least one "." for TLD, no spaces
  if (domain.length === 0 || domain.length > 253) return false;
  if (/\s/.test(domain)) return false;
  const lastDot = domain.lastIndexOf('.');
  if (lastDot === -1 || lastDot === domain.length - 1) return false;
  const tld = domain.slice(lastDot + 1);
  if (tld.length < 2) return false; // TLD at least 2 chars (e.g. .co, .uk)
  // Domain and TLD: letters, numbers, hyphens, dots
  if (!/^[a-z0-9.-]+\.[a-z0-9.-]+$/.test(domain)) return false;

  return true;
}

export type SubscribeResult =
  | { success: true }
  | { success: false; error: 'invalid_email' | 'already_subscribed' | 'network_error' };

/**
 * Subscribe an email to a church's mailing list.
 * Validates format and checks for duplicates before inserting.
 */
export async function subscribeToChurch(
  email: string,
  churchId: string
): Promise<SubscribeResult> {
  if (!churchId?.trim()) {
    return { success: false, error: 'network_error' };
  }
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    return { success: false, error: 'invalid_email' };
  }

  const { data: existing } = await supabase
    .from('church_subscribers')
    .select('id')
    .eq('church_id', churchId)
    .eq('email', normalized)
    .maybeSingle();

  if (existing) {
    return { success: false, error: 'already_subscribed' };
  }

  const { error } = await supabase.from('church_subscribers').insert({
    church_id: churchId,
    email: normalized,
  });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'already_subscribed' };
    }
    return { success: false, error: 'network_error' };
  }

  return { success: true };
}

/**
 * Fetch email addresses subscribed to a church. Used when sending event notifications.
 * Caller must be a church admin (enforced by RLS).
 */
export async function getChurchSubscribers(churchId: string): Promise<string[]> {
  if (!churchId?.trim()) return [];
  const { data, error } = await supabase
    .from('church_subscribers')
    .select('email')
    .eq('church_id', churchId);

  if (error) return [];
  return (data ?? []).map((r) => r.email);
}
