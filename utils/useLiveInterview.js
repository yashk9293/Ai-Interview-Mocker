"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { saveAnswer, startLiveInterview } from "@/utils/actions";
import { liveAnswerText } from "@/utils/interview";
import PcmPlayer from "@/utils/pcmPlayer";

const MAX_CAPTIONS = 60;
// How long after the last transcribed word the candidate counts as quiet.
const QUIET_MS = 1200;
// If the goodbye never finishes playing, wrap up anyway.
const END_FALLBACK_MS = 15_000;

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// A live, spoken interview with the Gemini Live API: the browser streams the
// microphone to Gemini and plays its voice back; the interviewer asks the
// questions, with follow-ups, and can be interrupted. The model calls
// set_question as it moves on, which is how each part of the transcript is
// tied to a question; each question is graded with saveAnswer as soon as the
// interviewer moves past it, and the last one when the interview ends.
//
// status: "idle" | "connecting" | "live" | "finishing" | "done" | "error"
// results: { [questionIndex]: { state: "grading" | "done" | "skipped" | "error", rating? } }
// `createPlayer` swaps the speaker for anything with PcmPlayer's methods.
export default function useLiveInterview({ mockId, questionCount, createPlayer }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(null);
  const [captions, setCaptions] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [candidateSpeaking, setCandidateSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [results, setResults] = useState({});
  const [droppedEarly, setDroppedEarly] = useState(false);
  // Everything the audio and socket callbacks touch, outside React state.
  const live = useRef(null);

  const setResult = (index, result) => setResults((r) => ({ ...r, [index]: result }));

  const grade = useCallback((index) => {
    const l = live.current;
    if (index == null || !l) return;
    const text = liveAnswerText(l.entries.get(index));
    if (text.length < 10) {
      setResult(index, { state: "skipped" });
      return;
    }
    if (l.graded.get(index) === text) return;
    l.graded.set(index, text);
    setResult(index, { state: "grading" });
    const job = saveAnswer({ mockId, questionIndex: index, userAnswer: text }).then(
      (resp) => setResult(index, resp.error ? { state: "error", message: resp.error } : { state: "done", rating: resp.rating }),
      () => setResult(index, { state: "error", message: "Could not save this answer" })
    );
    l.pending.add(job);
  }, [mockId]);

  // Stops the call: the socket, the microphone and the speaker.
  const teardown = useCallback(() => {
    const l = live.current;
    if (!l) return;
    clearTimeout(l.quietTimer);
    clearTimeout(l.endTimer);
    try { l.session?.close(); } catch {}
    l.session = null;
    l.stream?.getTracks().forEach((t) => t.stop());
    l.micCtx?.close().catch(() => {});
    l.player?.close();
    l.player = null;
    setSpeaking(false);
    setCandidateSpeaking(false);
  }, []);

  // Ends the interview and waits for the remaining answers to be graded.
  const finish = useCallback(async () => {
    const l = live.current;
    if (!l || l.finishing) return;
    l.finishing = true;
    setStatus("finishing");
    teardown();
    grade(l.index);
    await Promise.allSettled([...l.pending]);
    setStatus("done");
  }, [grade, teardown]);

  const finishIfEnded = useCallback(() => {
    const l = live.current;
    if (l?.ending && l.turnDone && !l.player?.speaking) finish();
  }, [finish]);

  const addTranscript = (who, text) => {
    const l = live.current;
    if (l.index != null) {
      const entries = l.entries.get(l.index) ?? [];
      if (entries.at(-1)?.who === who) entries.at(-1).text += text;
      else entries.push({ who, text });
      l.entries.set(l.index, entries);
    }
    const last = l.captions.at(-1);
    if (last?.who === who) l.captions[l.captions.length - 1] = { ...last, text: last.text + text };
    else l.captions.push({ who, text, id: l.captions.length });
    setCaptions(l.captions.slice(-MAX_CAPTIONS));
  };

  const onMessage = (m) => {
    const l = live.current;
    if (!l || l.finishing) return;
    const sc = m.serverContent;
    if (sc?.interrupted) l.player?.clear();
    for (const part of sc?.modelTurn?.parts ?? []) {
      if (!part.inlineData?.data) continue;
      l.turnDone = false;
      l.player?.play(part.inlineData.data);
      setSpeaking(true);
    }
    if (sc?.outputTranscription?.text) addTranscript("interviewer", sc.outputTranscription.text);
    if (sc?.inputTranscription?.text) {
      addTranscript("candidate", sc.inputTranscription.text);
      setCandidateSpeaking(true);
      clearTimeout(l.quietTimer);
      l.quietTimer = setTimeout(() => setCandidateSpeaking(false), QUIET_MS);
    }
    if (sc?.turnComplete) {
      l.turnDone = true;
      finishIfEnded();
    }

    for (const call of m.toolCall?.functionCalls ?? []) {
      if (call.name === "set_question") {
        const index = Number(call.args?.index);
        if (Number.isInteger(index) && index >= 0 && index < questionCount && index !== l.index) {
          grade(l.index);
          l.index = index;
          setQuestionIndex(index);
        }
      } else if (call.name === "end_interview") {
        l.ending = true;
        l.endTimer = setTimeout(finish, END_FALLBACK_MS);
        // The goodbye may come before or after this call; give it a moment
        // to start, then end once it has finished playing.
        setTimeout(finishIfEnded, 1500);
        // Not answered: a reply made the interviewer say goodbye twice, and
        // the session is about to close anyway.
        continue;
      }
      // SILENT: acknowledging the call must not make the interviewer speak
      // again, or it can ask the same question twice. It must still be sent:
      // leaving set_question unanswered made the Live API fail with 1011.
      l.session?.sendToolResponse({
        functionResponses: [{ id: call.id, name: call.name, response: { result: "ok" }, scheduling: "SILENT" }],
      });
    }
  };

  const start = async () => {
    if (live.current && !live.current.finishing) return;
    setStatus("connecting");
    setError(null);
    setCaptions([]);
    setResults({});
    setQuestionIndex(null);
    setDroppedEarly(false);
    const l = {
      entries: new Map(), graded: new Map(), pending: new Set(), captions: [],
      index: null, turnDone: true, ending: false, finishing: false,
      // Both audio contexts are made inside the click, so they're allowed to play.
      player: createPlayer ? createPlayer() : new PcmPlayer(),
      micCtx: new AudioContext(),
    };
    live.current = l;
    l.player.onIdle = () => {
      setSpeaking(false);
      finishIfEnded();
    };

    try {
      try {
        l.stream = await navigator.mediaDevices.getUserMedia({
          // Echo cancellation keeps the interviewer's voice out of the mic.
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch {
        throw new Error("Allow the microphone to talk with the interviewer, then try again.");
      }
      const [resp, { GoogleGenAI }] = await Promise.all([
        startLiveInterview(mockId),
        import("@google/genai"),
        l.micCtx.audioWorklet.addModule("/pcm-recorder-worklet.js"),
        // An avatar player connects alongside; it falls back by itself.
        l.player.connect?.(),
      ]);
      if (resp.error) throw new Error(resp.error);
      if (live.current !== l) return;

      const ai = new GoogleGenAI({ apiKey: resp.token, httpOptions: { apiVersion: "v1alpha" } });
      l.session = await ai.live.connect({
        model: resp.model,
        // Empty: the token locks in the whole config.
        config: {},
        callbacks: {
          onmessage: onMessage,
          onerror: (e) => console.error("Live session error:", e),
          onclose: () => {
            if (live.current !== l || l.finishing) return;
            // Closed by the server before the interview ended: keep what was said.
            setDroppedEarly(true);
            finish();
          },
        },
      });

      const recorder = new AudioWorkletNode(l.micCtx, "pcm-recorder");
      recorder.port.onmessage = (e) => {
        l.session?.sendRealtimeInput({ audio: { data: toBase64(e.data), mimeType: "audio/pcm;rate=16000" } });
      };
      const silent = l.micCtx.createGain();
      silent.gain.value = 0;
      l.micCtx.createMediaStreamSource(l.stream).connect(recorder).connect(silent).connect(l.micCtx.destination);

      setStatus("live");
      l.session.sendClientContent({
        turns: [{ role: "user", parts: [{ text: "(The candidate has joined the call and is ready.)" }] }],
        turnComplete: true,
      });
    } catch (e) {
      console.error("Live interview failed to start:", e);
      teardown();
      live.current = null;
      setStatus("error");
      setError(e.message || "Could not start the live interview, please try again");
    }
  };

  const end = () => {
    live.current?.player?.clear();
    finish();
  };

  const toggleMute = () => {
    const next = !muted;
    live.current?.stream?.getAudioTracks().forEach((t) => { t.enabled = !next; });
    setMuted(next);
  };

  const getLevel = useCallback(() => live.current?.player?.getLevel() ?? 0, []);

  // Leaving the page hangs up; answers already graded stay saved.
  useEffect(() => () => {
    if (live.current) live.current.finishing = true;
    teardown();
  }, [teardown]);

  return {
    status, error, questionIndex, captions, speaking, candidateSpeaking, muted, results, droppedEarly,
    start, end, toggleMute, getLevel,
  };
}
