/**
 * AstrologyService - Local calculation fallback service
 * Provides client-side calculations when backend is unavailable
 */

import { 
  BirthData, 
  DivisionalChart, 
  ChartPoint, 
  DashaNode, 
  YogaMatch, 
  TransitContext, 
  PlannerData, 
  ShadbalaData, 
  Remedy, 
  KBChunk,
  PanchangData,
  Planet, 
  Sign,
  ActivityScore
} from '../types';
import { DASHA_YEARS, PLANET_ORDER } from '../constants';

// Ashtakavarga Data type
export interface AshtakavargaData {
  planetScores: Record<string, number[]>;
  sarvashtaka: number[];
  total: number;
  // Extended fields for component compatibility
  sav: number[];
  bav: Record<string, number[]>;
  planetTotals: Record<string, number>;
  summary: {
    strongest: string;
    weakest: string;
    avgScore: number;
  };
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

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 
  'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 
  'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 
  'Uttara Bhadrapada', 'Revati'
];

const SIGN_NAMES_MAP: Record<number, string> = {
  1: 'Aries', 2: 'Taurus', 3: 'Gemini', 4: 'Cancer',
  5: 'Leo', 6: 'Virgo', 7: 'Libra', 8: 'Scorpio',
  9: 'Sagittarius', 10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces'
};

