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
        [(byName.get("React Code Quality Linter") ?? 100), SCORE_WEIGHTS.linter],
        [(byName.get("Dead Code Analysis") ?? 100), SCORE_WEIGHTS.deadCode],
        [(byName.get("Supply Chain Security") ?? 100), SCORE_WEIGHTS.supplyChain],
        [(byName.get("React Server Components Advisory") ?? 100), SCORE_WEIGHTS.rscAdvisory],
        [(byName.get("React Native Hardening") ?? 100), SCORE_WEIGHTS.reactNative],
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
    const priorities = summarizePriorities(findings);
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
function summarizePriorities(findings) {
    const grouped = new Map();
    for (const finding of findings) {
        const key = `${finding.id}:${finding.recommendation}`;
        const existing = grouped.get(key);
        const file = finding.location?.file;
        if (existing) {
            existing.count += 1;
            if (file)
                existing.files.add(file);
            continue;
        }
        grouped.set(key, {
            finding,
            count: 1,
            files: new Set(file ? [file] : []),
        });
    }
    return [...grouped.values()]
        .sort((left, right) => {
        const severity = SEVERITY_RANK[left.finding.severity] - SEVERITY_RANK[right.finding.severity];
        return severity !== 0 ? severity : right.count - left.count;
    })
        .slice(0, 4)
        .map((item) => {
        const examples = [...item.files].slice(0, 2).join(", ");
        const suffix = item.count > 1 ? ` (${item.count} occurrences${examples ? `, e.g. ${examples}` : ""})` : "";
        return `${item.finding.recommendation}${suffix}`;
    });
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