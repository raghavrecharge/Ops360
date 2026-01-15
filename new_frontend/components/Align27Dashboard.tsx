
import React from 'react';
import { Align27Moment, Planet, Sign, TransitContext } from '../types';
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

interface Props {
  data: TransitContext | null;
}

const Align27Dashboard: React.FC<Props> = ({ data }) => {
  const score = 82;
  
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

  const tithiInfo = {
    name: 'Trayodashi',
    number: 13,
    type: 'Jaya (Victory)',
    ruler: 'Kamadeva (Deity of Desire)',
    rulingPlanet: Planet.Venus,
    essence: 'This lunar day resonates with fulfillment, social charisma, and luxury. Excellent for creative ventures.',
    dos: ['Social gatherings', 'New investments', 'Healing rituals'],
    donts: ['Argumentative speech', 'Isolation', 'Lending large sums']
  };

  const recentCharts = [
    { name: 'Raghav Sanoriya', age: 28, zodiac: 'Libra', sign: Sign.Libra },
    { name: 'Priya Sharma', age: 31, zodiac: 'Taurus', sign: Sign.Taurus },
  ];

  const MoonPhaseIcon = ({ tithi, active }: { tithi: number, active: boolean }) => {
    const isWaxing = tithi <= 15;
    const progress = isWaxing ? (tithi / 15) : (1 - (tithi - 15) / 15);
    
    return (
      <div className={`relative ${active ? 'w-8 h-8' : 'w-6 h-6'} transition-all duration-500 shrink-0`}>
        <div className={`absolute inset-0 rounded-full ${active ? 'bg-indigo-950/10' : 'bg-slate-100'} border border-slate-300/30`} />
        <div 
          className={`absolute inset-0 rounded-full ${active ? 'bg-orange-400 shadow-lg' : 'bg-indigo-700/80'}`}
          style={{
            clipPath: isWaxing 
              ? `inset(0 ${100 - (progress * 100)}% 0 0)` 
              : `inset(0 0 0 ${100 - (progress * 100)}%)`
          }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-white rounded-[48px] border border-[#f1ebe6] p-8 lg:p-12 shadow-sm">
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
          <div className="flex-1 space-y-6 text-center xl:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-[#fcf8f5] rounded-full border border-orange-100">
               <SparklesIcon className="w-4 h-4 text-orange-500 animate-pulse" />
               <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Alignment: 82% Flow</span>
            </div>
            
            <div className="space-y-2">
               <h1 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter leading-tight">
                 Good Evening,<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-orange-500">Raghav Sanoriya</span>
               </h1>
               <p className="text-sm lg:text-base font-medium text-slate-500 max-w-xl mx-auto xl:mx-0 leading-relaxed">
                 The <span className="text-orange-600 font-bold">Moon</span> is transiting your 9th house of Dharma. A powerful window for expansion.
               </p>
            </div>

            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-3">
               <button className="px-8 py-3 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 active:scale-95 transition-all">Today's Protocol</button>
               <button className="px-8 py-3 bg-white border border-[#f1ebe6] text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 active:scale-95 transition-all">View Full Chart</button>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center">
             <div className="w-48 h-48 relative group">
                <svg className="w-full h-full transform -rotate-90">
                   <circle cx="96" cy="96" r="84" stroke="#f1ebe6" strokeWidth="8" fill="transparent" strokeDasharray="4 6" />
                   <circle 
                     cx="96" cy="96" r="84" 
                     stroke="#f97316" strokeWidth="10" fill="transparent" 
                     strokeDasharray={2 * Math.PI * 84} 
                     strokeDashoffset={2 * Math.PI * 84 - (score / 100) * 2 * Math.PI * 84}
                     strokeLinecap="round"
                     className="transition-all duration-1000 ease-out" 
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                   <span className="text-6xl font-black text-slate-800 tracking-tighter transition-transform group-hover:scale-110">{score}</span>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Flow</span>
                </div>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-500/5 blur-[100px] translate-x-1/2" />
      </div>

      {/* COMPACT LUNAR PROGRESSION (Height Reduced) */}
      <div className="space-y-4 px-2">
         <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-700 tracking-tight flex items-center gap-2">
               <MoonIcon className="w-5 h-5 text-indigo-500" /> Chandra Progression
            </h2>
            <span className="text-[9px] font-black text-indigo-500 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
               {lunarDays[3].phase}
            </span>
         </div>

         <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
            {lunarDays.map((day, i) => (
               <div 
                 key={i} 
                 className={`snap-center flex flex-col items-center min-w-[72px] p-3 rounded-[24px] border transition-all duration-300
                   ${day.isToday 
                     ? 'bg-indigo-50 border-indigo-200 shadow-md scale-105' 
                     : 'bg-white border-[#f1ebe6] hover:border-indigo-100'}`}
               >
                  <p className={`text-[8px] font-black uppercase mb-3 tracking-widest ${day.isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {day.date.toLocaleDateString('en-GB', { weekday: 'short' })}
                  </p>
                  
                  <MoonPhaseIcon tithi={day.tithi} active={day.isToday} />
                  
                  <p className={`text-xs font-black mt-2 ${day.isToday ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {day.tithi}
                  </p>
                  <p className={`text-[7px] font-bold uppercase tracking-tighter ${day.isToday ? 'text-orange-500' : 'text-slate-300'}`}>
                    {day.label.split(' ')[0]}
                  </p>
               </div>
            ))}
         </div>
      </div>

      <MonthlyAstroCalendar />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
           <div className="bg-white rounded-[40px] border border-[#f1ebe6] p-8 shadow-sm relative group overflow-hidden">
              <div className="relative z-10 space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-orange-100">Tithi Analysis</span>
                       <h3 className="text-3xl font-black text-slate-800 tracking-tight">{tithiInfo.name}</h3>
                    </div>
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner group-hover:rotate-6 transition-transform">
                       <MoonIcon className="w-8 h-8" />
                    </div>
                 </div>
                 <div className="p-5 bg-[#fcf8f5] rounded-2xl border border-orange-100/50">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{tithiInfo.essence}"</p>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <h4 className="text-[9px] font-black uppercase text-emerald-600 flex items-center gap-2 tracking-widest"><HandThumbUpIcon className="w-4 h-4" /> Recommended</h4>
                       <ul className="space-y-1.5">
                          {tithiInfo.dos.map((item, idx) => (
                            <li key={idx} className="text-xs font-bold text-slate-800 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {item}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-[9px] font-black uppercase text-rose-600 flex items-center gap-2 tracking-widest"><HandThumbDownIcon className="w-4 h-4" /> Avoid</h4>
                       <ul className="space-y-1.5">
                          {tithiInfo.donts.map((item, idx) => (
                            <li key={idx} className="text-xs font-bold text-slate-500 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-rose-300" /> {item}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <div className="bg-indigo-50 rounded-[40px] p-8 text-slate-700 border border-indigo-100 relative overflow-hidden shadow-sm">
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black">Daily Panchang</h2>
                    <ClockIcon className="w-6 h-6 text-orange-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                       <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Abhijit</p>
                       <p className="text-lg font-black text-slate-800">11:58 - 12:54</p>
                    </div>
                    <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                       <p className="text-[8px] font-black text-rose-600 uppercase mb-1">Rahu Kaal</p>
                       <p className="text-lg font-black text-slate-800">03:59 - 05:41</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    {[
                      { label: 'Nakshatra', val: 'Mula', icon: SparklesIcon },
                      { label: 'Yoga', val: 'Siddhi', icon: BoltIcon },
                      { label: 'Vara', val: 'Tuesday', icon: FireIcon }
                    ].map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/50 p-3 rounded-xl">
                         <div className="flex items-center gap-3">
                            <p.icon className="w-4 h-4 text-indigo-400" />
                            <div>
                               <span className="text-[8px] font-black text-indigo-500 uppercase block leading-none mb-1">{p.label}</span>
                               <span className="text-sm font-black text-slate-800">{p.val}</span>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Align27Dashboard;
