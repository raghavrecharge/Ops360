import React from 'react';
import { DivisionalChart, Planet, Sign } from '../types';
import { SIGN_NAMES } from '../constants';

interface Props {
  chart: DivisionalChart;
  title: string;
}

const NorthIndianChart: React.FC<Props> = ({ chart, title }) => {
  const houseCoordinates = [
    { x: 150, y: 100 }, { x: 75, y: 50 }, { x: 25, y: 100 },
    { x: 100, y: 150 }, { x: 25, y: 200 }, { x: 75, y: 250 },
    { x: 150, y: 200 }, { x: 225, y: 250 }, { x: 275, y: 200 },
    { x: 200, y: 150 }, { x: 275, y: 100 }, { x: 225, y: 50 },
  ];

  const lagnaPoint = chart.points.find(p => p.planet === Planet.Lagna);
  const lagnaSign = lagnaPoint ? lagnaPoint.sign : Sign.Aries;

  const getSignForHouse = (houseNum: number): Sign => {
    return ((lagnaSign + houseNum - 2) % 12 + 1) as Sign;
  };

  const getPlanetsInHouse = (houseNum: number) => {
    return chart.points.filter(p => p.house === houseNum && p.planet !== Planet.Lagna);
  };

  return (
    <div className="card-modern p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-extrabold text-[#2d2621]">{title}</h3>
        <span className="text-[10px] font-bold bg-[#f97316]/10 text-[#f97316] px-2 py-1 rounded">SIDEREAL</span>
      </div>
      <svg viewBox="0 0 300 300" className="w-full max-w-[380px] mx-auto">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 0.05 }} />
            <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 0.05 }} />
          </linearGradient>
        </defs>
        {/* Diamond Frame */}
        <rect x="0" y="0" width="300" height="300" fill="url(#chartGradient)" rx="4" />
        <line x1="0" y1="0" x2="300" y2="300" stroke="#f1ebe6" strokeWidth="1" />
        <line x1="300" y1="0" x2="0" y2="300" stroke="#f1ebe6" strokeWidth="1" />
        <rect x="0" y="0" width="300" height="300" fill="none" stroke="#f1ebe6" strokeWidth="2" />
        <path d="M150 0 L300 150 L150 300 L0 150 Z" fill="none" stroke="#f97316" strokeWidth="1" strokeOpacity="0.3" />

        {/* Render Houses */}
        {houseCoordinates.map((h, i) => {
          const houseNum = i + 1;
          const sign = getSignForHouse(houseNum);
          const planets = getPlanetsInHouse(houseNum);
          
          return (
            <g key={i}>
              <text x={h.x} y={h.y - 12} textAnchor="middle" fontSize="12" fill="#f97316" className="font-black">
                {sign}
              </text>
              <g transform={`translate(${h.x}, ${h.y})`}>
                {planets.map((p, pIdx) => (
                  <text 
                    key={pIdx} 
                    y={pIdx * 13 + 5} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fill={p.isRetrograde ? "#fa896b" : "#2d2621"}
                    className="font-bold"
                  >
                    {p.planet.substring(0, 2)}
                  </text>
                ))}
              </g>
            </g>
          );
        })}
      </svg>
      <div className="mt-8 flex justify-between items-center text-[11px] font-bold">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f97316]" />
          <span className="text-[#8c7e74]">Lagna: <span className="text-[#2d2621]">{SIGN_NAMES[lagnaSign]}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#fa896b]" />
          <span className="text-[#8c7e74]">Retrograde</span>
        </div>
      </div>
    </div>
  );
};

export default NorthIndianChart;