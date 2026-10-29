import type { UIMessage } from "ai";

/**
 * Keeps only the most recent menu photo in the conversation.
 * Without this, every follow-up question re-uploads (and the AI re-reads)
 * every photo ever sent — the conversation gets slower with each message.
 */
export function keepLatestImageOnly<M extends UIMessage>(messages: M[]): M[] {
  let seenImage = false;
  return messages
    .slice()
    .reverse()
    .map((m) => {
      const hasImage = m.parts.some((p) => p.type === "file");
      if (!hasImage) return m;
      if (!seenImage) {
        seenImage = true;
        return m;
      }
      return {
        ...m,
        parts: [
          ...m.parts.filter((p) => p.type !== "file"),
          { type: "text" as const, text: "[An earlier menu photo was shared here.]" },
        ],
      };
    })
    .reverse();
}
