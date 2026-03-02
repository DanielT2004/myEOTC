import React, { useState, useEffect } from 'react';
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
import { followService } from './services/followService';

// Pages
import { Home } from './pages/Home';
import { ChurchSearch } from './pages/ChurchSearch';
import { EventsPage } from './pages/EventsPage';

const App: React.FC = () => {
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
  const [isAdminOfEventChurch, setIsAdminOfEventChurch] = useState(false);
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
    churchName: '',
    location: '',
    distance: 25,
    services: {}
  });
  
  // Event Filter State
  const [eventFilters, setEventFilters] = useState<EventFilterState>({
    query: '',
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
    setCurrentView(ViewState.EVENT_DETAIL);
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
      handleNavigate(ViewState.EVENTS);
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

  const handleGoToMyDashboard = async () => {
    if (!user) return;
    try {
      const churches = await churchService.getChurchesForAdmin(user.id);
      if (churches.length > 0) {
        await handleViewDetails(churches[0]);
      } else {
        handleNavigate(ViewState.NO_CHURCH_PROMPT);
      }
    } catch (e) {
      console.error('Error loading your church:', e);
      handleNavigate(ViewState.HOME);
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

  // Church Filter Logic (search by name, city, address, zip + location/distance/services)
  const filteredChurches = filterChurches(sortedChurches, {
    searchQuery,
    filters,
    userLocation,
  });

  // Event Filter Logic (search by event title, church name, location + filters)
  const filteredEvents = filterEvents(events, {
    searchQuery: eventFilters.query,
    filters: eventFilters,
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
        onGoToMyDashboard={handleGoToMyDashboard}
      />
      
      <div className="flex-grow flex flex-col w-full min-w-0">
        {currentView === ViewState.HOME && (
          <Home 
            onNavigate={handleNavigate}
            onSearch={handleSearch}
            onViewDetails={handleViewDetails}
            onViewEventDetails={handleViewEventDetails}
            onToggleFollow={handleToggleFollow}
            followedChurches={followedChurches}
            churches={loadingChurches ? [] : filteredChurches}
            events={loadingEvents ? [] : filteredEvents}
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
          !canViewChurchDetail(selectedChurch, isAdminOfSelectedChurch)
            ? (
                <main className="max-w-2xl mx-auto py-20 px-4 text-center">
                  <p className="text-gray-600 mb-6">This church is not available yet.</p>
                  <button
                    type="button"
                    onClick={() => { setSelectedChurch(null); handleNavigate(ViewState.SEARCH); }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800"
                  >
                    Back to search
                  </button>
                </main>
              )
            : (
                <ChurchDetail 
                  church={selectedChurch} 
                  onBack={() => handleNavigate(ViewState.SEARCH)} 
                  onToggleFollow={handleToggleFollow}
                  isFollowing={followedChurches.has(selectedChurch.id)}
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
            events={loadingEvents ? [] : filteredEvents}
            onViewEventDetails={handleViewEventDetails}
          />
        )}

        {currentView === ViewState.EVENT_DETAIL && selectedEvent && (
          <EventDetail 
            event={selectedEvent}
            onBack={() => handleNavigate(ViewState.EVENTS)}
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
                onClick={() => handleNavigate(ViewState.REGISTER_CHURCH)}
                className="text-slate-900 font-semibold underline hover:no-underline mb-8 inline-block"
              >
                Register a church
              </button>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => handleNavigate(ViewState.REGISTER_CHURCH)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800"
                >
                  Register a church
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate(ViewState.HOME)}
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
            onCancel={() => handleNavigate(ViewState.HOME)}
            onSuccess={handleAuthSuccess}
            onGoToMyChurch={handleGoToMyDashboard}
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
    </div>
  );
};

export default App;
