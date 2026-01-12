import React, { useState, useEffect, useRef } from 'react';
import { Upload, File, Trash2, CheckCircle, XCircle, Loader2, Search, Database } from 'lucide-react';
import './KnowledgeBase.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

function KnowledgeBase() {
  const [sources, setSources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSources();
    loadStats();
  }, []);

  const loadSources = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/kb/sources`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSources(data);
    } catch (error) {
      console.error('Error loading sources:', error);
    }
  };

  const loadStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/kb/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadProgress({ filename: file.name, status: 'uploading' });

    try {
      const res = await fetch(`${API_URL}/api/kb/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setUploadProgress({ 
          filename: file.name, 
          status: 'processing', 
          sourceId: data.source_id 
        });
        
        // Poll for progress
        pollProgress(data.source_id);
      } else {
        setUploadProgress({ filename: file.name, status: 'error', error: data.detail });
        setTimeout(() => setUploadProgress(null), 5000);
      }
    } catch (error) {
      setUploadProgress({ filename: file.name, status: 'error', error: error.message });
      setTimeout(() => setUploadProgress(null), 5000);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pollProgress = async (sourceId) => {
    const token = localStorage.getItem('token');
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes max

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/api/kb/sources/${sourceId}/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const progress = await res.json();

        setUploadProgress(prev => ({
          ...prev,
          ...progress
        }));

        if (progress.status === 'completed') {
          setTimeout(() => {
            setUploadProgress(null);
            loadSources();
            loadStats();
          }, 2000);
        } else if (progress.status === 'failed') {
          setTimeout(() => setUploadProgress(null), 5000);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000);
        }
      } catch (error) {
        console.error('Error polling progress:', error);
      }
    };

    poll();
  };

  const deleteSource = async (sourceId) => {
    if (!window.confirm('Delete this source and all its chunks?')) return;

    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/kb/sources/${sourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadSources();
      loadStats();
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const token = localStorage.getItem('token');
    setSearching(true);

    try {
      const res = await fetch(`${API_URL}/api/kb/search?query=${encodeURIComponent(searchQuery)}&top_k=5`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching:', error);
    }

    setSearching(false);
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle className="status-icon completed" size={16} />;
      case 'FAILED':
        return <XCircle className="status-icon failed" size={16} />;
      case 'PROCESSING':
      case 'PENDING':
        return <Loader2 className="status-icon processing" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="knowledge-base" data-testid="knowledge-base">
      <h2><Database size={24} /> Knowledge Base</h2>

      {/* Stats */}
      {stats && (
        <div className="kb-stats" data-testid="kb-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total_sources}</span>
            <span className="stat-label">Sources</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.completed_sources}</span>
            <span className="stat-label">Processed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total_chunks}</span>
            <span className="stat-label">Chunks</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total_vectors}</span>
            <span className="stat-label">Vectors</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.max_files - stats.total_sources}</span>
            <span className="stat-label">Slots Left</span>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="kb-upload-section" data-testid="kb-upload-section">
        <h3>Upload Files</h3>
        <p className="upload-hint">
          Supported formats: PDF, JSON, TXT (max 25MB per file)
        </p>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.json,.txt"
          style={{ display: 'none' }}
          data-testid="file-input"
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-upload"
          data-testid="upload-btn"
        >
          <Upload size={18} />
          {uploading ? 'Uploading...' : 'Select File'}
        </button>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="upload-progress" data-testid="upload-progress">
            <div className="progress-header">
              <File size={16} />
              <span>{uploadProgress.filename}</span>
              <span className={`progress-status ${uploadProgress.status}`}>
                {uploadProgress.status}
              </span>
            </div>
            {uploadProgress.progress_percent !== undefined && (
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress.progress_percent}%` }}
                />
              </div>
            )}
            {uploadProgress.current_step && (
              <div className="progress-step">{uploadProgress.current_step}</div>
            )}
            {uploadProgress.error && (
              <div className="progress-error">{uploadProgress.error}</div>
            )}
          </div>
        )}
      </div>

      {/* Sources List */}
      <div className="kb-sources" data-testid="kb-sources">
        <h3>Uploaded Sources ({sources.length})</h3>
        {sources.length === 0 ? (
          <p className="no-sources">No files uploaded yet. Upload PDF, JSON, or TXT files to build your knowledge base.</p>
        ) : (
          <div className="sources-list">
            {sources.map(source => (
              <div key={source.id} className="source-card" data-testid={`source-${source.id}`}>
                <div className="source-icon">
                  <File size={24} />
                </div>
                <div className="source-info">
                  <div className="source-name">{source.filename}</div>
                  <div className="source-meta">
                    <span className="source-type">{source.file_type}</span>
                    <span className="source-size">{(source.file_size / 1024).toFixed(1)} KB</span>
                    <span className="source-chunks">{source.chunk_count} chunks</span>
                  </div>
                </div>
                <div className="source-status">
                  {getStatusIcon(source.status)}
                  <span>{source.status}</span>
                </div>
                <button 
                  onClick={() => deleteSource(source.id)}
                  className="btn-delete"
                  data-testid={`delete-source-${source.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="kb-search" data-testid="kb-search">
        <h3>Search Knowledge Base</h3>
        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for astrological concepts..."
            data-testid="search-input"
          />
          <button 
            onClick={handleSearch}
            disabled={searching}
            className="btn-search"
            data-testid="search-btn"
          >
            {searching ? <Loader2 className="spinning" size={18} /> : <Search size={18} />}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="search-results" data-testid="search-results">
            {searchResults.map((result, idx) => (
              <div key={idx} className="search-result">
                <div className="result-header">
                  <span className="result-source">{result.source}</span>
                  {result.page_number && <span className="result-page">Page {result.page_number}</span>}
                  <span className="result-score">Score: {result.score}</span>
                </div>
                <p className="result-content">{result.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default KnowledgeBase;
