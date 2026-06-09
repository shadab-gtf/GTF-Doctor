import { runAccessibilityEngine } from "./accessibility/accessibility-engine.js";
import { runGsapEngine } from "./gsap/gsap-engine.js";
import { runMetadataEngine } from "./metadata/metadata-engine.js";
import { runNextjsEngine } from "./nextjs/nextjs-engine.js";
import { runPerformanceEngine } from "./performance/performance-engine.js";
import { runSeoEngine } from "./seo/seo-engine.js";
import { runSkeletonEngine } from "./skeleton/skeleton-engine.js";
export async function runAllEngines(context) {
    return Promise.all([
        runSeoEngine(context),
        runMetadataEngine(context),
        runAccessibilityEngine(context),
        runPerformanceEngine(context),
        runSkeletonEngine(context),
        runNextjsEngine(context),
        runGsapEngine(context),
    ]);
}
//# sourceMappingURL=index.js.map