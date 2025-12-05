
import React, { useState } from 'react';
import { Church } from '../types';
import { MapPin, Phone, ArrowLeft, Heart, CheckCircle, CreditCard, Calendar, Clock, Globe, Info, Accessibility, Car, BookOpen } from 'lucide-react';
import { EventCard } from './EventCard';

interface ChurchDetailProps {
  church: Church;
  onBack: () => void;
  onToggleFollow: (id: string) => void;
  isFollowing: boolean;
}

export const ChurchDetail: React.FC<ChurchDetailProps> = ({ church, onBack, onToggleFollow, isFollowing }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clergy' | 'events' | 'donate'>('overview');

  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Header Image */}
      <div className="h-64 md:h-80 w-full relative bg-gray-900">
        <img 
          src={church.interiorImageUrl || church.imageUrl} 
          alt={church.name} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10">
          <button 
            onClick={onBack}
            className="flex items-center px-4 py-2 bg-white/90 backdrop-blur text-slate-900 rounded-full text-sm font-semibold hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end">
            <div>
              {church.isVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                  <CheckCircle className="h-3 w-3 mr-1" /> Verified Church
                </span>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{church.name}</h1>
              <p className="text-gray-200 flex items-center text-lg">
                <MapPin className="h-5 w-5 mr-2" /> {church.address}, {church.city}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={() => onToggleFollow(church.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-bold transition-colors ${isFollowing ? 'bg-white text-red-500' : 'bg-transparent border border-white text-white hover:bg-white/10'}`}
              >
                <Heart className={`h-5 w-5 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button 
                onClick={() => setActiveTab('donate')}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Donate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 sticky top-16 bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'clergy', 'events', 'donate'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wide
                  ${activeTab === tab 
                    ? 'border-slate-900 text-slate-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* About Section */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About Our Parish</h2>
                <p className="text-gray-600 leading-relaxed text-lg">{church.description}</p>
                
                {/* Features Badges */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {church.features.hasEnglishService && (
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100">
                        <Globe className="h-3.5 w-3.5 mr-1.5" /> English Service
                     </span>
                  )}
                  {church.features.wheelchairAccessible && (
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                        <Accessibility className="h-3.5 w-3.5 mr-1.5" /> Accessible
                     </span>
                  )}
                   {church.features.hasParking && (
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        <Car className="h-3.5 w-3.5 mr-1.5" /> Parking Available
                     </span>
                  )}
                  {church.features.hasSchool && (
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Sunday School
                     </span>
                  )}
                </div>
              </section>

              {/* Detailed Service Schedule */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Schedule</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100">
                        {church.serviceSchedule.map((schedule, idx) => (
                            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center hover:bg-gray-50 transition-colors">
                                <div className="w-32 flex-shrink-0 font-bold text-slate-900 mb-1 sm:mb-0">
                                    {schedule.day}
                                </div>
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center text-blue-600 font-medium mb-1 sm:mb-0">
                                        <Clock className="h-4 w-4 mr-2" />
                                        {schedule.time}
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                        {schedule.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </section>

               {/* Languages */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Languages Spoken</h2>
                <div className="flex items-center text-gray-700">
                     <Globe className="h-5 w-5 mr-3 text-gray-400" />
                     <span>{church.languages.join(", ")}</span>
                </div>
              </section>
            </div>

            {/* Sidebar Info */}
            <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Info</h3>
                    <div className="space-y-4">
                        <div className="flex items-start text-gray-600">
                            <MapPin className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                            <span>{church.address}<br/>{church.city}, {church.state} {church.zip}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Phone className="h-5 w-5 mr-3 flex-shrink-0" />
                            <span>{church.phone}</span>
                        </div>
                        
                        <hr className="border-gray-100 my-2" />
                        
                         <div className="flex items-start text-gray-600">
                            <Info className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <span className="block text-xs font-bold uppercase text-gray-400">Parish Size</span>
                                <span>{church.members} Members</span>
                            </div>
                        </div>

                        <button className="w-full mt-4 bg-slate-900 text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                            Get Directions
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'clergy' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Clergy</h2>
            {church.clergy.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {church.clergy.map((cleric) => (
                    <div key={cleric.id} className="bg-white border border-gray-100 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-24 h-24 mx-auto mb-4 relative">
                        <img 
                            src={cleric.imageUrl} 
                            alt={cleric.name} 
                            className="w-full h-full object-cover rounded-full border-4 border-gray-50"
                        />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{cleric.name}</h3>
                    <p className="text-blue-600 font-medium text-sm">{cleric.role}</p>
                    </div>
                ))}
                </div>
            ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg text-gray-500">
                    No clergy information has been added for this church yet.
                </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
             <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
             {church.events.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {church.events.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                 </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No upcoming events listed.</p>
                </div>
             )}
          </div>
        )}

        {activeTab === 'donate' && (
          <div className="max-w-2xl mx-auto">
             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Support {church.name}</h2>
                <p className="text-gray-600 mb-8 text-lg">
                    Your donations help us maintain our church building, support our clergy, and fund our community outreach programs.
                </p>
                
                {church.donationInfo.zelle && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Zelle Donation</h3>
                        <p className="text-2xl font-mono text-slate-900 select-all">{church.donationInfo.zelle}</p>
                        <p className="text-xs text-gray-400 mt-2">Send money directly using the email above.</p>
                    </div>
                )}
                
                {church.donationInfo.website && (
                    <a 
                        href={church.donationInfo.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-transform transform active:scale-95 shadow-lg"
                    >
                        Go to Donation Page
                    </a>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
