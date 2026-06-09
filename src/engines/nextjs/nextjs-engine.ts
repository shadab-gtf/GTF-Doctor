import { scoreFromFindings } from "../../core/scoring.js";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { lineOf } from "../../utils/source.js";

export async function runNextjsEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const appPages = context.files.filter((file) => /(^|\/)page\.(tsx|jsx)$/.test(file.relativePath));

  for (const file of appPages) {
    if (/["']use client["']/.test(file.content)) {
      findings.push({
        id: "nextjs-client-page",
        title: "Client directive in page",
        issue: "A Next.js page is marked with use client.",
        impact: "The route loses server-first rendering benefits and can increase bundle size.",
        recommendation: "Move interactive UI into a child client component and keep the page server-only.",
        severity: "Critical",
        location: { file: file.relativePath, line: 1 },
      });
    }
    if (/(useState|useEffect|onClick=)/.test(file.content)) {
      findings.push({
        id: "nextjs-ui-logic-page",
        title: "UI logic inside page",
        issue: "The page appears to contain client UI logic.",
        impact: "This violates page-as-data-layer separation and makes the route harder to stream.",
        recommendation: "Fetch data in the page and pass props into sections or UI components.",
        severity: "High",
        location: { file: file.relativePath, line: lineOf(file.content, /(useState|useEffect|onClick=)/) },
      });
    }
  }

  for (const file of context.files.filter((source) => source.relativePath.startsWith("app/"))) {
    if (/await\s+/.test(file.content) && !/<Suspense\b/.test(file.content) && /page\.(tsx|jsx)$/.test(file.relativePath)) {
      findings.push({
        id: "nextjs-missing-suspense",
        title: "Async route without Suspense boundary",
        issue: "The page performs async work but no Suspense boundary was detected.",
        impact: "The UI can block instead of streaming async sections progressively.",
        recommendation: "Wrap async sections in React Suspense and provide a matching skeleton fallback.",
        severity: "High",
        location: { file: file.relativePath, line: lineOf(file.content, /await\s+/) },
      });
    }
  }

  return {
    name: "Next.js",
    score: scoreFromFindings(findings),
    findings,
    recommendations: ["Keep app pages server-only", "Stream async sections with Suspense"],
  };
}
