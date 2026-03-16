import React from 'react';
import Icon from 'components/AppIcon';

const OSINT_TOOLS = [
  {
    id: 'shodan',
    name: 'Shodan',
    description: 'Search engine for internet-connected devices',
    url: 'https://www.shodan.io/search?query={target}',
    icon: 'Globe',
    category: 'network',
  },
  {
    id: 'virustotal',
    name: 'VirusTotal',
    description: 'Analyze suspicious files, domains, IPs',
    url: 'https://www.virustotal.com/gui/domain/{target}',
    icon: 'ShieldCheck',
    category: 'security',
  },
  {
    id: 'urlscan',
    name: 'URLScan.io',
    description: 'Scan and analyze websites',
    url: 'https://urlscan.io/search/#domain:{target}',
    icon: 'Scan',
    category: 'security',
  },
  {
    id: 'securitytrails',
    name: 'SecurityTrails',
    description: 'DNS, IP, and domain intelligence',
    url: 'https://securitytrails.com/domain/{target}/dns',
    icon: 'Server',
    category: 'domain',
  },
  {
    id: 'dnsdumpster',
    name: 'DNSDumpster',
    description: 'DNS reconnaissance and research',
    url: 'https://dnsdumpster.com',
    icon: 'Database',
    category: 'domain',
  },
  {
    id: 'haveibeenpwned',
    name: 'Have I Been Pwned',
    description: 'Check if email has been compromised',
    url: 'https://haveibeenpwned.com/account/{target}',
    icon: 'Lock',
    category: 'email',
  },
  {
    id: 'wayback',
    name: 'Wayback Machine',
    description: 'View historical web page snapshots',
    url: 'https://web.archive.org/web/*/{target}',
    icon: 'Clock',
    category: 'web',
  },
  {
    id: 'hunter',
    name: 'Hunter.io',
    description: 'Find email addresses by domain',
    url: 'https://hunter.io/domain-search/{target}',
    icon: 'Mail',
    category: 'email',
  },
  {
    id: 'intelx',
    name: 'IntelX',
    description: 'Intelligence search engine',
    url: 'https://intelx.io/?s={target}',
    icon: 'Search',
    category: 'general',
  },
  {
    id: 'censys',
    name: 'Censys',
    description: 'Attack surface management platform',
    url: 'https://search.censys.io/search?resource=hosts&q={target}',
    icon: 'Radio',
    category: 'network',
  },
  {
    id: 'osintframework',
    name: 'OSINT Framework',
    description: 'Collection of OSINT tools and resources',
    url: 'https://osintframework.com',
    icon: 'LayoutGrid',
    category: 'general',
  },
  {
    id: 'bgptoolkit',
    name: 'BGP Toolkit',
    description: 'BGP and IP routing information',
    url: 'https://bgp.he.net/ip/{target}',
    icon: 'Network',
    category: 'network',
  },
];

const OsintToolsPanel = ({ target = '' }) => {
  const openTool = (tool) => {
    const url = tool.url.replace('{target}', encodeURIComponent(target.trim()));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getCategoryColor = (category) => {
    const colors = {
      network: 'var(--color-accent)',
      security: 'var(--color-success)',
      domain: 'var(--color-secondary)',
      email: 'var(--color-warning)',
      web: 'var(--color-primary)',
      general: 'var(--color-muted-foreground)',
    };
    return colors[category] || 'var(--color-muted-foreground)';
  };

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Icon name="Tool" size={16} color="var(--color-primary)" />
          <span className="font-orbitron text-sm text-primary tracking-widest uppercase">
            External OSINT Tools
          </span>
        </div>
        <div className="flex-1 h-px bg-border opacity-40" />
        <span className="font-jetbrains text-xs text-muted-foreground">
          {OSINT_TOOLS.length} TOOLS
        </span>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {OSINT_TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => openTool(tool)}
            disabled={!target.trim() && tool.url.includes('{target}')}
            className="group relative p-3 border border-border rounded-terminal bg-card hover:border-primary hover:bg-primary/5 transition-all duration-250 text-left disabled:opacity-50 disabled:cursor-not-allowed"
            title={`${tool.name}: ${tool.description}${target.trim() ? '' : ' (Enter a target first)'}`}
          >
            <div className="flex items-start gap-2">
              <Icon
                name={tool.icon}
                size={16}
                color={getCategoryColor(tool.category)}
                className="flex-shrink-0 mt-0.5"
              />
              <div className="min-w-0">
                <div className="font-orbitron text-xs text-primary group-hover:text-glow transition-all truncate">
                  {tool.name}
                </div>
                <div className="font-jetbrains text-xs text-muted-foreground mt-1 line-clamp-2">
                  {tool.description}
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Icon name="ExternalLink" size={10} color="var(--color-primary)" />
            </div>
          </button>
        ))}
      </div>

      {/* Info note */}
      <div className="mt-3 flex items-center gap-2">
        <Icon name="Info" size={12} color="var(--color-muted-foreground)" />
        <span className="font-jetbrains text-xs text-muted-foreground">
          Tools open in new tab. Current target is pre-filled where supported.
        </span>
      </div>
    </div>
  );
};

export default OsintToolsPanel;
export { OSINT_TOOLS };
