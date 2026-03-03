import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ChurchDetail } from './components/ChurchDetail';
import { EventDetail } from './components/EventDetail';
import { RegisterChurch } from './components/RegisterChurch';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { AdminDashboard } from './pages/AdminDashboard';
import { ChurchAdminDashboard } from './pages/ChurchAdminDashboard';
import { ViewState, Church, FilterState, ChurchEvent, EventFilterState, UserProfile } from './types';
import { churchService } from './services/churchService';
import { eventService } from './services/eventService';
import { calculateDistance } from './utils/distance';
import { filterChurches, filterEvents } from './utils/searchFilters';
import { canViewChurchDetail } from './utils/churchVisibility';
import { authService } from './services/authService';
import { getViewFromPathname, getPathForView } from './utils/routes';

// Pages
import { Home } from './pages/Home';
import { ChurchSearch } from './pages/ChurchSearch';
import { EventsPage } from './pages/EventsPage';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeParams = getViewFromPathname(location.pathname);
  const currentView = routeParams.view;

  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Selection State
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [isAdminOfSelectedChurch, setIsAdminOfSelectedChurch] = useState(false);
  const [isAdminOfEventChurch, setIsAdminOfEventChurch] = useState(false);

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
    churchName: '',
    location: '',
    distance: 25,
    services: {}
  });
  const [searchResults, setSearchResults] = useState<Church[] | null>(null);
  const [searchingChurches, setSearchingChurches] = useState(false);
  
  // Event Filter State
  const [eventFilters, setEventFilters] = useState<EventFilterState>({
    query: '',
    location: '',
    types: {},
    dateRange: 'upcoming',
    distance: 25,
  });

  // Event Search State
  const [eventSearchResults, setEventSearchResults] = useState<ChurchEvent[] | null>(null);
  const [searchingEvents, setSearchingEvents] = useState(false);

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

  // Load church by ID when URL is /churches/:id (direct link or refresh)
  useEffect(() => {
    if (currentView !== ViewState.CHURCH_DETAIL || !routeParams.churchId) return;
    if (selectedChurch?.id === routeParams.churchId) return;
    let cancelled = false;
    (async () => {
      try {
        const church = await churchService.getChurchById(routeParams.churchId!);
        if (cancelled) return;
        if (!church) {
          navigate('/search', { replace: true });
          return;
        }
        const [churchEvents, clergy] = await Promise.all([
          eventService.getEventsForChurch(church.id).catch(() => []),
          churchService.getClergyForChurch(church.id),
        ]);
        const churchWithEventsAndClergy = { ...church, events: churchEvents, clergy };
        setSelectedChurch(churchWithEventsAndClergy);
        if (user && church) {
          const isAdmin = await churchService.isUserAdminOfChurch(user.id, church.id);
          setIsAdminOfSelectedChurch(isAdmin);
        } else {
          setIsAdminOfSelectedChurch(false);
        }
      } catch {
        if (!cancelled) {
          setSelectedChurch(null);
          navigate('/search', { replace: true });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [currentView, routeParams.churchId, user?.id, navigate]);

  // Load event by ID when URL is /events/:id (direct link or refresh)
  useEffect(() => {
    if (currentView !== ViewState.EVENT_DETAIL || !routeParams.eventId) return;
    if (selectedEvent?.id === routeParams.eventId) return;
    let cancelled = false;
    (async () => {
      try {
        const event = await eventService.getEventById(routeParams.eventId!);
        if (cancelled) return;
        if (!event) {
          navigate('/events', { replace: true });
          return;
        }
        setSelectedEvent(event);
        if (user && event.churchId) {
          const isAdmin = await churchService.isUserAdminOfChurch(user.id, event.churchId);
          setIsAdminOfEventChurch(isAdmin);
        } else {
          setIsAdminOfEventChurch(false);
        }
      } catch {
        if (!cancelled) {
          setSelectedEvent(null);
          navigate('/events', { replace: true });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [currentView, routeParams.eventId, user?.id, navigate]);

  // Protected routes: redirect unauthorized users
  useEffect(() => {
    if (loadingUser) return;
    const { view, churchId } = routeParams;
    if (view === ViewState.ADMIN_DASHBOARD && user?.role !== 'super_admin') {
      navigate('/', { replace: true });
      return;
    }
    if (view === ViewState.NO_CHURCH_PROMPT && user?.role !== 'church_admin' && user?.role !== 'super_admin') {
      navigate('/', { replace: true });
      return;
    }
    if (view === ViewState.CHURCH_ADMIN_DASHBOARD && churchId) {
      if (!user) {
        navigate(`/churches/${churchId}`, { replace: true });
        return;
      }
      let cancelled = false;
      churchService.isUserAdminOfChurch(user.id, churchId).then((isAdmin) => {
        if (!cancelled && !isAdmin && user.role !== 'super_admin') {
          navigate(`/churches/${churchId}`, { replace: true });
        }
      }).catch(() => {
        if (!cancelled) navigate(`/churches/${churchId}`, { replace: true });
      });
      return () => { cancelled = true; };
    }
  }, [loadingUser, user?.id, user?.role, location.pathname, navigate]);

  const handleNavigate = (view: ViewState, opts?: { churchId?: string; eventId?: string }) => {
    const path = getPathForView(view, opts);
    navigate(path);
    if (view !== ViewState.CHURCH_DETAIL) setSelectedChurch(null);
    if (view !== ViewState.EVENT_DETAIL) setSelectedEvent(null);
    window.scrollTo(0, 0);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters((prev) => ({ ...prev, churchName: query }));
    handleNavigate(ViewState.SEARCH);
  };

  const handleSearchChurches = async () => {
    setSearchingChurches(true);
    try {
      const selectedServices = Object.entries(filters.services)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const results = await churchService.searchChurches({
        churchName: filters.churchName.trim() || undefined,
        location: filters.location.trim() || undefined,
        distance: filters.distance,
        services: selectedServices.length > 0 ? selectedServices : undefined,
        userLocation,
      });
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearchingChurches(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchQuery('');
    setFilters({ churchName: '', location: '', distance: 25, services: {} });
  };

  const handleSearchEvents = async () => {
    setSearchingEvents(true);
    try {
      const selectedTypes = Object.entries(eventFilters.types)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const results = await eventService.searchEvents({
        query: eventFilters.query.trim() || undefined,
        location: eventFilters.location.trim() || undefined,
        distance: eventFilters.distance ?? 25,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        dateRange: eventFilters.dateRange,
        userLocation,
      });
      setEventSearchResults(results);
    } catch (err) {
      console.error('Event search failed:', err);
      setEventSearchResults([]);
    } finally {
      setSearchingEvents(false);
    }
  };

  const handleClearEventSearch = () => {
    setEventSearchResults(null);
    setEventFilters({ query: '', location: '', types: {}, dateRange: 'upcoming', distance: 25 });
  };

  const handleViewDetails = async (church: Church) => {
    try {
      const [churchEvents, clergy] = await Promise.all([
        eventService.getEventsForChurch(church.id).catch(() => []),
        churchService.getClergyForChurch(church.id),
      ]);
      const churchWithEventsAndClergy = { ...church, events: churchEvents, clergy };
      setSelectedChurch(churchWithEventsAndClergy);
    } catch (error) {
      console.error('Error loading church details:', error);
      setSelectedChurch(church);
    }
    if (user) {
      try {
        const isAdmin = await churchService.isUserAdminOfChurch(user.id, church.id);
        setIsAdminOfSelectedChurch(isAdmin);
      } catch {
        setIsAdminOfSelectedChurch(false);
      }
    } else {
      setIsAdminOfSelectedChurch(false);
    }
    navigate(`/churches/${church.id}`);
    window.scrollTo(0, 0);
  };

  const handleViewEventDetails = async (event: ChurchEvent) => {
    setSelectedEvent(event);
    if (user && event.churchId) {
      try {
        const isAdmin = await churchService.isUserAdminOfChurch(user.id, event.churchId);
        setIsAdminOfEventChurch(isAdmin);
      } catch {
        setIsAdminOfEventChurch(false);
      }
    } else {
      setIsAdminOfEventChurch(false);
    }
    navigate(`/events/${event.id}`);
    window.scrollTo(0, 0);
  };

  const handleDeleteEventFromDetail = async (eventId: string) => {
    if (!selectedEvent) return;
    if (!window.confirm('Are you sure you want to delete this event? This cannot be undone.')) return;
    try {
      await eventService.deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      if (selectedChurch && selectedChurch.id === selectedEvent.churchId) {
        setSelectedChurch(prev => prev ? { ...prev, events: prev.events.filter(e => e.id !== eventId) } : null);
      }
      setSelectedEvent(null);
      navigate('/events');
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error deleting event:', err);
    }
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
      navigate(`/churches/${selectedChurch.id}/edit`);
      window.scrollTo(0, 0);
    }
  };

  const handleAddEvent = () => {
    if (selectedChurch) {
      navigate(`/churches/${selectedChurch.id}/edit`, { state: { addEvent: true } });
      window.scrollTo(0, 0);
    }
  };

  const handleGoToMyDashboard = async () => {
    if (!user) return;
    try {
      const churches = await churchService.getChurchesForAdmin(user.id);
      if (churches.length > 0) {
        await handleViewDetails(churches[0]);
      } else {
        navigate('/admin/no-church');
        window.scrollTo(0, 0);
      }
    } catch (e) {
      console.error('Error loading your church:', e);
      navigate('/');
      window.scrollTo(0, 0);
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

  // Church Filter Logic (search by name, city, address, zip + location/distance/services)
  const filteredChurches = filterChurches(sortedChurches, {
    searchQuery,
    filters,
    userLocation,
  });

  // Process events with distance when user location available
  const processedEvents = events.map((event) => {
    const coords = event.coordinates;
    if (userLocation && coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        coords.lat,
        coords.lng
      );
      return { ...event, distance: dist };
    }
    return event;
  });

  // Sort events: by distance when available, else by date
  const sortedEvents = [...processedEvents].sort((a, b) => {
    if (a.distance != null && b.distance != null) return a.distance - b.distance;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Events shown on Events page: search results if active, else sorted by distance
  const eventsForPage = eventSearchResults !== null ? eventSearchResults : sortedEvents;

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
        onGoToMyDashboard={handleGoToMyDashboard}
      />
      
      <div className="flex-grow flex flex-col w-full min-w-0">
        {currentView === ViewState.HOME && (
          <Home 
            onNavigate={handleNavigate}
            onSearch={handleSearch}
            onViewDetails={handleViewDetails}
            onViewEventDetails={handleViewEventDetails}
            churches={loadingChurches ? [] : filteredChurches}
            events={loadingEvents ? [] : filterEvents(processedEvents, { searchQuery: eventFilters.query, filters: eventFilters })}
          />
        )}

        {currentView === ViewState.SEARCH && (
          <ChurchSearch 
            filters={filters}
            setFilters={setFilters}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            churches={loadingChurches ? [] : (searchResults !== null ? searchResults : sortedChurches)}
            onViewDetails={handleViewDetails}
            onSearchChurches={handleSearchChurches}
            onClearSearch={handleClearSearch}
            isSearching={searchingChurches}
            hasActiveSearch={searchResults !== null}
          />
        )}

        {currentView === ViewState.CHURCH_DETAIL && routeParams.churchId && (!selectedChurch || selectedChurch.id !== routeParams.churchId) && (
          <main className="max-w-2xl mx-auto py-20 px-4 text-center">
            <div className="text-gray-500">Loading church...</div>
          </main>
        )}
        {currentView === ViewState.CHURCH_DETAIL && selectedChurch && (
          !canViewChurchDetail(selectedChurch, isAdminOfSelectedChurch)
            ? (
                <main className="max-w-2xl mx-auto py-20 px-4 text-center">
                  <p className="text-gray-600 mb-6">This church is not available yet.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/search')}
                    className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800"
                  >
                    Back to search
                  </button>
                </main>
              )
            : (
                <ChurchDetail 
                  church={selectedChurch} 
                  onBack={() => navigate('/search')} 
                  onViewEventDetails={handleViewEventDetails}
                  isAdmin={isAdminOfSelectedChurch}
                  onEditChurch={isAdminOfSelectedChurch ? handleEditChurch : undefined}
                  onAddEvent={isAdminOfSelectedChurch ? handleAddEvent : undefined}
                  onEventUpdated={async () => {
                    if (!selectedChurch) return;
                    const churchEvents = await eventService.getEventsForChurch(selectedChurch.id);
                    setSelectedChurch(prev => prev ? { ...prev, events: churchEvents } : null);
                  }}
                />
              )
        )}

        {currentView === ViewState.EVENTS && (
          <EventsPage 
            filters={eventFilters}
            setFilters={setEventFilters}
            events={loadingEvents ? [] : eventsForPage}
            onViewEventDetails={handleViewEventDetails}
            onSearchEvents={handleSearchEvents}
            onClearSearch={handleClearEventSearch}
            isSearching={searchingEvents}
            hasActiveSearch={eventSearchResults !== null}
            hasUserLocation={!!userLocation}
          />
        )}

        {currentView === ViewState.EVENT_DETAIL && routeParams.eventId && (!selectedEvent || selectedEvent.id !== routeParams.eventId) && (
          <main className="max-w-2xl mx-auto py-20 px-4 text-center">
            <div className="text-gray-500">Loading event...</div>
          </main>
        )}
        {currentView === ViewState.EVENT_DETAIL && selectedEvent && (
          <EventDetail 
            event={selectedEvent}
            onBack={() => navigate('/events')}
            onViewChurch={handleViewChurchFromEvent}
            isAdmin={isAdminOfEventChurch}
            onDeleteEvent={handleDeleteEventFromDetail}
          />
        )}

        {currentView === ViewState.NO_CHURCH_PROMPT && (
          <main className="max-w-2xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Please register a church</h2>
              <p className="text-gray-600 mb-4">
                You don&apos;t have a church linked to your account yet. Register your church to manage its listing and events.
              </p>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-slate-900 font-semibold underline hover:no-underline mb-8 inline-block"
              >
                Register a church
              </button>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800"
                >
                  Register a church
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
                >
                  Back to home
                </button>
              </div>
            </div>
          </main>
        )}

        {currentView === ViewState.REGISTER_CHURCH && (
          <RegisterChurch 
            onCancel={() => navigate('/')}
            onSuccess={handleAuthSuccess}
            onGoToMyChurch={handleGoToMyDashboard}
          />
        )}

        {currentView === ViewState.ADMIN_DASHBOARD && user?.role === 'super_admin' && (
          <AdminDashboard onBack={() => navigate('/')} />
        )}

        {currentView === ViewState.CHURCH_ADMIN_DASHBOARD && (user?.role === 'church_admin' || user?.role === 'super_admin') && (
          <ChurchAdminDashboard 
            onBack={() => navigate('/')}
            onViewProfile={handleViewDetails}
            onChurchUpdated={(updatedChurch) => {
              setChurches(prevChurches => 
                prevChurches.map(c => c.id === updatedChurch.id ? updatedChurch : c)
              );
              if (selectedChurch && selectedChurch.id === updatedChurch.id) {
                setSelectedChurch(updatedChurch);
              }
            }}
            initialChurchId={routeParams.churchId ?? selectedChurch?.id}
            initialShowEventForm={location.state?.addEvent === true}
          />
        )}
      </div>

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
              &copy; 2026 Ethiopian Orthodox Church Finder. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-gray-500">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      <Analytics />
    </div>
  );
};

export default App;
