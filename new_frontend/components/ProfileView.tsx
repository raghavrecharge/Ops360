
import React from 'react';
import { UserProfile } from '../types';
import { 
  UserCircleIcon, 
  IdentificationIcon, 
  CalendarDaysIcon, 
  MapPinIcon, 
  CheckBadgeIcon, 
  SparklesIcon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { SIGN_NAMES } from '../constants';

interface Props {
  profile: UserProfile;
  onLogout: () => void;
  onEditBirthData: () => void;
}

const ProfileView: React.FC<Props> = ({ profile, onLogout, onEditBirthData }) => {
  const account = profile.account;
  const birth = profile.birthData;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-white p-10 rounded-[48px] border border-[#f1ebe6] shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
           <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] border-4 border-[#fcf8f5] shadow-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                 {account.avatar ? (
                   <img src={account.avatar} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="User Avatar" />
                 ) : (
                   <UserCircleIcon className="w-16 h-16 text-slate-300" />
                 )}
              </div>
              {profile.isVerified && (
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-2 border-4 border-white shadow-lg animate-bounce">
                   <CheckBadgeIcon className="w-5 h-5" />
                </div>
              )}
           </div>
           <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                 <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{account.username}</h2>
                 <span className="px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">Premium Member</span>
              </div>
              <p className="text-slate-400 font-bold text-lg">{account.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                 <span className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-orange-400" /> Joined {new Date(account.joinedDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                 <span className="w-1 h-1 bg-slate-200 rounded-full" />
                 <span className="flex items-center gap-2"><ShieldCheckIcon className="w-4 h-4 text-emerald-400" /> Status: Verified</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
           <button 
             onClick={onEditBirthData}
             className="px-8 py-4 bg-[#fcf8f5] border border-[#f1ebe6] rounded-2xl text-xs font-black uppercase tracking-widest text-[#2d2621] hover:bg-white hover:border-orange-200 transition-all flex items-center gap-3"
           >
              <IdentificationIcon className="w-5 h-5 text-orange-500" /> Update Chart
           </button>
           <button 
             onClick={onLogout}
             className="px-8 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center gap-3"
           >
              <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
           </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* 2. BENTO DATA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: BIRTH INFO (7/12) */}
        <div className="lg:col-span-7 space-y-8">
           <div className="bg-white p-12 rounded-[56px] border border-[#f1ebe6] shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-12">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-800">Master Coordinates</h3>
                    <p className="text-sm font-medium text-[#8c7e74]">Initialization data for all calculations.</p>
                 </div>
                 <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                    <GlobeAltIcon className="w-8 h-8" />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-8">
                    <div className="flex items-center gap-6 group/item">
                       <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:border-orange-500/50 transition-colors">
                          <CalendarDaysIcon className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Birth Date</p>
                          <p className="text-xl font-black text-slate-800">{new Date(birth.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 group/item">
                       <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:border-orange-500/50 transition-colors">
                          <ClockIcon className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Birth Time</p>
                          <p className="text-xl font-black text-slate-800">{birth.tob} <span className="text-slate-300 font-bold ml-1">({birth.tz})</span></p>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <div className="flex items-center gap-6 group/item">
                       <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover/item:border-orange-500/50 transition-colors">
                          <MapPinIcon className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Coordinates</p>
                          <p className="text-xl font-black text-slate-800">{birth.lat.toFixed(4)}° N, {birth.lng.toFixed(4)}° E</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 group/item">
                       <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                          <CheckBadgeIcon className="w-7 h-7" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Verification</p>
                          <p className="text-xl font-black text-slate-800">Chart Locked</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-12 p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] group-hover:bg-indigo-100/50 transition-colors">
                 <p className="text-sm font-bold text-indigo-900 leading-relaxed italic">
                   "Vedic accuracy depends on precise time. Even a difference of 4 minutes can shift the sub-divisional charts (Vargas) significantly."
                 </p>
              </div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px]" />
           </div>

           <div className="bg-white p-10 rounded-[40px] border border-[#f1ebe6] shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <IdentificationIcon className="w-8 h-8" />
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-slate-800">Identity Documents</h4>
                    <p className="text-xs font-bold text-slate-400">Manage birth records and verification proofs.</p>
                 </div>
              </div>
              <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-orange-500 hover:text-orange-600 transition-all">Coming Soon</button>
           </div>
        </div>

        {/* RIGHT COLUMN: PREFERENCES & SECURITY (5/12) */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-[#1e1b4b] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between mb-12 relative z-10">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black">System Protocols</h3>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Preferences & Intelligence</p>
                 </div>
                 <Cog6ToothIcon className="w-10 h-10 text-orange-400" />
              </div>

              <div className="space-y-6 relative z-10 flex-1">
                 <div className="flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                       <SparklesIcon className="w-6 h-6 text-orange-400" />
                       <div>
                          <p className="text-sm font-black">Ayanamsa Model</p>
                          <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">{profile.preferences.ayanamsa}</p>
                       </div>
                    </div>
                    <ArrowPathIcon className="w-5 h-5 text-white/40 group-hover:rotate-180 transition-transform duration-500" />
                 </div>

                 <div className="flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                       <GlobeAltIcon className="w-6 h-6 text-indigo-400" />
                       <div>
                          <p className="text-sm font-black">Chart Visual Style</p>
                          <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">{profile.preferences.chartStyle} Style</p>
                       </div>
                    </div>
                    <ArrowPathIcon className="w-5 h-5 text-white/40 group-hover:rotate-180 transition-transform duration-500" />
                 </div>

                 <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] mt-4">
                    <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-6">Security Layer</h4>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-indigo-200">RAG AI Privacy</span>
                          <div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-indigo-200">Ephemeris Sync</span>
                          <div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-12 relative z-10 pt-8 border-t border-white/10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                       <ShieldCheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-[10px] font-black text-indigo-200 leading-relaxed uppercase tracking-widest">
                      Data integrity verified by <br/> <span className="text-white">Astro Guard Protocol v2.1</span>
                    </p>
                 </div>
              </div>

              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12 scale-150">
                 <SparklesIcon className="w-64 h-64 text-white" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileView;
const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
