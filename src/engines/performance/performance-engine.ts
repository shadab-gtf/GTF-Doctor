import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { lineOf } from "../../utils/source.js";

export async function runPerformanceEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];

  for (const file of context.files.filter((source) => /\.(tsx|jsx)$/.test(source.relativePath))) {
    if (/<img\b/.test(file.content)) {
      findings.push({
        id: "perf-raw-img",
        title: "Raw img element in Next.js UI",
        issue: "The component uses img instead of next/image.",
        impact: "Image optimization, responsive sizing, and CLS prevention can be missed.",
        recommendation: "Use next/image with explicit width, height, and sizes.",
        severity: "High",
        location: { file: file.relativePath, line: lineOf(file.content, /<img\b/) },
      });
    }
    if (/from\s+["']gsap\/all["']/.test(file.content)) {
      findings.push({
        id: "perf-gsap-all",
        title: "Large GSAP import",
        issue: "The component imports gsap/all.",
        impact: "Client bundle size can grow from unused animation modules.",
        recommendation: "Import only gsap core and required plugins.",
        severity: "Medium",
        location: { file: file.relativePath, line: lineOf(file.content, /gsap\/all/) },
      });
    }
    if (/use client/.test(file.content) && !/(useState|useEffect|onClick|gsap|window|document)/.test(file.content)) {
      findings.push({
        id: "perf-unneeded-client",
        title: "Client component may be unnecessary",
        issue: "The file is marked use client but no interaction, browser API, or animation usage was detected.",
        impact: "Unneeded client rendering increases JavaScript shipped to users.",
        recommendation: "Convert this file to a Server Component if no client-only behavior exists.",
        severity: "High",
        location: { file: file.relativePath, line: 1 },
      });
    }
  }

  return {
    name: "Performance",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Prefer Server Components", "Dynamically import heavy client widgets"],
  };
}
