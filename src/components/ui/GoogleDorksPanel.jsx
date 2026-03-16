import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const DORK_CATEGORIES = [
  { id: 'exposed_files', label: 'Exposed Files', icon: 'FileText' },
  { id: 'login_pages', label: 'Login Pages', icon: 'Lock' },
  { id: 'sensitive_dirs', label: 'Sensitive Dirs', icon: 'FolderOpen' },
  { id: 'config_files', label: 'Config Files', icon: 'Settings' },
  { id: 'email_harvesting', label: 'Email Harvesting', icon: 'Mail' },
  { id: 'subdomains', label: 'Subdomains', icon: 'GitBranch' },
  { id: 'social_profiles', label: 'Social Profiles', icon: 'Users' },
  { id: 'camera_iot', label: 'Camera/IoT', icon: 'Camera' },
  { id: 'juicy_info', label: 'Juicy Info', icon: 'AlertTriangle' },
  { id: 'pastebin_leaks', label: 'Pastebin/Leaks', icon: 'Database' },
];

const DORK_TEMPLATES = {
  exposed_files: [
    'site:{target} ext:pdf OR ext:doc OR ext:xls OR ext:xlsx OR ext:ppt',
    'site:{target} ext:sql OR ext:db OR ext:log',
    'site:{target} ext:env OR ext:config OR ext:bak OR ext:old',
    'site:{target} ext:xml OR ext:json filetype:json',
  ],
  login_pages: [
    'site:{target} inurl:login OR inurl:signin OR inurl:admin',
    'site:{target} inurl:portal OR inurl:dashboard OR inurl:cpanel',
    'site:{target} intitle:"login" OR intitle:"sign in" OR intitle:"admin"',
  ],
  sensitive_dirs: [
    'site:{target} intitle:"index of" OR intitle:"directory listing"',
    'site:{target} inurl:/backup OR inurl:/old OR inurl:/temp OR inurl:/dev',
    'site:{target} inurl:/.git OR inurl:/.svn OR inurl:/.env',
  ],
  config_files: [
    'site:{target} inurl:wp-config OR inurl:config.php OR inurl:settings.php',
    'site:{target} filetype:ini OR filetype:conf OR filetype:cfg',
    'site:{target} inurl:/.htaccess OR inurl:/.htpasswd',
  ],
  email_harvesting: [
    'site:{target} intext:"@{target}" email contact',
    '"@{target}" filetype:xls OR filetype:csv',
    'site:{target} intext:"email" OR intext:"contact" filetype:pdf',
  ],
  subdomains: [
    'site:*.{target} -www',
    'site:{target} -inurl:www',
    'related:{target}',
  ],
  social_profiles: [
    '"{target}" site:linkedin.com',
    '"{target}" site:twitter.com OR site:x.com',
    '"{target}" site:facebook.com OR site:instagram.com',
    '"{target}" site:github.com',
  ],
  camera_iot: [
    'site:{target} inurl:"/view/index.shtml"',
    'site:{target} intitle:"webcam" OR intitle:"IP Camera"',
    'site:{target} inurl:"/cgi-bin/viewer/video.jpg"',
  ],
  juicy_info: [
    'site:{target} intitle:"confidential" OR intitle:"internal use only"',
    'site:{target} intext:"password" OR intext:"passwd" filetype:txt',
    'site:{target} intext:"api_key" OR intext:"secret_key" OR intext:"access_token"',
    'site:{target} "not for public" OR "do not distribute"',
  ],
  pastebin_leaks: [
    'site:pastebin.com "{target}"',
    'site:paste.ee OR site:ghostbin.com "{target}"',
    'site:github.com "{target}" password OR secret OR token',
  ],
};

