import { AuditReport } from "../types/report.js";

export function renderJsonReport(report: AuditReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
