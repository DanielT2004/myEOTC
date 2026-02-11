import React, { useState, useEffect } from 'react';
import { Upload, Check, AlertCircle, Loader2, ArrowRight, ArrowLeft, X, Plus, Trash2 } from 'lucide-react';
import { churchService } from '../services/churchService';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { geocodingService } from '../services/geocodingService';
import { Church, ServiceTime } from '../types';
import { SPECIAL_PROGRAMS, DAYS_OF_WEEK, REPEAT_OPTIONS, LANGUAGES } from '../constants';

interface RegisterChurchProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

interface ServiceScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  description: string;
  repeat: string;
}

export const RegisterChurch: React.FC<RegisterChurchProps> = ({ onCancel, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Step 1: Admin Information
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  // Step 2: Church Information
  const [churchName, setChurchName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [churchPhone, setChurchPhone] = useState('');
  const [description, setDescription] = useState('');
  const [churchImage, setChurchImage] = useState<File | null>(null);
  const [churchImagePreview, setChurchImagePreview] = useState<string>('');
  const [geocoding, setGeocoding] = useState(false);

  // Step 3: Church Details
  const [serviceSchedule, setServiceSchedule] = useState<ServiceScheduleItem[]>([
    { day: 'Sunday', startTime: '', endTime: '', description: '', repeat: 'Every Week' }
  ]);
  const [specialPrograms, setSpecialPrograms] = useState<Record<string, boolean>>({});
  const [languages, setLanguages] = useState<Record<string, boolean>>({});
  const [features, setFeatures] = useState({
    hasEnglishService: false,
    hasParking: false,
    wheelchairAccessible: false,
    hasSchool: false,
  });

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const profile = await authService.getCurrentProfile();
          if (profile) {
            setUserProfile(profile);
            setAdminName(profile.full_name || '');
            setAdminEmail(profile.email || '');
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  // Helper function to format time from 24-hour to readable format
  const formatTime = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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

  const addServiceTime = () => {
    setServiceSchedule([...serviceSchedule, { day: 'Sunday', startTime: '', endTime: '', description: '', repeat: 'Every Week' }]);
  };

  const removeServiceTime = (index: number) => {
    setServiceSchedule(serviceSchedule.filter((_, i) => i !== index));
  };

  const updateServiceTime = (index: number, field: keyof ServiceScheduleItem, value: string) => {
    const updated = [...serviceSchedule];
    updated[index] = { ...updated[index], [field]: value };
    setServiceSchedule(updated);
  };

  const handleNext = () => {
    setError('');
    
    if (step === 1) {
      // Validate admin information
      if (!adminPhone.trim()) {
        setError('Please enter your phone number');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate church information
      if (!churchName.trim() || !address.trim() || !city.trim() || !state.trim() || !zip.trim()) {
        setError('Please fill in all required church information fields');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if user is authenticated
      const user = await authService.getCurrentUser();
      if (!user) {
        setError('You must be signed in to register a church. Please sign in first.');
        setLoading(false);
        return;
      }

      // Validate step 3 requirements
      const validServices = serviceSchedule.filter(s => s.day && s.startTime);
      if (validServices.length === 0) {
        setError('Please add at least one service time with day and start time.');
        setLoading(false);
        return;
      }

      const selectedLanguages = Object.keys(languages).filter(k => languages[k]);
      if (selectedLanguages.length === 0) {
        setError('Please select at least one language spoken at your church.');
        setLoading(false);
        return;
      }

      // Geocode the address to get coordinates
      setGeocoding(true);
      let coordinates;
      try {
        const geocodeResult = await geocodingService.geocodeAddressComponents(
          address,
          city,
          state,
          zip
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

      // Upload church image if provided
      let churchImageUrl = '';
      if (churchImage) {
        try {
          console.log('[RegisterChurch] Starting image upload...');
          const tempId = `temp-${Date.now()}`;
          churchImageUrl = await storageService.uploadChurchImage(churchImage, tempId, 'main');
          console.log('[RegisterChurch] Image upload successful:', churchImageUrl);
        } catch (storageError: any) {
          console.error('[RegisterChurch] Storage upload error:', {
            message: storageError.message,
            originalError: storageError.originalError,
            isStorageError: storageError.isStorageError,
          });
          
          // If it's a storage error, show that specific error
          if (storageError.isStorageError) {
            setError(storageError.message || 'Failed to upload church image. Please check your storage settings or try again without an image.');
          } else {
            setError(storageError.message || 'Failed to upload church image. Please try again.');
          }
          setLoading(false);
          return;
        }
      }

      // Transform service schedule - format time as readable format
      const transformedSchedule: ServiceTime[] = serviceSchedule
        .filter(s => s.day && s.startTime)
        .map(s => {
          const startFormatted = formatTime(s.startTime);
          const endFormatted = s.endTime ? formatTime(s.endTime) : '';
          const timeStr = endFormatted ? `${startFormatted} - ${endFormatted}` : startFormatted;
          return {
            day: s.day,
            time: timeStr,
            description: s.description || `${s.day} Service${s.repeat !== 'Every Week' ? ` (${s.repeat})` : ''}`,
          };
        });

      // Transform special programs to services array
      const servicesList = Object.keys(specialPrograms).filter(k => specialPrograms[k]);
      
      // Transform languages
      const languagesList = Object.keys(languages).filter(k => languages[k]);

      // Create church data
      const churchData: Partial<Church> = {
        name: churchName,
        address,
        city,
        state,
        zip,
        phone: churchPhone || adminPhone,
        description,
        coordinates,
        imageUrl: churchImageUrl,
        services: servicesList,
        serviceSchedule: transformedSchedule,
        languages: languagesList,
        features,
        donationInfo: {},
        isVerified: false,
        members: 0,
        clergy: [],
        events: [],
      };

      // Create church in database
      console.log('[RegisterChurch] Creating church in database...', {
        churchName,
        userId: user.id,
        hasImage: !!churchImageUrl,
      });
      
      let church;
      try {
        church = await churchService.createChurch(
          churchData,
          user.id
        );
        console.log('[RegisterChurch] Church created successfully:', church.id);
      } catch (dbError: any) {
        console.error('[RegisterChurch] Database error:', {
          message: dbError.message,
          code: dbError.code,
          details: dbError.details,
          hint: dbError.hint,
        });
        
        // Check if this might actually be a storage error that was misreported
        if (dbError.message?.includes('new row violates row-level security policy') && churchImage) {
          setError('Failed to create church. This might be due to a storage upload issue. Please try again without an image, or check your storage bucket permissions in Supabase.');
        } else {
          setError(dbError.message || 'Failed to create church. Please try again.');
        }
        setLoading(false);
        return;
      }

      // If we uploaded an image, re-upload with correct church ID
      if (churchImage && churchImageUrl && church.id) {
        try {
          console.log('[RegisterChurch] Re-uploading image with correct church ID...');
          const correctUrl = await storageService.uploadChurchImage(churchImage, church.id, 'main');
          await churchService.updateChurch(church.id, {
            imageUrl: correctUrl,
          });
          console.log('[RegisterChurch] Image re-upload successful');
        } catch (reuploadError: any) {
          console.error('[RegisterChurch] Image re-upload error:', reuploadError);
          // Don't fail the whole registration if re-upload fails, just log it
          // The church was already created successfully
          console.warn('[RegisterChurch] Church created but image re-upload failed. Church ID:', church.id);
        }
      }

      // Update admin profile with phone if provided
      if (adminPhone) {
        // Could update profile here if needed
      }

      setStep(4); // Success step
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('[RegisterChurch] Unexpected error:', {
        message: err.message,
        stack: err.stack,
        error: err,
      });
      
      // Check if it's a storage error
      if (err.isStorageError) {
        setError(err.message || 'Failed to upload image. Please check your storage settings or try again without an image.');
      } else {
        setError(err.message || 'Failed to register church. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-green-100 text-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Submitted!</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Thank you for registering your parish. Our team will review your information and approve your listing within 48 hours. You will receive an email notification once your church is approved.
        </p>
        <button 
          onClick={() => {
            onCancel();
            if (onSuccess) onSuccess();
          }}
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
        
        {/* Progress indicator */}
        <div className="mt-6 flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step === s ? 'bg-blue-600 text-white' : 
                  step > s ? 'bg-green-600 text-white' : 
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? <Check size={16} /> : s}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= s ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {s === 1 ? 'Admin Info' : s === 2 ? 'Church Info' : 'Church Details'}
                </span>
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-4 ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-6">
          {/* Step 1: Church Admin Information */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Church Admin Information</h3>
              <p className="text-sm text-gray-600 mb-6">
                Please verify your information. This will be used to contact you about your church registration.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border bg-gray-50"
                    placeholder="your@email.com"
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">This is your account email and cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border"
                    placeholder="(310) 123-4567"
                  />
                  <p className="mt-1 text-xs text-gray-500">We'll use this to contact you about your registration</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Church Information */}
          {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Church Information</h3>
              
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Official Church Name *</label>
                  <input
                    type="text"
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border"
                    placeholder="St. Mary Ethiopian Orthodox Tewahedo Church"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border"
                    placeholder="123 Main Street"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border"
                    placeholder="Los Angeles"
                  />
              </div>
                
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border"
                    placeholder="CA"
                  />
              </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border"
                    placeholder="90001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Church Phone</label>
                  <input
                    type="tel"
                    value={churchPhone}
                    onChange={(e) => setChurchPhone(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border"
                    placeholder="(310) 123-4567"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 py-2 px-3 border"
                    placeholder="Tell us about your church..."
                  />
                </div>
              </div>

              {/* Church Image Upload */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Church Photo</label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a photo of your church building. This will be displayed on your church listing.
                </p>
                <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 cursor-pointer">
                  <div className="space-y-1 text-center">
                    {churchImagePreview ? (
                      <div className="space-y-2">
                        <img src={churchImagePreview} alt="Church preview" className="mx-auto h-32 w-auto rounded-md" />
                        <p className="text-xs text-green-600">{churchImage?.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setChurchImage(null);
                            setChurchImagePreview('');
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                            <input
                              type="file"
                              className="sr-only"
                              accept=".png,.jpg,.jpeg,.webp"
                              onChange={handleChurchImageChange}
                            />
                            Upload a photo
                          </span>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> We'll automatically find the location of your church based on the address you provide. This will be used to show your church on the map.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Church Details */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Church Details</h3>
              
              {/* Service Schedule */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Weekly Service Schedule *</label>
                  <button
                    type="button"
                    onClick={addServiceTime}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Service Time
                  </button>
                </div>
                
                <div className="space-y-4">
                  {serviceSchedule.map((service, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Day *</label>
                          <select
                            value={service.day}
                            onChange={(e) => updateServiceTime(index, 'day', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-slate-500 focus:border-slate-500"
                          >
                            {DAYS_OF_WEEK.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Start Time *</label>
                          <input
                            type="time"
                            value={service.startTime}
                            onChange={(e) => updateServiceTime(index, 'startTime', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-slate-500 focus:border-slate-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                          <input
                            type="time"
                            value={service.endTime}
                            onChange={(e) => updateServiceTime(index, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-slate-500 focus:border-slate-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                          <select
                            value={service.repeat}
                            onChange={(e) => updateServiceTime(index, 'repeat', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-slate-500 focus:border-slate-500"
                          >
                            {REPEAT_OPTIONS.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          {serviceSchedule.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeServiceTime(index)}
                              className="w-full px-3 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-md text-sm flex items-center justify-center gap-1"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <input
                          type="text"
                          value={service.description}
                          onChange={(e) => updateServiceTime(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-slate-500 focus:border-slate-500"
                          placeholder="e.g., Divine Liturgy, Bible Study, etc."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Programs */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Special Programs & Services</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIAL_PROGRAMS.map(program => (
                    <label key={program} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={specialPrograms[program] || false}
                        onChange={(e) => setSpecialPrograms({ ...specialPrograms, [program]: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{program}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-4">Languages Spoken *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {LANGUAGES.map(lang => (
                    <label key={lang} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={languages[lang] || false}
                        onChange={(e) => setLanguages({ ...languages, [lang]: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{lang}</span>
                    </label>
                  ))}
            </div>
          </div>

              {/* Features */}
          <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Church Features</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={features.hasEnglishService}
                      onChange={(e) => setFeatures({ ...features, hasEnglishService: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">English Service Available</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={features.hasParking}
                      onChange={(e) => setFeatures({ ...features, hasParking: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Parking Available</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={features.wheelchairAccessible}
                      onChange={(e) => setFeatures({ ...features, wheelchairAccessible: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Wheelchair Accessible</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={features.hasSchool}
                      onChange={(e) => setFeatures({ ...features, hasSchool: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Has School (Sunday School / Cultural School)</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          </div>

        {/* Form Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading || geocoding}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
        </div>

          <div className="flex gap-3">
            <button 
                type="button" 
                onClick={onCancel}
              disabled={loading || geocoding}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
                Cancel
            </button>
            
            {step < 3 ? (
              <button
                type="submit"
                disabled={loading || geocoding}
                className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ArrowRight size={16} />
              </button>
            ) : (
            <button 
                type="submit" 
                disabled={loading || geocoding}
                className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {(loading || geocoding) && <Loader2 className="h-4 w-4 animate-spin" />}
                {geocoding ? 'Finding location...' : loading ? 'Submitting...' : 'Submit Registration'}
            </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
