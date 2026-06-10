import chalk from "chalk";
import ora from "ora";
import { loadGtfConfig } from "../core/config.js";
import { createAuditContext } from "../core/context.js";
import { evaluatePolicy, routeReadiness } from "../core/policy.js";
import { summarizeProject } from "../core/project-summary.js";
import { buildAuditReport } from "../core/scoring.js";
import { runEnabledEngines } from "../engines/index.js";

export async function launchCommand(rootDir: string): Promise<void> {
  const spinner = ora("Checking launch readiness...").start();
  const config = await loadGtfConfig(rootDir);
  const context = await createAuditContext(rootDir);
  const engines = await runEnabledEngines(context, config);
  const report = buildAuditReport(summarizeProject(context), engines);
  const policy = evaluatePolicy(report, config);
  const blockers = routeReadiness(report);
  const ready = policy.passed && blockers.length === 0;
  spinner.succeed("Launch readiness complete");

  console.log("");
  console.log(chalk.bold("LAUNCH READINESS"));
  console.log("");
  console.log(`Score: ${scoreColor(report.overallScore)(`${report.overallScore} / 100`)}`);
  console.log(`Ready for production: ${ready ? chalk.green("Yes") : chalk.red("No")}`);
  console.log("");

  if (blockers.length > 0) {
    console.log(chalk.red("Blocking issues:"));
    for (const blocker of blockers.slice(0, 12)) {
      console.log(chalk.red(`- ${blocker}`));
    }
    console.log("");
  }

  if (!policy.passed) {
    console.log(chalk.red("Policy failures:"));
    for (const reason of policy.reasons) {
      console.log(chalk.red(`- ${reason}`));
    }
    console.log("");
  }

  console.log("Required:");
  console.log(`- Minimum score: ${config.policy.minimumScore}`);
  console.log(`- Fail on critical: ${config.policy.failOnCritical ? "yes" : "no"}`);
  console.log(`- Max high-severity issues: ${config.policy.failOnHighCount}`);

  if (!ready) {
    process.exitCode = 1;
  }
}

function scoreColor(score: number): (value: string) => string {
  if (score >= 90) return chalk.green.bold;
  if (score >= 75) return chalk.yellow.bold;
  return chalk.red.bold;
}
