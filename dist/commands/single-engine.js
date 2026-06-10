import { createAuditContext } from "../core/context.js";
import { attachCodeFrames } from "../core/code-frame.js";
import { renderTerminalReport } from "../reporting/terminal.js";
import { buildAuditReport } from "../core/scoring.js";
import { summarizeProject } from "../core/project-summary.js";
import { runAccessibilityEngine } from "../engines/accessibility/accessibility-engine.js";
import { runComponentHealthEngine } from "../engines/component/component-health-engine.js";
import { runEngineeringScoreEngine } from "../engines/engineering/engineering-score-engine.js";
import { runGsapEngine } from "../engines/gsap/gsap-engine.js";
import { runMemoryEngine } from "../engines/memory/memory-engine.js";
import { runMetadataEngine } from "../engines/metadata/metadata-engine.js";
import { runNextjsEngine } from "../engines/nextjs/nextjs-engine.js";
import { runPageHealthEngine } from "../engines/page/page-health-engine.js";
import { runPerformanceEngine } from "../engines/performance/performance-engine.js";
import { runReactDiagnosticsEngine } from "../engines/react/react-diagnostics-engine.js";
import { runRuntimeEngine } from "../engines/runtime/runtime-engine.js";
import { runSeoEngine } from "../engines/seo/seo-engine.js";
export async function singleEngineCommand(rootDir, engine) {
    const context = await createAuditContext(rootDir);
    const runners = {
        seo: runSeoEngine,
        metadata: runMetadataEngine,
        accessibility: runAccessibilityEngine,
        performance: runPerformanceEngine,
        memory: runMemoryEngine,
        react: runReactDiagnosticsEngine,
        runtime: runRuntimeEngine,
        component: runComponentHealthEngine,
        page: runPageHealthEngine,
        nextjs: runNextjsEngine,
        gsap: runGsapEngine,
        engineer: runEngineeringScoreEngine,
    };
    const engineReport = await runners[engine](context);
    console.log(renderTerminalReport(buildAuditReport(summarizeProject(context), attachCodeFrames(context, [engineReport]))));
}
//# sourceMappingURL=single-engine.js.map