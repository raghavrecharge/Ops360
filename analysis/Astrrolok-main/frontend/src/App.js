import React, { useState } from 'react';
import './App.css';
import Workspace from './components/Workspace';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function App() {
  const [status, setStatus] = React.useState('loading');
  const [demoSetup, setDemoSetup] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(!!localStorage.getItem('token'));
  const [loginForm, setLoginForm] = React.useState({ email: '', password: '' });

  React.useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') {
          setStatus('connected');
        }
      })
      .catch(() => setStatus('error'));
  }, []);

  const setupDemo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/demo/setup`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        setDemoSetup(true);
        setLoginForm({ email: 'demo@astroos.com', password: 'demo123' });
      }
    } catch (err) {
      console.error('Demo setup failed:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', loginForm.email);
      formData.append('password', loginForm.password);
      
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        setIsLoggedIn(true);
      } else {
        alert('Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed');
    }
  };

  if (isLoggedIn) {
    return <Workspace />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>AstroOS</h1>
        <p className="subtitle">Complete Vedic Astrology Platform</p>
        
        <div className="status-card">
          <div className="status-indicator">
            <span className={`dot ${status}`}></span>
            <span>Backend Status: {status}</span>
          </div>
          
          {!demoSetup && status === 'connected' && (
            <button onClick={setupDemo} className="demo-button">
              Setup Demo Data
            </button>
          )}
          
          {demoSetup && (
            <div className="demo-credentials">
              <h3>✓ Demo Setup Complete</h3>
              <p>Email: demo@astroos.com</p>
              <p>Password: demo123</p>
            </div>
          )}
          
          {status === 'connected' && (
            <form onSubmit={handleLogin} className="login-form">
              <h3>Login</h3>
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="login-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="login-input"
              />
              <button type="submit" className="login-button">Login</button>
            </form>
          )}
        </div>

        <div className="features">
          <h2>Features</h2>
          <ul>
            <li>✓ Complete Chart Calculations (D1-D60)</li>
            <li>✓ 5-Level Vimshottari Dasha</li>
            <li>✓ Yogini & Chara Dasha Systems</li>
            <li>✓ Ashtakavarga Tables</li>
            <li>✓ Yoga Detection</li>
            <li>✓ Align27 Daily Scores & Moments</li>
            <li>✓ RAG Knowledge Base</li>
            <li>✓ ML Predictions</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
