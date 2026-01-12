import React from 'react';
import './ChartWidget.css';

const PLANET_SYMBOLS = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke', Asc: 'As'
};

const RASI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function ChartWidget({ 
  chartData, 
  config = {},
  chartType = 'D1',
  compact = false 
}) {
  const { show_degrees = true, show_nakshatra = false, highlight_benefics = false } = config;
  
  if (!chartData) {
    return (
      <div className="chart-widget-loading">
        <div className="loading-spinner"></div>
        <span>Loading chart...</span>
      </div>
    );
  }

  const planets = chartData.planets || {};
  const ascendant = chartData.ascendant || { sign: 1 };
  
  // Get planets in each house (1-12)
  const housePlanets = {};
  for (let i = 1; i <= 12; i++) {
    housePlanets[i] = [];
  }
  
  // Add ascendant marker
  housePlanets[ascendant.sign] = housePlanets[ascendant.sign] || [];
  housePlanets[ascendant.sign].push({ name: 'Asc', symbol: 'As', isAsc: true });
  
  // Add planets
  Object.entries(planets).forEach(([name, data]) => {
    const house = data.house || data.sign || 1;
    if (!housePlanets[house]) housePlanets[house] = [];
    
    const planetInfo = {
      name,
      symbol: PLANET_SYMBOLS[name] || name.substring(0, 2),
      degree: data.degree,
      nakshatra: data.nakshatra,
      retrograde: data.retrograde,
      isBenefic: ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(name)
    };
    housePlanets[house].push(planetInfo);
  });

  const renderHousePlanets = (houseNum) => {
    const planetsInHouse = housePlanets[houseNum] || [];
    
    return (
      <div className="house-planets">
        {planetsInHouse.map((p, idx) => (
          <span 
            key={idx} 
            className={`planet-symbol ${p.isAsc ? 'asc' : ''} ${p.retrograde ? 'retro' : ''} ${highlight_benefics && p.isBenefic ? 'benefic' : ''}`}
            title={`${p.name}${p.degree !== undefined && show_degrees ? ` ${p.degree.toFixed(1)}°` : ''}${p.nakshatra && show_nakshatra ? ` (${p.nakshatra})` : ''}${p.retrograde ? ' ®' : ''}`}
          >
            {p.symbol}{p.retrograde ? '®' : ''}
          </span>
        ))}
      </div>
    );
  };

  const renderHouseNumber = (houseNum) => {
    const rasiIndex = ((ascendant.sign - 1 + houseNum - 1) % 12);
    return (
      <span className="house-number" title={RASI_NAMES[rasiIndex]}>
        {houseNum}
      </span>
    );
  };

  return (
    <div className={`chart-widget ${compact ? 'compact' : ''}`} data-testid={`chart-${chartType}`}>
      <div className="north-indian-chart-mini">
        <svg viewBox="0 0 300 300" className="chart-svg">
          {/* Outer square */}
          <rect x="0" y="0" width="300" height="300" className="chart-border" />
          
          {/* Diagonal lines */}
          <line x1="0" y1="0" x2="300" y2="300" className="chart-line" />
          <line x1="300" y1="0" x2="0" y2="300" className="chart-line" />
          
          {/* Inner square (rotated) */}
          <polygon points="150,0 300,150 150,300 0,150" className="chart-inner" />
        </svg>
        
        {/* House overlays */}
        <div className="house house-1">{renderHouseNumber(1)}{renderHousePlanets(1)}</div>
        <div className="house house-2">{renderHouseNumber(2)}{renderHousePlanets(2)}</div>
        <div className="house house-3">{renderHouseNumber(3)}{renderHousePlanets(3)}</div>
        <div className="house house-4">{renderHouseNumber(4)}{renderHousePlanets(4)}</div>
        <div className="house house-5">{renderHouseNumber(5)}{renderHousePlanets(5)}</div>
        <div className="house house-6">{renderHouseNumber(6)}{renderHousePlanets(6)}</div>
        <div className="house house-7">{renderHouseNumber(7)}{renderHousePlanets(7)}</div>
        <div className="house house-8">{renderHouseNumber(8)}{renderHousePlanets(8)}</div>
        <div className="house house-9">{renderHouseNumber(9)}{renderHousePlanets(9)}</div>
        <div className="house house-10">{renderHouseNumber(10)}{renderHousePlanets(10)}</div>
        <div className="house house-11">{renderHouseNumber(11)}{renderHousePlanets(11)}</div>
        <div className="house house-12">{renderHouseNumber(12)}{renderHousePlanets(12)}</div>
      </div>
    </div>
  );
}

export default ChartWidget;
