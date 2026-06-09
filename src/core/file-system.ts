import { promises as fs } from "node:fs";
import path from "node:path";
import { PackageJson, ProjectFile } from "../types/report.js";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const DEFAULT_EXCLUDES = new Set(["node_modules", ".next", "dist", "build", "coverage", ".git"]);

export async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(target: string): Promise<void> {
  await fs.mkdir(target, { recursive: true });
}

export async function readPackageJson(rootDir: string): Promise<PackageJson | undefined> {
  const file = path.join(rootDir, "package.json");
  if (!(await pathExists(file))) {
    return undefined;
  }
  const content = await fs.readFile(file, "utf8");
  return JSON.parse(content) as PackageJson;
}

export async function collectProjectFiles(rootDir: string): Promise<ProjectFile[]> {
  const files: ProjectFile[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!DEFAULT_EXCLUDES.has(entry.name)) {
          await walk(path.join(current, entry.name));
        }
        continue;
      }

      const filePath = path.join(current, entry.name);
      const extension = path.extname(entry.name);
      if (!SOURCE_EXTENSIONS.has(extension)) {
        continue;
      }

      const content = await fs.readFile(filePath, "utf8");
      files.push({
        path: filePath,
        relativePath: path.relative(rootDir, filePath).replaceAll("\\", "/"),
        extension,
        content,
      });
    }
  }

  await walk(rootDir);
  return files;
}

export async function writeTextFile(target: string, content: string): Promise<void> {
  await ensureDir(path.dirname(target));
  await fs.writeFile(target, content, "utf8");
}
