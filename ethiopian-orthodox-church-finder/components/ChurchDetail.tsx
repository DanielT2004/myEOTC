
import React, { useState } from 'react';
import { Church, ChurchEvent } from '../types';
import { MapPin, Phone, ArrowLeft, CheckCircle, CreditCard, Calendar, Clock, Globe, Accessibility, Car, BookOpen, Edit, Plus, AlertCircle, Bell } from 'lucide-react';
import { EventCard } from './EventCard';
import { NotifyMembersConfirmModal } from './NotifyMembersConfirmModal';
import { SubscribeModal } from './SubscribeModal';
import { sendEventNotificationEmail } from '../services/courierService';
import { eventService } from '../services/eventService';
import { DEFAULT_CHURCH_IMAGE, DEFAULT_CLERGY_IMAGE } from '../constants';

interface ChurchDetailProps {
  church: Church;
  onBack: () => void;
  onViewEventDetails?: (event: ChurchEvent) => void;
  isAdmin?: boolean;
  onEditChurch?: () => void;
  onAddEvent?: () => void;
  /** Called after an event notification is sent so the parent can refresh events (e.g. update notificationSentAt). */
  onEventUpdated?: (event: ChurchEvent) => void | Promise<void>;
}

export const ChurchDetail: React.FC<ChurchDetailProps> = ({ church, onBack, onViewEventDetails, isAdmin, onEditChurch, onAddEvent, onEventUpdated }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clergy' | 'events' | 'donate'>('overview');
  const [notifyEvent, setNotifyEvent] = useState<ChurchEvent | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Header Image */}
      <div className="h-64 md:h-80 w-full relative bg-gray-900">
        <img 
          src={church.imageUrl || DEFAULT_CHURCH_IMAGE} 
          alt={church.name} 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-8 md:left-8 z-10">
          <button 
            type="button"
            onClick={onBack}
            className="flex items-center px-3 py-2 sm:px-4 sm:py-2.5 min-h-[40px] sm:min-h-[44px] bg-white/90 backdrop-blur text-slate-900 rounded-full text-xs sm:text-sm font-semibold hover:bg-white transition-colors touch-manipulation"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> Back
          </button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-10 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              {church.status === 'pending' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-amber-100 text-amber-800 mb-1.5 sm:mb-2">
                  <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Pending approval
                </span>
              )}
              {church.isVerified && church.status !== 'pending' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800 mb-1.5 sm:mb-2">
                  <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" /> Verified Church
                </span>
              )}
              <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-1 sm:mb-2 leading-tight">{church.name}</h1>
              <p className="text-gray-200 flex items-center text-sm sm:text-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" /> <span className="truncate">{church.address}, {church.city}</span>
              </p>
            </div>
            <div className="mt-3 sm:mt-4 md:mt-0 flex flex-nowrap shrink-0 gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide scroll-touch pb-1 -mx-1 px-1">
              {isAdmin && onEditChurch && onAddEvent ? (
                <>
                  <button 
                    type="button"
                    onClick={onEditChurch}
                    className="flex items-center px-3 py-2 sm:px-5 sm:py-3 min-h-[38px] sm:min-h-[44px] bg-blue-600 text-white rounded-lg text-xs sm:text-base font-bold hover:bg-blue-700 transition-colors shadow-lg touch-manipulation whitespace-nowrap"
                  >
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    Edit Church
                  </button>
                  <button 
                    type="button"
                    onClick={onAddEvent}
                    className="flex items-center px-3 py-2 sm:px-5 sm:py-3 min-h-[38px] sm:min-h-[44px] bg-green-600 text-white rounded-lg text-xs sm:text-base font-bold hover:bg-green-700 transition-colors shadow-lg touch-manipulation whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    Add Event
                  </button>
                  {church.status === 'approved' && (
                    <button 
                      type="button"
                      onClick={() => setShowSubscribeModal(true)}
                      className="flex items-center px-3 py-2 sm:px-5 sm:py-3 min-h-[38px] sm:min-h-[44px] bg-white/90 backdrop-blur text-slate-900 rounded-lg text-xs sm:text-base font-bold hover:bg-white transition-colors shadow-lg touch-manipulation whitespace-nowrap"
                    >
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                      Get Notifications
                    </button>
                  )}
                </>
              ) : (
                <>
                  {church.status === 'approved' && (
                    <button 
                      type="button"
                      onClick={() => setShowSubscribeModal(true)}
                      className="flex items-center px-3 py-2 sm:px-5 sm:py-3 min-h-[38px] sm:min-h-[44px] bg-white/90 backdrop-blur text-slate-900 rounded-lg text-xs sm:text-base font-bold hover:bg-white transition-colors shadow-lg touch-manipulation whitespace-nowrap"
                    >
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                      Get Notifications
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => setActiveTab('donate')}
                    className="flex items-center px-3 py-2 sm:px-5 sm:py-3 min-h-[38px] sm:min-h-[44px] bg-blue-600 text-white rounded-lg text-xs sm:text-base font-bold hover:bg-blue-700 transition-colors shadow-lg touch-manipulation whitespace-nowrap"
                  >
                    Donate
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pending approval banner - shown to everyone when church is pending */}
      {church.status === 'pending' && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-amber-900 text-sm sm:text-base">
                  {isAdmin ? 'Your church is pending approval' : 'This listing is pending approval'}
                </p>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                  {isAdmin
                    ? "Our team will review your submission. You'll be able to edit information and add events once your church is approved."
                    : 'This church listing is under review and will be visible to everyone once approved.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs - horizontal scroll on mobile */}
      <div className="border-b border-gray-200 sticky top-14 sm:top-16 bg-white z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex overflow-x-auto scrollbar-hide scroll-touch gap-0 sm:space-x-8 sm:gap-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {['overview', 'clergy', 'events', 'donate'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as any)}
                className={`
                  flex-shrink-0 whitespace-nowrap py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm uppercase tracking-wide min-h-[42px] sm:min-h-[48px] touch-manipulation
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 md:mt-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            <div className="md:col-span-2 space-y-5 sm:space-y-8">
              {/* About Section */}
              <section>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">About Our Parish</h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-lg">{church.description}</p>
                
                {/* Features Badges */}
                <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
                  {church.features.hasEnglishService && (
                     <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100">
                        <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" /> English Service
                     </span>
                  )}
                  {church.features.wheelchairAccessible && (
                     <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                        <Accessibility className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" /> Accessible
                     </span>
                  )}
                   {church.features.hasParking && (
                     <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        <Car className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" /> Parking
                     </span>
                  )}
                  {church.features.hasSchool && (
                     <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" /> Sunday School
                     </span>
                  )}
                </div>
              </section>

              {/* Detailed Service Schedule */}
              <section>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Service Schedule</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-100">
                        {church.serviceSchedule.map((schedule, idx) => (
                            <div key={idx} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center hover:bg-gray-50 transition-colors">
                                <div className="w-28 sm:w-32 flex-shrink-0 font-bold text-slate-900 text-sm sm:text-base mb-1 sm:mb-0">
                                    {schedule.day}
                                </div>
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between min-w-0">
                                    <div className="flex items-center text-blue-600 font-medium text-sm sm:text-base mb-1 sm:mb-0">
                                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                                        {schedule.time}
                                    </div>
                                    <div className="text-gray-500 text-xs sm:text-sm">
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
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Languages Spoken</h2>
                <div className="flex items-center text-gray-700 text-sm sm:text-base">
                     <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                     <span>{church.languages.join(", ")}</span>
                </div>
              </section>
            </div>

            {/* Sidebar Info */}
            <div className="md:col-span-1">
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Contact Info</h3>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start text-gray-600 text-sm sm:text-base">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                            <span>{church.address}<br/>{church.city}, {church.state} {church.zip}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm sm:text-base">
                            <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 flex-shrink-0" />
                            <span>{church.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'clergy' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Our Clergy</h2>
            {church.clergy.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {church.clergy.map((cleric) => (
                    <div key={cleric.id} className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 sm:mb-4 relative">
                        <img 
                            src={cleric.imageUrl || DEFAULT_CLERGY_IMAGE} 
                            alt={cleric.name} 
                            className="w-full h-full object-cover rounded-full border-4 border-gray-50"
                        />
                    </div>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-900 truncate" title={cleric.name}>{cleric.name}</h3>
                    <p className="text-blue-600 font-medium text-xs sm:text-sm truncate" title={cleric.role}>{cleric.role}</p>
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
          <div className="space-y-6 sm:space-y-10">
            {(() => {
              const now = new Date();
              const upcoming = church.events.filter(e => new Date(e.date) >= now);
              const previous = church.events.filter(e => new Date(e.date) < now);
              return (
                <>
                  <section>
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1 flex items-center gap-2">
                      <span className="w-1.5 h-4 sm:w-2 sm:h-6 bg-green-500 rounded-full flex-shrink-0" aria-hidden />
                      Upcoming Events
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Events that are still to come</p>
                    {upcoming.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {upcoming.map(event => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onViewDetails={onViewEventDetails}
                            onNotifyMembers={isAdmin ? (e) => setNotifyEvent(e) : undefined}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No upcoming events listed.</p>
                      </div>
                    )}
                  </section>
                  <section>
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1 flex items-center gap-2">
                      <span className="w-1.5 h-4 sm:w-2 sm:h-6 bg-gray-400 rounded-full flex-shrink-0" aria-hidden />
                      Previous Events
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Events that have already taken place</p>
                    {previous.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {previous.map(event => (
                          <EventCard key={event.id} event={event} onViewDetails={onViewEventDetails} isPast />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">No previous events.</p>
                      </div>
                    )}
                  </section>
                </>
              );
            })()}
          </div>
        )}

        {notifyEvent && (
          <NotifyMembersConfirmModal
            event={notifyEvent}
            churchName={church.name}
            churchId={church.id}
            onSend={async (subscribers) => {
              await sendEventNotificationEmail(notifyEvent, church.name, subscribers);
              await eventService.markEventNotificationSent(notifyEvent.id);
              await onEventUpdated?.(notifyEvent);
            }}
            onClose={() => setNotifyEvent(null)}
          />
        )}

        {showSubscribeModal && (
          <SubscribeModal
            churchId={church.id}
            churchName={church.name}
            onClose={() => setShowSubscribeModal(false)}
          />
        )}

        {activeTab === 'donate' && (
          <div className="max-w-2xl mx-auto">
             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 sm:p-8 text-center">
                <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-blue-600 mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-4">Support {church.name}</h2>
                <p className="text-gray-600 mb-5 sm:mb-8 text-sm sm:text-lg">
                    Your donations help us maintain our church building, support our clergy, and fund our community outreach programs.
                </p>
                
                {church.donationInfo.zelle && (
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-6">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2">Zelle Donation</h3>
                        <p className="text-lg sm:text-2xl font-mono text-slate-900 select-all break-all">{church.donationInfo.zelle}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 sm:mt-2">Send money directly using the email above.</p>
                    </div>
                )}
                
                {church.donationInfo.website && (
                    <a 
                        href={church.donationInfo.website} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-base rounded-xl transition-transform transform active:scale-95 shadow-lg touch-manipulation"
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
