import React, { useEffect, useRef, useCallback } from 'react';
import Icon from 'components/AppIcon';

const LINE_COLORS = {
  info: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
  dim: 'text-muted-foreground',
  accent: 'text-accent',
  system: 'text-secondary',
};

const LINE_PREFIXES = {
  info: '  ',
  success: '✓ ',
  warning: '⚠ ',
  error: '✗ ',
  dim: '  ',
  accent: '→ ',
  system: '$ ',
};

const TerminalOutputController = ({
  lines = [],
  isActive = false,
  animationSpeed = 50,
  onComplete,
  title = 'OSINT-TERMINAL v2.6.1',
  showCursor = true,
  scanMeta = null,
}) => {
  const outputRef = useRef(null);
  const prevLinesLength = useRef(0);

  // Auto-scroll to bottom when new lines arrive
  const scrollToBottom = useCallback(() => {
    if (outputRef?.current) {
      outputRef.current.scrollTop = outputRef?.current?.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (lines?.length !== prevLinesLength?.current) {
      scrollToBottom();
      prevLinesLength.current = lines?.length;
    }
  }, [lines, scrollToBottom]);

  useEffect(() => {
    if (!isActive && lines?.length > 0 && onComplete) {
      onComplete();
    }
  }, [isActive, lines?.length, onComplete]);

  const handleClear = () => {
    // Emit clear event upward if needed - parent manages state
    if (onComplete) onComplete('clear');
  };

  const handleCopy = () => {
    const text = lines?.map((l) => `${LINE_PREFIXES?.[l?.type] || '  '}${l?.text}`)?.join('\n');
    navigator.clipboard?.writeText(text)?.catch(() => {});
  };

  const handleExport = () => {
    if (lines.length === 0) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const target = scanMeta?.target || 'unknown';
    const mode = scanMeta?.mode || 'scan';
    
    let content = `╔══════════════════════════════════════════════════════════════╗\n`;
    content += `║           OSINT TERMINAL - SCAN REPORT                        ║\n`;
    content += `╚══════════════════════════════════════════════════════════════╝\n\n`;
    content += `TARGET:    ${target}\n`;
    content += `MODE:      ${mode.toUpperCase()}\n`;
    content += `TIMESTAMP: ${scanMeta?.timestamp || new Date().toISOString()}\n`;
    content += `ELAPSED:   ${scanMeta?.elapsed || 0}s\n`;
    content += `LINES:     ${lines.length}\n\n`;
    content += `═══════════════════════════════════════════════════════════════\n\n`;
    
    lines.forEach((line) => {
      content += `${LINE_PREFIXES?.[line?.type] || '  '}${line?.text}\n`;
    });
    
    content += `\n═══════════════════════════════════════════════════════════════\n`;
    content += `END OF REPORT\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osint-scan-${mode}-${target}-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="terminal-window w-full" style={{ zIndex: 20 }}>
      {/* Title bar */}
      <div className="terminal-titlebar justify-between">
        <div className="flex items-center gap-3">
          {/* macOS-style dots */}
          <div className="flex items-center gap-1.5">
            <div className="terminal-dot bg-destructive opacity-80" />
            <div className="terminal-dot bg-warning opacity-80" />
            <div className="terminal-dot bg-success opacity-80" />
          </div>
          <span className="font-orbitron text-xs text-muted-foreground tracking-widest ml-2">
            {title}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {isActive && (
            <span className="flex items-center gap-1.5 font-jetbrains text-xs text-warning">
              <span className="w-1.5 h-1.5 rounded-full bg-warning terminal-pulse inline-block" />
              SCANNING
            </span>
          )}
          <button
            onClick={handleCopy}
            title="Copy output to clipboard"
            className="text-muted-foreground hover:text-primary transition-colors duration-250 p-1 rounded-terminal"
            aria-label="Copy terminal output"
          >
            <Icon name="Copy" size={14} />
          </button>
          {lines.length > 0 && !isActive && (
            <button
              onClick={handleExport}
              title="Export as TXT file"
              className="text-muted-foreground hover:text-success transition-colors duration-250 p-1 rounded-terminal"
              aria-label="Export terminal output"
            >
              <Icon name="Download" size={14} />
            </button>
          )}
          <button
            onClick={handleClear}
            title="Clear terminal"
            className="text-muted-foreground hover:text-destructive transition-colors duration-250 p-1 rounded-terminal"
            aria-label="Clear terminal output"
          >
            <Icon name="Trash2" size={14} />
          </button>
        </div>
      </div>
      {/* Output area */}
      <div
        ref={outputRef}
        className="terminal-output"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        style={{ minHeight: '280px', maxHeight: '400px' }}
      >
        {lines?.length === 0 ? (
          <div className="flex flex-col items-start gap-1 opacity-40">
            <span className="text-primary font-share-tech text-sm">
              ┌─[ OSINT TERMINAL ]─[ READY ]
            </span>
            <span className="text-primary font-share-tech text-sm">
              └─$ <span className="cursor-blink" />
            </span>
          </div>
        ) : (
          <>
            {lines?.map((line, index) => (
              <div
                key={`${index}-${line?.text?.slice(0, 10)}`}
                className={`terminal-line-enter font-share-tech text-sm leading-relaxed ${
                  LINE_COLORS?.[line?.type] || 'text-primary'
                }`}
                style={{ animationDelay: `${Math.min(index * 20, 500)}ms` }}
                aria-label={line?.text}
              >
                <span className="opacity-50 mr-1 select-none font-jetbrains text-xs">
                  {LINE_PREFIXES?.[line?.type] || '  '}
                </span>
                {line?.text}
              </div>
            ))}

            {/* Active cursor line */}
            {isActive && (
              <div className="font-share-tech text-sm text-primary mt-1">
                <span className="opacity-50 mr-1">$ </span>
                <span className="cursor-blink" />
              </div>
            )}

            {/* Completion indicator */}
            {!isActive && lines?.length > 0 && (
              <div className="font-share-tech text-sm text-muted-foreground mt-2 border-t border-border border-opacity-30 pt-2">
                <span className="text-success">✓</span>
                <span className="ml-2 opacity-60">
                  Scan complete — {lines?.length} lines processed
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TerminalOutputController;