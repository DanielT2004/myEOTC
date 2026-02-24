
import React from 'react';
import { ChurchEvent } from '../types';
import { MapPin, ArrowRight } from 'lucide-react';
import { DEFAULT_EVENT_IMAGE } from '../constants';

interface EventCardProps {
  event: ChurchEvent;
  onViewDetails?: (event: ChurchEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();

  const handleClick = () => {
    onViewDetails && onViewDetails(event);
  };

  return (
    <div 
      role={onViewDetails ? 'button' : undefined}
      tabIndex={onViewDetails ? 0 : undefined}
      onKeyDown={onViewDetails ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); } : undefined}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 group ${onViewDetails ? 'cursor-pointer active:scale-[0.99]' : ''}`}
      onClick={handleClick}
    >
      <div className="h-36 sm:h-40 relative bg-gray-200 overflow-hidden flex-shrink-0">
        <img 
            src={event.imageUrl || DEFAULT_EVENT_IMAGE} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute top-0 right-0 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 text-center shadow-sm min-w-[60px]">
                <div className="text-xs font-bold text-slate-500">{month}</div>
                <div className="text-xl font-extrabold text-slate-900">{day}</div>
            </div>
        </div>
        <div className="absolute top-4 left-4">
            <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                {event.type}
            </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {event.churchName || 'Church Event'}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{event.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">{event.description}</p>
        
        <div className="flex items-center text-xs text-gray-500 mt-auto pt-4 border-t border-gray-50 min-w-0">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
        </div>
        
        {onViewDetails && (
          <button  
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }} 
            className="mt-4 w-full py-3 min-h-[44px] bg-white border border-gray-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center group-hover:border-slate-400 touch-manipulation"
          >
              Event Details <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
      </div>
    </div>
  );
};
