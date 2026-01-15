
import React, { useState } from 'react';
import { DivisionalChart, ChartPoint } from '../types';
import { 
  ArrowsRightLeftIcon, 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import NorthIndianChart from './NorthIndianChart';
import SouthIndianChart from './SouthIndianChart';

interface Props {
  chart: DivisionalChart;
  selectedPlanet: ChartPoint | null;
  onSelectPlanet: (p: ChartPoint | null) => void;
  defaultStyle?: 'North' | 'South';
  defaultMagnification?: number;
  title?: string;
}

const VedicChart: React.FC<Props> = ({ 
  chart, 
  selectedPlanet, 
  onSelectPlanet, 
  defaultStyle = 'North', 
  defaultMagnification = 1,
  title
}) => {
  const [style, setStyle] = useState<'North' | 'South'>(defaultStyle);
  const [scale, setScale] = useState(defaultMagnification);

  const toggleStyle = () => setStyle(prev => prev === 'North' ? 'South' : 'North');
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1);

  return (
    <div className="w-full bg-white rounded-[40px] border border-[#f1ebe6] shadow-sm overflow-hidden flex flex-col group/chart">
      {/* Chart Header/Toolbar */}
      <div className="px-6 py-4 border-b border-[#f1ebe6] flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {title || `${chart.varga} Matrix`}
            </h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Style: {style} Indian • {Math.round(scale * 100)}% Mag.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Magnification Controls */}
          <div className="flex items-center bg-white border border-[#f1ebe6] rounded-xl p-1 shadow-sm">
            <button 
              onClick={zoomOut}
              className="p-2 hover:bg-orange-50 text-slate-400 hover:text-orange-500 rounded-lg transition-all active:scale-90"
              title="Zoom Out"
            >
              <MagnifyingGlassMinusIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={resetZoom}
              className="px-2 text-[10px] font-black text-slate-600 hover:text-orange-500 transition-colors"
              title="Reset Zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button 
              onClick={zoomIn}
              className="p-2 hover:bg-orange-50 text-slate-400 hover:text-orange-500 rounded-lg transition-all active:scale-90"
              title="Zoom In"
            >
              <MagnifyingGlassPlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Style Toggle */}
          <button 
            onClick={toggleStyle}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
            Switch Style
          </button>
        </div>
      </div>

      {/* Main Chart Content */}
      <div className="p-4 sm:p-8 flex items-center justify-center bg-[#fffaf5] relative overflow-hidden min-h-[400px]">
        {/* Ambient Decorative Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        
        <div className="w-full transition-transform duration-500 ease-out flex justify-center">
          {style === 'North' ? (
            <NorthIndianChart 
              chart={chart}
              selectedPlanet={selectedPlanet}
              onSelectPlanet={onSelectPlanet}
              scale={scale}
              showLegend={false}
            />
          ) : (
            <SouthIndianChart 
              chart={chart}
              selectedPlanet={selectedPlanet}
              onSelectPlanet={onSelectPlanet}
              scale={scale}
              showLegend={false}
            />
          )}
        </div>
      </div>

      {/* Chart Footer Info */}
      <div className="px-6 py-3 bg-white border-t border-[#f1ebe6] flex items-center justify-between">
        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><ArrowPathIcon className="w-3 h-3" /> Auto-Synchronized</span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span>True Chitra Paksha Ayanamsa</span>
        </div>
        <div className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">
          Click planets for advanced root analysis
        </div>
      </div>
    </div>
  );
};

export default VedicChart;
