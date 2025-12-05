import React, { useState } from 'react';
import { FilterSidebar } from '../components/FilterSidebar';
import { ChurchCard } from '../components/ChurchCard';
import { ChurchMap } from '../components/ChurchMap';
import { FilterState, Church } from '../types';
import { List, Map as MapIcon } from 'lucide-react';

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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
           <FilterSidebar 
              filters={filters} 
              setFilters={setFilters} 
              onApply={() => {}} 
           />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
           <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
             <h2 className="text-2xl font-bold">
                {searchQuery ? `Results for "${searchQuery}"` : 'All Churches'}
                <span className="text-sm font-normal text-gray-500 ml-2">({churches.length} found)</span>
             </h2>
             
             <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            viewMode === 'list' 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <List className="h-4 w-4 mr-2" /> List
                    </button>
                    <button 
                        onClick={() => setViewMode('map')}
                        className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
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
           
           {/* Content Area */}
           <div className="flex-1">
              {viewMode === 'list' ? (
                <div className="grid grid-cols-1 gap-6">
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
                                onClick={() => { setSearchQuery(''); setFilters(prev => ({...prev, location: '', services: {}})); }}
                                className="mt-4 text-blue-600 font-medium hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
              ) : (
                <div className="h-[600px] w-full">
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