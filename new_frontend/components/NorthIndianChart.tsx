
import React, { useState, useMemo } from 'react';
import { DivisionalChart, Planet, Sign, ChartPoint } from '../types';
import { SIGN_NAMES } from '../constants';
import { 
  XMarkIcon, 
  SparklesIcon, 
  InformationCircleIcon, 
  BoltIcon, 
  HandRaisedIcon, 
  SpeakerWaveIcon, 
  BeakerIcon, 
  StarIcon, 
  BookmarkIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { astrologyService, PLANET_REMEDY_MAP } from '../services/astrologyService';
import ZodiacIcon from './ZodiacIcon';

interface Props {
  chart: DivisionalChart;
  title?: string;
  scale?: number;
  showLegend?: boolean;
}

const CursorIcon = ({ className }: { className?: string }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M13.19 19.02c-.3-.02-.59-.2-.68-.51l-1.57-5.14-5.14-1.57c-.32-.1-.5-.39-.51-.69-.01-.3.17-.59.48-.7L18.8 4.14c.3-.1.63-.03.86.18.22.21.31.54.23.84L13.88 18.2c-.1.32-.38.52-.69.82z" />
  </svg>
);

export default function NorthIndianChart({ chart, title, scale = 1, showLegend = true }: Props) {
  const [hoveredPlanet, setHoveredPlanet] = useState<ChartPoint | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<ChartPoint | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const width = 600;
  const height = 450;
  const cx = width / 2;
  const cy = height / 2;

  const lagnaPoint = chart.points.find(p => p.planet === Planet.Lagna);
  const lagnaSign = lagnaPoint ? lagnaPoint.sign : Sign.Aries;

  const getSignForHouse = (houseNum: number): Sign => {
    return ((lagnaSign + houseNum - 2) % 12 + 1) as Sign;
  };

  const getPlanetsInHouse = (houseNum: number) => {
    return chart.points.filter(p => p.house === houseNum && p.planet !== Planet.Lagna);
  };

  const getPlanetCode = (p: Planet) => {
    switch(p) {
      case Planet.Sun: return 'Su';
      case Planet.Moon: return 'Mo';
      case Planet.Mars: return 'Ma';
      case Planet.Mercury: return 'Me';
      case Planet.Jupiter: return 'Ju';
      case Planet.Venus: return 'Ve';
      case Planet.Saturn: return 'Sa';
      case Planet.Rahu: return 'Ra';
      case Planet.Ketu: return 'Ke';
      default: return (p as string).substring(0, 2);
    }
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

  // Navamsha Logic for Detail Panel
  const navamshaDetails = useMemo(() => {
    if (!selectedPlanet || !lagnaPoint) return null;
    
    const calculateD9Sign = (pSign: number, pDegree: number) => {
      const totalDegrees = (pSign - 1) * 30 + pDegree;
      return (Math.floor(totalDegrees * 9 / 30) % 12) + 1;
    };

    const d9Sign = calculateD9Sign(selectedPlanet.sign, selectedPlanet.degree) as Sign;
    const d9LagnaSign = calculateD9Sign(lagnaPoint.sign, lagnaPoint.degree);
    const d9House = ((d9Sign - d9LagnaSign + 12) % 12) + 1;
    
    // Dignity check logic for D9
    const EXALT_SIGNS: Record<string, Sign> = { Sun: Sign.Aries, Moon: Sign.Taurus, Mars: Sign.Capricorn, Mercury: Sign.Virgo, Jupiter: Sign.Cancer, Venus: Sign.Pisces, Saturn: Sign.Libra };
    const DEBIL_SIGNS: Record<string, Sign> = { Sun: Sign.Libra, Moon: Sign.Scorpio, Mars: Sign.Cancer, Mercury: Sign.Pisces, Jupiter: Sign.Capricorn, Venus: Sign.Virgo, Saturn: Sign.Aries };
    
    let d9Dignity = "Neutral";
    if (EXALT_SIGNS[selectedPlanet.planet] === d9Sign) d9Dignity = "Exalted";
    else if (DEBIL_SIGNS[selectedPlanet.planet] === d9Sign) d9Dignity = "Debilitated";
    
    const isVargottama = d9Sign === selectedPlanet.sign;

    return { d9Sign, d9House, d9Dignity, isVargottama };
  }, [selectedPlanet, lagnaPoint]);

  const getHousePath = (h: number) => {
    switch(h) {
      case 1: return `M${cx} 0 L${cx * 1.5} ${cy / 2} L${cx} ${cy} L${cx / 2} ${cy / 2} Z`;
      case 4: return `M0 ${cy} L${cx / 2} ${cy / 2} L${cx} ${cy} L${cx / 2} ${cy * 1.5} Z`;
      case 7: return `M${cx} ${height} L${cx * 1.5} ${cy * 1.5} L${cx} ${cy} L${cx / 2} ${cy * 1.5} Z`;
      case 10: return `M${width} ${cy} L${cx * 1.5} ${cy / 2} L${cx} ${cy} L${cx * 1.5} ${cy * 1.5} Z`;
      case 2: return `M0 0 L${cx} 0 L${cx / 2} ${cy / 2} Z`;
      case 3: return `M0 0 L0 ${cy} L${cx / 2} ${cy / 2} Z`;
      case 5: return `M0 ${cy} L0 ${height} L${cx / 2} ${cy * 1.5} Z`;
      case 6: return `M0 ${height} L${cx} ${height} L${cx / 2} ${cy * 1.5} Z`;
      case 8: return `M${cx} ${height} L${width} ${height} L${cx * 1.5} ${cy * 1.5} Z`;
      case 9: return `M${width} ${height} L${width} ${cy} L${cx * 1.5} ${cy * 1.5} Z`;
      case 11: return `M${width} ${cy} L${width} 0 L${cx * 1.5} ${cy / 2} Z`;
      case 12: return `M${width} 0 L${cx} 0 L${cx * 1.5} ${cy / 2} Z`;
      default: return "";
    }
  };

  const signCenters = [
    { x: cx, y: cy / 2 }, { x: cx / 2.5, y: cy / 4.5 }, { x: cx / 5, y: cy / 2.2 },
    { x: cx / 2.2, y: cy }, { x: cx / 5, y: cy * 1.5 }, { x: cx / 2.5, y: cy * 1.75 },
    { x: cx, y: cy * 1.5 }, { x: cx * 1.6, y: cy * 1.75 }, { x: cx * 1.8, y: cy * 1.5 },
    { x: cx * 1.55, y: cy }, { x: cx * 1.8, y: cy / 2.2 }, { x: cx * 1.6, y: cy / 4.5 },
  ];

  const selectedPlanetRemedy = selectedPlanet ? PLANET_REMEDY_MAP[selectedPlanet.planet] : null;

  return (
    <div className="flex flex-col w-full items-center gap-4" onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}>
      <div className="relative w-full aspect-[4/3] md:aspect-[5/3] bg-[#fffaf5] rounded-[32px] border border-[#fde6d2] p-1 md:p-4 shadow-sm overflow-hidden select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible touch-none">
          {hoveredHouse && (
            <path d={getHousePath(hoveredHouse)} fill="rgba(249, 115, 22, 0.12)" className="animate-in fade-in duration-200 pointer-events-none" />
          )}

          <g className="chart-lines pointer-events-none">
            <rect x="0" y="0" width={width} height={height} fill="none" stroke="#fce7d1" strokeWidth="2" rx="24" />
            <line x1="0" y1="0" x2={width} y2={height} stroke="#fce7d1" strokeWidth="1.5" />
            <line x1={width} y1="0" x2="0" y2={height} stroke="#fce7d1" strokeWidth="1.5" />
            <path d={`M${cx} 0 L${width} ${cy} L${cx} ${height} L0 ${cy} Z`} fill="none" stroke="#fce7d1" strokeWidth="2.5" />
          </g>

          {signCenters.map((center, i) => {
            const houseNum = i + 1;
            const sign = getSignForHouse(houseNum);
            const planets = getPlanetsInHouse(houseNum);
            const isHouseActive = hoveredHouse === houseNum || hoveredPlanet?.house === houseNum || selectedPlanet?.house === houseNum;
            
            return (
              <g key={i} onMouseEnter={() => setHoveredHouse(houseNum)} onMouseLeave={() => setHoveredHouse(null)}>
                <path d={getHousePath(houseNum)} fill="transparent" className="cursor-pointer" onClick={() => setHoveredHouse(houseNum)} />
                <text x={center.x} y={center.y} textAnchor="middle" fontSize={28 * scale} fill={isHouseActive ? "#f97316" : "#fcd4b4"} className={`font-black transition-all duration-300 pointer-events-none ${isHouseActive ? 'opacity-100' : 'opacity-80'}`}>{sign}</text>
                <g transform={`translate(${center.x}, ${center.y + (28 * scale)})`}>
                   {planets.map((p, pIdx) => {
                      const isSelected = selectedPlanet?.planet === p.planet;
                      const isHovered = hoveredPlanet?.planet === p.planet;
                      const col = pIdx % 3;
                      const row = Math.floor(pIdx / 3);
                      const offsetX = planets.length > 1 ? (col - 1) * (30 * scale) : 0;
                      const offsetY = row * (22 * scale);

                      return (
                        <g 
                          key={pIdx} 
                          transform={`translate(${offsetX}, ${offsetY})`}
                          onClick={(e) => { e.stopPropagation(); setSelectedPlanet(p === selectedPlanet ? null : p); }}
                          onMouseEnter={() => setHoveredPlanet(p)}
                          onMouseLeave={() => setHoveredPlanet(null)}
                          className="cursor-pointer"
                        >
                          <circle r={14 * scale} fill={isSelected ? "#f97316" : "transparent"} fillOpacity="0.1" />
                          <text textAnchor="middle" fontSize={18 * scale} fill={isSelected ? "#f97316" : isHovered ? "#f97316" : p.isRetrograde ? "#fa896b" : "#2d2621"} className="font-black">
                            {getPlanetCode(p.planet)}
                            {p.isRetrograde && <tspan fontSize={12 * scale} dy={-6 * scale}>*</tspan>}
                          </text>
                        </g>
                      );
                   })}
                </g>
              </g>
            );
          })}
        </svg>

        {showLegend && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm">
            <div className="flex items-center gap-2">
              <ZodiacIcon sign={lagnaSign} className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2d2621]">Asc: {SIGN_NAMES[lagnaSign]}</span>
            </div>
            <div className="flex items-center gap-2">
              <CursorIcon className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest hidden sm:inline">Explore Matrix</span>
            </div>
          </div>
        )}
      </div>

      {selectedPlanet && (
        <div className="fixed inset-x-0 bottom-0 md:inset-auto md:right-8 md:bottom-8 z-[5000] bg-white border border-orange-100 shadow-2xl p-6 rounded-t-[32px] md:rounded-[32px] animate-in slide-in-from-bottom-20 duration-500 w-full md:max-w-[440px] max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto mb-6 md:hidden" />
          <button onClick={() => setSelectedPlanet(null)} className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-orange-50 rounded-full text-orange-500 transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-2xl border border-orange-100 shadow-inner">
                {getPlanetCode(selectedPlanet.planet)}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-[#2d2621] text-xl leading-tight">{selectedPlanet.planet}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                   <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg uppercase border border-orange-100">House {selectedPlanet.house}</span>
                   {selectedPlanet.isRetrograde && <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg uppercase border border-rose-100">Vakri</span>}
                   {navamshaDetails?.isVargottama && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase border border-emerald-100 flex items-center gap-1"><ShieldCheckIcon className="w-3 h-3" /> Vargottama</span>}
                </div>
              </div>
            </div>

            {/* Navamsha Analysis Section - NEW */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <AcademicCapIcon className="w-5 h-5 text-emerald-600" />
                     <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Navamsha Matrix Root (D9)</h4>
                  </div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Soul Destiny</span>
               </div>
               
               <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-100 text-center">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">D9 Sign</p>
                     <div className="flex items-center justify-center gap-1.5">
                        <ZodiacIcon sign={navamshaDetails?.d9Sign || Sign.Aries} className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">{SIGN_NAMES[navamshaDetails?.d9Sign || Sign.Aries]}</span>
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

               <p className="text-[11px] font-bold text-emerald-800 leading-relaxed italic px-1">
                 "In the D9 chart, {selectedPlanet.planet} indicates the hidden strength of the soul. {navamshaDetails?.isVargottama ? 'Being Vargottama, its fruits are highly stabilized.' : `Its shift to House ${navamshaDetails?.d9House} refines how its energy matures.`}"
               </p>
            </div>

            <div className="space-y-4">
               <div className="p-4 bg-[#fcf8f5] rounded-2xl border border-[#f1ebe6]">
                  <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1 flex items-center gap-1.5"><InformationCircleIcon className="w-4 h-4 text-orange-400" /> Significance</p>
                  <p className="text-sm font-bold text-[#2d2621] leading-relaxed">
                    Influencing <span className="text-orange-600">{houseSignifications[selectedPlanet.house]}</span>. Physical Plane Dignity: {selectedPlanet.dignity || 'Neutral'}.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                    <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1">Nakshatra</p>
                    <p className="text-sm font-black text-orange-600">{selectedPlanet.nakshatra}</p>
                    <p className="text-[9px] font-bold text-[#8c7e74] uppercase tracking-tighter">Pada {selectedPlanet.pada}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                    <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1">Coordinates</p>
                    <div className="flex items-center justify-center gap-1">
                       <ZodiacIcon sign={selectedPlanet.sign} className="w-4 h-4 text-indigo-400" />
                       <p className="text-sm font-black text-[#2d2621] font-mono">{formatDegrees(selectedPlanet.degree)}</p>
                    </div>
                    <p className="text-[9px] font-bold text-[#8c7e74] uppercase tracking-tighter">{SIGN_NAMES[selectedPlanet.sign]}</p>
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
}
