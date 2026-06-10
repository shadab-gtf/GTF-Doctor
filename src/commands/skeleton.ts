import path from "node:path";
import chalk from "chalk";
import { createAuditContext } from "../core/context.js";
import { findComponent, analyzeSkeletonTarget, SkeletonAnalysis } from "../engines/skeleton/analyzer.js";
import { getComponentFiles, runSkeletonEngine } from "../engines/skeleton/skeleton-engine.js";
import { generateSkeletonFromAnalysis, generateSkeletons } from "../engines/skeleton/generator.js";

export interface SkeletonGenerateOptions {
  all?: boolean;
}

export async function skeletonCheckCommand(rootDir: string): Promise<void> {
  const context = await createAuditContext(rootDir);
  const report = await runSkeletonEngine(context);
  console.log(`Skeleton Coverage: ${report.score} / 100`);
  for (const finding of report.findings) {
    console.log(`- ${finding.title} - ${finding.location?.file ?? "Project level"}`);
  }
}

export async function skeletonGenerateCommand(rootDir: string, targetName: string | undefined, options: SkeletonGenerateOptions): Promise<void> {
  const started = Date.now();
  const progress = createProgressBar();

  progress.start(100, 0, phase("Scanning Project", 0, started));
  const context = await createAuditContext(rootDir);
  progress.update(25, phase("Discovering Components", context.files.length, started));

  const componentFiles = getComponentFiles(context.files);
  progress.update(45, phase("Building Component Graph", componentFiles.length, started));

  if (options.all) {
    progress.update(70, phase("Analyzing Responsive Layouts", componentFiles.length, started));
    const result = await generateSkeletons(rootDir, componentFiles.map((file) => file.path));
    progress.update(100, phase("Generation Complete", componentFiles.length, started));
    progress.stop();
    printBulkResult(result.generated, result.skipped, result.timeSavedMinutes);
    return;
  }

  if (!targetName) {
    progress.stop();
    console.log(chalk.red("Provide a component name, for example: gtf skeleton generate Card"));
    console.log(chalk.gray("Use --all only when you explicitly want to generate skeletons for every eligible component."));
    process.exitCode = 1;
    return;
  }

  const component = findComponent(componentFiles, targetName);
  if (!component) {
    progress.stop();
    console.log(chalk.red(`Component not found: ${targetName}`));
    console.log(chalk.gray(`Discovered components: ${componentFiles.slice(0, 20).map((file) => path.basename(file.relativePath).replace(/\.(tsx|jsx)$/, "")).join(", ")}`));
    process.exitCode = 1;
    return;
  }

  progress.update(70, phase("Analyzing Responsive Layouts", componentFiles.length, started));
  const analysis = analyzeSkeletonTarget(rootDir, component, targetName);
  progress.update(92, phase("Generating Skeleton", componentFiles.length, started));
  printAnalysis(analysis);
  const result = await generateSkeletonFromAnalysis(rootDir, analysis);
  progress.update(100, phase("Analysis Complete", componentFiles.length, started));
  progress.stop();
  printBulkResult(result.generated, result.skipped, result.timeSavedMinutes);
}

interface ProgressBar {
  start(total: number, value: number, payload: ProgressPayload): void;
  update(value: number, payload: ProgressPayload): void;
  stop(): void;
}

interface ProgressPayload {
  phase: string;
  files: number;
  elapsed: string;
}

function createProgressBar(): ProgressBar {
  let totalValue = 100;
  return {
    start(total, value, payload) {
      totalValue = total;
      renderProgress(value, totalValue, payload);
    },
    update(value, payload) {
      renderProgress(value, totalValue, payload);
    },
    stop() {
      process.stdout.write("\n");
    },
  };
}

function renderProgress(value: number, total: number, payload: ProgressPayload): void {
  const percentage = Math.round((value / total) * 100);
  const width = 18;
  const complete = Math.round((percentage / 100) * width);
  const bar = `${"█".repeat(complete)}${"░".repeat(width - complete)}`;
  const eta = percentage > 0 ? Math.max(0, Number(payload.elapsed) * (100 / percentage - 1)).toFixed(1) : "--";
  process.stdout.write(`\r${chalk.cyan(payload.phase)} |${bar}| ${percentage}% | files: ${payload.files} | elapsed: ${payload.elapsed}s | eta: ${eta}s`);
}

function phase(name: string, files: number, started: number): ProgressPayload {
  return {
    phase: name.padEnd(28),
    files,
    elapsed: ((Date.now() - started) / 1000).toFixed(1),
  };
}

function printAnalysis(analysis: SkeletonAnalysis): void {
  console.log("");
  console.log(chalk.bold(`Component: ${analysis.componentName}`));
  console.log("");
  console.log("Location:");
  console.log(analysis.sourceFile.relativePath);
  console.log("");
  console.log("Analysis:");
  console.log("");
  printViewport("Desktop", analysis.desktop);
  printViewport("Tablet", analysis.tablet);
  printViewport("Mobile", analysis.mobile);
  console.log("");
  console.log("Detected:");
  for (const item of analysis.detected) {
    console.log(`- ${item}`);
  }
  console.log("");
  console.log(`Skeleton Accuracy: ${analysis.accuracy}%`);
  console.log("");
}

function printViewport(label: string, layout: SkeletonAnalysis["desktop"]): void {
  console.log(`${label}:`);
  console.log(`- Width: ${layout.width}`);
  console.log(`- Height: ${layout.height}`);
  console.log(`- Layout: ${layout.layout}`);
  console.log(`- Spacing: ${layout.spacing}`);
  console.log(`- Alignment: ${layout.alignment}`);
  console.log("");
}

function printBulkResult(generated: string[], skipped: string[], timeSavedMinutes: number): void {
  for (const file of generated) {
    console.log(chalk.green(`Generated ${file}`));
  }
  for (const file of skipped) {
    console.log(chalk.gray(`Skipped ${file}`));
  }
  console.log(chalk.cyan(`Time Saved: ${timeSavedMinutes} Minutes`));
}
