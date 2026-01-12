import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SparklesIcon, EnvelopeIcon, LockClosedIcon, UserIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface AuthViewProps {
  onSuccess?: () => void;
}

export default function AuthView({ onSuccess }: AuthViewProps) {
  const { login, register, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Authentication failed');
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      // First setup demo
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001'}/api/demo/setup`, {
        method: 'POST',
      });
      const data = await response.json();
      
      // Then login with demo credentials
      await login(data.credentials.email, data.credentials.password);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Demo setup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcf8f5] to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f97316] rounded-2xl shadow-lg shadow-orange-500/30 mb-4">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[#2d2621]">
            Astro<span className="text-[#f97316]">Jyotish</span>
          </h1>
          <p className="text-[#8c7e74] mt-2">Complete Vedic Astrology Platform</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#f1ebe6]">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-[#fcf8f5] p-1 rounded-xl">
            <button
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                isLoginMode
                  ? 'bg-white text-[#f97316] shadow-sm'
                  : 'text-[#8c7e74] hover:text-[#2d2621]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                !isLoginMode
                  ? 'bg-white text-[#f97316] shadow-sm'
                  : 'text-[#8c7e74] hover:text-[#2d2621]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
              <ExclamationCircleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-bold text-[#8c7e74] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7e74]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl text-[#2d2621] placeholder-[#8c7e74] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#8c7e74] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7e74]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl text-[#2d2621] placeholder-[#8c7e74] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8c7e74] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8c7e74]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 bg-[#fcf8f5] border border-[#f1ebe6] rounded-xl text-[#2d2621] placeholder-[#8c7e74] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#f97316] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : isLoginMode ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#f1ebe6]" />
            <span className="text-xs font-bold text-[#8c7e74] uppercase">or</span>
            <div className="flex-1 h-px bg-[#f1ebe6]" />
          </div>

          {/* Demo Button */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-4 bg-[#fcf8f5] border border-[#f1ebe6] text-[#2d2621] font-bold rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <SparklesIcon className="w-5 h-5 text-[#f97316]" />
              Try Demo Account
            </span>
          </button>

          <p className="text-center text-xs text-[#8c7e74] mt-4">
            Demo: demo@astroos.com / demo123
          </p>
        </div>
      </div>
    </div>
  );
}
