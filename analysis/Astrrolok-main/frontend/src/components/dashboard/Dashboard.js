import React, { useState, useEffect, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import { Save, RotateCcw, Plus, X, Settings, Layout, ChevronDown } from 'lucide-react';
import ChartWidget from './widgets/ChartWidget';
import DashaWidget from './widgets/DashaWidget';
import TransitWidget from './widgets/TransitWidget';
import Align27Widget from './widgets/Align27Widget';
import YogasWidget from './widgets/YogasWidget';
import StrengthWidget from './widgets/StrengthWidget';
import AIInsightWidget from './widgets/AIInsightWidget';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function Dashboard({ profileId, onNavigateToTab }) {
  const [widgets, setWidgets] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [currentLayout, setCurrentLayout] = useState(null);
  const [layoutItems, setLayoutItems] = useState([]);
  const [widgetConfigs, setWidgetConfigs] = useState({});
  const [widgetData, setWidgetData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadWidgets = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/dashboard/widgets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setWidgets(data);
    } catch (error) {
      console.error('Error loading widgets:', error);
    }
  }, []);

  const loadLayouts = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/dashboard/layouts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLayouts(data);
    } catch (error) {
      console.error('Error loading layouts:', error);
    }
  }, []);

  const loadDefaultLayout = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/dashboard/layouts/default?profile_id=${profileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCurrentLayout(data);
      setLayoutItems(data.layout_json || []);
      setWidgetConfigs(data.widget_configs || {});
    } catch (error) {
      console.error('Error loading default layout:', error);
    }
  }, [profileId]);

  const loadWidgetData = useCallback(async (widgetId, dataSource) => {
    if (!dataSource || !profileId) return;
    
    const token = localStorage.getItem('token');
    const url = dataSource.replace('{profile_id}', profileId);
    
    try {
      const res = await fetch(`${API_URL}${url}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setWidgetData(prev => ({ ...prev, [widgetId]: data }));
    } catch (error) {
      console.error(`Error loading widget data for ${widgetId}:`, error);
    }
  }, [profileId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadWidgets();
      await loadLayouts();
      await loadDefaultLayout();
      setLoading(false);
    };
    init();
  }, [loadWidgets, loadLayouts, loadDefaultLayout]);

  useEffect(() => {
    if (widgets.length > 0 && layoutItems.length > 0 && profileId) {
      layoutItems.forEach(item => {
        const widget = widgets.find(w => w.widget_id === item.i);
        if (widget?.data_source) {
          loadWidgetData(item.i, widget.data_source);
        }
      });
    }
  }, [widgets, layoutItems, profileId, loadWidgetData]);

  const handleLayoutChange = (newLayout) => {
    setLayoutItems(newLayout);
  };

  const saveLayout = async (name, isDefault = false) => {
    const token = localStorage.getItem('token');
    setSaving(true);
    
    try {
      const payload = {
        layout_name: name || currentLayout?.layout_name || 'Custom Layout',
        profile_id: profileId,
        layout_json: layoutItems,
        widget_configs: widgetConfigs,
        is_default: isDefault
      };
      
      const url = currentLayout?.id && currentLayout.id !== 0
        ? `${API_URL}/api/dashboard/layouts/${currentLayout.id}`
        : `${API_URL}/api/dashboard/layouts`;
      
      const method = currentLayout?.id && currentLayout.id !== 0 ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      setCurrentLayout(data);
      await loadLayouts();
    } catch (error) {
      console.error('Error saving layout:', error);
    }
    
    setSaving(false);
  };

  const switchLayout = async (layoutId) => {
    if (layoutId === 0) {
      await loadDefaultLayout();
    } else {
      const layout = layouts.find(l => l.id === layoutId);
      if (layout) {
        setCurrentLayout(layout);
        setLayoutItems(layout.layout_json || []);
        setWidgetConfigs(layout.widget_configs || {});
      }
    }
    setShowLayoutMenu(false);
  };

  const resetToDefault = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/dashboard/layouts/default?profile_id=${profileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLayoutItems(data.layout_json || []);
      setWidgetConfigs({});
    } catch (error) {
      console.error('Error resetting layout:', error);
    }
  };

  const addWidget = (widgetId) => {
    const widget = widgets.find(w => w.widget_id === widgetId);
    if (!widget) return;
    
    const exists = layoutItems.find(item => item.i === widgetId);
    if (exists) return;
    
    const newItem = {
      i: widgetId,
      x: 0,
      y: Infinity,
      w: widget.default_width,
      h: widget.default_height,
      minW: widget.min_width,
      minH: widget.min_height,
      maxW: widget.max_width,
      maxH: widget.max_height
    };
    
    setLayoutItems([...layoutItems, newItem]);
    
    if (widget.data_source) {
      loadWidgetData(widgetId, widget.data_source);
    }
    
    setShowAddWidget(false);
  };

  const removeWidget = (widgetId) => {
    setLayoutItems(layoutItems.filter(item => item.i !== widgetId));
  };

  const renderWidget = (widgetId) => {
    const widget = widgets.find(w => w.widget_id === widgetId);
    const data = widgetData[widgetId];
    const config = { ...widget?.configurable_options, ...(widgetConfigs[widgetId] || {}) };
    
    if (!widget) return <div className="widget-error">Unknown widget</div>;

    switch (widgetId) {
      case 'chart_d1':
        return <ChartWidget chartData={data} config={config} chartType="D1" />;
      case 'chart_d9':
        return <ChartWidget chartData={data} config={config} chartType="D9" compact />;
      case 'chart_d10':
        return <ChartWidget chartData={data} config={config} chartType="D10" compact />;
      case 'chart_moon':
        return <ChartWidget chartData={data} config={config} chartType="MOON" compact />;
      case 'chart_transit':
        return <ChartWidget chartData={data?.current_transits ? { planets: data.current_transits, ascendant: { sign: 1 } } : null} config={config} chartType="TRANSIT" compact />;
      case 'dasha_running':
        return <DashaWidget dashaData={data} config={config} />;
      case 'transit_summary':
        return <TransitWidget transitData={data} config={config} />;
      case 'align27_today':
        return <Align27Widget todayData={data} config={config} />;
      case 'yogas_summary':
        return <YogasWidget yogasData={data} config={config} />;
      case 'strength_summary':
        return <StrengthWidget strengthData={data} config={config} />;
      case 'ai_insight':
        return <AIInsightWidget insightData={data} config={config} />;
      default:
        return <div className="widget-placeholder">{widget.title}</div>;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading" data-testid="dashboard-loading">
        <div className="loading-spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const availableWidgets = widgets.filter(w => !layoutItems.find(item => item.i === w.widget_id));

  return (
    <div className="dashboard" data-testid="dashboard">
      <div className="dashboard-header">
        <h2>Power Dashboard</h2>
        
        <div className="dashboard-controls">
          <div className="layout-selector">
            <button 
              className="btn-layout-select"
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              data-testid="layout-selector"
            >
              <Layout size={16} />
              {currentLayout?.layout_name || 'Default'}
              <ChevronDown size={14} />
            </button>
            
            {showLayoutMenu && (
              <div className="layout-menu" data-testid="layout-menu">
                <div className="layout-menu-item" onClick={() => switchLayout(0)}>
                  Default
                </div>
                {layouts.map(layout => (
                  <div 
                    key={layout.id}
                    className={`layout-menu-item ${currentLayout?.id === layout.id ? 'active' : ''}`}
                    onClick={() => switchLayout(layout.id)}
                  >
                    {layout.layout_name}
                    {layout.is_default && <span className="default-badge">★</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            className="btn-add-widget"
            onClick={() => setShowAddWidget(!showAddWidget)}
            data-testid="add-widget-btn"
          >
            <Plus size={16} /> Add Widget
          </button>
          
          <button 
            className="btn-reset"
            onClick={resetToDefault}
            data-testid="reset-layout-btn"
          >
            <RotateCcw size={16} /> Reset
          </button>
          
          <div className="save-controls">
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder="Layout name..."
              className="layout-name-input"
              data-testid="layout-name-input"
            />
            <button 
              className="btn-save"
              onClick={() => saveLayout(layoutName || 'My Layout', true)}
              disabled={saving}
              data-testid="save-layout-btn"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
      
      {showAddWidget && (
        <div className="add-widget-panel" data-testid="add-widget-panel">
          <h4>Available Widgets</h4>
          <div className="widget-options">
            {availableWidgets.map(widget => (
              <button
                key={widget.widget_id}
                className="widget-option"
                onClick={() => addWidget(widget.widget_id)}
              >
                <span className="widget-option-title">{widget.title}</span>
                <span className="widget-option-desc">{widget.description}</span>
              </button>
            ))}
            {availableWidgets.length === 0 && (
              <p className="no-widgets">All widgets are already added</p>
            )}
          </div>
        </div>
      )}
      
      <div className="dashboard-grid-container">
        <GridLayout
          className="dashboard-grid"
          layout={layoutItems}
          cols={10}
          rowHeight={80}
          width={1200}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".widget-header"
          compactType="vertical"
          preventCollision={false}
          data-testid="dashboard-grid"
        >
          {layoutItems.map(item => {
            const widget = widgets.find(w => w.widget_id === item.i);
            return (
              <div key={item.i} className="widget-container" data-testid={`widget-${item.i}`}>
                <div className="widget-header">
                  <span className="widget-title">{widget?.title || item.i}</span>
                  <button 
                    className="btn-remove-widget"
                    onClick={() => removeWidget(item.i)}
                    title="Remove widget"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="widget-content">
                  {renderWidget(item.i)}
                </div>
              </div>
            );
          })}
        </GridLayout>
      </div>
    </div>
  );
}

export default Dashboard;
