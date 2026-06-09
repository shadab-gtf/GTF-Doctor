import { AuditContext, EngineReport } from "../types/report.js";

export interface AuditEngine {
  name: EngineReport["name"];
  run(context: AuditContext): Promise<EngineReport>;
}
