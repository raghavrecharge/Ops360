// Legacy astrology service - now acts as a facade to the API
// This file provides backward compatibility with the original frontend code
// while delegating to the API service for actual data

import { Planet, Sign, BirthData, ChartPoint, DivisionalChart, DashaNode, ShadbalaData, Remedy, YogaMatch, PanchangData, TransitContext, PlannerData, CompatibilityData, KBChunk } from '../types';
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

const EXALT_SIGNS: Record<string, Sign> = {
  [Planet.Sun]: Sign.Aries,
  [Planet.Moon]: Sign.Taurus,
  [Planet.Mars]: Sign.Capricorn,
  [Planet.Mercury]: Sign.Virgo,
  [Planet.Jupiter]: Sign.Cancer,
  [Planet.Venus]: Sign.Pisces,
  [Planet.Saturn]: Sign.Libra,
};

const DEBIL_SIGNS: Record<string, Sign> = {
  [Planet.Sun]: Sign.Libra,
  [Planet.Moon]: Sign.Scorpio,
  [Planet.Mars]: Sign.Cancer,
  [Planet.Mercury]: Sign.Pisces,
  [Planet.Jupiter]: Sign.Capricorn,
  [Planet.Venus]: Sign.Virgo,
  [Planet.Saturn]: Sign.Aries,
};

const OWN_SIGNS: Record<string, Sign[]> = {
  [Planet.Sun]: [Sign.Leo],
  [Planet.Moon]: [Sign.Cancer],
  [Planet.Mars]: [Sign.Aries, Sign.Scorpio],
  [Planet.Mercury]: [Sign.Gemini, Sign.Virgo],
  [Planet.Jupiter]: [Sign.Sagittarius, Sign.Pisces],
  [Planet.Venus]: [Sign.Taurus, Sign.Libra],
  [Planet.Saturn]: [Sign.Capricorn, Sign.Aquarius],
};

const getDignity = (planet: Planet, sign: Sign): string => {
  if (EXALT_SIGNS[planet] === sign) return 'Exalted';
  if (DEBIL_SIGNS[planet] === sign) return 'Debilitated';
  if (OWN_SIGNS[planet]?.includes(sign)) return 'Own Sign';
  return 'Neutral';
};

export const PLANET_REMEDY_MAP: Record<string, any> = {
  [Planet.Sun]: {
    stone: 'Ruby (Manik)',
    mantra: 'Om Hram Hreem Hroum Sah Suryaya Namaha',
    charity: 'Donate wheat or jaggery on Sundays',
    deity: 'Lord Rama / Surya Narayana',
    benefit: 'Confidence, Vitality, Leadership',
    color: '#ef4444',
  },
  [Planet.Moon]: {
    stone: 'Pearl (Moti)',
    mantra: 'Om Shram Shreem Shroum Sah Chandraya Namaha',
    charity: 'Donate rice or milk on Mondays',
    deity: 'Lord Shiva / Gauri',
    benefit: 'Peace of mind, Emotional balance',
    color: '#94a3b8',
  },
  [Planet.Mars]: {
    stone: 'Red Coral (Moonga)',
    mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namaha',
    charity: 'Donate red lentils on Tuesdays',
    deity: 'Lord Hanuman',
    benefit: 'Courage, Energy, Technical Skill',
    color: '#dc2626',
  },
  [Planet.Mercury]: {
    stone: 'Emerald (Panna)',
    mantra: 'Om Bram Breem Broum Sah Budhaya Namaha',
    charity: 'Donate green vegetables on Wednesdays',
    deity: 'Lord Vishnu',
    benefit: 'Communication, Intelligence, Business',
    color: '#10b981',
  },
  [Planet.Jupiter]: {
    stone: 'Yellow Sapphire (Pukhraj)',
    mantra: 'Om Gram Greem Groum Sah Gurave Namaha',
    charity: 'Donate chana dal on Thursdays',
    deity: 'Lord Brahma',
    benefit: 'Wisdom, Prosperity, Spirituality',
    color: '#eab308',
  },
  [Planet.Venus]: {
    stone: 'Diamond / White Sapphire',
    mantra: 'Om Dram Dreem Droum Sah Shukraya Namaha',
    charity: 'Donate curd or white clothes on Fridays',
    deity: 'Goddess Lakshmi',
    benefit: 'Luxury, Relationships, Arts',
    color: '#ec4899',
  },
  [Planet.Saturn]: {
    stone: 'Blue Sapphire (Neelam)',
    mantra: 'Om Pram Preem Proum Sah Shanaye Namaha',
    charity: 'Donate black til or oil on Saturdays',
    deity: 'Lord Shani',
    benefit: 'Discipline, Longevity, Focus',
    color: '#1e1b4b',
  }
};

