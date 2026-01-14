import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreateProfileInput } from '../services/profileService';
import {
  UserCircleIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface ProfileSelectorProps {
  onClose?: () => void;
}

export default function ProfileSelector({ onClose }: ProfileSelectorProps) {
  const { profiles, selectedProfile, selectProfile, createProfile, isLoading } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<CreateProfileInput>({
    name: '',
    birth_date: '',
    birth_time: '12:00:00',
    birth_place: '',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
    ayanamsa: 'LAHIRI',
  });
  const [error, setError] = useState('');

  const handleSelectProfile = (profile: any) => {
    selectProfile(profile);
    onClose?.();
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createProfile(formData);
      setShowCreate(false);
      setFormData({
        name: '',
        birth_date: '',
        birth_time: '12:00:00',
        birth_place: '',
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 'Asia/Kolkata',
        ayanamsa: 'LAHIRI',
      });
      onClose?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create profile');
    }
  };

  if (showCreate) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6 border border-[#f1ebe6] max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-[#2d2621]">Create New Profile</h3>
          <button
            onClick={() => setShowCreate(false)}
            className="p-2 hover:bg-[#fcf8f5] rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-[#8c7e74]" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#8c7e74] uppercase mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Profile name"
              required
              className="w-full px-4 py-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8c7e74] uppercase mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" /> Birth Date
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8c7e74] uppercase mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" /> Birth Time
              </label>
              <input
                type="time"
                value={formData.birth_time.substring(0, 5)}
                onChange={(e) => setFormData({ ...formData, birth_time: e.target.value + ':00' })}
                required
                className="w-full px-4 py-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8c7e74] uppercase mb-2">
              <MapPinIcon className="w-4 h-4 inline mr-1" /> Birth Place
            </label>
            <input
              type="text"
              value={formData.birth_place}
              onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
              placeholder="City, Country"
              required
              className="w-full px-4 py-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8c7e74] uppercase mb-2">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8c7e74] uppercase mb-2">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                required
                className="w-full px-4 py-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f97316]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#f97316] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-[#f1ebe6] max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-[#2d2621]">Select Profile</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#fcf8f5] rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-[#8c7e74]" />
          </button>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {profiles.length === 0 ? (
          <p className="text-center text-[#8c7e74] py-8">No profiles yet. Create your first profile!</p>
        ) : (
          profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                selectedProfile?.id === profile.id
                  ? 'border-[#f97316] bg-orange-50'
                  : 'border-[#f1ebe6] hover:border-orange-200 bg-white'
              }`}
            >
              <div className="w-12 h-12 bg-[#fcf8f5] rounded-xl flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-[#f97316]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-[#2d2621]">{profile.name}</p>
                <p className="text-xs text-[#8c7e74]">
                  {profile.birth_date} • {profile.birth_place}
                </p>
              </div>
              {selectedProfile?.id === profile.id && (
                <CheckIcon className="w-6 h-6 text-[#f97316]" />
              )}
            </button>
          ))
        )}
      </div>

      <button
        onClick={() => setShowCreate(true)}
        className="w-full py-4 bg-[#fcf8f5] border border-[#f1ebe6] text-[#2d2621] font-bold rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-5 h-5 text-[#f97316]" />
        Add New Profile
      </button>
    </div>
  );
}
