import api from './api';
import { DivisionalChart, DashaNode, YogaMatch, TransitContext, PlannerData, ShadbalaData, CompatibilityData, Remedy, KBChunk, ChatMessage, Planet, Sign, ChartPoint, PanchangData } from '../types';
import { SIGN_NAMES, DASHA_YEARS, PLANET_ORDER } from '../constants';

// Ashtakavarga data interface
export interface AshtakavargaData {
  bav: Record<string, number[]>;
  sav: number[];
  totalPoints: number;
  planetTotals: Record<string, number>;
  summary: {
    strongestHouse: number;
    weakestHouse: number;
    averagePoints: number;
    houseInterpretations: string[];
    houseSignifications: string[];
  };
  isValid: boolean;
}

// Varshaphala data interface
export interface VarshaphalaData {
  year: number;
  praveshTime: string;
  ascendant: string;
  munthaSign: string;
  munthaHouse: number;
  yearLord: Planet;
  chart: DivisionalChart;
  yogas: any[];
  sahams: any[];
  muddaDashas: any[];
  predictions: {
    overall: string;
    career: string;
    relationships: string;
    finance: string;
    health: string;
  };
}

const HOUSE_SIGNIFICATIONS = [
  "Self, Physicality, Character",
  "Wealth, Assets, Family, Speech",
  "Siblings, Courage, Communication",
  "Home, Mother, Comforts, Land",
  "Intelligence, Children, Creativity",
  "Challenges, Health, Competition",
  "Marriage, Partnerships, Public Relations",
  "Longevity, Transformations, Research",
  "Fortune, Spirituality, Higher Wisdom",
  "Career, Fame, Professional Status",
  "Gains, Ambitions, Social Circle",
  "Expenses, Solitude, Subconscious"
];

// Helper to transform backend chart to frontend format
function transformChartResponse(data: any): DivisionalChart {
  const points: ChartPoint[] = (data.planetary_table || []).map((pos: any) => ({
    planet: pos.planet as Planet,
    sign: pos.rasi as Sign,
    degree: pos.degree_in_rasi || pos.degree || 0,
    house: pos.house || Math.floor((pos.longitude || 0) / 30) + 1,
    isRetrograde: pos.is_retrograde || false,
    nakshatra: pos.nakshatra,
    pada: pos.pada,
    dignity: pos.dignity,
    nakshatraLord: pos.nakshatra_lord,
    signLord: pos.sign_lord,
  }));

  return {
    varga: data.chart_type || 'D1',
    points,
  };
}

// Transform dasha response
function transformDashas(data: any): DashaNode[] {
  const dashas = data.dashas || data || [];
  return dashas.map((d: any, idx: number) => ({
    id: d.id?.toString() || `dasha-${idx}`,
    planet: d.lord as Planet,
    start: d.start_date,
    end: d.end_date,
    level: d.level === 'maha' ? 1 : d.level === 'antar' ? 2 : 3,
    children: [],
  }));
}

// Helper to get color for planet
function getColorForPlanet(planet: string): string {
  const colors: Record<string, string> = {
    SUN: '#ef4444',
    MOON: '#94a3b8',
    MARS: '#dc2626',
    MERCURY: '#10b981',
    JUPITER: '#eab308',
    VENUS: '#ec4899',
    SATURN: '#1e1b4b',
    RAHU: '#6b7280',
    KETU: '#78350f',
  };
  return colors[planet.toUpperCase()] || '#6b7280';
}

