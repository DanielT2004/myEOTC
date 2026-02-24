import { describe, it, expect } from 'vitest';
import { Church } from '../types';
import {
  parseTime,
  formatTime,
  churchToFormData,
  formDataToChurch,
  createEmptyFormData,
} from './churchFormUtils';
import type { ChurchFormData } from '../components/ChurchFormFields';

describe('parseTime', () => {
  it('returns empty strings for empty input', () => {
    expect(parseTime('')).toEqual({ startTime: '', endTime: '' });
  });

  it('parses "9:00 AM - 11:00 AM" to 24-hour format', () => {
    expect(parseTime('9:00 AM - 11:00 AM')).toEqual({
      startTime: '09:00',
      endTime: '11:00',
    });
  });

  it('parses PM times correctly', () => {
    expect(parseTime('2:30 PM - 5:45 PM')).toEqual({
      startTime: '14:30',
      endTime: '17:45',
    });
  });

  it('parses 12:00 PM as noon', () => {
    expect(parseTime('12:00 PM - 1:00 PM')).toEqual({
      startTime: '12:00',
      endTime: '13:00',
    });
  });

  it('parses 12:00 AM as midnight', () => {
    expect(parseTime('12:00 AM - 1:00 AM')).toEqual({
      startTime: '00:00',
      endTime: '01:00',
    });
  });

  it('handles single time (no end time)', () => {
    expect(parseTime('9:00 AM')).toEqual({
      startTime: '09:00',
      endTime: '',
    });
  });

  it('is case insensitive for AM/PM', () => {
    expect(parseTime('9:00 am - 11:00 pm')).toEqual({
      startTime: '09:00',
      endTime: '23:00',
    });
  });
});

describe('formatTime', () => {
  it('returns empty string for empty input', () => {
    expect(formatTime('')).toBe('');
  });

  it('formats 24-hour to 12-hour with AM', () => {
    expect(formatTime('09:00')).toBe('9:00 AM');
  });

  it('formats 24-hour to 12-hour with PM', () => {
    expect(formatTime('14:30')).toBe('2:30 PM');
  });

  it('formats noon correctly', () => {
    expect(formatTime('12:00')).toBe('12:00 PM');
  });

  it('formats midnight correctly', () => {
    expect(formatTime('00:00')).toBe('12:00 AM');
  });
});

describe('churchToFormData', () => {
  const minimalChurch: Church = {
    id: 'c1',
    name: 'Test Church',
    address: '123 Main St',
    city: 'Hawthorne',
    state: 'CA',
    zip: '90250',
    phone: '(310) 555-1234',
    description: 'A test church',
    imageUrl: 'https://example.com/img.jpg',
    members: 100,
    clergy: [],
    events: [],
    services: ['Sunday School', 'Bible Study'],
    serviceSchedule: [
      {
        day: 'Sunday',
        time: '9:00 AM - 11:00 AM',
        description: 'Sunday Service',
      },
    ],
    languages: ['Amharic', 'English'],
    features: {
      hasEnglishService: true,
      hasParking: true,
      wheelchairAccessible: false,
      hasSchool: true,
    },
    donationInfo: {},
    isVerified: true,
    coordinates: { lat: 33.9, lng: -118.37 },
  };

  it('maps basic church fields to form data', () => {
    const form = churchToFormData(minimalChurch);
    expect(form.name).toBe('Test Church');
    expect(form.address).toBe('123 Main St');
    expect(form.city).toBe('Hawthorne');
    expect(form.state).toBe('CA');
    expect(form.zip).toBe('90250');
    expect(form.phone).toBe('(310) 555-1234');
    expect(form.description).toBe('A test church');
    expect(form.imageUrl).toBe('https://example.com/img.jpg');
  });

  it('transforms service schedule with parsed times', () => {
    const form = churchToFormData(minimalChurch);
    expect(form.serviceSchedule).toHaveLength(1);
    expect(form.serviceSchedule[0].day).toBe('Sunday');
    expect(form.serviceSchedule[0].startTime).toBe('09:00');
    expect(form.serviceSchedule[0].endTime).toBe('11:00');
    expect(form.serviceSchedule[0].description).toBe('Sunday Service');
  });

  it('maps services array to specialPrograms object', () => {
    const form = churchToFormData(minimalChurch);
    expect(form.specialPrograms['Bible Study']).toBe(true);
    expect(form.specialPrograms['Sunday School']).toBe(true);
    expect(form.specialPrograms['Choir']).toBe(false);
  });

  it('maps languages array to languages object', () => {
    const form = churchToFormData(minimalChurch);
    expect(form.languages['Amharic']).toBe(true);
    expect(form.languages['English']).toBe(true);
    expect(form.languages['Ge\'ez']).toBe(false);
  });

  it('copies features', () => {
    const form = churchToFormData(minimalChurch);
    expect(form.features).toEqual({
      hasEnglishService: true,
      hasParking: true,
      wheelchairAccessible: false,
      hasSchool: true,
    });
  });

  it('uses default schedule when church has no serviceSchedule', () => {
    const churchNoSchedule = { ...minimalChurch, serviceSchedule: [] };
    const form = churchToFormData(churchNoSchedule);
    expect(form.serviceSchedule).toHaveLength(1);
    expect(form.serviceSchedule[0].day).toBe('Sunday');
    expect(form.serviceSchedule[0].startTime).toBe('');
    expect(form.serviceSchedule[0].endTime).toBe('');
  });

  it('infers repeat from description (Every 2 Weeks)', () => {
    const church = {
      ...minimalChurch,
      serviceSchedule: [
        {
          day: 'Saturday',
          time: '5:00 PM - 7:00 PM',
          description: 'Vespers Every 2 Weeks',
        },
      ],
    };
    const form = churchToFormData(church);
    expect(form.serviceSchedule[0].repeat).toBe('Every 2 Weeks');
  });
});

