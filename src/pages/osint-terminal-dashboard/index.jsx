import React, { useState, useEffect, useRef, useCallback } from "react";
import { MODES } from "components/ui/ModeSelectorTabs";
import TerminalOutputController from "components/ui/TerminalOutputController";
import ResultsDisplayManager from "components/ui/ResultsDisplayManager";
import GoogleDorksPanel from "components/ui/GoogleDorksPanel";
import OsintToolsPanel from "components/ui/OsintToolsPanel";
import HistoryPanel, { addScanToHistory } from "components/ui/HistoryPanel";
import HeaderSection from "./components/HeaderSection";
import SearchPanel from "./components/SearchPanel";
import VignetteOverlay from "./components/VignetteOverlay";

// ─── Scan stages per mode ────────────────────────────────────────────────────
const SCAN_STAGES = {
  username: [
    { id: "init", label: "INITIALIZING", icon: "Power" },
    { id: "resolve", label: "GITHUB QUERY", icon: "Github" },
    { id: "enumerate", label: "HN LOOKUP", icon: "Rss" },
    { id: "analyze", label: "SOCIAL ENUM", icon: "Users" },
    { id: "compile", label: "COMPILING", icon: "Package" },
  ],
  domain: [
    { id: "init", label: "INITIALIZING", icon: "Power" },
    { id: "resolve", label: "CERT LOGS", icon: "Shield" },
    { id: "enumerate", label: "GEOLOCATION", icon: "MapPin" },
    { id: "analyze", label: "ANALYZING", icon: "BarChart2" },
    { id: "compile", label: "COMPILING", icon: "Package" },
  ],
  ip: [
    { id: "init", label: "INITIALIZING", icon: "Power" },
    { id: "resolve", label: "GEOLOCATION", icon: "MapPin" },
    { id: "enumerate", label: "ASN LOOKUP", icon: "Server" },
    { id: "analyze", label: "THREAT INTEL", icon: "ShieldCheck" },
    { id: "compile", label: "COMPILING", icon: "Package" },
  ],
  dorks: [
    { id: "init", label: "INITIALIZING", icon: "Power" },
    { id: "resolve", label: "BUILDING DORKS", icon: "Search" },
    { id: "enumerate", label: "CATEGORIZING", icon: "List" },
    { id: "analyze", label: "FORMATTING", icon: "Code" },
    { id: "compile", label: "COMPILING", icon: "Package" },
  ],
};

// ─── Real API fetchers ───────────────────────────────────────────────────────

const fetchUsernameData = async (username) => {
  let results = { github: null, githubRepos: null, githubOrgs: null, hn: null, errors: [] };

  // GitHub profile
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (res.status === 404) {
      results.errors.push({ source: "github", code: 404 });
    } else if (res.status === 403) {
      results.errors.push({ source: "github", code: 403 });
    } else if (res.ok) {
      results.github = await res.json();
    }
  } catch (e) {
    results.errors.push({ source: "github", code: 0, message: e.message });
  }

  // GitHub repos
  if (results.github) {
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=8`);
      if (res.ok) results.githubRepos = await res.json();
    } catch (e) {
      results.errors.push({ source: "github_repos", code: 0, message: e.message });
    }

    // GitHub orgs
    try {
      const res = await fetch(`https://api.github.com/users/${username}/orgs`);
      if (res.ok) results.githubOrgs = await res.json();
    } catch (e) {
      results.errors.push({ source: "github_orgs", code: 0, message: e.message });
    }
  }

  // HackerNews
  try {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/user/${username}.json`);
    if (res.ok) {
      const data = await res.json();
      results.hn = data;
    }
  } catch (e) {
    results.errors.push({ source: "hn", code: 0, message: e.message });
  }

  return results;
};

const fetchDomainData = async (domain) => {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  let results = { certs: null, geo: null, errors: [], cleanDomain };

  // crt.sh
  try {
    const res = await fetch(`https://crt.sh/?q=${cleanDomain}&output=json`);
    if (res.ok) {
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        results.errors.push({ source: "crtsh", code: 0, message: "no certs found" });
      } else {
        results.certs = data;
      }
    } else {
      results.errors.push({ source: "crtsh", code: res.status, message: res.statusText });
    }
  } catch (e) {
    results.errors.push({ source: "crtsh", code: 0, message: e.message });
  }

  // ip-api geolocation for domain
  try {
    const res = await fetch(
      `https://ip-api.com/json/${cleanDomain}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,isp,org,as,query,hosting,proxy,mobile`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status === "fail") {
        results.errors.push({ source: "ipapi", code: 0, message: data.message || "lookup failed" });
      } else {
        results.geo = data;
      }
    }
  } catch (e) {
    results.errors.push({ source: "ipapi", code: 0, message: e.message });
  }

  return results;
};