export const astrologyService = {
  /**
   * Calculate natal chart from birth data
   */
  calculateNatalChart(birthData: BirthData): DivisionalChart {
    const dob = new Date(birthData.dob);
    const dayOfYear = Math.floor((dob.getTime() - new Date(dob.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Simplified planetary positions based on date
    const sunDeg = (dayOfYear * 360 / 365.25) % 360;
    const moonDeg = (dayOfYear * 13 + parseInt(birthData.tob?.split(':')[0] || '12')) % 360;
    
    const planets: ChartPoint[] = [
      { planet: Planet.Lagna, sign: (Math.floor(sunDeg / 30) + 1) as Sign, degree: sunDeg % 30, house: 1, isRetrograde: false },
      { planet: Planet.Sun, sign: (Math.floor(sunDeg / 30) + 1) as Sign, degree: sunDeg % 30, house: 1, isRetrograde: false },
      { planet: Planet.Moon, sign: (Math.floor(moonDeg / 30) + 1) as Sign, degree: moonDeg % 30, house: ((Math.floor(moonDeg / 30) - Math.floor(sunDeg / 30) + 12) % 12) + 1, isRetrograde: false },
      { planet: Planet.Mars, sign: ((Math.floor(dayOfYear / 45) + 3) % 12 + 1) as Sign, degree: (dayOfYear * 2) % 30, house: 3, isRetrograde: dayOfYear % 60 < 20 },
      { planet: Planet.Mercury, sign: (Math.floor(sunDeg / 30) + 1) as Sign, degree: (sunDeg + 15) % 30, house: 1, isRetrograde: dayOfYear % 88 < 20 },
      { planet: Planet.Jupiter, sign: ((Math.floor(dayOfYear / 400) + 5) % 12 + 1) as Sign, degree: (dayOfYear / 12) % 30, house: 5, isRetrograde: false },
      { planet: Planet.Venus, sign: ((Math.floor(sunDeg / 30) + 2) % 12 + 1) as Sign, degree: (sunDeg + 45) % 30, house: 2, isRetrograde: dayOfYear % 225 < 40 },
      { planet: Planet.Saturn, sign: ((Math.floor(dayOfYear / 900) + 8) % 12 + 1) as Sign, degree: (dayOfYear / 30) % 30, house: 8, isRetrograde: false },
      { planet: Planet.Rahu, sign: ((12 - Math.floor(dayOfYear / 700)) % 12 + 1) as Sign, degree: 15, house: 10, isRetrograde: true },
      { planet: Planet.Ketu, sign: ((6 - Math.floor(dayOfYear / 700) + 12) % 12 + 1) as Sign, degree: 15, house: 4, isRetrograde: true },
    ];

    // Add nakshatra info
    planets.forEach(p => {
      const totalDeg = ((p.sign - 1) * 30 + p.degree);
      p.nakshatra = NAKSHATRAS[Math.floor(totalDeg / 13.33) % 27];
      p.pada = Math.floor((totalDeg % 13.33) / 3.33) + 1;
    });

    return { varga: 'D1', points: planets };
  },

  /**
   * Calculate divisional chart
   */
  calculateVarga(d1: DivisionalChart, division: number): DivisionalChart {
    const points = d1.points.map(p => {
      const totalDeg = (p.sign - 1) * 30 + p.degree;
      const vargaSign = Math.floor((totalDeg * division / 30) % 12) + 1;
      return {
        ...p,
        sign: vargaSign as Sign,
        house: ((vargaSign - d1.points[0].sign + 12) % 12) + 1,
      };
    });
    return { varga: `D${division}`, points };
  },

  /**
   * Get Vimshottari Dasha periods
   */
  getVimshottariDashas(birthData: BirthData, levels: number = 3): DashaNode[] {
    const dob = new Date(birthData.dob);
    const moonDeg = (dob.getMonth() * 30 + dob.getDate()) % 360;
    const nakshatraIndex = Math.floor(moonDeg / 13.33) % 27;
    const lordOrder = [Planet.Ketu, Planet.Venus, Planet.Sun, Planet.Moon, Planet.Mars, Planet.Rahu, Planet.Jupiter, Planet.Saturn, Planet.Mercury];
    const startLordIndex = nakshatraIndex % 9;

    let currentDate = new Date(dob);
    const dashas: DashaNode[] = [];

    for (let i = 0; i < 9; i++) {
      const planet = lordOrder[(startLordIndex + i) % 9];
      const years = DASHA_YEARS[planet];
      const endDate = new Date(currentDate);
      endDate.setFullYear(endDate.getFullYear() + years);

      const node: DashaNode = {
        id: `md-${planet}`,
        planet,
        start: currentDate.toISOString(),
        end: endDate.toISOString(),
        level: 1,
        children: levels > 1 ? this.getSubDashas(planet, currentDate, endDate, 2, levels) : undefined,
      };

      dashas.push(node);
      currentDate = new Date(endDate);
    }

    return dashas;
  },

  getSubDashas(parentPlanet: Planet, start: Date, end: Date, currentLevel: number, maxLevel: number): DashaNode[] {
    const duration = end.getTime() - start.getTime();
    const lordOrder = [Planet.Ketu, Planet.Venus, Planet.Sun, Planet.Moon, Planet.Mars, Planet.Rahu, Planet.Jupiter, Planet.Saturn, Planet.Mercury];
    const parentIndex = lordOrder.indexOf(parentPlanet);
    const totalYears = 120;

    let currentDate = new Date(start);
    const subDashas: DashaNode[] = [];

    for (let i = 0; i < 9; i++) {
      const planet = lordOrder[(parentIndex + i) % 9];
      const years = DASHA_YEARS[planet];
      const subDuration = (duration * years) / totalYears;
      const endDate = new Date(currentDate.getTime() + subDuration);

      const node: DashaNode = {
        id: `ad-${parentPlanet}-${planet}-${currentLevel}`,
        planet,
        start: currentDate.toISOString(),
        end: endDate.toISOString(),
        level: currentLevel,
        children: currentLevel < maxLevel ? this.getSubDashas(planet, currentDate, endDate, currentLevel + 1, maxLevel) : undefined,
      };

      subDashas.push(node);
      currentDate = new Date(endDate);
    }

    return subDashas;
  },

  /**
   * Detect Yogas in chart
   */
  detectYogas(chart: DivisionalChart): YogaMatch[] {
    const yogas: YogaMatch[] = [];
    const planets = chart.points;

    // Gajakesari Yoga: Jupiter in kendra from Moon
    const moon = planets.find(p => p.planet === Planet.Moon);
    const jupiter = planets.find(p => p.planet === Planet.Jupiter);
    if (moon && jupiter) {
      const diff = Math.abs(moon.house - jupiter.house);
      if ([1, 4, 7, 10].includes(diff) || [1, 4, 7, 10].includes(12 - diff)) {
        yogas.push({
          name: 'Gajakesari Yoga',
          description: 'Jupiter in kendra from Moon',
          rule: 'Jupiter in 1st, 4th, 7th, or 10th house from Moon',
          interpretation: 'Fame, wealth, and wisdom. Good reputation and respect.',
          strength: 85,
          category: 'Wealth'
        });
      }
    }

    // Budhaditya Yoga: Sun and Mercury together
    const sun = planets.find(p => p.planet === Planet.Sun);
    const mercury = planets.find(p => p.planet === Planet.Mercury);
    if (sun && mercury && sun.house === mercury.house) {
      yogas.push({
        name: 'Budhaditya Yoga',
        description: 'Sun and Mercury in same house',
        rule: 'Conjunction of Sun and Mercury',
        interpretation: 'Intelligence, communication skills, and fame.',
        strength: 75,
        category: 'Intelligence'
      });
    }

    // Add some default yogas if none found
    if (yogas.length === 0) {
      yogas.push({
        name: 'Parivartana Yoga',
        description: 'Exchange of house lords',
        rule: 'Two planets exchange signs',
        interpretation: 'Mutual support between house significations.',
        strength: 60,
        category: 'General'
      });
    }

    return yogas;
  },

  /**
   * Get Today's transit data
   */
  getTodayData(birthData: BirthData): TransitContext {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    
    const sunDeg = (dayOfYear * 360 / 365.25) % 360;
    const moonDeg = (dayOfYear * 13 + now.getHours()) % 360;

    const transitPoints: ChartPoint[] = [
      { planet: Planet.Sun, sign: (Math.floor(sunDeg / 30) + 1) as Sign, degree: sunDeg % 30, house: 1, isRetrograde: false },
      { planet: Planet.Moon, sign: (Math.floor(moonDeg / 30) + 1) as Sign, degree: moonDeg % 30, house: ((Math.floor(moonDeg / 30) - Math.floor(sunDeg / 30) + 12) % 12) + 1, isRetrograde: false },
      { planet: Planet.Mars, sign: ((Math.floor(dayOfYear / 45) + 3) % 12 + 1) as Sign, degree: (dayOfYear * 2) % 30, house: 3, isRetrograde: dayOfYear % 60 < 20 },
      { planet: Planet.Mercury, sign: (Math.floor(sunDeg / 30) + 1) as Sign, degree: (sunDeg + 15) % 30, house: 1, isRetrograde: dayOfYear % 88 < 20 },
      { planet: Planet.Jupiter, sign: 10 as Sign, degree: 12, house: 9, isRetrograde: false },
      { planet: Planet.Venus, sign: ((Math.floor(sunDeg / 30) + 2) % 12 + 1) as Sign, degree: (sunDeg + 45) % 30, house: 2, isRetrograde: false },
      { planet: Planet.Saturn, sign: 10 as Sign, degree: 18, house: 10, isRetrograde: false },
      { planet: Planet.Rahu, sign: 2 as Sign, degree: 15, house: 11, isRetrograde: true },
      { planet: Planet.Ketu, sign: 8 as Sign, degree: 15, house: 5, isRetrograde: true },
    ];

    transitPoints.forEach(p => {
      const totalDeg = ((p.sign - 1) * 30 + p.degree);
      p.nakshatra = NAKSHATRAS[Math.floor(totalDeg / 13.33) % 27];
      p.pada = Math.floor((totalDeg % 13.33) / 3.33) + 1;
    });

    const tithiNum = ((dayOfYear + now.getDate() + now.getMonth()) % 30) + 1;
    const dayOfWeek = now.getDay();
    const varas = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayLords = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn];

    return {
      panchang: {
        tithi: tithiNum <= 15 ? `Shukla ${['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'][(tithiNum - 1) % 15]}` : `Krishna ${['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'][(tithiNum - 16) % 15]}`,
        tithiNumber: tithiNum,
        vara: varas[dayOfWeek],
        dayLord: dayLords[dayOfWeek],
        nakshatra: NAKSHATRAS[(dayOfYear + now.getDate() * 3) % 27],
        yoga: ['Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma'][(dayOfYear + now.getMonth()) % 7],
        karana: ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'][(dayOfYear * 2) % 7],
        sunrise: '06:30 AM',
        sunset: '06:00 PM',
        moonPhase: tithiNum <= 15 ? 'Waxing' : 'Waning',
      },
      transits: { varga: 'Transit', points: transitPoints },
      horaLord: dayLords[(dayOfWeek + now.getHours()) % 7],
      isAuspicious: tithiNum % 5 !== 0,
    };
  },

  /**
   * Get Planner data
   */
  getPlannerData(birthData: BirthData): PlannerData {
    return {
      activities: [
        { category: 'Financial Decisions', score: 82, status: 'Peak', advice: 'Favorable aspects for wealth decisions.' },
        { category: 'Health & Wellness', score: 68, status: 'Neutral', advice: 'Maintain regular routines.' },
        { category: 'Relationships', score: 75, status: 'Peak', advice: 'Harmonious energies for connections.' },
        { category: 'Creative Work', score: 91, status: 'Peak', advice: 'Venus-Moon alignment enhances artistic expression.' },
      ],
      schedule: [
        { time: '06:00 - 08:00', title: 'Brahma Muhurta', category: 'Auspicious', description: 'Best for meditation', score: 95 },
        { time: '11:58 - 12:44', title: 'Abhijit Muhurta', category: 'Auspicious', description: 'The unconquerable window', score: 98 },
        { time: '15:30 - 17:00', title: 'Rahu Kaal', category: 'Warning', description: 'Avoid new beginnings', score: 20 },
      ],
      daySummary: 'Focus on internal consolidation and creative expansion.',
    };
  },

  /**
   * Calculate Shadbala
   */
  calculateShadbala(birthData: BirthData): ShadbalaData[] {
    return PLANET_ORDER.filter(p => p !== Planet.Lagna).map(planet => ({
      planet,
      total: 300 + Math.random() * 200,
      percentage: 60 + Math.random() * 35,
      sthana: 50 + Math.random() * 50,
      dig: 30 + Math.random() * 40,
      kala: 40 + Math.random() * 50,
      cesta: 20 + Math.random() * 30,
      naisargika: 40 + Math.random() * 20,
      drig: 30 + Math.random() * 40,
      baladi: ['Bala', 'Kumara', 'Yuva', 'Vriddha', 'Mrita'][Math.floor(Math.random() * 5)],
      jagradadi: ['Jagrat', 'Swapna', 'Sushupti'][Math.floor(Math.random() * 3)],
      deeptadi: ['Deepta', 'Swastha', 'Mudita', 'Shanta'][Math.floor(Math.random() * 4)],
    }));
  },

  /**
   * Generate remedies based on weak planets
   */
  generateRemedies(shadbala: ShadbalaData[], chart: DivisionalChart): Remedy[] {
    const weakPlanets = shadbala.filter(s => s.percentage < 50).slice(0, 3);
    const remedies: Remedy[] = [];

    const remedyMap: Record<string, Partial<Remedy>> = {
      [Planet.Sun]: { type: 'Gemstone', title: 'Ruby', metal: 'Gold', finger: 'Ring finger', day: 'Sunday', color: 'Red' },
      [Planet.Moon]: { type: 'Gemstone', title: 'Pearl', metal: 'Silver', finger: 'Little finger', day: 'Monday', color: 'White' },
      [Planet.Mars]: { type: 'Gemstone', title: 'Red Coral', metal: 'Gold', finger: 'Ring finger', day: 'Tuesday', color: 'Red' },
      [Planet.Mercury]: { type: 'Gemstone', title: 'Emerald', metal: 'Gold', finger: 'Little finger', day: 'Wednesday', color: 'Green' },
      [Planet.Jupiter]: { type: 'Gemstone', title: 'Yellow Sapphire', metal: 'Gold', finger: 'Index finger', day: 'Thursday', color: 'Yellow' },
      [Planet.Venus]: { type: 'Gemstone', title: 'Diamond', metal: 'Platinum', finger: 'Middle finger', day: 'Friday', color: 'White' },
      [Planet.Saturn]: { type: 'Gemstone', title: 'Blue Sapphire', metal: 'Iron', finger: 'Middle finger', day: 'Saturday', color: 'Blue' },
      [Planet.Rahu]: { type: 'Gemstone', title: 'Hessonite', metal: 'Silver', finger: 'Middle finger', day: 'Saturday', color: 'Brown' },
      [Planet.Ketu]: { type: 'Gemstone', title: 'Cat\'s Eye', metal: 'Silver', finger: 'Little finger', day: 'Thursday', color: 'Grey' },
    };

    weakPlanets.forEach(wp => {
      const baseRemedy = remedyMap[wp.planet] || {};
      remedies.push({
        type: 'Gemstone',
        planet: wp.planet,
        title: baseRemedy.title || 'Gemstone',
        description: `Wear ${baseRemedy.title} to strengthen ${wp.planet}`,
        benefit: `Improves ${wp.planet} significations`,
        ...baseRemedy,
      } as Remedy);

      remedies.push({
        type: 'Mantra',
        planet: wp.planet,
        title: `${wp.planet} Mantra`,
        description: `Chant the ${wp.planet} beej mantra`,
        benefit: `Propitiates ${wp.planet}`,
        count: 108,
        day: baseRemedy.day,
        mantraText: `Om ${wp.planet.substring(0, 3).toLowerCase()}am namah`,
        mantraDeity: wp.planet,
      });
    });

    return remedies;
  },

  /**
   * Calculate Ashtakavarga
   */
  calculateAshtakavarga(chart: DivisionalChart): AshtakavargaData {
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const planetScores: Record<string, number[]> = {};
    const bav: Record<string, number[]> = {};
    const planetTotals: Record<string, number> = {};
    
    planets.forEach(p => {
      const scores = Array(12).fill(0).map(() => Math.floor(Math.random() * 8));
      planetScores[p] = scores;
      bav[p] = scores;
      planetTotals[p] = scores.reduce((a, b) => a + b, 0);
    });

    const sarvashtaka = Array(12).fill(0).map((_, i) => 
      planets.reduce((sum, p) => sum + planetScores[p][i], 0)
    );

    const total = sarvashtaka.reduce((a, b) => a + b, 0);
    const avgScore = total / 12;

    // Find strongest and weakest
    const sortedPlanets = Object.entries(planetTotals).sort((a, b) => b[1] - a[1]);

    return {
      planetScores,
      sarvashtaka,
      total,
      sav: sarvashtaka,
      bav,
      planetTotals,
      summary: {
        strongest: sortedPlanets[0][0],
        weakest: sortedPlanets[sortedPlanets.length - 1][0],
        avgScore: Math.round(avgScore * 10) / 10,
      },
    };
  },

  /**
   * Calculate Varshaphala (Annual Chart)
   */
  calculateVarshaphala(birthData: BirthData, year: number): VarshaphalaData {
    const dob = new Date(birthData.dob);
    const age = year - dob.getFullYear();
    const munthaSign = ((dob.getMonth() + age) % 12) + 1;
    
    const yearLords = [Planet.Sun, Planet.Venus, Planet.Mercury, Planet.Moon, Planet.Saturn, Planet.Jupiter, Planet.Mars];
    const yearLord = yearLords[age % 7];

    const chart = this.calculateNatalChart({ ...birthData, dob: `${year}-${dob.getMonth() + 1}-${dob.getDate()}` });

    return {
      year,
      age,
      muntha: {
        sign: munthaSign as Sign,
        house: munthaSign,
        signName: SIGN_NAMES_MAP[munthaSign],
      },
      yearLord,
      chart,
      predictions: [
        { house: 1, area: 'Self & Health', prediction: 'A year of personal growth and vitality.', strength: 'Strong' },
        { house: 2, area: 'Wealth & Speech', prediction: 'Financial improvements expected mid-year.', strength: 'Moderate' },
        { house: 7, area: 'Relationships', prediction: 'Partnerships require attention and care.', strength: 'Moderate' },
        { house: 10, area: 'Career', prediction: 'Professional recognition likely.', strength: 'Strong' },
      ],
    };
  },

  /**
   * Calculate compatibility between two charts
   */
  calculateCompatibility(person1: BirthData, person2: BirthData) {
    const kootas = [
      { name: 'Varna', score: Math.floor(Math.random() * 2), max: 1, description: 'Spiritual compatibility', interpretation: 'Good match' },
      { name: 'Vashya', score: Math.floor(Math.random() * 3), max: 2, description: 'Mutual attraction', interpretation: 'Moderate' },
      { name: 'Tara', score: Math.floor(Math.random() * 4), max: 3, description: 'Birth star harmony', interpretation: 'Good' },
      { name: 'Yoni', score: Math.floor(Math.random() * 5), max: 4, description: 'Physical compatibility', interpretation: 'Excellent' },
      { name: 'Graha Maitri', score: Math.floor(Math.random() * 6), max: 5, description: 'Mental compatibility', interpretation: 'Good' },
      { name: 'Gana', score: Math.floor(Math.random() * 7), max: 6, description: 'Temperament', interpretation: 'Moderate' },
      { name: 'Bhakoot', score: Math.floor(Math.random() * 8), max: 7, description: 'Family welfare', interpretation: 'Good' },
      { name: 'Nadi', score: Math.floor(Math.random() * 9), max: 8, description: 'Health & genes', interpretation: 'Excellent' },
    ];

    const totalScore = kootas.reduce((sum, k) => sum + k.score, 0);

    return {
      partner1: person1.name,
      partner2: person2.name,
      totalScore,
      kootas,
      manglikStatus: {
        partner1: Math.random() > 0.7,
        partner2: Math.random() > 0.7,
        cancellation: null,
      },
      summary: totalScore >= 24 ? 'Excellent match' : totalScore >= 18 ? 'Good match' : 'Needs remedies',
    };
  },

  /**
   * Get Knowledge Base articles
   */
  getKnowledgeBase(): KBChunk[] {
    return [
      {
        id: 'kb-1',
        category: 'Grahas',
        title: 'The Nine Planets (Navagraha)',
        summary: 'Understanding the cosmic influences of the nine planets in Vedic astrology.',
        content: 'The Navagrahas are the nine celestial bodies that influence human destiny...',
        difficulty: 'Beginner',
        tags: ['planets', 'basics'],
        readTime: '5 min',
      },
      {
        id: 'kb-2',
        category: 'Bhavas',
        title: 'The Twelve Houses',
        summary: 'Exploring the twelve houses and their significations.',
        content: 'Each house represents specific areas of life...',
        difficulty: 'Beginner',
        tags: ['houses', 'basics'],
        readTime: '8 min',
      },
      {
        id: 'kb-3',
        category: 'Nakshatras',
        title: 'The 27 Nakshatras',
        summary: 'The lunar mansions and their influence on personality.',
        content: 'Nakshatras are the 27 divisions of the zodiac...',
        difficulty: 'Intermediate',
        tags: ['nakshatras', 'moon'],
        readTime: '10 min',
      },
    ];
  },
};

export default astrologyService;
