import type { ExplainMode, RulesMap } from "./types";
import { getLocalTag } from "./xml";

export function explainTag(tagName: string, rules: RulesMap, mode: ExplainMode) {
  const tag = getLocalTag(tagName);

  const rule = rules[tag];
  const base =
    rule?.summary ??
    `An element named <${tag}>. This app doesn't have a custom explanation for it yet.`;

  const tips = rule?.tips ?? [];

  const modeNote =
    mode === "Beginner"
      ? "Beginner mode focuses on what it is and why it exists."
      : mode === "Intermediate"
      ? "Intermediate mode adds structure and best-practice hints."
      : "Expert mode adds more implementation/IA hints.";

  const extra = expertHints(tag, mode);

  return {
    tag,
    summary: base,
    tips: [...tips, ...extra],
    modeNote
  };
}

function expertHints(tag: string, mode: ExplainMode): string[] {
  const out: string[] = [];

  if (mode === "Beginner") return out;

  if (tag === "topic") {
    out.push("In CCMS terms, this is often the 'unit of reuse' that can be versioned, translated, and published.");
  }

  if (mode === "Expert") {
    if (["p", "li"].includes(tag)) out.push("Watch for mixed content: inline elements inside text can complicate transformations.");
    if (tag === "xref") out.push("Consider keyrefs/conrefs for scalable linking/reuse (if your DITA setup supports it).");
    if (tag === "codeblock") out.push("Decide whether this is code, output, or both; consistent semantics help styling and reuse.");
    if (tag === "note") out.push("Prefer taxonomy (type=warning|caution|tip) and style consistently via publishing rules.");
  }

  return out;
}
