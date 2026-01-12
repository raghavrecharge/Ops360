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
  ArrowDownTrayIcon, 
  DocumentArrowDownIcon, 
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  CommandLineIcon,
  BoltIcon,
  LifebuoyIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { astrologyApi } from './services/astrologyApi';
import { DivisionalChart, DashaNode, YogaMatch, ChatMessage, Sign, Planet, ChartPoint, TransitContext, PlannerData, ShadbalaData, CompatibilityData, Remedy, KBChunk } from './types';
import { SIGN_NAMES, SIGN_SYMBOLS } from './constants';

// Components
import AuthView from './components/AuthView';
import ProfileSelector from './components/ProfileSelector';
import NorthIndianChart from './components/NorthIndianChart';
import DashaTree from './components/DashaTree';
import Align27Dashboard from './components/Align27Dashboard';
import TodayView from './components/TodayView';
import PlannerView from './components/PlannerView';
import StrengthView from './components/StrengthView';
import CompatibilityView from './components/CompatibilityView';
import RemediesView from './components/RemediesView';
import KnowledgeView from './components/KnowledgeView';
import AshtakavargaChart from './components/AshtakavargaChart';
import ChatView from './components/ChatView';

// Ashtakavarga Data Type
export interface AshtakavargaData {
  bav: Record<string, number[]>;
  sav: number[];
  totalPoints: number;
  planetTotals: Record<string, number>;
  summary: {
    strongestHouse: number;
    weakestHouse: number;
    averagePoints: number;
    houseInterpretations: string[];
    houseSignifications: string[];
  };
  isValid: boolean;
}

