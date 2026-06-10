import chalk from "chalk";
import ora from "ora";
import { attachCodeFrames } from "../core/code-frame.js";
import { loadGtfConfig } from "../core/config.js";
import { createAuditContext } from "../core/context.js";
import { evaluatePolicy } from "../core/policy.js";
import { summarizeProject } from "../core/project-summary.js";
import { buildAuditReport } from "../core/scoring.js";
import { runEnabledEngines } from "../engines/index.js";
import { renderTerminalReport } from "../reporting/terminal.js";
import { writeJsonReport, writeMarkdownReport } from "../reporting/writer.js";

export interface ReviewOptions {
  changed?: boolean;
  markdown?: boolean;
  json?: boolean;
  policy?: boolean;
}

export async function reviewCommand(rootDir: string, options: ReviewOptions): Promise<void> {
  const spinner = ora(options.changed ? "Reviewing changed files..." : "Reviewing project...").start();
  const config = await loadGtfConfig(rootDir);
  const context = await createAuditContext(rootDir, options.changed ? { changedOnly: true } : {});

  if (options.changed && context.changedFiles?.length === 0) {
    spinner.succeed("No changed source files detected");
    return;
  }

  spinner.text = `Analyzing ${context.files.length} files locally with source-code engines...`;
  const engines = attachCodeFrames(context, await runEnabledEngines(context, config));
  spinner.text = "Building senior review report...";
  const report = buildAuditReport(summarizeProject(context), engines);
  spinner.succeed("Review complete");

  console.log(renderTerminalReport(report));

  if (options.changed && context.changedFiles && context.changedFiles.length > 0) {
    console.log(chalk.cyan(`Changed files reviewed: ${context.changedFiles.join(", ")}`));
  }

  if (options.policy) {
    const policy = evaluatePolicy(report, config);
    if (policy.passed) {
      console.log(chalk.green("Policy: PASS"));
    } else {
      console.log(chalk.red("Policy: FAIL"));
      for (const reason of policy.reasons) {
        console.log(chalk.red(`- ${reason}`));
      }
      process.exitCode = 1;
    }
  }

  if (options.markdown) {
    console.log(chalk.green(`Report saved: ${await writeMarkdownReport(rootDir, report)}`));
  }
  if (options.json) {
    console.log(chalk.green(`Report saved: ${await writeJsonReport(rootDir, report)}`));
  }
}
