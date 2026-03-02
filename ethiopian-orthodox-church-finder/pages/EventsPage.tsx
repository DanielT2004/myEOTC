import React, { useState } from 'react';
import { EventFilterSidebar } from '../components/EventFilterSidebar';
import { EventCard } from '../components/EventCard';
import { EventFilterState, ChurchEvent } from '../types';
import { SlidersHorizontal, X } from 'lucide-react';

interface EventsPageProps {
  filters: EventFilterState;
  setFilters: React.Dispatch<React.SetStateAction<EventFilterState>>;
  events: ChurchEvent[];
  onViewEventDetails: (event: ChurchEvent) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  filters,
  setFilters,
  events,
  onViewEventDetails
}) => {
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  return (
     <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 min-h-0">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Community Events Calendar</h1>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Event Filters: collapsible on mobile */}
            <div className="w-full md:w-64 flex-shrink-0 order-2 md:order-1">
                <button
                  type="button"
                  onClick={() => setShowFiltersMobile((v) => !v)}
                  className="md:hidden w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium shadow-sm mb-4 min-h-[44px]"
                >
                  {showFiltersMobile ? <X className="h-5 w-5" /> : <SlidersHorizontal className="h-5 w-5" />}
                  {showFiltersMobile ? 'Hide filters' : 'Filters'}
                </button>
                <div className={`${showFiltersMobile ? 'block' : 'hidden'} md:block`}>
                  <EventFilterSidebar filters={filters} setFilters={setFilters} />
                </div>
            </div>

            {/* Event List */}
            <div className="flex-1 min-w-0 order-1 md:order-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-6 sm:pb-8">
                    {events.length > 0 ? (
                        events.map((event) => (
                        <div key={event.id} className="min-w-0">
                        <EventCard 
                            event={event}
                            onViewDetails={onViewEventDetails}
                        />
                        </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500 text-lg">No events found matching your filters.</p>
                            <button 
                                onClick={() => { setFilters({ query: '', location: '', types: {}, dateRange: 'upcoming' }); setShowFiltersMobile(false); }}
                                className="mt-4 text-blue-600 font-medium hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
     </main>
  );
};