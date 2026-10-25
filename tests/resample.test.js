import { describe, expect, it } from "vitest";
import { createResampler } from "../utils/resample";

const tone = (rate, seconds, freq = 440) =>
  Int16Array.from({ length: rate * seconds }, (_, i) => Math.round(10000 * Math.sin((2 * Math.PI * freq * i) / rate)));

const zeroCrossings = (s) => {
  let n = 0;
  for (let i = 1; i < s.length; i++) if ((s[i - 1] < 0) !== (s[i] < 0)) n++;
  return n;
};

describe("createResampler", () => {
  it("turns one second at 24 kHz into one second at 16 kHz, keeping the pitch", () => {
    const out = createResampler(24000, 16000)(tone(24000, 1));
    expect(out.length).toBe(16000);
    expect(zeroCrossings(out) / 2).toBeCloseTo(440, -1);
  });

  it("gives the same result whatever the chunk sizes", () => {
    const input = tone(24000, 1);
    const whole = createResampler(24000, 16000)(input);
    const resample = createResampler(24000, 16000);
    const parts = [];
    for (let o = 0; o < input.length; o += 1234) parts.push(...resample(input.subarray(o, o + 1234)));
    expect(parts.length).toBe(whole.length);
    expect(Math.max(...parts.map((v, i) => Math.abs(v - whole[i])))).toBe(0);
  });
});
