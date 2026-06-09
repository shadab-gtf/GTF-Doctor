import chalk from "chalk";
import type { ChalkInstance } from "chalk";
import gradient from "gradient-string";
import { AuditReport, EngineReport, Finding } from "../types/report.js";

const divider = "------------------------------------------------------------";

export function brandBanner(): string {
  const width = 54;
  const wordmarkLines = [
    "  GGGGGGGGG      TTTTTTTTTTT     FFFFFFFFFFF  ",
    " GGG             TTTTTTTTTTT     FFFFFFFFFFF  ",
    " GGG                 TTT         FFF          ",
    " GGG   GGGG          TTT         FFFFFFFF     ",
    " GGG     GG          TTT         FFFFFFFF     ",
    " GGG     GG          TTT         FFF          ",
    "  GGGGGGGG           TTT         FFF          ",
  ];
  const line = chalk.cyan(`+${"-".repeat(width)}+`);
  const empty = `${chalk.cyan("|")}${" ".repeat(width)}${chalk.cyan("|")}`;
  return [
    line,
    empty,
    wordmarkLines
      .map((wordmarkLine) => `${chalk.cyan("|")} ${gradient(["#00D1FF", "#7C3AED", "#F97316"])(wordmarkLine.padEnd(width))}${chalk.cyan("|")}`)
      .join("\n"),
    empty,
    `${chalk.cyan("|")} ${chalk.bold.white("GTF INSPECTOR").padEnd(width - 1)}${chalk.cyan("|")}`,
    `${chalk.cyan("|")} ${chalk.gray("Frontend Quality Platform").padEnd(width - 1)}${chalk.cyan("|")}`,
    empty,
    line,
  ].join("\n");
}

export function renderTerminalReport(report: AuditReport): string {
  const sections = report.engines.map(renderEngine).join("\n\n");
  const priorities = report.topPriorities.map((priority, index) => `${index + 1}. ${priority}`).join("\n");
  return `${divider}

GTF INSPECTOR REPORT

Project:
${report.project.name}

Framework:
${report.project.framework}

Components:
${report.project.components}

Pages:
${report.project.pages}

Routes:
${report.project.routes}

${divider}

OVERALL SCORE

${scoreColor(report.overallScore)(`${report.overallScore} / 100`)}

${divider}

${sections}

${divider}

ESTIMATED IMPACT

Potential Lighthouse Gain:
+${report.impact.lighthouseGain}

Potential Accessibility Gain:
+${report.impact.accessibilityGain}

Potential Bundle Reduction:
-${report.impact.bundleReductionKb}KB

Estimated Developer Fix Time:
${report.impact.developerFixMinutes} Minutes

Developer Review Time Saved:
${report.impact.reviewTimeSavedMinutes} Minutes

${divider}

COPYABLE SUMMARY

Project Score: ${report.overallScore}

Critical Issues: ${report.criticalIssues}
Warnings: ${report.warnings}

Top Priorities:

${priorities || "No priority issues detected."}

${divider}`;
}

function renderEngine(engine: EngineReport): string {
  const findings = engine.findings.length > 0 ? engine.findings.map(renderFinding).join("\n\n") : "No issues detected.";
  return `${engine.name.toUpperCase()}

Score: ${scoreColor(engine.score)(String(engine.score))}

Issues:

${findings}`;
}

function renderFinding(finding: Finding): string {
  const location = finding.location ? `${finding.location.file}:${finding.location.line}` : "Project level";
  return `- [${severityColor(finding.severity)(finding.severity)}] ${finding.title}
  Issue: ${finding.issue}
  Impact: ${finding.impact}
  File: ${location}
  Recommendation: ${finding.recommendation}
  Priority: ${finding.severity}`;
}

function scoreColor(score: number): ChalkInstance {
  if (score >= 90) return chalk.green.bold;
  if (score >= 75) return chalk.yellow.bold;
  return chalk.red.bold;
}

function severityColor(severity: Finding["severity"]): ChalkInstance {
  if (severity === "Critical") return chalk.red.bold;
  if (severity === "High") return chalk.magenta.bold;
  if (severity === "Medium") return chalk.yellow.bold;
  return chalk.gray.bold;
}
