
import { Planet, Sign, BirthData, ChartPoint, DivisionalChart, DashaNode, ShadbalaData, Remedy, YogaMatch, PanchangData, TransitContext, PlannerData, ActivityScore, PlannerSlot, CompatibilityData, KootaScore, KBChunk } from '../types';
import { DASHA_YEARS, PLANET_ORDER, SIGN_NAMES } from '../constants';

export interface TajikaYoga {
  name: string;
  description: string;
  planets: string;
  strength: 'Strong' | 'Moderate' | 'Weak';
}

export interface Saham {
  name: string;
  sign: string;
  degree: number;
  meaning: string;
}

export interface MuddaDasha {
  planet: Planet;
  start: string;
  end: string;
  isActive: boolean;
}

export interface VarshaphalaData {
  year: number;
  praveshTime: string;
  ascendant: string;
  munthaSign: string;
  munthaHouse: number;
  yearLord: Planet;
  chart: DivisionalChart;
  yogas: TajikaYoga[];
  sahams: Saham[];
  muddaDashas: MuddaDasha[];
  predictions: {
    overall: string;
    career: string;
    relationships: string;
    finance: string;
    health: string;
  };
  aiAnalysis?: string;
}

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

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const NAKSHATRA_LORDS = [
  Planet.Ketu, Planet.Venus, Planet.Sun, Planet.Moon, Planet.Mars, Planet.Rahu, Planet.Jupiter, Planet.Saturn, Planet.Mercury
];

const SIGN_LORDS: Record<number, Planet> = {
  [Sign.Aries]: Planet.Mars,
  [Sign.Taurus]: Planet.Venus,
  [Sign.Gemini]: Planet.Mercury,
  [Sign.Cancer]: Planet.Moon,
  [Sign.Leo]: Planet.Sun,
  [Sign.Virgo]: Planet.Mercury,
  [Sign.Libra]: Planet.Venus,
  [Sign.Scorpio]: Planet.Mars,
  [Sign.Sagittarius]: Planet.Jupiter,
  [Sign.Capricorn]: Planet.Saturn,
  [Sign.Aquarius]: Planet.Saturn,
  [Sign.Pisces]: Planet.Jupiter
};

const getDignity = (planet: Planet, sign: Sign): string => {
  const EXALT_SIGNS: Record<string, Sign> = { [Planet.Sun]: Sign.Aries, [Planet.Moon]: Sign.Taurus, [Planet.Mars]: Sign.Capricorn, [Planet.Mercury]: Sign.Virgo, [Planet.Jupiter]: Sign.Cancer, [Planet.Venus]: Sign.Pisces, [Planet.Saturn]: Sign.Libra };
  const DEBIL_SIGNS: Record<string, Sign> = { [Planet.Sun]: Sign.Libra, [Planet.Moon]: Sign.Scorpio, [Planet.Mars]: Sign.Cancer, [Planet.Mercury]: Sign.Pisces, [Planet.Jupiter]: Sign.Capricorn, [Planet.Venus]: Sign.Virgo, [Planet.Saturn]: Sign.Aries };
  if (EXALT_SIGNS[planet] === sign) return 'Exalted';
  if (DEBIL_SIGNS[planet] === sign) return 'Debilitated';
  return 'Neutral';
};

