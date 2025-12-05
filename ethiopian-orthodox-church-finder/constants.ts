
import { Church, ChurchEvent } from './types';

export const SERVICE_OPTIONS = [
  "Sunday Service",
  "Bible Study",
  "Youth Programs",
  "Community Events",
  "Baptism Services",
  "Wedding Ceremonies"
];

export const EVENT_TYPES = [
  "Holiday",
  "Bible Study",
  "Community",
  "Worship",
  "Fundraiser"
];

// Mock Events corresponding to LA Churches
export const MOCK_EVENTS: ChurchEvent[] = [
  {
    id: 'e1',
    title: 'Meskel Celebration',
    type: 'Holiday',
    date: '2024-09-27T17:00:00',
    location: '5355 W 135th St, Hawthorne, CA',
    description: 'Join us for the lighting of the Demera bonfire to commemorate the Finding of the True Cross. Procession starts at 5 PM followed by prayer and hymns.',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    churchName: 'St. Mary EOTC',
    churchId: 'c1'
  },
  {
    id: 'e2',
    title: 'Youth Gospel Night',
    type: 'Bible Study',
    date: '2024-05-15T19:00:00',
    location: '310 N Reno St, Los Angeles, CA',
    description: 'A night of worship, teachings, and fellowship dedicated to the youth. The program will be conducted primarily in English.',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    churchName: 'Tekle Haimanot EOTC',
    churchId: 'c2'
  },
  {
    id: 'e3',
    title: 'Annual Parish Picnic',
    type: 'Community',
    date: '2024-06-10T11:00:00',
    location: 'Kenneth Hahn Park, Los Angeles, CA',
    description: 'Bring your family and friends for a day of games, food, and community bonding. Hosted by Virgin Mary Church.',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    churchName: 'Virgin Mary EOTC',
    churchId: 'c3'
  },
  {
    id: 'e4',
    title: 'Midnight Praise (Kidan)',
    type: 'Worship',
    date: '2024-04-20T04:00:00',
    location: '3822 W 139th St, Hawthorne, CA',
    description: 'Early morning praise and worship service before the Divine Liturgy.',
    imageUrl: 'https://picsum.photos/800/600?random=4',
    churchName: 'Debre Haile St. Gabriel',
    churchId: 'c4'
  },
  {
    id: 'e5',
    title: 'Charity Fundraiser Dinner',
    type: 'Fundraiser',
    date: '2024-08-12T18:00:00',
    location: '4544 S Compton Ave, Los Angeles, CA',
    description: 'Supporting our back-to-school drive for local students. Traditional dinner and cultural music included.',
    imageUrl: 'https://picsum.photos/800/600?random=5',
    churchName: 'Virgin Mary EOTC',
    churchId: 'c3'
  }
];

