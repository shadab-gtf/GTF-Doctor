export type Severity = "Critical" | "High" | "Medium" | "Low";
export type EngineName = "SEO" | "Metadata" | "Accessibility" | "Performance" | "Skeleton Coverage" | "Next.js" | "GSAP" | "Memory Health" | "React Diagnostics" | "Runtime Insights" | "Component Health" | "Page Health" | "Engineering Score";
export interface SourceLocation {
    file: string;
    line: number;
}
export interface Finding {
    id: string;
    title: string;
    issue: string;
    impact: string;
    recommendation: string;
    severity: Severity;
    location?: SourceLocation;
}
export interface EngineReport {
    name: EngineName;
    score: number;
    findings: Finding[];
    recommendations: string[];
}
export interface ProjectSummary {
    name: string;
    framework: string;
    components: number;
    pages: number;
    routes: number;
}
export interface ImpactEstimate {
    lighthouseGain: number;
    accessibilityGain: number;
    bundleReductionKb: number;
    developerFixMinutes: number;
    reviewTimeSavedMinutes: number;
}
export interface AuditReport {
    generatedAt: string;
    project: ProjectSummary;
    overallScore: number;
    engines: EngineReport[];
    criticalIssues: number;
    warnings: number;
    topPriorities: string[];
    impact: ImpactEstimate;
}
export interface AuditContext {
    rootDir: string;
    projectName: string;
    files: ProjectFile[];
    packageJson?: PackageJson | undefined;
}
export interface ProjectFile {
    path: string;
    relativePath: string;
    extension: string;
    content: string;
}
export interface PackageJson {
    name?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
}
