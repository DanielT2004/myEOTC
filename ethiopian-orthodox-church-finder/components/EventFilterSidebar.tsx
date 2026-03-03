import React from 'react';
import { EventFilterState } from '../types';
import { EVENT_TYPES } from '../constants';

interface EventFilterSidebarProps {
  filters: EventFilterState;
  setFilters: React.Dispatch<React.SetStateAction<EventFilterState>>;
  onSearch?: () => void;
  isSearching?: boolean;
  hasUserLocation?: boolean;
}

export const EventFilterSidebar: React.FC<EventFilterSidebarProps> = ({
  filters,
  setFilters,
  onSearch,
  isSearching = false,
  hasUserLocation = false,
}) => {
  const handleTypeChange = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
  };

  const handleClear = () => {
    setFilters({ query: '', location: '', types: {}, dateRange: 'upcoming', distance: 25 });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm md:sticky md:top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Search</h2>

      {/* Search by event name or church name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <input
          type="text"
          value={filters.query}
          onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
          placeholder="Event name or church"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
        />
      </div>

      {/* Location (city, state, or zip) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          placeholder="City, state, or zip"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
        />
      </div>

      {/* Distance (when user location available) */}
      {hasUserLocation && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
          <select
            value={filters.distance ?? 25}
            onChange={(e) => setFilters(prev => ({ ...prev, distance: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
          >
            <option value={5}>Within 5 miles</option>
            <option value={10}>Within 10 miles</option>
            <option value={25}>Within 25 miles</option>
            <option value={50}>Within 50 miles</option>
          </select>
        </div>
      )}

      {/* Date Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <select
          value={filters.dateRange}
          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as EventFilterState['dateRange'] }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
        >
          <option value="upcoming">All Upcoming</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
        </select>
      </div>

      {/* Event Types */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">Event Type</label>
        <div className="space-y-2">
          {EVENT_TYPES.map((type) => (
            <div key={type} className="flex items-center">
              <input
                id={`event-type-${type}`}
                type="checkbox"
                checked={filters.types[type] || false}
                onChange={() => handleTypeChange(type)}
                className="h-4 w-4 text-slate-900 border-gray-300 rounded focus:ring-slate-500"
              />
              <label htmlFor={`event-type-${type}`} className="ml-2 block text-sm text-gray-600 cursor-pointer">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => (onSearch ? onSearch() : handleClear())}
        disabled={isSearching}
        className="w-full bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSearching ? 'Searching...' : 'Search'}
      </button>

      <button
        type="button"
        onClick={handleClear}
        className="w-full mt-3 bg-white border border-gray-300 text-slate-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
      >
        Reset
      </button>
    </div>
  );
};
