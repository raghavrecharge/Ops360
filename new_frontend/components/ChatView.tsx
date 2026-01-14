import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { 
  PaperAirplaneIcon, 
  SparklesIcon, 
  UserCircleIcon, 
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  CommandLineIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatView: React.FC<Props> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const suggestions = [
    "What does my Lagna say about my personality?",
    "Analyze my career potential (10th House)",
    "What are the best remedies for my weakest planet?",
    "Explain the impact of my current Mahadasha."
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-[20px] border border-[#f1ebe6] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Chat Header */}
      <div className="px-8 py-5 border-b border-[#f1ebe6] flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-[#f97316]" />
           </div>
           <div>
              <h3 className="text-sm font-black text-[#2d2621] uppercase tracking-widest">Vedic Oracle AI</h3>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1.5 uppercase">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Analyzing Your Chart
              </p>
           </div>
        </div>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white border border-[#f1ebe6] rounded-lg">
           <CommandLineIcon className="w-4 h-4 text-slate-400" />
           <span className="text-[10px] font-black text-[#8c7e74] uppercase tracking-tighter">Context: D1 + Dasha + Transits</span>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-slate-300" />
             </div>
             <div className="max-w-sm">
                <p className="text-lg font-black text-[#2d2621]">Ask the Oracle</p>
                <p className="text-sm font-bold text-[#8c7e74] mt-1">Receive personalized insights based on your unique celestial signature.</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl px-4">
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => onSendMessage(s)}
                    className="p-3 bg-white border border-[#f1ebe6] hover:border-[#f97316]/30 hover:bg-orange-50/30 rounded-lg text-[11px] font-bold text-[#2d2621] transition-all text-left"
                  >
                    {s}
                  </button>
                ))}
             </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-[#f97316] text-white' : 'bg-white border border-[#f1ebe6] text-indigo-600'}`}>
                {m.role === 'user' ? <UserCircleIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
              </div>
              <div className={`p-6 rounded-[16px] shadow-sm ${m.role === 'user' ? 'bg-[#f97316] text-white rounded-tr-none' : 'bg-white border border-[#f1ebe6] text-[#2d2621] rounded-tl-none'}`}>
                 <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                   {m.content}
                 </p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-lg bg-white border border-[#f1ebe6] flex items-center justify-center text-indigo-600 shadow-sm animate-bounce">
                <CpuChipIcon className="w-6 h-6" />
              </div>
              <div className="p-6 bg-slate-50 border border-[#f1ebe6] rounded-[16px] rounded-tl-none flex items-center gap-2">
                 <div className="w-2 h-2 bg-[#f97316]/40 rounded-full animate-pulse" />
                 <div className="w-2 h-2 bg-[#f97316]/60 rounded-full animate-pulse [animation-delay:200ms]" />
                 <div className="w-2 h-2 bg-[#f97316] rounded-full animate-pulse [animation-delay:400ms]" />
                 <span className="ml-2 text-[10px] font-black text-[#8c7e74] uppercase tracking-widest">Resonating with Cosmos...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 border-t border-[#f1ebe6] bg-white">
        <form onSubmit={handleSubmit} className="relative group">
          <input 
            type="text" 
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your career, health, relationships or spiritual path..."
            className="w-full pl-6 pr-16 py-5 bg-slate-50 border border-transparent focus:border-[#f97316]/30 focus:bg-white focus:ring-4 focus:ring-[#f97316]/5 rounded-xl outline-none text-sm font-bold text-[#2d2621] transition-all disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-[#f97316] text-white rounded-lg hover:bg-[#fb923c] transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center gap-6">
           <div className="flex items-center gap-2 text-[10px] font-black text-[#8c7e74] uppercase tracking-tighter">
              <BoltIcon className="w-3.5 h-3.5 text-amber-500" /> Powered by Gemini Flash 2.0
           </div>
           <span className="w-1 h-1 rounded-full bg-slate-300" />
           <p className="text-[10px] font-black text-[#8c7e74] uppercase tracking-tighter">
             AI advice is interpretive. Consult professionals for major life decisions.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;