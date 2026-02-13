
import React, { useMemo, memo } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface CodeAreaProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  language?: string;
}

const CodeArea: React.FC<CodeAreaProps> = memo(({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
  language
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { lineCount, lineNumbers } = useMemo(() => {
    const lines = value.split('\n');
    const count = lines.length;
    
    // For massive files, we don't render a million line numbers in one go to save memory.
    // We render the first 1000 and a tail to keep the UI snappy.
    let nums = "";
    if (count > 50000) {
      nums = "BIG FILE\n" + Array.from({ length: 100 }, (_, i) => i + 1).join('\n') + "\n...\n" + count;
    } else {
      nums = Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1).join('\n');
    }
    
    return { lineCount: count, lineNumbers: nums };
  }, [value]);

  return (
    <div className="flex flex-col h-full glass-container rounded-[2rem] overflow-hidden transition-all duration-500 hover:silver-glow group/area relative">
      <div className="flex items-center justify-between px-8 py-5 bg-white/[0.02] border-b border-white/[0.05]">
        <div className="flex items-center gap-4">
          <div className="flex gap-2 opacity-30 group-hover/area:opacity-60 transition-opacity">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <div className="w-2 h-2 rounded-full bg-slate-500" />
          </div>
          <span className="text-[10px] font-black text-indigo-400/70 uppercase tracking-[0.3em] ml-2">
            {label} {language && <span className="text-slate-600 font-medium">// {language}</span>}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest bg-white/[0.03] px-3 py-1 rounded-lg">
            {lineCount.toLocaleString()} LNS
          </span>
          {value && (
            <button
              onClick={handleCopy}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 hover:text-indigo-400 hover:bg-white/10'
              }`}
              title="Copy to Clipboard"
            >
              {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 relative overflow-hidden" style={{ contain: 'content' }}>
        <div className="w-16 bg-black/20 border-r border-white/[0.03] text-right pr-5 py-8 text-slate-800 text-[10px] select-none code-font whitespace-pre leading-[1.8] overflow-hidden">
          {lineNumbers}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="flex-1 bg-transparent p-8 text-slate-300 code-font text-[13px] resize-none outline-none leading-[1.8] placeholder:text-slate-900 selection:bg-indigo-500/20 custom-scrollbar scroll-smooth"
          style={{ 
            contain: 'strict',
            WebkitFontSmoothing: 'antialiased'
          }}
        />
      </div>
      
      {lineCount > 100000 && (
        <div className="absolute bottom-4 right-8 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full backdrop-blur-md">
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Large Scale Processing Active</span>
        </div>
      )}
    </div>
  );
});

export default CodeArea;
