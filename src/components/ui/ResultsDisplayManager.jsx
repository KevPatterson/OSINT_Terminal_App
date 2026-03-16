import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const ResultsDisplayManager = ({
  resultData = null,
  displayMode = 'username',
  isVisible = false,
  onCardClick,
}) => {
  const [expandedCard, setExpandedCard] = useState(null);

  if (!isVisible || !resultData) return null;

  const handleCardClick = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
    if (onCardClick) onCardClick(cardId, resultData);
  };

  const handleKeyDown = (e, cardId) => {
    if (e?.key === 'Enter' || e?.key === ' ') {
      e?.preventDefault();
      handleCardClick(cardId);
    }
  };

  const { stats = [], cards = [] } = resultData;

  return (
    <div className="w-full animate-slide-up">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Database" size={16} color="var(--color-primary)" />
          <span className="font-orbitron text-sm text-primary tracking-widest uppercase">
            Intelligence Results
          </span>
        </div>
        <div className="flex-1 h-px bg-border opacity-40" />
        <span className="font-jetbrains text-xs text-muted-foreground">
          {cards?.length} RECORDS
        </span>
      </div>
      {/* Stats pills row */}
      {stats?.length > 0 && (
        <div
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'thin' }}
          role="region"
          aria-label="Scan statistics"
        >
          {stats?.map((stat, i) => (
            <div key={i} className="stats-pill flex-shrink-0">
              <Icon name={stat?.icon || 'Activity'} size={12} color="var(--color-secondary)" />
              <span className="opacity-70">{stat?.label}:</span>
              <span className="value">{stat?.value}</span>
            </div>
          ))}
        </div>
      )}
      {/* Cards grid */}
      {cards?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards?.map((card) => {
            const isExpanded = expandedCard === card?.id;
            return (
              <div
                key={card?.id}
                className={`card-terminal cursor-pointer transition-all duration-250 ${
                  isExpanded ? 'border-glow-active border-primary' : ''
                }`}
                onClick={() => handleCardClick(card?.id)}
                onKeyDown={(e) => handleKeyDown(e, card?.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`${card?.title} - click to ${isExpanded ? 'collapse' : 'expand'}`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-terminal flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(0,255,65,0.1)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <Icon
                        name={card?.icon || 'FileText'}
                        size={16}
                        color="var(--color-primary)"
                      />
                    </div>
                    <div>
                      <div className="font-orbitron text-xs text-primary tracking-wide">
                        {card?.title}
                      </div>
                      {card?.subtitle && (
                        <div className="font-jetbrains text-xs text-muted-foreground mt-0.5">
                          {card?.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {card?.status && (
                      <span
                        className={`font-jetbrains text-xs px-2 py-0.5 rounded-terminal border ${
                          card?.status === 'found' ?'text-success border-success border-opacity-40 bg-success bg-opacity-10'
                            : card?.status === 'warning' ?'text-warning border-warning border-opacity-40 bg-warning bg-opacity-10'
                            : card?.status === 'error' ?'text-destructive border-destructive border-opacity-40 bg-destructive bg-opacity-10' :'text-muted-foreground border-border'
                        }`}
                      >
                        {card?.status?.toUpperCase()}
                      </span>
                    )}
                    <Icon
                      name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                      size={14}
                      color="var(--color-muted-foreground)"
                    />
                  </div>
                </div>
                {/* Card summary */}
                {card?.summary && (
                  <div className="font-share-tech text-sm text-muted-foreground mb-2 leading-relaxed">
                    {card?.summary}
                  </div>
                )}
                {/* Expanded details */}
                {isExpanded && card?.details && (
                  <div
                    className="mt-3 pt-3 border-t border-border border-opacity-40 animate-fade-in"
                    onClick={(e) => e?.stopPropagation()}
                  >
                    {card?.details?.map((detail, di) => (
                      <div
                        key={di}
                        className="flex items-start gap-2 mb-2 font-jetbrains text-xs"
                      >
                        <span className="text-secondary opacity-60 flex-shrink-0 mt-0.5">▸</span>
                        <span className="text-muted-foreground">
                          <span className="text-primary opacity-80">{detail?.key}:</span>{' '}
                          <span className="font-roboto-mono">{detail?.value}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Data count badge */}
                {card?.count !== undefined && (
                  <div className="mt-3 flex items-center gap-1">
                    <span className="font-roboto-mono text-lg font-medium text-primary text-glow">
                      {card?.count}
                    </span>
                    <span className="font-jetbrains text-xs text-muted-foreground">
                      {card?.countLabel || 'records'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* Empty state */}
      {cards?.length === 0 && (
        <div className="card-terminal flex flex-col items-center justify-center py-12 text-center">
          <Icon name="SearchX" size={32} color="var(--color-muted-foreground)" className="mb-3 opacity-40" />
          <div className="font-orbitron text-sm text-muted-foreground opacity-60">
            NO INTELLIGENCE DATA FOUND
          </div>
          <div className="font-jetbrains text-xs text-muted-foreground opacity-40 mt-1">
            Target returned no actionable results
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplayManager;