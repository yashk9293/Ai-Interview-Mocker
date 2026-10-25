import { startAvatarSession } from "@/utils/actions";
import PcmPlayer from "@/utils/pcmPlayer";
import { createResampler } from "@/utils/resample";

const CONNECT_TIMEOUT_MS = 12_000;

// Speaks the Live API's audio through a Simli avatar: the face lip-syncs to
// it and Simli plays the voice in step with the video, on `audio`. Same
// methods as PcmPlayer, so useLiveInterview can use either. If the avatar
// can't connect, everything goes to a plain PcmPlayer and the orb instead;
// the interview carries on either way.
//
// onStatus("connecting" | "ready" | "failed") tells the page which to show.
export default class SimliPlayer {
  constructor({ video, audio, onStatus }) {
    this.video = video;
    this.audio = audio;
    this.onStatus = onStatus;
    // Made now, inside the click, so it's allowed to play if needed later.
    this.fallback = new PcmPlayer();
    this.client = null;
    this.active = false;
    this.toSimli = createResampler(24000, 16000);
    this.onIdle = null;
    this.fallback.onIdle = () => this.onIdle?.();
  }

  // Connects the avatar. Never throws: on failure it switches to the orb.
  async connect() {
    this.onStatus?.("connecting");
    try {
      const resp = await startAvatarSession();
      if (resp.error) throw new Error(resp.error);
      const { SimliClient, LogLevel } = await import("simli-client");
      // CRITICAL only: every normal stop() makes the client log a spurious
      // "FAILED TO SEND FINAL MESSAGE" (it disconnects twice). Real failures
      // still reach us, through start() and the "error" event below.
      const client = new SimliClient(resp.sessionToken, this.video, this.audio, null, LogLevel.CRITICAL, "livekit");
      client.on("error", (detail) => console.error("Avatar error:", detail));
      client.on("silent", () => {
        if (!this.active) return;
        this.active = false;
        this.onIdle?.();
      });
      // The client retries for minutes on its own; the interview won't wait.
      let timer;
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Avatar didn't connect in ${CONNECT_TIMEOUT_MS / 1000}s`)), CONNECT_TIMEOUT_MS);
      });
      try {
        await Promise.race([client.start(), timeout]);
      } catch (e) {
        client.stop().catch(() => {});
        throw e;
      } finally {
        clearTimeout(timer);
      }
      if (this.closed) {
        client.stop().catch(() => {});
        return;
      }
      this.client = client;
      this.onStatus?.("ready");
    } catch (e) {
      console.error("Avatar unavailable, using the orb:", e);
      this.onStatus?.("failed");
    }
  }

  get speaking() {
    return this.client ? this.active : this.fallback.speaking;
  }

  play(base64) {
    if (!this.client) return this.fallback.play(base64);
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const pcm16k = this.toSimli(new Int16Array(bytes.buffer, 0, bytes.length >> 1));
    this.active = true;
    this.client.sendAudioData(new Uint8Array(pcm16k.buffer, pcm16k.byteOffset, pcm16k.byteLength));
  }

  clear() {
    if (!this.client) return this.fallback.clear();
    this.client.ClearBuffer();
    this.active = false;
    this.onIdle?.();
  }

  // The face shows the voice; this only feeds the orb when there's no face.
  getLevel() {
    return this.client ? 0 : this.fallback.getLevel();
  }

  close() {
    this.closed = true;
    this.onIdle = null;
    this.client?.stop().catch(() => {});
    this.client = null;
    this.fallback.close();
  }
}
