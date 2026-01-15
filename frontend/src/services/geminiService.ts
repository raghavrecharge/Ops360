/**
 * GeminiService - AI chat and interpretation service
 * Fallback for local AI features when backend is unavailable
 */

import { DivisionalChart, ChatMessage, YogaMatch } from '../types';
import { VarshaphalaData } from './astrologyService';

export const geminiService = {
  /**
   * Chat with AI about astrology
   */
  async chat(history: ChatMessage[], astroContext: any): Promise<ChatMessage> {
    // This is a fallback - ideally use backend /api/chat/ask
    const lastMessage = history[history.length - 1];
    
    // Simple response generation based on context
    let response = 'I can help you understand your astrological chart. ';
    
    if (astroContext) {
      if (lastMessage.content.toLowerCase().includes('dasha')) {
        response += `You are currently in ${astroContext.activeDasha} dasha period. This influences your current life themes and experiences.`;
      } else if (lastMessage.content.toLowerCase().includes('lagna') || lastMessage.content.toLowerCase().includes('ascendant')) {
        response += `Your Lagna (Ascendant) is ${astroContext.lagna}. This represents your physical self and how others perceive you.`;
      } else if (lastMessage.content.toLowerCase().includes('yoga')) {
        response += `I found ${astroContext.yogas?.length || 0} yogas in your chart that indicate special combinations.`;
      } else {
        response += 'Please ask me about your dashas, yogas, planetary positions, or any specific aspect of your chart.';
      }
    }

    return {
      role: 'assistant',
      content: response,
    };
  },

  /**
   * AI-powered yoga detection
   */
  async findYogas(chart: DivisionalChart): Promise<YogaMatch[]> {
    // Return empty array - actual yoga detection should use astrologyService
    return [];
  },

  /**
   * Generate interpretation for chart
   */
  async interpretChart(chart: DivisionalChart): Promise<string> {
    return 'Chart interpretation requires backend AI service.';
  },

  /**
   * Interpret Varshaphala data
   */
  async interpretVarshaphala(data: VarshaphalaData): Promise<string> {
    const yearLord = data.yearLord;
    const age = data.age;
    const munthaSign = data.muntha?.signName || data.munthaSign;

    return `For your ${age}th year, with ${yearLord} as the year lord and Muntha in ${munthaSign}, ` +
           `this year promises growth in areas governed by ${yearLord}. ` +
           `The Muntha position suggests focus on the themes of the ${data.muntha?.house || data.munthaHouse}th house. ` +
           `Key periods to watch are during the Mudda Dasha of benefic planets.`;
  },
};

export default geminiService;
