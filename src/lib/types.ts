export type ExplainMode = "Beginner" | "Intermediate" | "Expert";

export type NodeRef = {
  id: string;
  tag: string;
  attrs: Record<string, string>;
  textPreview: string;
  depth: number;
  childCount: number;
};

export type Rule = {
  summary: string;
  tips?: string[];
};

export type RulesMap = Record<string, Rule>;
