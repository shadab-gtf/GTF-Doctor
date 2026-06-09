import path from "node:path";
import { scoreFromFindings } from "../../core/scoring.js";
export async function runSkeletonEngine(context) {
    const components = getComponentFiles(context.files);
    const skeletonNames = new Set(context.files
        .map((file) => path.basename(file.relativePath).replace(/\.(tsx|jsx)$/, ""))
        .filter((name) => name.endsWith("Skeleton")));
    const findings = [];
    for (const component of components) {
        const baseName = path.basename(component.relativePath).replace(/\.(tsx|jsx)$/, "");
        if (baseName.endsWith("Skeleton")) {
            continue;
        }
        if (!skeletonNames.has(`${baseName}Skeleton`)) {
            findings.push({
                id: "skeleton-missing",
                title: `Missing skeleton for ${baseName}`,
                issue: `${baseName} does not have a matching ${baseName}Skeleton component.`,
                impact: "Async rendering can show blank or shifting UI during loading states.",
                recommendation: `Create ${baseName}Skeleton with layout-matched placeholders.`,
                severity: "High",
                location: { file: component.relativePath, line: 1 },
            });
        }
    }
    const baseScore = components.length === 0 ? 100 : Math.round(((components.length - findings.length) / components.length) * 100);
    return {
        name: "Skeleton Coverage",
        score: scoreFromFindings(findings, baseScore),
        findings,
        recommendations: ["Add skeletons for async sections and repeated cards", "Match dimensions to prevent CLS"],
    };
}
export function getComponentFiles(files) {
    return files.filter((file) => /\.(tsx|jsx)$/.test(file.relativePath) &&
        !/(^|\/)(page|layout|loading|error)\.(tsx|jsx)$/.test(file.relativePath) &&
        !file.relativePath.endsWith(".test.tsx"));
}
//# sourceMappingURL=skeleton-engine.js.map