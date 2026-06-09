import { AuditReport, EngineReport, Finding, ProjectSummary } from "../types/report.js";
export declare function scoreFromFindings(findings: Finding[], base?: number): number;
export declare function weightedOverall(engines: EngineReport[]): number;
export declare function buildAuditReport(project: ProjectSummary, engines: EngineReport[]): AuditReport;
