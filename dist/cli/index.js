#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { createSpinner } from "nanospinner";
import { auditCommand } from "../commands/audit.js";
import { doctorCommand } from "../commands/doctor.js";
import { initCommand } from "../commands/init.js";
import { singleEngineCommand } from "../commands/single-engine.js";
import { skeletonCheckCommand, skeletonGenerateCommand } from "../commands/skeleton.js";
import { brandBanner } from "../reporting/terminal.js";
const program = new Command();
const rootDir = process.cwd();
program
    .name("gtf")
    .description("GTF Inspector - local-first frontend quality platform")
    .version("1.0.0", "-v, --version", "show version");
program
    .command("init")
    .description("Initialize GTF Inspector in the current project")
    .action(async () => run(() => initCommand(rootDir)));
program
    .command("audit")
    .description("Run complete report-first project audit")
    .option("--report", "export Markdown, HTML, and JSON reports")
    .option("--copy", "copy complete terminal report to clipboard")
    .option("--markdown", "export reports/audit-report.md")
    .option("--html", "export reports/audit-report.html")
    .option("--json", "export reports/audit-report.json")
    .action(async (options) => run(() => auditCommand(rootDir, options)));
program.command("seo").description("Run SEO scanner").action(async () => run(() => singleEngineCommand(rootDir, "seo")));
program.command("metadata").description("Run metadata scanner").action(async () => run(() => singleEngineCommand(rootDir, "metadata")));
program.command("accessibility").description("Run accessibility scanner").action(async () => run(() => singleEngineCommand(rootDir, "accessibility")));
program.command("performance").description("Run performance scanner").action(async () => run(() => singleEngineCommand(rootDir, "performance")));
program.command("nextjs").description("Run Next.js health scanner").action(async () => run(() => singleEngineCommand(rootDir, "nextjs")));
program.command("gsap").description("Run GSAP scanner").action(async () => run(() => singleEngineCommand(rootDir, "gsap")));
const skeleton = program.command("skeleton").description("Check or generate skeleton components");
skeleton.command("check").description("Check skeleton coverage").action(async () => run(() => skeletonCheckCommand(rootDir)));
skeleton.command("generate").description("Generate missing skeleton components").action(async () => run(() => skeletonGenerateCommand(rootDir)));
program.command("report").description("Generate all report formats").action(async () => run(() => auditCommand(rootDir, { report: true })));
program.command("doctor").description("Audit current git changes and project health").action(async () => run(() => doctorCommand(rootDir)));
program.command("help").description("Show help").action(() => program.help());
async function run(action) {
    console.log(brandBanner());
    const spinner = createSpinner("Loading Engine...").start();
    await new Promise((resolve) => setTimeout(resolve, 120));
    spinner.success({ text: "Engine ready" });
    try {
        await action();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(chalk.red(`GTF Inspector failed: ${message}`));
        process.exitCode = 1;
    }
}
program.parseAsync(process.argv);
//# sourceMappingURL=index.js.map