import { AuditContext, EngineReport, ProjectFile } from "../../types/report.js";
export declare function runSkeletonEngine(context: AuditContext): Promise<EngineReport>;
export declare function getComponentFiles(files: ProjectFile[]): ProjectFile[];
