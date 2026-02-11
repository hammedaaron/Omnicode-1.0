
import React, { useState, useEffect, useCallback } from 'react';
import LanguageSelector from './components/LanguageSelector';
import CodeArea from './components/CodeArea';
import MouseEffect from './components/MouseEffect';
import Auth from './components/Auth';
import { geminiService } from './services/geminiService';
import { supabase, persistenceService } from './services/supabaseService';
import { ConversionState, ConversionHistory } from './types';
import { SUPPORTED_LANGUAGES, APP_NAME } from './constants';
import { ArrowRightIcon, HistoryIcon, TrashIcon, DownloadIcon } from './components/Icons';

const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Check if configuration is active
  const isDbConfigured = Boolean(
    (process.env.SUPABASE_URL || 'https://mweltlnqnkbywpklxkow.supabase.co') && 
    (process.env.SUPABASE_ANON_KEY || 'sb_publishable_8AFGWjJbIQHqBesX5HXO3Q_w0dhC_ic')
  );

  const [state, setState] = useState<ConversionState>({
    sourceCode: '',
    targetCode: '',
    sourceLanguage: 'auto',
    targetLanguage: 'python',
    isConverting: false,
    error: null,
    errorContext: null,
  });

  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const loadCloudData = async () => {
        const { data: historyData } = await persistenceService.getHistory(user.id);
        if (historyData) {
          const formattedHistory: ConversionHistory[] = historyData.map(h => ({
            id: h.id,
            sourceCode: h.source_code,
            targetCode: h.target_code,
            sourceLanguage: h.source_language,
            targetLanguage: h.target_language,
            timestamp: new Date(h.created_at).getTime(),
          }));
          setHistory(formattedHistory);
        }

        const { data: stateData } = await persistenceService.getState(user.id);
        if (stateData) {
          setState(prev => ({
            ...prev,
            sourceCode: stateData.source_code || '',
            targetCode: stateData.target_code || '',
            sourceLanguage: stateData.source_language || 'auto',
            targetLanguage: stateData.target_language || 'python',
          }));
        }
      };
      loadCloudData();
    } else {
      setHistory([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      persistenceService.saveState(user.id, state);
    }, 2000);
    return () => clearTimeout(timer);
  }, [user, state.sourceCode, state.targetCode, state.sourceLanguage, state.targetLanguage]);

  const handleConvert = async () => {
    if (!state.sourceCode.trim()) {
      setState(prev => ({ ...prev, error: 'Snippet Required', errorContext: 'The conversion engine requires source input to proceed.', targetCode: '' }));
      return;
    }

    setState(prev => ({ ...prev, isConverting: true, error: null, errorContext: null }));

    try {
      const result = await geminiService.convertCode(
        state.sourceCode,
        state.sourceLanguage,
        state.targetLanguage
      );

      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          targetCode: result.outputCode, 
          isConverting: false,
          error: null,
          errorContext: null
        }));

        if (user) {
          await persistenceService.saveConversion(user.id, {
            source_code: state.sourceCode,
            target_code: result.outputCode,
            source_language: state.sourceLanguage,
            target_language: state.targetLanguage
          });
          const { data } = await persistenceService.getHistory(user.id);
          if (data) setHistory(data.map(h => ({
            id: h.id,
            sourceCode: h.source_code,
            targetCode: h.target_code,
            sourceLanguage: h.source_language,
            targetLanguage: h.target_language,
            timestamp: new Date(h.created_at).getTime(),
          })));
        }
      } else {
        setState(prev => ({
          ...prev,
          isConverting: false,
          error: 'Conversion Rejected',
          errorContext: result.errorContext || 'The architectural constraints of the target language prevented a direct port.',
          targetCode: ''
        }));
      }
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isConverting: false, 
        error: 'Engine Error',
        errorContext: err.message || 'System connectivity interrupted. Retrying in next cycle.'
      }));
    }
  };

  const handleDownload = (type: 'native' | 'txt') => {
    if (!state.targetCode) return;
    const langObj = SUPPORTED_LANGUAGES.find(l => l.id === state.targetLanguage);
    const extension = type === 'txt' ? 'txt' : (langObj?.extension || 'txt');
    const blob = new Blob([state.targetCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OMNICODE_EXPORT_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFromHistory = (item: ConversionHistory) => {
    setState(prev => ({
      ...prev,
      sourceCode: item.sourceCode,
      targetCode: item.targetCode,
      sourceLanguage: item.sourceLanguage,
      targetLanguage: item.targetLanguage,
      error: null,
      errorContext: null
    }));
    setShowHistory(false);
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-indigo-500 font-black animate-pulse">OmniCode Protocol Initializing...</div>;
  
  if (!user) return <div className="bg-black min-h-screen">
    <MouseEffect /><Auth />
  </div>;

  return (
    <div className="min-h-screen flex flex-col bg-black text-slate-200">
      <MouseEffect />

      <header className="border-b border-white/5 bg-black/50 backdrop-blur-2xl sticky top-0 z-[60]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <span className="text-xl italic">Ω</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter text-white uppercase italic">
                Omni<span className="text-indigo-500">Code</span>
              </h1>
              <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">{user.email?.split('@')[0]} Layer</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHistory(true)}
              className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400"
            >
              <HistoryIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Archives</span>
            </button>
            <button
              onClick={() => (supabase.auth as any).signOut()}
              className="px-4 py-2.5 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-white hover:bg-white/5 transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 sm:p-10 lg:p-16 space-y-12 relative z-10">
        <section className="glass-container p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-indigo-600/5 blur-[100px] pointer-events-none group-hover:bg-indigo-600/10 transition-all duration-1000" />
          
          <div className="flex flex-col lg:flex-row items-end justify-between gap-10">
            <div className="space-y-8 w-full">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  Neural Code <br/><span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Transpilation.</span>
                </h2>
                <p className="text-slate-500 text-sm sm:text-base font-medium max-w-lg leading-relaxed">
                  Logic is language-agnostic. Convert complex constructs across ecosystems while preserving architecture. Cloud-synced workspace active.
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                <LanguageSelector
                  label="Origin Source"
                  value={state.sourceLanguage}
                  onChange={(val) => setState(prev => ({ ...prev, sourceLanguage: val }))}
                />
                <div className="p-3 bg-white/5 rounded-full border border-white/5 text-slate-700 hidden md:block">
                  <ArrowRightIcon className="w-5 h-5" />
                </div>
                <LanguageSelector
                  label="Target Target"
                  value={state.targetLanguage}
                  onChange={(val) => setState(prev => ({ ...prev, targetLanguage: val }))}
                  excludeAuto
                />
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={state.isConverting}
              className={`
                group relative overflow-hidden w-full lg:w-72 h-[76px] rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all
                ${state.isConverting 
                  ? 'bg-slate-900 text-slate-600 border border-white/5' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.3)] active:scale-95'}
              `}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {state.isConverting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing</span>
                  </>
                ) : 'Run Conversion'}
              </span>
              {!state.isConverting && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 min-h-[550px]">
          <CodeArea
            label="Input Buffer"
            placeholder="// Paste raw source here..."
            value={state.sourceCode}
            onChange={(val) => setState(prev => ({ ...prev, sourceCode: val }))}
            language={SUPPORTED_LANGUAGES.find(l => l.id === state.sourceLanguage)?.name}
          />
          <div className="flex flex-col h-full space-y-6">
            <div className="flex-1">
              <CodeArea
                label="Formatted Output"
                placeholder="// Translation will be rendered here..."
                value={state.targetCode}
                readOnly
                language={SUPPORTED_LANGUAGES.find(l => l.id === state.targetLanguage)?.name}
              />
            </div>
            {state.targetCode && (
              <div className="flex flex-wrap items-center justify-end gap-4">
                <button
                  onClick={() => handleDownload('txt')}
                  className="px-6 py-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]"
                >
                  Download to TXT
                </button>
                <button
                  onClick={() => handleDownload('native')}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl shadow-black/50"
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span>Native Save</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {showHistory && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-lg h-full bg-black border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <HistoryIcon className="w-6 h-6 text-indigo-500" />
                <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">Log Archives</h2>
              </div>
              <button 
                onClick={() => setShowHistory(false)} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-slate-500 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-6">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-slate-800 flex items-center justify-center mb-6">
                    <HistoryIcon className="w-12 h-12" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">No Data Found</span>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="group p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.05] cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-900 text-[9px] font-black rounded-lg text-slate-500 border border-white/5">
                          {SUPPORTED_LANGUAGES.find(l => l.id === item.sourceLanguage)?.name || 'AUTO'}
                        </span>
                        <ArrowRightIcon className="w-3 h-3 text-slate-800" />
                        <span className="px-3 py-1 bg-indigo-500/10 text-[9px] font-black rounded-lg text-indigo-400 border border-indigo-500/20">
                          {SUPPORTED_LANGUAGES.find(l => l.id === item.targetLanguage)?.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-700 font-black">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="p-4 bg-black rounded-2xl border border-white/[0.02]">
                      <p className="text-slate-600 text-[10px] line-clamp-2 code-font leading-relaxed">
                        {item.sourceCode.trim().split('\n')[0] || '// Null log'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="p-10 border-t border-white/5">
                <button
                  onClick={async () => {
                    if (user && confirm('Purge all logs?')) {
                      await persistenceService.deleteHistory(user.id);
                      setHistory([]);
                    }
                  }}
                  className="w-full py-5 text-[10px] font-black uppercase tracking-[0.3em] text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-2xl border border-red-500/10"
                >
                  Wipe Archives
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
