import { AuditContext, EngineReport } from "../types/report.js";
import { ResolvedGtfConfig } from "../types/config.js";
export declare function runAllEngines(context: AuditContext): Promise<EngineReport[]>;
export declare function runEnabledEngines(context: AuditContext, config: ResolvedGtfConfig): Promise<EngineReport[]>;
