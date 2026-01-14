// Gemini Service - Now delegates to backend chat API
import { astrologyApi } from './astrologyApi';
import { ChatMessage, DivisionalChart, YogaMatch } from '../types';

export const geminiService = {
  async chat(history: ChatMessage[], astroContext: any): Promise<ChatMessage> {
    // Get profileId from context if available
    const profileId = astroContext?.profileId || 1;
    const lastMessage = history[history.length - 1];
    
    if (!lastMessage || lastMessage.role !== 'user') {
      return {
        role: 'assistant',
        content: 'Please ask a question about your astrological chart.',
      };
    }

    try {
      return await astrologyApi.sendChatMessage(profileId, lastMessage.content);
    } catch (error) {
      console.error('Chat error:', error);
      return {
        role: 'assistant',
        content: 'I apologize, but I could not process your request. Please try again later.',
      };
    }
  },

  async findYogas(chart: DivisionalChart): Promise<YogaMatch[]> {
    // This now returns empty as backend handles yoga detection
    // The astrologyApi.getYogas() should be used instead
    return [];
  },
};
