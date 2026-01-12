import React from 'react';
import { Star, Sun, Moon } from 'lucide-react';
import './Align27Widget.css';

function Align27Widget({ todayData, config = {} }) {
  const { show_timeline = true, show_moments = true, compact_mode = false } = config;
  
  if (!todayData) {
    return (
      <div className="align27-widget-loading">
        <div className="loading-spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  const dayScore = todayData.day_score || {};
  const moments = todayData.moments || [];
  const score = dayScore.score || 0;
  const color = (dayScore.color || 'AMBER').toLowerCase();

  const getMomentIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'GOLDEN': return <Star size={12} className="moment-icon golden" />;
      case 'PRODUCTIVE': return <Sun size={12} className="moment-icon productive" />;
      case 'SILENCE': return <Moon size={12} className="moment-icon silence" />;
      default: return null;
    }
  };

  return (
    <div className={`align27-widget ${compact_mode ? 'compact' : ''}`} data-testid="align27-widget">
      <div className={`traffic-light-mini traffic-${color}`}>
        <div className="score-value">{Math.round(score)}</div>
        <div className="score-color">{color.toUpperCase()}</div>
      </div>
      
      {show_moments && moments.length > 0 && (
        <div className="moments-mini">
          {moments.slice(0, compact_mode ? 2 : 4).map((m, idx) => (
            <div key={idx} className={`moment-mini moment-${m.type?.toLowerCase()}`}>
              {getMomentIcon(m.type)}
              <span className="moment-time">{m.start}-{m.end}</span>
            </div>
          ))}
        </div>
      )}
      
      {show_timeline && !compact_mode && (
        <div className="mini-timeline">
          {moments.map((m, idx) => {
            const startHour = parseInt(m.start?.split(':')[0] || 0);
            const endHour = parseInt(m.end?.split(':')[0] || 24);
            const left = ((startHour - 5) / 19) * 100;
            const width = ((endHour - startHour) / 19) * 100;
            return (
              <div 
                key={idx}
                className={`timeline-segment ${m.type?.toLowerCase()}`}
                style={{ left: `${Math.max(0, left)}%`, width: `${Math.min(width, 100 - left)}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Align27Widget;