export const MOCK_CHURCHES: Church[] = [
  {
    id: 'c1',
    name: 'St. Mary Ethiopian Orthodox Tewahedo Church',
    address: '5355 W 135th St',
    city: 'Hawthorne',
    state: 'CA',
    zip: '90250',
    phone: '(310) 675-0632',
    description: 'St. Mary EOTC in Hawthorne is a vibrant spiritual home for the Ethiopian community in Los Angeles. We are dedicated to preserving the ancient liturgical traditions of our faith while fostering a welcoming environment for all generations. Our large compound hosts major holiday celebrations and weekly community gatherings.',
    imageUrl: 'https://picsum.photos/800/500?random=10',
    interiorImageUrl: 'https://picsum.photos/800/500?random=11',
    members: 2000,
    isVerified: true,
    services: ["Sunday Service", "Bible Study", "Youth Programs", "Baptism Services"],
    serviceSchedule: [
      { day: "Sunday", time: "4:00 AM - 11:00 AM", description: "Divine Liturgy (Kidase)" },
      { day: "Saturday", time: "5:00 PM - 7:00 PM", description: "Vespers (Mahelet) & Bible Study" },
      { day: "Friday", time: "6:00 PM - 8:00 PM", description: "Youth Program (English & Amharic)" }
    ],
    languages: ["Amharic", "English", "Ge'ez"],
    features: {
      hasEnglishService: true,
      hasParking: true,
      wheelchairAccessible: true,
      hasSchool: true
    },
    donationInfo: {
      zelle: "donate@stmaryla.org",
      website: "http://www.stmaryla.org"
    },
    clergy: [
      { id: 'cl1', name: 'Melake Gennet Abba', role: 'Head Priest', imageUrl: 'https://picsum.photos/200/200?random=20' },
      { id: 'cl2', name: 'Deacon Solomon', role: 'Youth Coordinator', imageUrl: 'https://picsum.photos/200/200?random=21' }
    ],
    events: [MOCK_EVENTS[0]],
    coordinates: { lat: 33.9088, lng: -118.3712 }
  },
  {
    id: 'c2',
    name: 'Tekle Haimanot Ethiopian Orthodox Tewahedo Church',
    address: '310 N Reno St',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90026',
    phone: '(213) 385-0567',
    description: 'Located in the heart of Los Angeles, Tekle Haimanot Church stands as a beacon of faith. We offer regular spiritual guidance, baptism, and marriage services. Our parish is known for its strong emphasis on teaching the history and dogma of the church to the youth.',
    imageUrl: 'https://picsum.photos/800/500?random=12',
    members: 800,
    isVerified: true,
    services: ["Sunday Service", "Bible Study", "Wedding Ceremonies"],
    serviceSchedule: [
        { day: "Sunday", time: "5:00 AM - 10:30 AM", description: "Divine Liturgy" },
        { day: "Wednesday", time: "6:00 PM - 8:00 PM", description: "Weekly Prayer & Teaching" }
    ],
    languages: ["Amharic", "Ge'ez"],
    features: {
      hasEnglishService: false,
      hasParking: false,
      wheelchairAccessible: true,
      hasSchool: false
    },
    donationInfo: {
      zelle: "giving@teklehaimanotla.org"
    },
    clergy: [
      { id: 'cl3', name: 'Abba Fikre', role: 'Priest', imageUrl: 'https://picsum.photos/200/200?random=22' }
    ],
    events: [MOCK_EVENTS[1]],
    coordinates: { lat: 34.0728, lng: -118.2754 }
  },
  {
    id: 'c3',
    name: 'Virgin Mary Ethiopian Orthodox Tewahedo Church',
    address: '4544 S Compton Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90011',
    phone: '(323) 231-1555',
    description: 'Virgin Mary EOTC is a warm and close-knit community. We pride ourselves on our hospitality and the preservation of our cultural and religious heritage. We actively engage in local charity work and community support.',
    imageUrl: 'https://picsum.photos/800/500?random=13',
    members: 1200,
    isVerified: true,
    services: ["Sunday Service", "Community Events", "Youth Programs"],
    serviceSchedule: [
        { day: "Sunday", time: "5:00 AM - 11:00 AM", description: "Divine Liturgy" },
        { day: "Saturday", time: "9:00 AM - 12:00 PM", description: "Amharic School" }
    ],
    languages: ["Amharic", "English", "Ge'ez"],
    features: {
      hasEnglishService: true,
      hasParking: true,
      wheelchairAccessible: true,
      hasSchool: true
    },
    donationInfo: {
      zelle: "donate@virginmaryla.com"
    },
    clergy: [],
    events: [MOCK_EVENTS[2], MOCK_EVENTS[4]],
    coordinates: { lat: 34.0022, lng: -118.2483 }
  },
  {
    id: 'c4',
    name: 'Debre Haile St. Gabriel Ethiopian Orthodox Church',
    address: '3822 W 139th St',
    city: 'Hawthorne',
    state: 'CA',
    zip: '90250',
    phone: '(310) 978-8311',
    description: 'Dedicated to St. Gabriel, our parish is a sanctuary of peace and prayer. We offer counseling services and have a very active "Sebeka Gubae". Our choir is renowned for their uplifting spiritual songs.',
    imageUrl: 'https://picsum.photos/800/500?random=14',
    members: 950,
    isVerified: true,
    services: ["Sunday Service", "Bible Study", "Baptism Services"],
    serviceSchedule: [
        { day: "Sunday", time: "4:30 AM - 11:00 AM", description: "Divine Liturgy" },
        { day: "Daily", time: "6:00 PM - 7:00 PM", description: "Evening Prayer" }
    ],
    languages: ["Amharic", "Ge'ez"],
    features: {
      hasEnglishService: false,
      hasParking: true,
      wheelchairAccessible: true,
      hasSchool: true
    },
    donationInfo: {
      zelle: "stgabrielhawthorne@gmail.com"
    },
    clergy: [
       { id: 'cl4', name: 'Abba Yohannes', role: 'Head Priest', imageUrl: 'https://picsum.photos/200/200?random=23' }
    ],
    events: [MOCK_EVENTS[3]],
    coordinates: { lat: 33.9061, lng: -118.3406 }
  },
  {
    id: 'c5',
    name: 'Debre Mihret St. Michael EOTC',
    address: '3959 W Slauson Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90043',
    phone: '(323) 294-0012',
    description: 'St. Michael Church serves the View Park-Windsor Hills area. We are currently fundraising for a new building project. Join us for our monthly St. Michael commemoration.',
    imageUrl: 'https://picsum.photos/800/500?random=15',
    members: 600,
    isVerified: false,
    services: ["Sunday Service", "Community Events"],
    serviceSchedule: [
        { day: "Sunday", time: "6:00 AM - 10:00 AM", description: "Divine Liturgy" }
    ],
    languages: ["Amharic", "English"],
    features: {
      hasEnglishService: true,
      hasParking: true,
      wheelchairAccessible: false,
      hasSchool: false
    },
    donationInfo: {
      zelle: "stmichaella@donate.com",
      website: "https://stmichaella.org"
    },
    clergy: [],
    events: [],
    coordinates: { lat: 33.9892, lng: -118.3421 }
  }
];
