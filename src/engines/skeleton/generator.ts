import path from "node:path";
import { Project } from "ts-morph";
import { pathExists, writeTextFile } from "../../core/file-system.js";
import { analyzeSkeletonTarget, SkeletonAnalysis } from "./analyzer.js";

export interface SkeletonGenerationResult {
  generated: string[];
  skipped: string[];
  analyses: SkeletonAnalysis[];
  timeSavedMinutes: number;
}

export async function generateSkeletons(rootDir: string, componentPaths: string[]): Promise<SkeletonGenerationResult> {
  const generated: string[] = [];
  const skipped: string[] = [];
  const analyses: SkeletonAnalysis[] = [];
  const project = new Project({ tsConfigFilePath: path.join(rootDir, "tsconfig.json"), skipAddingFilesFromTsConfig: true });

  for (const componentPath of componentPaths) {
    const absolutePath = path.isAbsolute(componentPath) ? componentPath : path.join(rootDir, componentPath);
    const parsed = path.parse(absolutePath);
    if (parsed.name.endsWith("Skeleton")) {
      skipped.push(componentPath);
      continue;
    }
    const target = path.join(parsed.dir, `${parsed.name}Skeleton${parsed.ext}`);
    if (await pathExists(target)) {
      skipped.push(path.relative(rootDir, target).replaceAll("\\", "/"));
      continue;
    }

    const source = project.addSourceFileAtPath(absolutePath);
    const analysis = analyzeSkeletonTarget(rootDir, {
      path: absolutePath,
      relativePath: path.relative(rootDir, absolutePath).replaceAll("\\", "/"),
      extension: parsed.ext,
      content: source.getFullText(),
    });
    await writeTextFile(target, renderSkeleton(analysis));
    analyses.push(analysis);
    generated.push(path.relative(rootDir, target).replaceAll("\\", "/"));
  }

  return {
    generated,
    skipped,
    analyses,
    timeSavedMinutes: generated.length * 16,
  };
}

export async function generateSkeletonFromAnalysis(rootDir: string, analysis: SkeletonAnalysis): Promise<SkeletonGenerationResult> {
  if (await pathExists(analysis.targetPath)) {
    return {
      generated: [],
      skipped: [path.relative(rootDir, analysis.targetPath).replaceAll("\\", "/")],
      analyses: [analysis],
      timeSavedMinutes: 0,
    };
  }

  await writeTextFile(analysis.targetPath, renderSkeleton(analysis));
  return {
    generated: [path.relative(rootDir, analysis.targetPath).replaceAll("\\", "/")],
    skipped: [],
    analyses: [analysis],
    timeSavedMinutes: 16,
  };
}

function renderSkeleton(analysis: SkeletonAnalysis): string {
  const blocks = analysis.blueprint.blocks.flatMap((block) =>
    Array.from({ length: block.repeat ?? 1 }, () => `      <div className="${block.className}" />`),
  );

  return `export function ${analysis.exportName}() {
  return (
    <div className="${analysis.blueprint.containerClass}" aria-hidden="true" role="status">
${blocks.join("\n")}
      <span className="sr-only">Loading ${analysis.componentName}</span>
    </div>
  );
}
`;
}
