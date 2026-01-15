
import React, { useState, useMemo } from 'react';
import { 
  ChartBarIcon, 
  ArrowPathIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  CloudArrowDownIcon,
  SparklesIcon,
  ShieldCheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  SpeakerWaveIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import { DivisionalChart, Planet, Sign, BirthData, ChartPoint } from '../types';
import { SIGN_NAMES } from '../constants';
import { astrologyService } from '../services/astrologyService';
import VedicChart from './VedicChart';
import PlanetDetailsTable from './PlanetDetailsTable';
import ZodiacIcon from './ZodiacIcon';

interface Props {
  natalChart: DivisionalChart;
  birthData: BirthData;
}

const VARGA_LIST = [
  { value: 1, label: 'D1 Lagna - Physical Body' },
  { value: 2, label: 'D2 Hora - Wealth' },
  { value: 3, label: 'D3 Drekkana - Siblings' },
  { value: 4, label: 'D4 Chaturthamsa - Luck & Property' },
  { value: 7, label: 'D7 Saptamsha - Progeny' },
  { value: 9, label: 'D9 Navamsha - Soul & Marriage' },
  { value: 10, label: 'D10 Dashamsha - Career' },
  { value: 12, label: 'D12 Dwadashamsha - Parents' },
  { value: 16, label: 'D16 Shodashamsha - Vehicles & Comfort' },
  { value: 20, label: 'D20 Vimsamsha - Spirituality' },
  { value: 24, label: 'D24 Chaturvimsamsha - Education' },
  { value: 30, label: 'D30 Trimshamsha - Challenges' },
  { value: 60, label: 'D60 Shashtiamsha - Past Karma' },
];

const NatalChartView: React.FC<Props> = ({ natalChart, birthData }) => {
  const [selectedVarga, setSelectedVarga] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<ChartPoint | null>(null);

  const activeChart = useMemo(() => {
    if (selectedVarga === 1) return natalChart;
    return astrologyService.calculateVarga(natalChart, selectedVarga);
  }, [natalChart, selectedVarga]);

  const handleReset = () => {
    setSelectedVarga(1);
    setSelectedPoint(null);
  };

  const formatDegrees = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'`;
  };

  const houseSignifications: Record<number, string> = {
    1: "Self, Physicality, Life Path",
    2: "Wealth, Family, Speech",
    3: "Siblings, Courage, Communication",
    4: "Home, Comforts, Mother",
    5: "Intelligence, Creativity, Children",
    6: "Enemies, Debts, Diseases",
    7: "Partnerships, Marriage, Public",
    8: "Longevity, Transformation, Secrets",
    9: "Fortune, Dharma, Philosophy",
    10: "Career, Status, Karma",
    11: "Gains, Desires, Friendships",
    12: "Expenses, Loss, Liberation",
  };

  const lagnaPoint = activeChart.points.find(p => p.planet === Planet.Lagna);

  const navamshaDetails = useMemo(() => {
    if (!selectedPoint || !lagnaPoint) return null;
    const calculateD9Sign = (pSign: number, pDegree: number) => {
      const totalDegrees = (pSign - 1) * 30 + pDegree;
      return (Math.floor(totalDegrees * 9 / 30) % 12) + 1;
    };
    const d9Sign = calculateD9Sign(selectedPoint.sign, selectedPoint.degree) as Sign;
    const d9LagnaSign = calculateD9Sign(lagnaPoint.sign, lagnaPoint.degree);
    const d9House = ((d9Sign - d9LagnaSign + 12) % 12) + 1;
    const EXALT_SIGNS: Record<string, Sign> = { Sun: Sign.Aries, Moon: Sign.Taurus, Mars: Sign.Capricorn, Mercury: Sign.Virgo, Jupiter: Sign.Cancer, Venus: Sign.Pisces, Saturn: Sign.Libra };
    const DEBIL_SIGNS: Record<string, Sign> = { Sun: Sign.Libra, Moon: Sign.Scorpio, Mars: Sign.Cancer, Mercury: Sign.Pisces, Jupiter: Sign.Capricorn, Venus: Sign.Virgo, Saturn: Sign.Aries };
    let d9Dignity = "Neutral";
    if (EXALT_SIGNS[selectedPoint.planet] === d9Sign) d9Dignity = "Exalted";
    else if (DEBIL_SIGNS[selectedPoint.planet] === d9Sign) d9Dignity = "Debilitated";
    const isVargottama = d9Sign === selectedPoint.sign;
    return { d9Sign, d9House, d9Dignity, isVargottama };
  }, [selectedPoint, lagnaPoint]);

  const selectedPlanetRemedy = selectedPoint ? astrologyService.getPlanetRemedy(selectedPoint.planet) : null;

  return (
    <div className="space-y-10 lg:space-y-16 pb-24 animate-in fade-in duration-1000 relative">
      {/* 1. CELESTIAL TOOLBOX */}
      <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-[#f1ebe6] shadow-sm flex flex-col xl:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center shadow-inner interactive-element group">
              <ChartBarIcon className="w-8 h-8 text-orange-500 group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Natal Matrix</h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                    <ShieldCheckIcon className="w-3 h-3" /> Ephemeris Verified
                 </span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ayanamsa: Lahiri</span>
              </div>
            </div>
         </div>

         <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full md:w-[320px]">
               <select 
                 value={selectedVarga} 
                 onChange={(e) => { setSelectedVarga(parseInt(e.target.value)); setSelectedPoint(null); }} 
                 className="w-full bg-[#fcf8f5] border border-[#f1ebe6] rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 appearance-none cursor-pointer hover:bg-white transition-colors outline-none focus:ring-4 focus:ring-orange-500/5"
               >
                  {VARGA_LIST.map(v => (<option key={v.value} value={v.value}>{v.label}</option>))}
               </select>
               <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 pointer-events-none" />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={handleReset} 
                className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-[#f97316] text-white rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
              >
                <ArrowPathIcon className="w-5 h-5" /> Reset View
              </button>
            </div>
         </div>
      </div>

      {/* 2. MAIN CHART DISPLAY */}
      <div className="max-w-5xl mx-auto w-full">
         <VedicChart 
           chart={activeChart}
           selectedPlanet={selectedPoint}
           onSelectPlanet={setSelectedPoint}
           title={VARGA_LIST.find(v => v.value === selectedVarga)?.label.split(' - ')[0]}
         />
      </div>

      {/* 3. PLANETARY SPECIFICATIONS */}
      <div className="w-full">
         <div className="flex items-center justify-between mb-8 px-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <InformationCircleIcon className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Mathematical Coordinates</h3>
            </div>
            <button className="flex items-center gap-2 px-6 py-2 bg-white border border-[#f1ebe6] rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all">
               <CloudArrowDownIcon className="w-4 h-4" /> Export Ephemeris
            </button>
         </div>
         <PlanetDetailsTable chart={activeChart} />
      </div>

      {/* 4. PLANET DETAIL POPUP */}
      {selectedPoint && (
        <div className="fixed inset-x-0 bottom-0 md:inset-auto md:right-12 md:bottom-12 z-[9999] bg-white border border-orange-100 shadow-2xl p-6 rounded-t-[32px] md:rounded-[32px] animate-in slide-in-from-bottom-20 duration-500 w-full md:max-w-[480px] max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto mb-6 md:hidden" />
          <button onClick={() => setSelectedPoint(null)} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-orange-50 rounded-full text-orange-500 transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-2xl border border-orange-100 shadow-inner">
                {selectedPoint.planet.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-[#2d2621] text-xl leading-tight">{selectedPoint.planet}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                   <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg uppercase border border-orange-100">House {selectedPoint.house}</span>
                   {selectedPoint.isRetrograde && <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg uppercase border border-rose-100">Vakri</span>}
                   {navamshaDetails?.isVargottama && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase border border-emerald-100 flex items-center gap-1"><ShieldCheckIcon className="w-3 h-3" /> Vargottama</span>}
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-6 space-y-5 shadow-inner">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-emerald-500 rounded-xl shadow-lg">
                        <Square3Stack3DIcon className="w-6 h-6 text-white" />
                     </div>
                     <h4 className="text-sm font-black text-emerald-900 uppercase tracking-[0.2em]">Navamsha Core (D9)</h4>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 text-center flex flex-col items-center justify-center group">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-2">D9 Sign</p>
                     <ZodiacIcon sign={navamshaDetails?.d9Sign || Sign.Aries} className="w-8 h-8 text-emerald-600 mb-1 transition-transform group-hover:scale-110" />
                     <span className="text-xs font-black text-slate-800">{SIGN_NAMES[navamshaDetails?.d9Sign || Sign.Aries]}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 text-center flex flex-col items-center justify-center">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-2">D9 House</p>
                     <span className="text-2xl font-black text-emerald-600">H{navamshaDetails?.d9House}</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 text-center flex flex-col items-center justify-center">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-2">D9 Dignity</p>
                     <span className={`text-[10px] font-black uppercase leading-tight ${navamshaDetails?.d9Dignity === 'Exalted' ? 'text-emerald-500' : 'text-slate-500'}`}>
                        {navamshaDetails?.d9Dignity}
                     </span>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="p-4 bg-[#fcf8f5] rounded-2xl border border-[#f1ebe6]">
                  <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1 flex items-center gap-1.5"><InformationCircleIcon className="w-4 h-4 text-orange-400" /> Significance</p>
                  <p className="text-sm font-bold text-[#2d2621] leading-relaxed">
                    Influencing <span className="text-orange-600">{houseSignifications[selectedPoint.house]}</span>. Dignity: {selectedPoint.dignity || 'Neutral'}.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                    <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1">Nakshatra</p>
                    <p className="text-sm font-black text-orange-600">{selectedPoint.nakshatra}</p>
                    <p className="text-[9px] font-bold text-[#8c7e74] uppercase">Pada {selectedPoint.pada}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                    <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1">Position</p>
                    <div className="flex items-center justify-center gap-1">
                       <ZodiacIcon sign={selectedPoint.sign} className="w-4 h-4 text-indigo-400" />
                       <p className="text-sm font-black text-[#2d2621] font-mono">{formatDegrees(selectedPoint.degree)}</p>
                    </div>
                  </div>
               </div>
            </div>

            {selectedPlanetRemedy && (
              <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-[24px] space-y-2">
                 <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                    <SpeakerWaveIcon className="w-4 h-4" /> Sonic Re-coding
                 </p>
                 <p className="text-sm font-black text-indigo-900 leading-snug font-mono italic">"{selectedPlanetRemedy.mantra}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NatalChartView;
