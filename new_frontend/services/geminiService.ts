
import { GoogleGenAI, Type } from "@google/genai";
import { DivisionalChart, YogaMatch, ChatMessage } from "../types";
import { VarshaphalaData } from "./astrologyService";

/**
 * Helper to execute API requests with exponential backoff for 429 errors.
 */
async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 4, initialDelay = 1500): Promise<T> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error?.message || "";
      const isRateLimit = error?.status === 429 || 
                          errorMsg.includes("429") || 
                          errorMsg.includes("RESOURCE_EXHAUSTED") ||
                          errorMsg.includes("quota");
      
      const isKeyIssue = errorMsg.includes("Requested entity was not found") || 
                         errorMsg.includes("API_KEY_INVALID");

      if (isKeyIssue) {
        // Propagate specific error for the UI to catch and potentially trigger openSelectKey()
        throw new Error("API_KEY_NOT_FOUND");
      }

      if (isRateLimit && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Gemini API Quota reached (429). Attempt ${attempt + 1}/${maxRetries}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }
      
      if (isRateLimit) {
        throw new Error("GEMINI_QUOTA_EXHAUSTED");
      }

      throw error;
    }
  }
  throw new Error("Max retries exceeded for Gemini API");
}

export const geminiService = {
  async interpretChart(chart: DivisionalChart): Promise<string> {
    return callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Interpret the following Vedic Natal Chart (D1):
      ${JSON.stringify(chart.points)}
      Provide a professional analysis including Lagna characteristics, key planetary strengths, and life direction.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
      return response.text || "Unable to interpret chart at this moment.";
    });
  },

  async interpretVarshaphala(data: VarshaphalaData): Promise<string> {
    return callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = {
        year: data.year,
        yearLord: data.yearLord,
        annualAscendant: data.ascendant,
        muntha: `${data.munthaSign} in House ${data.munthaHouse}`,
        yogas: data.yogas.map(y => y.name),
        sahams: data.sahams.map(s => s.name)
      };

      const prompt = `You are a world-class Tajika (Vedic Annual) Astrologer. 
      Interpret this Varshaphala Solar Return for the year ${data.year}.
      
      TECHNICAL CONTEXT:
      - Year Lord (Varsheshwar): ${context.yearLord}
      - Annual Lagna: ${context.annualAscendant}
      - Muntha (Focal Point): ${context.muntha}
      - Tajika Yogas: ${context.yogas.join(", ")}
      
      TASK:
      Provide a highly detailed, professional, and empathetic annual forecast. 
      Structure your response with:
      1. **The Annual Theme**: Overall vibration of the year.
      2. **Professional Trajectory**: Career and Status.
      3. **Prosperity & Assets**: Finance.
      4. **Heart & Home**: Relationships.
      5. **Vitality & Body**: Health and Wellness.
      6. **Key Remedial Protocols**: Specific Tajika remedies.
      
      Tone: Sage-like, precise, and empowering. Use Markdown for formatting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });
      return response.text || "The annual cosmic transmission was interrupted.";
    });
  },

  async findYogas(chart: DivisionalChart): Promise<YogaMatch[]> {
    return callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this Vedic Chart and identify at least 5 major Yogas (e.g., Gaja Kesari, Raja Yogas, Pancha Mahapurusha).
      Chart data: ${JSON.stringify(chart.points)}`;

      // Use responseSchema for structured JSON output
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                rule: { type: Type.STRING },
                interpretation: { type: Type.STRING },
                strength: { type: Type.NUMBER },
                category: { type: Type.STRING }
              },
              required: ["name", "description", "rule", "interpretation", "strength", "category"]
            }
          }
        }
      });
      
      try {
        return JSON.parse(response.text || "[]");
      } catch {
        return [];
      }
    });
  },

  async chat(history: ChatMessage[], currentAstroContext: any): Promise<ChatMessage> {
    return callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contextStr = `
      USER BIRTH DATA & CHART CONTEXT:
      - Lagna: ${currentAstroContext.lagna}
      - Planetary Positions: ${JSON.stringify(currentAstroContext.planets)}
      - Active Mahadasha: ${currentAstroContext.activeDasha}
      - Identified Yogas: ${JSON.stringify(currentAstroContext.yogas.map((y: any) => y.name))}
      `;

      const systemPrompt = `You are Astro Jyotish AI, a world-class Vedic Astrologer.
      Tone: wise, empathetic, grounded.
      Use provided context to answer. 
      Career: look at 10th house/Saturn. Health: look at 6th/Lagna.
      
      RULES:
      1. Use ONLY provided context chart data.
      2. English names for planets, Vedic terms for concepts.
      3. Balanced interpretations.
      4. Mention remedies only if relevant.

      ASTRO CONTEXT:
      ${contextStr}`;

      const contents = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: contents as any,
        config: { 
          systemInstruction: systemPrompt,
          temperature: 0.7,
          topP: 0.95
        }
      });

      return {
        role: 'assistant',
        content: response.text || "The stars are momentarily obscured. Please try again.",
        astroContext: currentAstroContext
      };
    });
  }
};
