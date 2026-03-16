import React, { useEffect, useState } from "react";
import Icon from "components/AppIcon";

const HeaderSection = ({ sessionTime }) => {
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 150);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h)?.padStart(2, "0")}:${String(m)?.padStart(2, "0")}:${String(s)?.padStart(2, "0")}`;
  };

  return (
    <header className="w-full mb-6 md:mb-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <div>
          <h1
            className={`font-orbitron text-2xl md:text-3xl lg:text-4xl font-bold text-glow transition-opacity duration-150 ${
              flicker ? "opacity-60" : "opacity-100"
            }`}
            style={{ cursor: "crosshair" }}
          >
            ◈ OSINT TERMINAL
          </h1>
          <p className="font-share-tech text-xs md:text-sm text-muted-foreground mt-1 tracking-widest">
            Open Source Intelligence Reconnaissance Suite v2.1
          </p>
        </div>
        <div className="font-roboto-mono text-xs text-muted-foreground">
          SESSION: <span className="text-primary">{formatTime(sessionTime)}</span>
        </div>
      </div>
      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3 md:gap-6 p-3 border border-border rounded-sm bg-surface">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success inline-block terminal-pulse" />
          <span className="font-jetbrains text-xs text-success">SYSTEM ONLINE</span>
        </div>
        {[
          { label: "GITHUB API", icon: "Github" },
          { label: "HACKERNEWS", icon: "Rss" },
          { label: "CERT LOGS", icon: "Shield" },
          { label: "IP INTEL", icon: "Server" },
          { label: "DORKS", icon: "Search" },
        ]?.map((mod) => (
          <div key={mod?.label} className="flex items-center gap-1.5">
            <Icon name={mod?.icon} size={12} color="var(--color-secondary)" />
            <span className="font-jetbrains text-xs text-muted-foreground">{mod?.label}</span>
            <span className="font-jetbrains text-xs text-success">✓</span>
          </div>
        ))}
        <div className="ml-auto font-roboto-mono text-xs text-muted-foreground">
          {new Date()?.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
        </div>
      </div>
    </header>
  );
};

export default HeaderSection;