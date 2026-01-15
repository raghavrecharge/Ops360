
import React, { useMemo } from 'react';
import { DivisionalChart, Planet, Sign } from '../types';
import { SIGN_NAMES } from '../constants';
import { 
  InformationCircleIcon, 
  BoltIcon,
  GlobeAltIcon,
  FingerPrintIcon,
  BeakerIcon,
  CpuChipIcon,
  SparklesIcon,
  UserIcon,
  ShieldCheckIcon,
  StarIcon,
  TableCellsIcon,
  AcademicCapIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import ZodiacIcon from './ZodiacIcon';
import { astrologyService } from '../services/astrologyService';

interface Props {
  chart: DivisionalChart;
}

const PlanetDetailsTable: React.FC<Props> = ({ chart }) => {
  const sortedPoints = useMemo(() => {
    return [...chart.points].sort((a, b) => {
      const order = [Planet.Lagna, Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn, Planet.Rahu, Planet.Ketu];
      return order.indexOf(a.planet) - order.indexOf(b.planet);
    });
  }, [chart]);

  const lagna = useMemo(() => chart.points.find(p => p.planet === Planet.Lagna), [chart]);
  
  const lagnaLordDetails = useMemo(() => {
    if (!lagna) return null;
    const signLord = lagna.signLord;
    if (!signLord) return null;
    
    const ruledHouses = astrologyService.getHouseLordship(chart, signLord);
    const lordPoint = chart.points.find(p => p.planet === signLord);
    
    return {
      lord: signLord,
      houses: ruledHouses,
      placement: lordPoint ? `House ${lordPoint.house}` : 'Unknown',
      dignity: lordPoint?.dignity || 'Neutral',
      sign: lordPoint?.sign || Sign.Aries
    };
  }, [chart, lagna]);

  const formatDegrees = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'`;
  };

  const getDignityStyle = (dignity?: string) => {
    switch (dignity) {
      case 'Exalted': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Debilitated': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Own Sign': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getLagnaLordInfluence = () => {
    if (!lagnaLordDetails) return "";
    const houses = lagnaLordDetails.houses.join(" & ");
    return `The Lagna Lord (${lagnaLordDetails.lord}) rules the ${houses} house(s). Its placement in ${lagnaLordDetails.placement} acts as the primary driver for your physical existence and general success. ${lagnaLordDetails.dignity === 'Exalted' ? 'The soul is highly empowered in this incarnation.' : lagnaLordDetails.dignity === 'Debilitated' ? 'Growth comes through navigating specific karmic challenges.' : 'The life path follows a steady, consistent trajectory.'}`;
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* 1. ASCENDANT (LAGNA) SPOTLIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-indigo-50 border border-indigo-100 rounded-[32px] p-6 lg:p-10 flex flex-col md:flex-row items-center gap-6 lg:gap-10 relative overflow-hidden group shadow-sm">
           <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center border border-indigo-200 group-hover:rotate-12 transition-transform shrink-0 relative">
              <ZodiacIcon sign={lagna?.sign || Sign.Aries} className="w-14 h-14 text-indigo-600 relative z-10" />
           </div>
           <div className="space-y-5 flex-1 text-center md:text-left relative z-10">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                 <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10">Primary Life Blueprint</span>
                 <span className="px-4 py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{chart.varga} Orientation</span>
              </div>
              <div className="space-y-1">
                <h2 className="text-4xl lg:text-5xl font-black text-slate-800 tracking-tighter leading-none">
                  {SIGN_NAMES[lagna?.sign || Sign.Aries]} <span className="text-indigo-600">Ascendant</span>
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{lagna?.nakshatra} Nakshatra • Pada {lagna?.pada}</p>
              </div>
              <div className="p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-sm">
                 <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                    <InformationCircleIcon className="w-4 h-4 text-indigo-500 inline mr-1" />
                    {getLagnaLordInfluence()}
                 </p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-[#f1ebe6] rounded-[32px] p-8 flex flex-col justify-between gap-8 shadow-md relative overflow-hidden">
           <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ascendant Ruler (Lord)</p>
                    <h3 className="text-3xl font-black text-slate-800">{lagnaLordDetails?.lord}</h3>
                 </div>
                 <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <AcademicCapIcon className="w-7 h-7 text-indigo-500" />
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                       <MapPinIcon className="w-3.5 h-3.5" /> Placement
                    </p>
                    <p className="text-lg font-black text-slate-800">{lagnaLordDetails?.placement}</p>
                 </div>
                 <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100">
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                       <ShieldCheckIcon className="w-3.5 h-3.5" /> Dignity
                    </p>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${getDignityStyle(lagnaLordDetails?.dignity)} px-2 py-0.5 rounded`}>
                       {lagnaLordDetails?.dignity}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. PLANETARY GRID TABLE */}
      <div className="bg-white rounded-[40px] border border-[#f1ebe6] shadow-sm overflow-hidden">
        <div className="px-6 lg:px-10 py-6 border-b border-[#f1ebe6] flex flex-col md:flex-row items-center justify-between bg-slate-50/30 gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                <TableCellsIcon className="w-6 h-6 text-slate-400" />
             </div>
             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Varga Composition Details</h3>
          </div>
          <div className="flex items-center gap-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
             <span className="flex items-center gap-1.5 whitespace-nowrap"><StarIcon className="w-4 h-4 text-amber-500" /> Siderial</span>
             <span className="w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0" />
             <span className="flex items-center gap-1.5 whitespace-nowrap text-emerald-600"><ShieldCheckIcon className="w-4 h-4" /> Calculations Verified</span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#f1ebe6]">
                <th className="px-6 lg:px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sticky left-0 bg-slate-50 z-10">Entity</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">House</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sign Resonance</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nakshatra Mapping</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Symbolism</th>
                <th className="px-6 lg:px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Dignity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1ebe6]">
              {sortedPoints.map((p, idx) => (
                <tr key={idx} className="hover:bg-orange-50/10 transition-all group">
                  <td className="px-6 lg:px-10 py-6 sticky left-0 bg-white group-hover:bg-orange-50/10 z-10 transition-colors border-r border-[#f1ebe6]/50">
                    <div className="flex items-center gap-4 lg:gap-5">
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-sm transition-all duration-300 ${p.planet === Planet.Lagna ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-white border border-[#f1ebe6] text-slate-800'}`}>
                        {p.planet === Planet.Lagna ? 'ASC' : p.planet.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm lg:text-base font-black text-slate-800">{p.planet}</p>
                        {p.isRetrograde && p.planet !== Planet.Lagna ? (
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                            <BoltIcon className="w-3 h-3" /> Vakri
                          </span>
                        ) : (
                          <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5 tracking-widest">Direct</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-black border border-indigo-100/50">
                      {p.house}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0">
                        <ZodiacIcon sign={p.sign} className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-800">{SIGN_NAMES[p.sign]}</p>
                          <p className="text-xs font-mono font-black text-orange-500">{formatDegrees(p.degree)}</p>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5 tracking-widest">Lord: {p.signLord?.substring(0,3)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <p className="text-sm font-black text-slate-800">{p.nakshatra}</p>
                         <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-600 uppercase">P{p.pada}</span>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Ruler: <span className="text-slate-800">{p.nakshatraLord}</span>
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                         <FingerPrintIcon className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-xs font-black text-slate-800">{p.nakshatraDeity || 'Celestial'}</p>
                         <p className="text-[9px] font-black text-slate-400 uppercase italic line-clamp-1">{p.nakshatraSymbol || 'Primary'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 lg:px-10 py-6 text-right">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all ${getDignityStyle(p.dignity)}`}>
                      {p.dignity || 'Neutral'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanetDetailsTable;