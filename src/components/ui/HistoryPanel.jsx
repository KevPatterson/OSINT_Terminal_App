import React, { useState, useEffect, useCallback } from 'react';
import Icon from 'components/AppIcon';

const HISTORY_KEY = 'osint_history';
const MAX_STORAGE_BYTES = 5120 * 1024; // ~5MB estimate

const HistoryPanel = ({ onReScan, currentTarget, currentMode }) => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);

  // Load history from localStorage
  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.sort((a, b) => b.id - a.id));
        setStorageUsed(new Blob([stored]).size);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setStorageWarning(true);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    // Listen for storage changes from other tabs
    const handleStorage = (e) => {
      if (e.key === HISTORY_KEY) {
        loadHistory();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadHistory]);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory) => {
    try {
      const serialized = JSON.stringify(newHistory);
      localStorage.setItem(HISTORY_KEY, serialized);
      setStorageUsed(new Blob([serialized]).size);
      setStorageWarning(false);
    } catch (err) {
      console.error('Failed to save history:', err);
      setStorageWarning(true);
    }
  }, []);

  // Add new scan to history
  const addToHistory = useCallback((entry) => {
    setHistory((prev) => {
      const newHistory = [entry, ...prev].slice(0, 100); // Keep last 100 scans
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // Delete single entry
  const deleteEntry = (id) => {
    setHistory((prev) => {
      const newHistory = prev.filter((e) => e.id !== id);
      saveHistory(newHistory);
      return newHistory;
    });
    if (expandedId === id) setExpandedId(null);
  };

  // Clear all history
  const clearAll = () => {
    if (window.confirm('Are you sure you want to delete all scan history?')) {
      try {
        localStorage.removeItem(HISTORY_KEY);
        setHistory([]);
        setStorageUsed(0);
        setExpandedId(null);
      } catch (err) {
        console.error('Failed to clear history:', err);
      }
    }
  };

  // Re-run a scan
  const handleReScan = (entry) => {
    if (onReScan) {
      onReScan(entry.target, entry.mode);
    }
  };

  // Toggle expand
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Format timestamp
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format duration
  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Get threat level badge color
  const getThreatColor = (level) => {
    switch (level) {
      case 'HIGH':
        return 'text-destructive border-destructive bg-destructive/10';
      case 'MEDIUM':
        return 'text-warning border-warning bg-warning/10';
      case 'LOW':
        return 'text-success border-success bg-success/10';
      default:
        return 'text-muted-foreground border-border';
    }
  };

  // Get mode badge color
  const getModeColor = (mode) => {
    switch (mode) {
      case 'username':
        return 'text-accent border-accent bg-accent/10';
      case 'domain':
        return 'text-secondary border-secondary bg-secondary/10';
      case 'ip':
        return 'text-primary border-primary bg-primary/10';
      case 'dorks':
        return 'text-warning border-warning bg-warning/10';
      default:
        return 'text-muted-foreground border-border';
    }
  };

  // Filter history
  const filteredHistory = history.filter(
    (entry) =>
      entry.target.toLowerCase().includes(filter.toLowerCase()) ||
      entry.mode.toLowerCase().includes(filter.toLowerCase())
  );

  // Storage usage percentage
  const storagePercent = Math.min((storageUsed / MAX_STORAGE_BYTES) * 100, 100);

  return (
    <div className="w-full">
      {/* Storage warning */}
      {storageWarning && (
        <div className="mb-4 p-3 border border-warning rounded-terminal bg-warning/10 flex items-center gap-2">
          <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
          <span className="font-jetbrains text-xs text-warning">
            Warning: localStorage access blocked or full. History may not be saved.
          </span>
        </div>
      )}

      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Icon name="History" size={16} color="var(--color-primary)" />
          <span className="font-orbitron text-sm text-primary tracking-widest uppercase">
            Scan History
          </span>
          <span className="font-jetbrains text-xs text-muted-foreground">
            ({filteredHistory.length} / {history.length})
          </span>
        </div>

        {/* Filter input */}
        <div className="relative flex-1 max-w-xs">
          <Icon
            name="Search"
            size={14}
            color="var(--color-muted-foreground)"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by target..."
            className="w-full pl-9 pr-8 py-1.5 bg-input border border-border rounded-terminal font-jetbrains text-xs text-primary placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              <Icon name="X" size={12} />
            </button>
          )}
        </div>

        {/* Clear all button */}
        {history.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-1.5 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-terminal transition-colors font-jetbrains text-xs"
          >
            <Icon name="Trash2" size={12} />
            CLEAR ALL
          </button>
        )}
      </div>

      {/* Storage usage bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="font-jetbrains text-xs text-muted-foreground">Storage Usage</span>
          <span className="font-jetbrains text-xs text-muted-foreground">
            {(storageUsed / 1024).toFixed(1)} KB / ~5 MB
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              storagePercent > 80 ? 'bg-destructive' : storagePercent > 50 ? 'bg-warning' : 'bg-success'
            }`}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
      </div>

      {/* History list */}
      {filteredHistory.length === 0 ? (
        <div className="card-terminal flex flex-col items-center justify-center py-12 text-center">
          <Icon name="History" size={32} color="var(--color-muted-foreground)" className="mb-3 opacity-40" />
          <div className="font-orbitron text-sm text-muted-foreground opacity-60">
            {history.length === 0 ? 'NO SCAN HISTORY' : 'NO MATCHING RESULTS'}
          </div>
          <div className="font-jetbrains text-xs text-muted-foreground opacity-40 mt-1">
            {history.length === 0
              ? 'Execute a scan to begin recording history'
              : 'Try a different filter term'}
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredHistory.map((entry) => (
            <div
              key={entry.id}
              className={`border rounded-terminal overflow-hidden transition-all ${
                expandedId === entry.id ? 'border-primary' : 'border-border hover:border-secondary'
              }`}
            >
              {/* Entry header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer bg-card hover:bg-primary/5"
                onClick={() => toggleExpand(entry.id)}
              >
                {/* Mode badge */}
                <span
                  className={`px-2 py-0.5 rounded-terminal border font-jetbrains text-xs uppercase ${getModeColor(
                    entry.mode
                  )}`}
                >
                  {entry.mode}
                </span>

                {/* Target */}
                <span className="font-share-tech text-sm text-primary flex-1 truncate">
                  {entry.target}
                </span>

                {/* Threat level */}
                {entry.results?.threat_level && entry.results.threat_level !== 'N/A' && (
                  <span
                    className={`px-2 py-0.5 rounded-terminal border font-jetbrains text-xs ${getThreatColor(
                      entry.results.threat_level
                    )}`}
                  >
                    {entry.results.threat_level}
                  </span>
                )}

                {/* Timestamp */}
                <span className="font-jetbrains text-xs text-muted-foreground hidden sm:inline">
                  {formatTime(entry.timestamp)}
                </span>

                {/* Expand icon */}
                <Icon
                  name={expandedId === entry.id ? 'ChevronUp' : 'ChevronDown'}
                  size={14}
                  color="var(--color-muted-foreground)"
                />
              </div>

              {/* Expanded details */}
              {expandedId === entry.id && (
                <div className="p-3 border-t border-border bg-muted/30 animate-fade-in">
                  {/* Summary */}
                  {entry.results?.summary && (
                    <div className="mb-3">
                      <span className="font-jetbrains text-xs text-secondary">Summary:</span>
                      <p className="font-share-tech text-sm text-primary mt-1">
                        {entry.results.summary}
                      </p>
                    </div>
                  )}

                  {/* Findings */}
                  {entry.results?.findings && entry.results.findings.length > 0 && (
                    <div className="mb-3">
                      <span className="font-jetbrains text-xs text-secondary">Key Findings:</span>
                      <ul className="mt-1 space-y-1">
                        {entry.results.findings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-secondary mt-0.5">▸</span>
                            <span className="font-jetbrains text-xs text-muted-foreground">
                              {finding}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Result cards */}
                  {entry.results?.cards && entry.results.cards.length > 0 && (
                    <div className="mb-3">
                      <span className="font-jetbrains text-xs text-secondary">Results:</span>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {entry.results.cards.map((card, i) => (
                          <div
                            key={i}
                            className="p-2 border border-border rounded-terminal bg-card"
                          >
                            <span className="font-jetbrains text-xs text-muted-foreground block">
                              {card.label}
                            </span>
                            <span className="font-roboto-mono text-sm text-primary">
                              {card.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="flex items-center gap-4 mb-3 text-xs">
                    <span className="font-jetbrains text-muted-foreground">
                      Duration: <span className="text-primary">{formatDuration(entry.duration_ms)}</span>
                    </span>
                    <span className="font-jetbrains text-muted-foreground">
                      ID: <span className="text-primary">{entry.id}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReScan(entry)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-terminal font-jetbrains text-xs hover:bg-primary/90 transition-colors"
                    >
                      <Icon name="RefreshCw" size={12} />
                      RE-SCAN
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-destructive text-destructive rounded-terminal font-jetbrains text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Icon name="X" size={12} />
                      DELETE
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Utility function to add scan to history (can be called from parent)
export const addScanToHistory = (scanData) => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    const history = stored ? JSON.parse(stored) : [];
    const newHistory = [scanData, ...history].slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return true;
  } catch (err) {
    console.error('Failed to add scan to history:', err);
    return false;
  }
};

export default HistoryPanel;
