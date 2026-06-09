import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { lineOf } from "../../utils/source.js";

export async function runPageHealthEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const pageFiles = context.files.filter((file) => /(^|\/)page\.(tsx|jsx)$/.test(file.relativePath));

  for (const file of pageFiles) {
    if (/["']use client["']/.test(file.content)) {
      findings.push({
        id: "page-client-boundary",
        title: "Page is a client component",
        issue: "A route page is marked with use client.",
        impact: "This weakens server-first rendering and can increase JavaScript shipped to users.",
        recommendation: "Keep pages server-only and move interaction into child client components.",
        severity: "Critical",
        location: { file: file.relativePath, line: 1 },
      });
    }
    if (/<(div|section|article|main)\b/g.test(file.content) && !/components|sections|<Suspense\b/.test(file.content)) {
      findings.push({
        id: "page-inline-ui",
        title: "Page contains inline UI structure",
        issue: "The page appears to render UI layout directly instead of delegating to sections.",
        impact: "Pages become harder to stream, test, and keep as server data boundaries.",
        recommendation: "Use the page for data loading and pass props into section components.",
        severity: "Medium",
        location: { file: file.relativePath, line: lineOf(file.content, /<(div|section|article|main)\b/) },
      });
    }
    if (/await\s+/.test(file.content) && !/<Suspense\b/.test(file.content)) {
      findings.push({
        id: "page-streaming-missing",
        title: "Streaming boundary not detected",
        issue: "The page awaits data without a Suspense boundary.",
        impact: "Async sections can block the route instead of streaming progressively.",
        recommendation: "Wrap async sections in Suspense and provide layout-matched skeleton fallbacks.",
        severity: "High",
        location: { file: file.relativePath, line: lineOf(file.content, /await\s+/) },
      });
    }
  }

  return {
    name: "Page Health",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Keep pages as server data layers", "Use sections for layout", "Stream async UI with Suspense"],
  };
}
