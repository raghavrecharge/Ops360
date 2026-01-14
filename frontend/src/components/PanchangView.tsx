
import React from 'react';
import { PanchangData, Planet } from '../types';
import { 
  SunIcon, 
  MoonIcon, 
  ClockIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  ExclamationCircleIcon,
  FingerPrintIcon,
  AcademicCapIcon,
  LifebuoyIcon,
  BoltIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { PLANET_REMEDY_MAP } from '../services/astrologyService';

interface Props {
  data: PanchangData;
}

const PanchangView: React.FC<Props> = ({ data }) => {
  // Enhanced metadata for Panchang limbs
  const limbDetails = [
    { 
      label: 'Tithi', 
      val: data.tithi, 
      sub: data.moonPhase, 
      icon: MoonIcon, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50', 
      lord: Planet.Venus,
      nature: 'Jaya (Victory)',
      desc: 'Governs the emotional and mental state of the day.' 
    },
    { 
      label: 'Vara', 
      val: data.vara, 
      sub: 'Solar Day', 
      icon: SunIcon, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50', 
      lord: data.dayLord,
      nature: 'Stable',
      desc: 'The physical energy and life force ruler of today.' 
    },
    { 
      label: 'Nakshatra', 
      val: data.nakshatra, 
      sub: 'Moon Mansion', 
      icon: SparklesIcon, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50', 
      lord: Planet.Saturn,
      nature: 'Dhruva (Fixed)',
      desc: 'The star cluster coloring the subconsious experience.' 
    },
    { 
      label: 'Yoga', 
      val: data.yoga, 
      sub: 'Union', 
      icon: LifebuoyIcon, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50', 
      lord: Planet.Jupiter,
      nature: 'Siddhi (Success)',
      desc: 'The subtle energetic alignment between Sun and Moon.' 
    },
    { 
      label: 'Karana', 
      val: data.karana, 
      sub: 'Half-Tithi', 
      icon: FingerPrintIcon, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50', 
      lord: Planet.Mars,
      nature: 'Bava',
      desc: 'Governs productivity and the success of actions.' 
    },
  ];

  const choghadiya = [
    { name: 'Amrit', status: 'Best', time: '06:12 - 07:44', color: 'text-emerald-600', dot: 'bg-emerald-500' },
    { name: 'Kaal', status: 'Bad', time: '07:44 - 09:16', color: 'text-rose-600', dot: 'bg-rose-500' },
    { name: 'Shubh', status: 'Good', time: '09:16 - 10:48', color: 'text-emerald-600', dot: 'bg-emerald-500' },
    { name: 'Rog', status: 'Avoid', time: '10:48 - 12:20', color: 'text-rose-600', dot: 'bg-rose-500' },
    { name: 'Udveg', status: 'Caution', time: '12:20 - 13:52', color: 'text-amber-600', dot: 'bg-amber-500' },
    { name: 'Chara', status: 'Neutral', time: '13:52 - 15:24', color: 'text-indigo-600', dot: 'bg-indigo-500' },
    { name: 'Labh', status: 'Gain', time: '15:24 - 16:56', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      
      {/* 1. HERO ALMANAC HEADER */}
      <div className="bg-white rounded-[48px] p-10 border border-[#f1ebe6] shadow-sm relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-12">
        <div className="relative z-10 flex-1 space-y-6">
           <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-orange-50 border border-orange-100 rounded-full text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">
                 The Five Limbs of Time
              </span>
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Sync</span>
              </div>
           </div>
           
           <div className="space-y-3">
              <h2 className="text-5xl lg:text-7xl font-black text-slate-800 tracking-tighter leading-none">
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-[#8c7e74]">
                 <div className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4 text-indigo-500" /> Lat: 28.6° N • Lon: 77.2° E</div>
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                 <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-orange-500" /> IST (UTC+5:30)</div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-8 bg-[#fcf8f5] p-8 rounded-[40px] border border-[#f1ebe6] shadow-inner relative group">
           <div className="text-center group-hover:scale-105 transition-transform">
              <p className="text-[10px] font-black uppercase text-[#8c7e74] tracking-widest mb-3">Sunrise</p>
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-orange-500 shadow-md mx-auto mb-3">
                 <SunIcon className="w-9 h-9" />
              </div>
              <p className="text-lg font-black text-slate-800">{data.sunrise}</p>
           </div>
           <div className="w-px h-20 bg-slate-200" />
           <div className="text-center group-hover:scale-105 transition-transform">
              <p className="text-[10px] font-black uppercase text-[#8c7e74] tracking-widest mb-3">Sunset</p>
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-500 shadow-md mx-auto mb-3">
                 <MoonIcon className="w-9 h-9" />
              </div>
              <p className="text-lg font-black text-slate-800">{data.sunset}</p>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* 2. THE FIVE LIMBS (PANCHA-ANGAS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
         {limbDetails.map((l, i) => (
           <div key={i} className="bg-white p-8 rounded-[40px] border border-[#f1ebe6] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group overflow-hidden relative">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-10">
                   <div className={`w-14 h-14 rounded-2xl ${l.bg} ${l.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                      <l.icon className="w-7 h-7" />
                   </div>
                   <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Limb {i+1}</p>
                   </div>
                </div>

                <div className="space-y-1 mb-8">
                   <h4 className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest">{l.label}</h4>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{l.val}</h3>
                   <span className={`text-[10px] font-black uppercase ${l.color}`}>{l.nature}</span>
                </div>

                <div className="mt-auto space-y-4 pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                         <StarIcon className="w-4 h-4" />
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase">Ruling Lord</p>
                         <p className="text-xs font-black text-slate-800">{l.lord}</p>
                      </div>
                   </div>
                   <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic line-clamp-2">
                     "{l.desc}"
                   </p>
                </div>
              </div>
              <div className={`absolute -bottom-10 -right-10 w-24 h-24 ${l.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
           </div>
         ))}
      </div>

      {/* 3. MUHURTA & CHOGHADIYA MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* LEFT: MUHURTA WATCH */}
         <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-12 rounded-[56px] border border-[#f1ebe6] shadow-sm">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div className="space-y-2">
                     <h3 className="text-3xl font-black text-slate-800 flex items-center gap-4">
                        <ShieldCheckIcon className="w-10 h-10 text-emerald-500" /> Muhurta Watch
                     </h3>
                     <p className="text-sm font-medium text-[#8c7e74]">Propitious windows calculated for current geo-coordinates.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-emerald-50 px-5 py-2 rounded-2xl border border-emerald-100">
                     <BoltIcon className="w-5 h-5 text-emerald-500" />
                     <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Optimal Alignment</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'Abhijit Muhurta', time: '11:58 AM - 12:44 PM', desc: 'The "unconquerable" window. Best for important launches and initiatives.', icon: BoltIcon, color: 'emerald' },
                    { name: 'Amrit Kaal', time: '02:15 PM - 03:32 PM', desc: 'Divine nectar window for long-term spiritual benefit and health.', icon: SparklesIcon, color: 'amber' },
                    { name: 'Brahma Muhurta', time: '04:36 AM - 05:24 AM', desc: 'The pre-dawn hour of creators. Best for meditation and deep study.', icon: AcademicCapIcon, color: 'indigo' },
                    { name: 'Vijaya Muhurta', time: '02:30 PM - 03:18 PM', desc: 'The window of victory. Best for legal matters and competition.', icon: ShieldCheckIcon, color: 'orange' }
                  ].map((m, i) => (
                    <div key={i} className="group p-8 bg-[#fcf8f5] rounded-[40px] border border-transparent hover:border-emerald-200 hover:bg-white hover:shadow-xl transition-all duration-500">
                       <div className="flex justify-between items-start mb-6">
                          <div className={`w-14 h-14 rounded-2xl bg-${m.color}-500/10 flex items-center justify-center text-${m.color}-600`}>
                             <m.icon className="w-7 h-7" />
                          </div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active Today</span>
                       </div>
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.name}</p>
                       <p className="text-3xl font-black text-slate-800 mb-4">{m.time}</p>
                       <p className="text-xs font-bold text-slate-500 leading-relaxed">{m.desc}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* CAUTIONARY PERIODS */}
            <div className="bg-white p-12 rounded-[56px] border border-[#f1ebe6] shadow-sm">
               <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <ExclamationCircleIcon className="w-8 h-8 text-rose-500" /> Caution Periods
                     </h3>
                     <p className="text-sm font-medium text-[#8c7e74]">Time segments dominated by malefic energies.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: 'Rahu Kaal', time: '03:59 - 05:41 PM', icon: FireIcon, desc: 'Shadow window; avoid wealth deals.' },
                    { name: 'Yamaganda', time: '09:20 - 11:02 AM', icon: ShieldCheckIcon, desc: 'Inauspicious for new journeys.' },
                    { name: 'Gulika Kaal', time: '12:44 - 02:26 PM', icon: ArrowPathIcon, desc: 'Avoid rituals or completions.' }
                  ].map((c, i) => (
                    <div key={i} className="p-8 bg-rose-50/10 border border-[#f1ebe6] rounded-[40px] text-center hover:border-rose-200 hover:bg-rose-50/30 transition-all group">
                       <div className="w-20 h-20 bg-rose-100 rounded-[28px] flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform">
                          <c.icon className="w-9 h-9 text-rose-500" />
                       </div>
                       <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">{c.name}</p>
                       <p className="text-xl font-black text-slate-800 mb-2">{c.time}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed italic">{c.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* RIGHT: CHOGHADIYA SIDEBAR */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[56px] p-10 border border-[#f1ebe6] shadow-sm relative overflow-hidden flex flex-col h-full">
               <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-slate-800">Day Choghadiya</h3>
                     <p className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest">Temporal Qualities</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                     <InformationCircleIcon className="w-6 h-6" />
                  </div>
               </div>
               
               <div className="space-y-2 relative z-10">
                  {choghadiya.map((ch, i) => (
                    <div key={i} className="flex justify-between items-center group cursor-default p-5 rounded-[32px] hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                       <div className="flex items-center gap-5">
                          <div className={`w-3.5 h-3.5 rounded-full ${ch.dot} shadow-sm ring-4 ring-white group-hover:scale-150 transition-transform`} />
                          <div>
                             <p className="text-lg font-black text-slate-800 group-hover:text-orange-600 transition-colors">{ch.name}</p>
                             <p className={`text-[10px] font-black uppercase tracking-widest ${ch.color}`}>{ch.status}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-mono font-bold text-slate-400">{ch.time}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-auto pt-10">
                  <div className="p-8 bg-indigo-950 rounded-[40px] text-white relative overflow-hidden group">
                     <div className="relative z-10 space-y-4">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Sage Advice</p>
                        <p className="text-sm font-bold leading-relaxed italic">
                          "With {data.nakshatra} active and the Vara Lord being {data.dayLord}, focus on activities that require high focus and strategic patience."
                        </p>
                     </div>
                     <SparklesIcon className="absolute -bottom-6 -right-6 w-24 h-24 text-white/5 group-hover:rotate-12 transition-transform" />
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default PanchangView;
const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
