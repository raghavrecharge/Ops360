
import React from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SparklesIcon, 
  ExclamationCircleIcon,
  CheckBadgeIcon,
  CalendarIcon,
  StarIcon,
  BoltIcon,
  ArrowRightCircleIcon
} from '@heroicons/react/24/outline';
import { Planet, Sign } from '../types';
import { SIGN_NAMES } from '../constants';
import ZodiacIcon from './ZodiacIcon';

interface AstroDay {
  day: number;
  quality: 'Good' | 'Bad' | 'Neutral' | 'Event';
  eventName?: string;
  energyScore: number;
}

const MonthlyAstroCalendar: React.FC = () => {
  const today = new Date();
  const monthName = today.toLocaleDateString('en-GB', { month: 'long' });
  const year = today.getFullYear();

  // Planetary Movements for the month
  const planetaryIngresses = [
    { planet: Planet.Sun, sign: Sign.Aries, date: '14th', label: 'Mesha Sankranti' },
    { planet: Planet.Mars, sign: Sign.Taurus, date: '21st', label: 'Aggressive Shift' },
    { planet: Planet.Venus, sign: Sign.Pisces, date: '05th', label: 'Exaltation Begins' },
  ];

  // Mock forecast logic
  const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, today.getMonth(), 1).getDay();

  const astroForecast: Record<number, AstroDay> = {
    5: { day: 5, quality: 'Good', energyScore: 88 },
    8: { day: 8, quality: 'Event', eventName: 'Ekadashi', energyScore: 95 },
    12: { day: 12, quality: 'Bad', energyScore: 32 },
    15: { day: 15, quality: 'Event', eventName: 'Purnima', energyScore: 98 },
    18: { day: 18, quality: 'Good', energyScore: 82 },
    21: { day: 21, quality: 'Bad', energyScore: 28 },
    25: { day: 25, quality: 'Event', eventName: 'Pradosh', energyScore: 90 },
    28: { day: 28, quality: 'Good', energyScore: 85 },
    30: { day: 30, quality: 'Event', eventName: 'Amavasya', energyScore: 10 },
  };

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(astroForecast[i] || { day: i, quality: 'Neutral', energyScore: 50 });
  }

  const upcomingEvents = Object.values(astroForecast).filter(d => d.quality === 'Event');

  return (
    <div className="bg-white rounded-[48px] border border-[#f1ebe6] shadow-sm overflow-hidden animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-12">
        
        {/* LEFT: Calendar Core (8/12) */}
        <div className="xl:col-span-8 p-10 lg:p-14 border-b xl:border-b-0 xl:border-r border-[#f1ebe6]">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-slate-700 tracking-tight">{monthName} Forecast</h3>
              <p className="text-[10px] font-black text-[#8c7e74] uppercase tracking-[0.3em]">Monthly Energy Mapping</p>
            </div>
            <div className="flex items-center gap-4 bg-[#fcf8f5] p-2 rounded-2xl border border-[#f1ebe6]">
               <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Active Phase</span>
               </div>
               <div className="flex items-center">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronLeftIcon className="w-4 h-4" /></button>
                  <span className="text-sm font-black text-slate-700 px-3">{year}</span>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronRightIcon className="w-4 h-4" /></button>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 lg:gap-4 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center py-2">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3 lg:gap-4">
            {calendarDays.map((d, i) => (
              <div key={i} className="aspect-square relative group">
                {d ? (
                  <div className={`w-full h-full rounded-[24px] flex flex-col items-center justify-center border transition-all cursor-default relative overflow-hidden
                    ${d.day === today.getDate() ? 'bg-slate-800 border-slate-800 shadow-xl' : 'bg-white border-[#f1ebe6] hover:border-orange-200'}
                  `}>
                    <span className={`text-base font-black relative z-10 ${d.day === today.getDate() ? 'text-white' : 'text-slate-700'}`}>
                      {d.day}
                    </span>
                    
                    {/* Visual Energy Indicator */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 h-1 transition-all
                        ${d.quality === 'Good' ? 'bg-emerald-400' : d.quality === 'Bad' ? 'bg-rose-400' : d.quality === 'Event' ? 'bg-orange-400' : 'bg-transparent'}
                      `}
                      style={{ height: d.quality !== 'Neutral' ? '4px' : '0px' }}
                    />

                    {/* Quality Metadata Icon */}
                    {d.quality === 'Event' && <SparklesIcon className="w-3 h-3 absolute top-3 right-3 text-orange-400" />}

                    {/* Desktop Tooltip */}
                    {d.eventName && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none min-w-[140px] drop-shadow-xl">
                        <div className="bg-slate-800 text-white p-3 rounded-xl text-[9px] font-black uppercase text-center tracking-widest border border-slate-700">
                          {d.eventName}
                        </div>
                        <div className="w-3 h-3 bg-slate-800 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full opacity-20 bg-slate-50 rounded-[24px]" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-[#fcf8f5] rounded-[32px] border border-[#f1ebe6]">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Planetary Ingress Feed</h4>
             <div className="flex flex-wrap gap-4">
                {planetaryIngresses.map((move, i) => (
                   <div key={i} className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm group hover:border-orange-200 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                         <ZodiacIcon sign={move.sign} className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{move.date} • {move.label}</p>
                         <p className="text-sm font-black text-slate-700">{move.planet} → {SIGN_NAMES[move.sign]}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT: Auspicious Junctions (4/12) */}
        <div className="xl:col-span-4 p-10 lg:p-14 bg-[#fcf8f5]/30 flex flex-col h-full">
           <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                    <SparklesIcon className="w-6 h-6" />
                 </div>
                 <h4 className="text-2xl font-black text-slate-700 tracking-tight">Key Junctures</h4>
              </div>
           </div>

           <div className="space-y-4 flex-1">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[32px] border border-[#f1ebe6] hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all flex items-center gap-5 group cursor-default">
                   <div className="w-16 h-16 bg-orange-50 rounded-2xl flex flex-col items-center justify-center border border-orange-100 group-hover:scale-105 transition-transform shrink-0">
                      <span className="text-[10px] font-black text-orange-400 uppercase leading-none mb-0.5">{monthName.substring(0,3)}</span>
                      <span className="text-2xl font-black text-orange-600 leading-none">{event.day}</span>
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <p className="text-base font-black text-slate-700 truncate group-hover:text-orange-600 transition-colors">{event.eventName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Vibrational Peak reached</p>
                   </div>
                   <div className="p-3 bg-emerald-50 rounded-2xl">
                      <CheckBadgeIcon className="w-5 h-5 text-emerald-500" />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 p-8 bg-slate-800 rounded-[40px] text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-3">
                    <BoltIcon className="w-5 h-5 text-orange-400" />
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Monthly Energy Pulse</p>
                 </div>
                 <p className="text-[15px] font-bold leading-relaxed italic opacity-90">
                   "Stability is the keyword this month. Jupiter's influence provides a grounding force, making weeks 2 and 4 ideal for long-term asset planning."
                 </p>
                 <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                    Full Narrative Report <ArrowRightCircleIcon className="w-4 h-4" />
                 </button>
              </div>
              <CalendarIcon className="absolute -bottom-10 -right-10 w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform" />
           </div>
        </div>

      </div>
    </div>
  );
};

export default MonthlyAstroCalendar;