describe('formDataToChurch', () => {
  it('transforms form data back to church-shaped partial', () => {
    const formData: ChurchFormData = {
      name: 'New Church',
      address: '456 Oak Ave',
      city: 'LA',
      state: 'CA',
      zip: '90001',
      phone: '555-0000',
      description: 'Desc',
      imageUrl: '',
      serviceSchedule: [
        {
          day: 'Sunday',
          startTime: '09:00',
          endTime: '11:00',
          description: 'Liturgy',
          repeat: 'Every Week',
        },
      ],
      specialPrograms: { 'Bible Study': true, 'Choir': false },
      languages: { 'English': true, 'Amharic': false },
      features: {
        hasEnglishService: true,
        hasParking: false,
        wheelchairAccessible: true,
        hasSchool: false,
      },
    };
    const church = formDataToChurch(formData);
    expect(church.name).toBe('New Church');
    expect(church.address).toBe('456 Oak Ave');
    expect(church.services).toContain('Bible Study');
    expect(church.services).not.toContain('Choir');
    expect(church.languages).toContain('English');
    expect(church.languages).not.toContain('Amharic');
    expect(church.serviceSchedule).toHaveLength(1);
    expect(church.serviceSchedule![0].time).toMatch(/9:00 AM.*11:00 AM/);
    expect(church.features).toEqual(formData.features);
  });

  it('filters out schedule entries with no day or startTime', () => {
    const formData: ChurchFormData = {
      ...createEmptyFormData(),
      name: 'Church',
      serviceSchedule: [
        { day: 'Sunday', startTime: '09:00', endTime: '11:00', description: '', repeat: 'Every Week' },
        { day: '', startTime: '', endTime: '', description: '', repeat: 'Every Week' },
      ],
    };
    const church = formDataToChurch(formData);
    expect(church.serviceSchedule).toHaveLength(1);
  });

  it('formats time range when only start time provided', () => {
    const formData: ChurchFormData = {
      ...createEmptyFormData(),
      name: 'Church',
      serviceSchedule: [
        { day: 'Sunday', startTime: '14:00', endTime: '', description: 'Afternoon', repeat: 'Every Week' },
      ],
    };
    const church = formDataToChurch(formData);
    expect(church.serviceSchedule![0].time).toBe('2:00 PM');
  });
});

describe('createEmptyFormData', () => {
  it('returns form data with empty strings and defaults', () => {
    const empty = createEmptyFormData();
    expect(empty.name).toBe('');
    expect(empty.address).toBe('');
    expect(empty.city).toBe('');
    expect(empty.state).toBe('');
    expect(empty.zip).toBe('');
    expect(empty.phone).toBe('');
    expect(empty.description).toBe('');
    expect(empty.imageUrl).toBe('');
    expect(empty.specialPrograms).toEqual({});
    expect(empty.languages).toEqual({});
    expect(empty.features).toEqual({
      hasEnglishService: false,
      hasParking: false,
      wheelchairAccessible: false,
      hasSchool: false,
    });
  });

  it('returns one default service schedule row', () => {
    const empty = createEmptyFormData();
    expect(empty.serviceSchedule).toHaveLength(1);
    expect(empty.serviceSchedule[0].day).toBe('Sunday');
    expect(empty.serviceSchedule[0].startTime).toBe('');
    expect(empty.serviceSchedule[0].endTime).toBe('');
    expect(empty.serviceSchedule[0].repeat).toBe('Every Week');
  });
});

describe('round-trip church -> form -> church', () => {
  it('preserves core data when converting church to form and back', () => {
    const church: Church = {
      id: 'c1',
      name: 'Round Trip Church',
      address: '100 Test St',
      city: 'City',
      state: 'CA',
      zip: '90250',
      phone: '555-1234',
      description: 'Desc',
      imageUrl: '',
      members: 0,
      clergy: [],
      events: [],
      services: ['Bible Study', 'Sunday School'],
      serviceSchedule: [
        { day: 'Sunday', time: '9:00 AM - 11:00 AM', description: 'Main Service' },
      ],
      languages: ['Amharic', 'English'],
      features: {
        hasEnglishService: true,
        hasParking: true,
        wheelchairAccessible: true,
        hasSchool: false,
      },
      donationInfo: {},
      isVerified: false,
      coordinates: { lat: 0, lng: 0 },
    };
    const form = churchToFormData(church);
    const back = formDataToChurch(form);
    expect(back.name).toBe(church.name);
    expect(back.address).toBe(church.address);
    expect(back.services?.sort()).toEqual(church.services.slice().sort());
    expect(back.languages?.sort()).toEqual(church.languages.slice().sort());
    expect(back.features).toEqual(church.features);
    expect(back.serviceSchedule).toHaveLength(1);
    expect(back.serviceSchedule![0].day).toBe('Sunday');
    expect(back.serviceSchedule![0].time).toMatch(/9:00 AM.*11:00 AM/);
  });
});
