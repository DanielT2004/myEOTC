import { supabase } from '../lib/supabase';
import { ChurchEvent } from '../types';

/** ISO string for "now" (start of current moment) for filtering upcoming events. */
const nowISO = () => new Date().toISOString();

/** Build display location string from structured fields or legacy location. */
export function getEventLocationDisplay(event: { address?: string; city?: string; state?: string; zip?: string; location?: string }): string {
  if (event.address || event.city || event.state || event.zip) {
    const parts = [event.address, event.city, [event.state, event.zip].filter(Boolean).join(' ')].filter(Boolean);
    return parts.join(', ');
  }
  return event.location ?? '';
}

// Transform database event to app event format (location is computed from address fields)
const transformEvent = (dbEvent: any, churchName?: string): ChurchEvent => {
  const location = getEventLocationDisplay({
    address: dbEvent.address,
    city: dbEvent.city,
    state: dbEvent.state,
    zip: dbEvent.zip,
  });
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    type: dbEvent.type,
    date: dbEvent.date,
    location,
    address: dbEvent.address,
    city: dbEvent.city,
    state: dbEvent.state,
    zip: dbEvent.zip,
    coordinates: dbEvent.coordinates,
    description: dbEvent.description,
    imageUrl: dbEvent.image_url || '',
    churchId: dbEvent.church_id,
    churchName: churchName || dbEvent.church_name,
    notificationSentAt: dbEvent.notification_sent_at ?? null,
  };
};

// Transform app event to database format (no location column - use address, city, state, zip only)
const transformEventForDb = (event: Partial<ChurchEvent>): any => {
  return {
    title: event.title,
    type: event.type,
    date: event.date,
    address: event.address,
    city: event.city,
    state: event.state,
    zip: event.zip,
    coordinates: event.coordinates,
    description: event.description,
    image_url: event.imageUrl,
    church_id: event.churchId,
  };
};

/** Get church name from a Supabase event row (join can be object, array, or under "church" key). */
function getChurchNameFromRow(row: any): string | undefined {
  if (!row) return undefined;
  const c = row.churches ?? row.church;
  if (!c) return undefined;
  if (typeof c === 'object' && c !== null && 'name' in c) return (c as { name?: string }).name;
  if (Array.isArray(c) && c[0]?.name) return c[0].name;
  return undefined;
}

