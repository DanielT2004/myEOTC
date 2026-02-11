import React from 'react';
import { Hero } from '../components/Hero';
import { ChurchCard } from '../components/ChurchCard';
import { EventCard } from '../components/EventCard';
import { ViewState, Church, ChurchEvent } from '../types';

interface HomeProps {
  onNavigate: (view: ViewState) => void;
  onSearch: (query: string) => void;
  onViewDetails: (church: Church) => void;
  onViewEventDetails: (event: ChurchEvent) => void;
  onToggleFollow: (id: string) => void;
  followedChurches: Set<string>;
  churches: Church[];
  events: ChurchEvent[];
}

export const Home: React.FC<HomeProps> = ({
  onNavigate,
  onSearch,
  onViewDetails,
  onViewEventDetails,
  onToggleFollow,
  followedChurches,
  churches,
  events
}) => {
  return (
    <>
      <Hero onSearch={onSearch} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Section - Horizontal Scroll */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-6">
             <div>
                <h2 className="text-3xl font-bold tracking-tight">Churches Near You</h2>
                <p className="text-gray-500 mt-1">Discover parishes in your local area</p>
             </div>
             <button 
               onClick={() => onNavigate(ViewState.SEARCH)}
               className="text-blue-600 font-semibold hover:text-blue-800 flex items-center mb-1"
              >
               View All &rarr;
             </button>
          </div>
          
          {/* Horizontal Scroll Container */}
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex overflow-x-auto pb-8 space-x-6 scrollbar-hide snap-x snap-mandatory">
                {churches.length === 0 ? (
                  <div className="min-w-[85vw] sm:min-w-[400px] snap-center text-center py-12 text-gray-500">
                    No churches found
                  </div>
                ) : (
                  churches.map(church => (
                    <div key={church.id} className="min-w-[85vw] sm:min-w-[400px] snap-center">
                      <ChurchCard 
                        church={church} 
                        onViewDetails={onViewDetails}
                        onToggleFollow={onToggleFollow}
                        isFollowing={followedChurches.has(church.id)}
                      />
                    </div>
                  ))
                )}
              </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div>
          <div className="flex justify-between items-end mb-6">
             <h2 className="text-3xl font-bold tracking-tight">Upcoming Events & Holidays</h2>
             <button 
               onClick={() => onNavigate(ViewState.EVENTS)}
               className="text-blue-600 font-semibold hover:text-blue-800 flex items-center mb-1"
              >
               View Calendar &rarr;
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500">
                No upcoming events
              </div>
            ) : (
              events.slice(0, 6).map(event => (
                <EventCard 
                  key={event.id} 
                  event={event}
                  onViewDetails={onViewEventDetails}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
};