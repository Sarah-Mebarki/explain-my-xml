import { useEffect, useMemo, useState } from "react";
import rulesJson from "./rules/elementRules.json";
import type { ExplainMode, NodeRef, RulesMap } from "./lib/types";
import { EXAMPLES } from "./lib/examples";
import { parseXml, getLocalTag } from "./lib/xml";
import { explainTag } from "./lib/explain";

const rules: RulesMap = rulesJson as RulesMap;

function formatAttrs(attrs: Record<string, string>) {
  const keys = Object.keys(attrs);
  if (!keys.length) return "";
  return keys.map((k) => `${k}="${attrs[k]}"`).join(" ");
}

export default function App() {
  const [mode, setMode] = useState<ExplainMode>("Beginner");
  const [exampleKey, setExampleKey] = useState<string>("DITA-ish topic");
  const [xml, setXml] = useState<string>(EXAMPLES["DITA-ish topic"]);
  const [search, setSearch] = useState<string>("");

  const parsed = useMemo(() => parseXml(xml), [xml]);

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (parsed.ok) setActiveId(parsed.nodes[0]?.id ?? null);
    else setActiveId(null);
  }, [parsed.ok, (parsed as any).ok ? (parsed as any).nodes.length : 0]);

  const activeNode: NodeRef | undefined = useMemo(() => {
    if (!parsed.ok || !activeId) return undefined;
    return parsed.nodes.find((n) => n.id === activeId);
  }, [parsed, activeId]);

  const visibleNodes: NodeRef[] = useMemo(() => {
    if (!parsed.ok) return [];
    const q = search.trim().toLowerCase();
    if (!q) return parsed.nodes;
    return parsed.nodes.filter((n) => {
      const t = getLocalTag(n.tag);
      const attrStr = JSON.stringify(n.attrs).toLowerCase();
      return t.includes(q) || n.textPreview.toLowerCase().includes(q) || attrStr.includes(q);
    });
  }, [parsed, search]);

  const expl = useMemo(() => {
    if (!activeNode) return null;
    return explainTag(activeNode.tag, rules, mode);
  }, [activeNode, mode]);

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="h1">Explain My XML</h1>
          <p className="subtitle">Paste XML/DITA → get a human explanation + an element tree.</p>
        </div>

        <div className="controls">
          <label className="small">
            Mode{" "}
            <select value={mode} onChange={(e) => setMode(e.target.value as ExplainMode)}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Expert</option>
            </select>
          </label>

          <label className="small">
            Example{" "}
            <select
              value={exampleKey}
              onChange={(e) => {
                const k = e.target.value;
                setExampleKey(k);
                setXml(EXAMPLES[k]);
              }}
            >
              {Object.keys(EXAMPLES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={() => navigator.clipboard.writeText(xml)}
            title="Copy current XML to clipboard"
          >
            Copy XML
          </button>
        </div>
      </div>

      <div className="grid">
        {/* Editor */}
        <div className="panel mainBody">
          <div className="panelHeader">
            <p className="panelTitle">Input</p>
            <span className={"badge " + (parsed.ok ? "ok" : "err")}>
              {parsed.ok ? "Parsed" : "Error"}
            </span>
          </div>

          {!parsed.ok ? (
            <div className="statusRow">
              <span className="badge err">Parser</span>
              <span>{parsed.error}</span>
            </div>
          ) : (
            <div className="statusRow">
              <span className="badge ok">Root</span>
              <span className="tag">&lt;{getLocalTag(parsed.root.tagName)}&gt;</span>
              <span className="meta">
                {parsed.nodes.length} elements
                {parsed.warnings.length ? ` · ${parsed.warnings.length} hint(s)` : ""}
              </span>
            </div>
          )}

          <textarea
            value={xml}
            onChange={(e) => setXml(e.target.value)}
            spellCheck={false}
            aria-label="XML input"
          />

          <div className="note">
            Tip: start by clicking elements in the tree to see explanations. Add your own tag rules in
            <code> src/rules/elementRules.json</code>.
          </div>
        </div>

        {/* Output */}
        <div className="panel">
          <div className="panelHeader">
            <p className="panelTitle">Tree + Explanation</p>
            <input
              type="search"
              placeholder="Filter by tag/text/attr…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filter tree"
            />
          </div>

          {!parsed.ok ? (
            <div className="details">
              <h2>Fix the XML first</h2>
              <p className="small">
                Once the XML parses, you'll see a tree on the left and explanations on the right.
              </p>
            </div>
          ) : (
            <>
              <div className="cols">
                <div className="treeWrap">
                  {parsed.warnings.length > 0 && (
                    <div className="kv" style={{ marginBottom: 10 }}>
                      <strong>Hints</strong>
                      <ul>
                        {parsed.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {visibleNodes.map((n) => {
                    const local = getLocalTag(n.tag);
                    const active = n.id === activeId;
                    return (
                      <div
                        key={n.id}
                        className={"treeItem " + (active ? "active" : "")}
                        style={{ marginLeft: n.depth * 14 }}
                        onClick={() => setActiveId(n.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setActiveId(n.id);
                        }}
                        aria-label={`Select <${local}>`}
                      >
                        <span className="tag">&lt;{local}&gt;</span>
                        <span className="meta">
                          {n.childCount ? `${n.childCount} child` + (n.childCount > 1 ? "ren" : "") : "leaf"}
                          {n.textPreview ? ` · “${n.textPreview}”` : ""}
                        </span>
                      </div>
                    );
                  })}

                  {visibleNodes.length === 0 && (
                    <p className="small" style={{ padding: 10 }}>
                      No nodes match your filter.
                    </p>
                  )}
                </div>

                <div className="col">
                  <div className="details">
                    {activeNode && expl ? (
                      <>
                        <h2>
                          <span className="tag">&lt;{expl.tag}&gt;</span>
                        </h2>

                        <p>{expl.summary}</p>
                        <p className="small">{expl.modeNote}</p>

                        {expl.tips.length > 0 && (
                          <>
                            <strong className="small">Tips / notes</strong>
                            <ul>
                              {expl.tips.map((t, i) => (
                                <li key={i}>{t}</li>
                              ))}
                            </ul>
                          </>
                        )}

                        <div className="kv">
                          {activeNode && (
                            <>
                              <div>
                                <strong>Tag:</strong> {activeNode.tag}
                              </div>
                              <div>
                                <strong>Attributes:</strong>{" "}
                                {Object.keys(activeNode.attrs).length
                                  ? formatAttrs(activeNode.attrs)
                                  : "(none)"}
                              </div>
                              <div>
                                <strong>Depth:</strong> {activeNode.depth}
                              </div>
                              <div>
                                <strong>Children:</strong> {activeNode.childCount}
                              </div>
                            </>
                          )}
                        </div>

                        <p className="footer">
                          Want better explanations? Add rules for <code>{expl.tag}</code> in{" "}
                          <code>src/rules/elementRules.json</code>.
                        </p>
                      </>
                    ) : (
                      <>
                        <h2>Select an element</h2>
                        <p className="small">
                          Click a tag in the tree to see what it means and how to write it well.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="footer">
        Built with React + Vite. MIT licensed. Perfect as a small portfolio project.
      </p>
    </div>
  );
}
