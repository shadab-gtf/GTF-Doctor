export type Severity = "Critical" | "High" | "Medium" | "Low";

export type EngineName =
  | "SEO"
  | "Metadata"
  | "Accessibility"
  | "Performance"
  | "Skeleton Coverage"
  | "Next.js"
  | "GSAP"
  | "Memory Health"
  | "React Diagnostics"
  | "Runtime Insights"
  | "Component Health"
  | "Page Health"
  | "Dependency Graph"
  | "Engineering Score"
  | "React Code Quality Linter"
  | "Dead Code Analysis"
  | "Supply Chain Security"
  | "React Server Components Advisory"
  | "React Native Hardening";

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
  category?: "Architecture" | "Performance" | "Accessibility" | "SEO" | "Reliability" | "Skeleton" | "Runtime" | "Animation" | "Type Safety" | "Bundle" | "Engineering";
  confidence?: number;
  fix?: {
    summary: string;
    steps: string[];
    safeAutoFix: boolean;
  };
  docs?: string;
  codeFrame?: string;
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
  changedFiles?: string[];
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
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}
