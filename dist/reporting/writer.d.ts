import { AuditReport } from "../types/report.js";
export declare function writeMarkdownReport(rootDir: string, report: AuditReport): Promise<string>;
export declare function writeHtmlReport(rootDir: string, report: AuditReport): Promise<string>;
export declare function writeJsonReport(rootDir: string, report: AuditReport): Promise<string>;
export declare function writeAllReports(rootDir: string, report: AuditReport): Promise<string[]>;
