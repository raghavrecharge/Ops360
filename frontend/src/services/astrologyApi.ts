import api from './api';
import { DivisionalChart, DashaNode, YogaMatch, TransitContext, PlannerData, ShadbalaData, CompatibilityData, Remedy, KBChunk, ChatMessage, Planet, Sign } from '../types';
import { SIGN_NAMES } from '../constants';

// Transform backend chart response to frontend format
function transformChartBundle(data: any): DivisionalChart {
  const points = data.planetary_table?.map((pos: any) => ({
    planet: pos.planet as Planet,
    sign: pos.rasi as Sign,
    degree: pos.degree_in_rasi || 0,
    house: Math.floor((pos.longitude || 0) / 30) + 1,
    isRetrograde: pos.is_retrograde || false,
    nakshatra: pos.nakshatra,
    pada: pos.pada,
    dignity: pos.dignity,
    nakshatraLord: pos.nakshatra_lord,
  })) || [];

  return {
    varga: 'D1',
    points,
  };
}

// Transform backend dasha response to frontend format
function transformDashas(data: any): DashaNode[] {
  const dashas = data.dashas || [];
  return dashas.map((d: any, idx: number) => ({
    id: d.id?.toString() || `dasha-${idx}`,
    planet: d.lord as Planet,
    start: d.start_date,
    end: d.end_date,
    level: d.level === 'maha' ? 1 : d.level === 'antar' ? 2 : 3,
    children: [],
  }));
}

