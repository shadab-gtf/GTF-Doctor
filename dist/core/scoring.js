import { SCORE_WEIGHTS } from "./constants.js";
const SEVERITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };
export function scoreFromFindings(findings, base = 100) {
    const penalty = findings.reduce((total, finding) => {
        if (finding.severity === "Critical")
            return total + 18;
        if (finding.severity === "High")
            return total + 10;
        if (finding.severity === "Medium")
            return total + 5;
        return total + 2;
    }, 0);
    return Math.max(0, Math.min(100, base - penalty));
}
export function weightedOverall(engines) {
    const byName = new Map(engines.map((engine) => [engine.name, engine.score]));
    const weightedScores = [
        [(byName.get("SEO") ?? 100), SCORE_WEIGHTS.seo],
        [(byName.get("Accessibility") ?? 100), SCORE_WEIGHTS.accessibility],
        [(byName.get("Performance") ?? 100), SCORE_WEIGHTS.performance],
        [(byName.get("Skeleton Coverage") ?? 100), SCORE_WEIGHTS.skeleton],
        [(byName.get("Next.js") ?? 100), SCORE_WEIGHTS.nextjs],
        [(byName.get("GSAP") ?? 100), SCORE_WEIGHTS.gsap],
        [(byName.get("Memory Health") ?? 100), SCORE_WEIGHTS.memory],
        [(byName.get("React Diagnostics") ?? 100), SCORE_WEIGHTS.react],
        [(byName.get("Runtime Insights") ?? 100), SCORE_WEIGHTS.runtime],
        [(byName.get("Component Health") ?? 100), SCORE_WEIGHTS.component],
        [(byName.get("Page Health") ?? 100), SCORE_WEIGHTS.page],
        [(byName.get("Engineering Score") ?? 100), SCORE_WEIGHTS.engineering],
    ];
    const totalWeight = weightedScores.reduce((total, item) => total + item[1], 0);
    const total = weightedScores.reduce((sum, item) => sum + item[0] * item[1], 0);
    return Math.round(total / totalWeight);
}
export function buildAuditReport(project, engines) {
    const findings = [];
    const stats = { critical: 0, high: 0, medium: 0, warnings: 0, accessibility: 0 };
    for (const engine of engines) {
        for (const finding of engine.findings) {
            findings.push(finding);
            if (finding.severity === "Critical")
                stats.critical += 1;
            else
                stats.warnings += 1;
            if (finding.severity === "High")
                stats.high += 1;
            if (finding.severity === "Medium")
                stats.medium += 1;
            if (finding.id.startsWith("a11y"))
                stats.accessibility += 1;
        }
    }
    const priorities = findings
        .slice()
        .sort((left, right) => SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity])
        .slice(0, 4)
        .map((finding) => finding.recommendation);
    return {
        generatedAt: new Date().toISOString(),
        project,
        overallScore: weightedOverall(engines),
        engines,
        criticalIssues: stats.critical,
        warnings: stats.warnings,
        topPriorities: priorities,
        impact: estimateImpact(findings.length, stats),
    };
}
function estimateImpact(findingCount, stats) {
    return {
        lighthouseGain: Math.min(30, stats.high * 3 + stats.medium),
        accessibilityGain: Math.min(25, stats.accessibility * 3),
        bundleReductionKb: Math.min(900, stats.high * 45 + stats.medium * 15),
        developerFixMinutes: stats.critical * 20 + stats.high * 12 + stats.medium * 6 + 3,
        reviewTimeSavedMinutes: findingCount * 7 + 12,
    };
}
//# sourceMappingURL=scoring.js.map