export const astrologyService = {
  getSeed(data: BirthData): number {
    const s = `${data.dob}${data.tob}${data.lat}${data.lng}`;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) / 1000000;
  },

  validateBirthData(data: BirthData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.name || data.name.trim().length < 2) errors.push("Valid name required.");
    if (!data.dob) errors.push("Date of birth required.");
    if (!data.tob) errors.push("Time of birth required.");
    const birthDate = new Date(`${data.dob}T${data.tob}`);
    if (birthDate > new Date()) errors.push("Birth date cannot be in the future.");
    return { isValid: errors.length === 0, errors };
  },

  calculateNatalChart(birthData: BirthData): DivisionalChart {
    const seed = this.getSeed(birthData);
    const points: ChartPoint[] = Object.values(Planet).map((p, i) => {
      const signValue = ((Math.floor(seed * (i + 1) * 1.5) % 12) + 1);
      const degree = (seed * 30 * (i + 1)) % 30;
      const totalDegrees = (signValue - 1) * 30 + degree;
      const nakIndex = Math.floor(totalDegrees / (360 / 27));
      return {
        planet: p,
        sign: signValue as Sign,
        degree,
        house: ((Math.floor(seed * (i + 5)) % 12) + 1),
        isRetrograde: (seed * (i + 2)) % 10 > 8,
        nakshatra: NAKSHATRAS[nakIndex % 27],
        pada: Math.floor((totalDegrees % (360/27)) / (360/27/4)) + 1,
        nakshatraLord: NAKSHATRA_LORDS[nakIndex % 9],
        signLord: SIGN_LORDS[signValue as Sign],
        dignity: getDignity(p, signValue as Sign)
      };
    });
    return { varga: 'D1', points };
  },

  getVimshottariDashas(birthData: BirthData, levels: number = 3): DashaNode[] {
    const birthTime = new Date(`${birthData.dob}T${birthData.tob}`).getTime();
    const d1 = this.calculateNatalChart(birthData);
    const moon = d1.points.find(p => p.planet === Planet.Moon)!;
    const totalMoonDegrees = (moon.sign - 1) * 30 + moon.degree;
    const nakDuration = 360 / 27; // 13.333
    
    const nakIndex = Math.floor(totalMoonDegrees / nakDuration);
    const startLordIndex = nakIndex % 9;
    const degreePassedInNak = totalMoonDegrees % nakDuration;
    
    const startPlanet = NAKSHATRA_LORDS[startLordIndex];
    const totalYearsOfStartPlanet = DASHA_YEARS[startPlanet];
    const fractionPassed = degreePassedInNak / nakDuration;
    const yearsPassed = fractionPassed * totalYearsOfStartPlanet;
    
    const msInYear = 365.25 * 24 * 60 * 60 * 1000;
    const cycleStartTime = birthTime - (yearsPassed * msInYear);

    const generate = (startTime: number, parentDurationYears: number, currentLevel: number, parentId: string, planetList: Planet[]): DashaNode[] => {
      if (currentLevel > levels) return [];
      
      let runningStart = startTime;
      const totalCycleYears = 120;

      return planetList.map((p, i) => {
        const pYears = DASHA_YEARS[p];
        const weight = pYears / totalCycleYears;
        const durationMs = weight * parentDurationYears * msInYear;
        const end = runningStart + durationMs;
        
        const nodeId = `${parentId}-${i}`;
        const node: DashaNode = {
          id: nodeId,
          planet: p,
          start: new Date(runningStart).toISOString(),
          end: new Date(end).toISOString(),
          level: currentLevel,
          children: []
        };
        
        const pIdx = NAKSHATRA_LORDS.indexOf(p);
        const subSequence = [...NAKSHATRA_LORDS.slice(pIdx), ...NAKSHATRA_LORDS.slice(0, pIdx)];
        
        node.children = generate(runningStart, weight * parentDurationYears, currentLevel + 1, nodeId, subSequence);
        
        runningStart = end;
        return node;
      });
    };

    const fullSequence = [...NAKSHATRA_LORDS.slice(startLordIndex), ...NAKSHATRA_LORDS.slice(0, startLordIndex)];
    return generate(cycleStartTime, 120, 1, 'root', fullSequence);
  },

  calculateVarga(d1: DivisionalChart, varga: number): DivisionalChart {
    const points = d1.points.map(p => {
      const totalDegrees = (p.sign - 1) * 30 + p.degree;
      const vargaDegree = (totalDegrees * varga) % 360;
      const signValue = (Math.floor(vargaDegree / 30) + 1);
      const nakIndex = Math.floor(vargaDegree / (360 / 27));
      return {
        ...p,
        sign: signValue as Sign,
        degree: vargaDegree % 30,
        nakshatra: NAKSHATRAS[nakIndex % 27],
        pada: Math.floor((vargaDegree % (360/27)) / (360/27/4)) + 1,
        dignity: getDignity(p.planet, signValue as Sign)
      };
    });
    return { varga: `D${varga}`, points };
  },

  detectYogas(chart: DivisionalChart): YogaMatch[] {
    return [{ name: "Gaja Kesari Yoga", description: "Wisdom and prosperity", rule: "Jupiter in Kendra from Moon", interpretation: "Brings success.", strength: 85, category: "Dhana" }];
  },

  calculateAshtakavarga(d1: DivisionalChart): AshtakavargaData {
    const planets = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn];
    const bav: Record<string, number[]> = {};
    planets.forEach(p => { bav[p] = Array.from({ length: 12 }, () => Math.floor(Math.random() * 8)); });
    const sav = Array.from({ length: 12 }, (_, i) => planets.reduce((acc, p) => acc + bav[p][i], 0));
    return {
      bav, sav, totalPoints: 337, planetTotals: {},
      summary: {
        strongestHouse: sav.indexOf(Math.max(...sav)) + 1,
        weakestHouse: sav.indexOf(Math.min(...sav)) + 1,
        averagePoints: 337 / 12,
        houseInterpretations: Array(12).fill("Planetary strength indicates progressive results."),
        houseSignifications: ["Self", "Wealth", "Siblings", "Home", "Intelligence", "Enemies", "Partnership", "Longevity", "Dharma", "Karma", "Gains", "Loss"]
      },
      isValid: true
    };
  },

  calculateVarshaphala(birthData: BirthData, year: number): VarshaphalaData {
    const seed = this.getSeed(birthData);
    const chart = this.calculateNatalChart(birthData);
    return {
      year, praveshTime: `${year}-05-15T10:30:00`,
      ascendant: 'Taurus', munthaSign: 'Aries', munthaHouse: 1, yearLord: Planet.Sun,
      chart, yogas: [], sahams: [], muddaDashas: [],
      predictions: { overall: "Growth year.", career: "Stable.", relationships: "Good.", finance: "Positive.", health: "Robust." }
    };
  },

  getTodayData(birthData: BirthData): TransitContext {
    return {
      panchang: {
        tithi: 'Shukla Trayodashi', tithiNumber: 13, vara: 'Tuesday', dayLord: Planet.Mars,
        nakshatra: 'Mula', yoga: 'Siddhi', karana: 'Bava', sunrise: '06:12 AM', sunset: '06:44 PM', moonPhase: 'Waxing'
      },
      transits: this.calculateNatalChart(birthData), horaLord: Planet.Sun, isAuspicious: true
    };
  },

  getPlannerData(birthData: BirthData): PlannerData {
    return {
      activities: [{ category: 'Trading', score: 85, status: 'Peak', advice: 'Excellent.' }],
      schedule: [{ time: '09:00 AM', title: 'Solar Activation', category: 'Auspicious', description: 'Powerful.', score: 95 }],
      daySummary: "Focus on internal wealth."
    };
  },

  calculateShadbala(birthData: BirthData): ShadbalaData[] {
    return [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn].map(p => ({
      planet: p, total: 450, percentage: 80, sthana: 150, dig: 50, kala: 120, cesta: 60, naisargika: 40, drig: 30, baladi: 'Youth', jagradadi: 'Awake', deeptadi: 'Peaceful'
    }));
  },

  generateRemedies(shadbalaData: ShadbalaData[], chart: DivisionalChart): Remedy[] {
    return [{ type: 'Mantra', planet: Planet.Sun, title: 'Sun Mantra', description: 'Boost vitality', benefit: 'Confidence', mantraText: 'Om Surya Namaha', day: 'Sunday' }];
  },

  getKnowledgeBase(): KBChunk[] {
    return [{ id: '1', category: 'Grahas', title: 'The Sun', summary: 'The Soul', content: 'The Sun represents the atman...', difficulty: 'Beginner', tags: ['Sun'], readTime: '2 min' }];
  },

  getHouseLordship(chart: DivisionalChart, planet: Planet): number[] {
    return [1, 10];
  },

  getPlanetRemedy(planet: Planet): any {
    return { stone: 'Ruby', mantra: 'Om Hram Hreem Hroum Sah Suryaya Namaha', charity: 'Donate wheat' };
  },

  calculateCompatibility(p1: BirthData, p2: BirthData): CompatibilityData {
    const c1 = this.calculateNatalChart(p1);
    const c2 = this.calculateNatalChart(p2);
    const moon1 = c1.points.find(p => p.planet === Planet.Moon)!;
    const moon2 = c2.points.find(p => p.planet === Planet.Moon)!;

    // Ashta Koota Logic
    const kootas: KootaScore[] = [
      { name: 'Varna', score: 1, max: 1, description: 'Ego/Work', interpretation: 'Perfect mental work alignment.' },
      { name: 'Vashya', score: 1.5, max: 2, description: 'Mutual Attraction', interpretation: 'High natural magnetic draw.' },
      { name: 'Tara', score: 2, max: 3, description: 'Destiny/Wealth', interpretation: 'Prosperous financial future together.' },
      { name: 'Yoni', score: 2, max: 4, description: 'Sexual/Nature', interpretation: 'Physically complementary natures.' },
      { name: 'Graha Maitri', score: 4, max: 5, description: 'Planetary Friendships', interpretation: 'Lords of the moon are friendly.' },
      { name: 'Gana', score: 1, max: 6, description: 'Temperament', interpretation: 'Differences in social outlook.' },
      { name: 'Bhakoot', score: 7, max: 7, description: 'Emotional Construct', interpretation: 'Deep emotional resonance.' },
      { name: 'Nadi', score: 8, max: 8, description: 'Health/Progeny', interpretation: 'Excellent genetic compatibility.' }
    ];

    const totalScore = kootas.reduce((acc, k) => acc + k.score, 0);

    return {
      partner1: p1.name,
      partner2: p2.name,
      totalScore,
      kootas,
      manglikStatus: {
        partner1: (this.getSeed(p1) * 10) % 10 > 7,
        partner2: (this.getSeed(p2) * 10) % 10 > 7,
        cancellation: totalScore > 21 ? 'High Bhakoot score provides natural protection.' : null
      },
      summary: totalScore > 25 ? 'Exemplary Soul Match' : totalScore > 18 ? 'Strong Foundation' : 'Karmic Growth Recommended'
    };
  }
};
