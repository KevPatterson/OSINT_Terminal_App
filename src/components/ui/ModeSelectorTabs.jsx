import React from 'react';
import Icon from 'components/AppIcon';

const MODES = [
  {
    value: 'username',
    label: 'USERNAME',
    icon: 'User',
    placeholder: 'Enter target username...',
    validationPattern: /^[a-zA-Z0-9._-]{1,50}$/,
    description: 'Enumerate social profiles & digital footprint',
  },
  {
    value: 'domain',
    label: 'DOMAIN',
    icon: 'Globe',
    placeholder: 'Enter target domain (e.g. example.com)...',
    validationPattern: /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    description: 'DNS records, WHOIS, subdomains & certificates',
  },
  {
    value: 'ip',
    label: 'IP ADDRESS',
    icon: 'Server',
    placeholder: 'Enter target IP address...',
    validationPattern: /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/,
    description: 'Geolocation, ASN, open ports & threat intel',
  },
  {
    value: 'dorks',
    label: 'DORKS',
    icon: 'Search',
    placeholder: 'Enter target domain or name...',
    validationPattern: /^.{1,100}$/,
    description: 'Generate Google Dork queries for reconnaissance',
  },
];

const ModeSelectorTabs = ({ activeMode = 'username', onModeChange }) => {
  const handleModeClick = (modeValue) => {
    if (onModeChange) {
      const modeConfig = MODES?.find((m) => m?.value === modeValue);
      onModeChange(modeValue, modeConfig);
    }
  };

  const handleKeyDown = (e, modeValue) => {
    if (e?.key === 'Enter' || e?.key === ' ') {
      e?.preventDefault();
      handleModeClick(modeValue);
    }
    if (e?.key === 'ArrowRight' || e?.key === 'ArrowLeft') {
      e?.preventDefault();
      const currentIndex = MODES?.findIndex((m) => m?.value === activeMode);
      const direction = e?.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + direction + MODES?.length) % MODES?.length;
      handleModeClick(MODES?.[nextIndex]?.value);
    }
  };

  return (
    <div className="w-full">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-muted-foreground font-jetbrains text-xs tracking-widest uppercase">
          // RECONNAISSANCE MODE
        </span>
        <div className="flex-1 h-px bg-border opacity-40" />
      </div>
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Reconnaissance mode selector"
        className="flex gap-2 flex-wrap"
      >
        {MODES?.map((mode) => {
          const isActive = activeMode === mode?.value;
          return (
            <button
              key={mode?.value}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${mode?.value}`}
              id={`tab-${mode?.value}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleModeClick(mode?.value)}
              onKeyDown={(e) => handleKeyDown(e, mode?.value)}
              className={`mode-tab btn-press flex items-center gap-2 ${isActive ? 'active' : ''}`}
            >
              <Icon
                name={mode?.icon}
                size={14}
                color={isActive ? 'var(--color-primary-foreground)' : 'currentColor'}
              />
              <span>{mode?.label}</span>
            </button>
          );
        })}
      </div>
      {/* Active mode description */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-primary opacity-60 font-share-tech text-xs">▶</span>
        <span className="font-jetbrains text-xs text-muted-foreground">
          {MODES?.find((m) => m?.value === activeMode)?.description}
        </span>
      </div>
    </div>
  );
};

export default ModeSelectorTabs;
export { MODES };