export const astrologyApi = {
  // Charts
  async getChartBundle(profileId: number): Promise<{ d1: DivisionalChart; d9: DivisionalChart | null; d10: DivisionalChart | null }> {
    const response = await api.get(`/api/charts/${profileId}/bundle`);
    const data = response.data;
    
    return {
      d1: transformChartBundle(data),
      d9: data.d9 ? transformChartBundle({ planetary_table: Object.values(data.d9.planetary_positions || {}) }) : null,
      d10: data.d10 ? transformChartBundle({ planetary_table: Object.values(data.d10.planetary_positions || {}) }) : null,
    };
  },

  async getChart(profileId: number, chartType: string = 'D1'): Promise<any> {
    const response = await api.get(`/api/charts/${profileId}?chart=${chartType}`);
    return response.data;
  },

  // Dashas
  async getDashas(profileId: number, system: string = 'vimshottari', depth: number = 1): Promise<DashaNode[]> {
    const response = await api.get(`/api/dashas/${profileId}?system=${system}&depth=${depth}`);
    return transformDashas(response.data);
  },

  async getDashaChildren(dashaId: number): Promise<DashaNode[]> {
    const response = await api.get(`/api/dashas/node/${dashaId}/children`);
    return response.data.children.map((d: any) => ({
      id: d.id?.toString(),
      planet: d.lord as Planet,
      start: d.start_date,
      end: d.end_date,
      level: d.level === 'maha' ? 1 : d.level === 'antar' ? 2 : 3,
      children: [],
    }));
  },

  // Align27 / Today
  async getTodayData(profileId: number): Promise<TransitContext> {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/api/align27/day?profile_id=${profileId}&date=${today}`);
    const data = response.data;

    return {
      panchang: {
        tithi: data.reasons?.[0] || 'Unknown',
        tithiNumber: 1,
        vara: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        dayLord: Planet.Sun,
        nakshatra: data.key_transits?.[0] || 'Unknown',
        yoga: 'Vishkumbha',
        karana: 'Bava',
        sunrise: '06:00 AM',
        sunset: '06:00 PM',
        moonPhase: 'Waxing',
      },
      transits: { varga: 'Transit', points: [] },
      horaLord: Planet.Sun,
      isAuspicious: data.score > 60,
    };
  },

  async getTodaySummary(profileId: number): Promise<any> {
    const response = await api.get(`/api/align27/today?profile_id=${profileId}`);
    return response.data;
  },

  async getMoments(profileId: number, date: string): Promise<any[]> {
    const response = await api.get(`/api/align27/moments?profile_id=${profileId}&date=${date}`);
    return response.data.moments || [];
  },

  // Planner
  async getPlannerData(profileId: number, days: number = 90): Promise<PlannerData> {
    const start = new Date().toISOString().split('T')[0];
    const response = await api.get(`/api/align27/planner?profile_id=${profileId}&start=${start}&days=${days}`);
    const data = response.data;

    return {
      activities: data.planner?.slice(0, 3).map((d: any) => ({
        category: d.color === 'GREEN' ? 'Favorable Day' : d.color === 'AMBER' ? 'Mixed Energy' : 'Caution Advised',
        score: d.score || 50,
        status: d.score > 70 ? 'Peak' : d.score > 40 ? 'Neutral' : 'Low',
        advice: d.best_moment || 'Stay mindful',
      })) || [],
      schedule: [],
      daySummary: 'Plan your activities wisely based on cosmic alignments.',
    };
  },

  // Strength / Shadbala
  async getShadbala(profileId: number): Promise<ShadbalaData[]> {
    const response = await api.get(`/api/strength/${profileId}`);
    const data = response.data;

    return (data.shadbala || data || []).map((s: any) => ({
      planet: s.planet as Planet,
      total: s.total_strength || s.total || 0,
      percentage: Math.round(((s.total_strength || s.total || 0) / 600) * 100),
      sthana: s.sthana_bala || 0,
      dig: s.dig_bala || 0,
      kala: s.kala_bala || 0,
      cesta: s.cesta_bala || 0,
      naisargika: s.naisargika_bala || 0,
      drig: s.drig_bala || 0,
      baladi: 'Unknown',
      jagradadi: 'Unknown',
      deeptadi: 'Unknown',
    }));
  },

  // Compatibility
  async getCompatibility(profileId1: number, profileId2: number): Promise<CompatibilityData> {
    const response = await api.get(`/api/compatibility?profile1_id=${profileId1}&profile2_id=${profileId2}`);
    const data = response.data;

    return {
      partner1: data.profile1_name || 'Partner 1',
      partner2: data.profile2_name || 'Partner 2',
      totalScore: data.total_score || 0,
      kootas: (data.kootas || []).map((k: any) => ({
        name: k.name,
        score: k.score,
        max: k.max_score || k.max,
        description: k.description || '',
        interpretation: k.interpretation || '',
      })),
      manglikStatus: {
        partner1: data.manglik_partner1 || false,
        partner2: data.manglik_partner2 || false,
        cancellation: data.manglik_cancellation || null,
      },
      summary: data.summary || 'Analysis complete',
    };
  },

  // Remedies
  async getRemedies(profileId: number): Promise<Remedy[]> {
    const response = await api.get(`/api/remedies/${profileId}`);
    const data = response.data;

    return (data.remedies || data || []).map((r: any) => ({
      type: r.type || 'Mantra',
      planet: r.planet as Planet,
      title: r.title || r.name,
      description: r.description,
      benefit: r.benefit || r.effect,
      mantraText: r.mantra,
      day: r.day,
      color: r.color,
    }));
  },

  // Yogas
  async getYogas(profileId: number): Promise<YogaMatch[]> {
    const response = await api.get(`/api/yogas/${profileId}`);
    const data = response.data;

    return (data.yogas || data || []).map((y: any) => ({
      name: y.name,
      description: y.description || y.definition,
      rule: y.rule || y.condition,
      interpretation: y.interpretation || y.effect,
      strength: y.strength || 75,
      category: y.category || 'General',
    }));
  },

  // Ashtakavarga
  async getAshtakavarga(profileId: number): Promise<{ bav: Record<string, number[]>; sav: number[] }> {
    const response = await api.get(`/api/ashtakavarga/${profileId}`);
    return response.data;
  },

  // Knowledge Base
  async searchKnowledge(query: string): Promise<KBChunk[]> {
    const response = await api.get(`/api/kb/search?q=${encodeURIComponent(query)}&limit=10`);
    const data = response.data;

    return (data.chunks || data.results || []).map((c: any) => ({
      id: c.id || c.chunk_id,
      category: c.category || 'Concepts',
      title: c.title || c.heading,
      summary: c.summary || c.text?.substring(0, 100),
      content: c.content || c.text,
      difficulty: c.difficulty || 'Beginner',
      tags: c.tags || [],
      readTime: c.read_time || '3 min',
    }));
  },

  // Chat
  async sendChatMessage(profileId: number, message: string, history: ChatMessage[]): Promise<ChatMessage> {
    try {
      const response = await api.post('/api/chat/ask', {
        message,
        profile_id: profileId,
      });

      return {
        role: 'assistant',
        content: response.data.answer || response.data.response || 'I could not process your request.',
      };
    } catch (error: any) {
      // Fallback for simpler chat endpoint
      console.warn('Chat API error, returning default response');
      return {
        role: 'assistant',
        content: 'I apologize, but the AI chat service is currently unavailable. Please try again later.',
      };
    }
  },

  // Varshaphala
  async getVarshaphala(profileId: number, year: number): Promise<any> {
    const response = await api.get(`/api/varshaphala/${profileId}?year=${year}`);
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/api/health');
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  },
};
