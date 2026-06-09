import { AuditReport } from "../types/report.js";

export function renderMarkdownReport(report: AuditReport): string {
  const engines = report.engines.map((engine) => {
    const findings = engine.findings
      .map((finding) => {
        const location = finding.location ? `${finding.location.file}:${finding.location.line}` : "Project level";
        return `### ${finding.title}

- Severity: ${finding.severity}
- Issue: ${finding.issue}
- Impact: ${finding.impact}
- File: ${location}
- Recommendation: ${finding.recommendation}`;
      })
      .join("\n\n");
    return `## ${engine.name}

Score: ${engine.score} / 100

${findings || "No issues detected."}`;
  });

  return `# GTF Inspector Report

Generated: ${report.generatedAt}

## Project

- Name: ${report.project.name}
- Framework: ${report.project.framework}
- Components: ${report.project.components}
- Pages: ${report.project.pages}
- Routes: ${report.project.routes}

## Overall Score

${report.overallScore} / 100

${engines.join("\n\n---\n\n")}

## Estimated Impact

- Potential Lighthouse Gain: +${report.impact.lighthouseGain}
- Potential Accessibility Gain: +${report.impact.accessibilityGain}
- Potential Bundle Reduction: -${report.impact.bundleReductionKb}KB
- Estimated Developer Fix Time: ${report.impact.developerFixMinutes} Minutes
- Developer Review Time Saved: ${report.impact.reviewTimeSavedMinutes} Minutes

## Top Priorities

${report.topPriorities.map((priority, index) => `${index + 1}. ${priority}`).join("\n") || "No priority issues detected."}
`;
}
