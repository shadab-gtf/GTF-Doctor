import path from "node:path";
import { REPORT_DIR } from "../core/constants.js";
import { writeTextFile } from "../core/file-system.js";
import { renderHtmlReport } from "./html.js";
import { renderJsonReport } from "./json.js";
import { renderMarkdownReport } from "./markdown.js";
export async function writeMarkdownReport(rootDir, report) {
    const target = path.join(rootDir, REPORT_DIR, "audit-report.md");
    await writeTextFile(target, renderMarkdownReport(report));
    return target;
}
export async function writeHtmlReport(rootDir, report) {
    const target = path.join(rootDir, REPORT_DIR, "audit-report.html");
    await writeTextFile(target, renderHtmlReport(report));
    return target;
}
export async function writeJsonReport(rootDir, report) {
    const target = path.join(rootDir, REPORT_DIR, "audit-report.json");
    await writeTextFile(target, renderJsonReport(report));
    return target;
}
export async function writeAllReports(rootDir, report) {
    return Promise.all([writeMarkdownReport(rootDir, report), writeHtmlReport(rootDir, report), writeJsonReport(rootDir, report)]);
}
//# sourceMappingURL=writer.js.map