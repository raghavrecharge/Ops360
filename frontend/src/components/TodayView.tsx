import React from 'react';
import { TransitContext, Planet, Sign } from '../types';
import { SIGN_NAMES, SIGN_SYMBOLS } from '../constants';
import { 
  SunIcon, 
  MoonIcon, 
  BoltIcon, 
  GlobeAltIcon, 
  ClockIcon, 
  ChevronDoubleRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Props {
  data: TransitContext;
}

const TodayView: React.FC<Props> = ({ data }) => {
  const { panchang, transits, horaLord, isAuspicious } = data;

  const getPlanetIcon = (planet: Planet) => {
    switch(planet) {
      case Planet.Sun: return <SunIcon className="w-5 h-5 text-orange-500" />;
      case Planet.Moon: return <MoonIcon className="w-5 h-5 text-indigo-400" />;
      case Planet.Mars: return <BoltIcon className="w-5 h-5 text-rose-500" />;
      default: return <SparklesIcon className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Cosmic Header - Light Theme */}
      <div className="bg-white border border-[#f1ebe6] rounded-[40px] p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isAuspicious ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                {isAuspicious ? 'Auspicious Energy' : 'Cautious Energy'}
              </span>
              <span className="text-[#8c7e74] font-bold text-xs">{new Date().toDateString()}</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-[#2d2621]">Today's Alignment</h2>
            <p className="text-[#8c7e74] max-w-md font-medium leading-relaxed">
              The {panchang.moonPhase} Moon in {panchang.nakshatra} creates a field of {isAuspicious ? 'creative abundance' : 'internal reflection'}. Focus on {panchang.vara} activities.
            </p>
          </div>

          <div className="w-px h-24 bg-slate-100 hidden md:block" />

          <div className="flex gap-8">
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8c7e74]">Day Ruler</p>
              <div className="w-16 h-16 bg-[#fcf8f5] rounded-2xl flex items-center justify-center border border-[#f1ebe6] mx-auto">
                <SunIcon className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-xs font-bold text-orange-600">{panchang.dayLord}</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8c7e74]">Hora Lord</p>
              <div className="w-16 h-16 bg-[#fcf8f5] rounded-2xl flex items-center justify-center border border-[#f1ebe6] mx-auto animate-pulse">
                <ClockIcon className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="text-xs font-bold text-indigo-600">{horaLord}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Panchang Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Tithi', val: panchang.tithi, icon: MoonIcon, color: 'text-indigo-500' },
          { label: 'Vara', val: panchang.vara, icon: SunIcon, color: 'text-orange-500' },
          { label: 'Nakshatra', val: panchang.nakshatra, icon: SparklesIcon, color: 'text-amber-500' },
          { label: 'Yoga', val: panchang.yoga, icon: BoltIcon, color: 'text-rose-500' },
          { label: 'Karana', val: panchang.karana, icon: GlobeAltIcon, color: 'text-emerald-500' },
        ].map((p, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-[#f1ebe6] shadow-sm hover:border-orange-200 transition-all group">
            <p className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest mb-3">{p.label}</p>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center ${p.color} group-hover:scale-110 transition-transform`}>
                <p.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-black text-[#2d2621]">{p.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transits Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-modern p-8 bg-white">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-[#2d2621]">Planetary Transits (Gochar)</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black uppercase text-emerald-600">Live Degrees</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {transits.points.filter(p => p.planet !== Planet.Lagna).map((p, i) => (
                <div key={i} className="flex items-center gap-6 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#f1ebe6] flex items-center justify-center shadow-sm">
                    {getPlanetIcon(p.planet)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-black text-[#2d2621]">{p.planet}</p>
                      <p className="text-xs font-bold text-[#f97316]">{SIGN_NAMES[p.sign]} {p.degree.toFixed(2)}°</p>
                    </div>
                    <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" 
                        style={{ width: `${(p.degree / 30) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-[9px] font-bold text-[#8c7e74] uppercase">{p.nakshatra}</p>
                      <p className="text-[9px] font-bold text-[#8c7e74] uppercase">Pada {p.pada}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-modern p-6 bg-slate-50 border-slate-200">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-[#2d2621]">
              <ShieldCheckIcon className="w-6 h-6 text-emerald-500" /> Auspicious Windows
            </h3>
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black text-emerald-700 uppercase">Abhijit Muhurta</span>
                  <span className="text-[10px] font-bold text-emerald-800/40">11:44 - 12:34</span>
                </div>
                <p className="text-xs font-medium text-emerald-900/70">Peak victory timing. Perfect for starting new ventures or vital meetings.</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 opacity-80">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black text-rose-700 uppercase">Rahu Kaal</span>
                  <span className="text-[10px] font-bold text-rose-800/40">15:30 - 17:00</span>
                </div>
                <p className="text-xs font-medium text-rose-900/70">Shadow influence. Avoid major financial transactions or traveling.</p>
              </div>
            </div>
          </div>

          <div className="card-modern p-6 bg-amber-50 border-amber-200">
             <h3 className="text-sm font-black text-amber-900 mb-3 flex items-center gap-2">
               <ExclamationCircleIcon className="w-5 h-5" /> Today's Focus
             </h3>
             <p className="text-xs font-bold text-amber-800 leading-relaxed italic">
               "With the Moon in {panchang.nakshatra}, your intuition is heightened. It is a day of deep emotional intelligence rather than raw logic. Trust the first thought."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayView;