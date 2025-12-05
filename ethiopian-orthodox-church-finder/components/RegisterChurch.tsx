import React, { useState } from 'react';
import { Upload, Check } from 'lucide-react';

interface RegisterChurchProps {
  onCancel: () => void;
}

export const RegisterChurch: React.FC<RegisterChurchProps> = ({ onCancel }) => {
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-green-100 text-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Submitted!</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Thank you for registering your parish. Our team will review your verification documents and approve your listing within 48 hours. You will receive an email with login instructions.
        </p>
        <button 
          onClick={onCancel}
          className="bg-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Register Your Church</h1>
        <p className="text-gray-600 mt-2">
          Join our centralized directory to connect with the faithful in your community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Church Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Official Church Name</label>
                <input type="text" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700">Address</label>
                 <input type="text" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Zip</label>
                    <input type="text" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border" />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 pt-4">Administrator Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700">Email Address</label>
                 <input type="email" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border" />
              </div>
            </div>
          </div>

          {/* Verification */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 pt-4">Verification</h3>
            <p className="text-sm text-gray-500 mb-4">
              To prevent fraud, please upload a document showing authorization (e.g., Letter from Diocese, Tax Exempt Form).
            </p>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    Upload a file
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button 
                type="button" 
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
                Submit Registration
            </button>
        </div>
      </form>
    </div>
  );
};
