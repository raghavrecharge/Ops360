
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

  const wheelRadius = 160;
  const signs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 px-1 lg:px-4">
      
      {/* 1. HERO GOCHAR HEADER */}
      <div className="bg-white border border-[#f1ebe6] rounded-[48px] p-8 lg:p-12 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
          <div className="flex-1 space-y-5 text-center xl:text-left">
            <div className="inline-flex items-center gap-3">
              <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${isAuspicious ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {isAuspicious ? 'Protocol: Favorable' : 'Protocol: Moderate'}
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                <ClockIcon className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-slate-800 leading-tight">
                Live <span className="text-orange-500">Gochar</span> Matrix
              </h2>
              <p className="text-sm lg:text-base font-medium text-slate-500 max-w-2xl leading-relaxed">
                Planetary transits relative to your <span className="text-indigo-600 font-bold">Natal Lagna</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 bg-[#fcf8f5] p-6 rounded-[32px] border border-[#f1ebe6] shadow-inner">
             <div className="text-center space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Vara Lord</p>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm mx-auto">
                   <SunIcon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-slate-700 uppercase">{panchang.dayLord}</p>
             </div>
             <div className="w-px h-12 bg-slate-200" />
             <div className="text-center space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Active Hora</p>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm mx-auto">
                   <ClockIcon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-slate-700 uppercase">{horaLord}</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* 2. TRANSIT WHEEL & CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        
        {/* LEFT: Visual Transit Wheel */}
        <div className="lg:col-span-4 order-2 lg:order-1 space-y-6">
           <div className="bg-white p-2 rounded-[48px] border border-[#f1ebe6] shadow-sm relative overflow-hidden">
              <div className="bg-[#fcf8f5] rounded-[40px] p-6 flex flex-col items-center justify-center aspect-square relative overflow-hidden">
                 <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl">
                    <circle cx="200" cy="200" r="180" fill="white" stroke="#f1ebe6" strokeWidth="1" />
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
                                 <ZodiacIcon sign={s as Sign} className="w-4 h-4" />
                              </div>
                           </foreignObject>
                        </g>
                      );
                    })}
                    {sortedTransits.map((p, i) => {
                       const signIndex = signs.indexOf(p.sign);
                       const angle = (signIndex * 30) + (p.degree) - 90;
                       const rad = (angle * Math.PI) / 180;
                       const x = 200 + 110 * Math.cos(rad);
                       const y = 200 + 110 * Math.sin(rad);
                       return (
                         <g key={i}>
                            <circle cx={x} cy={y} r="16" fill="white" stroke="#f1ebe6" strokeWidth="1" className="shadow-lg" />
                            <foreignObject x={x-8} y={y-8} width="16" height="16">
                               <div className="w-full h-full flex items-center justify-center">
                                  {getPlanetIcon(p.planet)}
                               </div>
                            </foreignObject>
                         </g>
                       );
                    })}
                 </svg>
              </div>
           </div>

           <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[32px] space-y-4">
              <h4 className="text-base font-black text-indigo-900 flex items-center gap-2">
                 <ShieldCheckIcon className="w-4 h-4 text-indigo-500" /> Gochara Rule
              </h4>
              <p className="text-xs font-medium text-indigo-800 leading-relaxed italic">
                 "Transit results are mapped from the Natal Moon and Natal Lagna for emotional and physical manifestation."
              </p>
           </div>
        </div>

        {/* RIGHT: Transit Feed Cards */}
        <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedTransits.map((p, i) => {
              const progress = (p.degree / 30) * 100;
              return (
                <div key={i} className="group bg-white p-8 rounded-[40px] border border-[#f1ebe6] hover:border-orange-100 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500 flex flex-col gap-6 relative overflow-hidden h-full">
                  
                  {/* Card Header (Matches user image) */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#fcf8f5] flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        {getPlanetIcon(p.planet)}
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{p.planet}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <div className="bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-2">
                              <ZodiacIcon sign={p.sign} className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{SIGN_NAMES[p.sign]}</span>
                           </div>
                           <span className="text-[10px] font-mono font-bold text-slate-400">{Math.floor(p.degree)}°{Math.floor((p.degree % 1) * 60)}'</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="bg-orange-500 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-orange-500/20">
                          <p className="text-[8px] font-black uppercase opacity-80 leading-none mb-1">House</p>
                          <p className="text-xl font-black leading-none">H{p.house}</p>
                       </div>
                    </div>
                  </div>

                  {/* Insight Block */}
                  <div className="bg-[#fcf8f5] p-5 rounded-3xl border border-orange-100/30 relative z-10 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                       <InformationCircleIcon className="w-4 h-4 text-orange-400" />
                       <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Gochar Insight</span>
                    </div>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                      "{getTransitInsight(p.planet, p.house)}"
                    </p>
                  </div>

                  {/* Progress Section (Matches user image) */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <div className="flex flex-col">
                          <span className="opacity-60 text-[8px] mb-0.5">Journey through</span>
                          <span className="text-slate-500">{SIGN_NAMES[p.sign]}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-slate-800 text-xs">{progress.toFixed(0)}%</span>
                          <span className="opacity-60 text-[8px] block mt-0.5">Complete</span>
                       </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                       <div 
                         className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(249,115,22,0.3)]" 
                         style={{ width: `${progress}%` }}
                       />
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 relative z-10">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        {p.nakshatra}
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="bg-slate-50 px-2 py-0.5 rounded text-slate-500 border border-slate-100">Pada {p.pada}</span>
                        <ArrowTrendingUpIcon className="w-4 h-4 text-orange-400" />
                     </div>
                  </div>

                  {/* Subtle Background Pattern */}
                  <div className="absolute -bottom-6 -right-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                     <ZodiacIcon sign={p.sign} className="w-40 h-40" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Abhijit Window Component (Refined) */}
          <div className="bg-white p-8 rounded-[48px] border border-[#f1ebe6] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                   <ShieldCheckIcon className="w-8 h-8" />
                </div>
                <div>
                   <h4 className="text-xl font-black text-slate-700 tracking-tight">Abhijit Window</h4>
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Active alignment detected</p>
                </div>
             </div>
             <div className="bg-slate-50 px-8 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-orange-500" />
                <span className="text-lg font-black text-slate-700">11:58 - 12:44</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayView;
