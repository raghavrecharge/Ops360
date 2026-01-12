import React from 'react';
import { CompatibilityData } from '../types';
import { 
  HeartIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  UserGroupIcon, 
  ScaleIcon, 
  FireIcon,
  SparklesIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface Props {
  data: CompatibilityData;
}

const CompatibilityView: React.FC<Props> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 25) return 'text-emerald-500';
    if (score >= 18) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getProgressColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio > 0.7) return 'bg-emerald-500';
    if (ratio > 0.4) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header Summary */}
      <div className="bg-white rounded-[40px] p-10 border border-[#f1ebe6] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="relative z-10 flex-1 space-y-6">
          <div className="flex items-center gap-3">
             <div className="px-4 py-1 bg-rose-50 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100 text-rose-600 flex items-center gap-2">
               <HeartIcon className="w-4 h-4" /> Relationship Sync
             </div>
             <span className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest">{data.partner1} & {data.partner2}</span>
          </div>
          <h2 className="text-4xl font-black text-[#2d2621] tracking-tight">Ashta Koota Analysis</h2>
          <p className="text-[#8c7e74] font-medium max-w-xl leading-relaxed text-lg italic">
            "Vedic compatibility measures the alignment of two souls through the moon's nakshatra. A score above 18/36 is considered foundational for a harmonious partnership."
          </p>
          
          <div className="flex items-center gap-4 pt-4">
             <div className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border-2 flex items-center gap-2 ${
               data.totalScore >= 18 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
             }`}>
               {data.totalScore >= 18 ? <CheckBadgeIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
               {data.summary}
             </div>
          </div>
        </div>

        {/* Big Score Gauge */}
        <div className="relative flex flex-col items-center justify-center p-10 bg-[#fcf8f5] rounded-[48px] border-2 border-dashed border-slate-200">
           <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="96" cy="96" r="80" stroke="#f1ebe6" strokeWidth="16" fill="transparent" />
                 <circle 
                   cx="96" cy="96" r="80" 
                   stroke={data.totalScore >= 18 ? '#10b981' : '#f43f5e'} 
                   strokeWidth="16" fill="transparent" 
                   strokeDasharray={2 * Math.PI * 80} 
                   strokeDashoffset={2 * Math.PI * 80 - (data.totalScore / 36) * 2 * Math.PI * 80}
                   strokeLinecap="round"
                   className="transition-all duration-1000 ease-out"
                 />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`text-6xl font-black tracking-tighter ${getScoreColor(data.totalScore)}`}>{data.totalScore}</span>
                 <span className="text-[10px] font-black text-[#8c7e74] uppercase mt-1 tracking-widest">Out of 36</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Manglik Section */}
        <div className="space-y-6">
           <div className="card-modern p-8 bg-slate-900 text-white">
              <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-rose-400">
                 <FireIcon className="w-6 h-6" /> Manglik (Kuja) Dosha
              </h3>
              <div className="space-y-8">
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-xs font-black uppercase text-slate-500">{data.partner1}</p>
                       <p className={`text-sm font-black mt-1 ${data.manglikStatus.partner1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {data.manglikStatus.partner1 ? 'High Intensity' : 'Non-Manglik'}
                       </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${data.manglikStatus.partner1 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                 </div>
                 <div className="flex justify-between items-center">
                    <div>
                       <p className="text-xs font-black uppercase text-slate-500">{data.partner2}</p>
                       <p className={`text-sm font-black mt-1 ${data.manglikStatus.partner2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {data.manglikStatus.partner2 ? 'High Intensity' : 'Non-Manglik'}
                       </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${data.manglikStatus.partner2 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                 </div>

                 {data.manglikStatus.cancellation && (
                    <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                       <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                          <ShieldCheckIcon className="w-4 h-4" /> Cancellation Found
                       </p>
                       <p className="text-xs font-bold text-slate-300">{data.manglikStatus.cancellation}</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="card-modern p-6 bg-[#fffcf9] border-dashed border-2">
              <h3 className="text-xs font-black text-[#8c7e74] uppercase tracking-widest mb-4">Astro Guidance</h3>
              <p className="text-sm font-bold text-[#2d2621] leading-relaxed italic">
                 "Matches scoring between 18-24 require conscious effort in communication. Mercury remedies are suggested for both partners to bridge the understanding gap."
              </p>
           </div>
        </div>

        {/* Koota Details */}
        <div className="lg:col-span-2 space-y-6">
           <div className="card-modern p-8 bg-white border-[#f1ebe6]">
              <h3 className="text-xl font-black text-[#2d2621] mb-8 flex items-center gap-3">
                 <ScaleIcon className="w-6 h-6 text-[#f97316]" /> The 8-Point Guna Matrix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {data.kootas.map((k, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-center mb-3">
                       <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-[#2d2621] uppercase tracking-tighter">{k.name}</span>
                          <span className="text-[9px] font-bold text-[#8c7e74] opacity-60">({k.description})</span>
                       </div>
                       <span className="text-xs font-black text-[#2d2621]">{k.score} <span className="text-slate-300 font-medium">/ {k.max}</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-1000 ease-out rounded-full ${getProgressColor(k.score, k.max)}`} 
                         style={{ width: `${(k.score / k.max) * 100}%` }} 
                       />
                    </div>
                    <p className="mt-2 text-[10px] font-medium text-[#8c7e74] leading-relaxed group-hover:text-[#2d2621] transition-colors">{k.interpretation}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-modern p-6 bg-[#fffcf9] border-2 border-emerald-100">
                 <UserGroupIcon className="w-8 h-8 text-emerald-500 mb-3" />
                 <h4 className="text-xs font-black uppercase text-[#8c7e74] mb-1">Social Dynamic</h4>
                 <p className="text-lg font-black text-[#2d2621]">Complementary</p>
                 <p className="text-[9px] font-bold text-[#8c7e74] mt-1">Growth through collaboration.</p>
              </div>
              <div className="card-modern p-6 bg-[#fffcf9] border-2 border-amber-100">
                 <SparklesIcon className="w-8 h-8 text-amber-500 mb-3" />
                 <h4 className="text-xs font-black uppercase text-[#8c7e74] mb-1">Spiritual Alignment</h4>
                 <p className="text-lg font-black text-[#2d2621]">Vata-Pitta Balance</p>
                 <p className="text-[9px] font-bold text-[#8c7e74] mt-1">Balanced constitutional sync.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityView;