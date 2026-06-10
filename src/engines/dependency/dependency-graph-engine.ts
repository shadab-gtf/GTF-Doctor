import path from "node:path";
import { analyzeSource } from "../../core/source-analysis.js";
import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding, ProjectFile } from "../../types/report.js";

interface ImportEdge {
  from: string;
  to: string;
  source: string;
  line: number;
}

const HEAVY_IMPORTS = new Map<string, { impact: string; recommendation: string }>([
  ["lodash", { impact: "Importing all of lodash can add avoidable JavaScript to the client bundle.", recommendation: "Import specific functions such as lodash/debounce or use native utilities." }],
  ["gsap/all", { impact: "gsap/all pulls animation modules that may not be used.", recommendation: "Import gsap core and register only the plugins used by this file." }],
  ["framer-motion", { impact: "Framer Motion is a large client dependency when used in broad layout paths.", recommendation: "Keep it in isolated client components and dynamically import non-critical animation surfaces." }],
  ["three", { impact: "Three.js is large and can dominate route bundles.", recommendation: "Load 3D experiences dynamically and keep them out of initial route rendering." }],
]);

export async function runDependencyGraphEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const edges = context.files.flatMap((file) => importsFor(file));
  const sourceFiles = new Set(context.files.map((file) => file.relativePath));

  for (const edge of edges) {
    const heavy = HEAVY_IMPORTS.get(edge.source);
    if (heavy) {
      findings.push({
        id: "dependency-heavy-import",
        title: `Heavy dependency import: ${edge.source}`,
        issue: `${edge.from} imports ${edge.source}.`,
        impact: heavy.impact,
        recommendation: heavy.recommendation,
        severity: edge.source === "gsap/all" ? "Medium" : "High",
        location: { file: edge.from, line: edge.line },
        category: "Bundle",
        confidence: 0.9,
        fix: {
          summary: "Reduce dependency weight in the render path.",
          steps: ["Import only the used module or function.", "Move heavy client-only UI behind dynamic import when it is not above the fold.", "Re-run the audit to verify bundle-risk reduction."],
          safeAutoFix: false,
        },
      });
    }
  }

  const cycles = findCycles(edges.filter((edge) => sourceFiles.has(edge.to)));
  for (const cycle of cycles.slice(0, 8)) {
    const first = cycle[0];
    if (!first) continue;
    findings.push({
      id: "dependency-import-cycle",
      title: "Import cycle detected",
      issue: `A circular import path exists: ${cycle.join(" -> ")}.`,
      impact: "Circular imports can create undefined values during module initialization and make refactors risky.",
      recommendation: "Break the cycle by moving shared logic into a lower-level utility or inverting the dependency.",
      severity: "High",
      location: { file: first, line: 1 },
      category: "Architecture",
      confidence: 0.86,
    });
  }

  const inbound = new Map<string, number>();
  for (const edge of edges) {
    if (sourceFiles.has(edge.to)) {
      inbound.set(edge.to, (inbound.get(edge.to) ?? 0) + 1);
    }
  }
  for (const [file, count] of inbound) {
    if (count >= 12 && /components\//.test(file)) {
      findings.push({
        id: "dependency-high-fan-in-component",
        title: "High fan-in component dependency",
        issue: `${file} is imported by ${count} local files.`,
        impact: "Changes to this component have a broad blast radius and can cause repeated bundle inclusion across routes.",
        recommendation: "Stabilize its props, keep it presentational, and split route-specific behavior out of the shared dependency.",
        severity: "Medium",
        location: { file, line: 1 },
        category: "Engineering",
        confidence: 0.82,
      });
    }
  }

  return {
    name: "Dependency Graph",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Keep heavy dependencies out of initial render paths", "Break import cycles", "Watch high fan-in shared components"],
  };
}

function importsFor(file: ProjectFile): ImportEdge[] {
  const analyzed = analyzeSource(file);
  return analyzed.imports
    .filter((item) => item.importKind === "value")
    .map((item) => ({
      from: file.relativePath,
      to: resolveImport(file.relativePath, item.source),
      source: item.source,
      line: item.line,
    }));
}

function resolveImport(from: string, source: string): string {
  if (!source.startsWith(".")) {
    return source;
  }
  const base = path.posix.dirname(from);
  const normalized = path.posix.normalize(path.posix.join(base, source));
  if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(normalized)) {
    return normalized;
  }
  return `${normalized}.tsx`;
}

function findCycles(edges: ImportEdge[]): string[][] {
  const graph = new Map<string, string[]>();
  for (const edge of edges) {
    graph.set(edge.from, [...(graph.get(edge.from) ?? []), edge.to]);
  }

  const cycles: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(node: string, stack: string[]): void {
    if (visiting.has(node)) {
      const start = stack.indexOf(node);
      if (start >= 0) cycles.push([...stack.slice(start), node]);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const next of graph.get(node) ?? []) {
      visit(next, [...stack, next]);
    }
    visiting.delete(node);
    visited.add(node);
  }

  for (const node of graph.keys()) {
    visit(node, [node]);
  }

  return cycles;
}
