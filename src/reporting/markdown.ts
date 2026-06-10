import { AuditReport } from "../types/report.js";

export function renderMarkdownReport(report: AuditReport): string {
  const engines: string[] = [];

  for (const engine of report.engines) {
    const findings: string[] = [];
    for (const finding of engine.findings) {
      const location = finding.location ? `${finding.location.file}:${finding.location.line}` : "Project level";
      const codeFrame = finding.codeFrame ? `\n\n\`\`\`tsx\n${finding.codeFrame}\n\`\`\`` : "";
      findings.push(`### ${finding.title}

- Severity: ${finding.severity}
- Issue: ${finding.issue}
- Impact: ${finding.impact}
- File: ${location}
- Recommendation: ${finding.recommendation}${codeFrame}`);
    }

    engines.push(`## ${engine.name}

Score: ${engine.score} / 100

${findings.join("\n\n") || "No issues detected."}`);
  }

  return `# GTF Scale Report

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
