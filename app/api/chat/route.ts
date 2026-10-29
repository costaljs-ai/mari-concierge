import { createGoogleGenerativeAI, type GoogleLanguageModelOptions } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { z } from "zod";
import { keepLatestImageOnly } from "@/lib/messages";
import { buildSystemPrompt } from "./prompt";

export const maxDuration = 60;

/**
 * Models are tried in order. If one is overloaded or slow to start,
 * Mari moves to the next one within seconds instead of hanging.
 * Override without touching code by setting MARI_MODELS in .env.local,
 * e.g.  MARI_MODELS=gemini-3.5-flash-lite,gemini-flash-lite-latest
 */
const DEFAULT_MODELS = ["gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.5-flash"];
const MODELS = (process.env.MARI_MODELS?.split(",").map((m) => m.trim()).filter(Boolean)) ?? DEFAULT_MODELS;

// Seconds to wait for the first word before trying the next model.
const FIRST_TOKEN_TIMEOUT_MS = { text: 10_000, image: 20_000 };

// Minimal "thinking" keeps answers fast; Mari's job doesn't need deep reasoning.
function optionsFor(model: string): GoogleLanguageModelOptions {
  if (/lite/.test(model)) return { thinkingConfig: { thinkingLevel: "minimal" } };
  return { thinkingConfig: { thinkingLevel: "low" } };
}

const BodySchema = z.object({
  messages: z.array(z.any()).min(1).max(60),
  memory: z.string().max(4000).optional().default(""),
});

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Mari isn't configured yet: add GEMINI_API_KEY to .env.local." }, { status: 500 });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "That message couldn't be read. Please try again." }, { status: 400 });
  }

  const google = createGoogleGenerativeAI({ apiKey });
  const uiMessages = keepLatestImageOnly(parsed.data.messages as UIMessage[]);
  const modelMessages = await convertToModelMessages(uiMessages);
  const system = buildSystemPrompt(parsed.data.memory);
  const last = uiMessages[uiMessages.length - 1];
  const hasImage = last?.parts.some((p) => p.type === "file") ?? false;
  const startedAt = Date.now();

  const stream = createUIMessageStream({
    originalMessages: uiMessages,
    execute: async ({ writer }) => {
      for (const modelId of MODELS) {
        const abort = new AbortController();
        const onClientAbort = () => abort.abort();
        req.signal.addEventListener("abort", onClientAbort);
        const timer = setTimeout(() => abort.abort(), hasImage ? FIRST_TOKEN_TIMEOUT_MS.image : FIRST_TOKEN_TIMEOUT_MS.text);

        const result = streamText({
          model: google(modelId),
          system,
          messages: modelMessages,
          maxRetries: 0, // we fall back to the next model instead of retrying slowly
          abortSignal: abort.signal,
          providerOptions: { google: optionsFor(modelId) },
          onError: () => {},
        });

        const reader = result.toUIMessageStream({ sendReasoning: false }).getReader();
        const buffered: UIMessageChunk[] = [];
        let started = false;
        let failure = "no output";

        // Hold back chunks until real text arrives, so a failed model never reaches the guest.
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value.type === "error") {
            failure = value.errorText;
            break;
          }
          if (value.type === "abort") {
            failure = req.signal.aborted ? "client left" : "timed out";
            break;
          }
          buffered.push(value);
          if (value.type === "text-delta") {
            started = true;
            break;
          }
        }
        clearTimeout(timer);

        if (!started) {
          req.signal.removeEventListener("abort", onClientAbort);
          await reader.cancel().catch(() => {});
          if (req.signal.aborted) return;
          console.warn(`[mari] ${modelId} failed (${failure.slice(0, 140)}); trying next model`);
          continue;
        }

        console.info(`[mari] ${modelId} first words in ${Date.now() - startedAt}ms${hasImage ? " (menu photo)" : ""}`);
        for (const chunk of buffered) writer.write(chunk);
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          writer.write(value);
        }
        req.signal.removeEventListener("abort", onClientAbort);
        console.info(`[mari] ${modelId} finished in ${Date.now() - startedAt}ms`);
        return;
      }
      throw new Error("all models unavailable");
    },
    onError: (error) => {
      console.error("[mari] chat failed", error);
      return "Mari is a little overwhelmed right now. Please try again in a moment.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}
