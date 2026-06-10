import path from "node:path";
import { ProjectFile } from "../../types/report.js";

export interface SkeletonAnalysis {
  componentName: string;
  sourceFile: ProjectFile;
  targetPath: string;
  exportName: string;
  accuracy: number;
  detected: string[];
  desktop: LayoutSummary;
  tablet: LayoutSummary;
  mobile: LayoutSummary;
  classNames: string[];
  blueprint: SkeletonBlueprint;
}

export interface LayoutSummary {
  width: string;
  height: string;
  layout: string;
  spacing: string;
  alignment: string;
}

export interface SkeletonBlueprint {
  containerClass: string;
  blocks: SkeletonBlock[];
}

export interface SkeletonBlock {
  kind: "media" | "avatar" | "heading" | "text" | "button" | "input" | "badge" | "list-item" | "generic";
  className: string;
  repeat?: number;
}

const COMPONENT_EXTENSIONS = /\.(tsx|jsx)$/;

export function findComponent(files: ProjectFile[], requestedName: string): ProjectFile | undefined {
  const normalized = requestedName.toLowerCase();
  return files.find((file) => {
    if (!COMPONENT_EXTENSIONS.test(file.relativePath)) return false;
    const baseName = path.basename(file.relativePath).replace(COMPONENT_EXTENSIONS, "").toLowerCase();
    if (baseName === normalized) return true;
    return new RegExp(`\\b(function|const|class)\\s+${escapeRegExp(requestedName)}\\b`).test(file.content);
  });
}

export function analyzeSkeletonTarget(rootDir: string, file: ProjectFile, componentName?: string): SkeletonAnalysis {
  const parsed = path.parse(file.path);
  const resolvedName = componentName ?? parsed.name;
  const classNames = extractClassNames(file.content);
  const tokens = classNames.flatMap((item) => item.split(/\s+/).filter(Boolean));
  const detected = detectElements(file.content, tokens);
  const containerClass = inferContainerClass(classNames, tokens);
  const blocks = inferBlocks(file.content, tokens);

  return {
    componentName: resolvedName,
    sourceFile: file,
    targetPath: path.join(parsed.dir, `${parsed.name}Skeleton${parsed.ext}`),
    exportName: `${parsed.name}Skeleton`,
    accuracy: estimateAccuracy(file.content, tokens),
    detected,
    desktop: summarizeLayout(tokens, "desktop"),
    tablet: summarizeLayout(tokens, "tablet"),
    mobile: summarizeLayout(tokens, "mobile"),
    classNames,
    blueprint: {
      containerClass,
      blocks,
    },
  };
}

