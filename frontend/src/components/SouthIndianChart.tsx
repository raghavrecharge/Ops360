import React, { useState } from 'react';
import { DivisionalChart, Planet, Sign, ChartPoint } from '../types';
import { SIGN_NAMES } from '../constants';
import { XMarkIcon, SparklesIcon, InformationCircleIcon, BoltIcon, HandRaisedIcon, SpeakerWaveIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { astrologyService } from '../services/astrologyService';
import ZodiacIcon from './ZodiacIcon';

interface Props {
  chart: DivisionalChart;
  title?: string;
  scale?: number;
  showLegend?: boolean;
}

const SouthIndianChart: React.FC<Props> = ({ chart, title, scale = 1, showLegend = true }) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<ChartPoint | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<ChartPoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Grid mapping for South Indian Chart (Clockwise)
  const signToGrid: Record<number, { r: number; c: number }> = {
    12: { r: 0, c: 0 }, 1: { r: 0, c: 1 }, 2: { r: 0, c: 2 }, 3: { r: 0, c: 3 },
    11: { r: 1, c: 0 },                         4: { r: 1, c: 3 },
    10: { r: 2, c: 0 },                         5: { r: 2, c: 3 },
    9: { r: 3, c: 0 }, 8: { r: 3, c: 1 }, 7: { r: 3, c: 2 }, 6: { r: 3, c: 3 },
  };

  const lagnaPoint = chart.points.find(p => p.planet === Planet.Lagna);
  const lagnaSign = lagnaPoint ? lagnaPoint.sign : Sign.Aries;

  const getPlanetsInSign = (sign: number) => {
    return chart.points.filter(p => p.sign === sign);
  };

  const getPlanetCode = (p: Planet) => {
    switch(p) {
      case Planet.Sun: return 'SU';
      case Planet.Moon: return 'MO';
      case Planet.Mars: return 'MA';
      case Planet.Mercury: return 'ME';
      case Planet.Jupiter: return 'JU';
      case Planet.Venus: return 'VE';
      case Planet.Saturn: return 'SA';
      case Planet.Rahu: return 'RA';
      case Planet.Ketu: return 'KE';
      case Planet.Lagna: return 'ASC';
      default: return (p as string).substring(0, 2).toUpperCase();
    }
  };

  const formatDegrees = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    return `${d}°${m}'`;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const activePlanet = selectedPlanet || hoveredPlanet;

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

  // Dimensions for the grid - height increased by 20%
  const cellSizeW = 150; 
  const cellSizeH = 120; 
  const gridWidth = cellSizeW * 4;
  const gridHeight = cellSizeH * 4;

  const selectedPlanetRemedy = selectedPlanet ? astrologyService.getPlanetRemedy(selectedPlanet.planet) : null;
  const selectedPlanetLordship = selectedPlanet ? astrologyService.getHouseLordship(chart, selectedPlanet.planet) : [];

  return (
    <div className="flex flex-col w-full items-center gap-6" onMouseMove={handleMouseMove}>
      <div 
        className="relative w-full aspect-[5/3] bg-[#fffaf5] rounded-[32px] border border-[#fde6d2] p-6 shadow-sm flex items-center justify-center overflow-hidden"
      >
        <svg viewBox={`0 0 ${gridWidth} ${gridHeight}`} className="h-full overflow-visible">
          {/* 1. FIXED STRUCTURE - Grid Lines */}
          <g className="grid-structure">
            {[0, 1, 2, 3, 4].map(i => (
              <React.Fragment key={i}>
                <line x1={i * cellSizeW} y1="0" x2={i * cellSizeW} y2={gridHeight} stroke="#fde6d2" strokeWidth="1" />
                <line x1="0" y1={i * cellSizeH} x2={gridWidth} y2={i * cellSizeH} stroke="#fde6d2" strokeWidth="1" />
              </React.Fragment>
            ))}
          </g>

          {/* 2. DYNAMIC VALUES - Render each of the 12 signs */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((signNum) => {
            const { r, c } = signToGrid[signNum];
            const planets = getPlanetsInSign(signNum);
            const isLagnaSign = signNum === lagnaSign;

            return (
              <g key={signNum} transform={`translate(${c * cellSizeW}, ${r * cellSizeH})`}>
                {/* House Indicator for Lagna */}
                {isLagnaSign && (
                  <path d={`M0 0 L${cellSizeW} ${cellSizeH}`} stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.4" />
                )}
                
                {/* Sign Label - Using Minimal Icon */}
                <foreignObject x={cellSizeW - 30} y={10} width="20" height="20">
                   <ZodiacIcon sign={signNum} className="w-5 h-5 text-slate-300 opacity-40" />
                </foreignObject>

                {/* Planets Group */}
                <g transform={`translate(${cellSizeW / 2}, ${cellSizeH / 2}) scale(${scale})`}>
                  <g transform={`translate(0, -${(planets.length - 1) * 9})`}>
                    {planets.map((p, pIdx) => {
                      const isSelected = selectedPlanet?.planet === p.planet;
                      return (
                        <g key={pIdx} transform={`translate(0, ${pIdx * 18})`}>
                          {isSelected && (
                            <circle r="12" fill="#f97316" fillOpacity="0.1" className="animate-pulse" />
                          )}
                          <text 
                            textAnchor="middle" 
                            fontSize="15" 
                            fill={p.planet === Planet.Lagna ? "#f97316" : isSelected ? "#f97316" : p.isRetrograde ? "#fa896b" : "#2d2621"}
                            className={`font-black tracking-tighter select-none transition-all duration-200 cursor-pointer ${isSelected ? 'scale-110 drop-shadow-md' : 'hover:fill-orange-600 hover:scale-105'} drop-shadow-sm`}
                            onMouseEnter={() => !selectedPlanet && setHoveredPlanet(p)}
                            onMouseLeave={() => setHoveredPlanet(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlanet(p);
                            }}
                          >
                            {getPlanetCode(p.planet)}
                            {p.isRetrograde && p.planet !== Planet.Lagna && <tspan fontSize="9" dy="-5">(R)</tspan>}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </g>
              </g>
            );
          })}

          <text x={gridWidth/2} y={gridHeight/2} textAnchor="middle" fontSize="16" fill="#fde6d2" className="font-black uppercase tracking-[0.5em] opacity-30">
            CELESTIAL RESONANCE
          </text>
        </svg>

        {showLegend && (
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-[10px] font-black tracking-[0.2em] uppercase bg-white/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/50 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/20" />
              <ZodiacIcon sign={lagnaSign} className="w-4 h-4 text-orange-500" />
              <span className="text-[#8c7e74]">Lagna: <span className="text-[#2d2621]">{SIGN_NAMES[lagnaSign]}</span></span>
            </div>
            <div className="flex items-center gap-2">
               <CursorIcon className="w-3 h-3 text-orange-400" />
               <span className="text-[#8c7e74]">Click for Insights</span>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Detail Panel or Floating Card */}
      {selectedPlanet && (
        <div 
          className="fixed z-[11000] bg-white border border-orange-100 shadow-2xl p-8 rounded-[32px] animate-in fade-in zoom-in-95 duration-200 w-full max-w-[420px] pointer-events-auto h-[70vh] overflow-y-auto custom-scrollbar"
          style={{ right: '40px', bottom: '40px' }}
        >
          <button onClick={() => setSelectedPlanet(null)} className="sticky top-0 float-right p-2 hover:bg-orange-50 rounded-full text-orange-500 transition-colors active:scale-90 z-10">
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-2xl border border-orange-100 shadow-inner group-hover:rotate-6 transition-transform">
                {getPlanetCode(selectedPlanet.planet)}
              </div>
              <div>
                 <h3 className="font-black text-[#2d2621] text-2xl leading-tight">{selectedPlanet.planet}</h3>
                 <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-orange-100">In House {selectedPlanet.house}</span>
                    {selectedPlanetLordship.length > 0 && (
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-indigo-100">Rules H{selectedPlanetLordship.join(', ')}</span>
                    )}
                    {selectedPlanet.isRetrograde && selectedPlanet.planet !== Planet.Lagna && <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-rose-100">Retrograde</span>}
                 </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="p-5 bg-[#fcf8f5] rounded-2xl border border-[#f1ebe6] hover:bg-white transition-colors shadow-sm">
                  <p className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <InformationCircleIcon className="w-4 h-4 text-orange-400" /> Primary Influence
                  </p>
                  <p className="text-sm font-bold text-[#2d2621] leading-relaxed">
                    Influencing {houseSignifications[selectedPlanet.house].toLowerCase()}. As a lord of {selectedPlanetLordship.map(h => `${h}${h === 1 ? 'st' : h === 2 ? 'nd' : h === 3 ? 'rd' : 'th'}`).join(', ')} house(s), its placement creates a significant link in your destiny.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1">Nakshatra</p>
                    <p className="text-sm font-black text-orange-600">{selectedPlanet.nakshatra}</p>
                    <p className="text-[9px] font-bold text-[#8c7e74] uppercase">Pada {selectedPlanet.pada}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-right">
                    <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-1">Exact Position</p>
                    <div className="flex items-center justify-end gap-1.5">
                       <ZodiacIcon sign={selectedPlanet.sign} className="w-4 h-4 text-indigo-400" />
                       <p className="text-sm font-black text-[#2d2621] font-mono">{formatDegrees(selectedPlanet.degree)}</p>
                    </div>
                    <p className="text-[9px] font-bold text-[#8c7e74] uppercase">{SIGN_NAMES[selectedPlanet.sign]}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                       <SparklesIcon className="w-4 h-4 text-amber-500" />
                       <span className="text-[9px] font-black text-[#8c7e74] uppercase">Dignity</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase ${selectedPlanet.dignity === 'Exalted' ? 'text-emerald-500' : selectedPlanet.dignity === 'Debilitated' ? 'text-rose-500' : 'text-slate-500'}`}>
                      {selectedPlanet.dignity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                       <BoltIcon className="w-4 h-4 text-indigo-500" />
                       <span className="text-[9px] font-black text-[#8c7e74] uppercase">Lord</span>
                    </div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase">{selectedPlanet.signLord}</span>
                  </div>
               </div>

               {selectedPlanetRemedy && (
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                       <HandRaisedIcon className="w-5 h-5 text-amber-500" />
                       <h4 className="text-xs font-black text-[#2d2621] uppercase tracking-[0.2em]">Karmic Remedies</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                       <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl">
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Gemstone</p>
                          <p className="text-sm font-black text-emerald-900">{selectedPlanetRemedy.stone}</p>
                       </div>
                       <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl">
                          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2">Mantra</p>
                          <p className="text-[13px] font-black text-indigo-900 font-mono leading-tight">"{selectedPlanetRemedy.mantra}"</p>
                       </div>
                       <div className="p-4 bg-orange-50/30 border border-orange-100 rounded-2xl">
                          <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Charity</p>
                          <p className="text-xs font-bold text-orange-900 leading-relaxed">{selectedPlanetRemedy.charity}</p>
                       </div>
                    </div>
                 </div>
               )}

               <div className="mt-4 p-5 bg-orange-500 rounded-3xl text-white shadow-xl shadow-orange-500/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Celestial Insight</p>
                  <p className="text-sm font-bold leading-relaxed">
                     {selectedPlanet.planet} in {SIGN_NAMES[selectedPlanet.sign]} within the {selectedPlanet.house}th house provides a {selectedPlanet.dignity === 'Exalted' ? 'profound' : 'stable'} influence on your {houseSignifications[selectedPlanet.house].split(',')[0].toLowerCase()}.
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CursorIcon = ({ className }: { className?: string }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M13.19 19.02c-.3-.02-.59-.2-.68-.51l-1.57-5.14-5.14-1.57c-.32-.1-.5-.39-.51-.69-.01-.3.17-.59.48-.7L18.8 4.14c.3-.1.63-.03.86.18.22.21.31.54.23.84L13.88 18.2c-.1.32-.38.52-.69.82z" />
  </svg>
);

export default SouthIndianChart;