import React from 'react';
import './TransitWidget.css';

function TransitWidget({ transitData, config = {} }) {
  const { show_sade_sati = true, show_retrogrades = true } = config;
  
  if (!transitData) {
    return (
      <div className="transit-widget-loading">
        <div className="loading-spinner"></div>
        <span>Loading transits...</span>
      </div>
    );
  }

  const transits = transitData.current_transits || transitData.transits || {};
  const sadeSati = transitData.sade_sati || {};

  const majorPlanets = ['Jupiter', 'Saturn', 'Rahu', 'Ketu'];
  const retroPlanets = Object.entries(transits)
    .filter(([_, data]) => data.retrograde)
    .map(([name]) => name);

  return (
    <div className="transit-widget" data-testid="transit-widget">
      {show_sade_sati && (
        <div className={`sade-sati-indicator ${sadeSati.active ? 'active' : 'inactive'}`}>
          <span className="indicator-label">Sade Sati</span>
          <span className="indicator-status">
            {sadeSati.active ? `Active (${sadeSati.phase || 'Phase'})` : 'Not Active'}
          </span>
        </div>
      )}
      
      <div className="major-transits">
        {majorPlanets.map(planet => {
          const data = transits[planet];
          if (!data) return null;
          return (
            <div key={planet} className="transit-item">
              <span className="transit-planet">{planet}</span>
              <span className="transit-sign">{data.sign || data.rasi || '-'}</span>
              <span className="transit-house">H{data.house || '-'}</span>
            </div>
          );
        })}
      </div>
      
      {show_retrogrades && retroPlanets.length > 0 && (
        <div className="retrogrades">
          <span className="retro-label">Retrograde:</span>
          <span className="retro-planets">{retroPlanets.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

export default TransitWidget;
