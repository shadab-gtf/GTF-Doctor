import { scoreFromFindings } from "../../core/scoring.js";
import { lineOf } from "../../utils/source.js";
export async function runSeoEngine(context) {
    const findings = [];
    const appFiles = context.files.filter((file) => file.relativePath.startsWith("app/"));
    const metadataFiles = appFiles.filter((file) => /export\s+const\s+metadata|generateMetadata/.test(file.content));
    if (appFiles.length > 0 && metadataFiles.length === 0) {
        findings.push({
            id: "seo-missing-metadata",
            title: "Missing Metadata",
            issue: "No Next.js metadata export was found in the app router.",
            impact: "Search previews, titles, descriptions, and social cards can be incomplete or inconsistent.",
            recommendation: "Add centralized metadata in app/layout.tsx and route-specific metadata where needed.",
            severity: "Critical",
        });
    }
    for (const file of metadataFiles) {
        if (!/openGraph\s*:/.test(file.content)) {
            findings.push({
                id: "seo-missing-og",
                title: "Missing Open Graph metadata",
                issue: "Metadata exists but Open Graph fields are not defined.",
                impact: "Shared links may render without rich previews.",
                recommendation: "Add openGraph title, description, image, and URL metadata.",
                severity: "Medium",
                location: { file: file.relativePath, line: lineOf(file.content, /metadata|generateMetadata/) },
            });
        }
        if (!/alternates\s*:|canonical\s*:/.test(file.content)) {
            findings.push({
                id: "seo-missing-canonical",
                title: "Missing canonical URL",
                issue: "Canonical metadata was not detected.",
                impact: "Duplicate or variant URLs can dilute search ranking signals.",
                recommendation: "Add alternates.canonical to route metadata.",
                severity: "Medium",
                location: { file: file.relativePath, line: lineOf(file.content, /metadata|generateMetadata/) },
            });
        }
    }
    return {
        name: "SEO",
        score: scoreFromFindings(findings),
        findings,
        recommendations: ["Centralize shared metadata defaults", "Add OG images for high-value routes"],
    };
}
//# sourceMappingURL=seo-engine.js.map