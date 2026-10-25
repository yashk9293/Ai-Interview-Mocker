"use client";
import React, { useEffect, useRef } from "react";

const SIZES = {
  sm: { box: "size-14", core: "size-11" },
  lg: { box: "size-40", core: "size-32" },
};

// The interviewer's face, for now: an orb that swells with its voice, and a
// green ring while the candidate talks. It reads getLevel() (0 to 1) every
// frame while speaking, outside React state, so nothing re-renders.
export default function InterviewerOrb({ speaking, listening, getLevel, size = "sm" }) {
  const core = useRef(null);
  const halo = useRef(null);
  const { box, core: coreSize } = SIZES[size];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = (level) => {
      if (!core.current || !halo.current) return;
      halo.current.style.opacity = String(level ? 0.25 + level * 0.6 : 0);
      if (reduce) return;
      core.current.style.transform = `scale(${1 + level * 0.12})`;
      halo.current.style.transform = `scale(${1 + level * 0.55})`;
    };
    if (!speaking) {
      draw(0);
      return;
    }
    let frame;
    let smooth = 0;
    const tick = () => {
      // Ease toward the new level so the orb breathes rather than flickers.
      smooth += (getLevel() - smooth) * 0.3;
      draw(smooth);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speaking, getLevel]);

  return (
    <div className={`relative grid ${box} shrink-0 place-items-center`} aria-hidden="true">
      <span ref={halo} className="absolute inset-0 rounded-full bg-brand opacity-0 transition-opacity duration-300" />
      {listening && <span className="absolute inset-0 animate-ping rounded-full bg-positive/30 motion-reduce:animate-none" />}
      <span
        ref={core}
        className={`relative ${coreSize} rounded-full bg-[radial-gradient(circle_at_35%_30%,#8f8cf0,var(--brand)_60%,#2b2990)] shadow-[inset_0_-2px_6px_rgba(0,0,0,0.25)]`}
      />
    </div>
  );
}
