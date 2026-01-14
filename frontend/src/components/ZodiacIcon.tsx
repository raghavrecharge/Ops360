import React from 'react';
import { Sign } from '../types';

interface Props {
  sign: Sign;
  className?: string;
  size?: number | string;
}

const ZodiacIcon: React.FC<Props> = ({ sign, className = "w-5 h-5", size }) => {
  const style = size ? { width: size, height: size } : {};

  const getPath = (s: Sign) => {
    switch (s) {
      case Sign.Aries:
        return "M7 7c0-2.5 2-4 4-4s4 1.5 4 4v13M17 7c0-2.5-2-4-4-4s-4 1.5-4 4v13"; // Simplified RAM horns
      case Sign.Taurus:
        return "M12 21a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM5 3c0 4 3 6 7 6s7-2 7-6"; // Bull head
      case Sign.Gemini:
        return "M7 4v16M17 4v16M5 4h14M5 20h14"; // Roman II
      case Sign.Cancer:
        return "M15 9a3 3 0 1 0-6 0c0 4 6 5 6 9a3 3 0 1 1-6 0M9 15a3 3 0 1 0 6 0c0-4-6-5-6-9a3 3 0 1 1 6 0"; // Interlocking 6/9
      case Sign.Leo:
        return "M7 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM10 12c2 0 4-4 7-4s4 4 4 7-3 5-6 5"; // Lion tail
      case Sign.Virgo:
        return "M4 8v10c0 2 1 3 3 3s3-1 3-3V8c0-2-1-3-3-3S4 6 4 8zm6 0v10c0 2 1 3 3 3s3-1 3-3V8c0-2-1-3-3-3s-3 1-3 3zm6 0v12c0 3 2 4 4 2"; // M with loop
      case Sign.Libra:
        return "M5 20h14M12 5c-3 0-5 2-5 5h10c0-3-2-5-5-5zM4 14h3c1-3 9-3 10 0h3"; // Scales
      case Sign.Scorpio:
        return "M4 8v10c0 2 1 3 3 3s3-1 3-3V8c0-2-1-3-3-3S4 6 4 8zm6 0v10c0 2 1 3 3 3s3-1 3-3V8c0-2-1-3-3-3s-3 1-3 3zm6 0v10l3 3m0-3l-3-3"; // M with arrow
      case Sign.Sagittarius:
        return "M5 19l14-14m0 0h-6m6 0v6M8 8l8 8"; // Arrow
      case Sign.Capricorn:
        return "M5 6v10c0 3 3 4 5 2l4-8c1-2 4-2 5 1s-1 6-4 6"; // V with tail
      case Sign.Aquarius:
        return "M4 10l3-3 3 3 3-3 3 3 4-4M4 17l3-3 3 3 3-3 3 3 4-4"; // Waves
      case Sign.Pisces:
        return "M5 5c3 3 3 11 0 14M19 5c-3 3-3 11 0 14M4 12h16"; // Fishes
      default:
        return "";
    }
  };

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      style={style}
    >
      <path d={getPath(sign)} />
    </svg>
  );
};

export default ZodiacIcon;