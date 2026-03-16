import React, { useEffect, useState } from 'react';
import Icon from 'components/AppIcon';

const DEFAULT_STAGES = [
  { id: 'init', label: 'INITIALIZING', icon: 'Power' },
  { id: 'resolve', label: 'RESOLVING TARGET', icon: 'Search' },
  { id: 'enumerate', label: 'ENUMERATING', icon: 'List' },
  { id: 'analyze', label: 'ANALYZING DATA', icon: 'BarChart2' },
  { id: 'compile', label: 'COMPILING RESULTS', icon: 'Package' },
];

const ProgressIndicatorSystem = ({
  isActive = false,
  isComplete = false,
  currentStage = '',
  progress = 0,           // 0-100
  stages = DEFAULT_STAGES,
  elapsedTime = 0,        // seconds
  onCancel,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const diff = progress - displayProgress;
    if (Math.abs(diff) < 0.5) {
      setDisplayProgress(progress);
      return;
    }
    const step = diff * 0.15;
    const timer = setTimeout(() => {
      setDisplayProgress((prev) => prev + step);
    }, 16);
    return () => clearTimeout(timer);
  }, [progress, displayProgress]);

  if (!isActive && !isComplete) return null;

  const currentStageIndex = stages?.findIndex((s) => s?.id === currentStage);
  const activeStage = stages?.find((s) => s?.id === currentStage) || stages?.[0];

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div
      className="w-full animate-fade-in"
      role="region"
      aria-label="Scan progress"
      aria-live="polite"
    >
      {/* Stage indicator row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <Icon name="CheckCircle" size={16} color="var(--color-success)" />
          ) : (
            <div className="terminal-pulse">
              <Icon name={activeStage?.icon || 'Activity'} size={16} color="var(--color-primary)" />
            </div>
          )}
          <span className="font-orbitron text-xs tracking-widest text-primary">
            {isComplete ? 'SCAN COMPLETE' : activeStage?.label || 'PROCESSING'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Elapsed time */}
          {elapsedTime > 0 && (
            <span className="font-roboto-mono text-xs text-muted-foreground">
              {formatTime(elapsedTime)}
            </span>
          )}

          {/* Progress percentage */}
          <span
            className={`font-roboto-mono text-sm font-medium ${
              isComplete ? 'text-success' : 'text-primary'
            }`}
          >
            {Math.round(displayProgress)}%
          </span>

          {/* Cancel button */}
          {isActive && !isComplete && onCancel && (
            <button
              onClick={onCancel}
              className="font-jetbrains text-xs text-destructive hover:text-error border border-destructive border-opacity-40 hover:border-opacity-80 px-2 py-0.5 rounded-terminal transition-all duration-250"
              aria-label="Cancel scan"
            >
              ABORT
            </button>
          )}
        </div>
      </div>
      {/* Main progress bar */}
      <div className="progress-bar-track mb-3" role="progressbar" aria-valuenow={Math.round(displayProgress)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="progress-bar-fill"
          style={{ width: `${Math.min(displayProgress, 100)}%` }}
        />
      </div>
      {/* Stage pipeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {stages?.map((stage, index) => {
          const isPast = currentStageIndex > index;
          const isCurrent = currentStageIndex === index;
          const isFuture = currentStageIndex < index;

          return (
            <React.Fragment key={stage?.id}>
              <div
                className={`flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-terminal border transition-all duration-250 ${
                  isComplete
                    ? 'border-success border-opacity-40 text-success'
                    : isPast
                    ? 'border-secondary border-opacity-40 text-secondary'
                    : isCurrent
                    ? 'border-primary text-primary border-glow' :'border-border border-opacity-30 text-muted-foreground opacity-40'
                }`}
              >
                {isComplete || isPast ? (
                  <Icon name="Check" size={10} />
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary terminal-pulse inline-block" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-30 inline-block" />
                )}
                <span className="font-jetbrains text-xs whitespace-nowrap">
                  {stage?.label}
                </span>
              </div>
              {/* Connector */}
              {index < stages?.length - 1 && (
                <div
                  className={`h-px w-3 flex-shrink-0 transition-all duration-250 ${
                    isComplete || isPast
                      ? 'bg-secondary opacity-60'
                      : isCurrent
                      ? 'bg-primary opacity-40' :'bg-border opacity-20'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Complete message */}
      {isComplete && (
        <div className="mt-3 flex items-center gap-2 font-jetbrains text-xs text-success animate-fade-in">
          <Icon name="Terminal" size={12} />
          <span>
            Reconnaissance complete in {formatTime(elapsedTime)} —{' '}
            <span className="text-muted-foreground">results compiled below</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicatorSystem;