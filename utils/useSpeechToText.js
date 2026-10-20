"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const getRecognition = () => window.SpeechRecognition || window.webkitSpeechRecognition;
const subscribe = () => () => {};

// Longest single answer; listening stops (and the answer is kept) after this.
export const MAX_ANSWER_MS = 3 * 60 * 1000;
// Back-to-back failures (e.g. the speech service is unreachable) before giving up.
const MAX_FAILED_RESTARTS = 3;

// Wrapper around the browser's Web Speech API.
//
// Browsers end recognition on their own after a few seconds of silence. This
// hook treats that as a pause, not the end of the answer: it restarts
// listening and keeps appending to the same transcript. `onEnd(transcript,
// reason)` is called only when the answer is really over:
//   "stopped"  the user pressed Stop
//   "limit"    MAX_ANSWER_MS reached
//   "error"    the microphone or speech service became unavailable
export default function useSpeechToText({ lang, onEnd } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState([]);
  const [interimResult, setInterimResult] = useState();
  const [permissionError, setPermissionError] = useState();
  const recognitionRef = useRef(null);
  const onEndRef = useRef(onEnd);
  // True from Record until Stop, across the browser's automatic restarts.
  const wantRef = useRef(false);
  const session = useRef({ finals: [], timer: null, failures: 0, reason: "stopped" });

  // Assumed supported during server render, checked for real in the browser.
  const supported = useSyncExternalStore(subscribe, () => Boolean(getRecognition()), () => true);

  useEffect(() => {
    onEndRef.current = onEnd;
  });
  useEffect(() => () => {
    wantRef.current = false;
    clearTimeout(session.current.timer);
    recognitionRef.current?.abort();
  }, []);

  const finish = () => {
    clearTimeout(session.current.timer);
    recognitionRef.current = null;
    setInterimResult(undefined);
    setIsRecording(false);
    const text = session.current.finals.map((r) => r.transcript.trim()).filter(Boolean).join(" ");
    onEndRef.current?.(text, session.current.reason);
  };

  const listen = () => {
    const SpeechRecognition = getRecognition();
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang || navigator.language || "en-US";
    let heardSomething = false;

    recognition.onresult = (e) => {
      heardSomething = true;
      session.current.failures = 0;
      let interim = "";
      const added = [];
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const { transcript } = e.results[i][0];
        if (e.results[i].isFinal) added.push({ transcript, timestamp: Date.now() });
        else interim += transcript;
      }
      if (added.length) {
        session.current.finals.push(...added);
        setResults((prev) => [...prev, ...added]);
      }
      setInterimResult(interim || undefined);
    };
    recognition.onerror = (e) => {
      // "no-speech" and "aborted" are normal pauses; the restart handles them.
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setPermissionError("Microphone permission was denied");
        session.current.reason = "error";
        wantRef.current = false;
      } else if (e.error === "audio-capture") {
        setPermissionError("No microphone was found");
        session.current.reason = "error";
        wantRef.current = false;
      } else if (e.error === "network") {
        session.current.failures += 1;
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (!heardSomething && session.current.failures >= MAX_FAILED_RESTARTS) {
        setPermissionError("The speech service isn't reachable right now");
        session.current.reason = "error";
        wantRef.current = false;
      }
      if (wantRef.current) {
        // A pause, not the end of the answer: keep listening.
        setInterimResult(undefined);
        setTimeout(() => { if (wantRef.current) listen(); }, 150);
      } else {
        finish();
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // start() throws if a previous instance hasn't fully closed; retry once.
      setTimeout(() => { if (wantRef.current) listen(); }, 300);
    }
  };

  const startSpeechToText = () => {
    if (!getRecognition() || wantRef.current) return;
    setPermissionError(undefined);
    wantRef.current = true;
    session.current = { finals: [], failures: 0, reason: "stopped", timer: null };
    session.current.timer = setTimeout(() => {
      session.current.reason = "limit";
      stopSpeechToText();
    }, MAX_ANSWER_MS);
    setIsRecording(true);
    listen();
  };

  const stopSpeechToText = () => {
    if (!wantRef.current) return;
    wantRef.current = false;
    if (recognitionRef.current) recognitionRef.current.stop(); // onend calls finish()
    else finish(); // between automatic restarts
  };

  return {
    error: supported ? permissionError : "Speech recognition is not supported in this browser",
    supported,
    interimResult,
    isRecording,
    results,
    setResults,
    startSpeechToText,
    stopSpeechToText,
  };
}
