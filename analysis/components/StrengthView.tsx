import React, { useMemo, useState } from 'react';
import { ShadbalaData, Planet } from '../types';
import { 
  ScaleIcon, 
  BoltIcon, 
  LifebuoyIcon, 
  TrophyIcon, 
  ShieldCheckIcon,
  ChartBarSquareIcon,
  FireIcon,
  ArrowsPointingInIcon,
  AcademicCapIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';

interface Props {
  data: ShadbalaData[];
}

const StrengthView: React.FC<Props> = ({ data }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(Planet.Sun);

  const activePlanet = useMemo(() => 
    data.find(d => d.planet === selectedPlanet) || data[0]
  , [data, selectedPlanet]);

  // Radar Chart Constants
  const size = 320;
  const center = size / 2;
  const radius = size * 0.4;
  const planetsCount = data.length;

  const radarPoints = useMemo(() => {
    return data.map((d, i) => {
      const angle = (i * 2 * Math.PI) / planetsCount - Math.PI / 2;
      const r = (d.total / 600) * radius; // Normalized against max expected strength
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        planet: d.planet
      };
    });
  }, [data, radius, center, planetsCount]);

  const radarPath = useMemo(() => 
    radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  , [radarPoints]);

  const getMetricColor = (val: number, max: number) => {
    const ratio = val / max;
    if (ratio > 0.7) return 'bg-emerald-500';
    if (ratio > 0.4) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Summary - Light Theme */}
      <div className="bg-white rounded-[40px] p-10 text-[#2d2621] flex flex-col lg:flex-row items-center gap-12 border border-[#f1ebe6] shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-6 flex-1">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 text-[#8c7e74]">Celestial Potency</div>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-5xl font-black tracking-tighter text-[#2d2621]">Planetary Shadbala</h2>
          <p className="text-[#8c7e74] font-medium max-w-xl leading-relaxed text-lg italic">
            Shadbala reveals the raw operational capacity of planets. A planet may be well-placed in a sign, but without strength (Bala), it cannot manifest its full potential in your life.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
             <div className="p-5 rounded-3xl bg-[#fcf8f5] border border-[#f1ebe6]">
                <p className="text-[10px] font-black text-[#8c7e74] uppercase mb-2">King of the Chart</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <TrophyIcon className="w-6 h-6" />
                   </div>
                   <p className="text-xl font-black text-[#2d2621]">{data.reduce((prev, current) => (prev.total > current.total) ? prev : current).planet}</p>
                </div>
             </div>
             <div className="p-5 rounded-3xl bg-[#fcf8f5] border border-[#f1ebe6]">
                <p className="text-[10px] font-black text-[#8c7e74] uppercase mb-2">Primary Challenge</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                      <FireIcon className="w-6 h-6" />
                   </div>
                   <p className="text-xl font-black text-[#2d2621]">{data.reduce((prev, current) => (prev.total < current.total) ? prev : current).planet}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Radar Chart SVG - Adjusted for Light Background */}
        <div className="relative bg-[#fcf8f5] rounded-[48px] p-8 border border-[#f1ebe6]">
          <svg width={size} height={size} className="drop-shadow-sm">
            {/* Grid Circles */}
            {[0.2, 0.4, 0.6, 0.8, 1].map((step, i) => (
              <circle 
                key={i} 
                cx={center} cy={center} r={radius * step} 
                fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" 
              />
            ))}
            {/* Axis Lines */}
            {radarPoints.map((p, i) => {
              const angle = (i * 2 * Math.PI) / planetsCount - Math.PI / 2;
              return (
                <g key={i}>
                  <line 
                    x1={center} y1={center} 
                    x2={center + radius * Math.cos(angle)} 
                    y2={center + radius * Math.sin(angle)} 
                    stroke="rgba(0,0,0,0.05)" 
                  />
                  <text 
                    x={center + (radius + 20) * Math.cos(angle)} 
                    y={center + (radius + 20) * Math.sin(angle)} 
                    fill="#8c7e74" 
                    fontSize="10" fontWeight="black" textAnchor="middle" alignmentBaseline="middle"
                  >
                    {p.planet.substring(0, 3)}
                  </text>
                </g>
              );
            })}
            {/* Data Polygon */}
            <path 
              d={radarPath} 
              fill="rgba(249, 115, 22, 0.1)" 
              stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
              className="transition-all duration-1000 ease-out"
            />
            {/* Dots */}
            {radarPoints.map((p, i) => (
              <circle 
                key={i} cx={p.x} cy={p.y} r="4" fill="#f97316" 
                className={`transition-all duration-300 ${selectedPlanet === p.planet ? 'r-6' : ''}`} 
              />
            ))}
          </svg>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selector Grid */}
        <div className="space-y-4">
           <h3 className="text-sm font-black text-[#8c7e74] uppercase tracking-widest px-2">Select Planet</h3>
           <div className="grid grid-cols-1 gap-3">
              {data.map(d => (
                <button
                  key={d.planet}
                  onClick={() => setSelectedPlanet(d.planet)}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                    selectedPlanet === d.planet 
                      ? 'bg-white border-[#f97316] shadow-lg ring-4 ring-orange-500/5' 
                      : 'bg-[#fcf8f5] border-transparent hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                       selectedPlanet === d.planet ? 'bg-orange-500 text-white' : 'bg-white text-[#8c7e74]'
                     }`}>
                        {d.planet.substring(0, 2)}
                     </div>
                     <span className="font-black text-[#2d2621]">{d.planet}</span>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-[#8c7e74] uppercase">Strength</p>
                     <p className="text-sm font-black text-[#f97316]">{d.total} pts</p>
                  </div>
                </button>
              ))}
           </div>
        </div>

        {/* Active Analysis */}
        <div className="lg:col-span-2 space-y-6">
           <div className="card-modern p-8 bg-white border-[#f1ebe6]">
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-[#2d2621] mb-1">{activePlanet.planet} Strength Matrix</h3>
                    <p className="text-xs font-bold text-[#8c7e74] uppercase tracking-widest">Component Breakdown (Virupas)</p>
                 </div>
                 <div className="text-right">
                    <span className="text-4xl font-black text-[#2d2621] leading-none">{activePlanet.percentage}%</span>
                    <p className="text-[10px] font-black text-[#8c7e74] uppercase mt-1">Total Capacity</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  { label: 'Sthana Bala (Positional)', val: activePlanet.sthana, max: 200, icon: CubeTransparentIcon, desc: 'Strength from specific sign placement and exaltation.' },
                  { label: 'Dig Bala (Directional)', val: activePlanet.dig, max: 60, icon: ArrowsPointingInIcon, desc: 'Power gained by being in the optimal compass house.' },
                  { label: 'Kala Bala (Temporal)', val: activePlanet.kala, max: 200, icon: ScaleIcon, desc: 'Strength from birth time, day, and planetary hour.' },
                  { label: 'Cesta Bala (Motional)', val: activePlanet.cesta, max: 100, icon: BoltIcon, desc: 'Energy from velocity and retrograde state.' },
                  { label: 'Naisargika Bala (Natural)', val: activePlanet.naisargika, max: 60, icon: LifebuoyIcon, desc: 'The inherent brightness of the planet by nature.' },
                  { label: 'Drig Bala (Aspectual)', val: activePlanet.drig, max: 60, icon: ShieldCheckIcon, desc: 'Boost or drain from views of other planets.' },
                ].map((m, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-center mb-3">
                       <div className="flex items-center gap-2">
                          <m.icon className="w-4 h-4 text-[#f97316]" />
                          <span className="text-[11px] font-black text-[#2d2621] uppercase tracking-tighter">{m.label}</span>
                       </div>
                       <span className="text-xs font-black text-[#2d2621]">{m.val} <span className="text-slate-300 font-medium">/ {m.max}</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ease-out rounded-full ${getMetricColor(m.val, m.max)}`} 
                         style={{ width: `${(m.val / m.max) * 100}%` }} 
                       />
                    </div>
                    <p className="mt-2 text-[9px] font-medium text-[#8c7e74] leading-relaxed group-hover:text-[#2d2621] transition-colors">{m.desc}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Baladi State', val: activePlanet.baladi, icon: AcademicCapIcon, color: 'text-indigo-500', desc: 'Planetary Age' },
                { label: 'Jagradadi State', val: activePlanet.jagradadi, icon: BoltIcon, color: 'text-amber-500', desc: 'Awakeness Level' },
                { label: 'Deeptadi State', val: activePlanet.deeptadi, icon: ChartBarSquareIcon, color: 'text-emerald-500', desc: 'Cosmic Mood' }
              ].map((s, i) => (
                <div key={i} className="card-modern p-6 bg-[#fffcf9] border-dashed border-2 text-center">
                   <s.icon className={`w-8 h-8 mx-auto mb-3 ${s.color}`} />
                   <p className="text-[10px] font-black text-[#8c7e74] uppercase mb-1">{s.label}</p>
                   <p className="text-lg font-black text-[#2d2621]">{s.val}</p>
                   <p className="text-[9px] font-bold text-[#8c7e74] mt-1">{s.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default StrengthView;