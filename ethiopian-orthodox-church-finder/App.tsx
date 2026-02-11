import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChurchDetail } from './components/ChurchDetail';
import { EventDetail } from './components/EventDetail';
import { RegisterChurch } from './components/RegisterChurch';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { AiAssistant } from './components/AiAssistant';
import { AdminDashboard } from './pages/AdminDashboard';
import { ChurchAdminDashboard } from './pages/ChurchAdminDashboard';
import { ViewState, Church, FilterState, ChurchEvent, EventFilterState, UserProfile } from './types';
import { churchService } from './services/churchService';
import { eventService } from './services/eventService';
import { authService } from './services/authService';
import { followService } from './services/followService';

// Pages
import { Home } from './pages/Home';
import { ChurchSearch } from './pages/ChurchSearch';
import { EventsPage } from './pages/EventsPage';

const App: React.FC = () => {
  console.log('App component rendering...');
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Selection State
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [followedChurches, setFollowedChurches] = useState<Set<string>>(new Set());
  const [isAdminOfSelectedChurch, setIsAdminOfSelectedChurch] = useState(false);
  const [showEventFormOnAdminDashboard, setShowEventFormOnAdminDashboard] = useState(false);
  
  // Data State
  const [churches, setChurches] = useState<Church[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loadingChurches, setLoadingChurches] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
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

  // Load user profile
  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await authService.getCurrentProfile();
        setUser(profile);
      } catch (error) {
        console.warn('Could not load user profile, continuing without auth:', error);
        setUser(null);
      } finally {
        // Always set loading to false, even if there's an error
        setLoadingUser(false);
      }
    };

    // Set a fallback timeout to ensure loading doesn't hang forever
    const timeout = setTimeout(() => {
      if (loadingUser) {
        console.warn('User loading timed out, showing app anyway');
        setLoadingUser(false);
      }
    }, 3000);

    loadUser();

    return () => clearTimeout(timeout);

    // Listen for auth changes
    try {
      const { data: { subscription } } = authService.onAuthStateChange(async (authUser) => {
        if (authUser) {
          try {
            const profile = await authService.getCurrentProfile();
            setUser(profile);
          } catch (error) {
            setUser(null);
          }
        } else {
          setUser(null);
          setFollowedChurches(new Set());
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      // If Supabase isn't configured, just continue without auth listener
      console.warn('Could not set up auth state listener:', error);
      return () => {};
    }
  }, []);

  // Load followed churches for logged in user
  useEffect(() => {
    const loadFollowedChurches = async () => {
      if (user) {
        try {
          const followed = await followService.getFollowedChurches(user.id);
          setFollowedChurches(new Set(followed));
        } catch (error) {
          console.error('Error loading followed churches:', error);
        }
      }
    };

    loadFollowedChurches();
  }, [user]);

  // Load churches from Supabase
  useEffect(() => {
    const loadChurches = async () => {
      setLoadingChurches(true);
      try {
        const data = await churchService.getApprovedChurches();
        setChurches(data);
      } catch (error) {
        console.error('Error loading churches:', error);
      } finally {
        setLoadingChurches(false);
      }
    };

    loadChurches();
  }, []);

  // Load events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      try {
        const data = await eventService.getAllEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

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

  const handleViewDetails = async (church: Church) => {
    // Load events for this church
    try {
      const churchEvents = await eventService.getEventsForChurch(church.id);
      // Update church object with events
      const churchWithEvents = { ...church, events: churchEvents };
      setSelectedChurch(churchWithEvents);
    } catch (error) {
      console.error('Error loading events for church:', error);
      // Still show the church even if events fail to load
      setSelectedChurch(church);
    }
    
    // Check if current user is an admin of this church
    if (user) {
      try {
        const isAdmin = await churchService.isUserAdminOfChurch(user.id, church.id);
        setIsAdminOfSelectedChurch(isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdminOfSelectedChurch(false);
      }
    } else {
      setIsAdminOfSelectedChurch(false);
    }
    
    setCurrentView(ViewState.CHURCH_DETAIL);
    window.scrollTo(0, 0);
  };

  const handleViewEventDetails = (event: ChurchEvent) => {
    setSelectedEvent(event);
    setCurrentView(ViewState.EVENT_DETAIL);
    window.scrollTo(0, 0);
  };

  const handleViewChurchFromEvent = async (churchId: string) => {
    try {
      const church = await churchService.getChurchById(churchId);
      if (church) {
        // handleViewDetails will load events automatically
        await handleViewDetails(church);
      }
    } catch (error) {
      console.error('Error loading church:', error);
    }
  };

  const handleEditChurch = () => {
    if (selectedChurch) {
      setShowEventFormOnAdminDashboard(false);
      setCurrentView(ViewState.CHURCH_ADMIN_DASHBOARD);
      window.scrollTo(0, 0);
    }
  };

  const handleAddEvent = () => {
    if (selectedChurch) {
      setShowEventFormOnAdminDashboard(true);
      setCurrentView(ViewState.CHURCH_ADMIN_DASHBOARD);
      window.scrollTo(0, 0);
    }
  };

  const handleToggleFollow = async (id: string) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      const isFollowing = followedChurches.has(id);
      if (isFollowing) {
        await followService.unfollowChurch(user.id, id);
        setFollowedChurches(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        await followService.followChurch(user.id, id);
        setFollowedChurches(prev => new Set(prev).add(id));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleAuthSuccess = async () => {
    try {
      const profile = await authService.getCurrentProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Process churches with distance if user location is available
  const processedChurches = churches.map(church => {
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
  const filteredEvents = events.filter(event => {
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

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-2">Loading...</div>
          <div className="text-gray-400 text-sm">Setting up your church finder</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 flex flex-col">
      <Navbar 
        currentView={currentView} 
        onNavigate={handleNavigate}
        user={user}
        onUserChange={handleAuthSuccess}
        onShowLogin={() => setShowLogin(true)}
      />
      
      <div className="flex-grow flex flex-col w-full">
        {currentView === ViewState.HOME && (
          <Home 
            onNavigate={handleNavigate}
            onSearch={handleSearch}
            onViewDetails={handleViewDetails}
            onViewEventDetails={handleViewEventDetails}
            onToggleFollow={handleToggleFollow}
            followedChurches={followedChurches}
            churches={loadingChurches ? [] : filteredChurches.slice(0, 6)}
            events={loadingEvents ? [] : filteredEvents.slice(0, 6)}
          />
        )}

        {currentView === ViewState.SEARCH && (
          <ChurchSearch 
            filters={filters}
            setFilters={setFilters}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            churches={loadingChurches ? [] : filteredChurches}
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
            onViewEventDetails={handleViewEventDetails}
            isAdmin={isAdminOfSelectedChurch}
            onEditChurch={isAdminOfSelectedChurch ? handleEditChurch : undefined}
            onAddEvent={isAdminOfSelectedChurch ? handleAddEvent : undefined}
          />
        )}

        {currentView === ViewState.EVENTS && (
          <EventsPage 
            filters={eventFilters}
            setFilters={setEventFilters}
            events={loadingEvents ? [] : filteredEvents}
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
          <RegisterChurch 
            onCancel={() => handleNavigate(ViewState.HOME)}
            onSuccess={handleAuthSuccess}
          />
        )}

        {currentView === ViewState.ADMIN_DASHBOARD && user?.role === 'super_admin' && (
          <AdminDashboard onBack={() => handleNavigate(ViewState.HOME)} />
        )}

        {currentView === ViewState.CHURCH_ADMIN_DASHBOARD && (user?.role === 'church_admin' || user?.role === 'super_admin') && (
          <ChurchAdminDashboard 
            onBack={() => {
              setShowEventFormOnAdminDashboard(false);
              handleNavigate(ViewState.HOME);
            }}
            onViewProfile={handleViewDetails}
            onChurchUpdated={(updatedChurch) => {
              // Update the main churches state when a church is edited
              setChurches(prevChurches => 
                prevChurches.map(c => c.id === updatedChurch.id ? updatedChurch : c)
              );
              // Update selectedChurch if it's the one being edited
              if (selectedChurch && selectedChurch.id === updatedChurch.id) {
                setSelectedChurch(updatedChurch);
              }
            }}
            initialChurchId={selectedChurch?.id}
            initialShowEventForm={showEventFormOnAdminDashboard}
          />
        )}
      </div>

      <AiAssistant />

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {showSignUp && (
        <SignUp
          onClose={() => setShowSignUp(false)}
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowLogin(true);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}

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
