import React, { useState } from 'react';
import { FilterSidebar } from '../components/FilterSidebar';
import { ChurchCard } from '../components/ChurchCard';
import { ChurchMap } from '../components/ChurchMap';
import { FilterState, Church } from '../types';
import { List, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react';

interface ChurchSearchProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  churches: Church[];
  onViewDetails: (church: Church) => void;
  onSearchChurches?: () => void;
  onClearSearch?: () => void;
  isSearching?: boolean;
  hasActiveSearch?: boolean;
}

export const ChurchSearch: React.FC<ChurchSearchProps> = ({
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  churches,
  onViewDetails,
  onSearchChurches,
  onClearSearch,
  isSearching = false,
  hasActiveSearch = false,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 w-full min-h-0">
      {/* Top search bar - always visible */}
      <div className="mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 flex flex-col xs:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={filters.churchName}
              onChange={(e) => setFilters(prev => ({ ...prev, churchName: e.target.value }))}
              placeholder="Church name"
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
              onClick={() => onSearchChurches?.()}
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
        {/* Filters sidebar: desktop always visible; mobile collapsible */}
        <div className={`w-full md:w-56 flex-shrink-0 ${showFiltersMobile ? 'block' : 'hidden'} md:block`}>
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            onApply={() => setShowFiltersMobile(false)}
            onSearch={onSearchChurches}
            isSearching={isSearching}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
             <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {hasActiveSearch ? 'Results' : 'Churches Near You'}
                <span className="text-sm font-normal text-gray-500 ml-1">({churches.length})</span>
             </h2>
             <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
                    <button 
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`flex items-center px-2.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all justify-center ${
                            viewMode === 'list' 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <List className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" /> List
                    </button>
                    <button 
                        type="button"
                        onClick={() => setViewMode('map')}
                        className={`flex items-center px-2.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all justify-center ${
                            viewMode === 'map' 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <MapIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" /> Map
                    </button>
                </div>
                {viewMode === 'list' && (
                    <div className="hidden sm:flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Sort:</span>
                        <select className="border-gray-200 rounded-md text-xs focus:ring-slate-500 focus:border-slate-500 py-1.5">
                            <option>Distance</option>
                            <option>Name (A-Z)</option>
                        </select>
                    </div>
                )}
             </div>
           </div>
           
           <div className="flex-1 min-h-0">
              {viewMode === 'list' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pb-6 sm:pb-8">
                    {churches.length > 0 ? (
                        churches.map(church => (
                            <div key={church.id} className="min-w-0">
                            <ChurchCard 
                                church={church} 
                                onViewDetails={onViewDetails}
                                isCompact
                            />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 sm:py-16 bg-white rounded-xl border border-gray-200">
                            <p className="text-gray-500 text-sm sm:text-base">
                              {hasActiveSearch ? 'No churches found matching your search.' : 'No churches found.'}
                            </p>
                            {onClearSearch && (
                              <button 
                                type="button"
                                onClick={() => { onClearSearch(); setShowFiltersMobile(false); }}
                                className="mt-3 py-2 text-blue-600 font-medium hover:underline text-sm touch-manipulation"
                              >
                                Clear search
                              </button>
                            )}
                        </div>
                    )}
                </div>
              ) : (
                <div className="h-[50vh] min-h-[280px] sm:h-[560px] w-full rounded-xl overflow-hidden border border-gray-200">
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