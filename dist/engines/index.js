import { runAccessibilityEngine } from "./accessibility/accessibility-engine.js";
import { runComponentHealthEngine } from "./component/component-health-engine.js";
import { runDependencyGraphEngine } from "./dependency/dependency-graph-engine.js";
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
import { runLinterEngine } from "./linter/linter-engine.js";
import { runDeadCodeEngine } from "./dead-code/dead-code-engine.js";
import { runSupplyChainEngine } from "./supply-chain/supply-chain-engine.js";
import { runRscAdvisoryEngine } from "./rsc-advisory/rsc-advisory-engine.js";
import { runReactNativeEngine } from "./react-native/react-native-engine.js";
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
        runDependencyGraphEngine(context),
        runSkeletonEngine(context),
        runNextjsEngine(context),
        runGsapEngine(context),
        runEngineeringScoreEngine(context),
        runLinterEngine(context),
        runDeadCodeEngine(context),
        runSupplyChainEngine(context),
        runRscAdvisoryEngine(context),
        runReactNativeEngine(context),
    ]);
}
export async function runEnabledEngines(context, config) {
    const runners = [
        config.seo ? runSeoEngine(context) : undefined,
        config.accessibility ? runAccessibilityEngine(context) : undefined,
        config.performance ? runPerformanceEngine(context) : undefined,
        config.memory ? runMemoryEngine(context) : undefined,
        config.reactDiagnostics ? runReactDiagnosticsEngine(context) : undefined,
        config.runtimeInsights ? runRuntimeEngine(context) : undefined,
        config.componentHealth ? runComponentHealthEngine(context) : undefined,
        config.pageHealth ? runPageHealthEngine(context) : undefined,
        runDependencyGraphEngine(context),
        config.skeleton ? runSkeletonEngine(context) : undefined,
        config.nextjs ? runNextjsEngine(context) : undefined,
        config.gsap ? runGsapEngine(context) : undefined,
        config.engineeringScore ? runEngineeringScoreEngine(context) : undefined,
        config.linter ? runLinterEngine(context) : undefined,
        config.deadCode ? runDeadCodeEngine(context) : undefined,
        config.supplyChain ? runSupplyChainEngine(context) : undefined,
        config.rscAdvisory ? runRscAdvisoryEngine(context) : undefined,
        config.reactNative ? runReactNativeEngine(context) : undefined,
    ];
    return Promise.all(runners.filter((runner) => runner !== undefined));
}
//# sourceMappingURL=index.js.map