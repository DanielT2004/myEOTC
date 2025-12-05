
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChurchDetail } from './components/ChurchDetail';
import { EventDetail } from './components/EventDetail';
import { RegisterChurch } from './components/RegisterChurch';
import { AiAssistant } from './components/AiAssistant';
import { ViewState, Church, FilterState, ChurchEvent, EventFilterState } from './types';
import { MOCK_CHURCHES, MOCK_EVENTS } from './constants';

// Pages
import { Home } from './pages/Home';
import { ChurchSearch } from './pages/ChurchSearch';
import { EventsPage } from './pages/EventsPage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  
  // Selection State
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [followedChurches, setFollowedChurches] = useState<Set<string>>(new Set());
  
  // Geolocation State
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    distance: 25,
    services: {}
  });
  
  // Event Filter State
  const [eventFilters, setEventFilters] = useState<EventFilterState>({
    location: '',
    types: {},
    dateRange: 'upcoming'
  });

  // Calculate distance between two coords
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius of the earth in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get User Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User location retrieved:", position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Geolocation denied or error:", error);
          // Fallback to default (LA Center) logic is implicit as userLocation stays null
        }
      );
    }
  }, []);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (view !== ViewState.CHURCH_DETAIL) setSelectedChurch(null);
    if (view !== ViewState.EVENT_DETAIL) setSelectedEvent(null);
    window.scrollTo(0, 0);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleNavigate(ViewState.SEARCH);
  };

  const handleViewDetails = (church: Church) => {
    setSelectedChurch(church);
    setCurrentView(ViewState.CHURCH_DETAIL);
    window.scrollTo(0, 0);
  };

  const handleViewEventDetails = (event: ChurchEvent) => {
    setSelectedEvent(event);
    setCurrentView(ViewState.EVENT_DETAIL);
    window.scrollTo(0, 0);
  };

  const handleViewChurchFromEvent = (churchId: string) => {
    const church = MOCK_CHURCHES.find(c => c.id === churchId);
    if (church) {
      handleViewDetails(church);
    }
  };

  const handleToggleFollow = (id: string) => {
    const newFollowed = new Set(followedChurches);
    if (newFollowed.has(id)) {
      newFollowed.delete(id);
    } else {
      newFollowed.add(id);
    }
    setFollowedChurches(newFollowed);
  };

  // Process churches with distance if user location is available
  const processedChurches = MOCK_CHURCHES.map(church => {
      if (userLocation) {
          const dist = calculateDistance(
              userLocation.lat, userLocation.lng,
              church.coordinates.lat, church.coordinates.lng
          );
          return { ...church, distance: dist };
      }
      return church;
  });

  // Sort churches: If location exists, sort by distance. Otherwise, default order.
  const sortedChurches = [...processedChurches].sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
      }
      return 0; 
  });

  // Church Filter Logic
  const filteredChurches = sortedChurches.filter(church => {
    const matchesQuery = searchQuery === '' || 
      church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      church.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      church.zip.includes(searchQuery);

    const matchesLocation = filters.location === '' || 
       church.city.toLowerCase().includes(filters.location.toLowerCase()) ||
       church.zip.includes(filters.location);
    
    // Distance filter
    const matchesDistance = !userLocation || !church.distance || church.distance <= filters.distance;

    const activeServices = Object.keys(filters.services).filter(k => filters.services[k]);
    const matchesServices = activeServices.length === 0 || 
      activeServices.some(s => church.services.includes(s));

    return matchesQuery && matchesLocation && matchesServices && matchesDistance;
  });

  // Event Filter Logic
  const filteredEvents = MOCK_EVENTS.filter(event => {
    const matchesLocation = eventFilters.location === '' || 
      event.location.toLowerCase().includes(eventFilters.location.toLowerCase());

    const activeTypes = Object.keys(eventFilters.types).filter(k => eventFilters.types[k]);
    const matchesType = activeTypes.length === 0 || activeTypes.includes(event.type);
    
    // Simple date logic
    const eventDate = new Date(event.date);
    const now = new Date();
    let matchesDate = true;
    if (eventFilters.dateRange === 'thisWeek') {
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        matchesDate = eventDate >= now && eventDate <= nextWeek;
    } else if (eventFilters.dateRange === 'thisMonth') {
        const nextMonth = new Date();
        nextMonth.setDate(now.getDate() + 30);
        matchesDate = eventDate >= now && eventDate <= nextMonth;
    }

    return matchesLocation && matchesType && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 flex flex-col">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      
      <div className="flex-grow flex flex-col w-full">
        {currentView === ViewState.HOME && (
          <Home 
            onNavigate={handleNavigate}
            onSearch={handleSearch}
            onViewDetails={handleViewDetails}
            onViewEventDetails={handleViewEventDetails}
            onToggleFollow={handleToggleFollow}
            followedChurches={followedChurches}
          />
        )}

        {currentView === ViewState.SEARCH && (
          <ChurchSearch 
            filters={filters}
            setFilters={setFilters}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            churches={filteredChurches}
            onViewDetails={handleViewDetails}
            onToggleFollow={handleToggleFollow}
            followedChurches={followedChurches}
          />
        )}

        {currentView === ViewState.CHURCH_DETAIL && selectedChurch && (
          <ChurchDetail 
            church={selectedChurch} 
            onBack={() => handleNavigate(ViewState.SEARCH)} 
            onToggleFollow={handleToggleFollow}
            isFollowing={followedChurches.has(selectedChurch.id)}
          />
        )}

        {currentView === ViewState.EVENTS && (
           <EventsPage 
              filters={eventFilters}
              setFilters={setEventFilters}
              events={filteredEvents}
              onViewEventDetails={handleViewEventDetails}
           />
        )}

        {currentView === ViewState.EVENT_DETAIL && selectedEvent && (
          <EventDetail 
              event={selectedEvent}
              onBack={() => handleNavigate(ViewState.EVENTS)}
              onViewChurch={handleViewChurchFromEvent}
          />
        )}

        {currentView === ViewState.REGISTER_CHURCH && (
          <RegisterChurch onCancel={() => handleNavigate(ViewState.HOME)} />
        )}
      </div>

      <AiAssistant />

      <footer className="bg-white border-t border-gray-200 mt-auto w-full">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
                <p className="text-gray-500 text-sm">
                    &copy; 2024 Ethiopian Orthodox Church Finder. All rights reserved.
                </p>
                <div className="flex space-x-6">
                    <a href="#" className="text-gray-400 hover:text-gray-500">Privacy Policy</a>
                    <a href="#" className="text-gray-400 hover:text-gray-500">Terms of Service</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
