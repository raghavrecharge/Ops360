
import React, { useState, useRef } from 'react';
import { DivisionalChart, Planet, Sign, ChartPoint } from '../types';
import { SIGN_NAMES } from '../constants';
import { 
  InformationCircleIcon,
  XMarkIcon,
  SparklesIcon,
  StarIcon,
  Square3Stack3DIcon,
  MapIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import ZodiacIcon from './ZodiacIcon';

interface Props {
  chart: DivisionalChart;
  selectedPlanet: ChartPoint | null;
  onSelectPlanet: (p: ChartPoint | null) => void;
  scale?: number;
  showLegend?: boolean;
}

export default function SouthIndianChart({ chart, selectedPlanet, onSelectPlanet, scale = 1, showLegend = true }: Props) {
  const [hoveredPlanet, setHoveredPlanet] = useState<ChartPoint | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showKey, setShowKey] = useState(false);
  const tooltipTimeout = useRef<number | null>(null);

  // Pan State
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

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

  const calculateD9Sign = (pSign: number, pDegree: number): Sign => {
    const totalDegrees = (pSign - 1) * 30 + pDegree;
    return ((Math.floor(totalDegrees / (30 / 9)) % 12) + 1) as Sign;
  };

  const formatDegrees = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'`;
  };

  const handlePlanetEnter = (p: ChartPoint) => {
    if (tooltipTimeout.current) window.clearTimeout(tooltipTimeout.current);
    setHoveredPlanet(p);
  };

  const handlePlanetLeave = () => {
    tooltipTimeout.current = window.setTimeout(() => {
      setHoveredPlanet(null);
    }, 600);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const onMouseUp = () => setIsDragging(false);

  const cellSizeW = 150; 
  const cellSizeH = 120; 
  const gridWidth = cellSizeW * 4;
  const gridHeight = cellSizeH * 4;

  return (
    <div 
      className="flex flex-col w-full items-center gap-6 relative overflow-hidden" 
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      
      {/* 1. INTERACTIVE FLOATING TOOLTIP */}
      {hoveredPlanet && (
        <div 
          className="fixed pointer-events-none z-[9999] transition-all duration-300 ease-out transform"
          style={{ 
            left: mousePos.x + 20, 
            top: mousePos.y + 20,
          }}
        >
          <div className="bg-white border border-orange-100 shadow-[0_32px_64px_-16px_rgba(249,115,22,0.25)] rounded-[32px] p-6 min-w-[340px] overflow-hidden group pointer-events-auto">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-orange-500/20 group-hover:rotate-6 transition-transform">
                {getPlanetCode(hoveredPlanet.planet)}
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-0.5">Celestial Grid</p>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">{hoveredPlanet.planet}</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Placement</p>
                  <p className="text-sm font-black text-slate-700 flex items-center gap-2">
                     <MapIcon className="w-4 h-4 text-indigo-500" /> H{hoveredPlanet.house}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sign</p>
                  <p className="text-sm font-black text-slate-700 flex items-center gap-2">
                     <ZodiacIcon sign={hoveredPlanet.sign} className="w-4 h-4 text-indigo-500" /> {SIGN_NAMES[hoveredPlanet.sign]}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-indigo-100/50">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                        <StarIcon className="w-4 h-4" /> Nakshatra
                    </p>
                    <span className="text-[10px] font-black text-indigo-500">Pada {hoveredPlanet.pada}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-black text-slate-800 leading-tight">
                        {hoveredPlanet.nakshatra}
                    </p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                        Ruling Lord: <span className="text-slate-900">{hoveredPlanet.nakshatraLord}</span>
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl space-y-3 shadow-inner">
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-200/50">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                        <Square3Stack3DIcon className="w-5 h-5" /> Navamsha D9
                    </p>
                    <span className="px-2 py-0.5 bg-emerald-100 rounded text-[8px] font-black text-emerald-700 uppercase tracking-widest">Core Essence</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform">
                        <ZodiacIcon sign={calculateD9Sign(hoveredPlanet.sign, hoveredPlanet.degree)} className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-lg font-black text-slate-800 leading-none">
                        {SIGN_NAMES[calculateD9Sign(hoveredPlanet.sign, hoveredPlanet.degree)]}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                        Varga Root Alignment
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-orange-50/40 px-4 py-3 rounded-2xl border border-orange-100/50">
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Longitude</p>
                <p className="text-xs font-black text-orange-600 font-mono tracking-tighter">
                   {formatDegrees(hoveredPlanet.degree)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CHART AREA */}
      <div className="relative w-full aspect-[5/3] bg-[#fffaf5] rounded-[32px] border border-[#fde6d2] p-6 shadow-sm flex items-center justify-center select-none overflow-hidden">
        <svg 
          viewBox={`0 0 ${gridWidth} ${gridHeight}`} 
          className="h-full overflow-visible touch-none"
        >
          {/* PARENT GROUP HANDLES PANNING (OFFSET) */}
          <g transform={`translate(${offset.x}, ${offset.y})`} style={{ transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
            
            {/* Geometric Grid stays at SCALE 1 */}
            <g className="grid-structure">
              {[0, 1, 2, 3, 4].map(i => (
                <React.Fragment key={i}>
                  <line x1={i * cellSizeW} y1="0" x2={i * cellSizeW} y2={gridHeight} stroke="#fde6d2" strokeWidth="1" />
                  <line x1="0" y1={i * cellSizeH} x2={gridWidth} y2={i * cellSizeH} stroke="#fde6d2" strokeWidth="1" />
                </React.Fragment>
              ))}
            </g>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((signNum) => {
              const { r, c } = signToGrid[signNum];
              const planets = getPlanetsInSign(signNum);
              const isLagnaSign = signNum === lagnaSign;

              return (
                <g key={signNum} transform={`translate(${c * cellSizeW}, ${r * cellSizeH})`}>
                  {isLagnaSign && (
                    <path d={`M0 0 L${cellSizeW} ${cellSizeH}`} stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.4" />
                  )}
                  
                  {/* SIGN NUMBER AND ICON - SCALED LOCALLY */}
                  <g transform={`translate(10, 10) scale(${scale})`} style={{ transformOrigin: 'top left' }}>
                    <rect width="40" height="40" fill="white" rx="8" className="shadow-sm" fillOpacity="0.6" />
                    <text x="20" y="22" textAnchor="middle" alignmentBaseline="middle" fontSize="18" className="font-black fill-slate-700">{signNum}</text>
                  </g>

                  {/* ZODIAC ICON - SCALED LOCALLY */}
                  <g transform={`translate(${cellSizeW - 35}, 10) scale(${scale})`} style={{ transformOrigin: 'top right' }}>
                    <foreignObject x="-25" y="0" width="25" height="25">
                       <ZodiacIcon sign={signNum} className="w-6 h-6 text-slate-400" />
                    </foreignObject>
                  </g>

                  {/* PLANETS - SCALED LOCALLY */}
                  <g transform={`translate(${cellSizeW / 2}, ${cellSizeH / 2}) scale(${scale})`}>
                    <g transform={`translate(0, -${(planets.length - 1) * 9})`}>
                      {planets.map((p, pIdx) => {
                        const isSelected = selectedPlanet?.planet === p.planet;
                        const isHovered = hoveredPlanet?.planet === p.planet;

                        return (
                          <g 
                            key={pIdx} 
                            transform={`translate(0, ${pIdx * 18})`}
                            onMouseEnter={() => handlePlanetEnter(p)}
                            onMouseLeave={handlePlanetLeave}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPlanet(p === selectedPlanet ? null : p);
                            }}
                            className="cursor-pointer"
                          >
                            <circle r="16" fill="transparent" />
                            {isSelected && (
                              <circle r="14" fill="#f97316" fillOpacity="0.1" className="animate-pulse" />
                            )}
                            <text 
                              textAnchor="middle" 
                              fontSize="15" 
                              fill={p.planet === Planet.Lagna ? "#f97316" : (isSelected || isHovered) ? "#f97316" : p.isRetrograde ? "#f43f5e" : "#2d2621"}
                              className={`font-black tracking-tighter select-none transition-all duration-300 ${isHovered ? 'scale-125' : ''}`}
                            >
                              {getPlanetCode(p.planet)}
                              {p.isRetrograde && p.planet !== Planet.Lagna && <tspan fontSize="10" dy="-4" fill="#f43f5e">*</tspan>}
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
              SOUTH MATRIX
            </text>
          </g>
        </svg>

        {showLegend && (
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                <ZodiacIcon sign={lagnaSign} className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2d2621]">Asc: {SIGN_NAMES[lagnaSign]}</span>
              </div>
              <button 
                onClick={() => setShowKey(!showKey)}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <InformationCircleIcon className="w-3.5 h-3.5" />
                Chart Key
              </button>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-[#8c7e74] uppercase tracking-widest">
               <ArrowsPointingOutIcon className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> Magnify Data Points
            </div>
          </div>
        )}

        {/* Legend Overlay */}
        {showKey && (
          <div className="absolute inset-0 bg-white/98 backdrop-blur-md z-[100] p-8 lg:p-14 animate-in fade-in zoom-in-95 duration-300 rounded-[32px] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setShowKey(false)}
              className="absolute top-8 right-8 p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-all"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
            
            <div className="max-w-xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-inner">
                   <SparklesIcon className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">South Indian Legend</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Decoding the Celestial Grid</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest pb-3 border-b border-indigo-50">Planet Identifiers</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {[
                      { code: 'SU', name: 'Sun' }, { code: 'MO', name: 'Moon' },
                      { code: 'MA', name: 'Mars' }, { code: 'ME', name: 'Mercury' },
                      { code: 'JU', name: 'Jupiter' }, { code: 'VE', name: 'Venus' },
                      { code: 'SA', name: 'Saturn' }, { code: 'RA', name: 'Rahu' },
                      { code: 'KE', name: 'Ketu' }, { code: 'ASC', name: 'Ascendant' }
                    ].map(p => (
                      <div key={p.code} className="flex items-center gap-4">
                        <span className="w-8 text-sm font-black text-slate-800">{p.code}</span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-widest pb-3 border-b border-orange-50">Special Indicators</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="w-8 text-lg font-black text-rose-500">*</span>
                        <span className="text-xs font-bold text-slate-600">Retrograde (Vakri)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-0.5 bg-orange-400/50 border border-dashed border-orange-500/50 -rotate-45" />
                        <span className="text-xs font-bold text-slate-600">Diagonal Line: Lagna (ASC)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest pb-3 border-b border-emerald-50">Sign Structure</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      Signs are fixed. Aries is the <span className="text-slate-900 font-black">box marked with number 1</span>. They proceed <span className="text-slate-900 font-black">clockwise</span> around the edge.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  Hover for Nakshatra/Navamsha info. Click and drag to explore the grid.<br/>
                  Content scales independently from the geometric grid.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
