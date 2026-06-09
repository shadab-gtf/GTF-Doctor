import { AuditContext, EngineReport } from "../types/report.js";
export declare function runAllEngines(context: AuditContext): Promise<EngineReport[]>;
