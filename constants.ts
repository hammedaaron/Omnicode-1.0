
import { Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { id: 'auto', name: 'Auto-detect', extension: '' },
  { id: 'english', name: 'Plain English', extension: 'txt' },
  { id: 'pinescript', name: 'Pine Script (v5)', extension: 'pine' },
  { id: 'lipiscript', name: 'Lipi Script', extension: 'lipi' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'csharp', name: 'C#', extension: 'cs' },
  { id: 'go', name: 'Go', extension: 'go' },
  { id: 'rust', name: 'Rust', extension: 'rs' },
  { id: 'ruby', name: 'Ruby', extension: 'rb' },
  { id: 'php', name: 'PHP', extension: 'php' },
  { id: 'swift', name: 'Swift', extension: 'swift' },
  { id: 'kotlin', name: 'Kotlin', extension: 'kt' },
  { id: 'dart', name: 'Dart', extension: 'dart' },
  { id: 'r', name: 'R', extension: 'r' },
  { id: 'sql', name: 'SQL', extension: 'sql' },
  { id: 'bash', name: 'Bash', extension: 'sh' },
  { id: 'c', name: 'C', extension: 'c' },
  { id: 'perl', name: 'Perl', extension: 'pl' },
  { id: 'lua', name: 'Lua', extension: 'lua' },
  { id: 'scala', name: 'Scala', extension: 'scala' },
  { id: 'haskell', name: 'Haskell', extension: 'hs' },
  { id: 'objectivec', name: 'Objective-C', extension: 'm' },
];

export const APP_NAME = 'OmniCode';
