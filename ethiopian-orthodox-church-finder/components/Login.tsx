import React, { useState } from 'react';
import { X, AlertCircle, Mail } from 'lucide-react';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onClose, onSwitchToSignUp, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const isEmailNotConfirmed = error?.toLowerCase().includes('email not confirmed') || 
                               error?.toLowerCase().includes('email_not_confirmed');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailSent(false);
    setLoading(true);

    try {
      await authService.signIn({ email, password });
      onSuccess();
      onClose();
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to sign in. Please check your credentials.';
      
      // Provide more helpful message for email confirmation
      if (err.message?.toLowerCase().includes('email not confirmed') || 
          err.message?.toLowerCase().includes('email_not_confirmed')) {
        errorMessage = 'Please confirm your email address before signing in. Check your inbox for the confirmation link.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResendingEmail(true);
    setError('');
    
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) throw resendError;
      
      setEmailSent(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">Sign In</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2 text-red-700">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm">{error}</p>
                {isEmailNotConfirmed && (
                  <button
                    onClick={handleResendConfirmation}
                    disabled={resendingEmail || emailSent}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Mail size={14} />
                    {emailSent ? 'Confirmation email sent! Check your inbox.' : resendingEmail ? 'Sending...' : 'Resend confirmation email'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 px-4 rounded-md font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

