/**
 * ProfileSelector - Component for selecting user profiles
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileService, Profile } from '../services/profileService';
import { 
  UserCircleIcon, 
  PlusCircleIcon,
  CheckIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Props {
  onSelectProfile?: (profile: Profile) => void;
}

const ProfileSelector: React.FC<Props> = ({ onSelectProfile }) => {
  const { selectedProfile, selectProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await profileService.getProfiles();
      setProfiles(data);
    } catch (err) {
      setError('Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (profile: Profile) => {
    selectProfile(profile);
    onSelectProfile?.(profile);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-slate-800">Select Profile</h3>
      
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleSelect(profile)}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
              selectedProfile?.id === profile.id
                ? 'border-orange-500 bg-orange-50'
                : 'border-slate-100 bg-white hover:border-orange-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">{profile.name}</h4>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(profile.birth_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" />
                    {profile.birth_place}
                  </span>
                </div>
              </div>
              {selectedProfile?.id === profile.id && (
                <CheckIcon className="w-5 h-5 text-orange-500" />
              )}
            </div>
          </button>
        ))}
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-4">No profiles found</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm">
            <PlusCircleIcon className="w-5 h-5" />
            Create Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
