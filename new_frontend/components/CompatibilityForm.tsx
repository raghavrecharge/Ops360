
import React, { useState } from 'react';
import { BirthData } from '../types';
import { 
  HeartIcon, 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  GlobeAltIcon,
  SparklesIcon,
  UserIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Props {
  onCalculate: (data: BirthData) => Promise<void>;
  partnerName?: string;
}

const CompatibilityForm: React.FC<Props> = ({ onCalculate }) => {
  const [formData, setFormData] = useState<BirthData>({
    name: '',
    dob: '',
    tob: '',
    lat: 28.6139,
    lng: 77.2090,
    tz: 'Asia/Kolkata'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCalculate(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[40px] border border-[#f1ebe6] p-10 lg:p-16 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div className="text-center space-y-6 mb-12">
        <div className="w-20 h-20 bg-rose-50 rounded-[28px] flex items-center justify-center text-rose-500 mx-auto shadow-inner border border-rose-100">
           <HeartIcon className="w-10 h-10" />
        </div>
        <div className="space-y-2">
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">Partner Alignment Matrix</h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Enter Partner's Coordinates for Synastry Analysis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:col-span-2 space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Partner's Name</label>
           <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text" 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-800 transition-all"
                placeholder="Partner Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birth Date</label>
           <div className="relative">
              <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="date" 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-800 transition-all"
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})}
              />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birth Time</label>
           <div className="relative">
              <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="time" 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-800 transition-all"
                value={formData.tob}
                onChange={e => setFormData({...formData, tob: e.target.value})}
              />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
           <div className="relative">
              <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="number" 
                step="any"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-800 transition-all"
                value={formData.lat}
                onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
              />
           </div>
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude</label>
           <div className="relative">
              <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="number" 
                step="any"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-800 transition-all"
                value={formData.lng}
                onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
              />
           </div>
        </div>

        <div className="md:col-span-2 pt-6">
           <button 
             type="submit"
             disabled={isSubmitting}
             className="w-full py-5 bg-rose-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
           >
              {isSubmitting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : 'Analyze Soul Resonance'}
           </button>
           <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest mt-6">
             Synastry calculated using Guna Milap (Ashta Koota) system
           </p>
        </div>
      </form>
    </div>
  );
};

export default CompatibilityForm;
