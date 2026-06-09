import { createAuditContext } from "../core/context.js";
import { renderTerminalReport } from "../reporting/terminal.js";
import { buildAuditReport } from "../core/scoring.js";
import { summarizeProject } from "../core/project-summary.js";
import { runAccessibilityEngine } from "../engines/accessibility/accessibility-engine.js";
import { runGsapEngine } from "../engines/gsap/gsap-engine.js";
import { runMetadataEngine } from "../engines/metadata/metadata-engine.js";
import { runNextjsEngine } from "../engines/nextjs/nextjs-engine.js";
import { runPerformanceEngine } from "../engines/performance/performance-engine.js";
import { runSeoEngine } from "../engines/seo/seo-engine.js";

export type SingleEngine = "seo" | "metadata" | "accessibility" | "performance" | "nextjs" | "gsap";

export async function singleEngineCommand(rootDir: string, engine: SingleEngine): Promise<void> {
  const context = await createAuditContext(rootDir);
  const runners = {
    seo: runSeoEngine,
    metadata: runMetadataEngine,
    accessibility: runAccessibilityEngine,
    performance: runPerformanceEngine,
    nextjs: runNextjsEngine,
    gsap: runGsapEngine,
  };
  const engineReport = await runners[engine](context);
  console.log(renderTerminalReport(buildAuditReport(summarizeProject(context), [engineReport])));
}
