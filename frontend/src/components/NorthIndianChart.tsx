
import React, { useState, useRef, useEffect } from 'react';
import { DivisionalChart, Planet, Sign, ChartPoint } from '../types';
import { SIGN_NAMES } from '../constants';
import { 
  SparklesIcon, 
  InformationCircleIcon,
  XMarkIcon,
  StarIcon,
  MapIcon,
  Square3Stack3DIcon,
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

const CursorIcon = ({ className }: { className?: string }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M13.19 19.02c-.3-.02-.59-.2-.68-.51l-1.57-5.14-5.14-1.57c-.32-.1-.5-.39-.51-.69-.01-.3.17-.59.48-.7L18.8 4.14c.3-.1.63-.03.86.18.22.21.31.54.23.84L13.88 18.2c-.1.32-.38.52-.69.82z" />
  </svg>
);

export default function NorthIndianChart({ chart, selectedPlanet, onSelectPlanet, scale = 1, showLegend = true }: Props) {
  const [hoveredPlanet, setHoveredPlanet] = useState<ChartPoint | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showKey, setShowKey] = useState(false);
  const tooltipTimeout = useRef<number | null>(null);

  // Pan State
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

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

  const calculateD9Sign = (pSign: number, pDegree: number): Sign => {
    const totalDegrees = (pSign - 1) * 30 + pDegree;
    return ((Math.floor(totalDegrees / (30 / 9)) % 12) + 1) as Sign;
  };

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

  return (
    <div 
      className="flex flex-col w-full items-center gap-4 relative overflow-hidden" 
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
                <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-0.5">Celestial Matrix</p>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">{hoveredPlanet.planet}</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">House</p>
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
                    <span className="px-2 py-0.5 bg-emerald-100 rounded text-[8px] font-black text-emerald-700 uppercase tracking-widest">Soul Essence</span>
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
                        Divisional Root Matrix
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
      <div className="relative w-full aspect-[4/3] bg-white rounded-[40px] border border-orange-100 shadow-sm select-none p-4 md:p-8">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible touch-none"
        >
          {/* PARENT GROUP HANDLES PANNING (OFFSET) */}
          <g transform={`translate(${offset.x}, ${offset.y})`} style={{ transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
            
            {/* Geometric Grid remains at SCALE 1 */}
            <g className="chart-background pointer-events-none">
              {signCenters.map((_, i) => {
                const houseNum = i + 1;
                const isActive = hoveredHouse === houseNum || hoveredPlanet?.house === houseNum || selectedPlanet?.house === houseNum;
                return (
                  <path 
                    key={`bg-${houseNum}`}
                    d={getHousePath(houseNum)} 
                    fill={isActive ? "rgba(249, 115, 22, 0.12)" : "transparent"} 
                    className="transition-all duration-300" 
                  />
                );
              })}
              <g className="chart-lines">
                <rect x="0" y="0" width={width} height={height} fill="none" stroke="#e2e8f0" strokeWidth="2" rx="32" />
                <line x1="0" y1="0" x2={width} y2={height} stroke="#e2e8f0" strokeWidth="1.5" />
                <line x1={width} y1="0" x2="0" y2={height} stroke="#e2e8f0" strokeWidth="1.5" />
                <path d={`M${cx} 0 L${width} ${cy} L${cx} ${height} L0 ${cy} Z`} fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
              </g>
            </g>

            {signCenters.map((center, i) => {
              const houseNum = i + 1;
              const sign = getSignForHouse(houseNum);
              const planets = getPlanetsInHouse(houseNum);
              const isHouseActive = hoveredHouse === houseNum || hoveredPlanet?.house === houseNum || selectedPlanet?.house === houseNum;
              
              return (
                <g 
                  key={i} 
                  onMouseEnter={() => setHoveredHouse(houseNum)} 
                  onMouseLeave={() => setHoveredHouse(null)}
                  className="group/house"
                >
                  <path 
                    d={getHousePath(houseNum)} 
                    fill="transparent" 
                    className="cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setHoveredHouse(houseNum); }} 
                  />
                  
                  {/* SIGN NUMBER - SCALE IS APPLIED HERE LOCALLY */}
                  <g transform={`translate(${center.x}, ${center.y}) scale(${scale})`}>
                    <circle r="22" fill="white" className="shadow-sm" fillOpacity="0.8" />
                    <text 
                      textAnchor="middle" 
                      alignmentBaseline="middle"
                      fontSize="24" 
                      fill={isHouseActive ? "#f97316" : "#475569"} 
                      className={`font-black transition-all duration-300 pointer-events-none ${isHouseActive ? 'scale-125' : ''}`}
                    >
                      {sign}
                    </text>
                  </g>

                  {/* PLANETS - SCALE IS APPLIED HERE LOCALLY */}
                  <g transform={`translate(${center.x}, ${center.y + 35}) scale(${scale})`}>
                     {planets.map((p, pIdx) => {
                        const isSelected = selectedPlanet?.planet === p.planet;
                        const isHovered = hoveredPlanet?.planet === p.planet;
                        const col = pIdx % 3;
                        const row = Math.floor(pIdx / 3);
                        const offsetX = planets.length > 1 ? (col - 1) * 36 : 0;
                        const offsetY = row * 24;

                        return (
                          <g 
                            key={pIdx} 
                            transform={`translate(${offsetX}, ${offsetY})`}
                            onClick={(e) => { e.stopPropagation(); onSelectPlanet(p === selectedPlanet ? null : p); }}
                            onMouseEnter={() => handlePlanetEnter(p)}
                            onMouseLeave={handlePlanetLeave}
                            className="cursor-pointer group/planet transition-transform duration-300 hover:scale-125"
                          >
                            <circle r="26" fill="transparent" />
                            <circle 
                              r={16} 
                              fill={isSelected || isHovered ? "#f97316" : "transparent"} 
                              fillOpacity={isHovered && !isSelected ? "0.1" : "0.15"} 
                              className="transition-all duration-300"
                            />
                            <text 
                              textAnchor="middle" 
                              fontSize="18" 
                              fill={isSelected || isHovered ? "#f97316" : p.isRetrograde ? "#f43f5e" : "#1e293b"} 
                              className="font-black transition-all duration-300"
                            >
                              {getPlanetCode(p.planet)}
                              {p.isRetrograde && <tspan fontSize="12" dy="-6" fill="#f43f5e">*</tspan>}
                            </text>
                          </g>
                        );
                     })}
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {showLegend && (
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-white/80 backdrop-blur-xl px-6 py-3 rounded-[24px] border border-orange-100 shadow-lg">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5 border-r border-slate-100 pr-6">
                <ZodiacIcon sign={lagnaSign} className="w-5 h-5 text-orange-500" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">Asc: {SIGN_NAMES[lagnaSign]}</span>
              </div>
              <button 
                onClick={() => setShowKey(!showKey)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <InformationCircleIcon className="w-4 h-4" />
                Chart Key
              </button>
            </div>
            <div className="flex items-center gap-3">
              <ArrowsPointingOutIcon className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Magnify Data Points</span>
            </div>
          </div>
        )}

        {/* Legend Overlay */}
        {showKey && (
          <div className="absolute inset-0 bg-white/98 backdrop-blur-md z-[100] p-10 lg:p-14 animate-in fade-in zoom-in-95 duration-300 rounded-[40px] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setShowKey(false)}
              className="absolute top-10 right-10 p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full transition-all"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
            
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-orange-50 rounded-3xl flex items-center justify-center text-orange-500 mx-auto mb-6 shadow-inner">
                   <SparklesIcon className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Chart Architecture</h3>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Decoding the North Indian Grid</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest pb-3 border-b border-indigo-50">Planet Identifiers</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {[
                      { code: 'Su', name: 'Sun' }, { code: 'Mo', name: 'Moon' },
                      { code: 'Ma', name: 'Mars' }, { code: 'Me', name: 'Mercury' },
                      { code: 'Ju', name: 'Jupiter' }, { code: 'Ve', name: 'Venus' },
                      { code: 'Sa', name: 'Saturn' }, { code: 'Ra', name: 'Rahu' },
                      { code: 'Ke', name: 'Ketu' }
                    ].map(p => (
                      <div key={p.code} className="flex items-center gap-4">
                        <span className="w-7 text-sm font-black text-slate-800">{p.code}</span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-orange-600 uppercase tracking-widest pb-3 border-b border-orange-50">Symbols & Markers</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="w-8 text-lg font-black text-rose-500">*</span>
                        <span className="text-xs font-bold text-slate-600">Retrograde (Vakri)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-8 text-base font-black text-indigo-600">1-12</span>
                        <span className="text-xs font-bold text-slate-600">Zodiac Sign Number (Center)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest pb-3 border-b border-emerald-50">Spatial Mapping</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      House 1 is always the <span className="text-slate-900 font-black">Top Central Diamond</span>. 
                      Houses proceed counter-clockwise around the matrix.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  Data points scale independently from the chart grid for clarity.<br/>
                  Click and drag anywhere to pan the view.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
