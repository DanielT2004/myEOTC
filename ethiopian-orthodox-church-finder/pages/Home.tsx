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
  const featuredChurches = churches.slice(0, 6);
  const featuredEvents = events.slice(0, 6);

  return (
    <>
      <Hero onSearch={onSearch} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Featured Section - horizontal strip with max 6 cards */}
        <div className="mb-10 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-4 sm:mb-6">
             <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Churches Near You</h2>
                <p className="text-gray-500 mt-1 text-sm sm:text-base">Discover parishes in your local area</p>
             </div>
             <button 
               type="button"
               onClick={() => onNavigate(ViewState.SEARCH)}
               className="text-blue-600 font-semibold hover:text-blue-800 flex items-center min-h-[44px] touch-manipulation self-start"
              >
               View All &rarr;
             </button>
          </div>
          
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0 overflow-hidden max-w-[100vw] sm:max-w-none">
            <div className="flex overflow-x-auto overflow-y-hidden pb-4 sm:pb-6 gap-4 sm:gap-6 scrollbar-hide scroll-touch snap-x snap-proximity">
            {featuredChurches.length === 0 ? (
              <div className="min-w-full text-center py-12 text-gray-500">
                No churches found
              </div>
            ) : (
              featuredChurches.map(church => (
                <div key={church.id} className="min-w-[85vw] sm:min-w-[360px] sm:max-w-[360px] h-[400px] sm:h-[420px] flex-shrink-0 snap-start">
                  <ChurchCard
                    church={church}
                    onViewDetails={onViewDetails}
                    isCompact
                  />
                </div>
              ))
            )}
            </div>
          </div>
        </div>

        {/* Upcoming Events Section - horizontal strip with max 6 cards */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-4 sm:mb-6">
             <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Upcoming Events & Holidays</h2>
             <button 
               type="button"
               onClick={() => onNavigate(ViewState.EVENTS)}
               className="text-blue-600 font-semibold hover:text-blue-800 flex items-center min-h-[44px] touch-manipulation self-start"
              >
               View Calendar &rarr;
             </button>
          </div>
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0 overflow-hidden max-w-[100vw] sm:max-w-none">
            <div className="flex overflow-x-auto overflow-y-hidden pb-4 sm:pb-6 gap-4 sm:gap-6 scrollbar-hide scroll-touch snap-x snap-proximity">
            {featuredEvents.length === 0 ? (
              <div className="min-w-full text-center py-12 text-gray-500">
                No upcoming events
              </div>
            ) : (
              featuredEvents.map(event => (
                <div key={event.id} className="min-w-[85vw] sm:min-w-[360px] sm:max-w-[360px] h-[400px] sm:h-[420px] flex-shrink-0 snap-start">
                  <EventCard
                    event={event}
                    onViewDetails={onViewEventDetails}
                    isCompact
                  />
                </div>
              ))
            )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};