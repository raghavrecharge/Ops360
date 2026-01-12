import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  sav: number[];
  title: string;
}

const AshtakavargaChart: React.FC<Props> = ({ sav, title }) => {
  // SAV houses are traditionally indexed 1-12 corresponding to Rasi signs or Houses from Lagna.
  // We'll map them to the 12 house positions in the North Indian layout.
  
  const housePaths = [
    "M150 150 L75 75 L150 0 L225 75 Z",     // House 1 (Top Center Diamond)
    "M75 75 L0 0 L150 0 Z",                // House 2 (Top Left Triangle)
    "M75 75 L0 0 L0 150 Z",                // House 3 (Left Top Triangle)
    "M150 150 L75 75 L0 150 L75 225 Z",    // House 4 (Left Center Diamond)
    "M75 225 L0 150 L0 300 Z",             // House 5 (Left Bottom Triangle)
    "M75 225 L0 300 L150 300 Z",           // House 6 (Bottom Left Triangle)
    "M150 150 L75 225 L150 300 L225 225 Z",// House 7 (Bottom Center Diamond)
    "M225 225 L150 300 L300 300 Z",        // House 8 (Bottom Right Triangle)
    "M225 225 L300 300 L300 150 Z",        // House 9 (Right Bottom Triangle)
    "M150 150 L225 225 L300 150 L225 75 Z",// House 10 (Right Center Diamond)
    "M225 75 L300 150 L300 0 Z",           // House 11 (Right Top Triangle)
    "M225 75 L300 0 L150 0 Z"              // House 12 (Top Right Triangle)
  ];

  const labelCoords = [
    { x: 150, y: 75 },  { x: 75, y: 35 },  { x: 35, y: 75 },
    { x: 75, y: 150 }, { x: 35, y: 225 }, { x: 75, y: 265 },
    { x: 150, y: 225 }, { x: 225, y: 265 }, { x: 265, y: 225 },
    { x: 225, y: 150 }, { x: 265, y: 75 }, { x: 225, y: 35 }
  ];

  const getHouseColor = (points: number) => {
    if (points >= 32) return 'fill-emerald-500';
    if (points >= 28) return 'fill-emerald-400';
    if (points >= 25) return 'fill-amber-400';
    if (points >= 20) return 'fill-orange-400';
    return 'fill-rose-500';
  };

  const getHouseOpacity = (points: number) => {
    if (points >= 32) return '0.25';
    if (points >= 28) return '0.15';
    if (points >= 25) return '0.1';
    if (points >= 20) return '0.08';
    return '0.15';
  };

  return (
    <div className="card-modern p-8 bg-white border-[#f1ebe6]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black text-[#2d2621]">{title}</h3>
          <p className="text-[10px] font-bold text-[#8c7e74] uppercase tracking-widest mt-1">Heatmap of House Potency</p>
        </div>
        <div className="flex gap-2">
           <div className="w-3 h-3 rounded-full bg-emerald-400" />
           <div className="w-3 h-3 rounded-full bg-amber-400" />
           <div className="w-3 h-3 rounded-full bg-rose-400" />
        </div>
      </div>

      <div className="relative group">
        <svg viewBox="0 0 300 300" className="w-full max-w-[420px] mx-auto overflow-visible">
          {/* Main Frame */}
          <rect x="0" y="0" width="300" height="300" fill="none" stroke="#f1ebe6" strokeWidth="2" />
          <line x1="0" y1="0" x2="300" y2="300" stroke="#f1ebe6" strokeWidth="1" />
          <line x1="300" y1="0" x2="0" y2="300" stroke="#f1ebe6" strokeWidth="1" />
          <path d="M150 0 L300 150 L150 300 L0 150 Z" fill="none" stroke="#f1ebe6" strokeWidth="1.5" />

          {/* House Fills and Labels */}
          {housePaths.map((path, i) => {
            const points = sav[i] || 0;
            const colorClass = getHouseColor(points);
            const opacity = getHouseOpacity(points);
            
            return (
              <g key={i} className="transition-all duration-500">
                <path 
                  d={path} 
                  className={`${colorClass} hover:opacity-40 transition-opacity cursor-help`}
                  fillOpacity={opacity}
                />
                <circle 
                  cx={labelCoords[i].x} 
                  cy={labelCoords[i].y} 
                  r="14" 
                  className="fill-white stroke-[#f1ebe6]" 
                  strokeWidth="1" 
                />
                <text 
                  x={labelCoords[i].x} 
                  y={labelCoords[i].y + 1} 
                  textAnchor="middle" 
                  alignmentBaseline="middle"
                  className="font-black text-[12px] fill-[#2d2621]"
                >
                  {points}
                </text>
                <text 
                  x={labelCoords[i].x} 
                  y={labelCoords[i].y + 16} 
                  textAnchor="middle" 
                  className="font-bold text-[8px] fill-[#8c7e74] uppercase tracking-tighter"
                >
                  H{i + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 px-2">
           {[
             { label: 'Exalted (>32)', color: 'bg-emerald-500' },
             { label: 'Strong (28-31)', color: 'bg-emerald-400' },
             { label: 'Average (25-27)', color: 'bg-amber-400' },
             { label: 'Critical (<25)', color: 'bg-rose-500' }
           ].map((item, idx) => (
             <div key={idx} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-[9px] font-black text-[#8c7e74] uppercase tracking-tighter">{item.label}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex gap-3">
         <InformationCircleIcon className="w-5 h-5 text-[#f97316] flex-shrink-0" />
         <p className="text-[10px] font-bold text-[#8c7e74] leading-relaxed">
            Sarvashtakavarga (SAV) points represent the collective strength of the 7 main planets in a specific house. 
            Houses with >28 points act as focus areas for growth and success during transits.
         </p>
      </div>
    </div>
  );
};

export default AshtakavargaChart;