const fetchIpData = async (ip) => {
  let results = { geo: null, errors: [] };
  try {
    const res = await fetch(
      `https://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.status === "fail") {
        results.errors.push({ source: "ipapi", code: 0, message: data.message || "lookup failed" });
      } else {
        results.geo = data;
      }
    }
  } catch (e) {
    results.errors.push({ source: "ipapi", code: 0, message: e.message });
  }
  return results;
};

// ─── Terminal line builders ──────────────────────────────────────────────────

const buildUsernameLines = (username, data) => {
  let lines = [];
  lines.push({ type: "system", text: `╔══ SCAN INITIATED ══╗` });
  lines.push({ type: "system", text: `  TARGET: ${username}` });
  lines.push({ type: "system", text: `  MODE: USERNAME RECONNAISSANCE` });
  lines.push({ type: "dim", text: `─────────────────────────────────` });

  // GitHub section
  lines.push({ type: "accent", text: `◈ GITHUB API` });
  const ghErr = data.errors.find((e) => e.source === "github");
  if (ghErr) {
    if (ghErr.code === 404) {
      lines.push({ type: "error", text: `  └─ [✗] user not found on GitHub` });
    } else if (ghErr.code === 403) {
      lines.push({ type: "warning", text: `  └─ [!] rate limit exceeded — try again later` });
    } else {
      lines.push({ type: "error", text: `  └─ [✗] ${ghErr.message || "fetch error"}` });
    }
  } else if (data.github) {
    const gh = data.github;
    lines.push({ type: "success", text: `  ├─ [✓] profile found: ${gh.html_url}` });
    if (gh.name) lines.push({ type: "info", text: `  ├─ name: ${gh.name}` });
    if (gh.bio) lines.push({ type: "info", text: `  ├─ bio: ${gh.bio}` });
    if (gh.company) lines.push({ type: "info", text: `  ├─ company: ${gh.company}` });
    if (gh.location) lines.push({ type: "info", text: `  ├─ location: ${gh.location}` });
    if (gh.email) lines.push({ type: "info", text: `  ├─ email: ${gh.email}` });
    if (gh.blog) lines.push({ type: "info", text: `  ├─ blog: ${gh.blog}` });
    if (gh.twitter_username) lines.push({ type: "info", text: `  ├─ twitter: @${gh.twitter_username}` });
    lines.push({ type: "info", text: `  ├─ public repos: ${gh.public_repos}` });
    lines.push({ type: "info", text: `  ├─ followers: ${gh.followers} | following: ${gh.following}` });
    if (gh.created_at) {
      const created = new Date(gh.created_at).toLocaleDateString();
      lines.push({ type: "info", text: `  └─ account created: ${created}` });
    }
  }

  // Repos section
  if (data.githubRepos && data.githubRepos.length > 0) {
    lines.push({ type: "accent", text: `◈ TOP REPOSITORIES (by stars)` });
    data.githubRepos.forEach((repo, i) => {
      const isLast = i === data.githubRepos.length - 1;
      const prefix = isLast ? "  └─" : "  ├─";
      lines.push({
        type: "info",
        text: `${prefix} ${repo.name} — ★${repo.stargazers_count}${
          repo.language ? ` [${repo.language}]` : ""
        }`,
      });
    });
  }

  // Orgs section
  if (data.githubOrgs && data.githubOrgs.length > 0) {
    lines.push({ type: "accent", text: `◈ ORGANIZATIONS` });
    data.githubOrgs.forEach((org, i) => {
      const isLast = i === data.githubOrgs.length - 1;
      lines.push({ type: "info", text: `  ${isLast ? "└─" : "├─"} ${org.login}` });
    });
  }

  // HackerNews section
  lines.push({ type: "accent", text: `◈ HACKERNEWS API` });
  const hnErr = data.errors.find((e) => e.source === "hn");
  if (hnErr) {
    lines.push({ type: "error", text: `  └─ [✗] ${hnErr.message || "fetch error"}` });
  } else if (!data.hn) {
    lines.push({ type: "error", text: `  └─ [✗] user not found on HackerNews` });
  } else {
    const hn = data.hn;
    lines.push({ type: "success", text: `  ├─ [✓] account found` });
    lines.push({ type: "info", text: `  ├─ karma: ${hn.karma?.toLocaleString() || 0}` });
    if (hn.submitted) lines.push({ type: "info", text: `  ├─ submissions: ${hn.submitted.length}` });
    if (hn.created) {
      const created = new Date(hn.created * 1000).toLocaleDateString();
      lines.push({ type: "info", text: `  ├─ created: ${created}` });
    }
    if (hn.about) {
      const about = hn.about.replace(/<[^>]*>/g, "").slice(0, 80);
      lines.push({ type: "info", text: `  └─ about: ${about}` });
    } else {
      lines.push({ type: "dim", text: `  └─ no about text` });
    }
  }

  lines.push({ type: "dim", text: `─────────────────────────────────` });
  lines.push({ type: "system", text: `╔══ SCAN COMPLETE ══╗` });
  return lines;
};

const buildDomainLines = (domain, data) => {
  let lines = [];
  const cleanDomain = data.cleanDomain || domain;
  lines.push({ type: "system", text: `╔══ SCAN INITIATED ══╗` });
  lines.push({ type: "system", text: `  TARGET: ${cleanDomain}` });
  lines.push({ type: "system", text: `  MODE: DOMAIN RECONNAISSANCE` });
  lines.push({ type: "dim", text: `─────────────────────────────────` });

  // crt.sh section
  lines.push({ type: "accent", text: `◈ CERTIFICATE TRANSPARENCY (crt.sh)` });
  const crtErr = data.errors.find((e) => e.source === "crtsh");
  if (crtErr) {
    lines.push({ type: "error", text: `  └─ [✗] ${crtErr.message || "no certs found"}` });
  } else if (data.certs) {
    const certs = data.certs;
    lines.push({ type: "success", text: `  ├─ [✓] ${certs.length} certificates found` });

    // Extract unique subdomains
    const subdomainSet = new Set();
    certs.forEach((c) => {
      if (c.name_value) {
        c.name_value.split("\n").forEach((s) => {
          const clean = s.replace(/^\*\./, "").trim();
          if (clean && clean !== cleanDomain) subdomainSet.add(clean);
        });
      }
    });
    let subdomains = Array.from(subdomainSet).slice(0, 10);
    lines.push({ type: "info", text: `  ├─ unique subdomains: ${subdomainSet.size}` });

    // Extract issuers via O= regex
    const issuerSet = new Set();
    certs.forEach((c) => {
      if (c.issuer_name) {
        const match = c.issuer_name.match(/O=([^,]+)/);
        if (match) issuerSet.add(match[1].trim());
      }
    });
    if (issuerSet.size > 0) {
      lines.push({ type: "info", text: `  ├─ issuers: ${Array.from(issuerSet).slice(0, 3).join(", ")}` });
    }

    // Oldest / newest dates
    const dates = certs.map((c) => c.not_before).filter(Boolean).sort();
    if (dates.length > 0) {
      lines.push({ type: "info", text: `  ├─ oldest cert: ${dates[0]}` });
      lines.push({ type: "info", text: `  ├─ newest cert: ${dates[dates.length - 1]}` });
    }

    // List first few subdomains
    subdomains.slice(0, 5).forEach((sub, i) => {
      const isLast = i === Math.min(subdomains.length, 5) - 1 && subdomainSet.size <= 5;
      lines.push({ type: "info", text: `  ${isLast ? "└─" : "├─"} subdomain: ${sub}` });
    });
    if (subdomainSet.size > 5) {
      lines.push({ type: "dim", text: `  └─ ... and ${subdomainSet.size - 5} more` });
    }
  }

  // Geolocation section
  lines.push({ type: "accent", text: `◈ GEOLOCATION (ip-api)` });
  const geoErr = data.errors.find((e) => e.source === "ipapi");
  if (geoErr) {
    lines.push({ type: "error", text: `  └─ [✗] ${geoErr.message || "lookup failed"}` });
  } else if (data.geo) {
    const g = data.geo;
    lines.push({ type: "success", text: `  ├─ [✓] resolved IP: ${g.query}` });
    lines.push({ type: "info", text: `  ├─ location: ${g.city}, ${g.regionName}, ${g.country}` });
    lines.push({ type: "info", text: `  ├─ coordinates: ${g.lat}, ${g.lon}` });
    lines.push({ type: "info", text: `  ├─ ISP: ${g.isp}` });
    if (g.org) lines.push({ type: "info", text: `  ├─ org: ${g.org}` });
    if (g.as) lines.push({ type: "info", text: `  ├─ AS: ${g.as}` });
    const flags = [];
    if (g.proxy) flags.push("PROXY");
    if (g.hosting) flags.push("HOSTING");
    if (g.mobile) flags.push("MOBILE");
    if (flags.length > 0) {
      lines.push({ type: "warning", text: `  └─ [!] flags: ${flags.join(", ")}` });
    } else {
      lines.push({ type: "success", text: `  └─ [✓] no proxy/hosting flags` });
    }
  }

  lines.push({ type: "dim", text: `─────────────────────────────────` });
  lines.push({ type: "system", text: `╔══ SCAN COMPLETE ══╗` });
  return lines;
};

const buildIpLines = (ip, data) => {
  let lines = [];
  lines.push({ type: "system", text: `╔══ SCAN INITIATED ══╗` });
  lines.push({ type: "system", text: `  TARGET: ${ip}` });
  lines.push({ type: "system", text: `  MODE: IP INTELLIGENCE` });
  lines.push({ type: "dim", text: `─────────────────────────────────` });

  lines.push({ type: "accent", text: `◈ GEOLOCATION & NETWORK (ip-api)` });
  const geoErr = data.errors.find((e) => e.source === "ipapi");
  if (geoErr) {
    lines.push({ type: "error", text: `  └─ [✗] ${geoErr.message || "lookup failed"}` });
  } else if (data.geo) {
    const g = data.geo;
    lines.push({ type: "success", text: `  ├─ [✓] geolocation resolved` });
    lines.push({ type: "info", text: `  ├─ IP: ${g.query}` });
    lines.push({ type: "info", text: `  ├─ location: ${g.city}, ${g.regionName}, ${g.country} (${g.countryCode})` });
    if (g.zip) lines.push({ type: "info", text: `  ├─ ZIP: ${g.zip}` });
    lines.push({ type: "info", text: `  ├─ coordinates: ${g.lat}, ${g.lon}` });
    if (g.timezone) lines.push({ type: "info", text: `  ├─ timezone: ${g.timezone}` });
    lines.push({ type: "info", text: `  ├─ ISP: ${g.isp}` });
    if (g.org) lines.push({ type: "info", text: `  ├─ org: ${g.org}` });
    if (g.as) lines.push({ type: "info", text: `  ├─ AS: ${g.as}` });
    if (g.asname) lines.push({ type: "info", text: `  ├─ AS name: ${g.asname}` });
    if (g.reverse) lines.push({ type: "info", text: `  ├─ reverse DNS: ${g.reverse}` });

    // Threat level
    lines.push({ type: "accent", text: `◈ THREAT ASSESSMENT` });
    const isProxy = g.proxy;
    const isHosting = g.hosting;
    const isMobile = g.mobile;
    if (isProxy && isHosting) {
      lines.push({ type: "error", text: `  ├─ [✗] THREAT LEVEL: HIGH — proxy + hosting detected` });
    } else if (isProxy || isHosting) {
      lines.push({ type: "warning", text: `  ├─ [!] THREAT LEVEL: MEDIUM — ${isProxy ? "proxy" : "hosting"} detected` });
    } else {
      lines.push({ type: "success", text: `  ├─ [✓] THREAT LEVEL: LOW — no proxy/hosting` });
    }
    if (isMobile) lines.push({ type: "info", text: `  ├─ mobile network: yes` });
    const mapsUrl = `https://www.google.com/maps?q=${g.lat},${g.lon}`;
    lines.push({ type: "info", text: `  └─ maps: ${mapsUrl}` });
  }

  lines.push({ type: "dim", text: `─────────────────────────────────` });
  lines.push({ type: "system", text: `╔══ SCAN COMPLETE ══╗` });
  return lines;
};

const buildDorksLines = (target, dorks) => {
  let lines = [];
  lines.push({ type: "system", text: `╔══ DORK GENERATION INITIATED ══╗` });
  lines.push({ type: "system", text: `  TARGET: ${target}` });
  lines.push({ type: "system", text: `  MODE: GOOGLE DORKS` });
  lines.push({ type: "dim", text: `─────────────────────────────────` });

  lines.push({ type: "accent", text: `◈ GENERATED QUERIES` });
  lines.push({ type: "info", text: `  ├─ total dorks: ${dorks.length}` });
  lines.push({ type: "info", text: `  ├─ categories: ${new Set(dorks.map(d => d.category)).size}` });
  lines.push({ type: "dim", text: `  └─ click SEARCH buttons to execute` });

  // Group by category
  const byCategory = {};
  dorks.forEach(d => {
    if (!byCategory[d.category]) byCategory[d.category] = [];
    byCategory[d.category].push(d);
  });

  Object.entries(byCategory).forEach(([category, categoryDorks]) => {
    lines.push({ type: "accent", text: `◈ ${category.toUpperCase()}` });
    categoryDorks.forEach((dork, i) => {
      const isLast = i === categoryDorks.length - 1;
      lines.push({ type: "info", text: `  ${isLast ? "└─" : "├─"} ${dork.query}` });
    });
  });

  lines.push({ type: "dim", text: `─────────────────────────────────` });
  lines.push({ type: "system", text: `╔══ GENERATION COMPLETE ══╗` });
  return lines;
};

// ─── Result card builders ────────────────────────────────────────────────────

const buildUsernameResults = (username, data) => {
  const gh = data.github;
  const hn = data.hn;
  const ghErr = data.errors.find((e) => e.source === "github");
  const hnErr = data.errors.find((e) => e.source === "hn");

  const stats = [
    { label: "REPOS", value: gh ? String(gh.public_repos) : "N/A", icon: "GitBranch" },
    { label: "FOLLOWERS", value: gh ? String(gh.followers) : "N/A", icon: "Users" },
    { label: "HN KARMA", value: hn ? hn.karma?.toLocaleString() : "N/A", icon: "TrendingUp" },
    { label: "HN POSTS", value: hn?.submitted ? String(hn.submitted.length) : "N/A", icon: "FileText" },
  ];

  const cards = [];

  // GitHub card
  if (ghErr) {
    cards.push({
      id: "gh",
      title: "GITHUB PROFILE",
      subtitle: `github.com/${username}`,
      icon: "Github",
      status: ghErr.code === 404 ? "error" : "warning",
      summary: ghErr.code === 404 ? "User not found on GitHub." : ghErr.code === 403 ? "GitHub rate limit exceeded." : `Error: ${ghErr.message}`,
      details: [],
    });
  } else if (gh) {
    const details = [];
    if (gh.name) details.push({ key: "Name", value: gh.name });
    if (gh.bio) details.push({ key: "Bio", value: gh.bio.slice(0, 100) });
    if (gh.company) details.push({ key: "Company", value: gh.company });
    if (gh.location) details.push({ key: "Location", value: gh.location });
    if (gh.email) details.push({ key: "Email", value: gh.email });
    if (gh.blog) details.push({ key: "Blog", value: gh.blog });
    if (gh.twitter_username) details.push({ key: "Twitter", value: `@${gh.twitter_username}` });
    details.push({ key: "Public Repos", value: String(gh.public_repos) });
    details.push({ key: "Followers", value: String(gh.followers) });
    details.push({ key: "Following", value: String(gh.following) });
    if (gh.created_at) details.push({ key: "Created", value: new Date(gh.created_at).toLocaleDateString() });

    // Top repos
    if (data.githubRepos && data.githubRepos.length > 0) {
      data.githubRepos.slice(0, 3).forEach((r) => {
        details.push({ key: `Repo: ${r.name}`, value: `★${r.stargazers_count}${r.language ? ` · ${r.language}` : ""}` });
      });
    }

    // Orgs
    if (data.githubOrgs && data.githubOrgs.length > 0) {
      details.push({ key: "Orgs", value: data.githubOrgs.map((o) => o.login).join(", ") });
    }

    cards.push({
      id: "gh",
      title: "GITHUB PROFILE",
      subtitle: gh.html_url,
      icon: "Github",
      status: "found",
      summary: `${gh.name || username} — ${gh.public_repos} repos, ${gh.followers} followers.${gh.bio ? " " + gh.bio.slice(0, 60) : ""}`,
      count: gh.public_repos,
      countLabel: "public repositories",
      details,
    });
  }

  // HackerNews card
  if (hnErr || !hn) {
    cards.push({
      id: "hn",
      title: "HACKERNEWS",
      subtitle: `news.ycombinator.com/user?id=${username}`,
      icon: "Rss",
      status: "error",
      summary: hnErr ? `Error: ${hnErr.message}` : "User not found on HackerNews.",
      details: [],
    });
  } else {
    const hnDetails = [];
    hnDetails.push({ key: "Karma", value: hn.karma?.toLocaleString() || "0" });
    if (hn.submitted) hnDetails.push({ key: "Submissions", value: String(hn.submitted.length) });
    if (hn.created) hnDetails.push({ key: "Created", value: new Date(hn.created * 1000).toLocaleDateString() });
    if (hn.about) hnDetails.push({ key: "About", value: hn.about.replace(/<[^>]*>/g, "").slice(0, 120) });

    cards.push({
      id: "hn",
      title: "HACKERNEWS",
      subtitle: `news.ycombinator.com/user?id=${username}`,
      icon: "Rss",
      status: "found",
      summary: `Karma: ${hn.karma?.toLocaleString() || 0}${hn.submitted ? ` · ${hn.submitted.length} submissions` : ""}.`,
      count: hn.karma || 0,
      countLabel: "karma points",
      details: hnDetails,
    });
  }

  return { stats, cards };
};

const buildDomainResults = (domain, data) => {
  const cleanDomain = data.cleanDomain || domain;
  const certs = data.certs;
  const geo = data.geo;

  // Extract subdomains
  let subdomains = [];
  let issuers = [];
  let oldestCert = null;
  let newestCert = null;

  if (certs) {
    const subdomainSet = new Set();
    certs.forEach((c) => {
      if (c.name_value) {
        c.name_value.split("\n").forEach((s) => {
          const clean = s.replace(/^\*\./, "").trim();
          if (clean && clean !== cleanDomain) subdomainSet.add(clean);
        });
      }
    });
    subdomains = Array.from(subdomainSet);

    const issuerSet = new Set();
    certs.forEach((c) => {
      if (c.issuer_name) {
        const match = c.issuer_name.match(/O=([^,]+)/);
        if (match) issuerSet.add(match[1].trim());
      }
    });
    issuers = Array.from(issuerSet);

    const dates = certs.map((c) => c.not_before).filter(Boolean).sort();
    if (dates.length > 0) {
      oldestCert = dates[0];
      newestCert = dates[dates.length - 1];
    }
  }

  const stats = [
    { label: "SUBDOMAINS", value: certs ? String(subdomains.length) : "N/A", icon: "GitBranch" },
    { label: "CERTS", value: certs ? String(certs.length) : "N/A", icon: "Shield" },
    { label: "IP", value: geo ? geo.query : "N/A", icon: "Server" },
    { label: "COUNTRY", value: geo ? geo.countryCode : "N/A", icon: "Flag" },
  ];

  const cards = [];

  // Certs card
  const crtErr = data.errors.find((e) => e.source === "crtsh");
  if (crtErr) {
    cards.push({
      id: "certs",
      title: "CERTIFICATE LOGS",
      subtitle: "crt.sh transparency data",
      icon: "Shield",
      status: "error",
      summary: `[✗] ${crtErr.message || "no certs found"}`,
      details: [],
    });
  } else if (certs) {
    const certDetails = [];
    certDetails.push({ key: "Total Certs", value: String(certs.length) });
    certDetails.push({ key: "Unique Subdomains", value: String(subdomains.length) });
    if (issuers.length > 0) certDetails.push({ key: "Issuers", value: issuers.slice(0, 3).join(", ") });
    if (oldestCert) certDetails.push({ key: "Oldest Cert", value: oldestCert });
    if (newestCert) certDetails.push({ key: "Newest Cert", value: newestCert });
    subdomains.slice(0, 8).forEach((sub, i) => {
      certDetails.push({ key: `Subdomain ${i + 1}`, value: sub });
    });
    if (subdomains.length > 8) certDetails.push({ key: "More", value: `${subdomains.length - 8} additional subdomains` });

    cards.push({
      id: "certs",
      title: "CERTIFICATE LOGS",
      subtitle: "crt.sh transparency data",
      icon: "Shield",
      status: "found",
      summary: `${certs.length} certificates found. ${subdomains.length} unique subdomains enumerated.`,
      count: subdomains.length,
      countLabel: "subdomains",
      details: certDetails,
    });
  }

  // Geolocation card
  const geoErr = data.errors.find((e) => e.source === "ipapi");
  if (geoErr) {
    cards.push({
      id: "geo",
      title: "GEOLOCATION",
      subtitle: cleanDomain,
      icon: "MapPin",
      status: "error",
      summary: `[✗] ${geoErr.message || "lookup failed"}`,
      details: [],
    });
  } else if (geo) {
    const geoDetails = [];
    geoDetails.push({ key: "IP", value: geo.query });
    geoDetails.push({ key: "City", value: geo.city });
    geoDetails.push({ key: "Region", value: geo.regionName });
    geoDetails.push({ key: "Country", value: `${geo.country} (${geo.countryCode})` });
    geoDetails.push({ key: "Coordinates", value: `${geo.lat}, ${geo.lon}` });
    geoDetails.push({ key: "ISP", value: geo.isp });
    if (geo.org) geoDetails.push({ key: "Org", value: geo.org });
    if (geo.as) geoDetails.push({ key: "AS", value: geo.as });
    const flags = [];
    if (geo.proxy) flags.push("Proxy");
    if (geo.hosting) flags.push("Hosting");
    if (geo.mobile) flags.push("Mobile");
    geoDetails.push({ key: "Flags", value: flags.length > 0 ? flags.join(", ") : "None" });

    cards.push({
      id: "geo",
      title: "GEOLOCATION",
      subtitle: cleanDomain,
      icon: "MapPin",
      status: geo.proxy || geo.hosting ? "warning" : "found",
      summary: `${geo.city}, ${geo.regionName}, ${geo.country}. ISP: ${geo.isp}.`,
      details: geoDetails,
    });
  }

  return { stats, cards };
};

const buildIpResults = (ip, data) => {
  const geo = data.geo;
  const geoErr = data.errors.find((e) => e.source === "ipapi");

  let threatLevel = "UNKNOWN";
  let threatStatus = "dim";
  if (geo) {
    if (geo.proxy && geo.hosting) { threatLevel = "HIGH"; threatStatus = "error"; }
    else if (geo.proxy || geo.hosting) { threatLevel = "MEDIUM"; threatStatus = "warning"; }
    else { threatLevel = "LOW"; threatStatus = "found"; }
  }

  const stats = [
    { label: "COUNTRY", value: geo ? geo.countryCode : "N/A", icon: "Flag" },
    { label: "ISP", value: geo ? (geo.isp?.split(" ").slice(0, 2).join(" ") || "N/A") : "N/A", icon: "Network" },
    { label: "THREAT", value: threatLevel, icon: "ShieldCheck" },
    { label: "PROXY", value: geo ? (geo.proxy ? "YES" : "NO") : "N/A", icon: "AlertTriangle" },
  ];

  const cards = [];

  if (geoErr) {
    cards.push({
      id: "geo",
      title: "GEOLOCATION",
      subtitle: ip,
      icon: "MapPin",
      status: "error",
      summary: `[✗] ${geoErr.message || "lookup failed"}`,
      details: [],
    });
  } else if (geo) {
    const geoDetails = [];
    geoDetails.push({ key: "IP", value: geo.query });
    geoDetails.push({ key: "City", value: geo.city });
    geoDetails.push({ key: "Region", value: geo.regionName });
    geoDetails.push({ key: "Country", value: `${geo.country} (${geo.countryCode})` });
    if (geo.zip) geoDetails.push({ key: "ZIP", value: geo.zip });
    geoDetails.push({ key: "Coordinates", value: `${geo.lat}, ${geo.lon}` });
    if (geo.timezone) geoDetails.push({ key: "Timezone", value: geo.timezone });
    geoDetails.push({ key: "Google Maps", value: `https://www.google.com/maps?q=${geo.lat},${geo.lon}` });

    cards.push({
      id: "geo",
      title: "GEOLOCATION",
      subtitle: ip,
      icon: "MapPin",
      status: "found",
      summary: `${geo.city}, ${geo.regionName}, ${geo.country}. Timezone: ${geo.timezone || "N/A"}.`,
      details: geoDetails,
    });

    const netDetails = [];
    netDetails.push({ key: "ISP", value: geo.isp });
    if (geo.org) netDetails.push({ key: "Org", value: geo.org });
    if (geo.as) netDetails.push({ key: "AS", value: geo.as });
    if (geo.asname) netDetails.push({ key: "AS Name", value: geo.asname });
    if (geo.reverse) netDetails.push({ key: "Reverse DNS", value: geo.reverse });
    netDetails.push({ key: "Mobile", value: geo.mobile ? "Yes" : "No" });
    netDetails.push({ key: "Proxy", value: geo.proxy ? "Yes ⚠" : "No ✓" });
    netDetails.push({ key: "Hosting", value: geo.hosting ? "Yes ⚠" : "No ✓" });

    cards.push({
      id: "network",
      title: "NETWORK / ASN",
      subtitle: "BGP & ISP information",
      icon: "Server",
      status: "found",
      summary: `${geo.isp}${geo.as ? " · " + geo.as : ""}.`,
      details: netDetails,
    });

    cards.push({
      id: "threat",
      title: "THREAT ASSESSMENT",
      subtitle: "Proxy / hosting detection",
      icon: "ShieldCheck",
      status: threatStatus,
      summary: `Threat level: ${threatLevel}. Proxy: ${geo.proxy ? "YES" : "NO"} · Hosting: ${geo.hosting ? "YES" : "NO"} · Mobile: ${geo.mobile ? "YES" : "NO"}.`,
      details: [
        { key: "Threat Level", value: threatLevel },
        { key: "Proxy Detected", value: geo.proxy ? "YES ⚠" : "NO ✓" },
        { key: "Hosting/DC", value: geo.hosting ? "YES ⚠" : "NO ✓" },
        { key: "Mobile Network", value: geo.mobile ? "YES" : "NO" },
        { key: "Maps Link", value: `https://www.google.com/maps?q=${geo.lat},${geo.lon}` },
      ],
    });
  }

  return { stats, cards };
};

const buildDorksResults = (target, dorks) => {
  const categories = new Set(dorks.map(d => d.category));
  
  const stats = [
    { label: "DORKS", value: String(dorks.length), icon: "Search" },
    { label: "CATEGORIES", value: String(categories.size), icon: "Layers" },
    { label: "TARGET", value: target.length > 15 ? target.slice(0, 15) + "..." : target, icon: "Target" },
    { label: "READY", value: "YES", icon: "CheckCircle" },
  ];

  const cards = dorks.slice(0, 6).map((dork, i) => ({
    id: `dork-${i}`,
    title: dork.category.toUpperCase(),
    subtitle: `Google Dork Query`,
    icon: "Search",
    status: "found",
    summary: dork.query.slice(0, 80) + (dork.query.length > 80 ? "..." : ""),
    details: [
      { key: "Full Query", value: dork.query },
      { key: "Category", value: dork.category },
      { key: "Google URL", value: `https://www.google.com/search?q=${encodeURIComponent(dork.query)}` },
    ],
  }));

  return { stats, cards };
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const OsintTerminalDashboard = () => {
  const [activeMode, setActiveMode] = useState("username");
  const [inputValue, setInputValue] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isScanComplete, setIsScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("init");
  const [terminalLines, setTerminalLines] = useState([]);
  const [resultData, setResultData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [scanElapsed, setScanElapsed] = useState(0);
  const [activePanel, setActivePanel] = useState("terminal"); // terminal, history
  const [generatedDorks, setGeneratedDorks] = useState([]);
  const [historySaved, setHistorySaved] = useState(false);

  const scanTimerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const lineTimerRef = useRef([]);
  const abortRef = useRef(false);
  const scanStartTimeRef = useRef(0);

  // Session timer
  useEffect(() => {
    sessionTimerRef.current = setInterval(() => {
      setSessionTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(sessionTimerRef.current);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC to cancel scan
      if (e.key === "Escape" && isScanning) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isScanning]);

  const handleModeChange = useCallback((mode) => {
    if (isScanning) return;
    setActiveMode(mode);
    setInputValue("");
    setValidationError("");
    setTerminalLines([]);
    setResultData(null);
    setShowResults(false);
    setIsScanComplete(false);
    setScanProgress(0);
    setGeneratedDorks([]);
    setHistorySaved(false);
  }, [isScanning]);

  const validateInput = (value, mode) => {
    const config = MODES.find((m) => m.value === mode);
    if (!value.trim()) return "Target cannot be empty.";
    if (config?.validationPattern && !config.validationPattern.test(value.trim())) {
      if (mode === "username") return "Invalid username format. Use alphanumeric, dots, dashes, underscores (max 50 chars).";
      if (mode === "domain") return "Invalid domain format. Example: example.com";
      if (mode === "ip") return "Invalid IP address. Example: 192.168.1.1";
      if (mode === "dorks") return "Invalid target format.";
    }
    return "";
  };

  const clearTimers = () => {
    lineTimerRef.current.forEach(clearTimeout);
    lineTimerRef.current = [];
    clearInterval(scanTimerRef.current);
  };

  // Typewriter: add lines one by one with delay
  const typewriterLines = useCallback((lines, stages, onDone) => {
    const DELAY = 260; // ms per line
    lines.forEach((line, i) => {
      const t = setTimeout(() => {
        if (abortRef.current) return;
        setTerminalLines((prev) => [...prev, line]);
        // Update stage & progress
        const stageIndex = Math.min(
          Math.floor((i / lines.length) * stages.length),
          stages.length - 1
        );
        setCurrentStage(stages[stageIndex]?.id);
        setScanProgress(Math.round(((i + 1) / lines.length) * 100));
      }, i * DELAY);
      lineTimerRef.current.push(t);
    });
    const doneTimer = setTimeout(() => {
      if (!abortRef.current) onDone();
    }, lines.length * DELAY + 400);
    lineTimerRef.current.push(doneTimer);
  }, []);

  // Save scan to history
  const saveScanToHistory = useCallback((target, mode, results, durationMs) => {
    if (!results || !results.cards || results.cards.length === 0) return;

    const threatLevel = results.cards.find(c => c.id === "threat")?.details?.find(d => d.key === "Threat Level")?.value || "N/A";
    
    const historyEntry = {
      id: Date.now(),
      mode,
      target,
      timestamp: new Date().toISOString(),
      duration_ms: durationMs,
      results: {
        summary: results.cards.map(c => c.summary).join(" | ").slice(0, 200),
        findings: results.cards.flatMap(c => c.details?.slice(0, 3).map(d => `${d.key}: ${d.value}`) || []),
        threat_level: threatLevel,
        cards: results.stats?.map(s => ({ label: s.label, value: s.value })) || [],
      },
    };

    const saved = addScanToHistory(historyEntry);
    if (saved) {
      setHistorySaved(true);
      setTerminalLines((prev) => [
        ...prev,
        { type: "success", text: `[✓] SAVED TO HISTORY` },
      ]);
    }
  }, []);

  const handleExecuteScan = useCallback(async () => {
    const error = validateInput(inputValue, activeMode);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    abortRef.current = false;
    setIsScanning(true);
    setIsScanComplete(false);
    setShowResults(false);
    setResultData(null);
    setTerminalLines([]);
    setScanProgress(0);
    setScanElapsed(0);
    setHistorySaved(false);
    scanStartTimeRef.current = Date.now();

    const stages = SCAN_STAGES[activeMode];
    const target = inputValue.trim();

    // Scan elapsed timer
    scanTimerRef.current = setInterval(() => {
      setScanElapsed((t) => t + 1);
    }, 1000);

    // Show initializing line immediately
    setTerminalLines([{ type: "system", text: `Fetching live data for: ${target}...` }]);
    setCurrentStage(stages[0]?.id);
    setScanProgress(5);

    try {
      let apiData;
      let lines;
      let results;

      if (activeMode === "username") {
        apiData = await fetchUsernameData(target);
        lines = buildUsernameLines(target, apiData);
        results = buildUsernameResults(target, apiData);
      } else if (activeMode === "domain") {
        apiData = await fetchDomainData(target);
        lines = buildDomainLines(target, apiData);
        results = buildDomainResults(target, apiData);
      } else if (activeMode === "ip") {
        apiData = await fetchIpData(target);
        lines = buildIpLines(target, apiData);
        results = buildIpResults(target, apiData);
      } else if (activeMode === "dorks") {
        // Dorks mode uses pre-generated dorks
        if (generatedDorks.length === 0) {
          lines = [{ type: "error", text: "[✗] No dorks generated. Use the Dorks panel to generate queries first." }];
          results = null;
        } else {
          lines = buildDorksLines(target, generatedDorks);
          results = buildDorksResults(target, generatedDorks);
        }
      }

      if (abortRef.current) return;

      // Reset terminal and typewrite the lines
      setTerminalLines([]);

      typewriterLines(lines, stages, () => {
        clearInterval(scanTimerRef.current);
        setIsScanning(false);
        setIsScanComplete(true);
        setScanProgress(100);
        setCurrentStage(stages[stages.length - 1]?.id);
        
        if (results) {
          setResultData(results);
          setShowResults(true);
          
          // Save to history
          const durationMs = Date.now() - scanStartTimeRef.current;
          saveScanToHistory(target, activeMode, results, durationMs);
        }
      });
    } catch (err) {
      if (abortRef.current) return;
      clearInterval(scanTimerRef.current);
      setIsScanning(false);
      setIsScanComplete(false);
      setTerminalLines((prev) => [
        ...prev,
        { type: "error", text: `[✗] Unexpected error: ${err.message}` },
      ]);
    }
  }, [inputValue, activeMode, typewriterLines, generatedDorks, saveScanToHistory]);

  const handleCancel = useCallback(() => {
    abortRef.current = true;
    clearTimers();
    clearInterval(scanTimerRef.current);
    setIsScanning(false);
    setIsScanComplete(false);
    setScanProgress(0);
    setTerminalLines((prev) => [
      ...prev,
      { type: "error", text: "⚠ Scan aborted by operator." },
    ]);
  }, []);

  const handleTerminalClear = useCallback(() => {
    setTerminalLines([]);
    setShowResults(false);
    setResultData(null);
    setIsScanComplete(false);
    setScanProgress(0);
    setHistorySaved(false);
  }, []);

  // Handle dork generation from GoogleDorksPanel
  const handleDorksGenerated = useCallback((dorks) => {
    setGeneratedDorks(dorks);
  }, []);

  // Handle re-scan from history
  const handleReScan = useCallback((target, mode) => {
    setActiveMode(mode);
    setInputValue(target);
    setActivePanel("terminal");
    // Small delay to allow state to update
    setTimeout(() => {
      handleExecuteScan();
    }, 100);
  }, [handleExecuteScan]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <div className="min-h-screen bg-terminal relative">
      <VignetteOverlay />
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <HeaderSection sessionTime={sessionTime} />

        {/* Search Panel */}
        <SearchPanel
          activeMode={activeMode}
          onModeChange={handleModeChange}
          inputValue={inputValue}
          onInputChange={(v) => {
            setInputValue(v);
            if (validationError) setValidationError("");
          }}
          onExecuteScan={handleExecuteScan}
          isScanning={isScanning}
          scanProgress={scanProgress}
          currentStage={currentStage}
          elapsedTime={scanElapsed}
          onCancel={handleCancel}
          isScanComplete={isScanComplete}
          validationError={validationError}
        />

        {/* Dorks Panel (only in dorks mode) */}
        {activeMode === "dorks" && (
          <div className="mb-6">
            <div className="card-terminal">
              <GoogleDorksPanel target={inputValue} onGenerate={handleDorksGenerated} />
            </div>
          </div>
        )}

        {/* Panel Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActivePanel("terminal")}
            className={`px-4 py-2 font-orbitron text-xs tracking-wider border rounded-terminal transition-colors ${
              activePanel === "terminal"
                ? "bg-primary text-primary-foreground border-primary"
                : "text-muted-foreground border-border hover:border-primary hover:text-primary"
            }`}
          >
            [ TERMINAL ]
          </button>
          <button
            onClick={() => setActivePanel("history")}
            className={`px-4 py-2 font-orbitron text-xs tracking-wider border rounded-terminal transition-colors ${
              activePanel === "history"
                ? "bg-primary text-primary-foreground border-primary"
                : "text-muted-foreground border-border hover:border-primary hover:text-primary"
            }`}
          >
            [ HISTORY ]
          </button>
        </div>

        {/* Terminal Output */}
        {activePanel === "terminal" && (
          <div className="mb-6">
            <TerminalOutputController
              lines={terminalLines}
              isActive={isScanning}
              title="OSINT-TERMINAL v2.1 — RECONNAISSANCE ENGINE"
              showCursor={true}
              onComplete={(action) => {
                if (action === "clear") handleTerminalClear();
              }}
              scanMeta={{
                target: inputValue,
                mode: activeMode,
                timestamp: new Date().toISOString(),
                elapsed: scanElapsed,
              }}
            />
          </div>
        )}

        {/* History Panel */}
        {activePanel === "history" && (
          <div className="mb-6">
            <div className="card-terminal">
              <HistoryPanel
                onReScan={handleReScan}
                currentTarget={inputValue}
                currentMode={activeMode}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {activePanel === "terminal" && (
          <ResultsDisplayManager
            resultData={resultData}
            displayMode={activeMode}
            isVisible={showResults}
            onCardClick={() => {}}
          />
        )}

        {/* OSINT Tools Panel */}
        <div className="mt-8">
          <OsintToolsPanel target={inputValue} />
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-4 border-t border-border border-opacity-20 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-jetbrains text-xs text-muted-foreground opacity-40">
            © {new Date().getFullYear()} OSINT TERMINAL — FOR AUTHORIZED USE ONLY
          </span>
          <span className="font-jetbrains text-xs text-muted-foreground opacity-40">
            v2.1.0 — CLASSIFIED SYSTEM
          </span>
        </footer>
      </div>
    </div>
  );
};

export default OsintTerminalDashboard;
