import React from 'react';
import './YogasWidget.css';

function YogasWidget({ yogasData, config = {} }) {
  const { max_yogas = 5, show_strength = true } = config;
  
  if (!yogasData) {
    return (
      <div className="yogas-widget-loading">
        <div className="loading-spinner"></div>
        <span>Loading yogas...</span>
      </div>
    );
  }

  const yogas = yogasData.yogas || yogasData || [];
  const displayYogas = yogas.slice(0, max_yogas);

  const getStrengthColor = (strength) => {
    if (strength >= 8) return '#4caf50';
    if (strength >= 5) return '#ffc107';
    return '#f44336';
  };

  return (
    <div className="yogas-widget" data-testid="yogas-widget">
      {displayYogas.length === 0 ? (
        <div className="no-yogas">No significant yogas detected</div>
      ) : (
        <div className="yogas-list">
          {displayYogas.map((yoga, idx) => (
            <div key={idx} className="yoga-item">
              <span className="yoga-name">{yoga.yoga_name || yoga.name}</span>
              {show_strength && (
                <span 
                  className="yoga-strength"
                  style={{ color: getStrengthColor(yoga.strength || 5) }}
                >
                  {yoga.strength || '-'}/10
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default YogasWidget;
