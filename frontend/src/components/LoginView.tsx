
import React, { useState, useEffect } from 'react';
import { UserAccount, LoginCredentials } from '../types';
import { storageService } from '../services/storageService';
import { 
  SparklesIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ClockIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Props {
  onLogin: (creds: LoginCredentials) => void;
}

const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [recentAccounts, setRecentAccounts] = useState<UserAccount[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });

  useEffect(() => {
    setRecentAccounts(storageService.getRecentAccounts());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      email: formData.email,
      password: formData.password,
      username: formData.username || formData.email.split('@')[0]
    });
  };

  const handleDemoLogin = () => {
    onLogin({
      email: 'demo@astroos.com',
      password: 'demo123',
      username: 'Demo User'
    });
  };

  const selectRecent = (acc: UserAccount) => {
    setFormData({
      ...formData,
      email: acc.email,
      username: acc.username
    });
    setIsLoginMode(true);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center p-4 lg:p-10 font-['Plus_Jakarta_Sans']">
      <div className="max-w-[1200px] w-full bg-white rounded-[40px] shadow-2xl overflow-hidden border border-[#f1ebe6] flex flex-col lg:flex-row h-auto lg:h-[800px]">
        
        {/* LEFT PANE: BRANDING & ATMOSPHERE */}
        <div className="lg:w-1/2 bg-[#1e1b4b] relative p-12 flex flex-col justify-between overflow-hidden">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                 <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 pulse-effect">
                    <SparklesIcon className="w-7 h-7 text-white" />
                 </div>
                 <h1 className="text-2xl font-black text-white tracking-tight">
                   Astro<span className="text-orange-500"> Jyotish</span>
                 </h1>
              </div>
              <h2 className="text-5xl font-black text-white leading-tight tracking-tighter mb-6">
                Your Cosmic <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Timeline Simplified.</span>
              </h2>
              <p className="text-indigo-200 text-lg font-medium leading-relaxed max-w-md">
                Experience high-fidelity Vedic calculations powered by Parashari algorithms and RAG-integrated AI interpretations.
              </p>
           </div>

           <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                 <GlobeAltIcon className="w-8 h-8 text-orange-400 mb-3" />
                 <p className="text-white font-black text-sm uppercase tracking-widest">Global Ephemeris</p>
                 <p className="text-indigo-300 text-xs mt-1">Precision to arc seconds.</p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                 <ShieldCheckIcon className="w-8 h-8 text-emerald-400 mb-3" />
                 <p className="text-white font-black text-sm uppercase tracking-widest">Safe & Private</p>
                 <p className="text-indigo-300 text-xs mt-1">Your data is yours alone.</p>
              </div>
           </div>

           {/* DECORATIVE ELEMENTS */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
        </div>

        {/* RIGHT PANE: LOGIN FORM */}
        <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white relative overflow-y-auto">
           <div className="mb-10">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                 {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
                 {isLoginMode ? 'Access your celestial vault' : 'Start your journey with the stars'}
              </p>
           </div>

           {/* RECENT LOGINS SECTION */}
           {isLoginMode && recentAccounts.length > 0 && (
             <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="flex items-center gap-2 mb-4">
                 <ClockIcon className="w-4 h-4 text-orange-400" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Explorers</p>
               </div>
               <div className="flex flex-wrap gap-3">
                 {recentAccounts.map((acc, i) => (
                   <button 
                    key={i}
                    onClick={() => selectRecent(acc)}
                    className="flex items-center gap-3 p-2 pr-4 bg-slate-50 border border-slate-100 rounded-full hover:border-orange-200 hover:bg-orange-50/50 transition-all group interactive-element"
                   >
                     <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm">
                       <img src={acc.avatar} className="w-full h-full object-cover" alt={acc.username} />
                     </div>
                     <span className="text-xs font-bold text-slate-700">{acc.username}</span>
                   </button>
                 ))}
               </div>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-5">
              {!isLoginMode && (
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                   <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                      <input 
                        type="text" 
                        required
                        placeholder="Raghav Sanoriya"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-orange-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all shadow-inner"
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                      />
                   </div>
                </div>
              )}

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                 <div className="relative group">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="email" 
                      required
                      placeholder="raghav@emergent.sh"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-orange-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all shadow-inner"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                 <div className="relative group">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent focus:border-orange-200 focus:bg-white rounded-2xl outline-none text-sm font-bold text-slate-700 transition-all shadow-inner"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                 </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-orange-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                 {isLoginMode ? 'Enter the Cosmos' : 'Begin Initiation'}
                 <ArrowRightIcon className="w-5 h-5" />
              </button>
           </form>

           <div className="mt-8 flex flex-col items-center gap-4">
              <button 
                onClick={handleDemoLogin}
                className="w-full py-4 bg-[#fcf8f5] border border-[#f1ebe6] text-slate-800 rounded-[24px] font-bold text-sm hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              >
                 <SparklesIcon className="w-5 h-5 text-orange-500" />
                 Try Demo Account
              </button>
              
              <p className="text-sm font-bold text-slate-400">
                 {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
                 <button 
                   onClick={() => setIsLoginMode(!isLoginMode)}
                   className="text-orange-500 hover:text-orange-600 transition-colors font-black"
                 >
                    {isLoginMode ? 'Sign Up' : 'Log In'}
                 </button>
              </p>
           </div>

           <div className="mt-10 lg:absolute lg:bottom-10 lg:left-0 lg:right-0 px-12 text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                 Protected by Astro Guard Security Layer v2.1
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
