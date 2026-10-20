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
export async function generateJSON(prompt, schema, { systemInstruction } = {}) {
  let response;
  try {
    response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 1,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        safetySettings,
        systemInstruction,
      },
    });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 429 || e.status >= 500)) {
      throw new AIBusyError(e.message);
    }
    if (e?.name === "AbortError" || e?.name === "TimeoutError") {
      throw new AIBusyError("Gemini request timed out");
    }
    throw e;
  }
  if (!response.text) {
    throw new Error("Empty response from Gemini");
  }
  return JSON.parse(response.text);
}