// This service now provides local calculations as fallback
// The main App should use astrologyApi for backend calls
export const astrologyService = {
  validateBirthData(data: BirthData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.name || data.name.trim().length < 2) errors.push("Valid name required.");
    if (!data.dob) errors.push("Date of birth required.");
    if (!data.tob) errors.push("Time of birth required.");
    if (data.lat < -90 || data.lat > 90) errors.push("Latitude must be between -90 and 90.");
    if (data.lng < -180 || data.lng > 180) errors.push("Longitude must be between -180 and 180.");
    const birthDate = new Date(`${data.dob}T${data.tob}`);
    if (birthDate > new Date()) errors.push("Birth date cannot be in the future.");
    return { isValid: errors.length === 0, errors };
  },

  calculateNatalChart(birthData: BirthData): DivisionalChart {
    return this.calculateChartBySeed(this.getSeed(birthData), 'D1');
  },

  calculateChartBySeed(seed: number, vargaName: string): DivisionalChart {
    const points: ChartPoint[] = Object.values(Planet).map((p, i) => {
      if (p === Planet.Lagna) {
        const signValue = ((Math.floor(seed * 1.5) % 12) + 1);
        const degree = (seed * 30) % 30;
        return {
          planet: p,
          sign: signValue as Sign,
          degree,
          house: 1,
          isRetrograde: false,
          nakshatra: NAKSHATRAS[Math.floor(((signValue - 1) * 30 + degree) / (360/27))],
          pada: Math.floor((((signValue - 1) * 30 + degree) % (360/27)) / (360/27/4)) + 1,
          signLord: SIGN_LORDS[signValue as Sign]
        };
      }
      const signValue = ((Math.floor(seed * (i + 1) * 1.5) % 12) + 1);
      const degree = (seed * 30 * (i + 1)) % 30;
      const totalDegrees = (signValue - 1) * 30 + degree;
      const nakIndex = Math.floor(totalDegrees / (360 / 27));
      const nakshatraLord = NAKSHATRA_LORDS[nakIndex % 9];
      const signLord = SIGN_LORDS[signValue as Sign];

      return {
        planet: p,
        sign: signValue as Sign,
        degree,
        house: ((Math.floor(seed * (i + 5)) % 12) + 1),
        isRetrograde: (seed * (i + 2)) % 10 > 8,
        nakshatra: NAKSHATRAS[nakIndex % 27],
        pada: Math.floor((totalDegrees % (360/27)) / (360/27/4)) + 1,
        nakshatraLord,
        signLord,
        dignity: getDignity(p, signValue as Sign)
      };
    });
    return { varga: vargaName, points };
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
        dignity: getDignity(p.planet, signValue as Sign)
      };
    });
    return { varga: `D${varga}`, points };
  },

  detectYogas(chart: DivisionalChart): YogaMatch[] {
    const yogas: YogaMatch[] = [];
    const points = chart.points;
    const find = (p: Planet) => points.find(pt => pt.planet === p)!;
    const house = (p: Planet) => find(p)?.house || 1;
    const isKendra = (h: number) => [1, 4, 7, 10].includes(h);

    // Gajakesari Yoga
    if (Math.abs(house(Planet.Jupiter) - house(Planet.Moon)) % 3 === 0 && isKendra(house(Planet.Jupiter))) {
      yogas.push({
        name: "Gaja Kesari Yoga",
        description: "Jupiter and Moon in mutual kendra",
        rule: "Jupiter in a Kendra from the Moon",
        interpretation: "Brings great prosperity, wisdom, and reputation.",
        strength: 90,
        category: "Dhana"
      });
    }

    // Malavya Yoga
    const venus = find(Planet.Venus);
    if (venus && isKendra(venus.house) && (venus.dignity === 'Exalted' || venus.dignity === 'Own Sign')) {
      yogas.push({
        name: "Malavya Yoga",
        description: "Venus Mahapurusha Yoga",
        rule: "Venus in Kendra in own/exalted sign",
        interpretation: "Life of luxury, artistic talent.",
        strength: 95,
        category: "Mahapurusha"
      });
    }

    return yogas;
  },

  getVimshottariDashas(birthData: BirthData, levels: number = 3): DashaNode[] {
    const seed = this.getSeed(birthData);
    const birthTime = new Date(`${birthData.dob}T${birthData.tob}`).getTime();
    
    const generateLevel = (parentStart: number, totalYears: number, currentLevel: number, parentId: string): DashaNode[] => {
      if (currentLevel > levels) return [];
      let currentStart = parentStart;
      return PLANET_ORDER.map((planet, idx) => {
        const duration = (DASHA_YEARS[planet] / 120) * totalYears;
        const node: DashaNode = {
          id: `${parentId}-${idx}`,
          planet,
          start: new Date(currentStart).toISOString(),
          end: new Date(currentStart + duration).toISOString(),
          level: currentLevel,
          children: generateLevel(currentStart, duration, currentLevel + 1, `${parentId}-${idx}`)
        };
        currentStart += duration;
        return node;
      });
    };

    const fullCycle = 120 * 365.25 * 24 * 60 * 60 * 1000;
    const startOffset = (seed % 1) * fullCycle;
    return generateLevel(birthTime - startOffset, fullCycle, 1, 'root');
  },

  calculateAshtakavarga(d1: DivisionalChart): AshtakavargaData {
    const planets = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn];
    const bav: Record<string, number[]> = {};
    planets.forEach(p => {
      bav[p] = Array.from({ length: 12 }, () => Math.floor(Math.random() * 8));
    });
    const sav = Array.from({ length: 12 }, (_, i) => planets.reduce((acc, p) => acc + bav[p][i], 0));
    const totalPoints = 337;
    const planetTotals: Record<string, number> = {};
    planets.forEach(p => { planetTotals[p] = bav[p].reduce((a, b) => a + b, 0); });
    
    return {
      bav, sav, totalPoints, planetTotals,
      summary: {
        strongestHouse: sav.indexOf(Math.max(...sav)) + 1,
        weakestHouse: sav.indexOf(Math.min(...sav)) + 1,
        averagePoints: totalPoints / 12,
        houseInterpretations: Array(12).fill("Planetary strength indicates progressive results."),
        houseSignifications: HOUSE_SIGNIFICATIONS
      },
      isValid: true
    };
  },

  calculateVarshaphala(birthData: BirthData, year: number): VarshaphalaData {
    const seed = this.getSeed(birthData) + (year / 1000);
    const chart = this.calculateChartBySeed(seed, `D1-A-${year}`);
    
    const muddaDashas: MuddaDasha[] = PLANET_ORDER.map((p, i) => {
      const days = (DASHA_YEARS[p] / 120) * 365;
      const startDay = PLANET_ORDER.slice(0, i).reduce((acc, curr) => acc + (DASHA_YEARS[curr] / 120) * 365, 0);
      const startDate = new Date(`${year}-01-01`);
      startDate.setDate(startDate.getDate() + startDay);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);
      
      return {
        planet: p,
        start: startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        end: endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        isActive: new Date() >= startDate && new Date() <= endDate
      };
    });

    return {
      year,
      praveshTime: `${year}-05-15T10:30:00`,
      ascendant: SIGN_NAMES[chart.points.find(p => p.planet === Planet.Lagna)?.sign || Sign.Aries],
      munthaSign: SIGN_NAMES[((Math.floor(seed * 12) % 12) + 1) as Sign],
      munthaHouse: (Math.floor(seed * 12) % 12) + 1,
      yearLord: Planet.Sun,
      chart,
      yogas: [],
      sahams: [],
      muddaDashas,
      predictions: { 
        overall: "A year characterized by significant professional visibility.", 
        career: "Expect recognition for past efforts.", 
        relationships: "Stabilization of personal bonds.", 
        finance: "Consistent gains through multiple streams.",
        health: "Generally robust health."
      }
    };
  },

  calculateCompatibility(p1: BirthData, p2: BirthData): CompatibilityData {
    const seed1 = this.getSeed(p1);
    const seed2 = this.getSeed(p2);
    const matchSeed = (seed1 + seed2) % 36;
    
    const kootas = [
      { name: 'Varna', score: Math.round(matchSeed % 1), max: 1, description: 'Work/Ego Compatibility', interpretation: 'Harmony in status.' },
      { name: 'Vashya', score: Math.round((matchSeed * 1.5) % 2), max: 2, description: 'Power Alignment', interpretation: 'Mutual respect.' },
      { name: 'Tara', score: Math.round((matchSeed * 2.1) % 3), max: 3, description: 'Destiny', interpretation: 'Combined luck.' },
      { name: 'Yoni', score: Math.round((matchSeed * 3.2) % 4), max: 4, description: 'Physical', interpretation: 'Physical attraction.' },
      { name: 'Maitri', score: Math.round((matchSeed * 4.3) % 5), max: 5, description: 'Friendship', interpretation: 'Communication.' },
      { name: 'Gana', score: Math.round((matchSeed * 5.4) % 6), max: 6, description: 'Temperament', interpretation: 'Balance of traits.' },
      { name: 'Bhakoot', score: Math.round((matchSeed * 6.5) % 7), max: 7, description: 'Emotional', interpretation: 'Deep understanding.' },
      { name: 'Nadi', score: Math.round((matchSeed * 7.6) % 8), max: 8, description: 'Health/Progeny', interpretation: 'Genetic compatibility.' },
    ];

    const totalScore = kootas.reduce((acc, k) => acc + k.score, 0);

    return {
      partner1: p1.name,
      partner2: p2.name,
      totalScore,
      kootas,
      manglikStatus: {
        partner1: seed1 % 1 > 0.7,
        partner2: seed2 % 1 > 0.8,
        cancellation: totalScore > 25 ? 'Mars-Saturn Neutralized' : null
      },
      summary: totalScore >= 25 ? 'Exceptional Match' : totalScore >= 18 ? 'Good Potential' : 'Challenges Ahead'
    };
  },

  getTodayData(birthData: BirthData): TransitContext {
    const now = new Date();
    const varaLords = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn];
    const tithiNum = (Math.floor(now.getDate() + now.getMonth()) % 30) + 1;
    
    return {
      panchang: {
        tithi: tithiNum <= 15 ? `Shukla ${tithiNum}` : `Krishna ${tithiNum - 15}`,
        tithiNumber: tithiNum,
        vara: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()],
        dayLord: varaLords[now.getDay()],
        nakshatra: NAKSHATRAS[Math.floor(Math.random() * 27)],
        yoga: 'Vishkumbha',
        karana: 'Bava',
        sunrise: '06:12 AM',
        sunset: '06:44 PM',
        moonPhase: tithiNum <= 15 ? 'Waxing' : 'Waning'
      },
      transits: { varga: 'Transit', points: [] },
      horaLord: varaLords[(now.getHours() + now.getDay()) % 7],
      isAuspicious: tithiNum % 7 !== 0
    };
  },

  getPlannerData(birthData: BirthData): PlannerData {
    return {
      activities: [
        { category: 'Financial Trading', score: 85, status: 'Peak', advice: 'Excellent aspects.' },
        { category: 'Health & Surgery', score: 45, status: 'Neutral', advice: 'Avoid elective procedures.' },
        { category: 'Creative Travel', score: 92, status: 'Peak', advice: 'Optimal window.' }
      ],
      schedule: [],
      daySummary: "Focus on internal wealth consolidation."
    };
  },

  calculateShadbala(birthData: BirthData): ShadbalaData[] {
    const seed = this.getSeed(birthData);
    const mainPlanets = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn];
    
    return mainPlanets.map((p, i) => {
      const pSeed = (seed * (i + 1) * 100) % 100;
      const sthana = 120 + (pSeed * 1.5);
      const dig = 30 + (pSeed * 0.4);
      const kala = 100 + (pSeed * 1.2);
      const cesta = 40 + (pSeed * 0.6);
      const naisargika = 60 - (i * 5);
      const drig = (pSeed * 0.2) - 10;
      const total = sthana + dig + kala + cesta + naisargika + drig;

      return {
        planet: p,
        total: Math.round(total),
        percentage: Math.round((total / 600) * 100),
        sthana: Math.round(sthana),
        dig: Math.round(dig),
        kala: Math.round(kala),
        cesta: Math.round(cesta),
        naisargika: Math.round(naisargika),
        drig: Math.round(drig),
        baladi: i % 2 === 0 ? 'Youth' : 'Infant',
        jagradadi: i % 3 === 0 ? 'Dreaming' : 'Awake',
        deeptadi: i % 4 === 0 ? 'Peaceful' : 'Proud'
      };
    });
  },

  generateRemedies(shadbalaData: ShadbalaData[], chart: DivisionalChart): Remedy[] {
    const remedies: Remedy[] = [];
    const weakPlanets = [...shadbalaData].sort((a, b) => a.total - b.total).slice(0, 3);

    weakPlanets.forEach(wp => {
      const map = PLANET_REMEDY_MAP[wp.planet];
      if (!map) return;

      remedies.push({
        type: 'Mantra',
        planet: wp.planet as Planet,
        title: `${wp.planet} Pacification Mantra`,
        description: `Recommended for low Shadbala (${wp.total} pts).`,
        benefit: map.benefit,
        mantraText: map.mantra,
        mantraDeity: map.deity,
        count: 108,
        day: wp.planet === Planet.Sun ? 'Sunday' : 
             wp.planet === Planet.Moon ? 'Monday' :
             wp.planet === Planet.Mars ? 'Tuesday' :
             wp.planet === Planet.Mercury ? 'Wednesday' :
             wp.planet === Planet.Jupiter ? 'Thursday' :
             wp.planet === Planet.Venus ? 'Friday' : 'Saturday',
        color: map.color
      });

      if (wp.total < 320) {
        remedies.push({
          type: 'Gemstone',
          planet: wp.planet as Planet,
          title: map.stone,
          description: `To strengthen ${wp.planet}.`,
          benefit: map.benefit,
          metal: wp.planet === Planet.Moon || wp.planet === Planet.Venus ? 'Silver' : 'Gold',
          finger: wp.planet === Planet.Sun || wp.planet === Planet.Mars ? 'Ring Finger' : 'Little Finger',
          color: map.color
        });
      }

      remedies.push({
        type: 'Charity',
        planet: wp.planet as Planet,
        title: `Karma Alignment: ${wp.planet}`,
        description: map.charity,
        benefit: 'Clearing evolutionary debt',
        day: 'Weekly',
        color: map.color
      });
    });

    return remedies;
  },

  getKnowledgeBase(): KBChunk[] {
    return [
      {
        id: 'graha-sun',
        category: 'Grahas',
        title: 'Surya: The Cosmic Soul',
        summary: 'Representing the Atman (Soul), authority, and vital life force.',
        difficulty: 'Beginner',
        readTime: '3 min',
        tags: ['Soul', 'Authority', 'King'],
        content: 'In Vedic Astrology, the Sun (Surya) is the most vital point in any chart.'
      },
      {
        id: 'bhava-1',
        category: 'Bhavas',
        title: 'The First House: Tanu Bhava',
        summary: 'The house of self, physical body, and general temperament.',
        difficulty: 'Beginner',
        readTime: '4 min',
        tags: ['Self', 'Body', 'Appearance'],
        content: 'The 1st House is the foundation of the birth chart.'
      }
    ];
  },

  getSeed(data: BirthData): number {
    const s = `${data.dob}${data.tob}${data.lat}${data.lng}`;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) / 1000000;
  }
};
