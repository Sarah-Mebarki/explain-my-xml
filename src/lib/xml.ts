import type { NodeRef } from "./types";

export type ParseResult =
  | { ok: true; doc: Document; root: Element; nodes: NodeRef[]; warnings: string[] }
  | { ok: false; error: string };

function safeTextPreview(el: Element): string {
  // Grab immediate text nodes (not deep) to avoid huge previews.
  const parts: string[] = [];
  el.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) {
      const t = (n.textContent ?? "").replace(/\s+/g, " ").trim();
      if (t) parts.push(t);
    }
  });
  const preview = parts.join(" ").slice(0, 80);
  return preview;
}

function uid(prefix = "n"): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function parseXml(xml: string): ParseResult {
  const trimmed = xml.trim();
  if (!trimmed) return { ok: false, error: "Paste some XML to begin." };

  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, "application/xml");

  // DOMParser uses <parsererror> element when parsing fails.
  const errNode = doc.getElementsByTagName("parsererror")[0];
  if (errNode) {
    const msg = errNode.textContent?.replace(/\s+/g, " ").trim() ?? "Invalid XML.";
    return { ok: false, error: msg };
  }

  const root = doc.documentElement;
  if (!root) return { ok: false, error: "No root element found." };

  const warnings: string[] = [];

  // lightweight “maybe DITA?” heuristics
  const rootTag = root.tagName.toLowerCase();
  if (["topic", "concept", "task", "reference", "map", "bookmap"].includes(rootTag)) {
    warnings.push("Looks like DITA or DITA-like XML. Nice.");
  } else if (rootTag.includes(":")) {
    warnings.push("Namespaces detected (prefix:tag). This app will still work, but rules match by local tag name only.");
  }

  // Traverse element nodes and build a flat list for rendering.
  const nodes: NodeRef[] = [];
  const stack: Array<{ el: Element; depth: number }> = [{ el: root, depth: 0 }];

  while (stack.length) {
    const { el, depth } = stack.pop()!;
    const tag = el.tagName;
    const attrs: Record<string, string> = {};
    for (const a of Array.from(el.attributes)) {
      attrs[a.name] = a.value;
    }

    const children = Array.from(el.children);
    nodes.push({
      id: uid("el"),
      tag,
      attrs,
      textPreview: safeTextPreview(el),
      depth,
      childCount: children.length
    });

    // Push children in reverse to preserve document order.
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push({ el: children[i], depth: depth + 1 });
    }
  }

  // Common “gotchas” hints (very lightweight and non-judgy)
  const allTags = new Set(nodes.map((n) => n.tag.toLowerCase()));
  if (allTags.has("steps") && !allTags.has("step")) warnings.push("You have <steps> but no <step> elements.");
  if (allTags.has("ul") && !allTags.has("li")) warnings.push("You have a list (<ul>) without any list items (<li>).");
  if (allTags.has("ol") && !allTags.has("li")) warnings.push("You have an ordered list (<ol>) without any <li> items.");

  return { ok: true, doc, root, nodes, warnings };
}

export function getLocalTag(tagName: string): string {
  // If namespaced like "dita:topic", return "topic"
  const parts = tagName.split(":");
  return (parts[parts.length - 1] ?? tagName).toLowerCase();
}