// Main App Content (authenticated)
function AppContent() {
  const { user, selectedProfile, logout, profiles } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  // Load data when profile changes
  useEffect(() => {
    if (selectedProfile?.id) {
      loadProfileData(selectedProfile.id);
    }
  }, [selectedProfile?.id]);

  const loadProfileData = async (profileId: number) => {
    setIsLoading(true);
    setApiError(null);

    try {
      // Load chart data
      const chartBundle = await astrologyApi.getChartBundle(profileId);
      setChart(chartBundle.d1);

      // Load dashas
      const dashaData = await astrologyApi.getDashas(profileId);
      setDashas(dashaData);

      // Load yogas
      const yogaData = await astrologyApi.getYogas(profileId);
      setYogas(yogaData);

      // Load today data
      try {
        const today = await astrologyApi.getTodayData(profileId);
        setTodayData(today);
      } catch (e) {
        console.warn('Today data not available');
      }

      // Load planner data
      try {
        const planner = await astrologyApi.getPlannerData(profileId);
        setPlannerData(planner);
      } catch (e) {
        console.warn('Planner data not available');
      }

      // Load strength data
      try {
        const strength = await astrologyApi.getShadbala(profileId);
        setShadbalaData(strength);
      } catch (e) {
        console.warn('Strength data not available');
      }

      // Load remedies
      try {
        const remedies = await astrologyApi.getRemedies(profileId);
        setRemediesData(remedies);
      } catch (e) {
        console.warn('Remedies data not available');
      }

      // Load ashtakavarga
      try {
        const av = await astrologyApi.getAshtakavarga(profileId);
        setAvData({
          bav: av.bav || {},
          sav: av.sav || [],
          totalPoints: 337,
          planetTotals: {},
          summary: {
            strongestHouse: 1,
            weakestHouse: 6,
            averagePoints: 28,
            houseInterpretations: [],
            houseSignifications: [],
          },
          isValid: true,
        });
      } catch (e) {
        console.warn('Ashtakavarga data not available');
      }

      // Load knowledge base
      try {
        const kb = await astrologyApi.searchKnowledge('vedic astrology');
        setKbData(kb);
      } catch (e) {
        console.warn('Knowledge base not available');
      }

    } catch (error: any) {
      console.error('Failed to load profile data:', error);
      setApiError(error.message || 'Failed to load data from server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedProfile) return;
    
    const userMsg: ChatMessage = { role: 'user', content };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setIsChatLoading(true);

    try {
      const response = await astrologyApi.sendChatMessage(selectedProfile.id, content, newHistory);
      setChatHistory([...newHistory, response]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory([...newHistory, { role: 'assistant', content: "Sorry, I couldn't process your request. Please try again." }]);
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
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
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
      { id: 'compatibility', label: 'Compatibility', icon: HeartIcon },
      { id: 'remedies', label: 'Remedies', icon: SparklesIcon }
    ]},
    { section: 'INTELLIGENCE', items: [
      { id: 'knowledge', label: 'Knowledge', icon: BookOpenIcon },
      { id: 'chat', label: 'Chat', icon: ChatBubbleBottomCenterTextIcon }
    ]}
  ];

  // Profile selector modal
  if (showProfileSelector) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <ProfileSelector onClose={() => setShowProfileSelector(false)} />
      </div>
    );
  }

  // No profile selected
  if (!selectedProfile) {
    return (
      <div className="min-h-screen bg-[#fcf8f5] flex items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="w-16 h-16 text-[#f97316] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2d2621] mb-4">Welcome, {user?.full_name || user?.email}!</h2>
          <p className="text-[#8c7e74] mb-6">Please create or select a profile to continue.</p>
          <button
            onClick={() => setShowProfileSelector(true)}
            className="px-8 py-4 bg-[#f97316] text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all"
          >
            Select Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fcf8f5] text-[#2d2621]">
      {(isLoading) && (
        <div className="fixed inset-0 z-[9999] bg-[#2d2621]/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-lg font-bold">Loading Cosmic Data...</p>
        </div>
      )}

      {/* Sidebar */}
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
                  data-testid={`nav-${item.id}`}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-[#f97316] text-white shadow-lg shadow-orange-500/20' 
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

        {/* User Section */}
        <div className="p-4 border-t border-[#f1ebe6]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#8c7e74] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-[#f1ebe6] px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#2d2621] capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowProfileSelector(true)}
              className="flex items-center gap-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl px-4 py-2 hover:border-[#f97316] transition-all"
              data-testid="profile-selector-btn"
            >
              <UserCircleIcon className="w-5 h-5 text-[#f97316]" />
              <div className="text-left">
                <p className="text-[11px] font-bold text-[#2d2621]">{selectedProfile.name}</p>
                <p className="text-[9px] text-[#8c7e74]">{selectedProfile.birth_place}</p>
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
              <p className="font-bold">Error loading data</p>
              <p className="text-sm">{apiError}</p>
              <button
                onClick={() => selectedProfile && loadProfileData(selectedProfile.id)}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'today' && todayData && <TodayView data={todayData} />}
            {activeTab === 'planner' && plannerData && <PlannerView data={plannerData} />}
            {activeTab === 'strength' && shadbalaData.length > 0 && <StrengthView data={shadbalaData} />}
            {activeTab === 'compatibility' && (
              <div className="text-center py-12">
                <HeartIcon className="w-16 h-16 text-[#f97316] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#2d2621] mb-2">Compatibility Analysis</h3>
                <p className="text-[#8c7e74]">Select two profiles to compare compatibility.</p>
              </div>
            )}
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
                     onClick={() => exportToPDF(dashboardRef, "Natal Chart (D1) Analysis", `${selectedProfile?.name}_Natal_Report.pdf`)}
                     className="px-6 py-3 bg-[#f97316] text-white text-xs font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-[#fbbf24] transition-all flex items-center gap-2 uppercase tracking-widest"
                     data-testid="export-pdf-btn"
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
                        <div className="p-6 bg-white rounded-3xl border border-[#f1ebe6]">
                           <h4 className="text-sm font-black text-[#2d2621] uppercase mb-6 border-b pb-3 flex items-center gap-2">
                             <ScaleIcon className="w-5 h-5 text-orange-400" /> Natal Positions
                           </h4>
                           <div className="space-y-3">
                              {chart?.points.map(p => (
                                <div key={p.planet} className="flex justify-between items-center p-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl shadow-sm hover:border-[#f97316]/30 transition-all group">
                                   <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-[#2d2621]">{p.planet}</span>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest border ${
                                          p.dignity === 'Exalted' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                          p.dignity === 'Debilitated' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                          'bg-slate-50 border-slate-200 text-slate-400'
                                        }`}>
                                          {p.dignity?.substring(0, 3) || 'NEU'}
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
            
            {activeTab === 'charts' && chart && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-white p-8 rounded-[32px] border border-[#f1ebe6] shadow-sm space-y-8">
                   <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-inner">
                          <ChartBarIcon className="w-8 h-8 text-[#f97316]" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-[#2d2621] tracking-tight">Varga Explorer</h3>
                          <p className="text-xs font-bold text-[#8c7e74] uppercase tracking-widest">Select divisional perspective</p>
                        </div>
                      </div>
                      <button onClick={() => exportToPDF(chartRef, `${VARGA_INFO[selectedVarga].name} Chart Analysis`, `Chart_D${selectedVarga}.pdf`)} className="px-8 py-3.5 bg-[#f97316] text-white text-[11px] font-black rounded-2xl uppercase flex items-center gap-2 shadow-xl shadow-orange-500/20">
                        <ArrowDownTrayIcon className="w-5 h-5" /> Export Report
                      </button>
                   </div>

                   <div className="flex flex-wrap gap-2.5 pb-2 border-b border-[#f1ebe6]">
                      {[1, 9, 10].map(vNum => (
                        <button
                          key={vNum}
                          onClick={() => setSelectedVarga(vNum)}
                          className={`px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-3 ${
                            selectedVarga === vNum 
                            ? 'bg-[#f97316] border-[#f97316] text-white shadow-xl shadow-orange-500/20' 
                            : 'bg-white border-[#f1ebe6] text-[#8c7e74] hover:border-orange-200 hover:text-orange-500'
                          }`}
                        >
                          <SparklesIcon className={`w-4 h-4 ${selectedVarga === vNum ? 'text-white' : 'text-orange-400'}`} />
                          D{vNum} - {VARGA_INFO[vNum].name}
                        </button>
                      ))}
                   </div>

                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#f97316]">
                        <InformationCircleIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#2d2621] uppercase tracking-widest">{VARGA_INFO[selectedVarga].name} Focus</h4>
                        <p className="text-xs font-bold text-[#8c7e74] mt-1 leading-relaxed">{VARGA_INFO[selectedVarga].significance}</p>
                      </div>
                   </div>
                </div>

                <div ref={chartRef} className="space-y-12 bg-white p-10 rounded-[48px] border border-[#f1ebe6] shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <NorthIndianChart chart={chart} title={`${VARGA_INFO[selectedVarga].name} (D${selectedVarga})`} />
                    
                    <div className="space-y-8">
                      <div className="flex items-center justify-between mb-2 px-2">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-[#2d2621] flex items-center gap-2">
                           <BoltIcon className="w-5 h-5 text-orange-400" /> Planetary Details
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
                        {chart.points.map((p) => (
                          <div key={p.planet} className="p-6 rounded-[24px] border bg-white border-[#f1ebe6] hover:border-orange-300 transition-all">
                             <div className="flex items-center gap-4 mb-4">
                               <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-[#f1ebe6] flex flex-col items-center justify-center">
                                  <span className="text-xl font-black leading-none">{p.planet.substring(0, 2)}</span>
                                  <span className="text-[9px] font-black opacity-60 uppercase">H{p.house}</span>
                               </div>
                               <div>
                                 <p className="text-lg font-black text-[#2d2621]">{p.planet}</p>
                                 <p className="text-sm text-[#8c7e74]">{SIGN_NAMES[p.sign]} • {formatDMS(p.degree)}</p>
                               </div>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase border ${
                                  p.dignity === 'Exalted' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                  p.dignity === 'Debilitated' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                  'bg-white border-slate-200 text-slate-500'
                                }`}>
                                  {p.dignity || 'Neutral'}
                                </span>
                                {p.isRetrograde && (
                                  <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 uppercase">
                                    Retrograde
                                  </span>
                                )}
                                {p.nakshatra && (
                                  <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-600">
                                    {p.nakshatra}
                                  </span>
                                )}
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'yogas' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="p-8 bg-gradient-to-br from-white to-orange-50 rounded-3xl border border-orange-100">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-3xl flex items-center justify-center border border-orange-500/20">
                      <SparklesIcon className="w-10 h-10 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight">{yogas.length} Cosmic Alignments (Yogas)</h3>
                      <p className="text-[#f97316] text-sm font-bold uppercase tracking-widest mt-1">Detected from your chart</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                  {yogas.map((y, i) => (
                    <div key={i} className="bg-white rounded-3xl p-7 border border-[#f1ebe6] hover:border-[#f97316] transition-all">
                       <div className="flex justify-between items-start mb-6">
                          <h4 className="text-xl font-black text-[#2d2621] leading-tight">{y.name}</h4>
                          <span className="text-[10px] font-black px-3 py-1.5 bg-orange-50 text-[#f97316] rounded-xl uppercase border border-orange-100">{y.category}</span>
                       </div>
                       <p className="text-xs text-[#8c7e74] font-bold mb-6 italic">"{y.description}"</p>
                       <p className="text-sm text-[#2d2621] font-semibold leading-relaxed mb-6">{y.interpretation}</p>
                       <div className="pt-6 border-t border-[#f1ebe6] flex items-center justify-between">
                          <span className="text-[10px] font-black text-[#8c7e74] uppercase">Potency</span>
                          <span className="text-[10px] font-black text-[#f97316] uppercase bg-orange-50 px-2 py-0.5 rounded-lg">{y.strength}% Strength</span>
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
}

// Main App with Auth Provider
function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f97316]/20 border-t-[#f97316] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8c7e74] font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return <AppContent />;
}

// Export with Provider wrapper
export default function AppWithProviders() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
