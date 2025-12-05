
import React from 'react';
import { EventFilterState } from '../types';
import { EVENT_TYPES } from '../constants';

interface EventFilterSidebarProps {
  filters: EventFilterState;
  setFilters: React.Dispatch<React.SetStateAction<EventFilterState>>;
}

export const EventFilterSidebar: React.FC<EventFilterSidebarProps> = ({ filters, setFilters }) => {
  const handleTypeChange = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Filter Events</h2>

      {/* Date Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <select
          value={filters.dateRange}
          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
        >
          <option value="upcoming">All Upcoming</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
        </select>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          placeholder="City or State"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
        />
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
        onClick={() => setFilters({ location: '', types: {}, dateRange: 'upcoming' })}
        className="w-full bg-white border border-gray-300 text-slate-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
};
