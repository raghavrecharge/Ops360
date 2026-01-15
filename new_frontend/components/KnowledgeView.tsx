
import React, { useState, useMemo } from 'react';
import { KBChunk } from '../types';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon, 
  AcademicCapIcon, 
  TagIcon, 
  ClockIcon, 
  ChevronRightIcon,
  XMarkIcon,
  BookmarkIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon as ChevronRightMiniIcon,
  ArrowRightIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface Props {
  data: KBChunk[];
}

const KnowledgeView: React.FC<Props> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<KBChunk | null>(null);

  const categories = useMemo(() => ['All', ...Array.from(new Set(data.map(item => item.category)))], [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data, searchQuery, selectedCategory]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header & Search */}
      <div className="bg-white rounded-[48px] p-10 lg:p-14 border border-[#f1ebe6] shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="relative z-10 flex-1 space-y-8">
           <div className="space-y-2">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 text-indigo-600">
                 <AcademicCapIcon className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Vedic Vidya Repository</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-[#2d2621] tracking-tight">The Knowledge Hub</h2>
           </div>

           <p className="text-[#8c7e74] font-medium max-w-2xl leading-relaxed text-lg italic">
             "Knowledge is the supreme ornament of a human being." Explore the foundational algorithms of destiny through our curated library of classical Jyotish wisdom.
           </p>
           
           <div className="relative max-w-xl group">
              <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#8c7e74] group-focus-within:text-[#f97316] transition-colors" />
              <input 
                type="text" 
                placeholder="Search planets, houses, or deep concepts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-[#fcf8f5] border-2 border-transparent focus:border-[#f97316]/20 focus:bg-white rounded-3xl outline-none text-base font-bold text-[#2d2621] transition-all shadow-inner"
              />
           </div>
        </div>

        <div className="w-full lg:w-80">
           <div className="p-8 bg-[#fffcf9] border-2 border-dashed border-orange-200 rounded-[40px] group relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase text-[#f97316] mb-4 flex items-center gap-2 tracking-widest relative z-10">
                 <SparklesIcon className="w-4 h-4 animate-pulse" /> Sage Insight
              </h3>
              <p className="text-sm font-bold text-[#2d2621] leading-relaxed relative z-10">
                "The Moon traverses one Nakshatra every 24 hours, painting the collective mental atmosphere with a unique lunar brushstroke."
              </p>
              <div className="absolute -bottom-6 -right-6 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                <FireIcon className="w-32 h-32 text-orange-950" />
              </div>
           </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="flex flex-wrap gap-4 px-4 items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Filter Catalog:</span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedCategory === cat 
                ? 'bg-[#4f46e5] text-white shadow-xl shadow-indigo-500/20' 
                : 'bg-white border border-[#f1ebe6] text-[#8c7e74] hover:bg-slate-50 hover:text-[#4f46e5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredData.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedArticle(item)}
            className="group bg-white rounded-[40px] border-2 border-slate-50 hover:border-indigo-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col cursor-pointer relative overflow-hidden"
          >
            <div className="p-10 flex flex-col h-full relative z-10">
              <div className="flex justify-between items-start mb-10">
                 <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-[#8c7e74] group-hover:bg-[#4f46e5]/10 group-hover:text-[#4f46e5] transition-all duration-500 shadow-inner">
                    <BookOpenIcon className="w-8 h-8" />
                 </div>
                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 font-black text-[9px] uppercase tracking-widest transition-colors ${
                   item.difficulty === 'Beginner' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                   item.difficulty === 'Intermediate' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                   'bg-rose-50 border-rose-100 text-rose-600'
                 }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.difficulty === 'Beginner' ? 'bg-emerald-500' : item.difficulty === 'Intermediate' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                    {item.difficulty}
                 </div>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-[10px] font-black text-[#4f46e5] uppercase tracking-[0.3em]">{item.category}</p>
                <h3 className="text-2xl font-black text-[#2d2621] tracking-tight leading-tight group-hover:text-indigo-700 transition-colors">{item.title}</h3>
                <p className="text-sm font-medium text-[#8c7e74] leading-relaxed line-clamp-3 italic">
                  "{item.summary}"
                </p>
              </div>

              <div className="mt-auto space-y-6">
                <div className="flex flex-wrap gap-2">
                   {item.tags.slice(0, 3).map(t => (
                     <span key={t} className="px-3 py-1 bg-[#fcf8f5] text-[#8c7e74] rounded-lg text-[9px] font-black uppercase tracking-tighter border border-slate-100">#{t}</span>
                   ))}
                </div>
                
                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <ClockIcon className="w-4 h-4" /> {item.readTime} Analysis
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                      Initiate Study <ArrowRightIcon className="w-4 h-4" />
                   </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Icon Backdrop */}
            <div className="absolute -bottom-10 -right-10 p-12 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
               <AcademicCapIcon className="w-56 h-56" />
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="h-96 flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-[48px] border-2 border-dashed border-slate-100 opacity-80">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <MagnifyingGlassIcon className="w-12 h-12" />
           </div>
           <div className="space-y-1">
              <p className="text-xl font-black text-[#2d2621]">Vibration not found</p>
              <p className="text-sm font-bold text-[#8c7e74]">Try adjusting your search query or celestial category</p>
           </div>
           <button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Clear All Filters</button>
        </div>
      )}

      {/* Article Detail View Overlay */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 lg:p-10">
           <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500"
            onClick={() => setSelectedArticle(null)}
           />
           <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              {/* Overlay Header */}
              <div className="px-10 py-8 flex items-center justify-between border-b border-[#f1ebe6]">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                       <BookOpenIcon className="w-8 h-8" />
                    </div>
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 block mb-1">Detailed Shastra Scan</span>
                       <h3 className="text-xl font-black text-[#2d2621] uppercase tracking-tighter">Vedic Study Protocol</h3>
                    </div>
                 </div>
                 <button 
                  onClick={() => setSelectedArticle(null)}
                  className="p-4 hover:bg-rose-50 text-[#8c7e74] hover:text-rose-600 rounded-2xl transition-all active:scale-90"
                 >
                    <XMarkIcon className="w-8 h-8" />
                 </button>
              </div>

              {/* Overlay Content */}
              <div className="flex-1 overflow-y-auto p-10 lg:p-20 custom-scrollbar bg-[#fdfcfb]">
                 <div className="max-w-3xl mx-auto space-y-12">
                    <div className="space-y-6">
                       <div className="flex flex-wrap items-center gap-4">
                          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] bg-indigo-50 px-4 py-1 rounded-full">{selectedArticle.category}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 uppercase border border-emerald-100 tracking-widest">{selectedArticle.difficulty} MasterClass</span>
                       </div>
                       <h1 className="text-5xl lg:text-6xl font-black text-[#2d2621] leading-[1.05] tracking-tighter">
                          {selectedArticle.title}
                       </h1>
                       <div className="flex items-center gap-10 text-xs font-bold text-[#8c7e74] pt-4 border-t border-slate-100">
                          <span className="flex items-center gap-3"><ClockIcon className="w-5 h-5 text-indigo-400" /> {selectedArticle.readTime} Deep Dive</span>
                          <span className="flex items-center gap-3"><BookmarkIcon className="w-5 h-5 text-orange-400" /> Authorized Source</span>
                       </div>
                    </div>

                    <div className="p-8 bg-indigo-900 rounded-[40px] shadow-2xl relative overflow-hidden group">
                       <p className="text-xl font-bold text-white leading-relaxed italic relative z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                          "{selectedArticle.summary}"
                       </p>
                       <SparklesIcon className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
                    </div>

                    <div className="space-y-10">
                       {selectedArticle.content.split('\n').map((para, i) => (
                         <p key={i} className="text-xl text-slate-700 leading-relaxed font-medium first-letter:text-5xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-3 first-letter:float-left">
                            {para}
                         </p>
                       ))}
                    </div>

                    <div className="pt-16 border-t border-slate-100">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">Celestial Tags & Resonances</h4>
                       <div className="flex flex-wrap gap-3">
                          {selectedArticle.tags.map(tag => (
                            <span key={tag} className="px-6 py-3 bg-white border-2 border-slate-50 hover:border-indigo-100 rounded-2xl text-sm font-black text-slate-700 transition-all cursor-default">
                               #{tag}
                            </span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Overlay Footer */}
              <div className="p-10 bg-white border-t border-[#f1ebe6] flex justify-center shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                 <button 
                  onClick={() => setSelectedArticle(null)}
                  className="px-16 py-5 bg-[#2d2621] text-white rounded-[24px] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-slate-900/30 active:scale-95 hover:scale-[1.02] transition-all"
                 >
                    Return to Matrix Library
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeView;
