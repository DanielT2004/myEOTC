/// <reference types="vite/client" />
import type { ChurchEvent } from '../types';
import { supabase } from '../lib/supabase';
import { getEventLocationDisplay } from './eventService';

/**
 * Send event notification email via Courier to church mailing list subscribers.
 * Calls the Supabase Edge Function "send-event-notification", which runs on
 * Supabase's servers and calls the Courier API (avoids CORS; no local server).
 * @param toEmails - List of subscriber emails. Churches always have at least the admin as first subscriber.
 * @throws When the edge function fails so callers can avoid marking the event as notified.
 */
export async function sendEventNotificationEmail(
  event: ChurchEvent,
  churchName?: string,
  toEmails?: string[]
): Promise<void> {
  const body: Record<string, unknown> = {
    eventName: event.title,
    eventType: event.type,
    description: event.description ?? '',
    address: (getEventLocationDisplay(event) || event.location) ?? '',
    churchName: churchName ?? event.churchName ?? '',
    toEmails: toEmails?.length ? toEmails : undefined,
  };
  const { data, error } = await supabase.functions.invoke('send-event-notification', {
    body,
  });
  if (error) {
    console.warn('[courierService] Edge function error:', error.message);
    throw new Error(error.message ?? 'Failed to send notification email');
  }
  console.log('[courierService] Notification sent:', data?.message ?? data);
}
