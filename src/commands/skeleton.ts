import chalk from "chalk";
import { createAuditContext } from "../core/context.js";
import { getComponentFiles, runSkeletonEngine } from "../engines/skeleton/skeleton-engine.js";
import { generateSkeletons } from "../engines/skeleton/generator.js";

export async function skeletonCheckCommand(rootDir: string): Promise<void> {
  const context = await createAuditContext(rootDir);
  const report = await runSkeletonEngine(context);
  console.log(`Skeleton Coverage: ${report.score} / 100`);
  for (const finding of report.findings) {
    console.log(`• ${finding.title} - ${finding.location?.file ?? "Project level"}`);
  }
}

export async function skeletonGenerateCommand(rootDir: string): Promise<void> {
  const context = await createAuditContext(rootDir);
  const components = getComponentFiles(context.files).map((file) => file.path);
  const result = await generateSkeletons(rootDir, components);
  for (const file of result.generated) {
    console.log(chalk.green(`✓ Generated ${file}`));
  }
  for (const file of result.skipped) {
    console.log(chalk.gray(`• Skipped ${file}`));
  }
  console.log(chalk.cyan(`Time Saved: ${result.timeSavedMinutes} Minutes`));
}
