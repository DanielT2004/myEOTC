import { Church, ServiceTime } from '../types';
import { ServiceScheduleItem, ChurchFormData } from '../components/ChurchFormFields';
import { SPECIAL_PROGRAMS, LANGUAGES } from '../constants';

/**
 * Parse time from readable format (e.g., "9:00 AM - 11:00 AM") to 24-hour format
 */
export const parseTime = (timeStr: string): { startTime: string; endTime: string } => {
  if (!timeStr) return { startTime: '', endTime: '' };
  
  // Handle format like "9:00 AM - 11:00 AM" or just "9:00 AM"
  const parts = timeStr.split(' - ');
  const startStr = parts[0].trim();
  const endStr = parts[1]?.trim() || '';
  
  const parseTimeTo24 = (time: string): string => {
    if (!time) return '';
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '';
    
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };
  
  return {
    startTime: parseTimeTo24(startStr),
    endTime: parseTimeTo24(endStr),
  };
};

/**
 * Format time from 24-hour format to readable format (e.g., "9:00 AM")
 */
export const formatTime = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Transform Church data to ChurchFormData for editing
 */
export const churchToFormData = (church: Church): ChurchFormData => {
  // Transform service schedule from ServiceTime[] to ServiceScheduleItem[]
  const transformedSchedule: ServiceScheduleItem[] = church.serviceSchedule?.length > 0
    ? church.serviceSchedule.map(st => {
        const parsed = parseTime(st.time);
        // Extract repeat info from description if present
        let repeat = 'Every Week';
        if (st.description?.includes('Every 2 Weeks')) repeat = 'Every 2 Weeks';
        else if (st.description?.includes('Monthly')) repeat = 'Monthly';
        else if (st.description?.includes('First of Month')) repeat = 'First of Month';
        else if (st.description?.includes('Last of Month')) repeat = 'Last of Month';
        else if (st.description?.includes('Daily')) repeat = 'Daily';
        
        return {
          day: st.day,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          description: st.description || '',
          repeat,
        };
      })
    : [{ day: 'Sunday', startTime: '', endTime: '', description: '', repeat: 'Every Week' }];
  
  // Transform services array to specialPrograms object
  const programsObj: Record<string, boolean> = {};
  SPECIAL_PROGRAMS.forEach(program => {
    programsObj[program] = church.services?.includes(program) || false;
  });
  
  // Transform languages array to languages object
  const langsObj: Record<string, boolean> = {};
  LANGUAGES.forEach(lang => {
    langsObj[lang] = church.languages?.includes(lang) || false;
  });
  
  return {
    name: church.name || '',
    address: church.address || '',
    city: church.city || '',
    state: church.state || '',
    zip: church.zip || '',
    phone: church.phone || '',
    description: church.description || '',
    imageUrl: church.imageUrl || '',
    serviceSchedule: transformedSchedule,
    specialPrograms: programsObj,
    languages: langsObj,
    features: church.features || {
      hasEnglishService: false,
      hasParking: false,
      wheelchairAccessible: false,
      hasSchool: false,
    },
  };
};

/**
 * Transform ChurchFormData to Church data for saving
 */
export const formDataToChurch = (formData: ChurchFormData): Partial<Church> => {
  // Transform service schedule
  const transformedSchedule: ServiceTime[] = formData.serviceSchedule
    .filter(s => s.day && s.startTime)
    .map(s => {
      const startFormatted = formatTime(s.startTime);
      const endFormatted = s.endTime ? formatTime(s.endTime) : '';
      const timeStr = endFormatted ? `${startFormatted} - ${endFormatted}` : startFormatted;
      return {
        day: s.day,
        time: timeStr,
        description: s.description || `${s.day} Service${s.repeat !== 'Every Week' ? ` (${s.repeat})` : ''}`,
      };
    });

  // Transform special programs to services array
  const servicesList = Object.keys(formData.specialPrograms).filter(k => formData.specialPrograms[k]);
  
  // Transform languages
  const languagesList = Object.keys(formData.languages).filter(k => formData.languages[k]);

  return {
    name: formData.name,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zip: formData.zip,
    phone: formData.phone,
    description: formData.description,
    imageUrl: formData.imageUrl,
    services: servicesList,
    serviceSchedule: transformedSchedule,
    languages: languagesList,
    features: formData.features,
  };
};

/**
 * Create initial empty form data
 */
export const createEmptyFormData = (): ChurchFormData => {
  return {
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    description: '',
    imageUrl: '',
    serviceSchedule: [{ day: 'Sunday', startTime: '', endTime: '', description: '', repeat: 'Every Week' }],
    specialPrograms: {},
    languages: {},
    features: {
      hasEnglishService: false,
      hasParking: false,
      wheelchairAccessible: false,
      hasSchool: false,
    },
  };
};
