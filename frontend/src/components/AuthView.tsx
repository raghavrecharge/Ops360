/**
 * AuthView - Authentication component for login/register
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  SparklesIcon, 
  UserCircleIcon, 
  LockClosedIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const AuthView: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      // Setup demo account first
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/demo/setup`, { method: 'POST' });
      // Then login
      await login('demo@astroos.com', 'demo123');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <SparklesIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Astro<span className="text-orange-500">Jyotish</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">Vedic Astrology Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[32px] border border-[#f1ebe6] p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-800 mb-6">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Email</label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-100 disabled:opacity-50 transition-all"
            >
              Try Demo Account
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-orange-500 font-bold hover:underline"
            >
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
