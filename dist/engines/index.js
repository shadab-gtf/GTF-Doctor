import { runAccessibilityEngine } from "./accessibility/accessibility-engine.js";
import { runComponentHealthEngine } from "./component/component-health-engine.js";
import { runEngineeringScoreEngine } from "./engineering/engineering-score-engine.js";
import { runGsapEngine } from "./gsap/gsap-engine.js";
import { runMemoryEngine } from "./memory/memory-engine.js";
import { runMetadataEngine } from "./metadata/metadata-engine.js";
import { runNextjsEngine } from "./nextjs/nextjs-engine.js";
import { runPageHealthEngine } from "./page/page-health-engine.js";
import { runPerformanceEngine } from "./performance/performance-engine.js";
import { runReactDiagnosticsEngine } from "./react/react-diagnostics-engine.js";
import { runRuntimeEngine } from "./runtime/runtime-engine.js";
import { runSeoEngine } from "./seo/seo-engine.js";
import { runSkeletonEngine } from "./skeleton/skeleton-engine.js";
export async function runAllEngines(context) {
    return Promise.all([
        runSeoEngine(context),
        runMetadataEngine(context),
        runAccessibilityEngine(context),
        runPerformanceEngine(context),
        runMemoryEngine(context),
        runReactDiagnosticsEngine(context),
        runRuntimeEngine(context),
        runComponentHealthEngine(context),
        runPageHealthEngine(context),
        runSkeletonEngine(context),
        runNextjsEngine(context),
        runGsapEngine(context),
        runEngineeringScoreEngine(context),
    ]);
}
//# sourceMappingURL=index.js.map