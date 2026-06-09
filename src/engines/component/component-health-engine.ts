import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { lineOf } from "../../utils/source.js";

export async function runComponentHealthEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const componentFiles = context.files.filter(
    (file) => /\.(tsx|jsx)$/.test(file.relativePath) && !/(^|\/)(page|layout|loading|error)\.(tsx|jsx)$/.test(file.relativePath),
  );

  for (const file of componentFiles) {
    const lineCount = file.content.split(/\r?\n/).length;
    if (lineCount > 220) {
      findings.push({
        id: "component-too-large",
        title: "Component is too large",
        issue: `This component has ${lineCount} lines.`,
        impact: "Large components are harder to review, test, reuse, and optimize.",
        recommendation: "Split layout, interaction, and presentational pieces into smaller components.",
        severity: "Medium",
        location: { file: file.relativePath, line: 1 },
      });
    }
    if (/fetch\s*\(|axios\.|graphql-request/.test(file.content)) {
      findings.push({
        id: "component-fetching-data",
        title: "Data fetching inside component",
        issue: "A reusable component appears to fetch data directly.",
        impact: "This creates duplicate fetching and weakens page-to-section-to-UI data flow.",
        recommendation: "Move data loading into the page or lib/api and pass typed props down.",
        severity: "High",
        location: { file: file.relativePath, line: lineOf(file.content, /fetch\s*\(|axios\.|graphql-request/) },
      });
    }
    if (/interface\s+\w+Props|type\s+\w+Props/.test(file.content) === false && /function\s+[A-Z]\w*\s*\([^)]*{/.test(file.content)) {
      findings.push({
        id: "component-props-untyped",
        title: "Typed props not detected",
        issue: "A component with props does not expose an obvious Props type or interface.",
        impact: "Weak prop contracts make refactors and API changes riskier.",
        recommendation: "Define a named Props type or interface for public component inputs.",
        severity: "Low",
        location: { file: file.relativePath, line: lineOf(file.content, /function\s+[A-Z]\w*/) },
      });
    }
  }

  return {
    name: "Component Health",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Keep components small", "Use typed props", "Keep data loading out of presentational UI"],
  };
}
