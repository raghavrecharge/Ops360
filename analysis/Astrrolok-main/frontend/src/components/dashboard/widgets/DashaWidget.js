import React from 'react';
import './DashaWidget.css';

function DashaWidget({ dashaData, config = {} }) {
  const { show_dates = true, expandable = true } = config;
  
  if (!dashaData) {
    return (
      <div className="dasha-widget-loading">
        <div className="loading-spinner"></div>
        <span>Loading dasha...</span>
      </div>
    );
  }

  const currentDasha = dashaData.current_dasha || dashaData.current || {};
  const periods = dashaData.periods || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  return (
    <div className="dasha-widget" data-testid="dasha-widget">
      <div className="current-dasha">
        <div className="dasha-level">
          <span className="level-label">Mahadasha</span>
          <span className="level-lord">{currentDasha.maha_lord || currentDasha.mahadasha || '-'}</span>
        </div>
        <div className="dasha-level">
          <span className="level-label">Antardasha</span>
          <span className="level-lord">{currentDasha.antar_lord || currentDasha.antardasha || '-'}</span>
        </div>
        <div className="dasha-level">
          <span className="level-label">Pratyantara</span>
          <span className="level-lord">{currentDasha.prat_lord || currentDasha.pratyantara || '-'}</span>
        </div>
      </div>
      
      {show_dates && periods.length > 0 && (
        <div className="dasha-periods">
          {periods.slice(0, 3).map((period, idx) => (
            <div key={idx} className={`period-item ${period.is_current ? 'current' : ''}`}>
              <span className="period-lord">{period.lord}</span>
              <span className="period-dates">
                {formatDate(period.start_date)} - {formatDate(period.end_date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashaWidget;
