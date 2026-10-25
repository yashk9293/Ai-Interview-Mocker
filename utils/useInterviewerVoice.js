"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Voices that sound most natural, best first, matched against voice names.
const PREFERRED = [/natural/i, /google (us|uk) english/i, /samantha/i, /daniel/i, /karen/i, /moira/i];

// The device's best English voice, or null to let the browser choose.
function pickVoice() {
  const voices = window.speechSynthesis.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
  for (const pattern of PREFERRED) {
    const match = voices.find((v) => pattern.test(v.name));
    if (match) return match;
  }
  return voices.find((v) => v.default) ?? voices[0] ?? null;
}

// Chrome stops speaking a single utterance after about 15 seconds, so long
// questions are spoken a sentence at a time.
function sentences(text) {
  return String(text ?? "").match(/[^.!?]+[.!?]*\s*/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
}

// The interviewer's voice: reads each question aloud with the browser's own
// speech synthesis. Free, instant, and with no quota. `getLevel()` gives a
// loudness (0 to 1) for the avatar; the browser exposes no audio, so it's a
// gentle pulse while speaking.
//
// state: "idle" | "speaking". `blocked` is true when the browser refused to
// speak without a click first; a click on speak() fixes it.
export default function useInterviewerVoice() {
  const [state, setState] = useState("idle");
  const [blocked, setBlocked] = useState(false);
  const [supported, setSupported] = useState(true);
  const voice = useRef(null);
  // Each speak() takes a ticket, so callbacks from a cancelled one are ignored.
  const ticket = useRef(0);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      const t = setTimeout(() => setSupported(false), 0);
      return () => clearTimeout(t);
    }
    // Voices load asynchronously in Chrome; pick again when they arrive.
    const choose = () => { voice.current = pickVoice(); };
    choose();
    window.speechSynthesis.addEventListener("voiceschanged", choose);
    const tickets = ticket;
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", choose);
      tickets.current++;
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    ticket.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setState("idle");
  }, []);

  const speak = useCallback((text) => {
    if (!("speechSynthesis" in window)) return;
    stop();
    const parts = sentences(text);
    if (parts.length === 0) return;
    const mine = ticket.current;
    parts.forEach((part, i) => {
      const utterance = new SpeechSynthesisUtterance(part);
      if (voice.current) utterance.voice = voice.current;
      utterance.lang = voice.current?.lang ?? "en-US";
      utterance.rate = 0.95;
      utterance.onstart = () => {
        if (ticket.current !== mine) return;
        setBlocked(false);
        setState("speaking");
      };
      utterance.onerror = (e) => {
        if (ticket.current !== mine) return;
        // Chrome won't speak until the page has had a click.
        if (e.error === "not-allowed") setBlocked(true);
        if (e.error !== "interrupted" && e.error !== "canceled") setState("idle");
      };
      if (i === parts.length - 1) {
        utterance.onend = () => {
          if (ticket.current === mine) setState("idle");
        };
      }
      window.speechSynthesis.speak(utterance);
    });
  }, [stop]);

  const getLevel = useCallback(() => 0.35 + 0.25 * Math.sin(performance.now() / 120), []);

  return { state, blocked, supported, speak, stop, getLevel };
}
