import React, { useState, useEffect } from 'react';
import { Edit, Plus, Trash2, X, Save, Loader2, AlertCircle, Calendar, Eye, Bell } from 'lucide-react';
import { churchService } from '../services/churchService';
import { eventService } from '../services/eventService';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { geocodingService } from '../services/geocodingService';
import { Church, ChurchEvent } from '../types';
import { EVENT_TYPES } from '../constants';
import { ChurchFormFields, ChurchFormData, ClergyFormItem } from '../components/ChurchFormFields';
import { churchToFormData, formDataToChurch } from '../utils/churchFormUtils';
import { canShowEventsSectionInAdminDashboard } from '../utils/churchVisibility';
import { NotifyMembersConfirmModal } from '../components/NotifyMembersConfirmModal';
import { sendEventNotificationEmail } from '../services/courierService';

interface ChurchAdminDashboardProps {
  onBack: () => void;
  onViewProfile?: (church: Church) => void;
  onChurchUpdated?: (updatedChurch: Church) => void;
  initialChurchId?: string;
  initialShowEventForm?: boolean;
}

export const ChurchAdminDashboard: React.FC<ChurchAdminDashboardProps> = ({ onBack, onViewProfile, onChurchUpdated, initialChurchId, initialShowEventForm = false }) => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingChurch, setEditingChurch] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);

  // Church form state
  const [churchFormData, setChurchFormData] = useState<ChurchFormData | null>(null);
  const [churchImage, setChurchImage] = useState<File | null>(null);
  const [churchImagePreview, setChurchImagePreview] = useState<string>('');
  const [geocoding, setGeocoding] = useState(false);
  /** Parallel to formData.clergy: File to upload for new/replaced clergy photo, or null */
  const [clergyImageFiles, setClergyImageFiles] = useState<(File | null)[]>([]);

  // Event form state
  const [eventForm, setEventForm] = useState<Partial<ChurchEvent>>({
    title: '',
    type: '',
    date: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    description: '',
    imageUrl: '',
  });
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string>('');
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<ChurchEvent | null>(null);
  const [showNotifyConfirmModal, setShowNotifyConfirmModal] = useState(false);
  const [eventForNotify, setEventForNotify] = useState<ChurchEvent | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setError('You must be signed in');
        return;
      }

      const userChurches = await churchService.getChurchesForAdmin(user.id);
      setChurches(userChurches);

      if (userChurches.length > 0) {
        // If initialChurchId is provided, select that church, otherwise select the first one
        const churchToSelect = initialChurchId 
          ? userChurches.find(c => c.id === initialChurchId) || userChurches[0]
          : userChurches[0];
        setSelectedChurch(churchToSelect);
        await loadEvents(churchToSelect.id);
        
        // If initialShowEventForm is true, show the event form
        if (initialShowEventForm) {
          setEventForm({
            title: '',
            type: '',
            date: '',
            location: '',
            address: churchToSelect.address || '',
            city: churchToSelect.city || '',
            state: churchToSelect.state || '',
            zip: churchToSelect.zip || '',
            description: '',
            imageUrl: '',
            churchId: churchToSelect.id,
          });
          setEditingEvent(null);
          setEventImage(null);
          setEventImagePreview('');
          setShowEventForm(true);
        } else if (initialChurchId) {
          // If initialChurchId is provided and we're not showing event form, start edit mode
          const clergy = await churchService.getClergyForChurch(churchToSelect.id);
          const churchWithClergy = { ...churchToSelect, clergy };
          setSelectedChurch(churchWithClergy);
          const formData = churchToFormData(churchWithClergy);
          setChurchFormData(formData);
          setClergyImageFiles(formData.clergy.map(() => null));
          if (churchToSelect.imageUrl) {
            setChurchImagePreview(churchToSelect.imageUrl);
          } else {
            setChurchImagePreview('');
          }
          setChurchImage(null);
          setEditingChurch(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (churchId: string) => {
    try {
      console.log('[ChurchAdminDashboard] Loading events for church:', churchId);
      const churchEvents = await eventService.getEventsForChurch(churchId);
      console.log('[ChurchAdminDashboard] Events loaded:', churchEvents.length, churchEvents);
      setEvents(churchEvents);
    } catch (err: any) {
      console.error('[ChurchAdminDashboard] Error loading events:', err);
      console.error('[ChurchAdminDashboard] Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
      });
      setError(err.message || 'Failed to load events');
    }
  };

  const handleChurchSelect = async (church: Church) => {
    setSelectedChurch(church);
    setEditingChurch(false);
    await loadEvents(church.id);
  };

  const handleStartEditChurch = async () => {
    if (!selectedChurch) return;
    try {
      const clergy = await churchService.getClergyForChurch(selectedChurch.id);
      const churchWithClergy = { ...selectedChurch, clergy };
      setSelectedChurch(churchWithClergy);
      const formData = churchToFormData(churchWithClergy);
      setChurchFormData(formData);
      setClergyImageFiles(formData.clergy.map(() => null));

      if (selectedChurch.imageUrl) {
        setChurchImagePreview(selectedChurch.imageUrl);
      } else {
        setChurchImagePreview('');
      }
      setChurchImage(null);
      setEditingChurch(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load church details');
    }
  };

  const handleChurchImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setChurchImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setChurchImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setChurchImage(null);
    if (churchFormData?.imageUrl) {
      setChurchImagePreview(churchFormData.imageUrl);
    } else {
      setChurchImagePreview('');
    }
  };

  const handleAddServiceTime = () => {
    if (!churchFormData) return;
    setChurchFormData({
      ...churchFormData,
      serviceSchedule: [...churchFormData.serviceSchedule, { day: 'Sunday', startTime: '', endTime: '', description: '', repeat: 'Every Week' }]
    });
  };

  const handleRemoveServiceTime = (index: number) => {
    if (!churchFormData) return;
    setChurchFormData({
      ...churchFormData,
      serviceSchedule: churchFormData.serviceSchedule.filter((_, i) => i !== index)
    });
  };

  const handleUpdateServiceTime = (index: number, field: keyof typeof churchFormData.serviceSchedule[0], value: string) => {
    if (!churchFormData) return;
    const updated = [...churchFormData.serviceSchedule];
    updated[index] = { ...updated[index], [field]: value };
    setChurchFormData({ ...churchFormData, serviceSchedule: updated });
  };

  const handleAddClergy = () => {
    if (!churchFormData) return;
    setChurchFormData({
      ...churchFormData,
      clergy: [...churchFormData.clergy, { name: '', role: '', imageUrl: '' }],
    });
    setClergyImageFiles([...clergyImageFiles, null]);
  };

  const handleRemoveClergy = async (index: number) => {
    if (!churchFormData) return;
    const member = churchFormData.clergy[index];
    if (member?.id) {
      try {
        await churchService.deleteClergyMember(member.id);
        setSelectedChurch((prev) =>
          prev ? { ...prev, clergy: prev.clergy.filter((c) => c.id !== member.id) } : null
        );
      } catch (err: any) {
        setError(err.message || 'Failed to remove clergy from database');
        return;
      }
    }
    setChurchFormData({
      ...churchFormData,
      clergy: churchFormData.clergy.filter((_, i) => i !== index),
    });
    setClergyImageFiles(clergyImageFiles.filter((_, i) => i !== index));
  };

  const handleUpdateClergy = (index: number, field: keyof ClergyFormItem, value: string) => {
    if (!churchFormData) return;
    const updated = [...churchFormData.clergy];
    updated[index] = { ...updated[index], [field]: value };
    setChurchFormData({ ...churchFormData, clergy: updated });
  };

  const handleClergyImageChange = (index: number, file: File | null) => {
    setClergyImageFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    if (!churchFormData) return;
    const previewUrl = file ? URL.createObjectURL(file) : '';
    const updated = [...churchFormData.clergy];
    updated[index] = { ...updated[index], imageUrl: previewUrl };
    setChurchFormData({ ...churchFormData, clergy: updated });
  };

  const handleSaveChurch = async () => {
    if (!selectedChurch || !churchFormData) return;

    setLoading(true);
    setError('');
    
    try {
      // Validate required fields
      if (!churchFormData.name?.trim() || !churchFormData.address?.trim() || !churchFormData.city?.trim() || !churchFormData.state?.trim() || !churchFormData.zip?.trim()) {
        setError('Please fill in all required church information fields');
        setLoading(false);
        return;
      }

      // Validate service schedule
      const validServices = churchFormData.serviceSchedule.filter(s => s.day && s.startTime);
      if (validServices.length === 0) {
        setError('Please add at least one service time with day and start time.');
        setLoading(false);
        return;
      }

      // Validate languages
      const selectedLanguages = Object.keys(churchFormData.languages).filter(k => churchFormData.languages[k]);
      if (selectedLanguages.length === 0) {
        setError('Please select at least one language spoken at your church.');
        setLoading(false);
        return;
      }

      // Check if address changed - if so, geocode again
      const addressChanged = 
        churchFormData.address !== selectedChurch.address ||
        churchFormData.city !== selectedChurch.city ||
        churchFormData.state !== selectedChurch.state ||
        churchFormData.zip !== selectedChurch.zip;

      let coordinates = selectedChurch.coordinates;
      
      if (addressChanged) {
        setGeocoding(true);
        try {
          const geocodeResult = await geocodingService.geocodeAddressComponents(
            churchFormData.address,
            churchFormData.city,
            churchFormData.state,
            churchFormData.zip
          );
          coordinates = {
            lat: geocodeResult.lat,
            lng: geocodeResult.lng,
          };
        } catch (geocodeError: any) {
          setError(geocodeError.message || 'Failed to find location. Please check the address and try again.');
          setLoading(false);
          setGeocoding(false);
          return;
        } finally {
          setGeocoding(false);
        }
      }

      // Upload church image if provided
      let churchImageUrl = churchFormData.imageUrl || selectedChurch.imageUrl;
      if (churchImage) {
        try {
          churchImageUrl = await storageService.uploadChurchImage(churchImage, selectedChurch.id, 'main');
        } catch (storageError: any) {
          setError(storageError.message || 'Failed to upload church image. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Transform form data to church data
      const updateData = formDataToChurch(churchFormData);
      updateData.coordinates = coordinates;
      updateData.imageUrl = churchImageUrl;

      const updated = await churchService.updateChurch(selectedChurch.id, updateData);
      setSelectedChurch(updated);
      setChurches(churches.map(c => c.id === updated.id ? updated : c));

      // Sync clergy: delete removed, update existing (name/role/photo), add new
      const formClergyIds = new Set(churchFormData.clergy.filter((c) => c.id).map((c) => c.id!));
      const existingIds = (selectedChurch.clergy || []).map((c) => c.id);
      for (const id of existingIds) {
        if (!formClergyIds.has(id)) {
          await churchService.deleteClergyMember(id);
        }
      }
      for (let i = 0; i < churchFormData.clergy.length; i++) {
        const member = churchFormData.clergy[i];
        const file = clergyImageFiles[i];
        let imageUrl = member.imageUrl || '';
        // Only use existing imageUrl if it's a real URL (http/https), not a blob from preview
        if (imageUrl.startsWith('blob:')) imageUrl = '';
        if (file) {
          try {
            const uniqueKey = member.id ?? `new-${crypto.randomUUID()}`;
            imageUrl = await storageService.uploadClergyImage(file, selectedChurch.id, uniqueKey);
          } catch (e) {
            console.warn('Clergy image upload failed:', e);
          }
        }
        if (member.id) {
          await churchService.updateClergyMember(member.id, {
            name: member.name?.trim() || '',
            role: member.role?.trim() || '',
            imageUrl,
          });
        } else {
          if (!member.name?.trim() && !member.role?.trim()) continue;
          await churchService.addClergyMember(selectedChurch.id, {
            name: member.name?.trim() || '',
            role: member.role?.trim() || '',
            imageUrl,
          });
        }
      }
      const clergyAfter = await churchService.getClergyForChurch(selectedChurch.id);
      const updatedWithClergy = { ...updated, clergy: clergyAfter };
      setSelectedChurch(updatedWithClergy);
      setChurches(churches.map(c => c.id === updated.id ? updatedWithClergy : c));

      if (onChurchUpdated) {
        onChurchUpdated(updatedWithClergy);
      }

      setEditingChurch(false);
      setChurchImage(null);
      setChurchImagePreview('');
      setChurchFormData(null);
      setClergyImageFiles([]);
    } catch (err: any) {
      setError(err.message || 'Failed to update church');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditChurch = () => {
    setEditingChurch(false);
    setChurchFormData(null);
    setChurchImage(null);
    setChurchImagePreview('');
    setClergyImageFiles([]);
  };

  const handleStartAddEvent = () => {
    setEventForm({
      title: '',
      type: '',
      date: '',
      location: '',
      address: selectedChurch?.address || '',
      city: selectedChurch?.city || '',
      state: selectedChurch?.state || '',
      zip: selectedChurch?.zip || '',
      description: '',
      imageUrl: '',
      churchId: selectedChurch?.id,
    });
    setEditingEvent(null);
    setEventImage(null);
    setEventImagePreview('');
    setShowEventForm(true);
  };

  const handleStartEditEvent = (event: ChurchEvent) => {
    setEventForm({ ...event });
    setEditingEvent(event);
    setEventImage(null);
    setEventImagePreview(event.imageUrl || '');
    setShowEventForm(true);
  };

  const handleSaveEvent = async () => {
    if (!selectedChurch) return;

    // Required fields validation
    const title = (eventForm.title ?? '').trim();
    const type = (eventForm.type ?? '').trim();
    const description = (eventForm.description ?? '').trim();
    const date = eventForm.date ?? '';

    if (!title) {
      setError('Event title is required.');
      return;
    }
    if (!type) {
      setError('Event type is required.');
      return;
    }
    if (!description) {
      setError('Event description is required.');
      return;
    }
    if (!date) {
      setError('Date and time are required.');
      return;
    }

    const eventDate = new Date(date);
    if (eventDate.getTime() < Date.now()) {
      setError('Event date and time must be in the future.');
      return;
    }

    const address = (eventForm.address ?? '').trim();
    const city = (eventForm.city ?? '').trim();
    const stateVal = (eventForm.state ?? '').trim();
    const zipVal = (eventForm.zip ?? '').trim();
    const locationStr = (eventForm.location ?? '').trim();
    const hasStructured = address && city && stateVal && zipVal;
    const hasLegacyLocation = !!locationStr;
    if (!hasStructured && !hasLegacyLocation) {
      setError('Please provide full address (street, city, state, ZIP).');
      return;
    }
    if (!editingEvent && !hasStructured) {
      setError('New events require full address (street, city, state, ZIP). Use the pre-filled church address or edit as needed.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (editingEvent) {
        let imageUrl = eventForm.imageUrl ?? editingEvent.imageUrl ?? '';
        if (eventImage) {
          imageUrl = await storageService.uploadEventImage(eventImage, editingEvent.id);
        }
        await eventService.updateEvent(editingEvent.id, {
          ...eventForm,
          imageUrl,
          ...(hasStructured ? { address, city, state: stateVal, zip: zipVal, location: undefined } : { location: locationStr, address: undefined, city: undefined, state: undefined, zip: undefined }),
        });
      } else {
        const created = await eventService.createEvent({
          ...eventForm,
          title,
          type,
          description,
          date,
          churchId: selectedChurch.id,
          ...(hasStructured ? { address, city, state: stateVal, zip: zipVal } : { location: locationStr }),
          imageUrl: '',
        });
        let eventToShow = created;
        if (eventImage && created?.id) {
          const imageUrl = await storageService.uploadEventImage(eventImage, created.id);
          await eventService.updateEvent(created.id, { imageUrl });
          eventToShow = { ...created, imageUrl };
        }
        setCreatedEvent(eventToShow ?? null);
        setShowCreateSuccessModal(true);
      }
      await loadEvents(selectedChurch.id);
      setShowEventForm(false);
      setEditingEvent(null);
      setEventForm({
        title: '',
        type: '',
        date: '',
        location: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        description: '',
        imageUrl: '',
      });
      setEventImage(null);
      setEventImagePreview('');
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setLoading(true);
    try {
      await eventService.deleteEvent(eventId);
      await loadEvents(selectedChurch!.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  if (loading && churches.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (churches.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          ← Back
        </button>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You don't have any churches registered yet.</p>
          <p className="text-gray-500">Register a church to start managing it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Church Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your church information and events</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Church Selection/Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Your Churches</h3>
            <div className="space-y-2">
              {churches.map((church) => (
                <button
                  key={church.id}
                  onClick={() => handleChurchSelect(church)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedChurch?.id === church.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-medium text-slate-900">{church.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{church.city}, {church.state}</p>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${
                      church.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : church.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {church.status?.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {selectedChurch && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedChurch.name}</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedChurch.address}, {selectedChurch.city}, {selectedChurch.state} {selectedChurch.zip}
                  </p>
                </div>
                {!editingChurch && canShowEventsSectionInAdminDashboard(selectedChurch) && (
                  <div className="flex gap-2">
                    {onViewProfile && (
                      <button
                        onClick={() => onViewProfile(selectedChurch)}
                        className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Profile
                      </button>
                    )}
                  <button
                    onClick={handleStartEditChurch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Church
                  </button>
                  </div>
                )}
              </div>

              {editingChurch && churchFormData ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Edit Church Information</h3>
                  
                  <ChurchFormFields
                    formData={churchFormData}
                    onFormDataChange={(data) => setChurchFormData({ ...churchFormData, ...data })}
                    churchImage={churchImage}
                    churchImagePreview={churchImagePreview}
                    onImageChange={handleChurchImageChange}
                    onImageRemove={handleImageRemove}
                    onAddServiceTime={handleAddServiceTime}
                    onRemoveServiceTime={handleRemoveServiceTime}
                    onUpdateServiceTime={handleUpdateServiceTime}
                    onAddClergy={handleAddClergy}
                    onRemoveClergy={handleRemoveClergy}
                    onUpdateClergy={handleUpdateClergy}
                    onClergyImageChange={handleClergyImageChange}
                    showImageUpload={true}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={handleSaveChurch}
                      disabled={loading || geocoding}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading || geocoding ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {geocoding ? 'Finding location...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEditChurch}
                      disabled={loading || geocoding}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-2 disabled:opacity-50"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {selectedChurch.status !== 'approved' && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800">
                        Your church is {selectedChurch.status}. Once approved, you'll be able to edit information and add events.
                      </p>
                    </div>
                  )}

                  {/* Events Section */}
                  {canShowEventsSectionInAdminDashboard(selectedChurch) && (
                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-slate-900">Events</h3>
                        <button
                          onClick={handleStartAddEvent}
                          className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add Event
                        </button>
                      </div>

                      {showEventForm && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="font-semibold mb-4">
                            {editingEvent ? 'Edit Event' : 'New Event'}
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                              <input
                                type="text"
                                value={eventForm.title || ''}
                                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                                <select
                                  value={eventForm.type || ''}
                                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                  <option value="">Select type</option>
                                  {EVENT_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                                <input
                                  type="datetime-local"
                                  min={(() => {
                                    const n = new Date();
                                    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}T${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
                                  })()}
                                  value={eventForm.date ? (() => {
                                    const d = new Date(eventForm.date);
                                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                                  })() : ''}
                                  onChange={(e) => setEventForm({ ...eventForm, date: new Date(e.target.value).toISOString() })}
                                  required
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                                <p className="text-xs text-gray-500 mt-1">Only future dates are allowed.</p>
                              </div>
                            </div>
                            {eventForm.address || eventForm.city || eventForm.state || eventForm.zip ? (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                                  <input
                                    type="text"
                                    value={eventForm.address || ''}
                                    onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                                    placeholder="Street address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                    <input
                                      type="text"
                                      value={eventForm.city || ''}
                                      onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                    <input
                                      type="text"
                                      value={eventForm.state || ''}
                                      onChange={(e) => setEventForm({ ...eventForm, state: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP *</label>
                                    <input
                                      type="text"
                                      value={eventForm.zip || ''}
                                      onChange={(e) => setEventForm({ ...eventForm, zip: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                <input
                                  type="text"
                                  value={eventForm.location || ''}
                                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                  placeholder="Full address or location (e.g. 123 Main St, City, State 12345)"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                                <p className="text-xs text-gray-500 mt-1">For better searchability, switch to address fields by adding address, city, state, and ZIP.</p>
                              </div>
                            )}
                            {selectedChurch && (eventForm.address || eventForm.city) && (
                              <p className="text-xs text-gray-500 -mt-2">Pre-filled from your church. Edit if the event is at a different location.</p>
                            )}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                              <textarea
                                value={eventForm.description || ''}
                                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                required
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setEventImage(file);
                                    setEventImagePreview(URL.createObjectURL(file));
                                  } else {
                                    setEventImage(null);
                                    setEventImagePreview(editingEvent?.imageUrl ?? '');
                                  }
                                  e.target.value = '';
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
                              />
                              {eventImagePreview && (
                                <div className="mt-2">
                                  <img
                                    src={eventImagePreview}
                                    alt="Event preview"
                                    className="h-24 w-auto rounded border border-gray-200 object-cover"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">{eventImage?.name ?? 'Current image'}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEvent}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                              >
                                <Save size={16} />
                                Save Event
                              </button>
                              <button
                                onClick={() => {
                                  setShowEventForm(false);
                                  setEditingEvent(null);
                                  setEventForm({
                                    title: '',
                                    type: '',
                                    date: '',
                                    location: '',
                                    address: '',
                                    city: '',
                                    state: '',
                                    zip: '',
                                    description: '',
                                    imageUrl: '',
                                  });
                                  setEventImage(null);
                                  setEventImagePreview('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-2"
                              >
                                <X size={16} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {events.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No events yet. Add your first event!</p>
                      ) : (
                        <div className="space-y-4">
                          {events.map((event) => {
                            const isUpcoming = new Date(event.date) >= new Date();
                            return (
                              <div
                                key={event.id}
                                className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <h4 className="font-semibold text-slate-900">{event.title}</h4>
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                      {event.type}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    {new Date(event.date).toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-2">{event.location}</p>
                                  <p className="text-sm text-gray-700">{event.description}</p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  {isUpcoming && (
                                    event.notificationSentAt ? (
                                      <span
                                        className="p-2 text-gray-400 rounded cursor-not-allowed"
                                        title={`Notified ${new Date(event.notificationSentAt).toLocaleString()}`}
                                      >
                                        <Bell size={16} />
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEventForNotify(event);
                                          setShowNotifyConfirmModal(true);
                                        }}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                                        title="Notify members"
                                      >
                                        <Bell size={16} />
                                      </button>
                                    )
                                  )}
                                  <button
                                    onClick={() => handleStartEditEvent(event)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success modal after creating event */}
      {showCreateSuccessModal && createdEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true" role="dialog">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Successfully created event</h3>
            <p className="text-gray-600 mb-6">Please notify members.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateSuccessModal(false);
                  setEventForNotify(createdEvent);
                  setShowNotifyConfirmModal(true);
                  setCreatedEvent(null);
                }}
                className="flex-1 py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
              >
                Notify members
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateSuccessModal(false);
                  setCreatedEvent(null);
                }}
                className="py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm & send email modal */}
      {showNotifyConfirmModal && eventForNotify && selectedChurch && (
        <NotifyMembersConfirmModal
          event={eventForNotify}
          churchName={selectedChurch.name}
          churchId={selectedChurch.id}
          onSend={async (subscribers) => {
            await sendEventNotificationEmail(eventForNotify, selectedChurch.name, subscribers);
            await eventService.markEventNotificationSent(eventForNotify.id);
            await loadEvents(selectedChurch.id);
          }}
          onClose={() => {
            setShowNotifyConfirmModal(false);
            setEventForNotify(null);
          }}
        />
      )}
    </div>
  );
};