export const astrologyApi = {
  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/api/health');
      return response.data.status === 'healthy';
    } catch {
      return false;
    }
  },

  // Charts
  async getChartBundle(profileId: number): Promise<{ d1: DivisionalChart; d9: DivisionalChart | null; d10: DivisionalChart | null }> {
    const response = await api.get(`/api/charts/${profileId}/bundle`);
    const data = response.data;
    
    return {
      d1: transformChartResponse(data),
      d9: data.d9 ? transformChartResponse({ planetary_table: Object.values(data.d9.planetary_positions || {}) }) : null,
      d10: data.d10 ? transformChartResponse({ planetary_table: Object.values(data.d10.planetary_positions || {}) }) : null,
    };
  },

  async getChart(profileId: number, chartType: string = 'D1'): Promise<DivisionalChart> {
    const response = await api.get(`/api/charts/${profileId}?chart=${chartType}`);
    return transformChartResponse(response.data);
  },

  // Dashas
  async getDashas(profileId: number, system: string = 'vimshottari', depth: number = 3): Promise<DashaNode[]> {
    const response = await api.get(`/api/dashas/${profileId}?system=${system}&depth=${depth}`);
    return transformDashas(response.data);
  },

  async getDashaChildren(dashaId: number): Promise<DashaNode[]> {
    const response = await api.get(`/api/dashas/node/${dashaId}/children`);
    return (response.data.children || []).map((d: any, idx: number) => ({
      id: d.id?.toString() || `child-${idx}`,
      planet: d.lord as Planet,
      start: d.start_date,
      end: d.end_date,
      level: d.level === 'maha' ? 1 : d.level === 'antar' ? 2 : 3,
      children: [],
    }));
  },

  // Today / Align27
  async getTodayData(profileId: number): Promise<TransitContext> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/api/align27/day?profile_id=${profileId}&date=${today}`);
      const data = response.data;

      return {
        panchang: {
          tithi: data.tithi || 'Shukla Pratipada',
          tithiNumber: data.tithi_number || 1,
          vara: data.vara || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          dayLord: (data.day_lord as Planet) || Planet.Sun,
          nakshatra: data.nakshatra || 'Ashwini',
          yoga: data.yoga || 'Vishkumbha',
          karana: data.karana || 'Bava',
          sunrise: data.sunrise || '06:00 AM',
          sunset: data.sunset || '06:00 PM',
          moonPhase: data.moon_phase || 'Waxing',
        },
        transits: { varga: 'Transit', points: [] },
        horaLord: Planet.Sun,
        isAuspicious: (data.score || 50) > 60,
      };
    } catch (error) {
      // Return default data if API fails
      return this.getDefaultTodayData();
    }
  },

  getDefaultTodayData(): TransitContext {
    const now = new Date();
    const varaLords = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn];
    return {
      panchang: {
        tithi: 'Shukla Pratipada',
        tithiNumber: 1,
        vara: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()],
        dayLord: varaLords[now.getDay()],
        nakshatra: 'Ashwini',
        yoga: 'Vishkumbha',
        karana: 'Bava',
        sunrise: '06:12 AM',
        sunset: '06:44 PM',
        moonPhase: 'Waxing',
      },
      transits: { varga: 'Transit', points: [] },
      horaLord: varaLords[(now.getHours() + now.getDay()) % 7],
      isAuspicious: true,
    };
  },

  async getPlannerData(profileId: number, days: number = 90): Promise<PlannerData> {
    try {
      const start = new Date().toISOString().split('T')[0];
      const response = await api.get(`/api/align27/planner?profile_id=${profileId}&start=${start}&days=${days}`);
      const data = response.data;

      return {
        activities: (data.planner || []).slice(0, 3).map((d: any) => ({
          category: d.color === 'GREEN' ? 'Favorable Day' : d.color === 'AMBER' ? 'Mixed Energy' : 'Caution Advised',
          score: d.score || 50,
          status: d.score > 70 ? 'Peak' : d.score > 40 ? 'Neutral' : 'Low',
          advice: d.best_moment || 'Stay mindful',
        })),
        schedule: [],
        daySummary: 'Plan your activities wisely based on cosmic alignments.',
      };
    } catch {
      return {
        activities: [
          { category: 'Financial Trading', score: 85, status: 'Peak', advice: 'Excellent aspects.' },
          { category: 'Health & Surgery', score: 45, status: 'Neutral', advice: 'Avoid elective procedures.' },
          { category: 'Creative Travel', score: 92, status: 'Peak', advice: 'Optimal window.' }
        ],
        schedule: [],
        daySummary: 'Focus on internal wealth consolidation.'
      };
    }
  },

  // Strength / Shadbala
  async getShadbala(profileId: number): Promise<ShadbalaData[]> {
    try {
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
        baladi: s.baladi || 'Unknown',
        jagradadi: s.jagradadi || 'Unknown',
        deeptadi: s.deeptadi || 'Unknown',
      }));
    } catch {
      return [];
    }
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
    try {
      const response = await api.get(`/api/remedies/${profileId}`);
      const data = response.data;

      const remedies: Remedy[] = [];
      const remediesByPlanet = data.remedies_by_planet || {};
      
      for (const [planet, remedyTypes] of Object.entries(remediesByPlanet)) {
        const typedRemedies = remedyTypes as Record<string, any>;
        
        if (typedRemedies.gemstone) {
          remedies.push({
            type: 'Gemstone',
            planet: planet as Planet,
            title: `${typedRemedies.gemstone.primary_gem} for ${planet}`,
            description: `Wear ${typedRemedies.gemstone.primary_gem} set in ${typedRemedies.gemstone.metal} on ${typedRemedies.gemstone.finger} finger`,
            benefit: typedRemedies.gemstone.benefit || `Strengthens ${planet}`,
            day: typedRemedies.gemstone.day_to_wear,
            color: getColorForPlanet(planet),
            metal: typedRemedies.gemstone.metal,
            finger: typedRemedies.gemstone.finger,
          });
        }

        if (typedRemedies.mantra) {
          remedies.push({
            type: 'Mantra',
            planet: planet as Planet,
            title: `${planet} Mantra`,
            description: `Chant the beej mantra for ${planet}`,
            benefit: `Minimum ${typedRemedies.mantra.minimum_count} repetitions for full effect`,
            mantraText: typedRemedies.mantra.beej_mantra,
            day: typedRemedies.mantra.best_day,
            count: typedRemedies.mantra.minimum_count,
          });
        }

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
    } catch {
      return [];
    }
  },

  // Yogas
  async getYogas(profileId: number): Promise<YogaMatch[]> {
    try {
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
    } catch {
      return [];
    }
  },

  // Ashtakavarga
  async getAshtakavarga(profileId: number): Promise<AshtakavargaData> {
    try {
      const response = await api.get(`/api/ashtakavarga/${profileId}`);
      const data = response.data;

      const sav = data.sav || Array.from({ length: 12 }, () => Math.floor(Math.random() * 10) + 25);
      
      return {
        bav: data.bav || {},
        sav,
        totalPoints: sav.reduce((a: number, b: number) => a + b, 0),
        planetTotals: data.planet_totals || {},
        summary: {
          strongestHouse: sav.indexOf(Math.max(...sav)) + 1,
          weakestHouse: sav.indexOf(Math.min(...sav)) + 1,
          averagePoints: Math.round(sav.reduce((a: number, b: number) => a + b, 0) / 12),
          houseInterpretations: Array(12).fill('Planetary strength indicates progressive results.'),
          houseSignifications: HOUSE_SIGNIFICATIONS,
        },
        isValid: true,
      };
    } catch {
      // Return default data
      const sav = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10) + 25);
      return {
        bav: {},
        sav,
        totalPoints: sav.reduce((a, b) => a + b, 0),
        planetTotals: {},
        summary: {
          strongestHouse: sav.indexOf(Math.max(...sav)) + 1,
          weakestHouse: sav.indexOf(Math.min(...sav)) + 1,
          averagePoints: Math.round(sav.reduce((a, b) => a + b, 0) / 12),
          houseInterpretations: Array(12).fill('Planetary strength indicates progressive results.'),
          houseSignifications: HOUSE_SIGNIFICATIONS,
        },
        isValid: true,
      };
    }
  },

  // Knowledge Base
  async searchKnowledge(query: string): Promise<KBChunk[]> {
    try {
      const response = await api.post(`/api/kb/search?query=${encodeURIComponent(query)}&top_k=10`);
      const data = response.data;

      return (data.results || []).map((c: any) => ({
        id: c.chunk_id?.toString() || c.id,
        category: c.category || 'General',
        title: c.section || c.source || 'Knowledge',
        summary: c.content?.substring(0, 100),
        content: c.content,
        difficulty: 'Beginner',
        tags: [],
        readTime: '3 min',
      }));
    } catch {
      return [];
    }
  },

  // Chat
  async sendChatMessage(profileId: number, message: string): Promise<ChatMessage> {
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
      console.warn('Chat API error:', error.message);
      return {
        role: 'assistant',
        content: 'I apologize, but the AI chat service is currently unavailable. Please try again later.',
      };
    }
  },

  // Varshaphala
  async getVarshaphala(profileId: number, year: number): Promise<VarshaphalaData> {
    try {
      const response = await api.get(`/api/varshaphala/${profileId}?year=${year}`);
      return response.data;
    } catch {
      // Return mock data if API not available
      return {
        year,
        praveshTime: `${year}-05-15T10:30:00`,
        ascendant: 'Aries',
        munthaSign: 'Taurus',
        munthaHouse: 2,
        yearLord: Planet.Sun,
        chart: { varga: `D1-A-${year}`, points: [] },
        yogas: [],
        sahams: [],
        muddaDashas: [],
        predictions: {
          overall: 'A year characterized by significant professional visibility and internal growth.',
          career: 'Expect recognition for past efforts in the second quarter.',
          relationships: 'Stabilization of personal bonds.',
          finance: 'Consistent gains through multiple streams.',
          health: 'Generally robust health.',
        },
      };
    }
  },
};
