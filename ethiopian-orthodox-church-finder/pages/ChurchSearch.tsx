import React, { useState } from 'react';
import { FilterSidebar } from '../components/FilterSidebar';
import { ChurchCard } from '../components/ChurchCard';
import { ChurchMap } from '../components/ChurchMap';
import { FilterState, Church } from '../types';
import { List, Map as MapIcon, SlidersHorizontal, X } from 'lucide-react';

interface ChurchSearchProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  churches: Church[];
  onViewDetails: (church: Church) => void;
  onToggleFollow: (id: string) => void;
  followedChurches: Set<string>;
}

export const ChurchSearch: React.FC<ChurchSearchProps> = ({
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  churches,
  onViewDetails,
  onToggleFollow,
  followedChurches
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full min-h-0">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Filters: collapsible on mobile */}
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
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onApply={() => setShowFiltersMobile(false)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 order-1 md:order-2">
           <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 sm:mb-6 gap-3">
             <h2 className="text-xl sm:text-2xl font-bold break-words">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Churches'}
                <span className="text-sm font-normal text-gray-500 ml-1 sm:ml-2">({churches.length} found)</span>
             </h2>
             
             <div className="flex items-center flex-wrap gap-3 sm:space-x-4 w-full sm:w-auto">
                <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
                    <button 
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`flex items-center px-3 py-2.5 sm:py-1.5 rounded-md text-sm font-medium transition-all min-h-[44px] sm:min-h-0 justify-center ${
                            viewMode === 'list' 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <List className="h-4 w-4 mr-2" /> List
                    </button>
                    <button 
                        type="button"
                        onClick={() => setViewMode('map')}
                        className={`flex items-center px-3 py-2.5 sm:py-1.5 rounded-md text-sm font-medium transition-all min-h-[44px] sm:min-h-0 justify-center ${
                            viewMode === 'map' 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <MapIcon className="h-4 w-4 mr-2" /> Map
                    </button>
                </div>
                
                {viewMode === 'list' && (
                    <div className="flex items-center space-x-2 hidden sm:flex">
                        <span className="text-sm text-gray-500">Sort:</span>
                        <select className="border-gray-300 rounded-md text-sm focus:ring-slate-500 focus:border-slate-500">
                            <option>Distance</option>
                            <option>Name (A-Z)</option>
                        </select>
                    </div>
                )}
             </div>
           </div>
           
           {/* Content Area - scrollable list */}
           <div className="flex-1 min-h-0">
              {viewMode === 'list' ? (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-6 sm:pb-8">
                    {churches.length > 0 ? (
                        churches.map(church => (
                            <ChurchCard 
                                key={church.id} 
                                church={church} 
                                onViewDetails={onViewDetails}
                                onToggleFollow={onToggleFollow}
                                isFollowing={followedChurches.has(church.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500 text-lg">No churches found matching your criteria.</p>
                            <button 
                                type="button"
                                onClick={() => { setSearchQuery(''); setFilters(prev => ({ ...prev, churchName: '', location: '', services: {} })); setShowFiltersMobile(false); }}
                                className="mt-4 py-2 text-blue-600 font-medium hover:underline min-h-[44px] touch-manipulation"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
              ) : (
                <div className="h-[55vh] min-h-[300px] sm:h-[600px] w-full rounded-xl overflow-hidden border border-gray-200">
                    <ChurchMap 
                        churches={churches} 
                        onViewDetails={onViewDetails} 
                    />
                </div>
              )}
           </div>
        </div>
      </div>
    </main>
  );
};