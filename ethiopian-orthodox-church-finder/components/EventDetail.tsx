
import React from 'react';
import { ChurchEvent } from '../types';
import { MapPin, Calendar, Clock, ArrowLeft, Share2, Navigation } from 'lucide-react';
import { DEFAULT_EVENT_IMAGE } from '../constants';

interface EventDetailProps {
  event: ChurchEvent;
  onBack: () => void;
  onViewChurch: (churchId: string) => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({ event, onBack, onViewChurch }) => {
  const dateObj = new Date(event.date);
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Header Image */}
      <div className="h-64 md:h-96 w-full relative bg-gray-900">
        <img 
          src={event.imageUrl || DEFAULT_EVENT_IMAGE} 
          alt={event.title} 
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
          <button 
            onClick={onBack}
            className="flex items-center px-4 py-2 bg-white/90 backdrop-blur text-slate-900 rounded-full text-sm font-semibold hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Events
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider mb-4">
                {event.type}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{event.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center text-white/90 gap-4 md:gap-8">
               <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-medium">{dateStr}</span>
               </div>
               <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                  <span className="font-medium hover:underline cursor-pointer">{event.location}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
         <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">About this Event</h2>
                        <p className="text-gray-600 text-lg leading-relaxed">{event.description}</p>
                    </section>
                    
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">Host Church</h2>
                        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
                             <div>
                                 <p className="font-bold text-slate-900">{event.churchName}</p>
                                 <p className="text-sm text-gray-500">View church profile for more info</p>
                             </div>
                             {event.churchId && (
                               <button 
                                 onClick={() => onViewChurch(event.churchId!)}
                                 className="text-blue-600 font-semibold text-sm hover:underline"
                               >
                                   View Profile
                               </button>
                             )}
                        </div>
                    </section>
                </div>
                
                <div className="md:col-span-1">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-start">
                            <Clock className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Time</p>
                                <p className="text-slate-900 font-medium">{timeStr}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Navigation className="h-5 w-5 text-slate-400 mt-0.5 mr-3" />
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Address</p>
                                <p className="text-slate-900 font-medium">{event.location}</p>
                            </div>
                        </div>
                        
                        <hr className="border-slate-200 my-4" />
                        
                        <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                            Add to Calendar
                        </button>
                        <button className="w-full bg-white border border-gray-300 text-slate-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                            <Share2 className="h-4 w-4 mr-2" /> Share Event
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};
