
import React from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface CodeAreaProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  language?: string;
}

const CodeArea: React.FC<CodeAreaProps> = ({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
  language
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1).join('\n');

  return (
    <div className="flex flex-col h-full glass-container rounded-3xl overflow-hidden transition-all duration-500 hover:silver-glow group/area">
      <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 opacity-50">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400/20 border border-slate-400/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400/20 border border-slate-400/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400/20 border border-slate-400/40" />
          </div>
          <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-[0.2em] ml-2">
            {label} {language && <span className="text-slate-500">· {language}</span>}
          </span>
        </div>
        {value && (
          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl transition-all duration-300 ${
              copied ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400 hover:text-indigo-400 hover:bg-white/10'
            }`}
          >
            {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
          </button>
        )}
      </div>
      <div className="flex flex-1 relative min-h-[350px]">
        <div className="w-12 bg-black/40 border-r border-white/[0.03] text-right pr-4 py-6 text-slate-700 text-[10px] select-none code-font whitespace-pre leading-7">
          {lineNumbers}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1 bg-transparent p-6 text-slate-200 code-font text-[13px] resize-none outline-none leading-7 placeholder:text-slate-800 selection:bg-indigo-500/30"
        />
      </div>
    </div>
  );
};

export default CodeArea;
