import React from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { Church, ServiceTime } from '../types';
import { SPECIAL_PROGRAMS, DAYS_OF_WEEK, REPEAT_OPTIONS, LANGUAGES } from '../constants';

export interface ServiceScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  description: string;
  repeat: string;
}

export interface ChurchFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  description: string;
  imageUrl?: string;
  serviceSchedule: ServiceScheduleItem[];
  specialPrograms: Record<string, boolean>;
  languages: Record<string, boolean>;
  features: {
    hasEnglishService: boolean;
    hasParking: boolean;
    wheelchairAccessible: boolean;
    hasSchool: boolean;
  };
}

interface ChurchFormFieldsProps {
  formData: ChurchFormData;
  onFormDataChange: (data: Partial<ChurchFormData>) => void;
  churchImage: File | null;
  churchImagePreview: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
  onAddServiceTime: () => void;
  onRemoveServiceTime: (index: number) => void;
  onUpdateServiceTime: (index: number, field: keyof ServiceScheduleItem, value: string) => void;
  showImageUpload?: boolean;
}

export const ChurchFormFields: React.FC<ChurchFormFieldsProps> = ({
  formData,
  onFormDataChange,
  churchImage,
  churchImagePreview,
  onImageChange,
  onImageRemove,
  onAddServiceTime,
  onRemoveServiceTime,
  onUpdateServiceTime,
  showImageUpload = true,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Church Information */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Church Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="St. Mary Ethiopian Orthodox Tewahedo Church"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => onFormDataChange({ address: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="123 Main Street"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => onFormDataChange({ city: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Los Angeles"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => onFormDataChange({ state: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="CA"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
            <input
              type="text"
              value={formData.zip}
              onChange={(e) => onFormDataChange({ zip: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="90001"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Church Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onFormDataChange({ phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="(310) 123-4567"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => onFormDataChange({ description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Tell us about your church..."
            />
          </div>
        </div>
      </div>

      {/* Church Image Upload */}
      {showImageUpload && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Church Photo</label>
          <p className="text-sm text-gray-500 mb-4">
            Upload a photo of your church building. This will be displayed on your church listing.
          </p>
          <label className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 cursor-pointer">
            <div className="space-y-1 text-center">
              {churchImagePreview ? (
                <div className="space-y-2">
                  <img src={churchImagePreview} alt="Church preview" className="mx-auto h-32 w-auto rounded-md" />
                  <p className="text-xs text-green-600">{churchImage?.name || 'Current image'}</p>
                  <button
                    type="button"
                    onClick={onImageRemove}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove {churchImage ? 'New ' : ''}Image
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
                        onChange={onImageChange}
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
      )}

      {/* Service Schedule */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Weekly Service Schedule *</label>
          <button
            type="button"
            onClick={onAddServiceTime}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus size={16} />
            Add Service Time
          </button>
        </div>
        
        <div className="space-y-4">
          {formData.serviceSchedule.map((service, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Day *</label>
                  <select
                    value={service.day}
                    onChange={(e) => onUpdateServiceTime(index, 'day', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                    onChange={(e) => onUpdateServiceTime(index, 'startTime', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={service.endTime}
                    onChange={(e) => onUpdateServiceTime(index, 'endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={service.repeat}
                    onChange={(e) => onUpdateServiceTime(index, 'repeat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {REPEAT_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  {formData.serviceSchedule.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveServiceTime(index)}
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
                  onChange={(e) => onUpdateServiceTime(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g., Divine Liturgy, Bible Study, etc."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Programs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Special Programs & Services</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SPECIAL_PROGRAMS.map(program => (
            <label key={program} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specialPrograms[program] || false}
                onChange={(e) => onFormDataChange({
                  specialPrograms: { ...formData.specialPrograms, [program]: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{program}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Languages Spoken *</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LANGUAGES.map(lang => (
            <label key={lang} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.languages[lang] || false}
                onChange={(e) => onFormDataChange({
                  languages: { ...formData.languages, [lang]: e.target.checked }
                })}
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
              checked={formData.features.hasEnglishService}
              onChange={(e) => onFormDataChange({
                features: { ...formData.features, hasEnglishService: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">English Service Available</span>
          </label>
          
          <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.features.hasParking}
              onChange={(e) => onFormDataChange({
                features: { ...formData.features, hasParking: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Parking Available</span>
          </label>
          
          <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.features.wheelchairAccessible}
              onChange={(e) => onFormDataChange({
                features: { ...formData.features, wheelchairAccessible: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Wheelchair Accessible</span>
          </label>
          
          <label className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.features.hasSchool}
              onChange={(e) => onFormDataChange({
                features: { ...formData.features, hasSchool: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Has School (Sunday School / Cultural School)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
