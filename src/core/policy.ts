import { AuditReport, Finding } from "../types/report.js";
import { ResolvedGtfConfig } from "../types/config.js";

export interface PolicyResult {
  passed: boolean;
  reasons: string[];
}

export function evaluatePolicy(report: AuditReport, config: ResolvedGtfConfig): PolicyResult {
  const findings = report.engines.flatMap((engine) => engine.findings);
  const critical = findings.filter((finding) => finding.severity === "Critical").length;
  const high = findings.filter((finding) => finding.severity === "High").length;
  const reasons: string[] = [];

  if (report.overallScore < config.policy.minimumScore) {
    reasons.push(`Overall score ${report.overallScore} is below required ${config.policy.minimumScore}.`);
  }
  if (config.policy.failOnCritical && critical > 0) {
    reasons.push(`${critical} critical issue${critical === 1 ? "" : "s"} detected.`);
  }
  if (high > config.policy.failOnHighCount) {
    reasons.push(`${high} high-severity issues exceed allowed ${config.policy.failOnHighCount}.`);
  }

  return {
    passed: reasons.length === 0,
    reasons,
  };
}

export function routeReadiness(report: AuditReport): string[] {
  const blockers = report.engines
    .flatMap((engine) => engine.findings)
    .filter(isLaunchBlocker)
    .map((finding) => {
      const location = finding.location ? `${finding.location.file}:${finding.location.line}` : "Project level";
      return `[${finding.severity}] ${finding.title} (${location})`;
    });

  return blockers;
}

function isLaunchBlocker(finding: Finding): boolean {
  return (
    finding.severity === "Critical" ||
    finding.id === "nextjs-client-page" ||
    finding.id === "page-client-boundary" ||
    finding.id === "component-fetching-data" ||
    finding.id === "nextjs-missing-suspense" ||
    finding.id === "perf-raw-img"
  );
}
