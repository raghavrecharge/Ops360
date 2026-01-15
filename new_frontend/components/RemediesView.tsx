
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
  BoltIcon,
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface Props {
  data: Remedy[];
}

const RemediesView: React.FC<Props> = ({ data }) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Gemstone' | 'Mantra' | 'Charity'>('All');

  const filtered = activeCategory === 'All' ? data : data.filter(r => r.type === activeCategory);

  const getIcon = (type: string, className: string) => {
    switch (type) {
      case 'Gemstone': return <BeakerIcon className={className} />;
      case 'Mantra': return <SpeakerWaveIcon className={className} />;
      case 'Charity': return <HandRaisedIcon className={className} />;
      case 'Fasting': return <FireIcon className={className} />;
      default: return <SparklesIcon className={className} />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Panel */}
      <div className="bg-white rounded-[48px] p-10 lg:p-14 border border-[#f1ebe6] shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="relative z-10 flex-1 space-y-8">
           <div className="space-y-2">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-100 text-amber-600">
                 <FireIcon className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Karma Correction Protocols</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-[#2d2621] tracking-tight">Vedic Upaya Suite</h2>
           </div>
           
           <p className="text-[#8c7e74] font-medium max-w-2xl leading-relaxed text-lg italic">
             "Jyotish is the eye of wisdom. Remedies are the lens that help focus celestial light, neutralizing malefic drag and amplifying auspicious resonance."
           </p>
           
           <div className="flex flex-wrap gap-3">
              {['All', 'Gemstone', 'Mantra', 'Charity'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as any)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-[#f97316] text-white shadow-xl shadow-orange-500/20' 
                      : 'bg-[#fcf8f5] text-[#8c7e74] border border-transparent hover:border-orange-200 hover:text-[#f97316]'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        <div className="w-full lg:w-96">
           <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] relative overflow-hidden group">
              <h3 className="text-[10px] font-black uppercase text-indigo-600 mb-4 flex items-center gap-2 tracking-widest">
                 <InformationCircleIcon className="w-5 h-5" /> Fundamental Principle
              </h3>
              <p className="text-sm font-bold text-indigo-900 leading-relaxed relative z-10">
                "Gemstones act as physical filters for cosmic radiation, while Mantras use high-frequency sonic vibrations to re-code the subconscious neural matrix."
              </p>
              <div className="absolute -bottom-6 -right-6 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                <AcademicCapIcon className="w-32 h-32 text-indigo-900" />
              </div>
           </div>
        </div>
      </div>

      {/* Remedies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((r, i) => (
          <div key={i} className="group bg-white rounded-[40px] border-2 border-slate-50 hover:border-orange-100 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500 flex flex-col relative overflow-hidden">
            <div className="p-10 flex-1 flex flex-col relative z-10">
               <div className="flex justify-between items-start mb-10">
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-xl shadow-current/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`} style={{ backgroundColor: `${r.color}15`, color: r.color }}>
                     {getIcon(r.type, "w-8 h-8")}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg uppercase text-[#8c7e74] tracking-widest">{r.planet}</span>
                    <p className="text-[8px] font-bold text-slate-300 uppercase mt-1">Siderial Ruler</p>
                  </div>
               </div>

               <div className="space-y-2 mb-8">
                  <h3 className="text-2xl font-black text-[#2d2621] tracking-tight group-hover:text-orange-600 transition-colors">{r.title}</h3>
                  <p className="text-xs font-bold text-[#8c7e74] leading-relaxed line-clamp-2 italic">
                    "{r.description}"
                  </p>
               </div>

               <div className="space-y-4 mt-auto">
                  <div className="p-5 bg-[#fcf8f5] rounded-3xl border border-dashed border-orange-200">
                     <p className="text-[9px] font-black text-[#f97316] uppercase mb-2 flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4" /> Biological Resonance
                     </p>
                     <p className="text-sm font-black text-[#2d2621]">{r.benefit}</p>
                  </div>

                  {r.type === 'Gemstone' && (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-[#8c7e74] uppercase mb-1 tracking-widest">Base Metal</p>
                          <p className="text-xs font-black text-[#2d2621]">{r.metal}</p>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-[#8c7e74] uppercase mb-1 tracking-widest">Anatomical Link</p>
                          <p className="text-xs font-black text-[#2d2621]">{r.finger}</p>
                       </div>
                    </div>
                  )}

                  {r.type === 'Mantra' && (
                    <div className="space-y-4">
                       <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-3xl relative overflow-hidden">
                          <p className="text-[9px] font-black text-indigo-600 uppercase mb-3 flex items-center gap-2 tracking-widest">
                             <BoltIcon className="w-4 h-4 animate-pulse" /> Akshara Frequency
                          </p>
                          <p className="text-sm font-black text-indigo-950 leading-relaxed font-mono italic">
                             "{r.mantraText}"
                          </p>
                       </div>
                       <div className="flex justify-between items-center px-2">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Focus: {r.mantraDeity}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.count} Mala Cycles</span>
                       </div>
                    </div>
                  )}
               </div>

               <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full shadow-inner animate-pulse" style={{ backgroundColor: r.color }} />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prescribed: {r.day}s</span>
                  </div>
                  {r.avoid && (
                    <div className="group/warn relative">
                       <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase">Restrictions</span>
                       </div>
                       <div className="absolute bottom-full right-0 mb-4 w-56 p-5 bg-slate-900 text-white rounded-3xl text-[10px] font-bold opacity-0 group-hover/warn:opacity-100 transition-all z-50 pointer-events-none shadow-2xl scale-95 group-hover/warn:scale-100 origin-bottom-right">
                          <p className="text-rose-400 uppercase font-black mb-2 tracking-widest">Avoid Interactions</p>
                          {r.avoid}
                          <div className="w-3 h-3 bg-slate-900 rotate-45 absolute -bottom-1.5 right-6" />
                       </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Decorative Background Element */}
            <div className="absolute -bottom-10 -right-10 p-12 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none">
               {getIcon(r.type, "w-56 h-56")}
            </div>
          </div>
        ))}
      </div>

      {/* Universal Daily Protocol */}
      <div className="bg-[#1e1b4b] rounded-[56px] p-12 lg:p-16 text-white overflow-hidden relative shadow-2xl">
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">
                     Dina-Charya Protocol
                  </div>
                  <h3 className="text-4xl font-black tracking-tight leading-tight">Universal Daily Rituals</h3>
                  <p className="text-indigo-200 font-medium text-lg leading-relaxed">
                    Beyond specific chart remedies, these foundational practices maintain general cosmic harmony and clear energetic pathways.
                  </p>
               </div>
               
               <div className="space-y-5">
                  {[
                    "Sun-gazing during the first hour of sunrise for metabolic ignition.",
                    "Storage and consumption of water from copper vessels.",
                    "Dana: Feeding birds or stray animals before your own meal.",
                    "Sandhya: Lighting a ghee lamp during the twilight transition."
                  ].map((text, idx) => (
                    <div key={idx} className="flex items-start gap-5 group/list">
                       <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-xs font-black flex-shrink-0 mt-1 shadow-lg shadow-orange-500/20 group-hover/list:rotate-12 transition-transform">
                          {idx + 1}
                       </div>
                       <p className="text-base font-bold text-white leading-relaxed opacity-90 group-hover/list:opacity-100 transition-opacity">{text}</p>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[40px] border border-white/10 space-y-6 relative group">
               <h4 className="text-[10px] font-black uppercase text-orange-400 tracking-[0.4em] mb-4">Precision Science Note</h4>
               <p className="text-sm font-bold text-indigo-100 leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                 "Remedial efficacy is proportional to the practitioner's internal clarity. For gemstones, ensure skin contact and authentic quality (Sattvic sources). Mantras require focused Japa and correct pronunciation (Varna) for maximum waveform impact."
               </p>
               <button className="w-full py-5 bg-white text-[#1e1b4b] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-400 hover:text-white transition-all shadow-xl active:scale-95">
                  Request Personalized Consultation <ArrowRightIcon className="w-5 h-5" />
               </button>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      </div>
    </div>
  );
};

export default RemediesView;
function AcademicCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147L12 15l7.74-4.853a1.125 1.125 0 000-1.921L12 3.375l-7.74 4.853a1.125 1.125 0 000 1.921z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147L12 15l7.74-4.853a1.125 1.125 0 000-1.921L12 3.375l-7.74 4.853a1.125 1.125 0 000 1.921z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v5.25" />
    </svg>
  );
}
