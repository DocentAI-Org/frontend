"use client";

import { Fragment, useEffect, useState } from "react";

type Katex = typeof import("katex").default;

export type MathSegment = { kind: "text" | "inline" | "display"; value: string };

// Only \( … \) and \[ … \]: `$` is common in prices (011 FR-001).
const MATH = /\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;

export function splitMath(text: string): MathSegment[] {
  const segments: MathSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(MATH)) {
    if (match.index > last) segments.push({ kind: "text", value: text.slice(last, match.index) });
    segments.push(
      match[1] !== undefined ? { kind: "inline", value: match[1] } : { kind: "display", value: match[2] }
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ kind: "text", value: text.slice(last) });
  return segments;
}

let loaded: Katex | null = null;
let loading: Promise<Katex> | null = null;

/** KaTeX and its stylesheet, fetched the first time a formula is shown (011 FR-002). */
function loadKatex(): Promise<Katex> {
  loading ??= Promise.all([import("katex"), import("katex/dist/katex.min.css")]).then(([module]) => {
    loaded = module.default;
    return loaded;
  });
  return loading;
}

function Formula({ segment, katex }: { segment: MathSegment; katex: Katex | null }) {
  const source = segment.kind === "inline" ? `\\(${segment.value}\\)` : `\\[${segment.value}\\]`;
  if (!katex) return source;
  let html: string;
  try {
    // Defaults keep `trust: false`: no links or HTML from the text (011 FR-003).
    html = katex.renderToString(segment.value, { displayMode: segment.kind === "display", throwOnError: true });
  } catch {
    return source;
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * A text with its \( … \) and \[ … \] formulas typeset by KaTeX, with MathML for screen readers.
 * Without formulas it is the text itself, and nothing is downloaded (011 US1).
 */
export function MathText({ text }: { text: string }) {
  const segments = splitMath(text);
  const hasMath = segments.some((segment) => segment.kind !== "text");
  const [katex, setKatex] = useState<Katex | null>(loaded);

  useEffect(() => {
    if (!hasMath || katex) return;
    let active = true;
    void loadKatex().then((module) => {
      if (active) setKatex(module);
    });
    return () => {
      active = false;
    };
  }, [hasMath, katex]);

  if (!hasMath) return text;
  return segments.map((segment, index) =>
    segment.kind === "text" ? (
      <Fragment key={index}>{segment.value}</Fragment>
    ) : (
      <Formula key={index} segment={segment} katex={katex} />
    )
  );
}