const GoogleDorksPanel = ({ target, onGenerate }) => {
  const [selectedCategories, setSelectedCategories] = useState(['exposed_files', 'login_pages']);
  const [generatedDorks, setGeneratedDorks] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const generateDorks = () => {
    if (!target.trim() || selectedCategories.length === 0) return;

    const dorks = [];
    selectedCategories.forEach((categoryId) => {
      const templates = DORK_TEMPLATES[categoryId] || [];
      templates.forEach((template) => {
        dorks.push({
          id: `${categoryId}-${Math.random().toString(36).substr(2, 9)}`,
          category: DORK_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId,
          categoryId,
          query: template.replace(/{target}/g, target.trim()),
        });
      });
    });

    setGeneratedDorks(dorks);
    setHasGenerated(true);
    if (onGenerate) onGenerate(dorks);
  };

  const copyToClipboard = async (dorkId, query) => {
    try {
      await navigator.clipboard.writeText(query);
      setCopiedId(dorkId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openGoogleSearch = (query) => {
    const encodedQuery = encodeURIComponent(query);
    window.open(`https://www.google.com/search?q=${encodedQuery}`, '_blank', 'noopener,noreferrer');
  };

  const selectAll = () => {
    setSelectedCategories(DORK_CATEGORIES.map((c) => c.id));
  };

  const clearAll = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="w-full">
      {/* Category Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground font-jetbrains text-xs tracking-widest uppercase">
            // SELECT DORK CATEGORIES
          </span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="font-jetbrains text-xs text-secondary hover:text-primary transition-colors"
            >
              [SELECT ALL]
            </button>
            <button
              onClick={clearAll}
              className="font-jetbrains text-xs text-secondary hover:text-primary transition-colors"
            >
              [CLEAR]
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {DORK_CATEGORIES.map((category) => (
            <label
              key={category.id}
              className={`flex items-center gap-2 p-2 rounded-terminal border cursor-pointer transition-all duration-250 ${
                selectedCategories.includes(category.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-secondary'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="w-4 h-4 accent-primary"
              />
              <Icon
                name={category.icon}
                size={12}
                color={
                  selectedCategories.includes(category.id)
                    ? 'var(--color-primary)'
                    : 'var(--color-muted-foreground)'
                }
              />
              <span
                className={`font-jetbrains text-xs ${
                  selectedCategories.includes(category.id)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {category.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={generateDorks}
          disabled={!target.trim() || selectedCategories.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-orbitron text-xs tracking-wider rounded-terminal hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon name="Zap" size={14} />
          GENERATE DORKS
        </button>
        {selectedCategories.length > 0 && (
          <span className="font-jetbrains text-xs text-muted-foreground">
            {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
          </span>
        )}
      </div>

      {/* Generated Dorks */}
      {hasGenerated && (
        <div className="border border-border rounded-terminal overflow-hidden">
          <div className="bg-muted px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="font-orbitron text-xs text-primary tracking-wider">
              GENERATED DORKS ({generatedDorks.length})
            </span>
            <span className="font-jetbrains text-xs text-muted-foreground">
              Click buttons to search or copy
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {generatedDorks.length === 0 ? (
              <div className="p-4 text-center">
                <span className="font-jetbrains text-xs text-muted-foreground">
                  No dorks generated. Select categories and click Generate.
                </span>
              </div>
            ) : (
              generatedDorks.map((dork, index) => (
                <div
                  key={dork.id}
                  className={`px-4 py-3 ${index !== generatedDorks.length - 1 ? 'border-b border-border border-opacity-30' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-jetbrains text-xs text-accent flex-shrink-0 mt-0.5">
                      [{dork.category.toUpperCase()}]
                    </span>
                    <code className="flex-1 font-share-tech text-sm text-primary break-all">
                      {dork.query}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 mt-2 ml-0 sm:ml-24">
                    <button
                      onClick={() => openGoogleSearch(dork.query)}
                      className="flex items-center gap-1 px-2 py-1 border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground rounded-terminal transition-colors font-jetbrains text-xs"
                      title="Open in Google Search"
                    >
                      <Icon name="ExternalLink" size={10} />
                      SEARCH
                    </button>
                    <button
                      onClick={() => copyToClipboard(dork.id, dork.query)}
                      className={`flex items-center gap-1 px-2 py-1 border rounded-terminal transition-colors font-jetbrains text-xs ${
                        copiedId === dork.id
                          ? 'border-success text-success'
                          : 'border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary'
                      }`}
                      title="Copy to clipboard"
                    >
                      <Icon name={copiedId === dork.id ? 'Check' : 'Copy'} size={10} />
                      {copiedId === dork.id ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDorksPanel;
export { DORK_CATEGORIES, DORK_TEMPLATES };
