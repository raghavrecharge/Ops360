import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthView from './components/AuthView';
import ProfileSelector from './components/ProfileSelector';
import { astrologyApi, AshtakavargaData as ApiAshtakavargaData, VarshaphalaData as ApiVarshaphalaData } from './services/astrologyApi';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChartBarIcon, 
  CalendarDaysIcon, 
  ChatBubbleBottomCenterTextIcon, 
  SparklesIcon, 
  UserCircleIcon, 
  Squares2X2Icon, 
  ClockIcon, 
  TableCellsIcon, 
  ScaleIcon, 
  HeartIcon, 
  BookOpenIcon, 
  CheckBadgeIcon, 
  InformationCircleIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  CursorArrowRaysIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  SunIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  PlusCircleIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

import { BirthData, DivisionalChart, DashaNode, UserProfile, YogaMatch, ChatMessage, Sign, Planet, TransitContext, PlannerData, ShadbalaData, CompatibilityData, Remedy, KBChunk, ServiceStatus } from './types.ts';
import { astrologyService, VarshaphalaData, AshtakavargaData } from './services/astrologyService.ts';
import { geminiService } from './services/geminiService.ts';
import NorthIndianChart from './components/NorthIndianChart.tsx';
import SouthIndianChart from './components/SouthIndianChart.tsx';
import DashaTree from './components/DashaTree.tsx';
import Align27Dashboard from './components/Align27Dashboard.tsx';
import TodayView from './components/TodayView.tsx';
import PlannerView from './components/PlannerView.tsx';
import StrengthView from './components/StrengthView.tsx';
import CompatibilityView from './components/CompatibilityView.tsx';
import RemediesView from './components/RemediesView.tsx';
import KnowledgeView from './components/KnowledgeView.tsx';
import AshtakavargaView from './components/AshtakavargaView.tsx';
import VarshaphalaView from './components/VarshaphalaView.tsx';
import ChatView from './components/ChatView.tsx';
import PanchangView from './components/PanchangView.tsx';
import PlanetDetailsTable from './components/PlanetDetailsTable.tsx';
import BirthDataForm from './components/BirthDataForm.tsx';
import { SIGN_NAMES } from './constants.tsx';

