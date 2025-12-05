import React from 'react';
import { FilterState } from '../types';
import { SERVICE_OPTIONS } from '../constants';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onApply: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, setFilters, onApply }) => {
  const handleServiceChange = (service: string) => {
    setFilters(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service]
      }
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Enter zip or city"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
        />
      </div>

      {/* Distance */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
        <select
          value={filters.distance}
          onChange={(e) => setFilters(prev => ({ ...prev, distance: Number(e.target.value) }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
        >
          <option value={5}>Within 5 miles</option>
          <option value={10}>Within 10 miles</option>
          <option value={25}>Within 25 miles</option>
          <option value={50}>Within 50 miles</option>
        </select>
      </div>

      {/* Services */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">Services Offered</label>
        <div className="space-y-2">
          {SERVICE_OPTIONS.map((service) => (
            <div key={service} className="flex items-center">
              <input
                id={`filter-${service}`}
                type="checkbox"
                checked={filters.services[service] || false}
                onChange={() => handleServiceChange(service)}
                className="h-4 w-4 text-slate-900 border-gray-300 rounded focus:ring-slate-500"
              />
              <label htmlFor={`filter-${service}`} className="ml-2 block text-sm text-gray-600 cursor-pointer">
                {service}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onApply}
        className="w-full bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors shadow-sm"
      >
        Apply Filters
      </button>
    </div>
  );
};
