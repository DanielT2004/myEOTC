import React, { useState, useEffect } from 'react';
import { ChurchEvent } from '../types';
import { X, Calendar, MapPin, FileText, Send, Loader2, Mail, Users } from 'lucide-react';
import { getChurchSubscribers } from '../services/subscribeService';

interface NotifyMembersConfirmModalProps {
  event: ChurchEvent;
  churchName: string;
  churchId: string;
  onSend: (subscribers: string[]) => Promise<void>;
  onClose: () => void;
}

export const NotifyMembersConfirmModal: React.FC<NotifyMembersConfirmModalProps> = ({
  event,
  churchName,
  churchId,
  onSend,
  onClose,
}) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);

  useEffect(() => {
    if (!churchId) {
      setLoadingSubscribers(false);
      return;
    }
    getChurchSubscribers(churchId)
      .then(setSubscribers)
      .catch(() => setSubscribers([]))
      .finally(() => setLoadingSubscribers(false));
  }, [churchId]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      await onSend(subscribers);
      setSent(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      console.warn('[NotifyMembersConfirmModal] Send failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const eventDate = event.date ? new Date(event.date).toLocaleString() : '';
  const count = subscribers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Notify members</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Review the event details and recipient list, then click Send email.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event details - left */}
            <div className="space-y-3 text-sm border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div>
                <span className="font-medium text-gray-700">Title</span>
                <p className="text-slate-900 mt-0.5">{event.title}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type</span>
                <p className="text-slate-900 mt-0.5">{event.type}</p>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Date & time</span>
                  <p className="text-slate-900 mt-0.5">{eventDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Location</span>
                  <p className="text-slate-900 mt-0.5">{event.location || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Description</span>
                  <p className="text-slate-900 mt-0.5 whitespace-pre-wrap line-clamp-4">{event.description || '—'}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Church</span>
                <p className="text-slate-900 mt-0.5">{churchName || event.churchName || '—'}</p>
              </div>
            </div>

            {/* Email list - right */}
            <div className="border border-gray-200 rounded-lg bg-slate-50/50 overflow-hidden flex flex-col min-h-[200px]">
              <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600" />
                <span className="font-semibold text-slate-900">
                  {loadingSubscribers ? (
                    <span className="text-gray-500">Loading…</span>
                  ) : (
                    <>
                      <span className="text-green-600 tabular-nums">{count}</span>
                      <span className="font-medium text-gray-600 ml-1">
                        {count === 1 ? 'recipient' : 'recipients'}
                      </span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 min-h-0 max-h-48">
                {loadingSubscribers ? (
                  <div className="flex items-center justify-center py-8 text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : count === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Mail className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No subscribers yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add subscribers via Get Notifications on the church page</p>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {subscribers.map((email, i) => (
                      <li
                        key={`${email}-${i}`}
                        className="text-sm text-slate-700 py-1.5 px-2 rounded-md hover:bg-white/60 truncate"
                        title={email}
                      >
                        {email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : sent ? (
              'Sent!'
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send email
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
