import React from 'react';
import { PlannerData } from '../types';
import { 
  CurrencyDollarIcon, 
  HeartIcon, 
  MapIcon, 
  CommandLineIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface Props {
  data: PlannerData;
}

const PlannerView: React.FC<Props> = ({ data }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Financial Trading': return <CurrencyDollarIcon className="w-6 h-6" />;
      case 'Health & Surgery': return <HeartIcon className="w-6 h-6" />;
      case 'Creative Travel': return <MapIcon className="w-6 h-6" />;
      case 'Logic & Coding': return <CommandLineIcon className="w-6 h-6" />;
      default: return <UserGroupIcon className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Peak': return 'bg-emerald-500 text-white';
      case 'Neutral': return 'bg-amber-500 text-white';
      default: return 'bg-rose-500 text-white';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Summary Section */}
      <div className="bg-white p-10 rounded-[24px] border border-[#f1ebe6] shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="text-sm font-black text-[#f97316] uppercase tracking-[0.3em] mb-4">Master Strategy</h3>
          <p className="text-3xl font-black text-[#2d2621] max-w-4xl leading-tight">
            "{data.daySummary}"
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
           <SparklesIcon className="w-32 h-32 text-orange-400" />
        </div>
      </div>

      {/* Activity Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {data.activities.map((item, i) => (
          <div key={i} className="card-modern p-6 bg-white border-2 border-transparent hover:border-orange-100 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-[#2d2621]">
                  {getIcon(item.category)}
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <h4 className="text-sm font-black text-[#2d2621] mb-2">{item.category}</h4>
              <p className="text-[11px] font-bold text-[#8c7e74] leading-relaxed">{item.advice}</p>
            </div>
            <div className="mt-8">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-black text-[#8c7e74] uppercase">Success Probability</span>
                 <span className="text-sm font-black text-[#2d2621]">{item.score}%</span>
               </div>
               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-1000 ease-out ${item.score > 70 ? 'bg-emerald-500' : item.score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                   style={{ width: `${item.score}%` }}
                 />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule & Tasks Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Vertical Timeline */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-[#2d2621]">Cosmic Schedule</h3>
              <div className="flex items-center gap-2">
                 <ClockIcon className="w-4 h-4 text-[#8c7e74]" />
                 <span className="text-xs font-bold text-[#8c7e74]">24-Hour Cycle</span>
              </div>
           </div>

           <div className="space-y-4">
             {data.schedule.map((slot, i) => (
               <div key={i} className="group flex gap-6">
                 <div className="w-20 pt-4 flex-shrink-0 text-right">
                    <span className="text-xs font-black text-[#8c7e74] uppercase tracking-tighter">{slot.time}</span>
                 </div>
                 <div className="flex-shrink-0 flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10 transition-transform group-hover:scale-110 ${
                      slot.category === 'Auspicious' ? 'bg-emerald-500' : slot.category === 'Warning' ? 'bg-rose-500' : 'bg-slate-500'
                    }`}>
                       {slot.category === 'Auspicious' ? <CheckCircleIcon className="w-5 h-5 text-white" /> : slot.category === 'Warning' ? <ExclamationTriangleIcon className="w-5 h-5 text-white" /> : <ClockIcon className="w-5 h-5 text-white" />}
                    </div>
                    {i < data.schedule.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-[-2px]" />}
                 </div>
                 <div className="flex-1 pb-10">
                    <div className="card-modern p-6 bg-white hover:shadow-lg transition-all">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-black text-[#2d2621]">{slot.title}</h4>
                          <span className="text-[10px] font-black text-[#f97316] uppercase tracking-widest">{slot.score} pts</span>
                       </div>
                       <p className="text-xs font-bold text-[#8c7e74] leading-relaxed mb-4">{slot.description}</p>
                       <div className="flex gap-2">
                          <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase">Nakshatra Influence</span>
                          <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase">Dasha Alignment</span>
                       </div>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Sidebar Activity - Light Theme */}
        <div className="space-y-8">
           <div className="card-modern p-8 bg-slate-50 text-[#2d2621] relative overflow-hidden border-slate-200">
              <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                 <CommandLineIcon className="w-6 h-6 text-indigo-500" /> System Protocols
              </h3>
              <div className="space-y-6">
                 {[
                   { title: 'Data Backup', time: '10:00 AM', status: 'Mandatory' },
                   { title: 'New Onboarding', time: '01:00 PM', status: 'Delay Recommended' },
                   { title: 'Budget Review', time: '04:00 PM', status: 'Optimal' },
                   { title: 'Network Expansion', time: '07:00 PM', status: 'High Energy' }
                 ].map((t, idx) => (
                   <div key={idx} className="flex justify-between items-center border-b border-slate-200 pb-4">
                      <div>
                         <p className="text-sm font-black">{t.title}</p>
                         <p className="text-[10px] font-bold text-slate-400">{t.time}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-1 rounded text-sm uppercase tracking-tighter ${
                        t.status.includes('Delay') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>{t.status}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="card-modern p-8 border-dashed border-2 bg-[#fffcf9]">
              <h3 className="text-sm font-black text-[#8c7e74] uppercase tracking-widest mb-4">Lunar Guidance</h3>
              <div className="space-y-4">
                 <p className="text-xs font-bold text-[#2d2621] leading-relaxed">
                   "As the Moon traverses the 11th house from your natal Lagna, the evening favors large group communications over intimate singular focus."
                 </p>
                 <div className="w-full h-1 bg-orange-100 rounded-full">
                    <div className="w-2/3 h-full bg-orange-400 rounded-full" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlannerView;