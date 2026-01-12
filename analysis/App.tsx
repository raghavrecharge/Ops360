import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChartBarIcon, 
  CalendarDaysIcon, 
  ChatBubbleBottomCenterTextIcon, 
  SparklesIcon, 
  UserCircleIcon, 
  Squares2X2Icon, 
  BellIcon, 
  ClockIcon, 
  TableCellsIcon, 
  ScaleIcon, 
  HeartIcon, 
  BookOpenIcon, 
  CpuChipIcon, 
  ArrowDownTrayIcon, 
  DocumentArrowDownIcon, 
  CheckBadgeIcon, 
  BeakerIcon, 
  InformationCircleIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  FireIcon,
  HandThumbUpIcon,
  StarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  MagnifyingGlassPlusIcon,
  MapPinIcon,
  KeyIcon,
  SunIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LifebuoyIcon,
  BoltIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { BirthData, DivisionalChart, DashaNode, UserProfile, YogaMatch, ChatMessage, Sign, Planet, ChartPoint, TransitContext, PlannerData, ShadbalaData, CompatibilityData, Remedy, KBChunk } from './types';
import { astrologyService, VarshaphalaData, AshtakavargaData } from './services/astrologyService';
import { geminiService } from './services/geminiService';
import NorthIndianChart from './components/NorthIndianChart.tsx';
import DashaTree from './components/DashaTree.tsx';
import Align27Dashboard from './components/Align27Dashboard.tsx';
import TodayView from './components/TodayView.tsx';
import PlannerView from './components/PlannerView.tsx';
import StrengthView from './components/StrengthView.tsx';
import CompatibilityView from './components/CompatibilityView.tsx';
import RemediesView from './components/RemediesView.tsx';
import KnowledgeView from './components/KnowledgeView.tsx';
import AshtakavargaChart from './components/AshtakavargaChart.tsx';
import ChatView from './components/ChatView.tsx';
import { SIGN_NAMES, SIGN_SYMBOLS } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [chart, setChart] = useState<DivisionalChart | null>(null);
  const [dashas, setDashas] = useState<DashaNode[]>([]);
  const [yogas, setYogas] = useState<YogaMatch[]>([]);
  const [avData, setAvData] = useState<AshtakavargaData | null>(null);
  const [todayData, setTodayData] = useState<TransitContext | null>(null);
  const [plannerData, setPlannerData] = useState<PlannerData | null>(null);
  const [shadbalaData, setShadbalaData] = useState<ShadbalaData[]>([]);
  const [compatibilityData, setCompatibilityData] = useState<CompatibilityData | null>(null);
  const [remediesData, setRemediesData] = useState<Remedy[]>([]);
  const [kbData, setKbData] = useState<KBChunk[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedVarga, setSelectedVarga] = useState(1);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const avRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const d1ChartOnlyRef = useRef<HTMLDivElement>(null);
  const varshaRef = useRef<HTMLDivElement>(null);

  const [varshaYear, setVarshaYear] = useState<number>(new Date().getFullYear());
  const [varshaData, setVarshaData] = useState<VarshaphalaData | null>(null);

  const VARGA_INFO: Record<number, { name: string; significance: string }> = {
    1: { name: 'Rasi', significance: 'Overall Life, Body, Personality' },
    2: { name: 'Hora', significance: 'Wealth, Fortune, Financial Health' },
    3: { name: 'Drekkana', significance: 'Siblings, Courage, Vitality' },
    4: { name: 'Chaturthamsa', significance: 'Property, Fixed Assets, Luck' },
    7: { name: 'Saptamsa', significance: 'Children, Progeny, Creativity' },
    9: { name: 'Navamsha', significance: 'Marriage, Fruit of Life, Real Strength' },
    10: { name: 'Dashamsha', significance: 'Career, Professional Success, Fame' },
    12: { name: 'Dwadasamsha', significance: 'Parents, Lineage, Past Life' },
    16: { name: 'Shodasamsa', significance: 'Vehicles, Comforts, Inner Happiness' },
    20: { name: 'Vimsamsa', significance: 'Spirituality, Devotion, Religious Path' },
    24: { name: 'Chaturvimsamsa', significance: 'Education, Knowledge, Learning' },
    27: { name: 'Nakshatramsa', significance: 'Innate Strengths, Weaknesses' },
    30: { name: 'Trimsamsa', significance: 'Miseries, Misfortunes, Character' },
    60: { name: 'Shastiamsa', significance: 'Past Life Karma, Soul History' }
  };

  const activeChart = useMemo(() => {
    if (!chart) return null;
    if (selectedVarga === 1) return chart;
    return astrologyService.calculateVarga(chart, selectedVarga);
  }, [chart, selectedVarga]);

  const currentDasha = useMemo(() => {
    const now = new Date();
    return dashas.find(d => new Date(d.start) <= now && new Date(d.end) >= now);
  }, [dashas]);

  const astroContext = useMemo(() => {
    if (!chart) return null;
    const lagna = chart.points.find(p => p.planet === Planet.Lagna);
    return {
      lagna: lagna ? `${SIGN_NAMES[lagna.sign]} (H1)` : 'Unknown',
      planets: chart.points.map(p => ({
        p: p.planet,
        s: SIGN_NAMES[p.sign],
        h: p.house,
        d: p.dignity
      })),
      activeDasha: currentDasha?.planet || 'Unknown',
      todayTransits: todayData?.panchang,
      yogas: yogas.slice(0, 3)
    };
  }, [chart, currentDasha, todayData, yogas]);

  const handleSendMessage = async (content: string) => {
    if (!astroContext) return;
    
    const userMsg: ChatMessage = { role: 'user', content };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
      const response = await geminiService.chat(newHistory, astroContext);
      setChatHistory([...newHistory, response]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory([...newHistory, { role: 'assistant', content: "Sorry, I lost alignment with the stars. Please rephrase your question." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const formatDMS = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.floor((((deg - d) * 60) - m) * 60);
    return `${d}° ${m}' ${s}"`;
  };

  const formatNakDegree = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.floor((((deg - d) * 60) - m) * 60);
    return `${d}° ${m}' ${s}"`;
  };

  const isGandanta = (p: ChartPoint) => {
    const isWaterEdge = [4, 8, 12].includes(p.sign) && p.degree > 29;
    const isFireStart = [1, 5, 9].includes(p.sign) && p.degree < 1;
    return isWaterEdge || isFireStart;
  };

  const getVargottamaStatus = (p: ChartPoint) => {
    if (!chart || selectedVarga === 1) return false;
    const natalPoint = chart.points.find(np => np.planet === p.planet);
    return natalPoint?.sign === p.sign;
  };

  const setupDemo = () => {
    const demoBirth: BirthData = {
      name: "Modern Seeker",
      dob: "1990-05-15",
      tob: "12:30",
      lat: 28.6139,
      lng: 77.2090,
      tz: "Asia/Kolkata"
    };
    const partnerBirth: BirthData = {
      name: "Cosmic Partner",
      dob: "1992-08-20",
      tob: "08:15",
      lat: 19.0760,
      lng: 72.8777,
      tz: "Asia/Kolkata"
    };
    const demoProfile: UserProfile = {
      id: "demo-user",
      birthData: demoBirth,
      preferences: { ayanamsa: 'Lahiri', chartStyle: 'North' }
    };
    setProfile(demoProfile);
    const d1 = astrologyService.calculateNatalChart(demoBirth);
    setChart(d1);
    const vDashas = astrologyService.getVimshottariDashas(demoBirth, 5);
    setDashas(vDashas);
    setVarshaData(astrologyService.calculateVarshaphala(demoBirth, new Date().getFullYear()));
    setAvData(astrologyService.calculateAshtakavarga(d1));
    setTodayData(astrologyService.getTodayData(demoBirth));
    setPlannerData(astrologyService.getPlannerData(demoBirth));
    const sbData = astrologyService.calculateShadbala(demoBirth);
    setShadbalaData(sbData);
    setCompatibilityData(astrologyService.calculateCompatibility(demoBirth, partnerBirth));
    setRemediesData(astrologyService.generateRemedies(sbData, d1));
    setKbData(astrologyService.getKnowledgeBase());

    setIsLoading(true);
    const deterministicYogas = astrologyService.detectYogas(d1);
    geminiService.findYogas(d1).then(aiYogas => {
      const existingNames = new Set(deterministicYogas.map(y => y.name));
      const filteredAi = aiYogas.filter(y => !existingNames.has(y.name));
      setYogas([...deterministicYogas, ...filteredAi]);
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    setupDemo();
  }, []);

  const exportToPDF = async (ref: React.RefObject<HTMLDivElement | null>, title: string, filename: string) => {
    if (!ref.current) return;
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 200));

      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const ignoreElements = clonedDoc.querySelectorAll('[data-pdf-ignore]');
          ignoreElements.forEach(el => {
            if (el instanceof HTMLElement) el.style.display = 'none';
          });
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.setFillColor(249, 115, 22); 
      pdf.rect(0, 0, pdfWidth, 40, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Astro Jyotish', margin, 20);
      pdf.setFontSize(14);
      pdf.text(title, margin, 32);

      const contentStartY = 50;
      pdf.addImage(imgData, 'PNG', margin, contentStartY, imgWidth, imgHeight);
      pdf.save(filename);
    } catch (error) {
      console.error('PDF Export Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navModules = [
    { section: 'CORE', items: [
      { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon },
      { id: 'today', label: 'Today', icon: ClockIcon },
      { id: 'planner', label: 'Planner', icon: CalendarDaysIcon }
    ]},
    { section: 'ASTROLOGY', items: [
      { id: 'charts', label: 'Charts', icon: ChartBarIcon },
      { id: 'dashas', label: 'Dashas', icon: CalendarDaysIcon },
      { id: 'ashtakavarga', label: 'Ashtakavarga', icon: TableCellsIcon },
      { id: 'yogas', label: 'Yogas', icon: SparklesIcon }
    ]},
    { section: 'ANALYSIS', items: [
      { id: 'strength', label: 'Strength', icon: ScaleIcon },
      { id: 'varshaphala', label: 'Varshaphala', icon: SparklesIcon },
      { id: 'compatibility', label: 'Compatibility', icon: HeartIcon },
      { id: 'remedies', label: 'Remedies', icon: SparklesIcon }
    ]},
    { section: 'INTELLIGENCE', items: [
      { id: 'knowledge', label: 'Knowledge', icon: BookOpenIcon },
      { id: 'chat', label: 'Chat', icon: ChatBubbleBottomCenterTextIcon }
    ]}
  ];

  return (
    <div className="flex h-screen bg-[#fcf8f5] text-[#2d2621]">
      {(isLoading) && (
        <div className="fixed inset-0 z-[9999] bg-[#2d2621]/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-lg font-bold">Processing Cosmic Data...</p>
        </div>
      )}

      <aside className="w-[280px] bg-white border-r border-[#f1ebe6] flex flex-col overflow-hidden">
        <div className="p-7 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f97316] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#2d2621] tracking-tight">Astro<span className="text-[#f97316]"> Jyotish</span></h1>
        </div>
        
        <nav className="flex-1 px-6 py-4 space-y-8 overflow-y-auto custom-scrollbar">
          {navModules.map((group) => (
            <div key={group.section} className="space-y-1">
              <p className="text-[11px] font-bold text-[#8c7e74] mb-4 px-2 tracking-widest uppercase">{group.section}</p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'sidebar-active text-white' 
                      : 'text-[#2d2621] hover:bg-[#fff7ed] hover:text-[#f97316]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : ''}`} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-[#f1ebe6] px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2d2621] capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl px-4 py-2">
              <UserCircleIcon className="w-5 h-5 text-[#f97316]" />
              <p className="text-[11px] font-bold text-[#2d2621]">Demo Profile</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'today' && todayData && <TodayView data={todayData} />}
            {activeTab === 'planner' && plannerData && <PlannerView data={plannerData} />}
            {activeTab === 'strength' && shadbalaData.length > 0 && <StrengthView data={shadbalaData} />}
            {activeTab === 'compatibility' && compatibilityData && <CompatibilityView data={compatibilityData} />}
            {activeTab === 'remedies' && remediesData.length > 0 && <RemediesView data={remediesData} />}
            {activeTab === 'knowledge' && kbData.length > 0 && <KnowledgeView data={kbData} />}
            {activeTab === 'chat' && (
              <ChatView 
                messages={chatHistory} 
                onSendMessage={handleSendMessage} 
                isLoading={isChatLoading} 
              />
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-[#f1ebe6] shadow-sm">
                   <div>
                      <h3 className="text-xl font-black text-[#2d2621]">Natal Summary</h3>
                      <p className="text-xs font-bold text-[#8c7e74] uppercase tracking-widest">D1 Rasi Alignment</p>
                   </div>
                   <button 
                     onClick={() => exportToPDF(dashboardRef, "Natal Chart (D1) Analysis", `${profile?.birthData.name}_Natal_Report.pdf`)}
                     className="px-6 py-3 bg-[#f97316] text-white text-xs font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-[#fbbf24] transition-all flex items-center gap-2 uppercase tracking-widest"
                   >
                     <DocumentArrowDownIcon className="w-5 h-5" />
                     Full Report
                   </button>
                </div>

                <div ref={dashboardRef} className="space-y-8 p-1">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                     <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
                       {chart && <NorthIndianChart chart={chart} title="Natal Rasi Chart (D1)" />}
                     </div>
                     <div className="space-y-6">
                        <div className="card-modern p-6 bg-[#fffcf9]">
                           <h4 className="text-sm font-black text-[#2d2621] uppercase mb-6 border-b pb-3 flex items-center gap-2">
                             <ScaleIcon className="w-5 h-5 text-orange-400" /> Natal Positions
                           </h4>
                           <div className="space-y-3">
                              {chart?.points.map(p => (
                                <div key={p.planet} className="flex justify-between items-center p-3 bg-white border border-[#f1ebe6] rounded-xl shadow-sm hover:border-[#f97316]/30 transition-all group">
                                   <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-[#2d2621]">{p.planet}</span>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest border ${
                                          p.dignity === 'Exalted' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                          p.dignity === 'Debilitated' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                          'bg-slate-50 border-slate-200 text-slate-400'
                                        }`}>
                                          {p.dignity?.substring(0, 3)}
                                        </span>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <div className="flex items-center gap-1.5 justify-end">
                                        <span className="text-[12px] leading-none text-slate-400">{SIGN_SYMBOLS[p.sign]}</span>
                                        <span className="text-xs font-bold text-[#2d2621]">{SIGN_NAMES[p.sign]}</span>
                                      </div>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
                <Align27Dashboard />
              </div>
            )}
            
            {activeTab === 'charts' && chart && activeChart && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Varga Selector Module */}
                <div className="bg-white p-8 rounded-[32px] border border-[#f1ebe6] shadow-sm space-y-8">
                   <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-inner">
                          <AdjustmentsHorizontalIcon className="w-8 h-8 text-[#f97316]" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-[#2d2621] tracking-tight">Varga Explorer</h3>
                          <p className="text-xs font-bold text-[#8c7e74] uppercase tracking-widest">Select divisional perspective for analysis</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full lg:w-auto">
                        <button onClick={() => exportToPDF(chartRef, `${VARGA_INFO[selectedVarga].name} Chart Analysis`, `Chart_D${selectedVarga}.pdf`)} className="flex-1 lg:flex-none px-8 py-3.5 bg-[#f97316] text-white text-[11px] font-black rounded-2xl uppercase flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
                          <ArrowDownTrayIcon className="w-5 h-5" /> Export D{selectedVarga} Report
                        </button>
                      </div>
                   </div>

                   {/* Modern Varga Selector Tabs */}
                   <div className="flex flex-wrap gap-2.5 pb-2 border-b border-[#f1ebe6]">
                      {[1, 9, 10].map(vNum => (
                        <button
                          key={vNum}
                          onClick={() => setSelectedVarga(vNum)}
                          className={`px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-3 ${
                            selectedVarga === vNum 
                            ? 'bg-[#f97316] border-[#f97316] text-white shadow-xl shadow-orange-500/20 translate-y-[-2px]' 
                            : 'bg-white border-[#f1ebe6] text-[#8c7e74] hover:border-orange-200 hover:text-orange-500'
                          }`}
                        >
                          <SparklesIcon className={`w-4 h-4 ${selectedVarga === vNum ? 'text-white' : 'text-orange-400'}`} />
                          D{vNum} - {VARGA_INFO[vNum].name}
                        </button>
                      ))}
                      
                      <div className="h-12 w-px bg-slate-100 mx-2 hidden sm:block" />

                      <div className="relative group flex-1 min-w-[240px] max-w-md">
                         <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                            <CommandLineIcon className="w-5 h-5 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Choose Division</span>
                         </div>
                         <select 
                            value={selectedVarga} 
                            onChange={(e) => setSelectedVarga(parseInt(e.target.value))}
                            className="w-full bg-slate-50 border border-[#f1ebe6] text-[11px] font-black uppercase tracking-widest rounded-2xl pl-32 pr-12 py-4 cursor-pointer focus:ring-4 focus:ring-orange-500/5 transition-all outline-none appearance-none hover:bg-white"
                         >
                            <option value={1} className="hidden">Select Divisional Chart</option>
                            {Object.entries(VARGA_INFO).map(([val, info]) => (
                              <option key={val} value={val}>D{val} - {info.name} ({info.significance})</option>
                            ))}
                         </select>
                         <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                         </div>
                      </div>
                   </div>

                   {/* Varga Context Information */}
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#f97316]">
                        <InformationCircleIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#2d2621] uppercase tracking-widest">{VARGA_INFO[selectedVarga].name} Focus</h4>
                        <p className="text-xs font-bold text-[#8c7e74] mt-1 leading-relaxed">Currently analyzing the "{VARGA_INFO[selectedVarga].significance}" layer of the natal destiny. Divisional charts refine the resolution of specific life areas.</p>
                      </div>
                   </div>
                </div>

                <div ref={chartRef} className="space-y-12 bg-white p-10 rounded-[48px] border border-[#f1ebe6] shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <NorthIndianChart chart={activeChart} title={`${VARGA_INFO[selectedVarga].name} (D${selectedVarga})`} />
                    
                    <div className="space-y-8">
                      <div className="flex items-center justify-between mb-2 px-2">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#2d2621] flex items-center gap-2">
                           <BoltIcon className="w-5 h-5 text-orange-400" /> High-Fidelity Planetary Details
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-[#8c7e74] uppercase tracking-tighter">Live Calculation</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6 overflow-y-auto max-h-[900px] pr-4 custom-scrollbar">
                        {activeChart.points.map((p) => {
                          const isVargottama = getVargottamaStatus(p);
                          const hasGandanta = isGandanta(p);

                          return (
                            <div key={p.planet} className={`p-7 rounded-[32px] border transition-all duration-300 flex items-start gap-8 group relative overflow-hidden shadow-sm ${isVargottama ? 'bg-orange-50/40 border-orange-200' : 'bg-white border-[#f1ebe6] hover:border-orange-300 hover:shadow-lg'}`}>
                               {isVargottama && (
                                 <div className="absolute top-0 right-0 px-3 py-1 bg-[#f97316] text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg z-10 flex items-center gap-1.5">
                                   <StarIcon className="w-3 h-3 fill-white" /> Vargottama
                                 </div>
                               )}
                               
                               <div className="w-24 h-24 rounded-[30px] bg-slate-50 border border-[#f1ebe6] flex flex-col items-center justify-center group-hover:bg-[#f97316] group-hover:text-white group-hover:border-transparent transition-all flex-shrink-0 shadow-inner">
                                  <span className="text-2xl font-black leading-none mb-1">{p.planet.substring(0, 2)}</span>
                                  <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">H{p.house}</span>
                               </div>
                               
                               <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-10">
                                  {/* Pillar 1: Sign & Degree */}
                                  <div>
                                     <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <ScaleIcon className="w-3.5 h-3.5" /> Placement
                                     </p>
                                     <p className="text-[14px] font-black text-[#2d2621] flex items-center gap-2">
                                        <span className="text-xl leading-none text-[#f97316]">{SIGN_SYMBOLS[p.sign]}</span> {SIGN_NAMES[p.sign]}
                                     </p>
                                     <p className="text-[11px] font-bold text-[#2d2621] mt-1 font-mono tracking-tight">{formatDMS(p.degree)}</p>
                                  </div>

                                  {/* Pillar 2: Nakshatra (User Requested Enhancement) */}
                                  <div className="sm:col-span-2">
                                     <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <SparklesIcon className="w-3.5 h-3.5" /> Nakshatra & Ruling Planet
                                     </p>
                                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                       <div>
                                          <p className="text-[15px] font-black text-[#2d2621]">{p.nakshatra}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-[#f97316]">{formatNakDegree(p.nakshatraDegree || 0)}</span>
                                            <span className="text-[8px] font-bold text-[#8c7e74] uppercase">/ 13°20' Arc</span>
                                          </div>
                                       </div>
                                       <div className="px-3 py-1.5 bg-slate-50/80 border border-slate-100 rounded-xl flex items-center gap-3">
                                          <div className="text-right">
                                             <p className="text-[7px] font-black text-[#8c7e74] uppercase tracking-tighter">Ruling Lord</p>
                                             <p className="text-[11px] font-black text-[#f97316]">{p.nakshatraLord}</p>
                                          </div>
                                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[9px] font-black text-[#2d2621] uppercase">
                                             {p.nakshatraLord?.substring(0, 2)}
                                          </div>
                                       </div>
                                     </div>
                                  </div>

                                  {/* Pillar 3: Status & Retrograde */}
                                  <div className="flex flex-col justify-end">
                                     <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest mb-2">Cosmic State</p>
                                     <div className="flex flex-wrap gap-2">
                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm border ${
                                          p.dignity === 'Exalted' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                          p.dignity === 'Debilitated' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                          p.dignity === 'Own Sign' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                          'bg-white border-slate-200 text-slate-500'
                                        }`}>
                                          {p.dignity}
                                        </span>
                                        {p.isRetrograde && (
                                          <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 uppercase shadow-sm flex items-center gap-1">
                                             <ClockIcon className="w-3 h-3" /> Vakra
                                          </span>
                                        )}
                                     </div>
                                  </div>

                                  {/* Pillar 4: Visual Journey (User Requested Enhancement) */}
                                  <div className="sm:col-span-2 flex flex-col justify-end">
                                     <div className="flex justify-between items-center mb-2">
                                        <p className="text-[9px] font-black text-[#8c7e74] uppercase tracking-widest flex items-center gap-1.5">
                                           <LifebuoyIcon className="w-3 h-3" /> Nakshatra Journey <span className="text-[8px] font-black px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-md">Pada {p.pada}</span>
                                        </p>
                                        <span className="text-[10px] font-black text-[#2d2621]">{Math.round(((p.nakshatraDegree || 0) / 13.33) * 100)}%</span>
                                     </div>
                                     <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                        <div 
                                          className={`h-full transition-all duration-1000 ease-out z-10 ${
                                            p.dignity === 'Exalted' ? 'bg-emerald-500' : 
                                            p.dignity === 'Debilitated' ? 'bg-rose-500' : 'bg-[#f97316]'
                                          }`} 
                                          style={{ width: `${((p.nakshatraDegree || 0) / 13.33) * 100}%` }} 
                                        />
                                        <div className="absolute inset-0 flex justify-between pointer-events-none z-0">
                                          <div className="w-px h-full bg-slate-200/50 ml-[25%]" />
                                          <div className="w-px h-full bg-slate-200/50 ml-[25%]" />
                                          <div className="w-px h-full bg-slate-200/50 ml-[25%]" />
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'yogas' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="card-modern p-8 bg-gradient-to-br from-white to-orange-50 text-[#2d2621] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 overflow-hidden relative border border-orange-100 shadow-sm">
                  <div className="relative z-10 flex items-center gap-5">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-3xl flex items-center justify-center border border-orange-500/20 shadow-xl shadow-orange-500/5">
                      <SparklesIcon className="w-10 h-10 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">{yogas.length} Cosmic Alignments (Yogas)</h3>
                      <p className="text-[#f97316] text-sm font-bold uppercase tracking-widest mt-1">Advanced Vedic Detection Engine</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                  {yogas.map((y, i) => (
                    <div key={i} className="card-modern flex flex-col group overflow-hidden hover:border-[#f97316] transition-all bg-white relative p-7">
                       <div className="flex justify-between items-start mb-6">
                          <h4 className="text-xl font-black text-[#2d2621] leading-tight group-hover:text-[#f97316] transition-colors">{y.name}</h4>
                          <span className="text-[10px] font-black px-3 py-1.5 bg-orange-50 text-[#f97316] rounded-xl uppercase tracking-widest border border-orange-100">{y.category}</span>
                       </div>
                       <p className="text-xs text-[#8c7e74] font-bold mb-6 italic leading-relaxed">"{y.description}"</p>
                       <p className="text-sm text-[#2d2621] font-semibold leading-relaxed mb-6">{y.interpretation}</p>
                       <div className="mt-auto pt-6 border-t border-[#f1ebe6] flex items-center justify-between">
                          <span className="text-[10px] font-black text-[#8c7e74] uppercase">Potency</span>
                          <span className="text-[10px] font-black text-[#f97316] uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-lg flex items-center gap-1">{y.strength}% Strength</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'dashas' && (
              <div className="animate-in fade-in duration-500">
                <DashaTree nodes={dashas} />
              </div>
            )}

            {activeTab === 'ashtakavarga' && avData && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <AshtakavargaChart sav={avData.sav} title="Sarvashtakavarga (SAV) Matrix" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;