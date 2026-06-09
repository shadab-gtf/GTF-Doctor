import { SCORE_WEIGHTS } from "./constants.js";
import { AuditReport, EngineReport, Finding, ImpactEstimate, ProjectSummary } from "../types/report.js";

export function scoreFromFindings(findings: Finding[], base = 100): number {
  const penalty = findings.reduce((total, finding) => {
    if (finding.severity === "Critical") return total + 18;
    if (finding.severity === "High") return total + 10;
    if (finding.severity === "Medium") return total + 5;
    return total + 2;
  }, 0);
  return Math.max(0, Math.min(100, base - penalty));
}

export function weightedOverall(engines: EngineReport[]): number {
  const byName = new Map(engines.map((engine) => [engine.name, engine.score]));
  const total =
    (byName.get("SEO") ?? 100) * SCORE_WEIGHTS.seo +
    (byName.get("Accessibility") ?? 100) * SCORE_WEIGHTS.accessibility +
    (byName.get("Performance") ?? 100) * SCORE_WEIGHTS.performance +
    (byName.get("Skeleton Coverage") ?? 100) * SCORE_WEIGHTS.skeleton +
    (byName.get("Next.js") ?? 100) * SCORE_WEIGHTS.nextjs +
    (byName.get("GSAP") ?? 100) * SCORE_WEIGHTS.gsap;
  return Math.round(total);
}

export function buildAuditReport(project: ProjectSummary, engines: EngineReport[]): AuditReport {
  const findings = engines.flatMap((engine) => engine.findings);
  const criticalIssues = findings.filter((finding) => finding.severity === "Critical").length;
  const warnings = findings.filter((finding) => finding.severity !== "Critical").length;
  const priorities = findings
    .slice()
    .sort((left, right) => severityRank(left.severity) - severityRank(right.severity))
    .slice(0, 4)
    .map((finding) => finding.recommendation);

  return {
    generatedAt: new Date().toISOString(),
    project,
    overallScore: weightedOverall(engines),
    engines,
    criticalIssues,
    warnings,
    topPriorities: priorities,
    impact: estimateImpact(findings),
  };
}

function severityRank(severity: Finding["severity"]): number {
  return { Critical: 0, High: 1, Medium: 2, Low: 3 }[severity];
}

function estimateImpact(findings: Finding[]): ImpactEstimate {
  const critical = findings.filter((finding) => finding.severity === "Critical").length;
  const high = findings.filter((finding) => finding.severity === "High").length;
  const medium = findings.filter((finding) => finding.severity === "Medium").length;
  return {
    lighthouseGain: Math.min(30, high * 3 + medium),
    accessibilityGain: Math.min(25, findings.filter((finding) => finding.id.startsWith("a11y")).length * 3),
    bundleReductionKb: Math.min(900, high * 45 + medium * 15),
    developerFixMinutes: critical * 20 + high * 12 + medium * 6 + 3,
    reviewTimeSavedMinutes: findings.length * 7 + 12,
  };
}
