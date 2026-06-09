import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { lineOf } from "../../utils/source.js";

export async function runMetadataEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const routeFiles = context.files.filter((file) => /(^|\/)page\.(tsx|jsx)$/.test(file.relativePath));

  for (const file of routeFiles) {
    if (!/metadata|generateMetadata/.test(file.content)) {
      findings.push({
        id: "metadata-route-missing",
        title: "Route metadata not detected",
        issue: "This page does not export metadata or generateMetadata.",
        impact: "Route-level search and social previews may rely on generic defaults.",
        recommendation: "Add route metadata or confirm the inherited layout metadata is sufficient.",
        severity: "High",
        location: { file: file.relativePath, line: 1 },
      });
    }
    if (/title\s*:\s*["'`][^"'`]{1,8}["'`]/.test(file.content)) {
      findings.push({
        id: "metadata-short-title",
        title: "Short metadata title",
        issue: "The metadata title appears too short to describe the route.",
        impact: "Search result titles can be unclear and receive lower click-through.",
        recommendation: "Use descriptive titles that include page intent and brand context.",
        severity: "Low",
        location: { file: file.relativePath, line: lineOf(file.content, /title\s*:/) },
      });
    }
  }

  return {
    name: "Metadata",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Keep defaults in root layout", "Use route overrides for important pages"],
  };
}