const VARGA_LIST = [
  { value: 1, label: 'D1 Lagna Detail' },
  { value: 2, label: 'D2 Hora Wealth' },
  { value: 3, label: 'D3 Drekkana Siblings' },
  { value: 4, label: 'D4 Chaturthamsa Property' },
  { value: 7, label: 'D7 Saptamsha Children' },
  { value: 9, label: 'D9 Navamsha Overview' },
  { value: 10, label: 'D10 Dashamsha Career' },
  { value: 12, label: 'D12 Dwadashamsha Parents' },
  { value: 16, label: 'D16 Shodashamsha Comforts' },
  { value: 20, label: 'D20 Vimsamsha Spirituality' },
  { value: 24, label: 'D24 Chaturvimsamsha Knowledge' },
  { value: 30, label: 'D30 Trimshamsha Challenges' },
  { value: 60, label: 'D60 Shashtiamsha Past Life' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
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
  const [zoomScale, setZoomScale] = useState(1);
  const [chartStyle, setChartStyle] = useState<'North' | 'South'>('North');
  const [showInputForm, setShowInputForm] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Partner Input State for Compatibility UI
  const [partnerFormData, setPartnerFormData] = useState<BirthData>({
    name: '',
    dob: '',
    tob: '',
    lat: 28.6139,
    lng: 77.2090,
    tz: 'Asia/Kolkata'
  });
  
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    astrologyEngine: 'Initializing',
    aiInterpretation: 'Initializing',
    dataIntegrity: 'Unverified'
  });

  const [varshaYear, setVarshaYear] = useState<number>(new Date().getFullYear());
  const [varshaData, setVarshaData] = useState<VarshaphalaData | null>(null);

  const moonChart = useMemo(() => {
    if (!chart) return null;
    const moonPoint = chart.points.find(p => p.planet === Planet.Moon);
    if (!moonPoint) return chart;
    const moonSign = moonPoint.sign;
    const points = chart.points.map(p => {
      const newHouse = ((p.sign - moonSign + 12) % 12) + 1;
      return { ...p, house: newHouse };
    });
    return { varga: 'Moon Chart', points };
  }, [chart]);

  const navamshaChart = useMemo(() => {
    if (!chart) return null;
    return astrologyService.calculateVarga(chart, 9);
  }, [chart]);

  const activeChart = useMemo(() => {
    if (!chart) return null;
    return selectedVarga === 1 ? chart : astrologyService.calculateVarga(chart, selectedVarga);
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

  useEffect(() => {
    if (profile) {
      setVarshaData(astrologyService.calculateVarshaphala(profile.birthData, varshaYear));
    }
  }, [profile, varshaYear]);

  const handleSendMessage = async (content: string) => {
    if (!astroContext) return;
    const userMsg: ChatMessage = { role: 'user', content };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setIsChatLoading(true);
    setGlobalError(null);

    try {
      const response = await geminiService.chat(newHistory, astroContext);
      setChatHistory([...newHistory, response]);
      setServiceStatus(prev => ({ ...prev, aiInterpretation: 'Operational' }));
    } catch (error: any) {
      console.error("Chat Error:", error);
      if (error.message === "GEMINI_QUOTA_EXHAUSTED") {
        setGlobalError("AI quota reached. Please check your billing or try again in a few minutes.");
      } else if (error.message === "API_KEY_NOT_FOUND") {
        if (window.aistudio?.openSelectKey) {
          await window.aistudio.openSelectKey();
        }
      } else {
        setGlobalError("The cosmic transmission was interrupted. Please try again.");
      }
      setServiceStatus(prev => ({ ...prev, aiInterpretation: 'Error' }));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCalculate = (birthData: BirthData) => {
    setIsLoading(true);
    setGlobalError(null);
    setServiceStatus(prev => ({ ...prev, astrologyEngine: 'Initializing' }));

    const newUserProfile: UserProfile = {
      id: `user-${Date.now()}`,
      birthData,
      preferences: { ayanamsa: 'Lahiri', chartStyle: 'North' },
      isVerified: true
    };

    setProfile(newUserProfile);
    setShowInputForm(false);
    
    try {
      const d1 = astrologyService.calculateNatalChart(birthData);
      setChart(d1);
      setDashas(astrologyService.getVimshottariDashas(birthData, 5));
      setVarshaData(astrologyService.calculateVarshaphala(birthData, varshaYear));
      setAvData(astrologyService.calculateAshtakavarga(d1));
      setTodayData(astrologyService.getTodayData(birthData));
      setPlannerData(astrologyService.getPlannerData(birthData));
      const sbData = astrologyService.calculateShadbala(birthData);
      setShadbalaData(sbData);
      setRemediesData(astrologyService.generateRemedies(sbData, d1));
      setKbData(astrologyService.getKnowledgeBase());
      setYogas(astrologyService.detectYogas(d1));
      
      setServiceStatus(prev => ({ 
        ...prev, 
        astrologyEngine: 'Operational',
        dataIntegrity: 'Verified'
      }));

      geminiService.findYogas(d1).then(aiYogas => {
        if (aiYogas && aiYogas.length > 0) {
          setYogas(prev => [...prev, ...aiYogas]);
        }
        setServiceStatus(prev => ({ ...prev, aiInterpretation: 'Operational' }));
      }).catch(() => {
        setServiceStatus(prev => ({ ...prev, aiInterpretation: 'Rate Limited' }));
      });

    } catch (e) {
      console.error("Calculation Error:", e);
      setServiceStatus(prev => ({ ...prev, astrologyEngine: 'Error' }));
      setGlobalError("Astrological engine failed. Please verify coordinates.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateCompatibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsLoading(true);
    setTimeout(() => {
      try {
        const results = astrologyService.calculateCompatibility(profile.birthData, partnerFormData);
        setCompatibilityData(results);
      } catch (e) {
        setGlobalError("Compatibility calculation failed.");
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const navModules = [
    { section: 'CORE', items: [
      { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon },
      { id: 'panchang', label: 'Panchang', icon: SunIcon },
      { id: 'today', label: 'Today', icon: ClockIcon },
      { id: 'planner', label: 'Planner', icon: CalendarDaysIcon }
    ]},
    { section: 'ASTROLOGY', items: [
      { id: 'charts', label: 'Charts', icon: ChartBarIcon },
      { id: 'dashas', label: 'Dashas', icon: CalendarDaysIcon },
      { id: 'ashtakavarga', label: 'Ashtakavarga', icon: TableCellsIcon }
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

  const handleMobileTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMoreOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#fdfcfb] text-[#2d2621]">
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#f97316]/20 border-t-[#f97316] rounded-full animate-spin mb-4" />
          <p className="text-sm font-black text-[#2d2621] uppercase tracking-widest">Calculating Planetary Matrix</p>
        </div>
      )}

      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]'} bg-white border-r border-[#f1ebe6] flex-col overflow-hidden transition-all duration-300 ease-in-out relative group`}>
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 bg-[#f97316] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0 transition-transform hover:rotate-6 pulse-effect">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <h1 className="text-lg font-bold text-[#2d2621] tracking-tight whitespace-nowrap overflow-hidden">
              Astro<span className="text-[#f97316]"> Jyotish</span>
            </h1>
          )}
        </div>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute top-[24px] -right-3 w-6 h-6 bg-white border border-[#f1ebe6] rounded-full flex items-center justify-center text-[#f97316] shadow-sm hover:bg-[#f97316] hover:text-white transition-all z-20">
          {isSidebarCollapsed ? <ChevronDoubleRightIcon className="w-3.5 h-3.5" /> : <ChevronDoubleLeftIcon className="w-3.5 h-3.5" />}
        </button>
        <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navModules.map((group) => (group.items.length > 0 && (
            <div key={group.section} className="space-y-1">
              {!isSidebarCollapsed && <p className="text-[9px] font-black text-[#8c7e74] mb-2 px-4 tracking-[0.2em] uppercase">{group.section}</p>}
              {group.items.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center transition-all duration-300 relative group/nav interactive-element active:scale-95 ${activeTab === item.id ? 'sidebar-active text-white' : 'text-[#2d2621] hover:bg-[#fff7ed] hover:text-[#f97316]'} ${isSidebarCollapsed ? 'justify-center py-3.5 px-0 rounded-xl' : 'gap-3 px-4 py-3 rounded-xl'}`}>
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-white' : ''}`} />
                  {!isSidebarCollapsed && <span className="text-sm font-semibold whitespace-nowrap overflow-hidden">{item.label}</span>}
                </button>
              ))}
            </div>
          )))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 pb-20 lg:pb-0">
        <header className="h-14 lg:h-16 bg-white border-b border-[#f1ebe6] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
             <div className="lg:hidden w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-90 transition-transform">
               <SparklesIcon className="w-5 h-5 text-white" />
             </div>
             <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                <h2 className="text-sm lg:text-base font-black lg:font-bold text-slate-700 capitalize tracking-tight leading-none lg:leading-normal">
                   {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
                </h2>
                <div className="hidden lg:flex items-center gap-2 text-[#8c7e74]">
                   <span className="w-1 h-1 rounded-full bg-[#f1ebe6]" />
                   <ClockIcon className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Live Sync</span>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowInputForm(!showInputForm)} 
              className="p-2 text-[#8c7e74] hover:text-[#f97316] transition-colors"
              title="New Chart"
            >
              <PlusCircleIcon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 bg-[#fcf8f5] lg:border lg:border-[#f1ebe6] rounded-lg px-2 lg:px-3 lg:py-1.5 interactive-element hover:bg-white active:scale-95 cursor-pointer">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-white border border-[#f1ebe6] flex items-center justify-center text-orange-500 shadow-sm">
                  <UserCircleIcon className="w-4 h-4" />
                </div>
                {profile?.isVerified && <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white shadow-sm"><CheckBadgeIcon className="w-2 h-2" /></div>}
              </div>
              <div className="hidden sm:block"><p className="text-[9px] font-black text-[#2d2621] uppercase">{profile?.birthData.name || 'Seeker'}</p></div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar bg-[#fdfcfb]">
          <div className="max-w-[1500px] mx-auto">
            {globalError && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                  <ExclamationCircleIcon className="w-6 h-6 text-rose-500" />
                  <p className="text-xs font-black text-rose-600 uppercase tracking-widest">{globalError}</p>
                </div>
                <button onClick={() => setGlobalError(null)} className="p-1 hover:bg-rose-100 rounded-full text-rose-500 transition-colors">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            {showInputForm && (
              <div className="mb-10">
                <BirthDataForm onCalculate={handleCalculate} initialData={profile?.birthData} />
              </div>
            )}

            {!profile && !showInputForm && (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center text-orange-500 shadow-inner">
                  <SparklesIcon className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-slate-800 tracking-tight">The Stars Await</h1>
                  <p className="text-lg font-medium text-slate-400 max-w-md mx-auto">Enter your birth details to generate your comprehensive Vedic analysis.</p>
                </div>
                <button 
                  onClick={() => setShowInputForm(true)}
                  className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Start Analysis
                </button>
              </div>
            )}

            {profile && (
              <>
                {activeTab === 'dashboard' && <Align27Dashboard data={todayData} />}
                {activeTab === 'panchang' && todayData && <PanchangView data={todayData.panchang} />}
                {activeTab === 'today' && todayData && <TodayView data={todayData} />}
                {activeTab === 'planner' && plannerData && <PlannerView data={plannerData} />}
                {activeTab === 'charts' && chart && activeChart && moonChart && navamshaChart && (
                  <div className="space-y-10 lg:space-y-16 pb-20 animate-in fade-in duration-700">
                    {/* 1. PRIMARY EXPLORER TOOLBAR */}
                    <div className="bg-white rounded-3xl p-6 border border-[#f1ebe6] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="flex items-center gap-6 w-full lg:w-auto">
                          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shadow-inner interactive-element">
                            <ChartBarIcon className="w-7 h-7 text-orange-500" />
                          </div>
                          <div>
                            <h2 className="text-xl lg:text-3xl font-black text-slate-700 tracking-tight">Varga Explorer</h2>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#8c7e74] uppercase tracking-widest">Celestial Decomposition Matrix</span>
                          </div>
                       </div>
                       <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
                          <div className="flex items-center gap-2 bg-[#fcf8f5] border border-[#f1ebe6] p-1.5 rounded-xl">
                            <button onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.1))} className="p-2.5 hover:bg-white rounded-lg text-[#8c7e74] hover:text-orange-500 transition-colors active:scale-90"><MagnifyingGlassMinusIcon className="w-4 h-4" /></button>
                            <div className="px-4 py-1.5 bg-white rounded-lg shadow-sm border border-orange-100 min-w-[60px] text-center"><span className="text-xs font-black text-slate-700">{Math.round(zoomScale * 100)}%</span></div>
                            <button onClick={() => setZoomScale(Math.min(2, zoomScale + 0.1))} className="p-2.5 hover:bg-white rounded-lg text-[#8c7e74] hover:text-orange-500 transition-colors active:scale-90"><MagnifyingGlassPlusIcon className="w-4 h-4" /></button>
                          </div>
                          <div className="relative w-full lg:min-w-[280px]">
                             <select value={selectedVarga} onChange={(e) => setSelectedVarga(parseInt(e.target.value))} className="w-full bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl px-4 py-4 text-sm font-bold text-slate-700 appearance-none cursor-pointer hover:bg-white transition-colors outline-none focus:ring-2 focus:ring-orange-500/20">
                                {VARGA_LIST.map(v => (<option key={v.value} value={v.value}>{v.label}</option>))}
                             </select>
                             <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500 pointer-events-none" />
                          </div>
                          <div className="flex items-center gap-2 w-full lg:w-auto">
                            <button onClick={() => setChartStyle(chartStyle === 'North' ? 'South' : 'North')} className="px-5 py-4 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#8c7e74] hover:bg-white hover:text-orange-500 transition-all">{chartStyle} Style</button>
                            <button onClick={() => { setSelectedVarga(1); setZoomScale(1); }} className="p-4 bg-[#f97316] text-white rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"><ArrowPathIcon className="w-6 h-6" /></button>
                          </div>
                       </div>
                    </div>

                    {/* 2. CHART MATRIX: ALL 3 CHARTS IN ONE ROW (Big Active, 2 Small Aux) */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 lg:gap-10 items-stretch">
                       {/* MAIN ACTIVE VARGA (Large: 2/4 columns) */}
                       <div className="xl:col-span-2">
                          <div className="bg-white p-3 rounded-[40px] border border-orange-100 shadow-xl relative overflow-hidden group h-full flex flex-col">
                             <div className="bg-[#fffaf5] rounded-[32px] p-6 lg:p-12 flex-1 flex flex-col items-center justify-center relative">
                                <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
                                   <div className="w-1.5 h-10 bg-orange-500 rounded-full" />
                                   <div>
                                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-0.5">Primary Active Varga</span>
                                      <h3 className="text-xl font-black text-slate-800 tracking-tight">{VARGA_LIST.find(v => v.value === selectedVarga)?.label}</h3>
                                   </div>
                                </div>
                                <div className="mt-16 w-full">
                                   {chartStyle === 'North' ? (<NorthIndianChart chart={activeChart} scale={zoomScale} showLegend={true} />) : (<SouthIndianChart chart={activeChart} scale={zoomScale} showLegend={true} />)}
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* MOON CHART (Small: 1/4 columns) */}
                       <div className="xl:col-span-1">
                          <div className="bg-white p-3 rounded-[40px] border border-indigo-100 shadow-md flex flex-col h-full group">
                             <div className="bg-[#fcfbff] rounded-[32px] p-6 lg:p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
                                   <MoonIcon className="w-5 h-5 text-indigo-500" />
                                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Moon Chart</span>
                                </div>
                                <div className="mt-8 w-full scale-90">
                                   {chartStyle === 'North' ? (<NorthIndianChart chart={moonChart} scale={0.75} showLegend={false} />) : (<SouthIndianChart chart={moonChart} scale={0.75} showLegend={false} />)}
                                </div>
                                <div className="mt-6 w-full pt-4 border-t border-indigo-100 text-center">
                                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Mental Framework Matrix</p>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* NAVAMSHA CHART (Small: 1/4 columns) */}
                       <div className="xl:col-span-1">
                          <div className="bg-white p-3 rounded-[40px] border border-emerald-100 shadow-md flex flex-col h-full group">
                             <div className="bg-[#fafffb] rounded-[32px] p-6 lg:p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                                <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
                                   <SparklesIcon className="w-5 h-5 text-emerald-500" />
                                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Navamsha (D9)</span>
                                </div>
                                <div className="mt-8 w-full scale-90">
                                   {chartStyle === 'North' ? (<NorthIndianChart chart={navamshaChart} scale={0.75} showLegend={false} />) : (<SouthIndianChart chart={navamshaChart} scale={0.75} showLegend={false} />)}
                                </div>
                                <div className="mt-6 w-full pt-4 border-t border-emerald-100 text-center">
                                   <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Soul Destiny Baseline</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* 4. DATA TABLES */}
                    <div className="w-full">
                       <PlanetDetailsTable chart={activeChart} />
                    </div>
                  </div>
                )}
                {activeTab === 'dashas' && <DashaTree nodes={dashas} />}
                {activeTab === 'varshaphala' && varshaData && <VarshaphalaView data={varshaData} onYearChange={setVarshaYear} chartStyle={chartStyle} />}
                {activeTab === 'ashtakavarga' && avData && <AshtakavargaView data={avData} />}
                {activeTab === 'strength' && shadbalaData.length > 0 && <StrengthView data={shadbalaData} />}
                {activeTab === 'compatibility' && (
                  <div className="animate-in fade-in duration-700">
                    {compatibilityData ? (
                      <CompatibilityView data={compatibilityData} onReset={() => setCompatibilityData(null)} />
                    ) : (
                      <div className="max-w-4xl mx-auto space-y-12">
                         <div className="bg-white rounded-[40px] border border-[#f1ebe6] p-10 lg:p-12 shadow-sm text-center space-y-6">
                            <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 mx-auto shadow-inner">
                               <HeartIcon className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                               <h2 className="text-3xl font-black text-slate-800 tracking-tight">Sync Souls</h2>
                               <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Check Ashta Koota compatibility between two charts</p>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Partner 1 (Static from Profile) */}
                            <div className="bg-indigo-50 border border-indigo-100 rounded-[40px] p-10 flex flex-col items-center justify-center space-y-8 text-center relative overflow-hidden group">
                               <div className="w-24 h-24 bg-white rounded-full border-4 border-indigo-200 flex items-center justify-center text-indigo-500 shadow-xl group-hover:scale-110 transition-transform z-10">
                                  <UserIcon className="w-12 h-12" />
                                </div>
                                <div className="z-10">
                                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Seeker One (You)</p>
                                   <h3 className="text-2xl font-black text-indigo-900">{profile.birthData.name}</h3>
                                   <p className="text-sm font-bold text-indigo-600 mt-2">{new Date(profile.birthData.dob).toLocaleDateString()}</p>
                                </div>
                                <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none">
                                   <SparklesIcon className="w-48 h-48 text-indigo-900" />
                                </div>
                            </div>

                            {/* Partner 2 (Input Form) */}
                            <div className="bg-white border border-[#f1ebe6] rounded-[40px] p-10 shadow-sm space-y-8 relative overflow-hidden group">
                               <div className="flex items-center gap-4 mb-2">
                                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                                     <PlusCircleIcon className="w-7 h-7" />
                                  </div>
                                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Partner Details</h3>
                               </div>

                               <form onSubmit={handleCalculateCompatibility} className="space-y-6">
                                  <div className="space-y-2">
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                     <input 
                                        type="text" 
                                        required
                                        placeholder="Enter Name"
                                        value={partnerFormData.name}
                                        onChange={e => setPartnerFormData({...partnerFormData, name: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all"
                                     />
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DOB</label>
                                        <input 
                                           type="date" 
                                           required
                                           value={partnerFormData.dob}
                                           onChange={e => setPartnerFormData({...partnerFormData, dob: e.target.value})}
                                           className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all"
                                        />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TOB</label>
                                        <input 
                                           type="time" 
                                           required
                                           value={partnerFormData.tob}
                                           onChange={e => setPartnerFormData({...partnerFormData, tob: e.target.value})}
                                           className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all"
                                        />
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lat</label>
                                        <input 
                                           type="number" 
                                           step="any"
                                           value={partnerFormData.lat}
                                           onChange={e => setPartnerFormData({...partnerFormData, lat: parseFloat(e.target.value)})}
                                           className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all"
                                        />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lng</label>
                                        <input 
                                           type="number" 
                                           step="any"
                                           value={partnerFormData.lng}
                                           onChange={e => setPartnerFormData({...partnerFormData, lng: parseFloat(e.target.value)})}
                                           className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all"
                                        />
                                     </div>
                                  </div>

                                  <button 
                                     type="submit"
                                     className="w-full py-5 bg-rose-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-rose-600"
                                  >
                                     <HeartIcon className="w-5 h-5" /> Calculate Compatibility
                                  </button>
                               </form>
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'remedies' && remediesData.length > 0 && <RemediesView data={remediesData} />}
                {activeTab === 'knowledge' && kbData.length > 0 && <KnowledgeView data={kbData} />}
                {activeTab === 'chat' && <ChatView messages={chatHistory} onSendMessage={handleSendMessage} isLoading={isChatLoading} />}
              </>
            )}
          </div>
        </div>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-[#f1ebe6] flex items-center justify-around px-2 z-50">
           <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all active:scale-75 ${activeTab === 'dashboard' ? 'text-[#f97316]' : 'text-[#8c7e74]'}`}><HomeIcon className="w-7 h-7" /><span className="text-[10px] font-black uppercase mt-1">Home</span></button>
           <button onClick={() => setActiveTab('charts')} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all active:scale-75 ${activeTab === 'charts' ? 'text-[#f97316]' : 'text-[#8c7e74]'}`}><GlobeAltIcon className="w-7 h-7" /><span className="text-[10px] font-black uppercase mt-1">Explore</span></button>
           <button onClick={() => setActiveTab('compatibility')} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all active:scale-75 ${activeTab === 'compatibility' ? 'text-[#f97316]' : 'text-[#8c7e74]'}`}><HeartIcon className="w-7 h-7" /><span className="text-[10px] font-black uppercase mt-1">Sync</span></button>
           <button onClick={() => setIsMobileMoreOpen(true)} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all active:scale-75 ${isMobileMoreOpen ? 'text-[#f97316]' : 'text-[#8c7e74]'}`}><Squares2X2Icon className="w-7 h-7" /><span className="text-[10px] font-black uppercase mt-1">More</span></button>
        </nav>

        {isMobileMoreOpen && (
          <div className="fixed inset-0 z-[100] bg-white lg:hidden animate-in fade-in slide-in-from-bottom-10 duration-300 overflow-y-auto">
             <div className="sticky top-0 bg-white px-6 py-8 flex items-center justify-between border-b border-[#f1ebe6] z-10">
                <h2 className="text-2xl font-black text-[#2d2621]">Cosmic Hub</h2>
                <button onClick={() => setIsMobileMoreOpen(false)} className="p-3 bg-slate-50 rounded-full text-[#8c7e74] active:scale-90 transition-transform"><XMarkIcon className="w-6 h-6" /></button>
             </div>
             <div className="p-6 space-y-10 pb-24">
                {navModules.map((group) => (
                  <div key={group.section} className="space-y-4">
                     <p className="text-[10px] font-black text-[#8c7e74] uppercase tracking-widest pl-2">{group.section}</p>
                     <div className="grid grid-cols-2 gap-4">
                        {group.items.map((item) => (
                          <button key={item.id} onClick={() => handleMobileTab(item.id)} className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all active:scale-95 ${activeTab === item.id ? 'bg-orange-50 border-orange-500/30 text-orange-600' : 'bg-slate-50 border-transparent text-[#2d2621]'}`}>
                             <item.icon className="w-7 h-7 mb-3" />
                             <span className="text-sm font-black uppercase tracking-tight">{item.label}</span>
                          </button>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Profile Update */}
      <button 
        onClick={() => setProfile(null)}
        className="fixed bottom-10 right-10 w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-2xl flex items-center justify-center text-slate-400 hover:text-orange-500 hover:scale-110 active:scale-95 transition-all z-[60]"
      >
        <UserCircleIcon className="w-9 h-9" />
      </button>
    </div>
  );
};

export default App;
