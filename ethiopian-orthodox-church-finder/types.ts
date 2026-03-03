
export enum ViewState {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  CHURCH_DETAIL = 'CHURCH_DETAIL',
  EVENTS = 'EVENTS',
  EVENT_DETAIL = 'EVENT_DETAIL',
  REGISTER_CHURCH = 'REGISTER_CHURCH',
  NO_CHURCH_PROMPT = 'NO_CHURCH_PROMPT',
  LOGIN = 'LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  CHURCH_ADMIN_DASHBOARD = 'CHURCH_ADMIN_DASHBOARD'
}

export type UserRole = 'user' | 'church_admin' | 'super_admin';
export type ChurchStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface ClergyMember {
  id: string;
  name: string;
  role: string; // e.g., "Head Priest", "Deacon"
  imageUrl: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  type: string; // e.g., "Holiday", "Bible Study", "Service"
  date: string; // ISO date string
  /** Full display string: address, city, state zip (or legacy location) */
  location: string;
  /** Structured address fields for search; when present, location is derived from these */
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  coordinates?: { lat: number; lng: number };
  description: string;
  imageUrl: string;
  churchName?: string; // Optional for aggregate views
  churchId?: string; // To link back to church
  /** When the notification email was sent for this event; undefined/null if not sent yet. Used to gray out "Notify members". */
  notificationSentAt?: string | null;
  /** Distance in miles from user (computed at runtime for search results) */
  distance?: number;
}

export interface ServiceTime {
  day: string;
  time: string;
  description: string;
}

export interface Church {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  description: string;
  imageUrl: string;
  interiorImageUrl?: string; // For detail view
  members: number;
  clergy: ClergyMember[];
  events: ChurchEvent[];
  services: string[]; // e.g., ["Sunday Service", "Bible Study"] - keeping for legacy/filtering compatibility
  serviceSchedule: ServiceTime[]; // Detailed schedule
  languages: string[]; // e.g. ["Amharic", "English", "Ge'ez"]
  features: {
    hasEnglishService: boolean;
    hasParking: boolean;
    wheelchairAccessible: boolean;
    hasSchool: boolean; // Sunday school or cultural school
  };
  donationInfo: {
    zelle?: string;
    website?: string;
  };
  isVerified: boolean;
  status?: ChurchStatus; // Database field
  adminId?: string; // Database field
  verificationDocumentUrl?: string; // Database field
  distance?: number; // Calculated at runtime
  coordinates: {
    lat: number;
    lng: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface FilterState {
  churchName: string;
  location: string;
  distance: number;
  services: Record<string, boolean>;
}

export interface EventFilterState {
  query: string; // search by event title or church name
  location: string; // city, state, or zip for search
  types: Record<string, boolean>;
  dateRange: 'upcoming' | 'thisMonth' | 'thisWeek';
  distance?: number; // miles (when user location available)
}
