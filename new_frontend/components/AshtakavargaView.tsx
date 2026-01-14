import React, { useState } from 'react';
import { AshtakavargaData } from '../services/astrologyService';
import { Planet } from '../types';
import { 
  TableCellsIcon, 
  InformationCircleIcon, 
  ChartBarIcon, 
  ArrowPathIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/outline';
import AshtakavargaChart from './AshtakavargaChart';

interface Props {
  data: AshtakavargaData;
}

const AshtakavargaView: React.FC<Props> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'SAV' | 'BAV'>('SAV');
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(Planet.Sun);
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

  const activePoints = viewMode === 'SAV' ? data.sav : data.bav[selectedPlanet] || Array(12).fill(0);
  const title = viewMode === 'SAV' ? 'Sarvashtakavarga (SAV)' : `${selectedPlanet} Bhinna (BAV)`;

  const planets = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn];

  const getPointsStatus = (points: number, isSAV: boolean) => {
    if (isSAV) {
      if (points >= 30) return { label: 'Exceptional', color: 'text-emerald-500', bg: 'bg-emerald-50' };
      if (points >= 25) return { label: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-50/50' };
      if (points >= 20) return { label: 'Average', color: 'text-amber-500', bg: 'bg-amber-50' };
      return { label: 'Weak', color: 'text-rose-500', bg: 'bg-rose-50' };
    } else {
      if (points >= 6) return { label: 'Great', color: 'text-emerald-500', bg: 'bg-emerald-50' };
      if (points >= 4) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-50/50' };
      return { label: 'Low', color: 'text-rose-400', bg: 'bg-rose-50' };
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* 1. PREMIUM HEADER CONTROL BAR */}
      <div className="bg-white p-10 rounded-[40px] border border-[#f1ebe6] shadow-sm flex flex-col lg:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-8">
           <div className="w-20 h-20 rounded-[24px] bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner">
              <TableCellsIcon className="w-10 h-10 text-indigo-600" />
           </div>
           <div className="space-y-1">
              <h2 className="text-3xl font-black text-[#2d2621] tracking-tight">Ashtakavarga Matrix</h2>
              <div className="flex items-center gap-3">
                 <span className="flex items-center gap-1.5 text-[10px] font-black text-[#8c7e74] uppercase tracking-widest">
                   <AdjustmentsHorizontalIcon className="w-4 h-4 text-indigo-400" /> Numerical Destiny Analysis
                 </span>
                 <span className="w-1 h-1 rounded-full bg-slate-200" />
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Lahiri Ayanamsa</span>
              </div>
           </div>
        </div>

        <div className="flex bg-[#fcf8f5] p-2 rounded-2xl border border-[#f1ebe6]">
           <button 
             onClick={() => setViewMode('SAV')}
             className={`px-10 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'SAV' ? 'bg-[#4f46e5] text-white shadow-xl shadow-indigo-500/20' : 'text-[#8c7e74] hover:text-[#2d2621] hover:bg-white'}`}
           >
             Collective (SAV)
           </button>
           <button 
             onClick={() => setViewMode('BAV')}
             className={`px-10 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'BAV' ? 'bg-[#4f46e5] text-white shadow-xl shadow-indigo-500/20' : 'text-[#8c7e74] hover:text-[#2d2621] hover:bg-white'}`}
           >
             Planetary (BAV)
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Planet/Stats Sidebar (4/12) */}
        <div className="lg:col-span-4 space-y-8">
           {viewMode === 'BAV' && (
             <div className="card-modern p-8 bg-white border-[#f1ebe6] rounded-[40px] shadow-sm">
                <h3 className="text-[11px] font-black text-[#8c7e74] uppercase tracking-[0.3em] mb-8">Celestial Selection</h3>
                <div className="grid grid-cols-1 gap-3">
                   {planets.map(p => (
                     <button
                       key={p}
                       onClick={() => setSelectedPlanet(p)}
                       className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedPlanet === p ? 'bg-indigo-50 border-indigo-300 shadow-md ring-4 ring-indigo-500/5' : 'bg-white border-transparent hover:bg-slate-50'}`}
                     >
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${selectedPlanet === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-[#8c7e74]'}`}>
                             {p.substring(0, 2).toUpperCase()}
                          </div>
                          <span className={`text-base font-black ${selectedPlanet === p ? 'text-indigo-900' : 'text-[#2d2621]'}`}>{p}</span>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Points</p>
                          <p className={`text-sm font-black ${selectedPlanet === p ? 'text-indigo-600' : 'text-slate-600'}`}>{data.planetTotals[p]}</p>
                       </div>
                     </button>
                   ))}
                </div>
             </div>
           )}

           <div className="card-modern p-10 bg-[#1e1b4b] text-white relative overflow-hidden rounded-[40px] shadow-2xl">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8">Vital Statistics</h3>
              <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-6 group cursor-default">
                    <div className="w-16 h-16 rounded-[20px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                       <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-indigo-400/60 tracking-widest">Supreme House</p>
                       <p className="text-3xl font-black text-white">H{data.summary.strongestHouse}</p>
                       <p className="text-[10px] font-bold text-emerald-400 uppercase">{data.sav[data.summary.strongestHouse-1]} Points</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6 group cursor-default">
                    <div className="w-16 h-16 rounded-[20px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-rose-500/50 transition-colors">
                       <ExclamationTriangleIcon className="w-8 h-8 text-rose-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-indigo-400/60 tracking-widest">Critical House</p>
                       <p className="text-3xl font-black text-white">H{data.summary.weakestHouse}</p>
                       <p className="text-[10px] font-bold text-rose-400 uppercase">{data.sav[data.summary.weakestHouse-1]} Points</p>
                    </div>
                 </div>
                 <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">Total Seed Score</span>
                    <span className="text-2xl font-black text-white">{data.totalPoints}</span>
                 </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
           </div>
        </div>

        {/* Center/Right Column: Interactive Chart (8/12) */}
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-white p-2 rounded-[56px] border border-[#f1ebe6] shadow-lg relative overflow-hidden group">
              <div className="bg-[#fffcf9] rounded-[48px] p-12 flex flex-col items-center justify-center relative">
                 <div className="absolute top-12 left-12 flex items-center gap-4">
                    <div className="w-1.5 h-12 bg-indigo-600 rounded-full" />
                    <div>
                       <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] block mb-1">Energy Map</span>
                       <h4 className="text-2xl font-black text-[#2d2621] tracking-tight">{title}</h4>
                    </div>
                 </div>
                 
                 <div className="w-full mt-16 scale-90 md:scale-100">
                    <AshtakavargaChart 
                      sav={activePoints} 
                      title="" 
                      onHouseHover={setHoveredHouse}
                    />
                 </div>

                 <div className="absolute bottom-12 right-12 flex items-center gap-2">
                    <CursorArrowRaysIcon className="w-5 h-5 text-indigo-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hover to Decipher</span>
                 </div>
              </div>
           </div>

           {/* Dynamic Interpretation Card */}
           <div className="card-modern p-10 bg-white border-[#f1ebe6] rounded-[48px] shadow-sm relative overflow-hidden min-h-[200px]">
              <div className="relative z-10 flex flex-col md:flex-row items-start gap-10">
                 <div className="w-24 h-24 rounded-3xl bg-[#fcf8f5] border border-[#f1ebe6] flex items-center justify-center text-3xl font-black text-indigo-600 shadow-inner">
                    {hoveredHouse || data.summary.strongestHouse}
                 </div>
                 <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                       <h3 className="text-2xl font-black text-[#2d2621]">House {hoveredHouse || data.summary.strongestHouse} Resonance</h3>
                       <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getPointsStatus(activePoints[(hoveredHouse || data.summary.strongestHouse) - 1], viewMode === 'SAV').bg} ${getPointsStatus(activePoints[(hoveredHouse || data.summary.strongestHouse) - 1], viewMode === 'SAV').color}`}>
                          {getPointsStatus(activePoints[(hoveredHouse || data.summary.strongestHouse) - 1], viewMode === 'SAV').label} Strength
                       </span>
                    </div>
                    <p className="text-lg font-bold text-[#8c7e74] leading-relaxed">
                       {data.summary.houseInterpretations[(hoveredHouse || data.summary.strongestHouse) - 1]}
                    </p>
                    <div className="flex items-center gap-6 pt-4">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                          <span className="text-[11px] font-black text-[#2d2621] uppercase tracking-widest">Significations:</span>
                          <span className="text-xs font-bold text-slate-500">{data.summary.houseSignifications[(hoveredHouse || data.summary.strongestHouse) - 1]}</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                 <SparklesIcon className="w-48 h-48 text-indigo-900" />
              </div>
           </div>
        </div>
      </div>

      {/* Expanded Matrix Table */}
      <div className="card-modern p-12 bg-white border-[#f1ebe6] rounded-[56px] shadow-sm overflow-hidden">
         <div className="flex justify-between items-center mb-10">
            <div className="space-y-1">
               <h3 className="text-2xl font-black text-[#2d2621]">Numerical Prastara Matrix</h3>
               <p className="text-[10px] font-bold text-[#8c7e74] uppercase tracking-widest">Planetary points (Bindus) per house</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
               <InformationCircleIcon className="w-5 h-5 text-indigo-400" />
               <span className="text-[10px] font-black text-[#8c7e74] uppercase">Matrix Refreshed</span>
            </div>
         </div>

         <div className="overflow-x-auto custom-scrollbar -mx-12">
            <table className="w-full min-w-[1000px] border-collapse text-left">
               <thead>
                  <tr className="bg-[#fcf8f5] border-y border-[#f1ebe6]">
                     <th className="p-8 text-[11px] font-black text-[#8c7e74] uppercase tracking-[0.2em] sticky left-0 bg-[#fcf8f5] z-10">Graha (Planet)</th>
                     {Array.from({length: 12}).map((_, i) => (
                       <th key={i} className="p-8 text-center text-[11px] font-black text-[#8c7e74] uppercase tracking-[0.2em]">H{i+1}</th>
                     ))}
                     <th className="p-8 text-center text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50/30">Total</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#f1ebe6]">
                  {planets.map(p => (
                    <tr key={p} className={`hover:bg-[#fffcf9] transition-colors group ${selectedPlanet === p && viewMode === 'BAV' ? 'bg-indigo-50/20' : ''}`}>
                       <td className="p-8 text-base font-black text-[#2d2621] sticky left-0 bg-white group-hover:bg-[#fffcf9] z-10 border-r border-[#f1ebe6]">
                          <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                {p.substring(0, 2).toUpperCase()}
                             </div>
                             {p}
                          </div>
                       </td>
                       {data.bav[p].map((val, i) => (
                         <td key={i} className={`p-8 text-center text-sm font-black transition-all ${val >= 6 ? 'text-emerald-600 bg-emerald-50/20' : val >= 4 ? 'text-indigo-500 bg-indigo-50/10' : 'text-[#8c7e74]'}`}>
                            {val}
                         </td>
                       ))}
                       <td className="p-8 text-center text-base font-black text-indigo-600 bg-indigo-50/30">{data.planetTotals[p]}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#1e1b4b] text-white">
                     <td className="p-8 text-[11px] font-black uppercase tracking-[0.2em] sticky left-0 bg-[#1e1b4b] z-10 border-r border-white/10">SAV Aggregate</td>
                     {data.sav.map((val, i) => (
                       <td key={i} className={`p-8 text-center text-lg font-black ${val >= 30 ? 'text-emerald-400' : val >= 25 ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {val}
                       </td>
                     ))}
                     <td className="p-8 text-center text-xl font-black text-indigo-400 bg-white/5">{data.totalPoints}</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AshtakavargaView;