import { Planet, Sign, BirthData, ChartPoint, DivisionalChart, DashaNode, ShadbalaData, Remedy, YogaMatch, PanchangData, TransitContext, PlannerData, ActivityScore, PlannerSlot, CompatibilityData, KootaScore, KBChunk } from '../types';
import { DASHA_YEARS, PLANET_ORDER, SIGN_NAMES } from '../constants';

export interface TajikaYoga {
  name: string;
  description: string;
  planets: string;
}

export interface Saham {
  name: string;
  sign: string;
  degree: number;
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
  };
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

const NAKSHATRA_DEITIES = [
  'Ashwini Kumaras', 'Yama', 'Agni', 'Brahma/Prajapati', 'Soma', 'Rudra', 'Aditi', 'Brihaspati', 'Nagas',
  'Pitris', 'Bhaga', 'Aryaman', 'Savitur', 'Vishwakarma', 'Vayu', 'Indragni', 'Mitra', 'Indra',
  'Nirriti', 'Apah', 'Vishwa Devas', 'Vishnu', 'Vasu Devas', 'Varuna', 'Ajikapada', 'Ahirbudhnya', 'Pushan'
];

const NAKSHATRA_SYMBOLS = [
  'Horse Head', 'Yoni', 'Razor/Flame', 'Ox Cart/Temple', 'Deer Head', 'Teardrop', 'Bow/Quiver', 'Flower/Circle', 'Coiled Serpent',
  'Palanquin/Throne', 'Couch/Bed', 'Bed/Hammock', 'Hand/Palm', 'Pearl/Gem', 'Coral/Sword', 'Triumphal Arch', 'Lotus Flower', 'Umbrella/Earring',
  'Elephant Goad/Roots', 'Winnowing Basket', 'Elephant Tusk', 'Ear/Three Footprints', 'Drum/Flute', 'Empty Circle/Flowers', 'Front part of Funeral Cot', 'Back part of Funeral Cot', 'Drum/Fish'
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

const DEBIL_SIGNS: Record<string, Sign> = {
  [Planet.Sun]: Sign.Libra,
  [Planet.Moon]: Sign.Scorpio,
  [Planet.Mars]: Sign.Cancer,
  [Planet.Mercury]: Sign.Pisces,
  [Planet.Jupiter]: Sign.Capricorn,
  [Planet.Venus]: Sign.Virgo,
  [Planet.Saturn]: Sign.Aries,
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

const PLANET_REMEDY_MAP: Record<string, any> = {
  [Planet.Sun]: {
    stone: 'Ruby (Manik)',
    mantra: 'Om Hram Hreem Hroum Sah Suryaya Namaha',
    charity: 'Donate wheat or jaggery on Sundays',
    deity: 'Lord Rama / Surya Narayana',
    benefit: 'Confidence, Vitality, Leadership',
    color: '#ef4444',
    avoid: 'Dark colors on Sundays'
  },
  [Planet.Moon]: {
    stone: 'Pearl (Moti)',
    mantra: 'Om Shram Shreem Shroum Sah Chandraya Namaha',
    charity: 'Donate rice or milk on Mondays',
    deity: 'Lord Shiva / Gauri',
    benefit: 'Peace of mind, Emotional balance',
    color: '#94a3b8',
    avoid: 'Staying awake late at night'
  },
  [Planet.Mars]: {
    stone: 'Red Coral (Moonga)',
    mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namaha',
    charity: 'Donate red lentils or sweets on Tuesdays',
    deity: 'Lord Hanuman',
    benefit: 'Courage, Energy, Technical Skill',
    color: '#dc2626',
    avoid: 'Anger and impulsive speech'
  },
  [Planet.Mercury]: {
    stone: 'Emerald (Panna)',
    mantra: 'Om Bram Breem Broum Sah Budhaya Namaha',
    charity: 'Donate green vegetables or moong dal on Wednesdays',
    deity: 'Lord Vishnu / Buddha',
    benefit: 'Communication, Intelligence, Business',
    color: '#10b981',
    avoid: 'Lying or harsh communication'
  },
  [Planet.Jupiter]: {
    stone: 'Yellow Sapphire (Pukhraj)',
    mantra: 'Om Gram Greem Groum Sah Gurave Namaha',
    charity: 'Donate chana dal or turmeric on Thursdays',
    deity: 'Lord Brahma / Dakshinamurthy',
    benefit: 'Wisdom, Prosperity, Spirituality',
    color: '#eab308',
    avoid: 'Disrespecting teachers/elders'
  },
  [Planet.Venus]: {
    stone: 'Diamond / White Sapphire',
    mantra: 'Om Dram Dreem Droum Sah Shukraya Namaha',
    charity: 'Donate curd or white clothes on Fridays',
    deity: 'Goddess Lakshmi',
    benefit: 'Luxury, Relationships, Arts',
    color: '#ec4899',
    avoid: 'Impure environments'
  },
  [Planet.Saturn]: {
    stone: 'Blue Sapphire (Neelam)',
    mantra: 'Om Pram Preem Proum Sah Shanaye Namaha',
    charity: 'Donate black til or oil on Saturdays',
    deity: 'Lord Shani / Kurma Avatar',
    benefit: 'Discipline, Longevity, Focus',
    color: '#1e1b4b',
    avoid: 'Laziness and procrastination'
  }
};

export const astrologyService = {
  calculateNatalChart(birthData: BirthData): DivisionalChart {
    return this.calculateChartBySeed(this.getSeed(birthData), 'D1');
  },

  calculateChartBySeed(seed: number, vargaName: string): DivisionalChart {
    const points: ChartPoint[] = Object.values(Planet).map((p, i) => {
      const signValue = ((Math.floor(seed * (i + 1) * 1.5) % 12) + 1);
      const degree = (seed * 30 * (i + 1)) % 30;
      const totalDegrees = (signValue - 1) * 30 + degree;
      
      const nakIndex = Math.floor(totalDegrees / (360 / 27));
      const remainderWithinNak = totalDegrees % (360 / 27);
      const pada = Math.floor(remainderWithinNak / (360 / 27 / 4)) + 1;
      
      const nakshatraLord = NAKSHATRA_LORDS[nakIndex % 9];
      const signLord = SIGN_LORDS[signValue as Sign];
      const navamshaSign = (Math.floor(totalDegrees * 9 / 30) % 12) + 1;
      const padaLord = SIGN_LORDS[navamshaSign as Sign];

      return {
        planet: p,
        sign: signValue as Sign,
        degree,
        house: ((Math.floor(seed * (i + 5)) % 12) + 1),
        isRetrograde: (seed * (i + 2)) % 10 > 8,
        nakshatra: NAKSHATRAS[nakIndex % 27],
        pada: pada,
        nakshatraLord,
        padaLord,
        signLord,
        nakshatraDegree: remainderWithinNak,
        nakshatraSymbol: NAKSHATRA_SYMBOLS[nakIndex % 27],
        nakshatraDeity: NAKSHATRA_DEITIES[nakIndex % 27],
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
      const remainderWithinNak = vargaDegree % (360 / 27);
      const pada = Math.floor(remainderWithinNak / (360 / 27 / 4)) + 1;
      
      const nakshatraLord = NAKSHATRA_LORDS[nakIndex % 9];
      const signLord = SIGN_LORDS[signValue as Sign];
      const navamshaSign = (Math.floor(vargaDegree * 9 / 30) % 12) + 1;
      const padaLord = SIGN_LORDS[navamshaSign as Sign];

      return {
        ...p,
        sign: signValue as Sign,
        degree: vargaDegree % 30,
        nakshatra: NAKSHATRAS[nakIndex % 27],
        pada: pada,
        nakshatraLord,
        padaLord,
        signLord,
        nakshatraDegree: remainderWithinNak,
        nakshatraSymbol: NAKSHATRA_SYMBOLS[nakIndex % 27],
        nakshatraDeity: NAKSHATRA_DEITIES[nakIndex % 27],
        dignity: getDignity(p.planet, signValue as Sign)
      };
    });
    return { varga: `D${varga}`, points };
  },

  detectYogas(chart: DivisionalChart): YogaMatch[] {
    const yogas: YogaMatch[] = [];
    const points = chart.points;
    const find = (p: Planet) => points.find(pt => pt.planet === p)!;
    const house = (p: Planet) => find(p).house;
    const isKendra = (h: number) => [1, 4, 7, 10].includes(h);

    if (Math.abs(house(Planet.Jupiter) - house(Planet.Moon)) % 3 === 0 && isKendra(house(Planet.Jupiter))) {
      yogas.push({
        name: "Gaja Kesari Yoga",
        description: "Jupiter and Moon in mutual kendra or from lagna",
        rule: "Jupiter in a Kendra from the Moon",
        interpretation: "Brings great prosperity, wisdom, and an impeccable reputation.",
        strength: 90,
        category: "Dhana"
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
    const sav = Array.from({ length: 12 }, (_, i) => {
      return planets.reduce((acc, p) => acc + bav[p][i], 0);
    });
    const totalPoints = 337;
    const planetTotals: Record<string, number> = {};
    planets.forEach(p => {
      planetTotals[p] = bav[p].reduce((a, b) => a + b, 0);
    });
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
    const seed = this.getSeed(birthData) + (year / 2000);
    const chart = this.calculateChartBySeed(seed, `D1-A-${year}`);
    return {
      year,
      praveshTime: `${year}-05-15T10:30:00`,
      ascendant: SIGN_NAMES[chart.points.find(p => p.planet === Planet.Lagna)?.sign || Sign.Aries],
      munthaSign: SIGN_NAMES[((Math.floor(seed * 12) % 12) + 1) as Sign],
      munthaHouse: (Math.floor(seed * 12) % 12) + 1,
      yearLord: Planet.Sun,
      chart,
      yogas: [{ name: 'Ithasala Yoga', description: 'Strong beneficial connection', planets: 'Sun & Mars' }],
      sahams: [{ name: 'Punya Saham', sign: 'Leo', degree: 15.42 }],
      muddaDashas: [{ planet: Planet.Sun, start: 'May', end: 'Jun', isActive: true }],
      predictions: { overall: "Growth year.", career: "Recognition.", relationships: "Deepening bonds.", finance: "Steady gains." }
    };
  },

  calculateCompatibility(p1: BirthData, p2: BirthData): CompatibilityData {
    const seed1 = this.getSeed(p1);
    const seed2 = this.getSeed(p2);
    const matchSeed = (seed1 + seed2) % 36;
    
    const kootas: KootaScore[] = [
      { name: 'Varna', score: Math.round(matchSeed % 1), max: 1, description: 'Work/Ego Compatibility', interpretation: 'Harmony in social status and basic identity.' },
      { name: 'Vashya', score: Math.round((matchSeed * 1.5) % 2), max: 2, description: 'Power/Control Alignment', interpretation: 'Mutual respect for individual boundaries.' },
      { name: 'Tara', score: Math.round((matchSeed * 2.1) % 3), max: 3, description: 'Destiny Compatibility', interpretation: 'Combined luck and future security.' },
      { name: 'Yoni', score: Math.round((matchSeed * 3.2) % 4), max: 4, description: 'Physical/Sexual Vitality', interpretation: 'High physical attraction and biological sync.' },
      { name: 'Maitri', score: Math.round((matchSeed * 4.3) % 5), max: 5, description: 'Friendship/Intellectual', interpretation: 'Strong communication and shared interests.' },
      { name: 'Gana', score: Math.round((matchSeed * 5.4) % 6), max: 6, description: 'Temperament/Behavior', interpretation: 'Balance of creative and practical traits.' },
      { name: 'Bhakoot', score: Math.round((matchSeed * 6.5) % 7), max: 7, description: 'Emotional Connection', interpretation: 'Deep emotional understanding and support.' },
      { name: 'Nadi', score: Math.round((matchSeed * 7.6) % 8), max: 8, description: 'Health/Progeny/Genetic', interpretation: 'Genetic compatibility and long-term health.' },
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
    const timeSeed = now.getTime() / 10000000000;
    const baseSeed = this.getSeed(birthData);
    const currentSeed = (baseSeed + timeSeed) % 1;
    const transitChart = this.calculateChartBySeed(currentSeed, 'Transit');
    const tithiNum = (Math.floor(now.getDate() + now.getMonth()) % 30) + 1;
    const varaLords = [Planet.Sun, Planet.Moon, Planet.Mars, Planet.Mercury, Planet.Jupiter, Planet.Venus, Planet.Saturn];
    return {
      panchang: {
        tithi: tithiNum <= 15 ? `Shukla ${tithiNum}` : `Krishna ${tithiNum - 15}`,
        tithiNumber: tithiNum,
        vara: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()],
        dayLord: varaLords[now.getDay()],
        nakshatra: NAKSHATRAS[Math.floor(currentSeed * 27)],
        yoga: 'Vishkumbha',
        karana: 'Bava',
        sunrise: '06:12 AM',
        sunset: '06:44 PM',
        moonPhase: tithiNum <= 15 ? 'Waxing' : 'Waning'
      },
      transits: transitChart,
      horaLord: varaLords[(now.getHours() + now.getDay()) % 7],
      isAuspicious: tithiNum % 7 !== 0
    };
  },

  getPlannerData(birthData: BirthData): PlannerData {
    const seed = this.getSeed(birthData);
    return {
      activities: [
        { category: 'Financial Trading', score: 85, status: 'Peak', advice: 'Excellent aspects.' },
        { category: 'Health & Surgery', score: 45, status: 'Neutral', advice: 'Avoid elective procedures.' },
        { category: 'Creative Travel', score: 92, status: 'Peak', advice: 'Optimal window.' }
      ],
      schedule: [
        { time: '09:00 AM', title: 'Solar Activation', category: 'Auspicious', description: 'Powerful trine.', score: 95 }
      ],
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
    
    const weakPlanets = [...shadbalaData]
      .sort((a, b) => a.total - b.total)
      .slice(0, 3);

    weakPlanets.forEach(wp => {
      const map = PLANET_REMEDY_MAP[wp.planet];
      if (!map) return;

      remedies.push({
        type: wp.total < 350 ? 'Mantra' : 'Charity',
        planet: wp.planet as Planet,
        title: `${wp.planet} Pacification Mantra`,
        description: `Recommended to balance the low Shadbala (${wp.total} pts).`,
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
          description: `To strengthen the weak planetary vibration of ${wp.planet}.`,
          benefit: map.benefit,
          metal: wp.planet === Planet.Moon || wp.planet === Planet.Venus ? 'Silver' : 'Gold (18k+)',
          finger: wp.planet === Planet.Sun || wp.planet === Planet.Mars || wp.planet === Planet.Saturn ? 'Ring Finger' : 
                   wp.planet === Planet.Jupiter ? 'Index Finger' : 'Little Finger',
          color: map.color,
          avoid: map.avoid
        });
      }

      remedies.push({
        type: 'Charity',
        planet: wp.planet as Planet,
        title: `Karma Alignment: ${wp.planet}`,
        description: map.charity,
        benefit: 'Clearing evolutionary debt',
        day: 'Weekly occurrence',
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
        content: `In Vedic Astrology, the Sun (Surya) is the most vital point in any chart. He represents the Soul (Atman), the King, and the Father. 
        A strong Sun grants confidence, leadership, and a robust physical constitution. 
        Surya rules the Sign of Leo and is exalted in Aries. His direction is the East, and his daytime strength is paramount.`
      },
      {
        id: 'bhava-1',
        category: 'Bhavas',
        title: 'The First House: Tanu Bhava',
        summary: 'The house of self, physical body, and general temperament.',
        difficulty: 'Beginner',
        readTime: '4 min',
        tags: ['Self', 'Body', 'Appearance'],
        content: `The 1st House, also known as the Ascendant or Lagna, is the foundation of the birth chart. It signifies the physical body, the head, and the overall personality. 
        Planets placed here have a massive impact on one's life trajectory. It is considered the most auspicious house as it is both a Kendra (Cardinal) and a Trikona (Trine) house simultaneously.`
      },
      {
        id: 'concept-dasha',
        category: 'Concepts',
        title: 'Vimshottari Dasha Mechanics',
        summary: 'Understanding the unique 120-year planetary cycle system.',
        difficulty: 'Intermediate',
        readTime: '6 min',
        tags: ['Timing', 'Prediction', 'Cycles'],
        content: `Vimshottari Dasha is the primary predictive tool in Parashari Jyotish. It assumes a human life span of 120 years, divided into periods ruled by the nine planets. 
        The starting point of the cycle is determined by the Moon's Nakshatra at the time of birth. Each planet has a fixed duration, ranging from 6 years (Sun) to 20 years (Venus).`
      },
      {
        id: 'nakshatra-intro',
        category: 'Nakshatras',
        title: 'The Lunar Mansions (Nakshatras)',
        summary: 'Deep-diving into the 27 zones of the moon\'s path.',
        difficulty: 'Intermediate',
        readTime: '5 min',
        tags: ['Moon', 'Stars', 'Deity'],
        content: `While the 12 Signs (Rasis) provide the broad archetypes, the 27 Nakshatras provide the high-resolution detail of Vedic Astrology. 
        Each Nakshatra spans 13°20' and is ruled by a planet and a specific deity. They are essential for calculating dashas, marriage compatibility, and muhurta (electional timing).`
      },
      {
        id: 'graha-jupiter',
        category: 'Grahas',
        title: 'Guru: The Great Benefic',
        summary: 'Expansion, wisdom, law, and spiritual guidance.',
        difficulty: 'Beginner',
        readTime: '3 min',
        tags: ['Wisdom', 'Growth', 'Luck'],
        content: `Jupiter (Guru) is known as the 'Teacher of the Gods'. He represents expansion, abundance, and divine grace. 
        In a chart, Guru shows the areas of life where we find meaning and where luck flows naturally. He rules Sagittarius and Pisces, and is exalted in Cancer.`
      },
      {
        id: 'bhava-10',
        category: 'Bhavas',
        title: 'The Tenth House: Karma Bhava',
        summary: 'Career, fame, public status, and worldly achievements.',
        difficulty: 'Intermediate',
        readTime: '4 min',
        tags: ['Career', 'Fame', 'Status'],
        content: `The 10th House is the peak of the sky at the time of birth. It represents one's professional life, reputation in society, and relationship with authority figures. 
        A strong 10th house or strong planets aspecting it often indicate a person with high visibility and professional drive.`
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