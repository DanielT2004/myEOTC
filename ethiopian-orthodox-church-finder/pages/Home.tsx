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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12">
        {/* Featured Section - horizontal strip with max 6 cards */}
        <div className="mb-6 sm:mb-10 md:mb-16">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-1 sm:gap-3 mb-3 sm:mb-6">
             <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Churches Near You</h2>
                <p className="text-gray-500 mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base">Discover parishes in your local area</p>
             </div>
             <button 
               type="button"
               onClick={() => onNavigate(ViewState.SEARCH)}
               className="text-blue-600 font-medium sm:font-semibold hover:text-blue-800 text-sm touch-manipulation self-start -ml-1 py-2"
              >
               View All &rarr;
             </button>
          </div>
          
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0 overflow-hidden max-w-[100vw] sm:max-w-none">
            <div className="flex overflow-x-auto overflow-y-hidden pb-3 sm:pb-6 gap-3 sm:gap-6 scrollbar-hide scroll-touch snap-x snap-proximity">
            {featuredChurches.length === 0 ? (
              <div className="min-w-full text-center py-10 sm:py-12 text-gray-500 text-sm">
                No churches found
              </div>
            ) : (
              featuredChurches.map(church => (
                <div key={church.id} className="w-[70vw] max-w-[70vw] sm:w-[360px] sm:min-w-[360px] sm:max-w-[360px] h-[380px] sm:h-[420px] flex-shrink-0 snap-start">
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-1 sm:gap-3 mb-3 sm:mb-6">
             <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Upcoming Events & Holidays</h2>
             <button 
               type="button"
               onClick={() => onNavigate(ViewState.EVENTS)}
               className="text-blue-600 font-medium sm:font-semibold hover:text-blue-800 text-sm touch-manipulation self-start -ml-1 py-2"
              >
               View Calendar &rarr;
             </button>
          </div>
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0 overflow-hidden max-w-[100vw] sm:max-w-none">
            <div className="flex overflow-x-auto overflow-y-hidden pb-3 sm:pb-6 gap-3 sm:gap-6 scrollbar-hide scroll-touch snap-x snap-proximity">
            {featuredEvents.length === 0 ? (
              <div className="min-w-full text-center py-10 sm:py-12 text-gray-500 text-sm">
                No upcoming events
              </div>
            ) : (
              featuredEvents.map(event => (
                <div key={event.id} className="w-[70vw] max-w-[70vw] sm:w-[360px] sm:min-w-[360px] sm:max-w-[360px] h-[380px] sm:h-[420px] flex-shrink-0 snap-start">
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