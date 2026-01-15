
import React, { useState, useMemo } from 'react';
import { VarshaphalaData, astrologyService } from '../services/astrologyService';
import NorthIndianChart from './NorthIndianChart.tsx';
import SouthIndianChart from './SouthIndianChart.tsx';
import { 
  CalendarIcon, 
  SparklesIcon, 
  MapPinIcon, 
  ClockIcon, 
  TrophyIcon,
  AcademicCapIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  TableCellsIcon,
  BoltIcon,
  FireIcon,
  HeartIcon,
  CpuChipIcon,
  ArrowPathIcon,
  XMarkIcon,
  ShieldCheckIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import { Sign, ChartPoint, Planet } from '../types';
import ZodiacIcon from './ZodiacIcon';
import { geminiService } from '../services/geminiService';
import PlanetDetailsTable from './PlanetDetailsTable';
import { SIGN_NAMES } from '../constants';

interface Props {
  data: VarshaphalaData;
  onYearChange: (year: number) => void;
  chartStyle?: 'North' | 'South';
}

const VarshaphalaView: React.FC<Props> = ({ data, onYearChange, chartStyle = 'North' }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<ChartPoint | null>(null);
  
  const years = [2023, 2024, 2025, 2026];

  const formatDegrees = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'`;
  };

  const getSignNum = (name: string): Sign => {
    const signs: Record<string, Sign> = {
      'Aries': Sign.Aries, 'Taurus': Sign.Taurus, 'Gemini': Sign.Gemini,
      'Cancer': Sign.Cancer, 'Leo': Sign.Leo, 'Virgo': Sign.Virgo,
      'Libra': Sign.Libra, 'Scorpio': Sign.Scorpio, 'Sagittarius': Sign.Sagittarius,
      'Capricorn': Sign.Capricorn, 'Aquarius': Sign.Aquarius, 'Pisces': Sign.Pisces
    };
    return signs[name] || Sign.Aries;
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const analysis = await geminiService.interpretVarshaphala(data);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const houseSignifications: Record<number, string> = {
    1: "Self, Physicality, Annual Health",
    2: "Wealth, Family Assets, Speech",
    3: "Siblings, Courage, Vitality",
    4: "Home, Comforts, Happiness",
    5: "Intelligence, Speculation, Progeny",
    6: "Enemies, Debts, Challenges",
    7: "Partnerships, Public Interaction",
    8: "Transformation, Secrets, Longevity",
    9: "Fortune, Dharma, Higher Wisdom",
    10: "Career, Karma, Social Status",
    11: "Gains, Desires, Network",
    12: "Expenses, Seclusion, Liberation",
  };

  const lagnaPoint = data.chart.points.find(p => p.planet === Planet.Lagna);

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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 relative">
      {/* Premium Header Bar */}
      <div className="bg-white p-10 rounded-[40px] border border-[#f1ebe6] shadow-sm flex flex-col lg:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-[24px] bg-orange-50 flex items-center justify-center border border-orange-100 shadow-inner">
            <CalendarIcon className="w-10 h-10 text-[#f97316]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-[#2d2621] tracking-tight">Solar Return {data.year}</h2>
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-1.5 text-[10px] font-black text-[#8c7e74] uppercase tracking-widest">
                  <SparklesIcon className="w-4 h-4 text-orange-400" /> Tajika Annual Matrix
               </span>
               <span className="w-1 h-1 rounded-full bg-slate-200" />
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Cycle Active</span>
            </div>
          </div>
        </div>

        <div className="flex bg-[#fcf8f5] p-2 rounded-2xl border border-[#f1ebe6]">
          {years.map(y => (
            <button
              key={y}
              onClick={() => { onYearChange(y); setAiAnalysis(null); }}
              className={`px-10 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${data.year === y ? 'sidebar-active text-white shadow-xl' : 'text-[#8c7e74] hover:text-[#2d2621] hover:bg-white'}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Annual Status & Dashas (4/12) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="card-modern p-10 bg-[#2d2621] text-white relative overflow-hidden rounded-[40px] shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-400/80 mb-8">Annual Master Pillars</h3>
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-5 group cursor-default">
                 <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/50 transition-colors">
                    <TrophyIcon className="w-7 h-7 text-orange-500" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Varsheshwar (Year Lord)</p>
                    <p className="text-2xl font-black text-white">{data.yearLord}</p>
                 </div>
              </div>
              <div className="flex items-center gap-5 group cursor-default">
                 <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/50 transition-colors">
                    <MapPinIcon className="w-7 h-7 text-orange-500" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Muntha Point</p>
                    <p className="text-2xl font-black text-white">{data.munthaSign} <span className="text-orange-500 ml-1">/ H{data.munthaHouse}</span></p>
                 </div>
              </div>
              <div className="flex items-center gap-5 group cursor-default">
                 <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/50 transition-colors">
                    <ClockIcon className="w-7 h-7 text-orange-500" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Annual Ascendant</p>
                    <p className="text-2xl font-black text-white">{data.ascendant}</p>
                 </div>
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="card-modern p-8 bg-white border-[#f1ebe6] rounded-[40px] shadow-sm">
            <h3 className="text-sm font-black text-[#2d2621] mb-8 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <BoltIcon className="w-5 h-5 text-[#f97316]" /> 
                  Mudda Dashas
               </div>
               <span className="text-[9px] font-black text-[#8c7e74] uppercase tracking-[0.2em]">Timeline</span>
            </h3>
            <div className="space-y-3">
              {data.muddaDashas.map((d, i) => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${d.isActive ? 'bg-orange-50 border-orange-200 shadow-md ring-4 ring-orange-500/5' : 'bg-[#fcf8f5] border-transparent hover:border-orange-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[11px] font-black shadow-sm transition-transform ${d.isActive ? 'bg-[#f97316] text-white scale-110' : 'bg-white text-slate-400 border border-slate-100'}`}>
                      {d.planet.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-sm font-black ${d.isActive ? 'text-orange-900' : 'text-[#2d2621]'}`}>{d.planet}</p>
                      <p className="text-[10px] font-bold text-[#8c7e74]">{d.start} — {d.end}</p>
                    </div>
                  </div>
                  {d.isActive && (
                    <div className="w-2 h-2 bg-[#f97316] rounded-full animate-ping" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Precision Tables (8/12) */}
        <div className="lg:col-span-8 space-y-10">
          {/* AI GENERATOR TRIGGER */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[40px] p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-3 flex-1">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
                        <CpuChipIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400">Advanced Analytics</span>
                   </div>
                   <h3 className="text-3xl font-black tracking-tight">Synthesize Annual Narrative</h3>
                   <p className="text-sm font-medium text-slate-400 leading-relaxed max-w-lg">
                     Let the Astro Oracle AI perform a deep-scan of your D1-A matrix, Muntha position, and Tajika Yogas to generate your comprehensive {data.year} strategy.
                   </p>
                </div>
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="px-10 py-5 bg-[#f97316] hover:bg-orange-600 rounded-[20px] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group/btn shadow-xl shadow-orange-500/20 active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Decrypting Destiny...
                    </>
                  ) : (
                    <>
                      Generate Deep Insights
                      <SparklesIcon className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                    </>
                  )}
                </button>
             </div>
             <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* AI ANALYSIS DISPLAY */}
          {aiAnalysis && (
            <div className="bg-white rounded-[40px] border border-[#f1ebe6] p-10 lg:p-14 shadow-sm animate-in slide-in-from-top-10 duration-700">
               <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                     <AcademicCapIcon className="w-7 h-7" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-slate-700">AI Interpretative Synthesis</h4>
                     <p className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest">Verified Annual Forecast Protocol</p>
                  </div>
               </div>
               <div className="prose prose-slate max-w-none">
                  <div className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {aiAnalysis}
                  </div>
               </div>
               <div className="mt-12 pt-8 border-t border-slate-50 flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                  <InformationCircleIcon className="w-4 h-4" /> Calculations based on Tajika Shastra Principles
               </div>
            </div>
          )}

          {/* Main Annual Chart visualization */}
          <div className="bg-white p-2 rounded-[56px] border border-[#f1ebe6] shadow-lg relative overflow-hidden group">
             <div className="bg-[#fffcf9] rounded-[48px] p-12 flex flex-col items-center justify-center relative">
                <div className="absolute top-12 left-12 flex items-center gap-4">
                   <div className="w-1.5 h-12 bg-[#f97316] rounded-full" />
                   <div>
                      <span className="text-[11px] font-black text-orange-600 uppercase tracking-[0.4em] block mb-1">Celestial Blueprint</span>
                      <h4 className="text-2xl font-black text-[#2d2621] tracking-tight">Annual Rasi Varga (D1-A)</h4>
                   </div>
                </div>
                
                <div className="w-full mt-16 scale-90 md:scale-100">
                  {chartStyle === 'North' ? (
                    <NorthIndianChart 
                      chart={data.chart} 
                      selectedPlanet={selectedPoint}
                      onSelectPlanet={setSelectedPoint}
                      showLegend={true} 
                      scale={0.9} 
                    />
                  ) : (
                    <SouthIndianChart 
                      chart={data.chart} 
                      selectedPlanet={selectedPoint}
                      onSelectPlanet={setSelectedPoint}
                      showLegend={true} 
                      scale={0.9} 
                    />
                  )}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Sahams (Precision Sensitive Points) */}
            <div className="card-modern p-10 bg-white border-[#f1ebe6] rounded-[48px] shadow-sm">
              <h3 className="text-sm font-black text-[#2d2621] mb-8 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <TableCellsIcon className="w-6 h-6 text-indigo-500" /> 
                   Annual Sahams
                 </div>
                 <InformationCircleIcon className="w-5 h-5 text-slate-300 cursor-help" />
              </h3>
              <div className="space-y-4">
                {data.sahams.map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-[#fcf8f5] rounded-3xl border border-[#f1ebe6] hover:border-indigo-200 transition-all group cursor-default">
                    <div className="space-y-0.5">
                       <p className="text-sm font-black text-[#2d2621] group-hover:text-indigo-700">{s.name}</p>
                       <p className="text-[10px] font-bold text-[#8c7e74] uppercase tracking-tighter">{s.meaning}</p>
                    </div>
                    <div className="text-right">
                       <div className="flex items-center justify-end gap-1.5">
                          <ZodiacIcon sign={getSignNum(s.sign)} className="w-4 h-4 text-indigo-400" />
                          <p className="text-sm font-black text-indigo-600 uppercase tracking-tighter">{s.sign}</p>
                       </div>
                       <p className="text-[11px] font-mono font-black text-slate-400">{formatDegrees(s.degree)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tajika Yogas Breakdown */}
            <div className="card-modern p-10 bg-white border-[#f1ebe6] rounded-[48px] shadow-sm">
              <h3 className="text-sm font-black text-[#2d2621] mb-8 flex items-center gap-3">
                <FireIcon className="w-6 h-6 text-rose-500" /> Tajika Yogas (Events)
              </h3>
              <div className="space-y-8">
                {data.yogas.map((y, i) => (
                  <div key={i} className="group relative pl-6 border-l-2 border-slate-100 hover:border-rose-500 transition-colors">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-sm font-black text-rose-600 uppercase tracking-widest">{y.name}</p>
                      <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-lg border ${
                        y.strength === 'Strong' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        y.strength === 'Moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>{y.strength}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-2">Involving: {y.planets}</p>
                    <p className="text-[13px] font-medium text-[#8c7e74] leading-relaxed italic">
                       "{y.description}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Annual Predictions Grid */}
          <div className="space-y-8">
             <div className="flex items-center gap-3 px-6">
                <AcademicCapIcon className="w-6 h-6 text-[#f97316]" />
                <h3 className="text-xl font-black text-[#2d2621] tracking-tight">Cycle Manifestations</h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {Object.entries(data.predictions).map(([key, val], i) => (
                 <div key={i} className="group bg-white p-8 rounded-[40px] border border-[#f1ebe6] hover:border-orange-200 transition-all flex flex-col gap-6 shadow-sm hover:shadow-2xl hover:shadow-orange-500/5">
                   <div className="flex justify-between items-start">
                      <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-[#f97316] shadow-inner group-hover:scale-110 transition-transform">
                        {key === 'overall' ? <SparklesIcon className="w-7 h-7" /> : 
                         key === 'career' ? <AcademicCapIcon className="w-7 h-7" /> :
                         key === 'finance' ? <TableCellsIcon className="w-7 h-7" /> : 
                         key === 'health' ? <HeartIcon className="w-7 h-7" /> :
                         <UserIcon className="w-7 h-7" />}
                      </div>
                      <span className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] bg-white border border-orange-100 px-3 py-1 rounded-full shadow-sm">{key}</span>
                   </div>
                   <div className="space-y-4">
                     <p className="text-sm font-bold text-[#2d2621] leading-relaxed tracking-tight line-clamp-4">{val}</p>
                     <button className="flex items-center gap-2 text-[#f97316] font-black text-[9px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        Details <ArrowRightIcon className="w-3.5 h-3.5" />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* 4. PLANET DETAIL POPUP - BREAKOUT MODAL */}
      {selectedPoint && (
        <div className="fixed inset-x-0 bottom-0 md:inset-auto md:right-12 md:bottom-12 z-[9999] bg-white border border-orange-100 shadow-2xl p-6 rounded-t-[32px] md:rounded-[32px] animate-in slide-in-from-bottom-20 duration-500 w-full md:max-w-[440px] max-h-[85vh] overflow-y-auto custom-scrollbar">
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

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <AcademicCapIcon className="w-5 h-5 text-emerald-600" />
                     <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Navamsha Roots (D9)</h4>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-100 text-center">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">D9 Sign</p>
                     <div className="flex items-center justify-center gap-1.5">
                        <ZodiacIcon sign={navamshaDetails?.d9Sign || Sign.Aries} className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black text-slate-800 tracking-tighter">{SIGN_NAMES[navamshaDetails?.d9Sign || Sign.Aries]}</span>
                     </div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-100 text-center">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">D9 House</p>
                     <span className="text-sm font-black text-emerald-600">H{navamshaDetails?.d9House}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-100 text-center">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">D9 Dignity</p>
                     <span className={`text-[9px] font-black uppercase ${navamshaDetails?.d9Dignity === 'Exalted' ? 'text-emerald-500' : 'text-slate-500'}`}>
                        {navamshaDetails?.d9Dignity}
                     </span>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="p-4 bg-[#fcf8f5] rounded-2xl border border-[#f1ebe6]">
                  <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1 flex items-center gap-1.5"><InformationCircleIcon className="w-4 h-4 text-orange-400" /> Annual Significance</p>
                  <p className="text-sm font-bold text-[#2d2621] leading-relaxed">
                    Influencing <span className="text-orange-600">{houseSignifications[selectedPoint.house]}</span>. Position: {selectedPoint.dignity || 'Neutral'}.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                    <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1">Nakshatra</p>
                    <p className="text-sm font-black text-orange-600">{selectedPoint.nakshatra}</p>
                    <p className="text-[9px] font-bold text-[#8c7e74] uppercase">Pada {selectedPoint.pada}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                    <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1">Coordinates</p>
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

export default VarshaphalaView;

const UserIcon = ({ className }: { className?: string }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className} strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
