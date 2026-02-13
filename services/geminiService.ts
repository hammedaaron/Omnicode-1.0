
import { supabase } from './supabaseService';

export interface ConversionResult {
  success: boolean;
  outputCode: string;
  errorContext?: string;
}

export class GeminiService {
  async convertCode(
    sourceCode: string,
    sourceLang: string,
    targetLang: string
  ): Promise<ConversionResult> {
    try {
      // Invoke the remote Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('convert-code', {
        body: { sourceCode, sourceLang, targetLang },
      });

      if (error) {
        console.error('Edge Function Error:', error);
        throw new Error(error.message || 'The conversion engine failed to respond.');
      }

      return data as ConversionResult;
    } catch (error: any) {
      console.error('Gemini Service error:', error);
      throw new Error(error.message || 'System connectivity interrupted. Retrying in next cycle.');
    }
  }
}

export const geminiService = new GeminiService();
