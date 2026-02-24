import React from 'react';
import { Church } from '../types';
import { MapPin, Phone, Users, Calendar, Heart, ArrowRight } from 'lucide-react';
import { DEFAULT_CHURCH_IMAGE, DEFAULT_CLERGY_IMAGE } from '../constants';

interface ChurchCardProps {
  church: Church;
  onViewDetails: (church: Church) => void;
  onToggleFollow: (id: string) => void;
  isFollowing: boolean;
}

export const ChurchCard: React.FC<ChurchCardProps> = ({ church, onViewDetails, onToggleFollow, isFollowing }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row">
      <div className="md:w-2/5 h-44 sm:h-48 md:h-auto relative bg-gray-200 flex-shrink-0">
        <img 
          src={church.imageUrl || DEFAULT_CHURCH_IMAGE} 
          alt={church.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 text-white text-xs font-bold bg-black/40 px-2 py-1 rounded">
          Church Exterior
        </div>
      </div>
      
      <div className="p-6 md:w-3/5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">{church.name}</h3>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleFollow(church.id); }}
              className={`p-2.5 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center touch-manipulation ${isFollowing ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
            >
              <Heart className={`h-5 w-5 ${isFollowing ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-start text-gray-600 text-sm break-words">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <span>{church.address}, {church.city}, {church.state} {church.zip}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Phone className="h-4 w-4 mr-2" />
              {church.phone}
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="h-4 w-4 mr-2" />
              {church.clergy.length > 0 ? `${church.clergy.length} Clergy Members` : 'Clergy info unavailable'}
            </div>
          </div>

          {/* Clergy Preview */}
          {church.clergy.length > 0 && (
            <div className="flex items-center space-x-2 mb-4">
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

        <div className="flex gap-2 sm:space-x-3 mt-4">
          <button 
            type="button"
            onClick={() => onViewDetails(church)}
            className="flex-1 bg-slate-900 text-white px-4 py-3 min-h-[44px] rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors text-center touch-manipulation"
          >
            View Details
          </button>
          <button 
            type="button"
            className="px-4 py-3 min-h-[44px] min-w-[44px] rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center touch-manipulation"
            title="Directions"
          >
             <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
