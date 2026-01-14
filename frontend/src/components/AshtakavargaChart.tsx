import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  sav: number[];
  title: string;
  onHouseHover?: (house: number | null) => void;
}

const AshtakavargaChart: React.FC<Props> = ({ sav, title, onHouseHover }) => {
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
    if (points >= 25) return 'fill-indigo-500';
    if (points >= 20) return 'fill-amber-500';
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
    <div className="w-full flex flex-col items-center">
      {title && (
        <div className="flex justify-between items-center w-full mb-8">
          <div>
            <h3 className="text-xl font-black text-[#2d2621]">{title}</h3>
            <p className="text-[10px] font-bold text-[#8c7e74] uppercase tracking-widest mt-1">Heatmap of House Potency</p>
          </div>
        </div>
      )}

      <div className="relative group w-full flex flex-col items-center">
        <svg viewBox="0 0 300 300" className="w-full max-w-[480px] overflow-visible drop-shadow-2xl">
          {/* Main Frame */}
          <rect x="0" y="0" width="300" height="300" fill="none" stroke="#f1ebe6" strokeWidth="2" rx="4" />
          <line x1="0" y1="0" x2="300" y2="300" stroke="#f1ebe6" strokeWidth="1" />
          <line x1="300" y1="0" x2="0" y2="300" stroke="#f1ebe6" strokeWidth="1" />
          <path d="M150 0 L300 150 L150 300 L0 150 Z" fill="none" stroke="#f1ebe6" strokeWidth="1.5" />

          {/* House Fills and Labels */}
          {housePaths.map((path, i) => {
            const points = sav[i] || 0;
            const colorClass = getHouseColor(points);
            const opacity = getHouseOpacity(points);
            
            return (
              <g 
                key={i} 
                className="transition-all duration-300 group/house"
                onMouseEnter={() => onHouseHover?.(i + 1)}
                onMouseLeave={() => onHouseHover?.(null)}
              >
                <path 
                  d={path} 
                  className={`${colorClass} transition-opacity cursor-pointer group-hover/house:fill-opacity-40`}
                  fillOpacity={opacity}
                />
                
                {/* Background circle for score */}
                <circle 
                  cx={labelCoords[i].x} 
                  cy={labelCoords[i].y} 
                  r="16" 
                  className="fill-white stroke-[#f1ebe6] shadow-sm transition-transform group-hover/house:scale-110" 
                  strokeWidth="1.5" 
                />
                
                {/* Score Number */}
                <text 
                  x={labelCoords[i].x} 
                  y={labelCoords[i].y + 1} 
                  textAnchor="middle" 
                  alignmentBaseline="middle"
                  className="font-black text-[13px] fill-[#2d2621] pointer-events-none"
                >
                  {points}
                </text>
                
                {/* House Indicator */}
                <text 
                  x={labelCoords[i].x} 
                  y={labelCoords[i].y + 20} 
                  textAnchor="middle" 
                  className="font-black text-[8px] fill-[#8c7e74] uppercase tracking-tighter opacity-40 group-hover/house:opacity-100 pointer-events-none"
                >
                  H{i + 1}
                </text>
              </g>
            );
          })}

          <text x="150" y="150" textAnchor="middle" alignmentBaseline="middle" className="fill-indigo-500/10 font-black text-[60px] pointer-events-none select-none">
            SAV
          </text>
        </svg>

        {/* Legend */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full max-w-2xl px-4">
           {[
             { label: 'Exceptional (>32)', color: 'bg-emerald-500' },
             { label: 'Strong (28-31)', color: 'bg-emerald-400' },
             { label: 'Collective (25-27)', color: 'bg-indigo-500' },
             { label: 'Caution (<25)', color: 'bg-rose-500' }
           ].map((item, idx) => (
             <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                <div className={`w-3 h-3 rounded-full ${item.color} shadow-inner`} />
                <span className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest whitespace-nowrap">{item.label}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AshtakavargaChart;