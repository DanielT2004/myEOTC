import React from 'react';
import { EventFilterSidebar } from '../components/EventFilterSidebar';
import { EventCard } from '../components/EventCard';
import { EventFilterState, ChurchEvent } from '../types';

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
  return (
     <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Community Events Calendar</h1>
        <div className="flex flex-col md:flex-row gap-8">
            {/* Event Filters */}
            <div className="w-full md:w-64 flex-shrink-0">
                <EventFilterSidebar filters={filters} setFilters={setFilters} />
            </div>

            {/* Event List */}
            <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.length > 0 ? (
                        events.map((event) => (
                        <EventCard 
                            key={event.id} 
                            event={event} 
                            onClick={onViewEventDetails}
                        />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500 text-lg">No events found matching your filters.</p>
                            <button 
                                onClick={() => setFilters({location: '', types: {}, dateRange: 'upcoming'})}
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