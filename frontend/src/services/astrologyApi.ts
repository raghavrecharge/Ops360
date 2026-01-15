/**
 * AstrologyApi - Backend API integration service
 * Connects to FastAPI backend endpoints
 */

import { 
  DivisionalChart, 
  DashaNode, 
  YogaMatch, 
  TransitContext, 
  PlannerData, 
  ShadbalaData, 
  Remedy, 
  KBChunk, 
  ChatMessage,
  PanchangData,
  Planet,
  Sign
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || process.env.REACT_APP_BACKEND_URL || '';

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper for API requests with auth
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

// Chart Bundle type
export interface ChartBundle {
  d1: DivisionalChart;
  d9?: DivisionalChart;
  d10?: DivisionalChart;
}

// Ashtakavarga Data type
export interface AshtakavargaData {
  planetScores: Record<string, number[]>;
  sarvashtaka: number[];
  total: number;
}

// Varshaphala Data type
export interface VarshaphalaData {
  year: number;
  age: number;
  muntha: { sign: Sign; house: number; signName: string };
  yearLord: Planet;
  chart: DivisionalChart;
  predictions: Array<{
    house: number;
    area: string;
    prediction: string;
    strength: 'Strong' | 'Moderate' | 'Weak';
  }>;
}

// API Methods
export const astrologyApi = {
  // Chart endpoints
  async getChartBundle(profileId: number): Promise<ChartBundle> {
    const data = await apiRequest(`/api/charts/${profileId}`);
    return transformChartData(data);
  },

  // Dasha endpoints
  async getDashas(profileId: number): Promise<DashaNode[]> {
    const data = await apiRequest(`/api/dashas/${profileId}`);
    return transformDashaData(data);
  },

  // Yoga endpoints
  async getYogas(profileId: number): Promise<YogaMatch[]> {
    const data = await apiRequest(`/api/yogas/${profileId}`);
    return transformYogaData(data);
  },

  // Today/Transit data
  async getTodayData(profileId: number): Promise<TransitContext> {
    // Try new API first, fallback to align27
    try {
      const summary = await apiRequest(`/api/today/summary?profile_id=${profileId}`);
      const panchang = await apiRequest('/api/panchang/today');
      return transformTodayData(summary, panchang);
    } catch {
      const data = await apiRequest(`/api/align27/${profileId}/today`);
      return transformAlign27Data(data);
    }
  },

  // Planner data
  async getPlannerData(profileId: number): Promise<PlannerData> {
    try {
      const data = await apiRequest(`/api/calendar/planner?profile_id=${profileId}`);
      return transformPlannerData(data);
    } catch {
      const data = await apiRequest(`/api/align27/${profileId}/planner`);
      return transformPlannerFromAlign27(data);
    }
  },

  // Shadbala/Strength
  async getShadbala(profileId: number): Promise<ShadbalaData[]> {
    const data = await apiRequest(`/api/strength/${profileId}`);
    return transformShadbalaData(data);
  },

  // Remedies
  async getRemedies(profileId: number): Promise<Remedy[]> {
    const data = await apiRequest(`/api/remedies/${profileId}`);
    return transformRemedyData(data);
  },

  // Ashtakavarga
  async getAshtakavarga(profileId: number): Promise<AshtakavargaData> {
    const data = await apiRequest(`/api/ashtakavarga/${profileId}`);
    return data;
  },

  // Varshaphala
  async getVarshaphala(profileId: number, year: number): Promise<VarshaphalaData> {
    const data = await apiRequest(`/api/varshaphala/${profileId}?year=${year}`);
    return data;
  },

  // Knowledge Base search
  async searchKnowledge(query: string): Promise<KBChunk[]> {
    const data = await apiRequest('/api/kb/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return transformKBData(data);
  },

  // Chat
  async sendChatMessage(profileId: number, message: string): Promise<ChatMessage> {
    const data = await apiRequest('/api/chat/ask', {
      method: 'POST',
      body: JSON.stringify({ 
        profile_id: profileId, 
        message 
      }),
    });
    return {
      role: 'assistant',
      content: data.response || data.answer || data.message || 'No response received',
    };
  },

  // Calendar
  async getMonthlyCalendar(year: number, month: number): Promise<any> {
    return apiRequest(`/api/calendar/month/${year}/${month}`);
  },

  // Panchang
  async getPanchang(date?: string): Promise<PanchangData> {
    const endpoint = date ? `/api/panchang/date/${date}` : '/api/panchang/today';
    const data = await apiRequest(endpoint);
    return transformPanchangData(data);
  },
};

// Data transformation helpers
function transformChartData(data: any): ChartBundle {
  const transformChart = (chartData: any): DivisionalChart => ({
    varga: chartData.varga || 'D1',
    points: (chartData.points || chartData.planets || []).map((p: any) => ({
      planet: p.planet || p.name,
      sign: p.sign || p.sign_num,
      degree: p.degree || 0,
      house: p.house || 1,
      isRetrograde: p.is_retrograde || p.retrograde || false,
      nakshatra: p.nakshatra,
      pada: p.pada,
      dignity: p.dignity,
    })),
  });

  return {
    d1: transformChart(data.d1 || data),
    d9: data.d9 ? transformChart(data.d9) : undefined,
    d10: data.d10 ? transformChart(data.d10) : undefined,
  };
}

function transformDashaData(data: any): DashaNode[] {
  const transformNode = (node: any, level: number = 1): DashaNode => ({
    id: node.id || `dasha-${node.planet}-${node.start}`,
    planet: node.planet,
    start: node.start || node.start_date,
    end: node.end || node.end_date,
    level,
    children: node.children?.map((c: any) => transformNode(c, level + 1)),
  });

  return (data.dashas || data || []).map((d: any) => transformNode(d));
}

function transformYogaData(data: any): YogaMatch[] {
  return (data.yogas || data || []).map((y: any) => ({
    name: y.name,
    description: y.description || '',
    rule: y.rule || '',
    interpretation: y.interpretation || y.description || '',
    strength: y.strength || 50,
    category: y.category || 'General',
  }));
}

function transformTodayData(summary: any, panchang: any): TransitContext {
  return {
    panchang: transformPanchangData(panchang),
    transits: {
      varga: 'Transit',
      points: (summary.transits || []).map((t: any) => ({
        planet: t.planet as Planet,
        sign: t.sign_num || 1,
        degree: t.degree || 0,
        house: t.house || t.sign_num || 1,
        isRetrograde: t.is_retrograde || false,
        nakshatra: t.nakshatra,
        pada: t.pada,
      })),
    },
    horaLord: summary.hora_lord || Planet.Sun,
    isAuspicious: summary.is_auspicious ?? true,
  };
}

function transformAlign27Data(data: any): TransitContext {
  return {
    panchang: {
      tithi: data.panchang?.tithi || 'Pratipada',
      tithiNumber: data.panchang?.tithi_number || 1,
      vara: data.panchang?.vara || 'Sunday',
      dayLord: data.panchang?.day_lord || Planet.Sun,
      nakshatra: data.panchang?.nakshatra || 'Ashwini',
      yoga: data.panchang?.yoga || 'Vishkumbha',
      karana: data.panchang?.karana || 'Bava',
      sunrise: data.panchang?.sunrise || '06:00 AM',
      sunset: data.panchang?.sunset || '06:00 PM',
      moonPhase: data.panchang?.moon_phase === 'Waning' ? 'Waning' : 'Waxing',
    },
    transits: {
      varga: 'Transit',
      points: (data.transits || []).map((t: any) => ({
        planet: t.planet as Planet,
        sign: t.sign || 1,
        degree: t.degree || 0,
        house: t.house || 1,
        isRetrograde: t.is_retrograde || false,
        nakshatra: t.nakshatra,
        pada: t.pada,
      })),
    },
    horaLord: data.hora_lord || Planet.Sun,
    isAuspicious: data.is_auspicious ?? true,
  };
}

function transformPanchangData(data: any): PanchangData {
  return {
    tithi: data.tithi || 'Pratipada',
    tithiNumber: data.tithi_number || 1,
    vara: data.vara || 'Sunday',
    dayLord: (data.day_lord || 'Sun') as Planet,
    nakshatra: data.nakshatra || 'Ashwini',
    yoga: data.yoga || 'Vishkumbha',
    karana: data.karana || 'Bava',
    sunrise: data.sunrise || '06:00 AM',
    sunset: data.sunset || '06:00 PM',
    moonPhase: data.moon_phase === 'Waning' ? 'Waning' : 'Waxing',
  };
}

function transformPlannerData(data: any): PlannerData {
  return {
    activities: (data.activities || []).map((a: any) => ({
      category: a.category || a.name,
      score: a.score || 50,
      status: a.status || 'Neutral',
      advice: a.advice || '',
    })),
    schedule: (data.schedule || []).map((s: any) => ({
      time: s.time || s.best_moment || '',
      title: s.title || s.name || '',
      category: s.category || 'Neutral',
      description: s.description || '',
      score: s.score || 50,
    })),
    daySummary: data.day_summary || data.daySummary || '',
  };
}

function transformPlannerFromAlign27(data: any): PlannerData {
  return {
    activities: (data.activities || []).map((a: any) => ({
      category: a.category,
      score: a.score,
      status: a.status,
      advice: a.advice,
    })),
    schedule: (data.moments || []).map((m: any) => ({
      time: m.start,
      title: m.type,
      category: m.type === 'Golden' ? 'Auspicious' : m.type === 'Silence' ? 'Warning' : 'Neutral',
      description: m.reason,
      score: m.score,
    })),
    daySummary: data.summary || '',
  };
}

function transformShadbalaData(data: any): ShadbalaData[] {
  return (data.planets || data || []).map((p: any) => ({
    planet: p.planet as Planet,
    total: p.total || 0,
    percentage: p.percentage || 0,
    sthana: p.sthana || p.positional || 0,
    dig: p.dig || p.directional || 0,
    kala: p.kala || p.temporal || 0,
    cesta: p.cesta || p.motional || 0,
    naisargika: p.naisargika || p.natural || 0,
    drig: p.drig || p.aspectual || 0,
    baladi: p.baladi || 'Bala',
    jagradadi: p.jagradadi || 'Jagrat',
    deeptadi: p.deeptadi || 'Deepta',
  }));
}

function transformRemedyData(data: any): Remedy[] {
  return (data.remedies || data || []).map((r: any) => ({
    type: r.type || 'Mantra',
    planet: r.planet as Planet,
    title: r.title || r.name || '',
    description: r.description || '',
    benefit: r.benefit || '',
    metal: r.metal,
    finger: r.finger,
    count: r.count,
    day: r.day,
    avoid: r.avoid,
    mantraText: r.mantra_text || r.mantraText,
    mantraDeity: r.mantra_deity || r.mantraDeity,
    color: r.color,
  }));
}

function transformKBData(data: any): KBChunk[] {
  return (data.results || data.chunks || data || []).map((k: any) => ({
    id: k.id || `kb-${Math.random()}`,
    category: k.category || 'Concepts',
    title: k.title || '',
    summary: k.summary || k.excerpt || '',
    content: k.content || k.text || '',
    difficulty: k.difficulty || 'Beginner',
    tags: k.tags || [],
    readTime: k.read_time || k.readTime || '5 min',
  }));
}

export default astrologyApi;
