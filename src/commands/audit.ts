import clipboard from "clipboardy";
import chalk from "chalk";
import ora from "ora";
import { createAuditContext } from "../core/context.js";
import { buildAuditReport } from "../core/scoring.js";
import { summarizeProject } from "../core/project-summary.js";
import { runAllEngines } from "../engines/index.js";
import { renderTerminalReport } from "../reporting/terminal.js";
import { writeAllReports, writeHtmlReport, writeJsonReport, writeMarkdownReport } from "../reporting/writer.js";

export interface AuditOptions {
  report?: boolean;
  copy?: boolean;
  markdown?: boolean;
  html?: boolean;
  json?: boolean;
}

export async function auditCommand(rootDir: string, options: AuditOptions): Promise<void> {
  const spinner = ora("Loading GTF Inspector engine...").start();
  const context = await createAuditContext(rootDir);
  spinner.text = "Scanning React, Next.js, accessibility, performance, GSAP, and skeleton coverage...";
  const engines = await runAllEngines(context);
  const report = buildAuditReport(summarizeProject(context), engines);
  spinner.succeed("Audit complete");

  const terminalReport = renderTerminalReport(report);

  if (!options.markdown && !options.html && !options.json) {
    console.log(terminalReport);
  }

  const written: string[] = [];
  if (options.report) written.push(...(await writeAllReports(rootDir, report)));
  if (options.markdown) written.push(await writeMarkdownReport(rootDir, report));
  if (options.html) written.push(await writeHtmlReport(rootDir, report));
  if (options.json) written.push(await writeJsonReport(rootDir, report));
  if (options.copy) {
    await clipboard.write(terminalReport);
    console.log(chalk.green("✓ Report copied successfully"));
  }
  for (const file of written) {
    console.log(chalk.green(`✓ Report saved: ${file}`));
  }
}
