// Microphone -> 16 kHz, 16-bit mono PCM, the format the Gemini Live API takes.
// Runs on the audio thread. The AudioContext keeps the device's own rate
// (Firefox can't mix rates), so this resamples, by linear interpolation,
// and posts 100 ms chunks as transferable ArrayBuffers.
const TARGET_RATE = 16000;
const CHUNK = TARGET_RATE / 10;

class PcmRecorder extends AudioWorkletProcessor {
  constructor() {
    super();
    this.step = sampleRate / TARGET_RATE;
    this.pos = 0; // where the next output sample falls, in input samples
    this.prev = 0; // last input sample of the previous block
    this.out = new Int16Array(CHUNK);
    this.filled = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    while (this.pos < input.length) {
      const i = Math.floor(this.pos);
      const frac = this.pos - i;
      const a = i === 0 ? this.prev : input[i - 1];
      const b = input[i];
      const s = Math.max(-1, Math.min(1, a + (b - a) * frac));
      this.out[this.filled++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.filled === CHUNK) {
        this.port.postMessage(this.out.buffer, [this.out.buffer]);
        this.out = new Int16Array(CHUNK);
        this.filled = 0;
      }
      this.pos += this.step;
    }
    this.pos -= input.length;
    this.prev = input[input.length - 1];
    return true;
  }
}

registerProcessor("pcm-recorder", PcmRecorder);
