import React from 'react';
import './StrengthWidget.css';

function StrengthWidget({ strengthData, config = {} }) {
  const { show_weak_planets = true, show_strong_planets = true } = config;
  
  if (!strengthData) {
    return (
      <div className="strength-widget-loading">
        <div className="loading-spinner"></div>
        <span>Loading strength...</span>
      </div>
    );
  }

  const shadbala = strengthData.shadbala || strengthData.summary || {};
  const planets = Object.entries(shadbala);
  
  const sorted = planets.sort((a, b) => (b[1]?.total_strength || 0) - (a[1]?.total_strength || 0));
  const strong = sorted.slice(0, 3);
  const weak = sorted.slice(-3).reverse();

  return (
    <div className="strength-widget" data-testid="strength-widget">
      {show_strong_planets && (
        <div className="strength-section">
          <span className="section-label strong">Strong</span>
          <div className="planets-row">
            {strong.map(([planet, data]) => (
              <div key={planet} className="planet-strength-item strong">
                <span className="planet-name">{planet}</span>
                <span className="strength-value">{Math.round(data?.total_strength || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {show_weak_planets && (
        <div className="strength-section">
          <span className="section-label weak">Weak</span>
          <div className="planets-row">
            {weak.map(([planet, data]) => (
              <div key={planet} className="planet-strength-item weak">
                <span className="planet-name">{planet}</span>
                <span className="strength-value">{Math.round(data?.total_strength || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StrengthWidget;
