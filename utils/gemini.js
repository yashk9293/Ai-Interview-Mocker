import "server-only";
import { ApiError, GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// One retry with a short backoff on 408/429/5xx, and a hard per-attempt
// timeout, so a slow or overloaded Gemini fails fast instead of hanging.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 25_000,
    retryOptions: { attempts: 2, initialDelay: 1, maxDelay: 3 },
  },
});

const safetySettings = [
  HarmCategory.HARM_CATEGORY_HARASSMENT,
  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
].map((category) => ({
  category,
  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
}));

// Thrown when Gemini is rate limited or overloaded, so callers can show a
// "try again in a minute" message instead of a generic failure.
export class AIBusyError extends Error {}

// Each call is a fresh, stateless request so prompts from different
// interviews never share history. The schema forces valid JSON output.
// `prompt` is a string or a list of parts, e.g. text plus an inline PDF.
// Network and overload errors are retried by the SDK; an empty or cut-off
// JSON reply gets one fresh attempt here, since a second sample usually fits.
export async function generateJSON(prompt, schema, { systemInstruction, temperature = 1 } = {}) {
  for (let attempt = 1; ; attempt++) {
    let response;
    try {
      response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseJsonSchema: schema,
          safetySettings,
          systemInstruction,
        },
      });
    } catch (e) {
      throw busyOrSelf(e);
    }
    try {
      if (!response.text) throw new Error("Empty response from Gemini");
      return JSON.parse(response.text);
    } catch (e) {
      if (attempt >= 2) throw e;
      console.warn(`Gemini JSON unusable (${e.message}), retrying once`);
    }
  }
}

function busyOrSelf(e) {
  if (e instanceof ApiError && (e.status === 429 || e.status >= 500)) {
    return new AIBusyError(e.message);
  }
  if (e?.name === "AbortError" || e?.name === "TimeoutError") {
    return new AIBusyError("Gemini request timed out");
  }
  return e;
}

const liveModel = process.env.GEMINI_LIVE_MODEL;

// Ephemeral tokens exist only on v1alpha, so they get their own client.
const tokens = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { apiVersion: "v1alpha", timeout: 10_000 },
});

// A short-lived token the browser uses to open one Live API session, with
// the model and the whole session config locked in: the browser can't change
// the instructions, tools or voice, or reuse the token for anything else.
export async function createLiveToken(config) {
  const now = Date.now();
  let token;
  try {
    token = await tokens.authTokens.create({
      config: {
        uses: 1,
        // The session must start within 2 minutes and ends after 30.
        newSessionExpireTime: new Date(now + 2 * 60_000).toISOString(),
        expireTime: new Date(now + 30 * 60_000).toISOString(),
        liveConnectConstraints: { model: liveModel, config },
        httpOptions: { apiVersion: "v1alpha" },
      },
    });
  } catch (e) {
    throw busyOrSelf(e);
  }
  if (!token?.name) throw new Error("No token from Gemini");
  return { token: token.name, model: liveModel };
}
