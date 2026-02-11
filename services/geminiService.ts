
import { GoogleGenAI, Type } from "@google/genai";

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
    // Initialize GoogleGenAI with the API key from environment variables.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are an elite polyglot software engineer. Your task is to convert code from ${sourceLang === 'auto' ? 'an automatically detected language' : sourceLang} to ${targetLang}.

      CONVERSION RULES:
      1. Logical Equivalence: The behavior must remain identical.
      2. Idiomatic Style: Use the standard naming conventions, patterns, and best practices of ${targetLang} (e.g., PEP 8 for Python, CamelCase for Java).
      3. Robust Formatting: Ensure the output is perfectly indented and formatted as if passed through a professional formatter (like Prettier or Black).
      4. Dependencies: Map standard library functions to their ${targetLang} equivalents.
      5. Error Handling: If the code contains constructs that are impossible to port or logically invalid, set success to false and provide a detailed reason in errorContext.

      INPUT CODE:
      ${sourceCode}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              success: { 
                type: Type.BOOLEAN,
                description: "True if conversion was successful."
              },
              outputCode: { 
                type: Type.STRING,
                description: "The formatted converted code. Empty if success is false."
              },
              errorContext: { 
                type: Type.STRING, 
                description: "Detailed explanation of why conversion failed, if success is false." 
              }
            },
            required: ["success", "outputCode"]
          },
          thinkingConfig: { thinkingBudget: 8000 }
        }
      });

      // Directly access the .text property of the response.
      const result = JSON.parse(response.text || '{}') as ConversionResult;
      return result;
    } catch (error: any) {
      console.error('Gemini conversion error:', error);
      throw new Error(error.message || 'Failed to communicate with the AI model.');
    }
  }
}

export const geminiService = new GeminiService();
