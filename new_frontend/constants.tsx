import { Planet, Sign } from './types';

export const PLANET_ORDER: Planet[] = [
  Planet.Sun, Planet.Moon, Planet.Mars, Planet.Rahu, Planet.Jupiter, Planet.Saturn, Planet.Mercury, Planet.Ketu, Planet.Venus
];

export const DASHA_YEARS: Record<Planet, number> = {
  [Planet.Sun]: 6,
  [Planet.Moon]: 10,
  [Planet.Mars]: 7,
  [Planet.Rahu]: 18,
  [Planet.Jupiter]: 16,
  [Planet.Saturn]: 19,
  [Planet.Mercury]: 17,
  [Planet.Ketu]: 7,
  [Planet.Venus]: 20,
  [Planet.Lagna]: 0
};

export const SIGN_NAMES: Record<Sign, string> = {
  [Sign.Aries]: 'Aries',
  [Sign.Taurus]: 'Taurus',
  [Sign.Gemini]: 'Gemini',
  [Sign.Cancer]: 'Cancer',
  [Sign.Leo]: 'Leo',
  [Sign.Virgo]: 'Virgo',
  [Sign.Libra]: 'Libra',
  [Sign.Scorpio]: 'Scorpio',
  [Sign.Sagittarius]: 'Sagittarius',
  [Sign.Capricorn]: 'Capricorn',
  [Sign.Aquarius]: 'Aquarius',
  [Sign.Pisces]: 'Pisces',
};