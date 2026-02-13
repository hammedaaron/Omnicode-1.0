
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Import serve from standard library to avoid direct Deno namespace usage if it's not resolved
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI, Type } from "@google/genai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fix for Error on line 10: Using imported serve function instead of Deno.serve
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sourceCode, sourceLang, targetLang } = await req.json();
    
    // Fix for Error on line 18: Per @google/genai guidelines, use process.env.API_KEY exclusively
    if (!process.env.API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server API configuration missing (API_KEY)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Always use process.env.API_KEY for initialization
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Comprehensive Lipi Script Manual Integration
    const lipiContext = `
      LIPI SCRIPT CONVERSION PROTOCOL (STRICT ENFORCEMENT):
      1. CORE ARCHITECTURE: Lipi is a DSL on Golang. Use JavaScript-like syntax with MANDATORY curly braces {} for all scoping.
      2. PERSISTENCE: Replace 'var' with 'static' (script lifecycle) and 'varip' with 'intra' (bar lifecycle).
      3. LOOPS: 'for' loops are FORBIDDEN. Convert all 'for' loops to 'while' loops with manual incrementors (e.g., i := i + 1).
      4. TYPING: Strict typing is MANDATORY. Declare types for all function parameters (int, float, bool, color, line, label, box, string).
      5. LIBRARIES: 
         - Technical Analysis: 'ta.*' -> 'talib.*' (e.g., talib.sma, talib.rsi, talib.crossover).
         - Math: 'math.*' remains similar but check parity.
         - Inputs: 'input()' -> 'input.int()', 'input.float()', 'input.bool()', 'input.source()', 'input.color()'.
         - Time: Use 'interval.*' library for timeframe variables.
      6. COLORS: color.new(color, alpha) -> alpha must be 0.0 to 1.0 (decimal), not 0-100.
      7. PLOTTING: 'plot.style_histogram' -> 'plotStyle.histogram'.
      8. ARRAYS: Lipi uses fixed-size buffers. 'array.new_float()' -> 'static float arr[SIZE]'.
      9. ATTRIBUTION: Mandatory header for Pine ports: 
         // LipiScript conversion of [Name]
         // Original Pine Script by [Author]
         // Source: [URL]
    `;

    const englishContext = `
      PLAIN ENGLISH LOGIC PROTOCOL:
      - Objective: 99% accuracy in logical mapping.
      - Style: Simple, direct commands only. 
      - Constraint: NO explanations, NO "This code does...", NO introductions.
      - Mapping: One line of code logic = One line of English command.
      - Accuracy: Ensure variables and conditional results are reflected precisely.
    `;

    const prompt = `
      You are a world-class polyglot engineer. Convert the provided code from ${sourceLang} to ${targetLang}.
      
      ${targetLang === 'lipiscript' ? lipiContext : ''}
      ${targetLang === 'english' ? englishContext : ''}

      GENERAL RULES:
      - Preserve logical equivalence exactly.
      - Handle large-scale inputs (up to 1M lines) by focusing on structural integrity.
      - For Pine -> Lipi, follow the provided manual strictly.
      - For English, output raw command-style logic only.

      INPUT SOURCE:
      ${sourceCode}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            success: { type: Type.BOOLEAN },
            outputCode: { type: Type.STRING },
            errorContext: { type: Type.STRING }
          },
          required: ["success", "outputCode"]
        },
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    // Access the text property directly on GenerateContentResponse
    const resultText = response.text;
    return new Response(resultText, { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
