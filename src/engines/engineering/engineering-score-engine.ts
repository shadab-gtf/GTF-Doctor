import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { stripLiteralText } from "../../utils/sanitize.js";

export async function runEngineeringScoreEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const packageJson = context.packageJson;
  const allSource = context.files.map((file) => stripLiteralText(file.content)).join("\n");

  if (!packageJson?.scripts?.build) {
    findings.push({
      id: "engineering-missing-build-script",
      title: "Build script missing",
      issue: "package.json does not define a build script.",
      impact: "The project is harder to validate consistently before release.",
      recommendation: "Add a deterministic build script and run it in CI.",
      severity: "High",
    });
  }
  if (!packageJson?.scripts?.test) {
    findings.push({
      id: "engineering-missing-test-script",
      title: "Test script missing",
      issue: "package.json does not define a test script.",
      impact: "Regression confidence is lower and adoption is harder to trust.",
      recommendation: "Add unit or integration tests for critical frontend behavior.",
      severity: "Medium",
    });
  }
  if (/\bany\b/.test(allSource)) {
    findings.push({
      id: "engineering-any-usage",
      title: "any usage detected",
      issue: "The codebase contains TypeScript any usage.",
      impact: "Type safety gaps make refactors and API changes less reliable.",
      recommendation: "Replace any with precise interfaces, unknown, or generic constraints.",
      severity: "Medium",
    });
  }
  if (/TODO|FIXME|HACK/.test(allSource)) {
    findings.push({
      id: "engineering-unfinished-marker",
      title: "Unfinished code marker detected",
      issue: "TODO, FIXME, or HACK markers were found in source files.",
      impact: "Unresolved implementation notes reduce launch confidence.",
      recommendation: "Resolve or document remaining markers before release.",
      severity: "Low",
    });
  }

  return {
    name: "Engineering Score",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Keep build and test commands reliable", "Preserve strict TypeScript", "Remove unfinished markers before launch"],
  };
}
