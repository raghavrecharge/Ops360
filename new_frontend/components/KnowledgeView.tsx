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
  SparklesIcon
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header & Search */}
      <div className="bg-white rounded-[20px] p-10 border border-[#f1ebe6] shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="relative z-10 flex-1 space-y-6">
           <div className="flex items-center gap-3">
              <div className="px-4 py-1 bg-indigo-50 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 text-indigo-600 flex items-center gap-2">
                 <AcademicCapIcon className="w-4 h-4" /> Vedic Vidya
              </div>
           </div>
           <h2 className="text-4xl font-black text-[#2d2621] tracking-tight">The Knowledge Hub</h2>
           <p className="text-[#8c7e74] font-medium max-w-xl leading-relaxed text-lg">
             "Knowledge is the supreme ornament of a human being." Explore the foundational principles of Jyotish through our curated library.
           </p>
           
           <div className="relative max-w-md group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7e74] group-focus-within:text-[#f97316] transition-colors" />
              <input 
                type="text" 
                placeholder="Search planets, houses, or concepts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent focus:border-[#f97316]/30 focus:bg-white rounded-lg outline-none text-sm font-bold text-[#2d2621] transition-all"
              />
           </div>
        </div>

        <div className="w-full lg:w-72 hidden lg:block">
           <div className="card-modern p-6 bg-[#fffcf9] border-dashed border-2">
              <h3 className="text-xs font-black uppercase text-[#8c7e74] mb-3 flex items-center gap-2">
                 <SparklesIcon className="w-4 h-4 text-orange-400" /> Daily Insight
              </h3>
              <p className="text-xs font-bold text-[#2d2621] leading-relaxed italic">
                "The Moon stays in one Nakshatra for roughly one day, profoundly coloring the mental atmosphere of that period."
              </p>
           </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-3 px-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              selectedCategory === cat 
                ? 'bg-[#f97316] text-white shadow-lg shadow-orange-500/20' 
                : 'bg-white border border-[#f1ebe6] text-[#8c7e74] hover:bg-orange-50 hover:text-[#f97316]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedArticle(item)}
            className="card-modern p-8 bg-white flex flex-col cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-[#8c7e74] group-hover:bg-[#f97316]/10 group-hover:text-[#f97316] transition-all">
                  <BookOpenIcon className="w-6 h-6" />
               </div>
               <span className={`text-[10px] font-black px-2 py-1 rounded uppercase border ${
                 item.difficulty === 'Beginner' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                 item.difficulty === 'Intermediate' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                 'bg-rose-50 border-rose-100 text-rose-600'
               }`}>
                 {item.difficulty}
               </span>
            </div>

            <p className="text-[10px] font-black text-[#f97316] uppercase tracking-widest mb-1">{item.category}</p>
            <h3 className="text-xl font-black text-[#2d2621] mb-3 group-hover:text-[#f97316] transition-colors">{item.title}</h3>
            <p className="text-sm font-medium text-[#8c7e74] leading-relaxed mb-6 line-clamp-2">
              {item.summary}
            </p>

            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-black text-[#8c7e74] uppercase tracking-tighter">
                 <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5" /> {item.readTime} Read
                 </div>
                 <div className="flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5" /> {item.tags[0]}
                 </div>
              </div>
              <div className="pt-4 border-t border-[#f1ebe6] flex items-center justify-between text-[#2d2621]">
                 <span className="text-xs font-black uppercase tracking-widest">Read Article</span>
                 <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="h-96 card-modern flex flex-col items-center justify-center border-dashed border-2 opacity-50">
           <MagnifyingGlassIcon className="w-16 h-16 text-[#8c7e74] mb-4" />
           <p className="text-lg font-black text-[#2d2621]">No articles found</p>
           <p className="text-sm font-bold text-[#8c7e74]">Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Article Detail View Overlay */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 lg:p-10">
           <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setSelectedArticle(null)}
           />
           <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#fcf8f5] rounded-[20px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
              {/* Overlay Header */}
              <div className="h-16 flex items-center justify-between px-8 bg-white border-b border-[#f1ebe6]">
                 <div className="flex items-center gap-3">
                    <BookOpenIcon className="w-5 h-5 text-[#f97316]" />
                    <span className="text-xs font-black uppercase tracking-widest text-[#2d2621]">Article Detail</span>
                 </div>
                 <button 
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                 >
                    <XMarkIcon className="w-6 h-6 text-[#8c7e74]" />
                 </button>
              </div>

              {/* Overlay Content */}
              <div className="flex-1 overflow-y-auto p-10 lg:p-16 custom-scrollbar">
                 <div className="max-w-2xl mx-auto space-y-8">
                    <div className="space-y-4">
                       <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-black text-[#f97316] uppercase tracking-[0.2em]">{selectedArticle.category}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 uppercase border border-emerald-100">{selectedArticle.difficulty}</span>
                       </div>
                       <h1 className="text-4xl lg:text-5xl font-black text-[#2d2621] leading-tight tracking-tighter">
                          {selectedArticle.title}
                       </h1>
                       <div className="flex items-center gap-6 text-xs font-bold text-[#8c7e74]">
                          <span className="flex items-center gap-2"><ClockIcon className="w-4 h-4" /> {selectedArticle.readTime} estimation</span>
                          <span className="flex items-center gap-2"><BookmarkIcon className="w-4 h-4" /> Classical Wisdom</span>
                       </div>
                    </div>

                    <div className="p-6 bg-orange-50/40 rounded-xl border border-orange-100 italic font-medium text-orange-900 leading-relaxed text-lg">
                       "{selectedArticle.summary}"
                    </div>

                    <div className="prose prose-slate max-w-none">
                       {selectedArticle.content.split('\n').map((para, i) => (
                         <p key={i} className="text-lg text-[#2d2621] leading-relaxed mb-6 font-medium">
                            {para}
                         </p>
                       ))}
                    </div>

                    <div className="pt-10 border-t border-[#f1ebe6]">
                       <h4 className="text-[10px] font-black text-[#8c7e74] uppercase tracking-[0.3em] mb-4">Related Topics</h4>
                       <div className="flex flex-wrap gap-2">
                          {selectedArticle.tags.map(tag => (
                            <span key={tag} className="px-4 py-2 bg-white border border-[#f1ebe6] rounded text-xs font-bold text-[#2d2621]">
                               #{tag}
                            </span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Overlay Footer */}
              <div className="p-8 bg-white border-t border-[#f1ebe6] flex justify-center">
                 <button 
                  onClick={() => setSelectedArticle(null)}
                  className="px-12 py-4 bg-[#2d2621] text-white rounded-lg font-black uppercase tracking-widest text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                 >
                    Return to Library
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeView;