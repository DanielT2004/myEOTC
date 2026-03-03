
import React from 'react';
import { ChurchEvent } from '../types';
import { MapPin, Calendar, Clock, ArrowLeft, Navigation, Trash2 } from 'lucide-react';
import { DEFAULT_EVENT_IMAGE } from '../constants';

interface EventDetailProps {
  event: ChurchEvent;
  onBack: () => void;
  onViewChurch: (churchId: string) => void;
  isAdmin?: boolean;
  onDeleteEvent?: (eventId: string) => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({ event, onBack, onViewChurch, isAdmin, onDeleteEvent }) => {
  const dateObj = new Date(event.date);
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white min-h-screen pb-10 sm:pb-12">
      {/* Header Image */}
      <div className="h-52 sm:h-64 md:h-96 w-full relative bg-gray-900">
        <img 
          src={event.imageUrl || DEFAULT_EVENT_IMAGE} 
          alt={event.title} 
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-8 md:left-8 z-10">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2.5 min-h-[40px] sm:min-h-[44px] bg-white/90 backdrop-blur text-slate-900 rounded-full text-xs sm:text-sm font-semibold hover:bg-white transition-colors touch-manipulation"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> Back to Events
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-600 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-4">
                {event.type}
            </span>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-2 sm:mb-4 leading-tight">{event.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center text-white/90 gap-2 sm:gap-4 md:gap-8 text-sm sm:text-base">
               <div className="flex items-center min-w-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-400 flex-shrink-0" />
                  <span className="font-medium truncate">{dateStr}</span>
               </div>
               <div className="flex items-center min-w-0">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-blue-400 flex-shrink-0" />
                  <span className="font-medium hover:underline cursor-pointer truncate">{event.location}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 relative z-10">
         <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
                <div className="md:col-span-2 space-y-5 sm:space-y-8">
                    <section>
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-4">About this Event</h2>
                        <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">{event.description}</p>
                    </section>
                    
                    <section>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 sm:mb-3">Host Church</h2>
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg flex items-center justify-between gap-3 border border-gray-200">
                             <div className="min-w-0 flex-1">
                                 <p className="font-bold text-slate-900 text-sm sm:text-base truncate">{event.churchName}</p>
                                 <p className="text-xs sm:text-sm text-gray-500">View church profile for more info</p>
                             </div>
                             {event.churchId && (
                               <button 
                                 onClick={() => onViewChurch(event.churchId!)}
                                 className="text-blue-600 font-semibold text-xs sm:text-sm hover:underline flex-shrink-0 touch-manipulation"
                               >
                                   View Profile
                               </button>
                             )}
                        </div>
                    </section>
                </div>
                
                <div className="md:col-span-1">
                    <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-100 space-y-3 sm:space-y-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Time</p>
                                <p className="text-slate-900 font-medium text-sm sm:text-base">{timeStr}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 sm:gap-3">
                            <Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Address</p>
                                <p className="text-slate-900 font-medium text-sm sm:text-base break-words">{event.location}</p>
                            </div>
                        </div>
                        
                        <hr className="border-slate-200 my-3 sm:my-4" />
                        {isAdmin && onDeleteEvent && (
                          <>
                            <hr className="border-slate-200 my-3 sm:my-4" />
                            <button
                              type="button"
                              onClick={() => onDeleteEvent(event.id)}
                              className="w-full bg-red-50 border border-red-200 text-red-700 font-semibold sm:font-bold py-2.5 sm:py-3 text-sm rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center touch-manipulation"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Delete event
                            </button>
                          </>
                        )}
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};