export const eventService = {
  // Get all events for approved churches (public) — only upcoming (date >= now)
  async getAllEvents(): Promise<ChurchEvent[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          churches!inner (
            name,
            status,
            coordinates,
            address,
            city,
            state,
            zip
          )
        `)
        .eq('churches.status', 'approved')
        .gte('date', nowISO())
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        // Return empty array if Supabase isn't configured
        if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
          return [];
        }
        throw error;
      }
      return (data || []).map((item: any) => {
        const event = transformEvent(item, item.churches?.name);
        // Use church coordinates for distance when event has none
        if (!event.coordinates && item.churches?.coordinates) {
          event.coordinates = item.churches.coordinates;
        }
        return event;
      });
    } catch (error: any) {
      console.error('Error in getAllEvents:', error);
      // Return empty array on any error to prevent app crash
      return [];
    }
  },

  /**
   * Search events by query, location (city/state/zip), types, date range, and optionally distance.
   * Joins with churches for coordinates and approved status.
   */
  async searchEvents(params: {
    query?: string;
    location?: string;
    distance?: number;
    types?: string[];
    dateRange?: 'upcoming' | 'thisMonth' | 'thisWeek';
    userLocation?: { lat: number; lng: number } | null;
  }): Promise<ChurchEvent[]> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          churches!inner (
            name,
            status,
            coordinates,
            address,
            city,
            state,
            zip
          )
        `)
        .eq('churches.status', 'approved')
        .gte('date', nowISO())
        .order('date', { ascending: true });

      if (params.location?.trim()) {
        const loc = params.location.trim();
        query = query.or(`city.ilike.%${loc}%,state.ilike.%${loc}%,zip.ilike.%${loc}%,address.ilike.%${loc}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching events:', error);
        if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
          return [];
        }
        throw error;
      }

      let results = (data || []).map((item: any) => {
        const event = transformEvent(item, item.churches?.name);
        if (!event.coordinates && item.churches?.coordinates) {
          event.coordinates = item.churches.coordinates;
        }
        return event;
      });

      if (params.query?.trim()) {
        const q = params.query.trim().toLowerCase();
        results = results.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            (e.churchName ?? '').toLowerCase().includes(q)
        );
      }

      if (params.types && params.types.length > 0) {
        results = results.filter((e) => params.types!.includes(e.type));
      }

      if (params.dateRange && params.dateRange !== 'upcoming') {
        const now = new Date();
        if (params.dateRange === 'thisWeek') {
          const nextWeek = new Date();
          nextWeek.setDate(now.getDate() + 7);
          results = results.filter((e) => {
            const d = new Date(e.date);
            return d >= now && d <= nextWeek;
          });
        } else if (params.dateRange === 'thisMonth') {
          const nextMonth = new Date();
          nextMonth.setDate(now.getDate() + 30);
          results = results.filter((e) => {
            const d = new Date(e.date);
            return d >= now && d <= nextMonth;
          });
        }
      }

      const { calculateDistance } = await import('../utils/distance');
      const ul = params.userLocation;

      if (ul && results.length > 0) {
        results = results
          .map((e) => {
            const coords = e.coordinates;
            const dist = coords && typeof coords?.lat === 'number' && typeof coords?.lng === 'number'
              ? calculateDistance(ul.lat, ul.lng, coords.lat, coords.lng)
              : undefined;
            return { ...e, distance: dist };
          })
          .filter((e) => {
            if (params.distance == null) return true;
            return e.distance != null && e.distance <= params.distance!;
          })
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      }

      return results;
    } catch (error: any) {
      console.error('Error in searchEvents:', error);
      return [];
    }
  },

  // Get events for a specific church (all events — split into upcoming/previous in UI)
  async getEventsForChurch(churchId: string): Promise<ChurchEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('church_id', churchId)
      .order('date', { ascending: true });

    if (error) {
      console.error('[eventService] Error fetching events for church:', {
        churchId,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      
      // If it's an RLS error, provide more helpful message
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
        console.error('[eventService] RLS Policy Error - User may not have permission to view events for this church');
        throw new Error(`Permission denied: Unable to load events. This may be due to Row-Level Security policies. Church ID: ${churchId}`);
      }
      
      throw error;
    }
    
    console.log('[eventService] Raw data from database:', data);
    console.log('[eventService] Number of events found:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('[eventService] Sample event data:', data[0]);
    }
    
    const transformed = (data || []).map((event: any) => transformEvent(event, undefined));
    console.log('[eventService] Transformed events:', transformed);
    return transformed;
  },

  // Get single event by ID
  async getEventById(id: string): Promise<ChurchEvent | null> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        churches (
          name,
          status
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return transformEvent(data, data.churches?.name);
  },

  // Create event
  async createEvent(event: Partial<ChurchEvent>): Promise<ChurchEvent> {
    if (!event.churchId) throw new Error('churchId is required');
    const eventDate = event.date ? new Date(event.date) : null;
    if (eventDate && eventDate.getTime() < Date.now()) {
      throw new Error('Event date and time must be in the future.');
    }

    console.log('[eventService] createEvent called with:', {
      title: event.title,
      churchId: event.churchId,
      type: event.type,
    });

    const eventData = transformEventForDb(event);
    console.log('[eventService] Transformed event data for DB:', eventData);

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select(`
        *,
        churches (
          name
        )
      `)
      .single();

    if (error) {
      console.error('[eventService] Error creating event:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        eventData,
      });
      throw error;
    }
    
    console.log('[eventService] Event created successfully:', data);
    const churchName = getChurchNameFromRow(data);
    const transformed = transformEvent(data, churchName);
    console.log('[eventService] Transformed created event:', transformed);

    return transformed;
  },

  // Update event
  async updateEvent(id: string, updates: Partial<ChurchEvent>): Promise<ChurchEvent> {
    if (updates.date) {
      const d = new Date(updates.date);
      if (d.getTime() < Date.now()) throw new Error('Event date and time must be in the future.');
    }
    const eventData = transformEventForDb(updates);
    delete eventData.church_id; // Don't allow church_id updates

    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select(`
        *,
        churches (
          name
        )
      `)
      .single();

    if (error) throw error;
    return transformEvent(data, data.churches?.name);
  },

  // Delete event
  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /** Mark an event as notified (sets notification_sent_at). Call after sending the member email. */
  async markEventNotificationSent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .update({ notification_sent_at: new Date().toISOString() })
      .eq('id', eventId);

    if (error) throw error;
  },
};

