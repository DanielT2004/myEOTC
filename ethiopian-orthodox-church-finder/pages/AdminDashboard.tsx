import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Loader2, AlertCircle } from 'lucide-react';
import { churchService } from '../services/churchService';
import { Church, ChurchStatus } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadChurches();
  }, [filter]);

  const loadChurches = async () => {
    setLoading(true);
    setError('');
    try {
      let data: Church[];
      if (filter === 'pending') {
        data = await churchService.getPendingChurches();
      } else {
        data = await churchService.getAllChurchesForAdmin();
      }
      setChurches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load churches');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (churchId: string, status: ChurchStatus) => {
    setProcessingId(churchId);
    try {
      await churchService.updateChurchStatus(churchId, status);
      await loadChurches();
    } catch (err: any) {
      setError(err.message || 'Failed to update church status');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredChurches = filter === 'all' 
    ? churches 
    : churches.filter(c => c.status === filter);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Review and approve church registrations</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2 border-b border-gray-200">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === f
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && churches.filter(c => c.status === 'pending').length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {churches.filter(c => c.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredChurches.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No churches found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChurches.map((church) => (
            <div
              key={church.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900">{church.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        church.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : church.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {church.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {church.address}, {church.city}, {church.state} {church.zip}
                  </p>
                  {church.phone && (
                    <p className="text-gray-600 mb-2">Phone: {church.phone}</p>
                  )}
                  {church.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{church.description}</p>
                  )}
                  {church.verificationDocumentUrl && (
                    <a
                      href={church.verificationDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <Eye size={16} />
                      View Verification Document
                    </a>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {church.created_at ? new Date(church.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                {church.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleStatusUpdate(church.id, 'approved')}
                      disabled={processingId === church.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processingId === church.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(church.id, 'rejected')}
                      disabled={processingId === church.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processingId === church.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X size={16} />
                      )}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

