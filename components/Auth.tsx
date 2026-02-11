
import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Using any cast to bypass missing property errors on SupabaseAuthClient type
    const { error } = isSignUp 
      ? await (supabase.auth as any).signUp({ email, password })
      : await (supabase.auth as any).signInWithPassword({ email, password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else if (isSignUp) {
      setMessage({ type: 'success', text: 'Check your email for the confirmation link!' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-container p-10 rounded-[2.5rem] w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] mx-auto mb-4">
            <span className="text-2xl italic">Ω</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">
            Omni<span className="text-indigo-500">Code</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            {isSignUp ? 'Create your neural account' : 'Access your conversion workspace'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              placeholder="operator@omnicode.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500/50 transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500/50 transition-all"
              required
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-xs font-bold text-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {message.text}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Initialize Account' : 'Authenticate')}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
          >
            {isSignUp ? 'Existing operator? Sign In' : 'New operator? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
