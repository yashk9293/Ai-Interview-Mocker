// Plays the Live API's speech: base64 16-bit mono PCM chunks, queued back to
// back without gaps. Also the "audio sink" seam: a lip-synced avatar can
// replace this with anything that has the same methods.
//   play(base64)  queue a chunk
//   clear()       drop everything queued (the candidate interrupted)
//   getLevel()    loudness right now, 0 to 1, for the orb
//   speaking      whether anything is playing
//   onIdle        called when the queue runs dry
//   close()
export default class PcmPlayer {
  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate;
    // Created inside the click that starts the interview, so it may play.
    this.ctx = new AudioContext();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.connect(this.ctx.destination);
    this.samples = new Uint8Array(this.analyser.fftSize);
    this.sources = new Set();
    this.nextTime = 0;
    this.onIdle = null;
  }

  get speaking() {
    return this.sources.size > 0;
  }

  play(base64) {
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const pcm = new Int16Array(bytes.buffer, 0, bytes.length >> 1);
    if (pcm.length === 0) return;
    const buffer = this.ctx.createBuffer(1, pcm.length, this.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) channel[i] = pcm[i] / 0x8000;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.analyser);
    // A short lead when starting fresh absorbs network jitter between chunks.
    const start = Math.max(this.nextTime, this.ctx.currentTime + 0.05);
    source.start(start);
    this.nextTime = start + buffer.duration;
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      if (this.sources.size === 0) this.onIdle?.();
    };
  }

  clear() {
    for (const source of this.sources) {
      source.onended = null;
      try { source.stop(); } catch {}
    }
    this.sources.clear();
    this.nextTime = 0;
    this.onIdle?.();
  }

  getLevel() {
    if (!this.speaking) return 0;
    this.analyser.getByteTimeDomainData(this.samples);
    let sum = 0;
    for (const s of this.samples) sum += ((s - 128) / 128) ** 2;
    return Math.min(1, Math.sqrt(sum / this.samples.length) * 4);
  }

  close() {
    this.clear();
    this.onIdle = null;
    this.ctx.close();
  }
}
