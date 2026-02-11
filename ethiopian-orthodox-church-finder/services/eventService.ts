import { supabase } from '../lib/supabase';
import { ChurchEvent } from '../types';

// Transform database event to app event format
const transformEvent = (dbEvent: any, churchName?: string): ChurchEvent => {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    type: dbEvent.type,
    date: dbEvent.date,
    location: dbEvent.location,
    description: dbEvent.description,
    imageUrl: dbEvent.image_url || '',
    churchId: dbEvent.church_id,
    churchName: churchName || dbEvent.church_name,
    // Add created_at and updated_at if needed
  };
};

// Transform app event to database format
const transformEventForDb = (event: Partial<ChurchEvent>): any => {
  return {
    title: event.title,
    type: event.type,
    date: event.date,
    location: event.location,
    description: event.description,
    image_url: event.imageUrl,
    church_id: event.churchId,
  };
};

export const eventService = {
  // Get all events for approved churches (public)
  async getAllEvents(): Promise<ChurchEvent[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          churches!inner (
            name,
            status
          )
        `)
        .eq('churches.status', 'approved')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        // Return empty array if Supabase isn't configured
        if (error.message?.includes('Invalid API key') || error.message?.includes('JWT')) {
          return [];
        }
        throw error;
      }
      return (data || []).map((item: any) => 
        transformEvent(item, item.churches?.name)
      );
    } catch (error: any) {
      console.error('Error in getAllEvents:', error);
      // Return empty array on any error to prevent app crash
      return [];
    }
  },

  // Get events for a specific church
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
    const transformed = transformEvent(data, data.churches?.name);
    console.log('[eventService] Transformed created event:', transformed);
    return transformed;
  },

  // Update event
  async updateEvent(id: string, updates: Partial<ChurchEvent>): Promise<ChurchEvent> {
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
};

