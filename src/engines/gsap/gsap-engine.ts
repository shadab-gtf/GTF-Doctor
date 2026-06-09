import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { lineOf } from "../../utils/source.js";

export async function runGsapEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const gsapFiles = context.files.filter((file) => hasRuntimeGsapUsage(file.content));

  for (const file of gsapFiles) {
    if (!/["']use client["']/.test(file.content)) {
      findings.push({
        id: "gsap-server-component",
        title: "GSAP in Server Component",
        issue: "GSAP usage was found without a client component directive.",
        impact: "Animations require browser APIs and can fail during server rendering.",
        recommendation: "Move GSAP animation code into a focused client component.",
        severity: "Critical",
        location: { file: file.relativePath, line: lineOf(file.content, /gsap|ScrollTrigger/) },
      });
    }
    if (/gsap\.(to|from|fromTo|timeline)/.test(file.content) && !/(ctx\.revert\(\)|context\()/.test(file.content)) {
      findings.push({
        id: "gsap-missing-cleanup",
        title: "Missing GSAP cleanup",
        issue: "GSAP animation code does not appear to call ctx.revert() or use gsap.context().",
        impact: "Animations and ScrollTriggers can leak across route transitions.",
        recommendation: "Wrap animations in gsap.context() and return ctx.revert() from the effect.",
        severity: "High",
        location: { file: file.relativePath, line: lineOf(file.content, /gsap\.(to|from|fromTo|timeline)/) },
      });
    }
    if (/ScrollTrigger\.create/.test(file.content) && !/ScrollTrigger\.kill|kill\(\)/.test(file.content)) {
      findings.push({
        id: "gsap-scrolltrigger-cleanup",
        title: "ScrollTrigger cleanup not detected",
        issue: "ScrollTrigger.create is used without an explicit cleanup signal.",
        impact: "Scroll listeners and triggers may stay active after component unmount.",
        recommendation: "Create ScrollTriggers inside gsap.context() or kill them during effect cleanup.",
        severity: "High",
        location: { file: file.relativePath, line: lineOf(file.content, /ScrollTrigger\.create/) },
      });
    }
  }

  return {
    name: "GSAP",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Keep GSAP isolated to client components", "Use gsap.context for route-safe cleanup"],
  };
}

function hasRuntimeGsapUsage(content: string): boolean {
  return (
    /(^|\n)\s*import\s+.*from\s+["']gsap(?:\/[^"']*)?["']/.test(content) ||
    /(^|\n)\s*import\s+gsap\s+from\s+["']gsap["']/.test(content) ||
    /(^|\n)\s*(?:const\s+\w+\s*=\s*)?gsap\.(to|from|fromTo|timeline|context|registerPlugin)\b/.test(content) ||
    /(^|\n)\s*(?:const\s+\w+\s*=\s*)?ScrollTrigger\.(create|refresh|killAll)\b/.test(content)
  );
}
