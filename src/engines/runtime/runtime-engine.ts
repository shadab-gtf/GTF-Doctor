import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { stripLiteralText } from "../../utils/sanitize.js";
import { lineOf } from "../../utils/source.js";

export async function runRuntimeEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];

  for (const file of context.files) {
    const source = stripLiteralText(file.content);
    if (/\b(window|document|localStorage|sessionStorage)\b/.test(source) && !/["']use client["']/.test(file.content)) {
      findings.push({
        id: "runtime-browser-api-server",
        title: "Browser API used outside client boundary",
        issue: "Browser-only APIs were detected without a client component directive.",
        impact: "The code can fail during SSR, static rendering, or build-time execution.",
        recommendation: "Move browser API usage into a client component or guard it behind runtime checks.",
        severity: "Critical",
        location: { file: file.relativePath, line: lineOf(file.content, /\b(window|document|localStorage|sessionStorage)\b/) },
      });
    }
    if (/JSON\.parse\s*\(/.test(source) && !/try\s*{/.test(source)) {
      findings.push({
        id: "runtime-json-parse-unguarded",
        title: "Unguarded JSON.parse",
        issue: "JSON.parse is called without a nearby try/catch.",
        impact: "Invalid persisted or API data can crash the rendering path.",
        recommendation: "Wrap parsing in a safe parser and return a typed fallback.",
        severity: "Medium",
        location: { file: file.relativePath, line: lineOf(file.content, /JSON\.parse\s*\(/) },
      });
    }
    if (/fetch\s*\(/.test(source) && !/(try\s*{|\.catch\s*\()/.test(source)) {
      findings.push({
        id: "runtime-fetch-error-handling",
        title: "Fetch error handling not detected",
        issue: "A fetch call appears without explicit error handling.",
        impact: "Network failures can become uncaught runtime errors or blank UI states.",
        recommendation: "Handle failed responses and network errors with typed fallbacks.",
        severity: "Medium",
        location: { file: file.relativePath, line: lineOf(file.content, /fetch\s*\(/) },
      });
    }
  }

  return {
    name: "Runtime Insights",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Guard browser-only APIs", "Handle parsing and network failures explicitly"],
  };
}
