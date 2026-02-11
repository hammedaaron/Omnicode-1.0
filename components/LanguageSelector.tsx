
import React from 'react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  excludeAuto?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  value,
  onChange,
  excludeAuto = false
}) => {
  const options = excludeAuto
    ? SUPPORTED_LANGUAGES.filter(lang => lang.id !== 'auto')
    : SUPPORTED_LANGUAGES;

  return (
    <div className="flex flex-col gap-2 w-full sm:w-72">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
        {label}
      </label>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-slate-900/40 border border-slate-800/80 text-slate-300 text-sm rounded-2xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 block w-full px-5 py-4 transition-all hover:bg-slate-800/60 cursor-pointer outline-none backdrop-blur-sm"
        >
          {options.map((lang) => (
            <option key={lang.id} value={lang.id} className="bg-slate-900 text-slate-200">
              {lang.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-600 group-hover:text-indigo-400 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
