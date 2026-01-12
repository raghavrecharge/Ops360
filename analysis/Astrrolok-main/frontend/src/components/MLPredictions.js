import React, { useState, useEffect, useCallback } from 'react';
import { Brain, TrendingUp, Plus, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import './MLPredictions.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const EVENT_DESCRIPTIONS = {
  marriage: 'Marriage or significant relationship milestone',
  job_change: 'Career change, promotion, or job transition',
  health_issue: 'Significant health event or concern',
  foreign_travel: 'International travel or relocation',
  property_purchase: 'Real estate acquisition or major purchase'
};

function MLPredictions({ profileId }) {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [features, setFeatures] = useState(null);
  
  // Training form
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [trainingData, setTrainingData] = useState({
    event_type: 'marriage',
    event_date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const loadStats = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/ml/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  const extractFeatures = useCallback(async () => {
    if (!profileId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/ml/extract-features?profile_id=${profileId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFeatures(data.features);
    } catch (error) {
      console.error('Error extracting features:', error);
    }
  }, [profileId]);

  useEffect(() => {
    loadStats();
    extractFeatures();
  }, [loadStats, extractFeatures]);

  const runPrediction = async () => {
    if (!features) {
      alert('Please wait for features to load');
      return;
    }

    const token = localStorage.getItem('token');
    setLoading(true);
    setPredictions(null);

    try {
      const res = await fetch(`${API_URL}/api/ml/predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile_id: profileId,
          features: features
        })
      });
      const data = await res.json();
      setPredictions(data);
    } catch (error) {
      console.error('Error running prediction:', error);
    }

    setLoading(false);
  };

  const trainModel = async () => {
    const token = localStorage.getItem('token');
    setTraining(true);

    try {
      const res = await fetch(`${API_URL}/api/ml/train?min_examples=5`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`Model trained successfully!\nVersion: ${data.version}\nTest Score: ${(data.metrics.test_score * 100).toFixed(1)}%`);
        loadStats();
      } else {
        alert(`Training failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error training model:', error);
      alert('Error training model');
    }

    setTraining(false);
  };

  const addTrainingExample = async () => {
    if (!features) {
      alert('Please wait for features to load');
      return;
    }

    const token = localStorage.getItem('token');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/ml/training-examples`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile_id: profileId,
          event_type: trainingData.event_type,
          event_date: trainingData.event_date,
          features: features,
          metadata: { source: 'user_submitted' }
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert('Training example added successfully!');
        setShowTrainingForm(false);
        loadStats();
      } else {
        alert(`Error: ${data.detail}`);
      }
    } catch (error) {
      console.error('Error adding training example:', error);
      alert('Error adding training example');
    }

    setSubmitting(false);
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 0.7) return '#4caf50';
    if (prob >= 0.4) return '#ffc107';
    return '#f44336';
  };

  return (
    <div className="ml-predictions" data-testid="ml-predictions">
      <h2><Brain size={24} /> Life Event Predictions</h2>
      <p className="ml-subtitle">
        AI-powered predictions based on your astrological profile
      </p>

      {/* Stats Section */}
      {stats && (
        <div className="ml-stats" data-testid="ml-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total_examples}</span>
            <span className="stat-label">Training Examples</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {stats.active_model ? '✓' : '✗'}
            </span>
            <span className="stat-label">Model Trained</span>
          </div>
          {stats.active_model?.metrics && (
            <div className="stat-card">
              <span className="stat-value">
                {(stats.active_model.metrics.test_score * 100).toFixed(0)}%
              </span>
              <span className="stat-label">Accuracy</span>
            </div>
          )}
        </div>
      )}

      {/* Event Labels */}
      <div className="event-labels" data-testid="event-labels">
        <h3>Predictable Events</h3>
        <div className="labels-grid">
          {Object.entries(EVENT_DESCRIPTIONS).map(([key, desc]) => (
            <div key={key} className="label-card">
              <span className="label-name">{key.replace('_', ' ')}</span>
              <span className="label-desc">{desc}</span>
              {stats?.by_event_type && (
                <span className="label-count">
                  {stats.by_event_type[key]} examples
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="ml-actions" data-testid="ml-actions">
        <button 
          onClick={runPrediction}
          disabled={loading || !stats?.active_model}
          className="btn-predict"
          data-testid="predict-btn"
        >
          {loading ? <Loader2 className="spinning" size={18} /> : <TrendingUp size={18} />}
          {loading ? 'Predicting...' : 'Run Prediction'}
        </button>
        
        <button 
          onClick={() => setShowTrainingForm(true)}
          className="btn-add-example"
          data-testid="add-example-btn"
        >
          <Plus size={18} /> Add Training Example
        </button>
        
        <button 
          onClick={trainModel}
          disabled={training || (stats?.total_examples || 0) < 5}
          className="btn-train"
          data-testid="train-btn"
        >
          {training ? <Loader2 className="spinning" size={18} /> : <Brain size={18} />}
          {training ? 'Training...' : 'Train Model'}
        </button>
      </div>

      {/* Training Form */}
      {showTrainingForm && (
        <div className="training-form-overlay" data-testid="training-form">
          <div className="training-form">
            <h3>Add Training Example</h3>
            <p>Record a life event that occurred for this profile</p>
            
            <div className="form-group">
              <label>Event Type</label>
              <select
                value={trainingData.event_type}
                onChange={(e) => setTrainingData({...trainingData, event_type: e.target.value})}
                data-testid="event-type-select"
              >
                {Object.keys(EVENT_DESCRIPTIONS).map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Event Date</label>
              <input
                type="date"
                value={trainingData.event_date}
                onChange={(e) => setTrainingData({...trainingData, event_date: e.target.value})}
                data-testid="event-date-input"
              />
            </div>
            
            <div className="form-actions">
              <button 
                onClick={() => setShowTrainingForm(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={addTrainingExample}
                disabled={submitting}
                className="btn-submit"
                data-testid="submit-example-btn"
              >
                {submitting ? <Loader2 className="spinning" size={16} /> : <CheckCircle size={16} />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Results */}
      {predictions && (
        <div className="predictions-results" data-testid="predictions-results">
          {predictions.success ? (
            <>
              <h3>Prediction Results</h3>
              
              <div className="probabilities-grid">
                {Object.entries(predictions.probabilities).map(([event, prob]) => (
                  <div key={event} className="probability-card">
                    <div className="prob-header">
                      <span className="prob-event">{event.replace('_', ' ')}</span>
                      <span 
                        className="prob-value"
                        style={{ color: getProbabilityColor(prob) }}
                      >
                        {(prob * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="prob-bar-container">
                      <div 
                        className="prob-bar"
                        style={{ 
                          width: `${prob * 100}%`,
                          backgroundColor: getProbabilityColor(prob)
                        }}
                      />
                    </div>
                    <span className="prob-status">
                      {predictions.predictions[event] ? 'Likely' : 'Unlikely'}
                    </span>
                  </div>
                ))}
              </div>
              
              {predictions.top_factors && predictions.top_factors.length > 0 && (
                <div className="top-factors">
                  <h4>Key Astrological Factors</h4>
                  {predictions.top_factors.map((factor, idx) => (
                    <div key={idx} className="factor-card">
                      <AlertTriangle size={16} className="factor-icon" />
                      <div className="factor-content">
                        <strong>{factor.factor}</strong>
                        <p>{factor.description}</p>
                        <span className="factor-impact">{factor.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="prediction-error">
              <AlertTriangle size={24} />
              <p>{predictions.error}</p>
              <p className="error-hint">
                Train a model with at least 5 examples to enable predictions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MLPredictions;
