import path from "node:path";
import { Project } from "ts-morph";
import { pathExists, writeTextFile } from "../../core/file-system.js";
export async function generateSkeletons(rootDir, componentPaths) {
    const generated = [];
    const skipped = [];
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
        const exportName = `${parsed.name}Skeleton`;
        const classNames = inferSkeletonClassNames(source.getFullText());
        const content = `export function ${exportName}() {
  return (
    <div className="${classNames.container}" aria-hidden="true">
      <div className="${classNames.media}" />
      <div className="${classNames.content}">
        <div className="${classNames.heading}" />
        <div className="${classNames.line}" />
        <div className="${classNames.shortLine}" />
      </div>
    </div>
  );
}
`;
        await writeTextFile(target, content);
        generated.push(path.relative(rootDir, target).replaceAll("\\", "/"));
    }
    return {
        generated,
        skipped,
        timeSavedMinutes: generated.length * 16,
    };
}
function inferSkeletonClassNames(source) {
    const hasCard = /card|rounded|shadow|border/i.test(source);
    const hasImage = /<Image|<img|Avatar/i.test(source);
    const container = hasCard
        ? "animate-pulse rounded-lg border border-slate-200 bg-white p-4"
        : "animate-pulse space-y-4";
    return {
        container,
        media: hasImage ? "h-48 w-full rounded-md bg-slate-200" : "hidden",
        content: "space-y-3",
        heading: "h-6 w-2/3 rounded bg-slate-200",
        line: "h-4 w-full rounded bg-slate-200",
        shortLine: "h-4 w-1/2 rounded bg-slate-200",
    };
}
//# sourceMappingURL=generator.js.map