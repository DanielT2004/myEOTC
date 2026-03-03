import React from 'react';
import { Church } from '../types';
import { MapPin, Phone, Users } from 'lucide-react';
import { DEFAULT_CHURCH_IMAGE, DEFAULT_CLERGY_IMAGE } from '../constants';

interface ChurchCardProps {
  church: Church;
  onViewDetails: (church: Church) => void;
  isCompact?: boolean;
}

export const ChurchCard: React.FC<ChurchCardProps> = ({ church, onViewDetails, isCompact = false }) => {
  const nameSizeClass =
    church.name.length > 70
      ? 'text-sm sm:text-base'
      : church.name.length > 45
        ? 'text-base sm:text-lg'
        : 'text-xl';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 w-full h-full flex flex-col ${isCompact ? '' : 'md:flex-row'}`}>
      <div className={`${isCompact ? 'w-full h-40 sm:h-44 min-w-0 overflow-hidden' : 'md:w-2/5 h-44 sm:h-48 md:h-auto min-w-0 overflow-hidden'} relative bg-gray-200 flex-shrink-0`}>
        <img 
          src={church.imageUrl || DEFAULT_CHURCH_IMAGE} 
          alt={church.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 text-white text-xs font-bold bg-black/40 px-2 py-1 rounded">
          Church Exterior
        </div>
      </div>
      
      <div className={`p-6 flex flex-col justify-between min-w-0 flex-1 min-h-0 overflow-hidden ${isCompact ? 'w-full' : 'md:w-3/5'}`}>
        <div className="min-w-0 min-h-0 flex-1 flex flex-col overflow-hidden">
          <div className="mb-2 min-w-0">
            <h3 className={`${nameSizeClass} font-bold text-slate-900 leading-tight break-words line-clamp-2 min-w-0`}>{church.name}</h3>
          </div>
          
          <div className="space-y-2 mb-4 min-w-0 flex-shrink-0">
            <div className="flex items-start text-gray-600 text-sm min-w-0 overflow-hidden">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <span className="break-words line-clamp-2 min-w-0">{church.address}, {church.city}, {church.state} {church.zip}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Phone className="h-4 w-4 mr-2" />
              {church.phone}
            </div>
           
          </div>

          {/* Clergy Preview */}
          {church.clergy.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 flex-shrink-0">
                <div className="flex -space-x-2 overflow-hidden">
                    {church.clergy.slice(0, 3).map((cleric) => (
                        <img 
                            key={cleric.id}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                            src={cleric.imageUrl || DEFAULT_CLERGY_IMAGE}
                            alt={cleric.name}
                        />
                    ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">
                    {church.clergy.length > 3 ? `+${church.clergy.length - 3} more` : 'Serving our community'}
                </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex-shrink-0">
          <button 
            type="button"
            onClick={() => onViewDetails(church)}
            className="w-full bg-slate-900 text-white px-4 py-3 min-h-[44px] rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors text-center touch-manipulation"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
