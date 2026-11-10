import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import { Lock, Phone, AlertCircle, ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAdminData();
  const [mobile, setMobile] = useState('9999999999');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !password.trim()) {
      setError('Please enter both mobile number and password');
      return;
    }
    if (mobile.trim().length < 10) {
      setError('Mobile number must be at least 10 digits');
      return;
    }

    const success = login(mobile.trim(), password.trim());
    if (!success) {
      setError('Invalid admin credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080d12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f171f]/95 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md">
        {/* Brand Tag */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black tracking-widest uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            ratan567 panel
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin Panel Login</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Only admin can login and manage markets, results, and bets.
          </p>
        </div>

        {/* Important Warning Callout matching video */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 text-xs text-amber-200/90 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">Important</span>
              Admin credentials are required to access market controls and declare results.
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9999999999"
                className="w-full pl-10 pr-4 py-2.5 bg-[#141e28] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 bg-[#141e28] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-[#141e28] text-amber-500 focus:ring-0"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[11px] text-amber-400/80 font-medium">SSL Encrypted</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 px-4 rounded-xl font-bold text-sm text-slate-900 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-[0.99] transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </form>

        {/* Demo Quick Fill helper */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Demo credentials prefilled for convenience (<span className="text-amber-400 font-mono">9999999999</span> / <span className="text-amber-400 font-mono">admin123</span>)
          </p>
        </div>

        {/* Footer Note matching video */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Only Admin can login here. Download user the mobile app.
          </p>
        </div>
      </div>
    </div>
  );
};
