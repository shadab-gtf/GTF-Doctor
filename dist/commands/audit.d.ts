export interface AuditOptions {
    report?: boolean;
    copy?: boolean;
    markdown?: boolean;
    html?: boolean;
    json?: boolean;
}
export declare function auditCommand(rootDir: string, options: AuditOptions): Promise<void>;
