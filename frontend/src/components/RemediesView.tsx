import React, { useState } from 'react';
import { Remedy, Planet } from '../types';
import { 
  SparklesIcon, 
  SpeakerWaveIcon, 
  HandRaisedIcon, 
  LifebuoyIcon, 
  BeakerIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  FireIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface Props {
  data: Remedy[];
}

const RemediesView: React.FC<Props> = ({ data }) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Gemstone' | 'Mantra' | 'Charity'>('All');

  const filtered = activeCategory === 'All' ? data : data.filter(r => r.type === activeCategory);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Gemstone': return <BeakerIcon className="w-6 h-6" />;
      case 'Mantra': return <SpeakerWaveIcon className="w-6 h-6" />;
      case 'Charity': return <HandRaisedIcon className="w-6 h-6" />;
      default: return <SparklesIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Panel */}
      <div className="bg-white rounded-[20px] p-10 border border-[#f1ebe6] shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="relative z-10 flex-1 space-y-6">
           <div className="flex items-center gap-3">
              <div className="px-4 py-1 bg-amber-50 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 text-amber-600 flex items-center gap-2">
                 <FireIcon className="w-4 h-4" /> Karma Correction
              </div>
           </div>
           <h2 className="text-4xl font-black text-[#2d2621] tracking-tight">Vedic Remedial Suite</h2>
           <p className="text-[#8c7e74] font-medium max-w-xl leading-relaxed text-lg">
             "Jyotish is the eye of wisdom. Remedies (Upayas) are the lens that help focus celestial energy, pacifying malefic influences and strengthening beneficial ones."
           </p>
           
           <div className="flex flex-wrap gap-3">
              {['All', 'Gemstone', 'Mantra', 'Charity'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-[#f97316] text-white shadow-lg shadow-orange-500/20' 
                      : 'bg-slate-50 text-[#8c7e74] hover:bg-orange-50 hover:text-[#f97316]'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        <div className="w-full lg:w-80 space-y-4">
           <div className="card-modern p-6 bg-slate-50 text-[#2d2621] border-slate-200">
              <h3 className="text-xs font-black uppercase text-orange-500 mb-3 flex items-center gap-2">
                 <InformationCircleIcon className="w-4 h-4" /> Core Principle
              </h3>
              <p className="text-xs font-medium text-[#8c7e74] leading-relaxed italic">
                "Gemstones provide continuous filtration of planetary light, while Mantras use sonic vibration to re-align the subconscious mind."
              </p>
           </div>
        </div>
      </div>

      {/* Remedies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r, i) => (
          <div key={i} className="card-modern flex flex-col bg-white overflow-hidden group">
            <div className="h-1.5 w-full" style={{ backgroundColor: r.color }} />
            <div className="p-8 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-[10px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`} style={{ backgroundColor: `${r.color}15`, color: r.color }}>
                     {getIcon(r.type)}
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 bg-slate-50 border rounded uppercase text-[#8c7e74]">{r.planet}</span>
               </div>

               <h3 className="text-xl font-black text-[#2d2621] mb-2">{r.title}</h3>
               <p className="text-xs font-bold text-[#8c7e74] mb-6 leading-relaxed">
                 {r.description}
               </p>

               <div className="space-y-4 mt-auto">
                  <div className="p-4 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                     <p className="text-[10px] font-black text-[#f97316] uppercase mb-1">Key Benefit</p>
                     <p className="text-xs font-black text-[#2d2621]">{r.benefit}</p>
                  </div>

                  {r.type === 'Gemstone' && (
                    <div className="grid grid-cols-2 gap-3">
                       <div className="text-[10px] font-bold">
                          <p className="text-[#8c7e74] uppercase mb-0.5">Metal</p>
                          <p className="text-[#2d2621]">{r.metal}</p>
                       </div>
                       <div className="text-[10px] font-bold">
                          <p className="text-[#8c7e74] uppercase mb-0.5">Finger</p>
                          <p className="text-[#2d2621]">{r.finger}</p>
                       </div>
                    </div>
                  )}

                  {r.type === 'Mantra' && (
                    <div className="space-y-3">
                       <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-lg">
                          <p className="text-[10px] font-black text-indigo-600 uppercase mb-2 flex items-center gap-1.5">
                             <BoltIcon className="w-3.5 h-3.5" /> Japa Protocol
                          </p>
                          <p className="text-xs font-medium text-indigo-900 leading-relaxed font-mono">
                             "{r.mantraText}"
                          </p>
                       </div>
                       <div className="flex justify-between text-[10px] font-black text-indigo-400 uppercase">
                          <span>Focus: {r.mantraDeity}</span>
                          <span>{r.count}x Daily</span>
                       </div>
                    </div>
                  )}
               </div>

               <div className="mt-8 pt-6 border-t border-[#f1ebe6] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                     <span className="text-[10px] font-black text-[#8c7e74] uppercase">Prescribed for {r.day}</span>
                  </div>
                  {r.avoid && (
                    <div className="group/warn relative">
                       <ExclamationTriangleIcon className="w-5 h-5 text-rose-400 cursor-help" />
                       <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-rose-600 text-white rounded-lg text-[10px] font-bold opacity-0 group-hover/warn:opacity-100 transition-opacity z-50 pointer-events-none">
                          Avoid: {r.avoid}
                       </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Universal Daily Protocol - Light Theme */}
      <div className="card-modern p-10 bg-white border-[#f1ebe6] text-[#2d2621] overflow-hidden relative shadow-sm">
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
               <h3 className="text-2xl font-black mb-4">Universal Daily Rituals</h3>
               <p className="text-[#8c7e74] font-medium text-sm leading-relaxed mb-8">
                 Beyond specific chart remedies, these foundational practices maintain general cosmic harmony and metabolic vitality.
               </p>
               <div className="space-y-4">
                  {[
                    "Sun-gazing during the first hour of sunrise.",
                    "Drinking water from a copper vessel in the morning.",
                    "Feeding birds or stray animals daily before your main meal.",
                    "Lighting a ghee lamp during twilight hours."
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                       <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 text-white">
                          {idx + 1}
                       </div>
                       <p className="text-sm font-bold text-[#2d2621]">{text}</p>
                    </div>
                  ))}
               </div>
            </div>
            <div className="bg-slate-50 p-8 rounded-[16px] border border-slate-200">
               <h4 className="text-xs font-black uppercase text-orange-500 mb-6 tracking-widest">Remedy Science Disclaimer</h4>
               <p className="text-xs font-medium text-[#8c7e74] leading-relaxed italic">
                 Remedies work by shifting the internal consciousness. For gemstone usage, always consult with a certified lapidary to ensure skin contact and authentic quality. Mantras should be pronounced with clarity and devotion for maximum efficacy.
               </p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  );
};

export default RemediesView;