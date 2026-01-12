
import { GoogleGenAI } from "@google/genai";
import { ChartPoint, DivisionalChart, YogaMatch, ChatMessage, Planet } from "../types";

export const geminiService = {
  async interpretChart(chart: DivisionalChart): Promise<string> {
    // Create a new GoogleGenAI instance right before making an API call to ensure it uses latest key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Interpret the following Vedic Natal Chart (D1):
    ${JSON.stringify(chart.points)}
    Provide a professional analysis including Lagna characteristics, key planetary strengths, and life direction.`;

    const response = await ai.models.generateContent({
      // Astrology interpretation is a complex text task, using gemini-3-pro-preview
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // Correctly using .text property
    return response.text || "Unable to interpret chart at this moment.";
  },

  async findYogas(chart: DivisionalChart): Promise<YogaMatch[]> {
    // Create a new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze this Vedic Chart and identify at least 5 major Yogas (e.g., Gaja Kesari, Raja Yogas, Pancha Mahapurusha).
    Chart data: ${JSON.stringify(chart.points)}
    Return the result as a JSON array of objects with fields: name, description, rule, interpretation, strength, category.`;

    const response = await ai.models.generateContent({
      // Astrology interpretation is a complex text task, using gemini-3-pro-preview
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    try {
      // Correctly using .text property
      return JSON.parse(response.text || "[]");
    } catch {
      return [];
    }
  },

  async chat(history: ChatMessage[], currentAstroContext: any): Promise<ChatMessage> {
    // Create a new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contextStr = `
    USER BIRTH DATA & CHART CONTEXT:
    - Lagna: ${currentAstroContext.lagna}
    - Planetary Positions: ${JSON.stringify(currentAstroContext.planets)}
    - Active Mahadasha: ${currentAstroContext.activeDasha}
    - Current Transits: ${JSON.stringify(currentAstroContext.todayTransits)}
    - Identified Yogas: ${JSON.stringify(currentAstroContext.yogas.map((y: any) => y.name))}
    `;

    const systemPrompt = `You are Astro Jyotish AI, a world-class Vedic Astrologer trained in Parashari and Jaimini systems.
    Your tone is empathetic, wise, and grounded. 
    Use the Astro Context provided below to answer user queries accurately. If they ask about their career, look at the 10th house and Saturn/Mercury. If they ask about health, look at the 6th house and Lagna lord.
    
    IMPORTANT RULES:
    1. Always use the user's chart data provided in the context. Do not make up placements.
    2. Refer to planets by their common English names but feel free to use Sanskrit terms like 'Graha', 'Bhava', or 'Yoga'.
    3. If the user asks general questions, use the knowledge base concepts.
    4. Keep interpretations balanced—provide both challenges and strengths.
    5. Mention remedies (Mantras/Gemstones) if the user asks for solutions.

    ASTRO CONTEXT:
    ${contextStr}`;

    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    const response = await ai.models.generateContent({
      // Complex conversation requires gemini-3-pro-preview
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
      // Correctly using .text property
      content: response.text || "The stars are momentarily obscured. Please try again.",
      astroContext: currentAstroContext
    };
  }
};
