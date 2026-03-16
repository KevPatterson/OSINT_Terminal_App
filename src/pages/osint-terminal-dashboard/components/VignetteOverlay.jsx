import React from "react";

const VignetteOverlay = () => (
  <>
    {/* Scanlines */}
    <div className="scanlines" aria-hidden="true" />
    {/* Radial vignette */}
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 290,
        background:
          "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)",
      }}
    />
  </>
);

export default VignetteOverlay;