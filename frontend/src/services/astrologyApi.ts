import api from './api';
import { DivisionalChart, DashaNode, YogaMatch, TransitContext, PlannerData, ShadbalaData, CompatibilityData, Remedy, KBChunk, ChatMessage, Planet, Sign } from '../types';
import { SIGN_NAMES } from '../constants';

// Helper function to get color for planet
function getColorForPlanet(planet: string): string {
  const colors: Record<string, string> = {
    SUN: 'Orange',
    MOON: 'White',
    MARS: 'Red',
    MERCURY: 'Green',
    JUPITER: 'Yellow',
    VENUS: 'White',
    SATURN: 'Blue',
    RAHU: 'Gray',
    KETU: 'Brown',
  };
  return colors[planet.toUpperCase()] || 'Gray';
}

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

    // Transform remedies_by_planet format to array of Remedy objects
    const remedies: Remedy[] = [];
    const remediesByPlanet = data.remedies_by_planet || {};
    
    for (const [planet, remedyTypes] of Object.entries(remediesByPlanet)) {
      const typedRemedies = remedyTypes as Record<string, any>;
      
      // Extract gemstone remedy
      if (typedRemedies.gemstone) {
        remedies.push({
          type: 'Gemstone',
          planet: planet as Planet,
          title: `${typedRemedies.gemstone.primary_gem} for ${planet}`,
          description: `Wear ${typedRemedies.gemstone.primary_gem} set in ${typedRemedies.gemstone.metal} on ${typedRemedies.gemstone.finger} finger`,
          benefit: typedRemedies.gemstone.benefit || `Strengthens ${planet}`,
          day: typedRemedies.gemstone.day_to_wear,
          color: getColorForPlanet(planet),
        });
      }

      // Extract mantra remedy
      if (typedRemedies.mantra) {
        remedies.push({
          type: 'Mantra',
          planet: planet as Planet,
          title: `${planet} Mantra`,
          description: `Chant the beej mantra for ${planet}`,
          benefit: `Minimum ${typedRemedies.mantra.minimum_count} repetitions for full effect`,
          mantraText: typedRemedies.mantra.beej_mantra,
          day: typedRemedies.mantra.best_day,
        });
      }

      // Extract charity remedy
      if (typedRemedies.charity) {
        remedies.push({
          type: 'Charity',
          planet: planet as Planet,
          title: `${planet} Charity`,
          description: `Donate: ${typedRemedies.charity.items_to_donate?.join(', ')}`,
          benefit: `Give to ${typedRemedies.charity.beneficiary}`,
          day: typedRemedies.charity.best_day,
        });
      }
    }

    return remedies;
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
    try {
      // Try POST endpoint first
      const response = await api.post(`/api/kb/search?query=${encodeURIComponent(query)}&top_k=10`);
      const data = response.data;

      return (data.results || []).map((c: any) => ({
        id: c.chunk_id?.toString() || c.id,
        category: 'General',
        title: c.section || c.source || 'Knowledge',
        summary: c.content?.substring(0, 100),
        content: c.content,
        difficulty: 'Beginner',
        tags: [],
        readTime: '3 min',
      }));
    } catch (error) {
      // Return empty array if KB not available
      console.warn('Knowledge base not available');
      return [];
    }
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
