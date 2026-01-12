import React from 'react';
import { Sparkles } from 'lucide-react';
import './AIInsightWidget.css';

function AIInsightWidget({ insightData, config = {} }) {
  if (!insightData) {
    return (
      <div className="ai-insight-widget-loading">
        <div className="loading-spinner"></div>
        <span>Generating insight...</span>
      </div>
    );
  }

  const insight = insightData.insight || insightData.text || '';

  return (
    <div className="ai-insight-widget" data-testid="ai-insight-widget">
      <div className="insight-header">
        <Sparkles size={16} className="insight-icon" />
        <span>Today&apos;s Insight</span>
      </div>
      <p className="insight-text">{insight}</p>
    </div>
  );
}

export default AIInsightWidget;
