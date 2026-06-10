import path from "node:path";
import { simpleGit } from "simple-git";
import { pathExists } from "./file-system.js";

const REVIEWABLE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

export async function getChangedSourceFiles(rootDir: string): Promise<string[]> {
  if (!(await pathExists(path.join(rootDir, ".git")))) {
    return [];
  }

  const git = simpleGit(rootDir);
  const status = await git.status();
  const changed = new Set<string>();

  const renamed = status.renamed.map((item: { to: string }) => item.to);
  for (const file of [...status.modified, ...status.created, ...renamed, ...status.not_added]) {
    if (REVIEWABLE_EXTENSIONS.has(path.extname(file))) {
      changed.add(file.replaceAll("\\", "/"));
    }
  }

  return [...changed].sort();
}
