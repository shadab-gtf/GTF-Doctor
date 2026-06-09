import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { lineOf } from "../../utils/source.js";

export async function runAccessibilityEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const jsxFiles = context.files.filter((file) => /\.(tsx|jsx)$/.test(file.relativePath));

  for (const file of jsxFiles) {
    if (/<img\b(?![^>]*\balt=)/.test(file.content)) {
      findings.push({
        id: "a11y-missing-alt",
        title: "Missing image alt text",
        issue: "An img element does not include an alt attribute.",
        impact: "Screen reader users cannot understand the purpose of the image.",
        recommendation: "Add meaningful alt text or alt=\"\" for decorative images.",
        severity: "Medium",
        location: { file: file.relativePath, line: lineOf(file.content, /<img\b(?![^>]*\balt=)/) },
      });
    }
    if (/<input\b(?![^>]*(aria-label|aria-labelledby|id=))/.test(file.content)) {
      findings.push({
        id: "a11y-input-label",
        title: "Input missing accessible label",
        issue: "An input lacks an id, aria-label, or aria-labelledby attribute.",
        impact: "Assistive technology may announce the control without useful context.",
        recommendation: "Connect the input to a visible label or add an ARIA label.",
        severity: "Medium",
        location: { file: file.relativePath, line: lineOf(file.content, /<input\b/) },
      });
    }
    if (/<button\b[^>]*>\s*<\/button>/.test(file.content)) {
      findings.push({
        id: "a11y-empty-button",
        title: "Empty button",
        issue: "A button renders without readable text or accessible naming.",
        impact: "Keyboard and screen reader users cannot identify the action.",
        recommendation: "Add visible text, aria-label, or an accessible icon label.",
        severity: "High",
        location: { file: file.relativePath, line: lineOf(file.content, /<button\b/) },
      });
    }
  }

  return {
    name: "Accessibility",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Prefer semantic controls", "Run browser axe checks before release"],
  };
}
