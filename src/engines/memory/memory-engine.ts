import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { stripLiteralText } from "../../utils/sanitize.js";
import { lineOf } from "../../utils/source.js";

interface MemoryRule {
  id: string;
  title: string;
  issue: string;
  impact: string;
  recommendation: string;
  severity: Finding["severity"];
  detect: RegExp;
  cleanup?: RegExp;
  context?: RegExp;
}

const MEMORY_RULES: MemoryRule[] = [
  {
    id: "memory-event-listener-cleanup",
    title: "Event listener cleanup missing",
    issue: "An event listener is registered without a matching removeEventListener call.",
    impact: "Listeners can stay alive after unmount and cause memory leaks or duplicate behavior.",
    recommendation: "Return a cleanup function that removes every listener registered by the effect.",
    severity: "High",
    detect: /addEventListener\s*\(/,
    cleanup: /removeEventListener\s*\(/,
  },
  {
    id: "memory-interval-cleanup",
    title: "Interval cleanup missing",
    issue: "setInterval is used without clearInterval.",
    impact: "Intervals can continue running after a component is gone, wasting CPU and memory.",
    recommendation: "Store the interval id and call clearInterval from effect cleanup.",
    severity: "High",
    detect: /setInterval\s*\(/,
    cleanup: /clearInterval\s*\(/,
  },
  {
    id: "memory-timeout-cleanup",
    title: "Timeout cleanup not detected",
    issue: "A timeout is created inside a component effect without clearTimeout.",
    impact: "Delayed callbacks can update stale component state after route changes.",
    recommendation: "Store timeout ids and clear them in the effect cleanup.",
    severity: "Medium",
    detect: /setTimeout\s*\(/,
    cleanup: /clearTimeout\s*\(/,
    context: /useEffect\s*\(/,
  },
  {
    id: "memory-observer-disconnect",
    title: "Observer disconnect missing",
    issue: "A browser observer is created without a disconnect call.",
    impact: "Observers can retain DOM references and leak memory after unmount.",
    recommendation: "Call observer.disconnect() in cleanup.",
    severity: "High",
    detect: /(new\s+IntersectionObserver|new\s+ResizeObserver|new\s+MutationObserver)/,
    cleanup: /disconnect\s*\(/,
  },
];

export async function runMemoryEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];

  for (const file of context.files) {
    if (!/\.(tsx|jsx|ts|js)$/.test(file.relativePath)) {
      continue;
    }
    const source = stripLiteralText(file.content);

    for (const rule of MEMORY_RULES) {
      if (!rule.detect.test(source)) continue;
      if (rule.cleanup?.test(source)) continue;
      if (rule.context && !rule.context.test(source)) continue;

      findings.push({
        id: rule.id,
        title: rule.title,
        issue: rule.issue,
        impact: rule.impact,
        recommendation: rule.recommendation,
        severity: rule.severity,
        location: { file: file.relativePath, line: lineOf(file.content, rule.detect) },
      });
    }
  }

  return {
    name: "Memory Health",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Clean up subscriptions, timers, observers, and listeners", "Keep effects small and lifecycle-safe"],
  };
}
