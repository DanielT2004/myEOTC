
export enum ViewState {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  CHURCH_DETAIL = 'CHURCH_DETAIL',
  EVENTS = 'EVENTS',
  EVENT_DETAIL = 'EVENT_DETAIL',
  REGISTER_CHURCH = 'REGISTER_CHURCH'
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
  location: string;
  description: string;
  imageUrl: string;
  churchName?: string; // Optional for aggregate views
  churchId?: string; // To link back to church
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
  distance?: number; // Calculated at runtime
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface FilterState {
  location: string;
  distance: number;
  services: Record<string, boolean>;
}

export interface EventFilterState {
  location: string;
  types: Record<string, boolean>;
  dateRange: 'upcoming' | 'thisMonth' | 'thisWeek';
}
