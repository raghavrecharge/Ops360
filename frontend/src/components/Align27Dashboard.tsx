import React from 'react';
import { Align27Moment } from '../types';

const Align27Dashboard: React.FC = () => {
  const score = 82; // Mock score
  const moments: Align27Moment[] = [
    { id: '1', type: 'Golden', start: '10:30', end: '11:45', reason: 'Jupiter-Moon trine in D9', score: 95 },
    { id: '2', type: 'Productive', start: '14:00', end: '16:00', reason: 'Mars in 10th House transit', score: 75 },
    { id: '3', type: 'Silence', start: '18:15', end: '19:30', reason: 'Saturn-Rahu square', score: 20 },
  ];

  const getMomentStyle = (type: string) => {
    switch(type) {
      case 'Golden': return 'bg-[#fff7ed] text-[#f97316] border-[#f97316]/20';
      case 'Productive': return 'bg-[#fffbeb] text-[#fbbf24] border-[#fbbf24]/20';
      case 'Silence': return 'bg-[#fefce8] text-[#eab308] border-[#eab308]/20';
      default: return 'bg-[#fcf8f5] text-[#8c7e74]';
    }
  };

  // SVG Circle Constants for Gauge
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top Welcome Card - Orange Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#f97316] to-[#fb923c] p-10 rounded-[48px] text-white shadow-xl shadow-orange-500/10">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-5xl font-extrabold mb-4 tracking-tight">Welcome Back!</h2>
            <p className="text-orange-50 text-xl font-medium max-w-lg leading-snug">
              Your cosmic alignment is <span className="font-extrabold text-white">exceptional</span> today. Perfect for bold moves and strategic expansion.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
              <button className="px-10 py-4 bg-white text-[#f97316] rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-white/20 transition-all">
                View Planner
              </button>
              <button className="px-10 py-4 bg-[#ffffff15] border border-white/40 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                Astro Insights
              </button>
            </div>
          </div>

          {/* Daily Alignment Widget - Frosted Glass Effect */}
          <div className="relative flex flex-col items-center justify-center w-[210px] h-[280px] bg-[#ffffff20] rounded-[40px] backdrop-blur-2xl border border-white/30 shadow-2xl">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="80" 
                  cy="80" 
                  r={radius} 
                  stroke="rgba(255,255,255,0.2)" 
                  strokeWidth="12" 
                  fill="transparent" 
                />
                <circle 
                  cx="80" 
                  cy="80" 
                  r={radius} 
                  stroke="white" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-black tracking-tighter text-white">{score}</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-[12px] font-black tracking-[0.3em] uppercase text-white/70 leading-tight">Daily</p>
              <p className="text-[16px] font-black tracking-[0.3em] uppercase text-white">Alignment</p>
            </div>
          </div>
        </div>
        
        {/* Background Soft Blobs */}
        <div className="absolute top-[-50px] left-[20%] w-72 h-72 bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-80px] right-[10%] w-96 h-96 bg-orange-400/10 rounded-full blur-[120px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {moments.map(m => (
          <div key={m.id} className={`p-6 rounded-2xl border flex flex-col justify-between h-full card-modern group`}>
            <div>
              <div className="flex justify-between items-center mb-5">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getMomentStyle(m.type)}`}>
                  {m.type}
                </span>
                <span className="text-xs font-bold text-[#8c7e74] bg-slate-50 px-2.5 py-1 rounded-md">{m.start} - {m.end}</span>
              </div>
              <p className="text-lg font-black text-[#2d2621] mb-3 leading-tight group-hover:text-[#f97316] transition-colors">{m.reason}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-[#f1ebe6] flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-[#8c7e74] tracking-wider">Potency</span>
              <span className="text-sm font-black text-[#f97316]">{m.score}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        <div className="card-modern p-8 bg-white border-[#f1ebe6]">
          <h3 className="text-xl font-black text-[#2d2621] mb-8">Celestial Rituals</h3>
          <div className="space-y-5">
            {[
              { text: "Recite Ganapati Atharvashirsha", color: "bg-orange-500", desc: "Removes obstacles for today's tasks." },
              { text: "Offer water to the Sun", color: "bg-emerald-500", desc: "Strengthens your vital energy and focus." },
              { text: "Wear light yellow tones", color: "bg-amber-500", desc: "Attracts Jupiterian benevolence and wisdom." }
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-5 p-4 hover:bg-[#fff7ed] rounded-[24px] transition-all cursor-pointer group border border-transparent hover:border-[#f1ebe6]">
                <div className={`w-14 h-14 rounded-2xl ${r.color} flex items-center justify-center text-white text-xl font-black shadow-sm`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-black text-[#2d2621] group-hover:text-[#f97316] transition-all">{r.text}</p>
                  <p className="text-xs font-semibold text-[#8c7e74] mt-0.5">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card-modern p-8 bg-[#fffcf9] border-dashed border-2">
          <div className="flex flex-col h-full">
            <h3 className="text-xl font-black text-[#2d2621] mb-6">Cosmic Weather</h3>
            <div className="bg-white p-6 rounded-[32px] border border-[#f1ebe6] shadow-sm mb-auto">
              <div className="flex items-start gap-4">
                <div className="text-4xl">✨</div>
                <div>
                  <p className="text-sm text-[#2d2621] font-bold italic leading-relaxed">
                    "The current planetary configuration suggests a day of deep mental clarity. Mercury's position favors concise communication and successful negotiations."
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button className="flex-1 py-4 bg-[#fff7ed] text-[#f97316] text-xs font-black rounded-2xl hover:bg-orange-100 transition-all uppercase tracking-widest">Full Report</button>
              <button className="flex-1 py-4 bg-white border border-[#f1ebe6] text-[#8c7e74] text-xs font-black rounded-2xl hover:bg-[#fffcf9] transition-all uppercase tracking-widest text-center">Sync Calendar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Align27Dashboard;