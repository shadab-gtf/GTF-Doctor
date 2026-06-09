import path from "node:path";
import { AuditContext } from "../types/report.js";
import { collectProjectFiles, readPackageJson } from "./file-system.js";

export async function createAuditContext(rootDir: string): Promise<AuditContext> {
  const packageJson = await readPackageJson(rootDir);
  return {
    rootDir,
    projectName: packageJson?.name ?? path.basename(rootDir),
    files: await collectProjectFiles(rootDir),
    packageJson,
  };
}
