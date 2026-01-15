

export enum Planet {
  Sun = 'Sun',
  Moon = 'Moon',
  Mars = 'Mars',
  Mercury = 'Mercury',
  Jupiter = 'Jupiter',
  Venus = 'Venus',
  Saturn = 'Saturn',
  Rahu = 'Rahu',
  Ketu = 'Ketu',
  Lagna = 'Lagna'
}

export enum Sign {
  Aries = 1, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces
}

export interface BirthData {
  name: string;
  dob: string;
  tob: string;
  lat: number;
  lng: number;
  tz: string;
  isVerified?: boolean;
}

export interface ChartPoint {
  planet: Planet;
  sign: Sign;
  degree: number;
  house: number;
  isRetrograde: boolean;
  nakshatra?: string;
  pada?: number;
  nakshatraLord?: Planet;
  padaLord?: Planet;
  signLord?: Planet;
  nakshatraDegree?: number;
  nakshatraSymbol?: string;
  nakshatraDeity?: string;
  dignity?: string;
}

export interface DivisionalChart {
  varga: string; // D1, D9, D10 etc
  points: ChartPoint[];
}

export interface DashaNode {
  id: string;
  planet: Planet;
  start: string;
  end: string;
  level: number;
  children?: DashaNode[];
}

export interface Align27Moment {
  id: string;
  type: 'Golden' | 'Productive' | 'Silence';
  start: string;
  end: string;
  reason: string;
  score: number;
}

export interface YogaMatch {
  name: string;
  description: string;
  rule: string;
  interpretation: string;
  strength: number;
  category: string;
}

export interface ShadbalaData {
  planet: Planet;
  total: number;
  percentage: number;
  sthana: number;   // Positional
  dig: number;      // Directional
  kala: number;     // Temporal
  cesta: number;    // Motional
  naisargika: number; // Natural
  drig: number;      // Aspectual
  baladi: string;
  jagradadi: string;
  deeptadi: string;
}

export interface KootaScore {
  name: string;
  score: number;
  max: number;
  description: string;
  interpretation: string;
}

export interface CompatibilityData {
  partner1: string;
  partner2: string;
  totalScore: number;
  kootas: KootaScore[];
  manglikStatus: {
    partner1: boolean;
    partner2: boolean;
    cancellation: string | null;
  };
  summary: string;
}

export interface Remedy {
  type: 'Gemstone' | 'Mantra' | 'Charity' | 'Fasting';
  planet: Planet;
  title: string;
  description: string;
  benefit: string;
  metal?: string;
  finger?: string;
  count?: number;
  day?: string;
  avoid?: string;
  mantraText?: string;
  mantraDeity?: string;
  color?: string;
}

export interface KBChunk {
  id: string;
  category: 'Grahas' | 'Bhavas' | 'Nakshatras' | 'Concepts' | 'Advanced';
  title: string;
  summary: string;
  content: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  readTime: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: KBChunk[];
  astroContext?: any;
}

export interface UserAccount {
  email: string;
  username: string;
  joinedDate: string;
  avatar?: string;
}

// Added missing LoginCredentials interface
export interface LoginCredentials {
  email: string;
  username?: string;
  password?: string;
}

export interface UserProfile {
  id: string;
  account: UserAccount;
  birthData: BirthData;
  preferences: {
    ayanamsa: string;
    chartStyle: 'North' | 'South';
  };
  isVerified: boolean;
}

export interface PanchangData {
  tithi: string;
  tithiNumber: number;
  vara: string;
  dayLord: Planet;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  moonPhase: 'Waxing' | 'Waning';
}

export interface TransitContext {
  panchang: PanchangData;
  transits: DivisionalChart;
  horaLord: Planet;
  isAuspicious: boolean;
}

export interface ActivityScore {
  category: string;
  score: number;
  status: 'Peak' | 'Neutral' | 'Low';
  advice: string;
}

export interface PlannerSlot {
  time: string;
  title: string;
  category: 'Auspicious' | 'Neutral' | 'Warning';
  description: string;
  score: number;
}

export interface PlannerData {
  activities: ActivityScore[];
  schedule: PlannerSlot[];
  daySummary: string;
}

export interface ServiceStatus {
  astrologyEngine: 'Operational' | 'Error' | 'Initializing';
  aiInterpretation: 'Operational' | 'Rate Limited' | 'Error' | 'Initializing';
  dataIntegrity: 'Verified' | 'Unverified' | 'Compromised';
}
