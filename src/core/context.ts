import path from "node:path";
import { AuditContext } from "../types/report.js";
import { collectProjectFiles, readPackageJson } from "./file-system.js";
import { getChangedSourceFiles } from "./git.js";

export interface AuditContextOptions {
  changedOnly?: boolean;
}

export async function createAuditContext(rootDir: string, options: AuditContextOptions = {}): Promise<AuditContext> {
  const packageJson = await readPackageJson(rootDir);
  const files = await collectProjectFiles(rootDir);
  const changedFiles = options.changedOnly ? await getChangedSourceFiles(rootDir) : undefined;
  const selectedFiles = changedFiles ? files.filter((file) => changedFiles.includes(file.relativePath)) : files;
  const reviewedChangedFiles = changedFiles ? selectedFiles.map((file) => file.relativePath) : undefined;

  return {
    rootDir,
    projectName: packageJson?.name ?? path.basename(rootDir),
    files: selectedFiles,
    packageJson,
    ...(reviewedChangedFiles ? { changedFiles: reviewedChangedFiles } : {}),
  };
}
