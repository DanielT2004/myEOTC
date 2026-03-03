import React, { useState } from 'react';
import { EventFilterSidebar } from '../components/EventFilterSidebar';
import { EventCard } from '../components/EventCard';
import { EventFilterState, ChurchEvent } from '../types';
import { Search, SlidersHorizontal } from 'lucide-react';

interface EventsPageProps {
  filters: EventFilterState;
  setFilters: React.Dispatch<React.SetStateAction<EventFilterState>>;
  events: ChurchEvent[];
  onViewEventDetails: (event: ChurchEvent) => void;
  onSearchEvents?: () => void;
  onClearSearch?: () => void;
  isSearching?: boolean;
  hasActiveSearch?: boolean;
  hasUserLocation?: boolean;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  filters,
  setFilters,
  events,
  onViewEventDetails,
  onSearchEvents,
  onClearSearch,
  isSearching = false,
  hasActiveSearch = false,
  hasUserLocation = false,
}) => {
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  return (
     <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 min-h-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-5">Community Events</h1>

        {/* Top search bar - always visible */}
        <div className="mb-4 sm:mb-5">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 flex flex-col xs:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                placeholder="Event or church name"
                className="flex-1 min-w-0 px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-slate-500 focus:border-slate-500"
              />
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City or zip"
                className="flex-1 min-w-0 px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-slate-500 focus:border-slate-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSearchEvents?.()}
                disabled={isSearching}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-60 touch-manipulation"
              >
                <Search className="h-4 w-4" />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                onClick={() => setShowFiltersMobile((v) => !v)}
                className="md:hidden inline-flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 touch-manipulation"
                aria-label={showFiltersMobile ? 'Hide filters' : 'Show filters'}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-sm font-medium">{showFiltersMobile ? 'Hide' : 'Filters'}</span>
              </button>
            </div>
          </div>
          {hasActiveSearch && onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-2 text-sm text-blue-600 hover:underline font-medium touch-manipulation"
            >
              Clear search
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Filters: desktop visible; mobile collapsible */}
            <div className={`w-full md:w-56 flex-shrink-0 ${showFiltersMobile ? 'block' : 'hidden'} md:block`}>
              <EventFilterSidebar
                filters={filters}
                setFilters={setFilters}
                onSearch={onSearchEvents}
                isSearching={isSearching}
                hasUserLocation={hasUserLocation}
              />
            </div>

            {/* Event List */}
            <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pb-6 sm:pb-8">
                    {events.length > 0 ? (
                        events.map((event) => (
                        <div key={event.id} className="min-w-0">
                        <EventCard 
                            event={event}
                            onViewDetails={onViewEventDetails}
                            isCompact
                        />
                        </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200">
                            <p className="text-gray-500 text-sm sm:text-base">
                              {hasActiveSearch ? 'No events found. Try different search criteria.' : 'No events found. Use search to find events by location, type, or date.'}
                            </p>
                            {onClearSearch && (
                              <button 
                                onClick={() => { onClearSearch(); setShowFiltersMobile(false); }}
                                className="mt-3 text-blue-600 font-medium hover:underline text-sm touch-manipulation"
                              >
                                Clear search
                              </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
     </main>
  );
};