function extractClassNames(source: string): string[] {
  const values = new Set<string>();
  const patterns = [
    /className\s*=\s*["']([^"']+)["']/g,
    /className\s*=\s*{\s*["']([^"']+)["']\s*}/g,
    /className\s*=\s*{\s*`([^`]+)`\s*}/g,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
      const value = match[1]?.replace(/\$\{[^}]+\}/g, "").trim();
      if (value) values.add(value);
    }
  }
  return [...values];
}

function detectElements(source: string, tokens: string[]): string[] {
  const detected = new Set<string>();
  const checks: Array<[string, RegExp]> = [
    ["Avatar", /<Avatar\b|avatar/i],
    ["Image", /<Image\b|<img\b/],
    ["Video Player", /<video\b|<iframe\b/],
    ["Heading", /<h[1-6]\b|text-(2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/],
    ["Paragraph", /<p\b|text-(sm|base|lg|xl)/],
    ["Action Button", /<button\b|Button\b/],
    ["Text Input", /<input\b/],
    ["Textarea", /<textarea\b/],
    ["Select", /<select\b/],
    ["Card", /card|rounded|shadow|border/i],
    ["List", /\.map\s*\(|<li\b/],
    ["Grid", /grid|grid-cols-/],
    ["Flex Layout", /flex|items-|justify-/],
    ["Badge", /badge|chip|tag|pill/i],
  ];
  for (const [label, pattern] of checks) {
    if (pattern.test(source) || tokens.some((token) => pattern.test(token))) {
      detected.add(label);
    }
  }
  return [...detected];
}

function inferContainerClass(classNames: string[], tokens: string[]): string {
  const root = classNames[0] ?? "";
  const structural = root
    .split(/\s+/)
    .filter((token) => isLayoutToken(token) || isResponsiveToken(token))
    .join(" ");
  const fallback = tokens.includes("grid") ? "grid gap-4" : tokens.includes("flex") ? "flex gap-4" : "space-y-4";
  return mergeClasses("animate-pulse", structural || fallback);
}

function inferBlocks(source: string, tokens: string[]): SkeletonBlock[] {
  const blocks: SkeletonBlock[] = [];
  const hasList = /\.map\s*\(|<li\b/.test(source);
  const hasGrid = tokens.some((token) => token.includes("grid-cols-"));

  if (/<Image\b|<img\b|<video\b|<iframe\b/.test(source)) {
    blocks.push({ kind: "media", className: mediaClass(tokens) });
  }
  if (/<Avatar\b|avatar/i.test(source)) {
    blocks.push({ kind: "avatar", className: "h-10 w-10 rounded-full bg-slate-200" });
  }
  if (/<h[1-6]\b|text-(2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/.test(source)) {
    blocks.push({ kind: "heading", className: headingClass(tokens) });
  }
  if (/<p\b|text-(sm|base|lg|xl)/.test(source)) {
    blocks.push({ kind: "text", className: "h-4 w-full rounded bg-slate-200", repeat: 2 });
  }
  if (/<input\b|<textarea\b|<select\b/.test(source)) {
    blocks.push({ kind: "input", className: "h-11 w-full rounded bg-slate-200", repeat: inputCount(source) });
  }
  if (/<button\b|Button\b/.test(source)) {
    blocks.push({ kind: "button", className: buttonClass(tokens), repeat: buttonCount(source) });
  }
  if (/badge|chip|tag|pill/i.test(source)) {
    blocks.push({ kind: "badge", className: "h-6 w-20 rounded-full bg-slate-200" });
  }
  if (hasList || hasGrid) {
    blocks.push({ kind: "list-item", className: hasGrid ? "h-32 rounded bg-slate-200" : "h-14 w-full rounded bg-slate-200", repeat: hasGrid ? 3 : 4 });
  }
  if (blocks.length === 0) {
    blocks.push({ kind: "generic", className: "h-6 w-2/3 rounded bg-slate-200" });
    blocks.push({ kind: "text", className: "h-4 w-full rounded bg-slate-200", repeat: 2 });
  }
  return blocks;
}

function summarizeLayout(tokens: string[], viewport: "desktop" | "tablet" | "mobile"): LayoutSummary {
  const prefix = viewport === "desktop" ? /(lg|xl|2xl):/ : viewport === "tablet" ? /md:/ : /^(?!md:|lg:|xl:|2xl:)/;
  const scoped = tokens.filter((token) => prefix.test(token));
  const source = scoped.length > 0 ? scoped : tokens;
  return {
    width: pickToken(source, /(^|:)w-|(^|:)max-w-/, viewport === "desktop" ? "content-defined" : "100% or inherited"),
    height: pickToken(source, /(^|:)h-|(^|:)min-h-|(^|:)aspect-/, "content-defined"),
    layout: source.find((token) => /(^|:)grid\b|(^|:)flex\b/.test(token)) ?? "block",
    spacing: pickToken(source, /(^|:)(gap|space|p|px|py|m|mx|my)-/, "inherited"),
    alignment: pickToken(source, /(^|:)(items|justify|content|text)-/, "inherited"),
  };
}

function estimateAccuracy(source: string, tokens: string[]): number {
  let score = 72;
  if (tokens.some((token) => /^w-|^h-|^max-w-|^min-h-|^aspect-/.test(token))) score += 8;
  if (tokens.some((token) => /^(sm|md|lg|xl|2xl):/.test(token))) score += 8;
  if (/className=/.test(source)) score += 5;
  if (/<Image\b|<img\b|<button\b|<input\b|<h[1-6]\b|<p\b/.test(source)) score += 5;
  return Math.min(98, score);
}

function mediaClass(tokens: string[]): string {
  const aspect = tokens.find((token) => token.includes("aspect-")) ?? "aspect-video";
  return `${aspect} w-full rounded bg-slate-200`;
}

function headingClass(tokens: string[]): string {
  const width = tokens.find((token) => /^w-\d|^w-\//.test(token)) ?? "w-2/3";
  return `h-7 ${width} rounded bg-slate-200`;
}

function buttonClass(tokens: string[]): string {
  const width = tokens.find((token) => /^w-\d|^w-\//.test(token)) ?? "w-32";
  const height = tokens.find((token) => /^h-\d/.test(token)) ?? "h-10";
  return `${height} ${width} rounded bg-slate-200`;
}

function inputCount(source: string): number {
  return Math.max(1, Math.min(6, (source.match(/<input\b|<textarea\b|<select\b/g) ?? []).length));
}

function buttonCount(source: string): number {
  return Math.max(1, Math.min(4, (source.match(/<button\b|<Button\b/g) ?? []).length));
}

function pickToken(tokens: string[], pattern: RegExp, fallback: string): string {
  return tokens.find((token) => pattern.test(token)) ?? fallback;
}

function mergeClasses(...groups: string[]): string {
  return groups.flatMap((group) => group.split(/\s+/)).filter(Boolean).join(" ");
}

function isLayoutToken(token: string): boolean {
  return /^(flex|grid|block|inline|hidden|w-|h-|min-h-|max-w-|gap-|space-|p-|px-|py-|m-|mx-|my-|items-|justify-|content-|text-|rounded|border|shadow|aspect-)/.test(token);
}

function isResponsiveToken(token: string): boolean {
  return /^(sm|md|lg|xl|2xl):/.test(token);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
