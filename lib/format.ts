/**
 * Turns Mari's markdown reply into blocks the UI can style:
 * plain markdown text, and "pick" cards for numbered product matches.
 *
 * Mari is instructed (see app/api/chat/prompt.ts) to write picks as:
 *   ### 1. Product Name
 *   _Hybrid · 24% THC · Flower_
 *   Terpenes: Myrcene, Linalool
 *   Why it fits: ...
 */
export type Pick = {
  rank: number;
  name: string;
  meta?: string;
  terpenes: string[];
  body: string;
};

export type Block = { kind: "text"; text: string } | { kind: "pick"; pick: Pick };

const PICK_HEADING = /^#{2,4}\s*(\d+)[.)]\s+(.+?)\s*$/;
const ANY_HEADING = /^#{1,4}\s+/;

export function toBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  let text: string[] = [];
  let pick: { rank: number; name: string; lines: string[]; done: boolean } | null = null;
  let previousBlank = false;

  const flushText = () => {
    const joined = text.join("\n").trim();
    if (joined) blocks.push({ kind: "text", text: joined });
    text = [];
  };
  const flushPick = () => {
    if (pick) blocks.push({ kind: "pick", pick: buildPick(pick.rank, pick.name, pick.lines) });
    pick = null;
  };

  for (const line of markdown.split("\n")) {
    const heading = line.match(PICK_HEADING);
    if (heading) {
      flushPick();
      flushText();
      pick = { rank: Number(heading[1]), name: stripMarks(heading[2]), lines: [], done: false };
      previousBlank = false;
      continue;
    }
    const isRule = /^\s*---+\s*$/.test(line);
    // A pick ends at a heading, a --- rule, or a new paragraph after its "Good to know" line.
    if (pick && (ANY_HEADING.test(line) || isRule || (pick.done && previousBlank && line.trim()))) {
      flushPick();
      if (!isRule) text.push(line);
      previousBlank = false;
      continue;
    }
    previousBlank = !line.trim();
    if (pick) {
      pick.lines.push(line);
      if (/good to know/i.test(line)) pick.done = true;
    } else text.push(line);
  }
  flushPick();
  flushText();
  return blocks;
}

function buildPick(rank: number, name: string, lines: string[]): Pick {
  let meta: string | undefined;
  let terpenes: string[] = [];
  const body: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    const terp = line.match(/^[-*]?\s*\**terpenes\**\s*:\**\s*(.+)$/i);
    if (terp) {
      terpenes = terp[1]
        .replace(/\*/g, "")
        .split(/,|·|\//)
        .map((t) => t.replace(/\(.*?\)/g, "").trim())
        .filter(Boolean);
      continue;
    }
    if (!meta && body.every((b) => !b.trim()) && /^[_*].+[_*]$/.test(line)) {
      meta = stripMarks(line);
      continue;
    }
    body.push(raw);
  }
  return { rank, name, meta, terpenes, body: body.join("\n").trim() };
}

function stripMarks(s: string) {
  return s.replace(/^[_*]+|[_*]+$/g, "").replace(/\*\*/g, "").trim();
}

/** Product names from a reply — saved for the 48-hour check-in. */
export function extractPickNames(markdown: string): string[] {
  return toBlocks(markdown)
    .filter((b): b is { kind: "pick"; pick: Pick } => b.kind === "pick")
    .map((b) => b.pick.name);
}
