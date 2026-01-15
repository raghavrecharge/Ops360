
import React, { useMemo } from 'react';
import { DashaNode, Planet } from '../types';
import { 
  ChevronRightIcon, 
  MagnifyingGlassPlusIcon, 
  ClockIcon,
  CalendarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface Props {
  nodes: DashaNode[];
  onDrillDown: (node: DashaNode) => void;
  onGoUp: (index: number) => void;
}

const DashaTree: React.FC<Props> = ({ nodes, onDrillDown, onGoUp }) => {
  const currentNodes = nodes;

  const getPlanetColor = (planet: string) => {
    const colors: Record<string, string> = {
      Sun: 'bg-orange-500',
      Moon: 'bg-blue-400',
      Mars: 'bg-rose-500',
      Rahu: 'bg-slate-700',
      Jupiter: 'bg-amber-500',
      Saturn: 'bg-indigo-700',
      Mercury: 'bg-emerald-500',
      Ketu: 'bg-amber-900',
      Venus: 'bg-pink-400',
    };
    return colors[planet] || 'bg-slate-400';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* 1. VISUAL TIMELINE STRIP */}
      <div className="bg-white p-3 rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-slate-50 rounded-[40px] p-8 lg:p-12 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
               <CalendarIcon className="w-6 h-6 text-indigo-500" />
               Level Perspective
            </h3>
            <span className="px-5 py-2 bg-white rounded-full text-[10px] font-black text-slate-400 border border-slate-200 tracking-widest">
               {new Date(currentNodes[0]?.start).getFullYear()} — {new Date(currentNodes[currentNodes.length - 1]?.end).getFullYear()}
            </span>
          </div>

          <div className="relative h-24 w-full bg-white rounded-3xl overflow-hidden flex shadow-inner group">
            {currentNodes.map((node) => {
              const start = new Date(node.start).getTime();
              const end = new Date(node.end).getTime();
              const totalSpan = new Date(currentNodes[currentNodes.length-1].end).getTime() - new Date(currentNodes[0].start).getTime();
              const width = ((end - start) / (totalSpan || 1)) * 100;
              const isActive = new Date() >= new Date(node.start) && new Date() <= new Date(node.end);
              const hasChildren = node.children && node.children.length > 0;

              return (
                <div
                  key={node.id}
                  style={{ width: `${width}%` }}
                  onClick={() => hasChildren && onDrillDown(node)}
                  className={`relative h-full border-r border-white/20 transition-all duration-300 group/bar ${hasChildren ? 'cursor-pointer hover:brightness-110 active:scale-[0.98]' : ''} ${getPlanetColor(node.planet)}`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse flex items-center justify-center">
                       <div className="w-0.5 h-full bg-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1">
                    <span className={`text-[11px] font-black text-white ${width < 6 ? 'hidden' : 'block'} uppercase tracking-tighter`}>{node.planet.substring(0, 3)}</span>
                  </div>
                  
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 z-50 pointer-events-none w-48 scale-90 group-hover/bar:scale-100 origin-bottom">
                     <div className="bg-slate-900 text-white p-5 rounded-3xl text-[10px] shadow-2xl border border-slate-700/50 backdrop-blur-md bg-slate-900/90">
                        <p className="font-black text-indigo-400 mb-2 uppercase tracking-[0.2em]">{node.planet}</p>
                        <div className="space-y-1 opacity-80 font-bold">
                           <p>Start: {new Date(node.start).toLocaleDateString('en-GB')}</p>
                           <p>End: {new Date(node.end).toLocaleDateString('en-GB')}</p>
                        </div>
                        {hasChildren && <p className="mt-4 text-emerald-400 font-black flex items-center gap-2 uppercase tracking-tighter animate-pulse"><MagnifyingGlassPlusIcon className="w-4 h-4" /> Analyze Deeper</p>}
                     </div>
                     <div className="w-4 h-4 bg-slate-900 rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2 border-r border-b border-slate-700/50" />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 flex flex-wrap gap-6 items-center justify-between">
             <div className="flex flex-wrap gap-5">
                {currentNodes.slice(0, 9).map((node, i) => (
                   <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${getPlanetColor(node.planet)} shadow-sm`} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.planet}</span>
                   </div>
                ))}
             </div>
             <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                <BoltIcon className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Real-Time Precision Sync</span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. GRID CARDS VIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentNodes.map((node) => {
          const now = new Date();
          const isActive = now >= new Date(node.start) && now <= new Date(node.end);
          const hasChildren = node.children && node.children.length > 0;
          
          return (
            <div
              key={node.id}
              onClick={() => hasChildren && onDrillDown(node)}
              className={`group p-8 rounded-[36px] border-2 transition-all duration-500 flex flex-col cursor-pointer relative overflow-hidden h-full ${
                isActive ? 'bg-indigo-50 border-indigo-200 shadow-2xl shadow-indigo-500/10 ring-4 ring-indigo-500/5 -translate-y-2' : 'bg-white border-slate-50 hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={`w-16 h-16 rounded-[24px] ${getPlanetColor(node.planet)} flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <span className="text-xl font-black uppercase">{node.planet.substring(0, 2)}</span>
                </div>
                {isActive && (
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest animate-in zoom-in-50 duration-500">
                      <BoltIcon className="w-3 h-3" /> Active Period
                   </div>
                )}
                {!isActive && hasChildren && (
                   <div className="p-2.5 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <ChevronRightIcon className="w-5 h-5" />
                   </div>
                )}
              </div>

              <div className="space-y-1 relative z-10">
                <h4 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                   {node.planet}
                   {isActive && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
                </h4>
                <div className="flex items-center gap-2 text-slate-400">
                   <CalendarIcon className="w-4 h-4" />
                   <p className="text-xs font-bold uppercase tracking-widest">
                    {new Date(node.start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} 
                    <span className="mx-2 opacity-30">/</span> 
                    {new Date(node.end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                   </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100/50 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                       Duration: {((new Date(node.end).getTime() - new Date(node.start).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2)} Years
                    </span>
                 </div>
                 {hasChildren && (
                    <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                       Drill Down <ChevronRightIcon className="w-3 h-3" />
                    </button>
                 )}
              </div>
              
              <div className="absolute -bottom-10 -right-10 p-12 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
                 <ClockIcon className="w-48 h-48" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashaTree;
