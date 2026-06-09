import path from "node:path";
import chalk from "chalk";
import { DEFAULT_CONFIG } from "../core/constants.js";
import { ensureDir, pathExists, writeTextFile } from "../core/file-system.js";
import { createAuditContext } from "../core/context.js";

export async function initCommand(rootDir: string): Promise<void> {
  await ensureDir(path.join(rootDir, ".gtf"));
  const configPath = path.join(rootDir, "gtf.config.ts");
  if (!(await pathExists(configPath))) {
    await writeTextFile(configPath, DEFAULT_CONFIG);
  }
  const context = await createAuditContext(rootDir);
  const hasGit = await pathExists(path.join(rootDir, ".git"));
  console.log(chalk.green("✓ Project initialized"));
  console.log(chalk.green("✓ Config created"));
  console.log(hasGit ? chalk.green("✓ Git detected") : chalk.yellow("• Git not detected"));
  console.log(chalk.green(`✓ Framework detected: ${context.packageJson?.dependencies?.next ? "Next.js" : "React/JavaScript"}`));
}
