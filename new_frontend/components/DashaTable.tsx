
import React, { useMemo } from 'react';
import { DashaNode, Planet } from '../types';
import { 
  ChevronRightIcon, 
  ClockIcon, 
  BoltIcon,
  CalendarIcon,
  ArrowRightIcon,
  SparklesIcon,
  LinkIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Props {
  nodes: DashaNode[];
  onDrillDown: (node: DashaNode) => void;
  levelName: string;
  pathPrefix?: string;
}

const DashaTable: React.FC<Props> = ({ nodes, onDrillDown, levelName, pathPrefix }) => {
  const now = new Date();

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

  const getPeriodStatus = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now >= startDate && now <= endDate) return 'Active';
    if (now > endDate) return 'Past';
    return 'Future';
  };

  const calculateProgress = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const n = now.getTime();
    if (n < s) return 0;
    if (n > e) return 100;
    return ((n - s) / (e - s)) * 100;
  };

  const formatDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const years = diff / (1000 * 60 * 60 * 24 * 365.25);
    if (years >= 1) return `${years.toFixed(1)} Years`;
    const months = years * 12;
    if (months >= 1) return `${months.toFixed(1)} Months`;
    const days = months * 30;
    return `${Math.round(days)} Days`;
  };

  const activeNode = useMemo(() => {
    return nodes.find(n => {
      const s = new Date(n.start);
      const e = new Date(n.end);
      return now >= s && now <= e;
    });
  }, [nodes, now]);

  return (
    <div className="space-y-6">
      {/* 1. ASTROSAGE-STYLE ACTIVE PERIOD SPOTLIGHT */}
      {activeNode && (
        <div className="bg-white border-2 border-orange-50 rounded-[32px] p-6 lg:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[24px] ${getPlanetColor(activeNode.planet)} flex items-center justify-center text-white shadow-xl shadow-current/20 ring-8 ring-orange-50/50`}>
                 <BoltIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] leading-none mb-1.5">Vibrating Now</p>
                 <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                    {pathPrefix ? `${pathPrefix} - ${activeNode.planet}` : activeNode.planet}
                 </h4>
                 <div className="flex items-center gap-3 text-slate-400">
                    <CalendarIcon className="w-4 h-4 text-indigo-400" />
                    <p className="text-xs font-bold uppercase tracking-widest">
                       {new Date(activeNode.start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} — {new Date(activeNode.end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-8 pr-4">
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Time Elapsed</p>
                 <p className="text-lg font-black text-slate-800">{calculateProgress(activeNode.start, activeNode.end).toFixed(1)}%</p>
              </div>
              <div className="w-px h-12 bg-slate-100 hidden md:block" />
              <button 
                onClick={() => onDrillDown(activeNode)}
                disabled={!activeNode.children || activeNode.children.length === 0}
                className="px-8 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-30"
              >
                 Analyze Sub-Level <ChevronRightIcon className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

      {/* 2. TABULAR SEQUENCE */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#fcf8f5] border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3">Cosmic Regent Sequence</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3">Effective Timeline</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quantum Duration</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {nodes.map((node) => {
                const status = getPeriodStatus(node.start, node.end);
                const progress = calculateProgress(node.start, node.end);
                const hasChildren = node.children && node.children.length > 0;
                const isActive = status === 'Active';
                const fullName = pathPrefix ? `${pathPrefix} - ${node.planet}` : node.planet;

                return (
                  <tr 
                    key={node.id} 
                    onClick={() => hasChildren && onDrillDown(node)}
                    className={`group transition-all duration-300 ${hasChildren ? 'cursor-pointer hover:bg-slate-50' : ''} ${isActive ? 'bg-orange-50/30 relative' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500 animate-pulse" />
                        )}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-current/10 ${getPlanetColor(node.planet)} group-hover:scale-110 transition-transform relative shrink-0`}>
                          {node.planet.substring(0, 2).toUpperCase()}
                          {isActive && (
                             <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                             </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className={`text-base font-black tracking-tight truncate ${isActive ? 'text-orange-900' : 'text-slate-800'}`}>
                            {fullName}
                          </p>
                          <div className="flex items-center gap-2">
                             <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
                                {status === 'Active' ? 'Vibrating Now' : status === 'Past' ? 'Phase Completed' : 'Incoming Matrix'}
                             </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2.5">
                         <div className={`flex items-center gap-3 text-xs font-black ${isActive ? 'text-orange-800' : 'text-slate-600'}`}>
                            <CalendarIcon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-300'}`} />
                            <span className="font-mono tracking-tight">{new Date(node.start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span className="text-slate-300 font-normal">thru</span>
                            <span className="font-mono tracking-tight">{new Date(node.end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                         </div>
                         {isActive && (
                           <div className="space-y-1.5">
                              <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden border border-orange-100/30">
                                <div 
                                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000 ease-out" 
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[8px] font-black uppercase text-orange-400 tracking-tighter">
                                 <span>Phase Evolution</span>
                                 <span>{progress.toFixed(1)}% Complete</span>
                              </div>
                           </div>
                         )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-slate-300" />
                            <span className="text-sm font-black text-slate-700">{formatDuration(node.start, node.end)}</span>
                         </div>
                         {isActive && (
                           <p className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">
                              Current Time-Window
                           </p>
                         )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {hasChildren ? (
                        <button className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-orange-500 text-white shadow-xl shadow-orange-600/20 active:scale-95' : 'bg-slate-50 text-indigo-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                          <span>Analysis</span>
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest italic">Terminal Node</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-5 bg-[#fcf8f5] border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <SparklesIcon className="w-3.5 h-3.5 text-orange-400" /> Vimshottari 120-Year Sequence Sync
              </p>
              <div className="h-4 w-px bg-slate-200" />
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                 <LinkIcon className="w-3.5 h-3.5" /> High-Resolution Timing Engine
              </p>
           </div>
           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Verified Sequence</span>
        </div>
      </div>
    </div>
  );
};

export default DashaTable;
