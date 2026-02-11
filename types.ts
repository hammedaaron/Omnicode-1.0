
export interface ConversionHistory {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceCode: string;
  targetCode: string;
  errorContext?: string;
  timestamp: number;
}

export interface Language {
  id: string;
  name: string;
  extension: string;
}

export interface ConversionState {
  sourceCode: string;
  targetCode: string;
  sourceLanguage: string;
  targetLanguage: string;
  isConverting: boolean;
  error: string | null;
  errorContext: string | null;
}
