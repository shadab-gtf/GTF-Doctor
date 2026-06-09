import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { lineOf } from "../../utils/source.js";

export async function runReactDiagnosticsEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const files = context.files.filter((file) => /\.(tsx|jsx)$/.test(file.relativePath));

  for (const file of files) {
    if (/\.map\s*\([^=]*=>\s*<[^>]+>/.test(file.content) && !/\bkey=/.test(file.content)) {
      findings.push({
        id: "react-missing-key",
        title: "List item key not detected",
        issue: "A mapped JSX list appears to render without a key prop.",
        impact: "React reconciliation can become unstable and cause incorrect UI updates.",
        recommendation: "Add a stable key from data identity, not the array index when avoidable.",
        severity: "High",
        location: { file: file.relativePath, line: lineOf(file.content, /\.map\s*\(/) },
      });
    }
    if (/useEffect\s*\([^,]+,\s*\[\s*\]\s*\)/s.test(file.content) && /(props\.|state\.|useState|useReducer)/.test(file.content)) {
      findings.push({
        id: "react-effect-dependencies",
        title: "Effect dependency risk",
        issue: "An effect with an empty dependency array appears to reference changing component data.",
        impact: "The component can read stale values and behave differently at runtime.",
        recommendation: "Include all reactive dependencies or refactor the effect to avoid stale closures.",
        severity: "Medium",
        location: { file: file.relativePath, line: lineOf(file.content, /useEffect\s*\(/) },
      });
    }
    if (/dangerouslySetInnerHTML/.test(file.content)) {
      findings.push({
        id: "react-dangerous-html",
        title: "dangerouslySetInnerHTML usage",
        issue: "The component renders raw HTML.",
        impact: "Unsanitized HTML can create XSS and content integrity risks.",
        recommendation: "Sanitize trusted HTML at the boundary and document the source contract.",
        severity: "Critical",
        location: { file: file.relativePath, line: lineOf(file.content, /dangerouslySetInnerHTML/) },
      });
    }
    if (/useMemo\s*\(|useCallback\s*\(/.test(file.content) && !/React\.memo|memo\s*\(/.test(file.content) && file.content.length < 1200) {
      findings.push({
        id: "react-premature-memo",
        title: "Memoization may be unnecessary",
        issue: "Memo hooks were detected in a small component without a clear memoized consumer.",
        impact: "Unnecessary memoization adds complexity and can hide dependency bugs.",
        recommendation: "Keep memoization only where it protects measured expensive work or stable child props.",
        severity: "Low",
        location: { file: file.relativePath, line: lineOf(file.content, /useMemo\s*\(|useCallback\s*\(/) },
      });
    }
  }

  return {
    name: "React Diagnostics",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Use stable keys", "Keep effects dependency-safe", "Avoid unsafe HTML and unnecessary memoization"],
  };
}
