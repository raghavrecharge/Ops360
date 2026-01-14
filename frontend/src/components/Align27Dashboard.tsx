
import React from 'react';
import { Align27Moment, Planet, Sign } from '../types';
import { 
  SunIcon, 
  MoonIcon, 
  ClockIcon, 
  MapPinIcon, 
  ChevronRightIcon, 
  PlusCircleIcon,
  ChevronDownIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  InformationCircleIcon,
  BookmarkIcon,
  AcademicCapIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { SIGN_NAMES } from '../constants';
import ZodiacIcon from './ZodiacIcon';
import MonthlyAstroCalendar from './MonthlyAstroCalendar';

const Align27Dashboard: React.FC = () => {
  const score = 82;
  
  // High-fidelity Lunar Day generation
  const lunarDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    const tithiNum = (10 + i) % 30 || 30;
    return {
      date: d,
      tithi: tithiNum,
      phase: tithiNum <= 15 ? 'Waxing' : 'Waning',
      isToday: i === 3,
      label: tithiNum === 15 ? 'Purnima' : tithiNum === 30 ? 'Amavasya' : `Tithi ${tithiNum}`
    };
  });

  // Comprehensive Tithi Metadata
  const tithiInfo = {
    name: 'Trayodashi',
    number: 13,
    type: 'Jaya (Victory)',
    ruler: 'Kamadeva (Deity of Desire)',
    rulingPlanet: Planet.Venus,
    essence: 'This lunar day resonates with the energy of fulfillment, social charisma, and luxury. It is excellent for strengthening relationships and initiating creative ventures.',
    dos: ['Social gatherings', 'New investments', 'Healing rituals', 'Creative launches'],
    donts: ['Argumentative speech', 'Isolation', 'Lending large sums']
  };

  const recentCharts = [
    { name: 'Raghav Sanoriya', age: 28, zodiac: 'Libra', sign: Sign.Libra },
    { name: 'Priya Sharma', age: 31, zodiac: 'Taurus', sign: Sign.Taurus },
    { name: 'Aakash Mehra', age: 34, zodiac: 'Leo', sign: Sign.Leo },
  ];

  const transits = [
    { planet: Planet.Jupiter, aspect: 'Conjunct Uranus', sign: Sign.Taurus, end: '12:28 PM', color: 'bg-emerald-500' },
    { planet: Planet.Moon, aspect: 'Trine Venus', sign: Sign.Pisces, end: '04:15 PM', color: 'bg-emerald-500', highlighted: true },
    { planet: Planet.Sun, aspect: 'Square Pluto', sign: Sign.Capricorn, end: '11:50 AM', color: 'bg-rose-500' },
  ];

  // Enhanced Moon Phase Component
  const MoonPhaseIcon = ({ tithi, active }: { tithi: number, active: boolean }) => {
    const isWaxing = tithi <= 15;
    const progress = isWaxing ? (tithi / 15) : (1 - (tithi - 15) / 15);
    
    return (
      <div className={`relative ${active ? 'w-10 h-10' : 'w-8 h-8'} transition-all duration-500`}>
        {/* Background - Shadowed Moon */}
        <div className={`absolute inset-0 rounded-full ${active ? 'bg-indigo-950/10' : 'bg-slate-200'} border border-slate-300/30`} />
        {/* Foreground - Illuminated Part */}
        <div 
          className={`absolute inset-0 rounded-full ${active ? 'bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.5)]' : 'bg-indigo-700/80'}`}
          style={{
            clipPath: isWaxing 
              ? `inset(0 ${100 - (progress * 100)}% 0 0)` 
              : `inset(0 0 0 ${100 - (progress * 100)}%)`
          }}
        />
        {active && <div className="absolute -inset-1 border border-orange-400 rounded-full animate-ping opacity-20" />}
      </div>
    );
  };

  return (
    <div className="space-y-8 lg:space-y-12 pb-16 animate-in fade-in duration-700">
      
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden bg-white rounded-[40px] border border-[#f1ebe6] p-8 lg:p-10 shadow-sm">
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6 text-center xl:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-[#fcf8f5] rounded-full border border-orange-100">
               <SparklesIcon className="w-4 h-4 text-orange-500 animate-pulse" />
               <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Alignment: 82% Flow</span>
            </div>
            
            <div className="space-y-2">
               <h1 className="text-4xl lg:text-5xl font-black text-slate-700 tracking-tighter leading-[1.1]">
                 Good Evening,<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-orange-500">Raghav Sanoriya</span>
               </h1>
               <p className="text-base lg:text-lg font-medium text-[#8c7e74] max-w-2xl mx-auto xl:mx-0 leading-relaxed">
                 The <span className="text-orange-600 font-bold">Moon</span> is transiting your 9th house of Dharma. This is a powerful window for expansion.
               </p>
            </div>

            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3">
               <button className="px-8 py-3.5 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all">Today's Protocol</button>
               <button className="px-8 py-3.5 bg-white border-2 border-[#f1ebe6] text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">View Full Chart</button>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center group">
             <div className="w-[240px] h-[240px] relative">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                   <circle cx="120" cy="120" r="100" stroke="#f1ebe6" strokeWidth="12" fill="transparent" strokeDasharray="6 8" />
                   <circle 
                     cx="120" cy="120" r="100" 
                     stroke="url(#gradientScore)" strokeWidth="16" fill="transparent" 
                     strokeDasharray={2 * Math.PI * 100} 
                     strokeDashoffset={2 * Math.PI * 100 - (score / 100) * 2 * Math.PI * 100}
                     strokeLinecap="round"
                     className="transition-all duration-1000 ease-out" 
                   />
                   <defs>
                      <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="0%">
                         <stop offset="0%" stopColor="#f97316" />
                         <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                   </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                   <span className="text-7xl font-black text-slate-700 tracking-tighter group-hover:scale-110 transition-transform">{score}</span>
                   <span className="text-[9px] font-black text-[#8c7e74] uppercase tracking-[0.3em] mt-1">Matrix Score</span>
                </div>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-500/5 blur-[120px] rounded-full translate-x-1/2" />
      </div>

      {/* 2. LUNAR CYCLE PROGRESSION STRIP */}
      <div className="space-y-6 px-2">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
                  <MoonIcon className="w-6 h-6 text-indigo-600" />
               </div>
               <h2 className="text-xl font-black text-slate-700 tracking-tight">Lunar Progression (Chandra)</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
               <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
               Current Phase: {lunarDays[3].phase}
            </div>
         </div>

         <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
            {lunarDays.map((day, i) => (
               <div 
                 key={i} 
                 className={`snap-center flex flex-col items-center min-w-[84px] p-5 rounded-[24px] border transition-all duration-300 cursor-default
                   ${day.isToday 
                     ? 'bg-indigo-100 border-indigo-300 shadow-xl shadow-indigo-500/10 scale-105' 
                     : 'bg-white border-[#f1ebe6] hover:border-indigo-300'}`}
               >
                  <p className={`text-[10px] font-black uppercase mb-4 tracking-widest ${day.isToday ? 'text-indigo-600' : 'text-[#8c7e74]'}`}>
                    {day.date.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </p>
                  
                  <MoonPhaseIcon tithi={day.tithi} active={day.isToday} />
                  
                  <div className="mt-4 text-center">
                    <p className={`text-sm font-black ${day.isToday ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {day.tithi}
                    </p>
                    <p className={`text-[8px] font-bold uppercase tracking-tighter mt-0.5 ${day.isToday ? 'text-orange-600' : 'text-slate-400'}`}>
                      {day.label}
                    </p>
                  </div>
                  {day.isToday && <div className="mt-2 w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" />}
               </div>
            ))}
         </div>
      </div>

      {/* 3. MONTHLY ASTRO FORECAST CALENDAR */}
      <MonthlyAstroCalendar />

      {/* 4. CORE ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* LEFT COLUMN: TITHI WISDOM */}
        <div className="lg:col-span-7 space-y-8">
           <div className="bg-white rounded-[40px] border border-[#f1ebe6] p-10 shadow-sm relative overflow-hidden group hover:shadow-xl transition-shadow duration-500">
              <div className="relative z-10 space-y-10">
                 <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-orange-100">
                             Nithya Tithi Guide
                          </span>
                       </div>
                       <h3 className="text-4xl font-black text-slate-700 tracking-tighter">{tithiInfo.name}</h3>
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
                             <ShieldCheckIcon className="w-4 h-4" /> {tithiInfo.type}
                          </span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-xs font-bold text-[#8c7e74]">Ruling Day {tithiInfo.number}</span>
                       </div>
                    </div>
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 shadow-inner rotate-3 group-hover:rotate-6 transition-transform overflow-hidden relative">
                       <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-orange-500/10 opacity-50" />
                       <div className="relative z-10 text-indigo-600">
                          <MoonIcon className="w-12 h-12" />
                       </div>
                    </div>
                 </div>

                 {/* Essence Block */}
                 <div className="p-8 bg-[#fcf8f5] rounded-3xl border border-orange-100/50 relative">
                    <SparklesIcon className="absolute top-4 right-4 w-6 h-6 text-orange-200" />
                    <p className="text-base font-medium text-slate-700 leading-relaxed italic">
                       "{tithiInfo.essence}"
                    </p>
                 </div>

                 {/* Action Matrix */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-5">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                          <HandThumbUpIcon className="w-5 h-5" /> Peak Resonances
                       </h4>
                       <ul className="space-y-3">
                          {tithiInfo.dos.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 group/item">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover/item:scale-150 transition-transform" />
                               <span className="text-sm font-black text-slate-700">{item}</span>
                            </li>
                          ))}
                       </ul>
                    </div>
                    <div className="space-y-5 border-l border-slate-100 pl-10">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 flex items-center gap-2">
                          <HandThumbDownIcon className="w-5 h-5" /> Static Interferences
                       </h4>
                       <ul className="space-y-3">
                          {tithiInfo.donts.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 group/item">
                               <div className="w-2 h-2 rounded-full bg-rose-400 group-hover/item:scale-150 transition-transform" />
                               <span className="text-sm font-bold text-[#8c7e74]">{item}</span>
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>

                 {/* Technical Lordship */}
                 <div className="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-8">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                             <AcademicCapIcon className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Presiding Presence</p>
                             <p className="text-sm font-black text-slate-700">{tithiInfo.ruler}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                             <StarIcon className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vara Lord Sync</p>
                             <p className="text-sm font-black text-slate-700">{tithiInfo.rulingPlanet}</p>
                          </div>
                       </div>
                    </div>
                    <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2 group">
                       Analysis Protocol <ChevronRightIcon className="w-4 h-4 group-hover:text-indigo-600" />
                    </button>
                 </div>
              </div>
           </div>

           {/* TRANSITS SUB-GRID */}
           <div className="bg-white rounded-[40px] border border-[#f1ebe6] p-10 space-y-8 shadow-sm">
              <div className="flex justify-between items-end">
                 <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-700">Live Transits (Gochar)</h2>
                    <p className="text-sm font-medium text-[#8c7e74]">Real-time spatial harmonics.</p>
                 </div>
                 <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active Link</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {transits.map((t, i) => (
                   <div key={i} className={`group p-6 rounded-3xl border-2 transition-all duration-300 ${t.highlighted ? 'bg-orange-50/50 border-orange-200' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/50'}`}>
                      <div className="flex items-center justify-between mb-4">
                         <div className={`w-12 h-12 rounded-2xl ${t.color} flex items-center justify-center text-white text-xl shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                            {t.planet === Planet.Moon ? <MoonIcon className="w-6 h-6" /> : t.planet === Planet.Sun ? <SunIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
                         </div>
                         <div className="text-right">
                            <div className="flex items-center justify-end gap-2">
                               <ZodiacIcon sign={t.sign} className="w-5 h-5 text-indigo-600" />
                               <p className="font-black text-xs text-slate-700">{SIGN_NAMES[t.sign]}</p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <p className="font-black text-lg text-slate-700">{t.planet}</p>
                         <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.aspect}</p>
                            <p className="text-[9px] font-black text-orange-500 uppercase">Until {t.end}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: PANCHANG & RECENT */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-indigo-50 rounded-[48px] p-10 lg:p-12 text-slate-700 border border-indigo-100 relative overflow-hidden shadow-sm">
              <div className="relative z-10 space-y-12">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h2 className="text-2xl font-black tracking-tight">Panchang</h2>
                       <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em]">The Five Limbs of Time</p>
                    </div>
                    <div className="w-14 h-14 bg-white rounded-2xl border border-indigo-200/50 shadow-sm flex items-center justify-center">
                       <ClockIcon className="w-7 h-7 text-orange-500" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px] group hover:bg-emerald-500/10 transition-colors">
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Abhijit Muhurta</p>
                       <p className="text-2xl font-black">11:58 - 12:54</p>
                       <p className="text-[9px] font-bold text-emerald-500/50 mt-1 uppercase">Peak Productivity</p>
                    </div>
                    <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-[32px] group hover:bg-rose-500/10 transition-colors">
                       <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Rahu Kaal</p>
                       <p className="text-2xl font-black">03:59 - 05:41</p>
                       <p className="text-[9px] font-bold text-rose-500/50 mt-1 uppercase">Shadow Activity</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {[
                      { label: 'Tithi', val: 'Trayodashi', sub: 'Shukla Paksha', icon: MoonIcon },
                      { label: 'Nakshatra', val: 'Mula', sub: 'Ketu Ruling', icon: SparklesIcon },
                      { label: 'Yoga', val: 'Siddhi', sub: 'Achievement Focus', icon: BoltIcon },
                      { label: 'Vara', val: 'Tuesday', sub: 'Mars Day (Mangala)', icon: FireIcon }
                    ].map((p, i) => (
                      <div key={i} className="flex justify-between items-center group cursor-default">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl border border-indigo-100 flex items-center justify-center text-indigo-400 group-hover:text-indigo-600 transition-colors">
                               <p.icon className="w-5 h-5" />
                            </div>
                            <div>
                               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-0.5">{p.label}</span>
                               <span className="text-lg font-black text-slate-700">{p.val}</span>
                            </div>
                         </div>
                         <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-tighter group-hover:text-indigo-500 transition-colors">{p.sub}</span>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />
           </div>

           <div className="bg-white rounded-[40px] border border-[#f1ebe6] p-10 shadow-sm flex flex-col min-h-[440px]">
              <div className="flex items-center justify-between mb-10">
                 <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-700">Vedic Vault</h2>
                    <p className="text-xs font-medium text-[#8c7e74]">Stored charts for quick recall.</p>
                 </div>
                 <button className="w-12 h-12 bg-orange-500 text-white rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-center hover:rotate-90 transition-all duration-500 active:scale-90">
                    <PlusCircleIcon className="w-7 h-7" />
                 </button>
              </div>
              
              <div className="space-y-4 flex-1">
                 {recentCharts.map((c, i) => (
                   <div key={i} className="flex items-center justify-between p-5 bg-[#fcf8f5] rounded-[24px] border border-transparent hover:border-orange-100 hover:bg-white transition-all group cursor-pointer">
                      <div className="flex items-center gap-5">
                         <div className="w-14 h-14 rounded-2xl bg-white border border-[#f1ebe6] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                            <ZodiacIcon sign={c.sign} className="w-8 h-8 text-orange-500" />
                         </div>
                         <div>
                            <p className="font-black text-base text-slate-700">{c.name}</p>
                            <p className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest">{SIGN_NAMES[c.sign]} Ascendant • {c.age} Yrs</p>
                         </div>
                      </div>
                      <div className="p-2 bg-white rounded-xl text-slate-300 group-hover:text-orange-500 transition-colors">
                        <ChevronRightIcon className="w-5 h-5" />
                      </div>
                   </div>
                 ))}
              </div>
              
              <button className="mt-10 w-full py-5 bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all group active:scale-95 shadow-lg shadow-indigo-900/10">
                 Manage Master Repository <BookmarkIcon className="w-4 h-4 group-hover:animate-bounce" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Align27Dashboard;
