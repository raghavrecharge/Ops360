import React, { useState, useMemo } from 'react';
import { DashaNode, Planet } from '../types';
import { ChevronRightIcon, ChevronLeftIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';

interface Props {
  nodes: DashaNode[];
}

const DashaTree: React.FC<Props> = ({ nodes }) => {
  const [history, setHistory] = useState<DashaNode[][]>([nodes]);
  const [activeLevelIndex, setActiveLevelIndex] = useState(0);

  const currentNodes = history[activeLevelIndex];
  const parentNode = activeLevelIndex > 0 ? history[activeLevelIndex - 1].find(p => p.children === currentNodes) : null;

  const drillDown = (node: DashaNode) => {
    if (node.children && node.children.length > 0) {
      const newHistory = history.slice(0, activeLevelIndex + 1);
      newHistory.push(node.children);
      setHistory(newHistory);
      setActiveLevelIndex(activeLevelIndex + 1);
    }
  };

  const goBack = (index: number) => {
    setActiveLevelIndex(index);
  };

  const totalDuration = useMemo(() => {
    if (!currentNodes || currentNodes.length === 0) return 0;
    const start = new Date(currentNodes[0].start).getTime();
    const end = new Date(currentNodes[currentNodes.length - 1].end).getTime();
    return end - start;
  }, [currentNodes]);

  const startTime = useMemo(() => {
    if (!currentNodes || currentNodes.length === 0) return 0;
    return new Date(currentNodes[0].start).getTime();
  }, [currentNodes]);

  const getPlanetColor = (planet: string) => {
    const colors: Record<string, string> = {
      Sun: 'bg-orange-500',
      Moon: 'bg-blue-400',
      Mars: 'bg-red-500',
      Rahu: 'bg-slate-700',
      Jupiter: 'bg-yellow-500',
      Saturn: 'bg-indigo-700',
      Mercury: 'bg-emerald-500',
      Ketu: 'bg-amber-700',
      Venus: 'bg-rose-400',
    };
    return colors[planet] || 'bg-orange-500';
  };

  const getPlanetBorder = (planet: string) => {
    const borders: Record<string, string> = {
      Sun: 'border-orange-200',
      Moon: 'border-blue-100',
      Mars: 'border-red-100',
      Rahu: 'border-slate-300',
      Jupiter: 'border-yellow-100',
      Saturn: 'border-indigo-300',
      Mercury: 'border-emerald-100',
      Ketu: 'border-amber-200',
      Venus: 'border-rose-100',
    };
    return borders[planet] || 'border-orange-100';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {history.map((levelNodes, idx) => {
          const isLast = idx === activeLevelIndex;
          const node = idx === 0 ? { planet: 'Main' } : history[idx - 1].find(p => p.children === levelNodes);
          
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRightIcon className="w-4 h-4 text-[#8c7e74] flex-shrink-0" />}
              <button
                onClick={() => goBack(idx)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  isLast 
                    ? 'bg-[#f97316] text-white shadow-lg shadow-orange-500/20' 
                    : 'bg-white border border-[#f1ebe6] text-[#8c7e74] hover:bg-[#fff7ed] hover:text-[#f97316]'
                }`}
              >
                {node?.planet}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Timeline Visualization */}
      <div className="card-modern p-8 bg-[#fffcf9]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-[#f97316] rounded-full" />
            <h3 className="text-lg font-black text-[#2d2621]">
              {activeLevelIndex === 0 ? 'Major Mahadasha Periods' : `${parentNode?.planet} Sub-Period Timeline`}
            </h3>
          </div>
          <p className="text-xs font-bold text-[#8c7e74]">
            {new Date(currentNodes[0].start).getFullYear()} — {new Date(currentNodes[currentNodes.length - 1].end).getFullYear()}
          </p>
        </div>

        <div className="relative h-24 w-full bg-[#f1ebe6] rounded-lg overflow-hidden flex shadow-inner group/timeline">
          {currentNodes.map((node, i) => {
            const duration = new Date(node.end).getTime() - new Date(node.start).getTime();
            const width = (duration / totalDuration) * 100;
            const hasChildren = node.children && node.children.length > 0;
            const isActive = new Date() >= new Date(node.start) && new Date() <= new Date(node.end);

            return (
              <div
                key={node.id}
                style={{ width: `${width}%` }}
                onClick={() => drillDown(node)}
                className={`relative h-full border-r border-white/20 transition-all duration-300 group/bar
                  ${hasChildren ? 'cursor-pointer hover:brightness-110 active:scale-[0.98]' : ''}
                  ${getPlanetColor(node.planet)}`}
              >
                {/* Active Indicator Overlay */}
                {isActive && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse flex items-center justify-center">
                    <div className="w-1 h-full bg-white/40" />
                  </div>
                )}

                {/* Planet Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 overflow-hidden pointer-events-none">
                  <span className={`text-[10px] font-black text-white ${width < 5 ? 'hidden' : 'block'} drop-shadow-sm uppercase`}>
                    {node.planet.substring(0, 3)}
                  </span>
                  <span className={`text-[8px] font-bold text-white/80 ${width < 10 ? 'hidden' : 'block'}`}>
                    {new Date(node.start).getFullYear()}
                  </span>
                </div>

                {/* Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity z-50 pointer-events-none min-w-[140px]">
                   <div className="bg-[#2d2621] text-white p-3 rounded-lg text-[10px] shadow-xl">
                      <p className="font-black text-orange-400 mb-1">{node.planet}</p>
                      <p className="font-bold opacity-80">{new Date(node.start).toLocaleDateString()} - {new Date(node.end).toLocaleDateString()}</p>
                      {hasChildren && <p className="mt-2 text-emerald-400 font-black flex items-center gap-1 uppercase tracking-tighter"><MagnifyingGlassPlusIcon className="w-3 h-3" /> Click to Expand</p>}
                   </div>
                   <div className="w-2 h-2 bg-[#2d2621] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Time Indicator */}
        <div className="mt-4 flex justify-between items-center px-2">
          <div className="flex gap-4">
            {currentNodes.slice(0, 5).map((node, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${getPlanetColor(node.planet)}`} />
                <span className="text-[10px] font-black text-[#8c7e74] uppercase tracking-tighter">{node.planet}</span>
              </div>
            ))}
            {currentNodes.length > 5 && <span className="text-[10px] font-black text-[#8c7e74] uppercase tracking-tighter">...</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#f97316] uppercase tracking-widest">Live Transits Overlay</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Detailed List for Active Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentNodes.map((node) => {
          const isActive = new Date() >= new Date(node.start) && new Date() <= new Date(node.end);
          const hasChildren = node.children && node.children.length > 0;

          return (
            <div
              key={node.id}
              onClick={() => drillDown(node)}
              className={`group p-5 rounded-[12px] border-2 transition-all duration-300 flex items-center justify-between
                ${isActive ? 'bg-[#fff7ed] border-[#f97316]/30 shadow-md ring-4 ring-orange-500/5' : 'bg-white border-[#f1ebe6] hover:border-orange-200'}
                ${hasChildren ? 'cursor-pointer hover:translate-x-1' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${getPlanetColor(node.planet)} flex items-center justify-center text-white shadow-lg shadow-current/20 transition-transform group-hover:scale-110`}>
                  <span className="text-sm font-black uppercase tracking-tighter">{node.planet.substring(0, 2)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[15px] font-black text-[#2d2621]">{node.planet}</h4>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-[#13deb9]/10 text-[#13deb9] text-[9px] font-black uppercase tracking-widest">Active</span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-[#8c7e74] mt-1">
                    {new Date(node.start).toLocaleDateString()} — {new Date(node.end).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest">Duration</p>
                  <p className="text-xs font-black text-[#2d2621]">
                    {Math.round((new Date(node.end).getTime() - new Date(node.start).getTime()) / (1000 * 60 * 60 * 24 * 365.25 * 10) / 0.1)} Years
                  </p>
                </div>
                {hasChildren && (
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#8c7e74] group-hover:bg-[#f97316] group-hover:text-white transition-all">
                    <ChevronRightIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashaTree;