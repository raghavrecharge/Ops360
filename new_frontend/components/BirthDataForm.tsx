
import React, { useState } from 'react';
import { BirthData } from '../types';
import { 
  UserIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  GlobeAltIcon,
  SparklesIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { astrologyService } from '../services/astrologyService';

interface Props {
  onCalculate: (data: BirthData) => void;
  initialData?: BirthData | null;
}

const BirthDataForm: React.FC<Props> = ({ onCalculate, initialData }) => {
  const [formData, setFormData] = useState<BirthData>(initialData || {
    name: '',
    dob: '',
    tob: '',
    lat: 28.6139,
    lng: 77.2090,
    tz: 'Asia/Kolkata'
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = astrologyService.validateBirthData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors([]);
    onCalculate({ ...formData, isVerified: true });
  };

  return (
    <div className="bg-white rounded-[40px] border border-[#f1ebe6] p-8 lg:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto shadow-inner">
            <SparklesIcon className="w-9 h-9" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Initialize Your Matrix</h2>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-[0.2em]">Enter Precise Birth Coordinates for High-Fidelity Analysis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-rose-600 uppercase tracking-widest">Initialization Error</p>
                <ul className="text-xs font-bold text-rose-500 list-disc list-inside">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seeker Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="e.g. Raghav Sanoriya"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-orange-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                <div className="relative">
                  <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                  <input 
                    type="date" 
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-orange-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time of Birth</label>
                <div className="relative">
                  <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                  <input 
                    type="time" 
                    value={formData.tob}
                    onChange={e => setFormData({...formData, tob: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-orange-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
              <div className="relative">
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="number" 
                  step="any"
                  placeholder="28.6139"
                  value={formData.lat}
                  onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-orange-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude</label>
              <div className="relative">
                <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="number" 
                  step="any"
                  placeholder="77.2090"
                  value={formData.lng}
                  onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-orange-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Generate Cosmic Blueprint
            </button>
            <p className="text-center text-[9px] font-bold text-slate-400 uppercase mt-4 tracking-widest">
              Ayanamsa: True Chitra Paksha (Lahiri) • Siderial Zodiac
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BirthDataForm;
