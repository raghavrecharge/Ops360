
import React, { useState, useEffect, useMemo } from 'react';
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
  GlobeAltIcon,
  AcademicCapIcon,
  BoltIcon,
  SunIcon,
  ExclamationCircleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  HomeIcon,
  XMarkIcon,
  MoonIcon,
  PlusCircleIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CloudArrowUpIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

// Updated import to include LoginCredentials
import { BirthData, DivisionalChart, DashaNode, UserProfile, YogaMatch, ChatMessage, Sign, Planet, TransitContext, PlannerData, ShadbalaData, CompatibilityData, Remedy, KBChunk, ServiceStatus, UserAccount, LoginCredentials } from './types.ts';
import { astrologyService, VarshaphalaData, AshtakavargaData } from './services/astrologyService.ts';
import { geminiService } from './services/geminiService.ts';
import { apiService } from './services/apiService.ts';
import NorthIndianChart from './components/NorthIndianChart.tsx';
import SouthIndianChart from './components/SouthIndianChart.tsx';
import DashasView from './components/DashasView.tsx'; // Updated
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
import LoginView from './components/LoginView.tsx';
import ProfileView from './components/ProfileView.tsx';
import NatalChartView from './components/NatalChartView.tsx';
import { SIGN_NAMES } from './constants.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showInputForm, setShowInputForm] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    astrologyEngine: 'Initializing',
    aiInterpretation: 'Initializing',
    dataIntegrity: 'Unverified'
  });

  const [varshaYear, setVarshaYear] = useState<number>(new Date().getFullYear());
  const [varshaData, setVarshaData] = useState<VarshaphalaData | null>(null);

  useEffect(() => {
    const initApp = async () => {
      setIsSyncing(true);
      try {
        const savedAccount = await apiService.getAccount();
        if (savedAccount) {
          setUserAccount(savedAccount);
          setIsLoggedIn(true);
          const savedProfile = await apiService.getUserProfile();
          if (savedProfile) {
            await handleCalculate(savedProfile.birthData, true);
          }
        }
      } catch (err) {
        console.error("Initialization Failed", err);
      } finally {
        setIsSyncing(false);
      }
    };
    initApp();
  }, []);

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

  const handleLogin = async (creds: LoginCredentials) => {
    setIsSyncing(true);
    try {
      const user = await apiService.login(creds);
      setUserAccount(user);
      setIsLoggedIn(true);
    } catch (err) {
      setGlobalError("Database authentication failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    setIsSyncing(true);
    try {
      await apiService.logout();
      setIsLoggedIn(false);
      setUserAccount(null);
      setProfile(null);
      setChart(null);
      setActiveTab('dashboard');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMobileTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMoreOpen(false);
  };

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

  const handleCalculate = async (birthData: BirthData, silent = false) => {
    if (!userAccount) return;
    if (!silent) setIsSyncing(true);

    try {
      const newUserProfile: UserProfile = {
        id: `user-${Date.now()}`,
        account: userAccount,
        birthData,
        preferences: { ayanamsa: 'Lahiri', chartStyle: 'North' },
        isVerified: true
      };

      await apiService.saveUserProfile(newUserProfile);
      setProfile(newUserProfile);
      setShowInputForm(false);
      
      const d1 = astrologyService.calculateNatalChart(birthData);
      setChart(d1);
      setDashas(astrologyService.getVimshottariDashas(birthData, 3));
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
      console.error("Sync Error:", e);
      setGlobalError("Celestial synchronization failed. Check your API link.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCompatibilityCalculate = async (partnerData: BirthData) => {
    if (!profile) return;
    setIsSyncing(true);
    try {
      const result = astrologyService.calculateCompatibility(profile.birthData, partnerData);
      setCompatibilityData(result);
    } catch (e) {
      setGlobalError("Failed to calculate compatibility resonance.");
    } finally {
      setIsSyncing(false);
    }
  };

  const navModules = [
    { section: 'CORE', items: [
      { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
      { id: 'panchang', label: 'Panchang', icon: SunIcon },
      { id: 'today', label: 'Today', icon: ClockIcon },
      { id: 'planner', label: 'Planner', icon: CalendarDaysIcon }
    ]},
    { section: 'ASTROLOGY', items: [
      { id: 'charts', label: 'Natal Matrix', icon: ChartBarIcon },
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
      { id: 'chat', label: 'Oracle Chat', icon: ChatBubbleBottomCenterTextIcon }
    ]},
    { section: 'ACCOUNT', items: [
      { id: 'profile', label: 'My Account', icon: UserCircleIcon }
    ]}
  ];

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#fdfcfb] text-slate-600">
      {isSyncing && (
        <div className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#f97316]/20 border-t-[#f97316] rounded-full animate-spin mb-4" />
          <p className="text-sm font-black text-slate-800 uppercase tracking-[0.3em]">Synchronizing Matrix...</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Connecting to Secure Node</p>
        </div>
      )}

      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]'} bg-white border-r border-[#f1ebe6] flex-col overflow-hidden transition-all duration-300 ease-in-out relative group`}>
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-0'}`}>
          <div className="w-9 h-9 bg-[#f97316] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0 transition-transform hover:rotate-6 pulse-effect">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className={`text-lg font-black text-slate-800 tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 ml-3'}`}>
            Astro<span className="text-[#f97316]"> Jyotish</span>
          </h1>
        </div>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute top-[24px] -right-3 w-6 h-6 bg-white border border-[#f1ebe6] rounded-full flex items-center justify-center text-[#f97316] shadow-sm hover:bg-[#f97316] hover:text-white transition-all z-20">
          {isSidebarCollapsed ? <ChevronDoubleRightIcon className="w-3.5 h-3.5" /> : <ChevronDoubleLeftIcon className="w-3.5 h-3.5" />}
        </button>
        <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navModules.map((group) => (group.items.length > 0 && (
            <div key={group.section} className="space-y-1">
              <p className={`text-[9px] font-black text-slate-400 mb-2 px-4 tracking-[0.2em] uppercase whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                {group.section}
              </p>
              {group.items.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center transition-all duration-300 relative group/nav interactive-element active:scale-95 ${activeTab === item.id ? 'sidebar-active text-white' : 'text-slate-800 hover:bg-orange-50 hover:text-[#f97316]'} ${isSidebarCollapsed ? 'justify-center py-3.5 px-0 rounded-xl' : 'px-4 py-3 rounded-xl'}`}>
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-white' : ''}`} />
                  <span className={`text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 ml-3'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )))}
        </nav>
        <div className="p-4 border-t border-[#f1ebe6]">
           <button onClick={handleLogout} className={`w-full flex items-center transition-all duration-300 rounded-xl ${isSidebarCollapsed ? 'justify-center py-3.5' : 'px-4 py-3'} text-rose-500 hover:bg-rose-50`}>
              <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
              <span className={`text-sm font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 ml-3'}`}>
                Logout
              </span>
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 pb-20 lg:pb-0">
        <header className="h-14 lg:h-16 bg-white border-b border-[#f1ebe6] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
             <div className="lg:hidden w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-90 transition-transform">
               <SparklesIcon className="w-5 h-5 text-white" />
             </div>
             <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                <h2 className="text-sm lg:text-base font-black text-slate-800 capitalize tracking-tight leading-none lg:leading-normal">
                   {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
                </h2>
                <div className="hidden lg:flex items-center gap-3">
                   <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Secure Node</span>
                   </div>
                   <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                      <CloudArrowUpIcon className="w-3 h-3 text-indigo-500" />
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Cloud Synced</span>
                   </div>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowInputForm(!showInputForm)} 
              className="p-2 text-slate-400 hover:text-[#f97316] transition-colors"
              title="New Chart"
            >
              <PlusCircleIcon className="w-6 h-6" />
            </button>
            <div onClick={() => setActiveTab('profile')} className="flex items-center gap-2 bg-[#fcf8f5] lg:border lg:border-[#f1ebe6] rounded-lg px-2 lg:px-3 lg:py-1.5 interactive-element hover:bg-white active:scale-95 cursor-pointer">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-white border border-[#f1ebe6] flex items-center justify-center text-orange-500 shadow-sm overflow-hidden">
                  {userAccount?.avatar ? <img src={userAccount.avatar} className="w-full h-full object-cover" /> : <UserCircleIcon className="w-4 h-4" />}
                </div>
                {profile?.isVerified && <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white shadow-sm"><CheckBadgeIcon className="w-2 h-2" /></div>}
              </div>
              <div className="hidden sm:block"><p className="text-[9px] font-black text-slate-800 uppercase">{userAccount?.username || 'Seeker'}</p></div>
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
                  <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-tight">The Stars Await</h1>
                  <p className="text-lg font-medium text-slate-400 max-w-md mx-auto">Welcome, {userAccount?.username}. Enter your birth details to initialize your cosmic identity.</p>
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
                {activeTab === 'profile' && <ProfileView profile={profile} onLogout={handleLogout} onEditBirthData={() => setShowInputForm(true)} />}
                {activeTab === 'charts' && chart && (
                  <NatalChartView natalChart={chart} birthData={profile.birthData} />
                )}
                {activeTab === 'dashas' && <DashasView nodes={dashas} />}
                {activeTab === 'varshaphala' && varshaData && <VarshaphalaView data={varshaData} onYearChange={setVarshaYear} chartStyle={'North'} />}
                {activeTab === 'ashtakavarga' && avData && <AshtakavargaView data={avData} />}
                {activeTab === 'strength' && shadbalaData.length > 0 && <StrengthView data={shadbalaData} />}
                {activeTab === 'compatibility' && (
                  <CompatibilityView 
                    data={compatibilityData} 
                    onReset={() => setCompatibilityData(null)} 
                    onCalculate={handleCompatibilityCalculate}
                  />
                )}
                {activeTab === 'remedies' && remediesData.length > 0 && <RemediesView data={remediesData} />}
                {activeTab === 'knowledge' && kbData.length > 0 && <KnowledgeView data={kbData} />}
                {activeTab === 'chat' && <ChatView messages={chatHistory} onSendMessage={handleSendMessage} isLoading={isChatLoading} />}
              </>
            )}
          </div>
        </div>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-[#f1ebe6] flex items-center justify-around px-2 z-50">
           <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all active:scale-75 ${activeTab === 'dashboard' ? 'text-[#f97316]' : 'text-slate-400'}`}><HomeIcon className="w-7 h-7" /><span className="text-[10px] font-black uppercase mt-1">Home</span></button>
           <button onClick={() => setActiveTab('charts')} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all active:scale-75 ${activeTab === 'charts' ? 'text-[#f97316]' : 'text-slate-400'}`}><GlobeAltIcon className="w-7 h-7" /><span className="text-[10px] font-black uppercase mt-1">Explore</span></button>
           <button onClick={() => setActiveTab('compatibility')} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all active:scale-75 ${activeTab === 'compatibility' ? 'text-[#f97316]' : 'text-slate-400'}`}><HeartIcon className="w-7 h-7" /><span className="text-[10px] font-black uppercase mt-1">Sync</span></button>
           <button onClick={() => setIsMobileMoreOpen(true)} className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all active:scale-75 ${isMobileMoreOpen ? 'text-[#f97316]' : 'text-slate-400'}`}><Squares2X2Icon className="w-7 h-7" /><span className="text-[10px] font-black uppercase mt-1">More</span></button>
        </nav>

        {isMobileMoreOpen && (
          <div className="fixed inset-0 z-[100] bg-white lg:hidden animate-in fade-in slide-in-from-bottom-10 duration-300 overflow-y-auto">
             <div className="sticky top-0 bg-white px-6 py-8 flex items-center justify-between border-b border-[#f1ebe6] z-10">
                <h2 className="text-2xl font-black text-slate-800">Cosmic Hub</h2>
                <button onClick={() => setIsMobileMoreOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 active:scale-90 transition-transform"><XMarkIcon className="w-6 h-6" /></button>
             </div>
             <div className="p-6 space-y-10 pb-24">
                {navModules.map((group) => (
                  <div key={group.section} className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{group.section}</p>
                     <div className="grid grid-cols-2 gap-4">
                        {group.items.map((item) => (
                          <button key={item.id} onClick={() => handleMobileTab(item.id)} className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all active:scale-95 ${activeTab === item.id ? 'bg-orange-50 border-orange-500/30 text-orange-600' : 'bg-slate-50 border-transparent text-slate-800'}`}>
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

      <button 
        onClick={() => setActiveTab('profile')}
        className="fixed bottom-10 right-10 w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-2xl flex items-center justify-center text-slate-400 hover:text-orange-500 hover:scale-110 active:scale-95 transition-all z-[60]"
      >
        <div className="relative">
           <UserCircleIcon className="w-9 h-9" />
           {profile?.isVerified && <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm"><CheckBadgeIcon className="w-3 h-3" /></div>}
        </div>
      </button>
    </div>
  );
};

export default App;
