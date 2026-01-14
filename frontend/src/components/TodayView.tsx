
import React, { useMemo } from 'react';
import { TransitContext, Planet, Sign, ChartPoint } from '../types';
import { SIGN_NAMES, PLANET_ORDER } from '../constants';
import { 
  SunIcon, 
  MoonIcon, 
  BoltIcon, 
  GlobeAltIcon, 
  ClockIcon, 
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowPathRoundedSquareIcon,
  InformationCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import ZodiacIcon from './ZodiacIcon';

interface Props {
  data: TransitContext;
}

const TodayView: React.FC<Props> = ({ data }) => {
  const { panchang, transits, horaLord, isAuspicious } = data;

  const getPlanetIcon = (planet: Planet) => {
    switch(planet) {
      case Planet.Sun: return <SunIcon className="w-5 h-5 text-orange-500" />;
      case Planet.Moon: return <MoonIcon className="w-5 h-5 text-indigo-400" />;
      case Planet.Mars: return <BoltIcon className="w-5 h-5 text-rose-500" />;
      case Planet.Jupiter: return <SparklesIcon className="w-5 h-5 text-amber-500" />;
      case Planet.Saturn: return <ArrowPathRoundedSquareIcon className="w-5 h-5 text-slate-600" />;
      case Planet.Venus: return <SparklesIcon className="w-5 h-5 text-pink-400" />;
      case Planet.Mercury: return <GlobeAltIcon className="w-5 h-5 text-emerald-500" />;
      default: return <SparklesIcon className="w-5 h-5 text-amber-500" />;
    }
  };

  const getTransitInsight = (planet: Planet, house: number) => {
    const insights: Record<string, Record<number, string>> = {
      [Planet.Sun]: {
        1: "Personal vitality peaks; good for starting new projects.",
        10: "Career recognition incoming; professional efforts pay off.",
        7: "Focus on partnerships; avoid ego clashes with others."
      },
      [Planet.Moon]: {
        4: "Emotional focus on home and family comfort.",
        8: "Deep intuitive insights; stay away from financial risks.",
        12: "Need for solitude and rest; spiritual detachment."
      },
      [Planet.Saturn]: {
        8: "A time of transformation and discipline in research.",
        1: "Maturity phase; heavy responsibilities on the self.",
        10: "Diligent work leads to long-term professional stability."
      }
    };
    return insights[planet]?.[house] || "Dynamic cosmic energy moving through your matrix.";
  };

  const sortedTransits = useMemo(() => {
    return [...transits.points]
      .filter(p => p.planet !== Planet.Lagna)
      .sort((a, b) => {
        const order = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn, Planet.Rahu, Planet.Ketu];
        return order.indexOf(a.planet) - order.indexOf(b.planet);
      });
  }, [transits]);

  // Transit Wheel Data
  const wheelRadius = 160;
  const signs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      
      {/* 1. HERO GOCHAR HEADER */}
      <div className="bg-white border border-[#f1ebe6] rounded-[48px] p-10 lg:p-12 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6 text-center xl:text-left">
            <div className="inline-flex items-center gap-4">
              <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border shadow-sm ${isAuspicious ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {isAuspicious ? 'Protocol: Favorable' : 'Protocol: Moderate'}
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <ClockIcon className="w-4 h-4" /> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-slate-700 leading-[1.1]">
                Live <span className="text-orange-500">Gochar</span> Matrix
              </h2>
              <p className="text-base lg:text-lg font-medium text-[#8c7e74] max-w-2xl leading-relaxed">
                Current planetary vibrations mapped relative to your <span className="text-indigo-600 font-bold">Natal Lagna</span>. The sky is a mirror of your evolving timeline.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-10 bg-[#fcf8f5] p-8 rounded-[40px] border border-[#f1ebe6] shadow-inner relative group">
             <div className="text-center space-y-3 group-hover:scale-105 transition-transform">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#8c7e74]">Vara Lord</p>
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-orange-500 shadow-md mx-auto relative overflow-hidden">
                   <div className="absolute inset-0 bg-orange-500/5 animate-pulse" />
                   <SunIcon className="w-8 h-8 relative z-10" />
                </div>
                <p className="text-sm font-black text-slate-700 uppercase">{panchang.dayLord}</p>
             </div>
             <div className="w-px h-20 bg-slate-200" />
             <div className="text-center space-y-3 group-hover:scale-105 transition-transform">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#8c7e74]">Active Hora</p>
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-500 shadow-md mx-auto relative overflow-hidden">
                   <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
                   <ClockIcon className="w-8 h-8 relative z-10" />
                </div>
                <p className="text-sm font-black text-slate-700 uppercase">{horaLord}</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* 2. TRANSIT WHEEL & CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: Visual Transit Wheel (4/12) */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white p-2 rounded-[56px] border border-[#f1ebe6] shadow-sm relative overflow-hidden">
              <div className="bg-[#fcf8f5] rounded-[48px] p-8 lg:p-10 flex flex-col items-center justify-center aspect-square relative overflow-hidden">
                 <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-12 pointer-events-none scale-150">
                    <SparklesIcon className="w-full h-full" />
                 </div>
                 
                 <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                    <circle cx="200" cy="200" r="180" fill="white" stroke="#f1ebe6" strokeWidth="1" />
                    <circle cx="200" cy="200" r="140" fill="none" stroke="#f1ebe6" strokeWidth="0.5" strokeDasharray="4 4" />
                    
                    {/* Zodiac Signs Segments */}
                    {signs.map((s, i) => {
                      const angle = (i * 30) - 90;
                      const rad = (angle * Math.PI) / 180;
                      const x = 200 + 155 * Math.cos(rad);
                      const y = 200 + 155 * Math.sin(rad);
                      return (
                        <g key={s}>
                           <line x1="200" y1="200" x2={200 + 180 * Math.cos((i * 30 + 15) * Math.PI / 180)} y2={200 + 180 * Math.sin((i * 30 + 15) * Math.PI / 180)} stroke="#f1ebe6" strokeWidth="0.5" />
                           <foreignObject x={x - 12} y={y - 12} width="24" height="24">
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                 <ZodiacIcon sign={s as Sign} className="w-5 h-5" />
                              </div>
                           </foreignObject>
                        </g>
                      );
                    })}

                    {/* Transiting Planets */}
                    {sortedTransits.map((p, i) => {
                       const signIndex = signs.indexOf(p.sign);
                       const angle = (signIndex * 30) + (p.degree) - 90;
                       const rad = (angle * Math.PI) / 180;
                       const x = 200 + 110 * Math.cos(rad);
                       const y = 200 + 110 * Math.sin(rad);
                       return (
                         <g key={i} className="group cursor-pointer">
                            <circle cx={x} cy={y} r="18" fill="white" stroke="#f1ebe6" strokeWidth="1" className="shadow-lg group-hover:r-22 transition-all" />
                            <foreignObject x={x-9} y={y-9} width="18" height="18">
                               <div className="w-full h-full flex items-center justify-center transition-transform group-hover:scale-125">
                                  {getPlanetIcon(p.planet)}
                               </div>
                            </foreignObject>
                            {/* Connector to sign */}
                            <line x1={x} y1={y} x2={200 + 140 * Math.cos(rad)} y2={200 + 140 * Math.sin(rad)} stroke="#f1ebe6" strokeWidth="0.5" />
                         </g>
                       );
                    })}

                    <text x="200" y="200" textAnchor="middle" dy=".3em" className="text-[10px] font-black uppercase tracking-[0.5em] fill-indigo-200">Gochar Wheel</text>
                 </svg>

                 <div className="absolute bottom-10 flex gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Real-time Feed</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] space-y-6">
              <h4 className="text-lg font-black text-indigo-900 flex items-center gap-3">
                 <ShieldCheckIcon className="w-5 h-5 text-indigo-500" /> Daily Gochara Rule
              </h4>
              <p className="text-sm font-medium text-indigo-800 leading-relaxed italic">
                 "Transit results are best experienced when mapped from the Natal Moon (Chandra Lagna) for emotional impacts and Natal Lagna for physical manifestation."
              </p>
              <div className="pt-4 border-t border-indigo-200/50 flex items-center justify-between">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Ayanamsa: Lahiri</span>
                 <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    Ephemeris Data <ChevronRightIcon className="w-3.5 h-3.5" />
                 </button>
              </div>
           </div>
        </div>

        {/* RIGHT: Transit Feed Cards (7/12) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between px-6">
             <div className="flex items-center gap-4">
                <h3 className="text-xl font-black text-slate-700">Spatial Resonance</h3>
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                   <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Sync</span>
                </div>
             </div>
             <p className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest">Mapping: Transit to Natal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedTransits.map((p, i) => (
              <div key={i} className="group bg-white p-8 rounded-[40px] border border-[#f1ebe6] hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500 flex flex-col gap-6 relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] bg-[#fcf8f5] border border-[#f1ebe6] flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
                      {getPlanetIcon(p.planet)}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-700 tracking-tight">{p.planet}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                            <ZodiacIcon sign={p.sign} className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{SIGN_NAMES[p.sign]}</span>
                         </div>
                         <span className="text-[10px] font-mono font-bold text-slate-400">{Math.floor(p.degree)}°{Math.floor((p.degree % 1) * 60)}'</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-orange-500 text-white px-4 py-1.5 rounded-2xl shadow-lg shadow-orange-500/20">
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">Transit House</p>
                       <p className="text-xl font-black leading-none">H{p.house}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 relative z-10 flex-1 flex flex-col">
                   <div className="p-6 bg-[#fcf8f5] rounded-3xl border border-transparent group-hover:border-orange-100 transition-colors flex-1">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <InformationCircleIcon className="w-4 h-4" /> Gochar Insight
                      </p>
                      <p className="text-[14px] font-bold text-slate-700 leading-relaxed italic">
                        "{getTransitInsight(p.planet, p.house)}"
                      </p>
                   </div>

                   <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <span>Journey through {SIGN_NAMES[p.sign]}</span>
                         <span className="text-slate-700">{((p.degree / 30) * 100).toFixed(0)}% Complete</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${(p.degree / 30) * 100}%` }}
                        />
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 relative z-10">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {p.nakshatra}
                   </div>
                   <div className="flex items-center gap-3">
                      <span>P{p.pada}</span>
                      <ArrowTrendingUpIcon className="w-4 h-4 text-orange-400" />
                   </div>
                </div>

                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity">
                   <ZodiacIcon sign={p.sign} className="w-48 h-48" />
                </div>
              </div>
            ))}
          </div>

          {/* MUHURTA WATCH FOOTER SECTION */}
          <div className="bg-white p-10 rounded-[56px] border border-[#f1ebe6] shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500">
                   <ShieldCheckIcon className="w-9 h-9" />
                </div>
                <div>
                   <h4 className="text-xl font-black text-slate-700 tracking-tight">Abhijit Window</h4>
                   <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Propitious alignment active</p>
                </div>
             </div>
             <div className="flex items-center gap-3 bg-slate-50 px-8 py-4 rounded-[28px] border border-slate-100">
                <ClockIcon className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-black text-slate-700">11:58 - 12:44</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayView;
