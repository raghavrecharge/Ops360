import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { X, Download, Calendar, Star, Sun, Moon, Filter, ChevronRight } from 'lucide-react';
import KnowledgeBase from './KnowledgeBase';
import AstroChat from './AstroChat';
import MLPredictions from './MLPredictions';
import Dashboard from './dashboard/Dashboard';
import './Workspace.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function Workspace() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chartData, setChartData] = useState(null);
  const [dashaData, setDashaData] = useState(null);
  const [transitData, setTransitData] = useState(null);
  const [dashaSystem, setDashaSystem] = useState('vimshottari');
  const [expandedDashas, setExpandedDashas] = useState({});
  
  // Batch 3 state
  const [ashtakavargaData, setAshtakavargaData] = useState(null);
  const [yogasData, setYogasData] = useState(null);
  const [strengthData, setStrengthData] = useState(null);
  const [varshaphalaData, setVarshaphalaData] = useState(null);
  const [varshaphalaYear, setVarshaphalaYear] = useState(new Date().getFullYear());
  const [compatibilityData, setCompatibilityData] = useState(null);
  const [selectedProfile2, setSelectedProfile2] = useState(null);
  const [remediesData, setRemediesData] = useState(null);
  
  // Batch 4 state (Align27)
  const [todayData, setTodayData] = useState(null);
  const [plannerData, setPlannerData] = useState(null);
  const [plannerStart, setPlannerStart] = useState(new Date().toISOString().split('T')[0]);
  const [plannerDays, setPlannerDays] = useState(90);
  
  // Batch 4: Enhanced planner state
  const [plannerFilter, setPlannerFilter] = useState('all'); // all, green, golden
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);
  const [dayMoments, setDayMoments] = useState([]);
  const [dayRituals, setDayRituals] = useState([]);
  const [loadingDayDetail, setLoadingDayDetail] = useState(false);
  
  // ICS export state
  const [icsRangeStart, setIcsRangeStart] = useState(new Date().toISOString().split('T')[0]);
  const [icsRangeEnd, setIcsRangeEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/profiles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setProfiles(data);
    if (data.length > 0) {
      setSelectedProfile(data[0].id);
      loadChartData(data[0].id);
    }
  };

  const loadChartData = async (profileId) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    
    try {
      // Load chart bundle
      const chartRes = await fetch(`${API_URL}/api/charts/${profileId}/bundle`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const chartData = await chartRes.json();
      setChartData(chartData);
      
      // Load dashas
      const dashaRes = await fetch(`${API_URL}/api/dashas/${profileId}?system=${dashaSystem}&depth=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dashaData = await dashaRes.json();
      setDashaData(dashaData);
      
      // Load transits
      const transitRes = await fetch(`${API_URL}/api/transits/today/${profileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const transitData = await transitRes.json();
      setTransitData(transitData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
    setLoading(false);
  };

  // Batch 3 data loaders
  const loadAshtakavarga = async () => {
    if (!selectedProfile) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ashtakavarga/${selectedProfile}/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAshtakavargaData(data);
    } catch (error) {
      console.error('Error loading ashtakavarga:', error);
    }
    setLoading(false);
  };

  const loadYogas = async () => {
    if (!selectedProfile) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/yogas/${selectedProfile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setYogasData(data);
    } catch (error) {
      console.error('Error loading yogas:', error);
    }
    setLoading(false);
  };

  const loadStrength = async () => {
    if (!selectedProfile) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/strength/${selectedProfile}/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStrengthData(data);
    } catch (error) {
      console.error('Error loading strength:', error);
    }
    setLoading(false);
  };

  const loadVarshaphala = async (year) => {
    if (!selectedProfile) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/varshaphala/${selectedProfile}/${year}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setVarshaphalaData(data);
    } catch (error) {
      console.error('Error loading varshaphala:', error);
    }
    setLoading(false);
  };

  const loadCompatibility = async () => {
    if (!selectedProfile || !selectedProfile2) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/compatibility/${selectedProfile}/${selectedProfile2}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCompatibilityData(data);
    } catch (error) {
      console.error('Error loading compatibility:', error);
    }
    setLoading(false);
  };

  const loadRemedies = async () => {
    if (!selectedProfile) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/remedies/${selectedProfile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRemediesData(data);
    } catch (error) {
      console.error('Error loading remedies:', error);
    }
    setLoading(false);
  };

  // Batch 4: Align27 data loaders
  const loadTodayData = async () => {
    if (!selectedProfile) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/align27/today?profile_id=${selectedProfile}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTodayData(data);
    } catch (error) {
      console.error('Error loading today data:', error);
    }
    setLoading(false);
  };

  const loadPlanner = async () => {
    if (!selectedProfile) return;
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/align27/planner?profile_id=${selectedProfile}&start=${plannerStart}&days=${plannerDays}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPlannerData(data);
    } catch (error) {
      console.error('Error loading planner:', error);
    }
    setLoading(false);
  };

  const downloadICS = async (startDate, endDate) => {
    const token = localStorage.getItem('token');
    const profile = profiles.find(p => p.id === selectedProfile);
    const profileName = profile?.name?.replace(/\s+/g, '_') || 'profile';
    
    try {
      const res = await fetch(`${API_URL}/api/align27/ics?profile_id=${selectedProfile}&start=${startDate}&end=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AstroOS_${profileName}_${startDate}_${endDate}.ics`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading ICS:', error);
    }
  };

  // Load detailed day data for drawer
  const loadDayDetails = async (day) => {
    if (!selectedProfile || !day) return;
    
    setSelectedDayData(day);
    setDayDrawerOpen(true);
    setLoadingDayDetail(true);
    setDayMoments([]);
    setDayRituals([]);
    
    const token = localStorage.getItem('token');
    
    try {
      // Load moments and rituals in parallel
      const [momentsRes, ritualsRes] = await Promise.all([
        fetch(`${API_URL}/api/align27/moments?profile_id=${selectedProfile}&date=${day.date}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/align27/rituals?profile_id=${selectedProfile}&date=${day.date}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      const momentsData = await momentsRes.json();
      const ritualsData = await ritualsRes.json();
      
      setDayMoments(momentsData.moments || []);
      setDayRituals(ritualsData.rituals || []);
    } catch (error) {
      console.error('Error loading day details:', error);
    }
    setLoadingDayDetail(false);
  };

  // Tab change handler with data loading
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'ashtakavarga' && !ashtakavargaData) loadAshtakavarga();
    if (tab === 'yogas' && !yogasData) loadYogas();
    if (tab === 'strength' && !strengthData) loadStrength();
    if (tab === 'varshaphala' && !varshaphalaData) loadVarshaphala(varshaphalaYear);
    if (tab === 'remedies' && !remediesData) loadRemedies();
    if (tab === 'today' && !todayData) loadTodayData();
    if (tab === 'planner' && !plannerData) loadPlanner();
  };

  // Filtered planner data based on selected filter
  const filteredPlannerData = useMemo(() => {
    if (!plannerData?.planner) return [];
    
    switch (plannerFilter) {
      case 'green':
        return plannerData.planner.filter(d => d.color === 'GREEN');
      case 'golden':
        return plannerData.planner.filter(d => d.best_moment?.type === 'GOLDEN');
      default:
        return plannerData.planner;
    }
  }, [plannerData, plannerFilter]);

  // Timeline graph data for Today view
  const timelineGraphData = useMemo(() => {
    if (!todayData?.moments) return [];
    
    // Create hourly data points
    const hourlyData = [];
    for (let h = 5; h <= 23; h++) {
      const hourStr = h.toString().padStart(2, '0');
      const moment = todayData.moments.find(m => {
        const startHour = parseInt(m.start?.split(':')[0] || '0');
        const endHour = parseInt(m.end?.split(':')[0] || '0');
        return h >= startHour && h < endHour;
      });
      
      let score = 50; // baseline
      let type = 'neutral';
      if (moment) {
        type = moment.type?.toLowerCase() || 'neutral';
        score = type === 'golden' ? 90 : type === 'productive' ? 70 : 30;
      }
      
      hourlyData.push({
        hour: `${hourStr}:00`,
        score,
        type,
        label: moment?.type || 'Neutral'
      });
    }
    return hourlyData;
  }, [todayData]);

  const expandDasha = async (dashaId) => {
    if (expandedDashas[dashaId]) {
      setExpandedDashas({...expandedDashas, [dashaId]: null});
      return;
    }
    
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/dashas/node/${dashaId}/children`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setExpandedDashas({...expandedDashas, [dashaId]: data.children});
  };

  const downloadPDF = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/export/pdf/${selectedProfile}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astro_report.pdf';
    a.click();
  };

  const tabs = [
    { id: 'dashboard', label: '🏠 Dashboard' },
    { id: 'today', label: '🌟 Today' },
    { id: 'planner', label: '📅 Planner' },
    { id: 'charts', label: 'Charts' },
    { id: 'dashas', label: 'Dashas' },
    { id: 'transits', label: 'Transits' },
    { id: 'ashtakavarga', label: 'Ashtakavarga' },
    { id: 'yogas', label: 'Yogas' },
    { id: 'strength', label: 'Strength' },
    { id: 'varshaphala', label: 'Varshaphala' },
    { id: 'compatibility', label: 'Compatibility' },
    { id: 'remedies', label: 'Remedies' },
    { id: 'kb', label: '📚 Knowledge' },
    { id: 'chat', label: '💬 Chat' },
    { id: 'predictions', label: '🧠 Predictions' },
    { id: 'export', label: 'Export' }
  ];

  return (
    <div className="workspace" data-testid="workspace">
      <div className="workspace-header">
        <h1>AstroOS Workspace</h1>
        <select 
          value={selectedProfile} 
          onChange={(e) => {
            const id = parseInt(e.target.value);
            setSelectedProfile(id);
            loadChartData(id);
            // Reset Batch 3 data when profile changes
            setAshtakavargaData(null);
            setYogasData(null);
            setStrengthData(null);
            setVarshaphalaData(null);
            // Reset Batch 4 data
            setTodayData(null);
            setPlannerData(null);
            setRemediesData(null);
          }}
          className="profile-selector"
          data-testid="profile-selector"
        >
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="workspace-tabs">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={activeTab === tab.id ? 'tab-active' : ''}
            onClick={() => handleTabChange(tab.id)}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="loading-indicator">Loading...</div>}

      <div className="workspace-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            profileId={selectedProfile} 
            onNavigateToTab={setActiveTab}
          />
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && chartData && (
          <div className="charts-view" data-testid="charts-view">
            <h2>North Indian Chart (D1 - Rashi)</h2>
            <NorthIndianChart data={chartData.d1} />
            
            <h3>Planetary Positions</h3>
            <table className="planetary-table">
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>Rasi</th>
                  <th>Degree</th>
                  <th>Nakshatra</th>
                  <th>Pada</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {chartData.planetary_table.map(p => (
                  <tr key={p.planet}>
                    <td>{p.planet}</td>
                    <td>{p.rasi}</td>
                    <td>{p.degree_in_rasi?.toFixed(2)}°</td>
                    <td>{p.nakshatra}</td>
                    <td>{p.pada}</td>
                    <td>
                      {p.is_retrograde && <span className="badge-retro">R</span>}
                      {p.is_combust && <span className="badge-combust">C</span>}
                      {p.dignity === 'Exalted' && <span className="badge-exalted">E</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dashas Tab */}
        {activeTab === 'dashas' && dashaData && (
          <div className="dashas-view" data-testid="dashas-view">
            <div className="dasha-controls">
              <label>
                System:
                <select value={dashaSystem} onChange={(e) => {
                  setDashaSystem(e.target.value);
                  loadChartData(selectedProfile);
                }}>
                  <option value="vimshottari">Vimshottari</option>
                  <option value="yogini">Yogini</option>
                  <option value="ashtottari">Ashtottari</option>
                  <option value="kala_chakra">Kala Chakra</option>
                  <option value="chara">Chara (Jaimini)</option>
                </select>
              </label>
            </div>

            <h3>Current Dasha</h3>
            {dashaData.current && (
              <div className="current-dasha">
                <p><strong>{dashaData.current.lord}</strong> Maha Dasha</p>
                <p>{new Date(dashaData.current.start_date).toLocaleDateString()} - {new Date(dashaData.current.end_date).toLocaleDateString()}</p>
              </div>
            )}

            <h3>Dasha Timeline</h3>
            <div className="dasha-list">
              {dashaData.dashas?.map(dasha => (
                <div key={dasha.id} className="dasha-item">
                  <div className="dasha-header" onClick={() => dasha.has_children && expandDasha(dasha.id)}>
                    <span className="dasha-lord">{dasha.lord}</span>
                    <span className="dasha-dates">
                      {new Date(dasha.start_date).toLocaleDateString()} - {new Date(dasha.end_date).toLocaleDateString()}
                    </span>
                    {dasha.has_children && <span className="expand-icon">{expandedDashas[dasha.id] ? '▼' : '▶'}</span>}
                  </div>
                  
                  {expandedDashas[dasha.id] && (
                    <div className="dasha-children">
                      {expandedDashas[dasha.id].map(child => (
                        <div key={child.id} className="dasha-child" onClick={() => child.has_children && expandDasha(child.id)}>
                          <span>{child.lord}</span>
                          <span className="dasha-dates-small">
                            {new Date(child.start_date).toLocaleDateString()} - {new Date(child.end_date).toLocaleDateString()}
                          </span>
                          {child.has_children && <span className="expand-icon-small">{expandedDashas[child.id] ? '▼' : '▶'}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transits Tab */}
        {activeTab === 'transits' && transitData && (
          <div className="transits-view" data-testid="transits-view">
            <h2>Today&apos;s Transits</h2>
            <p className="transit-date">{new Date(transitData.date).toLocaleDateString()}</p>
            
            {transitData.sade_sati?.is_active && (
              <div className="alert alert-warning">
                <h3>⚠️ Sade Sati Active</h3>
                <p><strong>Phase:</strong> {transitData.sade_sati.phase}</p>
                <p>{transitData.sade_sati.description}</p>
              </div>
            )}
            
            <h3>Transiting Planets</h3>
            <table className="transit-table">
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>Rasi</th>
                  <th>Nakshatra</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transitData.transiting_planets && Object.entries(transitData.transiting_planets).map(([planet, data]) => (
                  <tr key={planet}>
                    <td>{planet}</td>
                    <td>{data.rasi}</td>
                    <td>{data.nakshatra}</td>
                    <td>{data.is_retrograde && <span className="badge-retro">Retrograde</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ashtakavarga Tab */}
        {activeTab === 'ashtakavarga' && (
          <div className="ashtakavarga-view" data-testid="ashtakavarga-view">
            <h2>Ashtakavarga Analysis</h2>
            {ashtakavargaData ? (
              <>
                <div className="summary-cards">
                  <div className="summary-card">
                    <h4>Total Points</h4>
                    <span className="big-number">{ashtakavargaData.summary?.total_points}</span>
                  </div>
                  <div className="summary-card">
                    <h4>Strongest House</h4>
                    <span className="big-number">{ashtakavargaData.summary?.max_rasi}</span>
                  </div>
                  <div className="summary-card">
                    <h4>Weakest House</h4>
                    <span className="big-number">{ashtakavargaData.summary?.min_rasi}</span>
                  </div>
                </div>
                
                <h3>SAV by House</h3>
                <div className="sav-grid">
                  {ashtakavargaData.sav_by_house && Object.entries(ashtakavargaData.sav_by_house).map(([house, points]) => (
                    <div key={house} className={`sav-cell ${points > 28 ? 'strong' : points < 25 ? 'weak' : ''}`}>
                      <span className="house-num">H{house}</span>
                      <span className="points">{points}</span>
                    </div>
                  ))}
                </div>
                
                <div className="house-lists">
                  <div className="strong-houses">
                    <h4>Strong Houses</h4>
                    <p>{ashtakavargaData.strong_houses?.join(', ') || 'None'}</p>
                  </div>
                  <div className="weak-houses">
                    <h4>Weak Houses</h4>
                    <p>{ashtakavargaData.weak_houses?.join(', ') || 'None'}</p>
                  </div>
                </div>
              </>
            ) : (
              <button onClick={loadAshtakavarga} className="btn-load">Load Ashtakavarga Data</button>
            )}
          </div>
        )}

        {/* Yogas Tab */}
        {activeTab === 'yogas' && (
          <div className="yogas-view" data-testid="yogas-view">
            <h2>Yoga Analysis</h2>
            {yogasData ? (
              <>
                <div className="yoga-summary">
                  <h3>{yogasData.count} Yogas Detected</h3>
                  <p>Categories: {yogasData.categories?.join(', ')}</p>
                </div>
                
                <div className="yoga-list">
                  {yogasData.yogas?.map((yoga, idx) => (
                    <div key={idx} className={`yoga-card strength-${yoga.strength > 7 ? 'high' : yoga.strength > 5 ? 'med' : 'low'}`}>
                      <div className="yoga-header">
                        <h4>{yoga.name}</h4>
                        <span className="yoga-type">{yoga.type}</span>
                      </div>
                      <p>{yoga.description}</p>
                      <div className="yoga-footer">
                        <span>Strength: {yoga.strength}/10</span>
                        <span>Planets: {yoga.forming_planets?.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <button onClick={loadYogas} className="btn-load">Load Yogas Data</button>
            )}
          </div>
        )}

        {/* Strength Tab */}
        {activeTab === 'strength' && (
          <div className="strength-view" data-testid="strength-view">
            <h2>Planetary Strength (Shadbala)</h2>
            {strengthData ? (
              <>
                <div className="strength-summary">
                  <div className="summary-card highlight">
                    <h4>Strongest Planet</h4>
                    <span className="planet-name">{strengthData.strongest_planet}</span>
                  </div>
                  <div className="summary-card">
                    <h4>Weakest Planet</h4>
                    <span className="planet-name">{strengthData.weakest_planet}</span>
                  </div>
                </div>
                
                <h3>Shadbala Summary</h3>
                <div className="shadbala-bars">
                  {strengthData.shadbala_summary && Object.entries(strengthData.shadbala_summary).map(([planet, value]) => (
                    <div key={planet} className="bar-row">
                      <span className="planet-label">{planet}</span>
                      <div className="bar-container">
                        <div className="bar" style={{width: `${Math.min(100, value / 4)}%`}}></div>
                      </div>
                      <span className="value">{value?.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
                
                <h3>Avasthas (Planetary States)</h3>
                <table className="avastha-table">
                  <thead>
                    <tr>
                      <th>Planet</th>
                      <th>Baladi</th>
                      <th>Jagradadi</th>
                      <th>Deeptadi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strengthData.avastha_summary && Object.entries(strengthData.avastha_summary).map(([planet, data]) => (
                      <tr key={planet}>
                        <td>{planet}</td>
                        <td>{data.baladi}</td>
                        <td>{data.jagradadi}</td>
                        <td>{data.deeptadi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <button onClick={loadStrength} className="btn-load">Load Strength Data</button>
            )}
          </div>
        )}

        {/* Varshaphala Tab */}
        {activeTab === 'varshaphala' && (
          <div className="varshaphala-view" data-testid="varshaphala-view">
            <h2>Varshaphala (Annual Chart)</h2>
            <div className="year-selector">
              <label>
                Year: 
                <input 
                  type="number" 
                  value={varshaphalaYear} 
                  onChange={(e) => setVarshaphalaYear(parseInt(e.target.value))}
                  min="1950" max="2050"
                />
              </label>
              <button onClick={() => loadVarshaphala(varshaphalaYear)} className="btn-load">Calculate</button>
            </div>
            
            {varshaphalaData ? (
              <>
                <div className="varsha-summary">
                  <p><strong>Year:</strong> {varshaphalaData.year}</p>
                  <p><strong>Varsha Pravesh:</strong> {new Date(varshaphalaData.varsha_pravesh_date).toLocaleString()}</p>
                  <p><strong>Annual Ascendant:</strong> Rasi {varshaphalaData.ascendant_rasi}</p>
                </div>
                
                <h3>Tajika Yogas ({varshaphalaData.tajika_yogas?.length || 0})</h3>
                <div className="tajika-list">
                  {varshaphalaData.tajika_yogas?.map((yoga, idx) => (
                    <div key={idx} className="tajika-card">
                      <h4>{yoga.name}</h4>
                      <p>{yoga.description}</p>
                      <span>Planets: {yoga.planets?.join(' - ')}</span>
                    </div>
                  ))}
                </div>
                
                <h3>Annual Predictions</h3>
                {varshaphalaData.predictions && (
                  <div className="predictions-grid">
                    <div className="prediction-card">
                      <h5>Overall</h5>
                      <p>{varshaphalaData.predictions.overall_theme}</p>
                    </div>
                    <div className="prediction-card">
                      <h5>Career</h5>
                      <p>{varshaphalaData.predictions.career}</p>
                    </div>
                    <div className="prediction-card">
                      <h5>Relationships</h5>
                      <p>{varshaphalaData.predictions.relationships}</p>
                    </div>
                    <div className="prediction-card">
                      <h5>Finance</h5>
                      <p>{varshaphalaData.predictions.finance}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p>Select a year and click Calculate to view annual chart.</p>
            )}
          </div>
        )}

        {/* Compatibility Tab */}
        {activeTab === 'compatibility' && (
          <div className="compatibility-view" data-testid="compatibility-view">
            <h2>Compatibility Analysis (Ashtakoot)</h2>
            <div className="profile-selectors">
              <div>
                <label>Profile 1:</label>
                <select value={selectedProfile} disabled className="profile-select">
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Profile 2:</label>
                <select 
                  value={selectedProfile2 || ''} 
                  onChange={(e) => setSelectedProfile2(parseInt(e.target.value))}
                  className="profile-select"
                >
                  <option value="">Select...</option>
                  {profiles.filter(p => p.id !== selectedProfile).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={loadCompatibility} disabled={!selectedProfile2} className="btn-load">
                Calculate Compatibility
              </button>
            </div>
            
            {compatibilityData ? (
              <>
                <div className="compat-summary">
                  <div className="compat-score">
                    <span className="score">{compatibilityData.total_score || compatibilityData.ashtakoot?.total}/36</span>
                    <span className="percentage">{((compatibilityData.total_score || compatibilityData.ashtakoot?.total || 0) / 36 * 100).toFixed(1)}%</span>
                    <span className={`compat-level ${(compatibilityData.total_score || 0) >= 25 ? 'excellent' : (compatibilityData.total_score || 0) >= 18 ? 'good' : 'average'}`}>
                      {(compatibilityData.total_score || 0) >= 25 ? 'Excellent' : (compatibilityData.total_score || 0) >= 18 ? 'Good' : 'Average'}
                    </span>
                  </div>
                </div>
                
                <h3>Koot Scores</h3>
                <table className="koot-table">
                  <thead>
                    <tr>
                      <th>Koot</th>
                      <th>Score</th>
                      <th>Max</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const scores = compatibilityData.ashtakoot?.scores || compatibilityData.ashtakoot || {};
                      const kootOrder = ['varna', 'vashya', 'tara', 'yoni', 'graha_maitri', 'gana', 'bhakoot', 'nadi'];
                      const maxScores = { varna: 1, vashya: 2, tara: 3, yoni: 4, graha_maitri: 5, gana: 6, bhakoot: 7, nadi: 8 };
                      
                      return kootOrder.map(koot => {
                        const data = scores[koot];
                        if (!data) return null;
                        return (
                          <tr key={koot}>
                            <td style={{textTransform: 'capitalize'}}>{koot.replace('_', ' ')}</td>
                            <td>{data.score}</td>
                            <td>{maxScores[koot]}</td>
                            <td>{data.description}</td>
                          </tr>
                        );
                      }).filter(Boolean);
                    })()}
                  </tbody>
                </table>
                
                <h3>Manglik Analysis</h3>
                <div className="manglik-info">
                  <p><strong>Profile 1:</strong> {compatibilityData.manglik_analysis?.profile1?.is_manglik ? 'Manglik' : 'Not Manglik'}</p>
                  <p><strong>Profile 2:</strong> {compatibilityData.manglik_analysis?.profile2?.is_manglik ? 'Manglik' : 'Not Manglik'}</p>
                  <p><strong>Recommendation:</strong> {compatibilityData.manglik_analysis?.recommendation}</p>
                </div>
                
                <h3>Recommendations</h3>
                <ul className="recommendations">
                  {compatibilityData.recommendations?.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Select two profiles to calculate compatibility.</p>
            )}
          </div>
        )}

        {/* Remedies Tab */}
        {activeTab === 'remedies' && (
          <div className="remedies-view" data-testid="remedies-view">
            <h2>Remedies & Recommendations</h2>
            {remediesData ? (
              <>
                <div className="weakness-summary">
                  <div className="weak-box">
                    <h4>Weak Planets</h4>
                    <p>{remediesData.weak_planets?.join(', ') || 'None'}</p>
                  </div>
                  <div className="afflicted-box">
                    <h4>Afflicted Planets</h4>
                    <p>{remediesData.afflicted_planets?.join(', ') || 'None'}</p>
                  </div>
                </div>
                
                <h3>Priority Remedies</h3>
                {remediesData.priority_planets?.map(planet => (
                  <div key={planet} className="remedy-section">
                    <h4>{planet} Remedies</h4>
                    {remediesData.remedies_by_planet?.[planet] && (
                      <div className="remedy-grid">
                        <div className="remedy-card">
                          <h5>💎 Gemstone</h5>
                          <p><strong>{remediesData.remedies_by_planet[planet].gemstone?.primary_gem}</strong></p>
                          <p>Metal: {remediesData.remedies_by_planet[planet].gemstone?.metal}</p>
                          <p>Finger: {remediesData.remedies_by_planet[planet].gemstone?.finger}</p>
                        </div>
                        <div className="remedy-card">
                          <h5>🕉️ Mantra</h5>
                          <p className="mantra-text">{remediesData.remedies_by_planet[planet].mantra?.beej_mantra}</p>
                          <p>Count: {remediesData.remedies_by_planet[planet].mantra?.minimum_count}</p>
                        </div>
                        <div className="remedy-card">
                          <h5>🙏 Charity</h5>
                          <p>Items: {remediesData.remedies_by_planet[planet].charity?.items_to_donate?.join(', ')}</p>
                          <p>Day: {remediesData.remedies_by_planet[planet].charity?.best_day}</p>
                        </div>
                        <div className="remedy-card">
                          <h5>🍽️ Fasting</h5>
                          <p>Day: {remediesData.remedies_by_planet[planet].fasting?.fasting_day}</p>
                          <p>Avoid: {remediesData.remedies_by_planet[planet].fasting?.food_to_avoid}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <h3>General Recommendations</h3>
                <ul className="general-recs">
                  {remediesData.general_recommendations?.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </>
            ) : (
              <button onClick={loadRemedies} className="btn-load">Load Remedies</button>
            )}
          </div>
        )}

        {/* Today Tab (Align27) */}
        {activeTab === 'today' && (
          <div className="today-view" data-testid="today-view">
            <h2>Today&apos;s Cosmic Forecast</h2>
            {todayData ? (
              <>
                <div className={`traffic-light traffic-${todayData.day_score?.color?.toLowerCase()}`} data-testid="traffic-light">
                  <div className="traffic-score">{todayData.day_score?.score}</div>
                  <div className="traffic-color">{todayData.day_score?.color}</div>
                </div>
                
                <div className="today-reasons">
                  <h4>Today&apos;s Influences</h4>
                  <ul>
                    {todayData.day_score?.reasons?.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Timeline Graph */}
                <div className="timeline-section">
                  <h3>Daily Energy Timeline</h3>
                  <div className="timeline-graph" data-testid="timeline-graph">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={timelineGraphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorGolden" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="hour" stroke="#888" fontSize={12} />
                        <YAxis domain={[0, 100]} stroke="#888" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ background: 'rgba(26, 26, 46, 0.95)', border: '1px solid #FFD700', borderRadius: '8px' }}
                          labelStyle={{ color: '#FFD700' }}
                          formatter={(value, name, props) => [props.payload.label, 'Energy']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#FFD700" 
                          fillOpacity={1} 
                          fill="url(#colorGolden)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <h3>Today&apos;s Moments</h3>
                <div className="moments-grid">
                  {todayData.moments?.map((moment, idx) => (
                    <div key={idx} className={`moment-card moment-${moment.type?.toLowerCase()}`} data-testid={`moment-${idx}`}>
                      <div className="moment-type">
                        {moment.type === 'GOLDEN' ? <Star className="moment-icon golden" /> : 
                         moment.type === 'PRODUCTIVE' ? <Sun className="moment-icon productive" /> : 
                         <Moon className="moment-icon silence" />} {moment.type}
                      </div>
                      <div className="moment-time">{moment.start} - {moment.end}</div>
                      <div className="moment-reason">{moment.reason}</div>
                      <div className="moment-confidence">Confidence: {(moment.confidence * 100).toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
                
                <h3>Recommended Rituals</h3>
                <div className="rituals-grid">
                  {todayData.rituals?.map((ritual, idx) => (
                    <div key={idx} className="ritual-card" data-testid={`ritual-${idx}`}>
                      <h4>{ritual.ritual_name}</h4>
                      <p>{ritual.description}</p>
                      <div className="ritual-meta">
                        <span>⏱️ {ritual.duration_minutes} min</span>
                        {ritual.tags && <span className="ritual-tags">{ritual.tags.join(', ')}</span>}
                      </div>
                      <p className="ritual-why"><em>{ritual.why}</em></p>
                    </div>
                  ))}
                </div>
                
                {/* Enhanced ICS Export Section */}
                <div className="ics-export-section" data-testid="ics-export-section">
                  <h3><Calendar size={20} /> Export to Calendar</h3>
                  <div className="ics-export-options">
                    <button 
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        downloadICS(today, today);
                      }} 
                      className="btn-ics"
                      data-testid="ics-today-btn"
                    >
                      <Download size={16} /> Today
                    </button>
                    
                    <div className="ics-custom-range">
                      <label>Custom Range:</label>
                      <div className="date-inputs">
                        <input 
                          type="date" 
                          value={icsRangeStart}
                          onChange={(e) => setIcsRangeStart(e.target.value)}
                          data-testid="ics-start-date"
                        />
                        <span>to</span>
                        <input 
                          type="date" 
                          value={icsRangeEnd}
                          onChange={(e) => setIcsRangeEnd(e.target.value)}
                          data-testid="ics-end-date"
                        />
                        <button 
                          onClick={() => downloadICS(icsRangeStart, icsRangeEnd)} 
                          className="btn-ics"
                          data-testid="ics-range-btn"
                        >
                          <Download size={16} /> Export Range
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <button onClick={loadTodayData} className="btn-load" data-testid="load-today-btn">Load Today&apos;s Forecast</button>
            )}
          </div>
        )}

        {/* Planner Tab (Align27) */}
        {activeTab === 'planner' && (
          <div className="planner-view" data-testid="planner-view">
            <h2>Cosmic Planner</h2>
            <div className="planner-controls">
              <label>
                Start Date:
                <input 
                  type="date" 
                  value={plannerStart}
                  onChange={(e) => setPlannerStart(e.target.value)}
                  data-testid="planner-start-date"
                />
              </label>
              <label>
                Days:
                <select value={plannerDays} onChange={(e) => setPlannerDays(parseInt(e.target.value))} data-testid="planner-days-select">
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                </select>
              </label>
              <button onClick={loadPlanner} className="btn-load" data-testid="generate-planner-btn">Generate Planner</button>
            </div>
            
            {plannerData ? (
              <>
                <div className="planner-summary">
                  <div className="summary-card">
                    <span className="count green-count">{plannerData.planner?.filter(d => d.color === 'GREEN').length}</span>
                    <span className="label">🟢 Green Days</span>
                  </div>
                  <div className="summary-card">
                    <span className="count amber-count">{plannerData.planner?.filter(d => d.color === 'AMBER').length}</span>
                    <span className="label">🟡 Amber Days</span>
                  </div>
                  <div className="summary-card">
                    <span className="count red-count">{plannerData.planner?.filter(d => d.color === 'RED').length}</span>
                    <span className="label">🔴 Red Days</span>
                  </div>
                  <div className="summary-card">
                    <span className="count golden-count">{plannerData.planner?.filter(d => d.best_moment?.type === 'GOLDEN').length}</span>
                    <span className="label">⭐ Days with Golden Moments</span>
                  </div>
                </div>
                
                {/* Planner Filters */}
                <div className="planner-filters" data-testid="planner-filters">
                  <Filter size={16} />
                  <button 
                    className={`filter-btn ${plannerFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setPlannerFilter('all')}
                    data-testid="filter-all"
                  >
                    All Days ({plannerData.planner?.length})
                  </button>
                  <button 
                    className={`filter-btn filter-green ${plannerFilter === 'green' ? 'active' : ''}`}
                    onClick={() => setPlannerFilter('green')}
                    data-testid="filter-green"
                  >
                    Only Green ({plannerData.planner?.filter(d => d.color === 'GREEN').length})
                  </button>
                  <button 
                    className={`filter-btn filter-golden ${plannerFilter === 'golden' ? 'active' : ''}`}
                    onClick={() => setPlannerFilter('golden')}
                    data-testid="filter-golden"
                  >
                    Has Golden Moments ({plannerData.planner?.filter(d => d.best_moment?.type === 'GOLDEN').length})
                  </button>
                </div>
                
                {/* ICS Export for Planner */}
                <div className="planner-export" data-testid="planner-export">
                  <button 
                    onClick={() => {
                      const endDate = new Date(plannerStart);
                      endDate.setDate(endDate.getDate() + plannerDays);
                      downloadICS(plannerStart, endDate.toISOString().split('T')[0]);
                    }} 
                    className="btn-ics"
                    data-testid="export-planner-ics"
                  >
                    <Download size={16} /> Export Full Range ICS ({plannerDays} days)
                  </button>
                </div>
                
                <div className="planner-grid" data-testid="planner-grid">
                  {filteredPlannerData.map((day, idx) => (
                    <div 
                      key={idx} 
                      className={`planner-day day-${day.color?.toLowerCase()} ${day.best_moment?.type === 'GOLDEN' ? 'has-golden' : ''}`}
                      onClick={() => loadDayDetails(day)}
                      data-testid={`planner-day-${idx}`}
                    >
                      <div className="day-date">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <div className="day-weekday">{day.weekday?.substring(0, 3)}</div>
                      <div className="day-score">{day.score}</div>
                      {day.best_moment && (
                        <div className="day-best-moment">
                          {day.best_moment.type === 'GOLDEN' && <Star size={12} />} {day.best_moment.start}-{day.best_moment.end}
                        </div>
                      )}
                      <ChevronRight size={14} className="day-arrow" />
                    </div>
                  ))}
                </div>
                
                {filteredPlannerData.length === 0 && (
                  <p className="no-results">No days match the selected filter.</p>
                )}
              </>
            ) : (
              <p className="planner-hint">Select a start date and click &quot;Generate Planner&quot; to view your cosmic forecast.</p>
            )}
          </div>
        )}

        {/* Day Detail Drawer */}
        <Sheet open={dayDrawerOpen} onOpenChange={setDayDrawerOpen}>
          <SheetContent side="right" className="day-drawer" data-testid="day-drawer">
            <SheetHeader>
              <SheetTitle className="drawer-title">
                {selectedDayData && new Date(selectedDayData.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </SheetTitle>
              <SheetDescription>
                Daily cosmic details and moments
              </SheetDescription>
            </SheetHeader>
            
            {selectedDayData && (
              <div className="drawer-content">
                {/* Day Score */}
                <div className={`drawer-score score-${selectedDayData.color?.toLowerCase()}`} data-testid="drawer-score">
                  <div className="score-value">{selectedDayData.score}</div>
                  <div className="score-color">{selectedDayData.color}</div>
                </div>
                
                {loadingDayDetail ? (
                  <div className="loading-indicator">Loading details...</div>
                ) : (
                  <>
                    {/* Moments */}
                    <div className="drawer-section">
                      <h4>Moments</h4>
                      <div className="drawer-moments">
                        {dayMoments.length > 0 ? dayMoments.map((m, idx) => (
                          <div key={idx} className={`drawer-moment moment-${m.type?.toLowerCase()}`}>
                            <span className="moment-type-badge">
                              {m.type === 'GOLDEN' ? <Star size={14} /> : 
                               m.type === 'PRODUCTIVE' ? <Sun size={14} /> : 
                               <Moon size={14} />} {m.type}
                            </span>
                            <span className="moment-time">{m.start} - {m.end}</span>
                            <p className="moment-reason">{m.reason}</p>
                          </div>
                        )) : (
                          <p className="no-data">No special moments for this day</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Rituals */}
                    <div className="drawer-section">
                      <h4>Recommended Rituals</h4>
                      <div className="drawer-rituals">
                        {dayRituals.length > 0 ? dayRituals.map((r, idx) => (
                          <div key={idx} className="drawer-ritual">
                            <strong>{r.ritual_name}</strong>
                            <p>{r.description}</p>
                            {r.duration_minutes && <span className="ritual-duration">⏱️ {r.duration_minutes} min</span>}
                          </div>
                        )) : (
                          <p className="no-data">No specific rituals for this day</p>
                        )}
                      </div>
                    </div>
                    
                    {/* ICS Download for this day */}
                    <div className="drawer-actions">
                      <button 
                        onClick={() => downloadICS(selectedDayData.date, selectedDayData.date)}
                        className="btn-ics full-width"
                        data-testid="drawer-ics-btn"
                      >
                        <Download size={16} /> Download ICS for this Day
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Knowledge Base Tab */}
        {activeTab === 'kb' && (
          <KnowledgeBase />
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <AstroChat />
        )}

        {/* ML Predictions Tab */}
        {activeTab === 'predictions' && (
          <MLPredictions profileId={selectedProfile} />
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="export-view" data-testid="export-view">
            <h2>Export Options</h2>
            <button onClick={downloadPDF} className="btn-download">
              📄 Download PDF Report
            </button>
            <p className="export-info">
              PDF report includes D1 chart, planetary positions, current dashas, and transit summary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NorthIndianChart({ data }) {
  if (!data) return <div>Loading chart...</div>;
  
  const { houses, sign_names } = data;
  
  // North Indian chart layout positions
  const positions = {
    1: { top: '0', left: '33.33%', width: '33.33%', height: '25%' },
    12: { top: '0', left: '0', width: '33.33%', height: '25%' },
    11: { top: '25%', left: '0', width: '33.33%', height: '25%' },
    10: { top: '50%', left: '0', width: '33.33%', height: '25%' },
    9: { top: '75%', left: '0', width: '33.33%', height: '25%' },
    8: { top: '75%', left: '33.33%', width: '33.33%', height: '25%' },
    7: { top: '75%', left: '66.66%', width: '33.33%', height: '25%' },
    6: { top: '50%', left: '66.66%', width: '33.33%', height: '25%' },
    5: { top: '25%', left: '66.66%', width: '33.33%', height: '25%' },
    4: { top: '0', left: '66.66%', width: '33.33%', height: '25%' },
    2: { top: '25%', left: '33.33%', width: '33.33%', height: '25%' },
    3: { top: '50%', left: '33.33%', width: '33.33%', height: '25%' }
  };
  
  return (
    <div className="north-indian-chart">
      {houses && Object.entries(houses).map(([houseNum, houseData]) => (
        <div 
          key={houseNum} 
          className="chart-house" 
          style={positions[parseInt(houseNum)]}
        >
          <div className="house-number">{houseNum}</div>
          <div className="sign-name">{sign_names?.[houseData.rasi - 1]}</div>
          <div className="planets">
            {houseData.planets?.map((p, i) => (
              <div key={i} className="planet-label">
                {p.planet?.substring(0, 2)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Workspace;
