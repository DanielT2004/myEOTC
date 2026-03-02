import React, { useState } from 'react';
import { X, Mail, Loader2, CheckCircle } from 'lucide-react';
import { subscribeToChurch, isValidEmail, type SubscribeResult } from '../services/subscribeService';

interface SubscribeModalProps {
  churchId: string;
  churchName: string;
  onClose: () => void;
}

const ERROR_MESSAGES: Record<'invalid_email' | 'already_subscribed' | 'network_error', string> = {
  invalid_email: 'Please enter a valid email address.',
  already_subscribed: 'This email is already subscribed to notifications for this church.',
  network_error: 'Something went wrong. Please try again.',
};

export const SubscribeModal: React.FC<SubscribeModalProps> = ({
  churchId,
  churchName,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubscribeResult | null>(null);

  const showInvalidEmail = touched && email.length > 0 && !isValidEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValidEmail(email.trim())) {
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await subscribeToChurch(email.trim(), churchId);
      setResult(res);
    } catch (err) {
      console.warn('[SubscribeModal] Subscribe failed:', err);
      setResult({ success: false, error: 'network_error' });
    } finally {
      setSubmitting(false);
    }
  };

  const success = result?.success === true;
  const errorMessage = result && !result.success ? ERROR_MESSAGES[result.error] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Get notifications</h3>
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
            Enter your email to receive event notifications from {churchName}.
          </p>

          {success ? (
            <div className="flex items-center gap-3 py-4 text-green-700 bg-green-50 rounded-lg px-4">
              <CheckCircle className="h-6 w-6 flex-shrink-0" />
              <p className="font-medium">You're subscribed! You'll get emails when new events are posted.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="subscribe-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="subscribe-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setResult(null);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 ${
                      showInvalidEmail || errorMessage
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    autoComplete="email"
                    disabled={submitting}
                  />
                </div>
                {showInvalidEmail && (
                  <p className="mt-1 text-sm text-red-600">Please enter a valid email address.</p>
                )}
                {errorMessage && (
                  <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subscribing…
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
