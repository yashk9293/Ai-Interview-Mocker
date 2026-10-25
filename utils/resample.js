// Changes the sample rate of a stream of 16-bit PCM chunks, by linear
// interpolation, carrying its position across chunks so the joins are
// seamless. Gemini Live speaks at 24 kHz; the avatar takes 16 kHz.
export function createResampler(fromRate, toRate) {
  const step = fromRate / toRate;
  let pos = 0; // where the next output sample falls, in input samples
  let prev = 0; // last input sample of the previous chunk
  return (input) => {
    const out = new Int16Array(Math.ceil((input.length - pos) / step));
    let n = 0;
    while (pos < input.length) {
      const i = Math.floor(pos);
      const frac = pos - i;
      const a = i === 0 ? prev : input[i - 1];
      out[n++] = Math.round(a + (input[i] - a) * frac);
      pos += step;
    }
    pos -= input.length;
    if (input.length) prev = input[input.length - 1];
    return out.subarray(0, n);
  };
}
