import { AuditContext } from "../types/report.js";
export interface AuditContextOptions {
    changedOnly?: boolean;
}
export declare function createAuditContext(rootDir: string, options?: AuditContextOptions): Promise<AuditContext>;
