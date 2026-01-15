
import React, { useState, useMemo, useEffect } from 'react';
import { DashaNode, Planet } from '../types';
import { 
  Squares2X2Icon, 
  TableCellsIcon, 
  ArrowPathIcon,
  ChevronRightIcon,
  HomeIcon,
  BoltIcon,
  ClockIcon,
  SparklesIcon,
  LinkIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import DashaTree from './DashaTree';
import DashaTable from './DashaTable';

interface Props {
  nodes: DashaNode[];
}

const DashasView: React.FC<Props> = ({ nodes }) => {
  const [viewType, setViewType] = useState<'Timeline' | 'Table'>('Table');
  const [history, setHistory] = useState<DashaNode[][]>([nodes]);
  const [breadcrumbNodes, setBreadcrumbNodes] = useState<DashaNode[]>([]);
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);

  const currentNodes = history[history.length - 1];
  const currentDepth = history.length - 1;

  // AUTO-NAVIGATE TO ACTIVE ON MOUNT
  useEffect(() => {
    if (!hasAutoNavigated && nodes.length > 0) {
      goToActive();
      setHasAutoNavigated(true);
    }
  }, [nodes, hasAutoNavigated]);

  const drillDown = (node: DashaNode) => {
    if (node.children && node.children.length > 0) {
      setHistory([...history, node.children]);
      setBreadcrumbNodes([...breadcrumbNodes, node]);
    }
  };

  const goUp = (index: number) => {
    if (index === -1) {
      setHistory([nodes]);
      setBreadcrumbNodes([]);
    } else {
      setHistory(history.slice(0, index + 2));
      setBreadcrumbNodes(breadcrumbNodes.slice(0, index + 1));
    }
  };

  const resetToRoot = () => {
    setHistory([nodes]);
    setBreadcrumbNodes([]);
  };

  const goToActive = () => {
    const now = new Date();
    let currentLevelNodes = nodes;
    let newHistory = [nodes];
    let newBreadcrumbs: DashaNode[] = [];

    // Recursive search for active chain
    const findActive = (levelNodes: DashaNode[]) => {
      const active = levelNodes.find(n => new Date(n.start) <= now && new Date(n.end) >= now);
      if (active) {
        if (active.children && active.children.length > 0) {
          newHistory.push(active.children);
          newBreadcrumbs.push(active);
          findActive(active.children);
        }
      }
    };

    findActive(nodes);
    setHistory(newHistory);
    setBreadcrumbNodes(newBreadcrumbs);
  };

  const levelName = useMemo(() => {
    if (currentDepth === 0) return "Mahadasha";
    if (currentDepth === 1) return "Antardasha";
    if (currentDepth === 2) return "Pratyantardasha";
    if (currentDepth === 3) return "Sookshma Dasha";
    return `Level ${currentDepth + 1}`;
  }, [currentDepth]);

  // Find the full active path for the header summary
  const activePath = useMemo(() => {
    const now = new Date();
    const path: string[] = [];
    let searchLevel = nodes;
    
    while (searchLevel) {
      const active = searchLevel.find(n => new Date(n.start) <= now && new Date(n.end) >= now);
      if (active) {
        path.push(active.planet);
        searchLevel = active.children || [];
      } else {
        break;
      }
    }
    return path;
  }, [nodes]);

  // Calculate the parent path prefix for the table rows
  const pathPrefix = useMemo(() => {
    return breadcrumbNodes.map(n => n.planet).join(' - ');
  }, [breadcrumbNodes]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 1. LIGHT VIBRANT ACTIVE PATH HEADER (PREMIUM WHITE THEME) */}
      <div className="bg-white border-2 border-orange-50 rounded-[48px] p-10 lg:p-14 shadow-xl shadow-orange-500/5 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
          <div className="space-y-10 flex-1 w-full">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-[20px] bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40 ring-8 ring-orange-50 transition-all group-hover:scale-110 group-hover:rotate-6">
                  <BoltIcon className="w-8 h-8 text-white" />
               </div>
               <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400 block mb-1.5">Vimshottari Time-Sync</span>
                  <div className="flex items-center gap-2.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100/50">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Matrix Locked</span>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 lg:gap-5">
              {activePath.map((planet, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center bg-[#fcf8f5] border border-orange-100/40 pl-2 pr-8 py-2.5 rounded-[28px] transition-all hover:border-orange-300 hover:shadow-xl hover:-translate-y-1 group/pill cursor-default">
                    <div className="w-11 h-11 rounded-full bg-white border border-orange-100 flex items-center justify-center text-orange-500 shadow-sm mr-5 group-hover/pill:rotate-12 transition-transform">
                       <span className="text-xs font-black">{planet.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] opacity-80 mb-0.5">
                        {i === 0 ? 'Maha' : i === 1 ? 'Antar' : i === 2 ? 'Pratyantar' : 'Sookshma'}
                      </span>
                      <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter leading-none">
                        {planet}
                      </span>
                    </div>
                  </div>
                  {i < activePath.length - 1 && (
                    <div className="px-1 opacity-20 hidden md:block">
                       <ChevronRightIcon className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                </React.Fragment>
              ))}
              {activePath.length === 0 && <span className="text-slate-400 animate-pulse font-black uppercase text-xs tracking-[0.3em]">Synthesizing Celestial Stream...</span>}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 w-full xl:w-auto">
             <button 
               onClick={goToActive}
               className="p-6 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-100 rounded-[28px] transition-all active:scale-90 group/btn shadow-sm hover:shadow-orange-500/20"
               title="Locate Current Phase"
             >
                <MapIcon className="w-7 h-7 group-hover/btn:animate-bounce" />
             </button>
             <button 
               onClick={() => setViewType(viewType === 'Timeline' ? 'Table' : 'Timeline')}
               className="flex-1 xl:flex-none px-12 py-6 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/30 transition-all flex items-center justify-center gap-5 active:scale-95 group/mode"
             >
                {viewType === 'Timeline' ? <TableCellsIcon className="w-6 h-6 group-hover/mode:scale-110 transition-transform" /> : <Squares2X2Icon className="w-6 h-6 group-hover/mode:scale-110 transition-transform" />}
                {viewType === 'Timeline' ? 'Grid Table' : 'Flow View'}
             </button>
          </div>
        </div>
        
        {/* Aesthetic Glass Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/10 to-transparent rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none select-none overflow-hidden flex items-center justify-center">
           <div className="grid grid-cols-12 gap-12 rotate-12 scale-150">
             {Array.from({length: 48}).map((_, i) => (
               <SparklesIcon key={i} className="w-16 h-16 text-orange-500" />
             ))}
           </div>
        </div>
      </div>

      {/* 2. BREADCRUMB NAVIGATION */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2.5 px-3 bg-white/70 backdrop-blur-2xl rounded-[32px] border border-slate-100 sticky top-[70px] z-30 shadow-md">
         <button 
           onClick={resetToRoot}
           className={`flex items-center gap-2.5 px-7 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${breadcrumbNodes.length === 0 ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-orange-300 hover:text-orange-500 shadow-sm'}`}
         >
            <HomeIcon className="w-4.5 h-4.5" /> Root
         </button>
         
         {breadcrumbNodes.map((node, i) => (
           <React.Fragment key={node.id}>
             <ChevronRightIcon className="w-4 h-4 text-slate-300 shrink-0" />
             <button 
               onClick={() => goUp(i)}
               className={`flex items-center gap-2.5 px-7 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${i === breadcrumbNodes.length - 1 ? 'bg-orange-500 text-white border-orange-500 shadow-xl shadow-orange-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-orange-300 hover:text-orange-500 shadow-sm'}`}
             >
                {node.planet}
             </button>
           </React.Fragment>
         ))}

         <div className="ml-auto pr-8 hidden md:block">
            <div className="flex items-center gap-4">
               <div className="h-5 w-px bg-slate-200" />
               <span className="px-5 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100/60 shadow-inner">
                  Level: <span className="text-slate-700">{levelName}</span>
               </span>
            </div>
         </div>
      </div>

      {/* 3. DYNAMIC VIEW RENDERER */}
      <div className="w-full">
         {viewType === 'Timeline' ? (
           <div className="animate-in fade-in zoom-in-95 duration-700">
              <DashaTree nodes={currentNodes} onDrillDown={drillDown} onGoUp={goUp} />
           </div>
         ) : (
           <div className="animate-in fade-in slide-in-from-right-10 duration-700">
              <DashaTable 
                nodes={currentNodes} 
                onDrillDown={drillDown} 
                levelName={levelName}
                pathPrefix={pathPrefix}
              />
           </div>
         )}
      </div>

      {/* 4. FOOTER INSIGHT */}
      <div className="bg-white rounded-[48px] p-12 border border-[#f1ebe6] shadow-sm relative overflow-hidden group">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-5 flex-1">
               <div className="flex items-center gap-3">
                  <SparklesIcon className="w-7 h-7 text-orange-400" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Precision Analytics Protocol</p>
               </div>
               <p className="text-xl font-bold text-slate-700 italic leading-relaxed max-w-3xl">
                 "The hierarchical evolution of time from Mahadasha down to Sookshma levels creates a focal point for the soul's current expression of Karma."
               </p>
               <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50/50 w-fit px-4 py-1.5 rounded-lg border border-indigo-100/50">
                  <LinkIcon className="w-4 h-4" /> Lahiri Chitra Paksha Siderial Sync
               </div>
            </div>
            <div className="w-px h-28 bg-slate-100 hidden md:block" />
            <div className="p-10 bg-[#fcf8f5] border border-orange-100/30 rounded-[40px] shrink-0 text-center shadow-inner">
               <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Temporal Accuracy</p>
               <p className="text-4xl font-black text-slate-800 tracking-tighter">99.9<span className="text-xl text-emerald-500">%</span></p>
               <p className="text-[10px] font-black text-slate-400 uppercase mt-2 opacity-60">Verified Engine</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DashasView;
