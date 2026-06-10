import { Project } from "ts-morph";
import path from "node:path";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { scoreFromFindings } from "../../core/scoring.js";

const ENTRY_PATTERNS = [
  /pages\/.*[a-zA-Z0-9_-]+\.(tsx|jsx|ts|js)$/,
  /app\/.*(page|layout|route|loading|error|not-found|global-error)\.(tsx|jsx|ts|js)$/,
  /(index|main|cli|entry)\.(tsx|jsx|ts|js)$/,
];

export async function runDeadCodeEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const files = context.files.filter((file) => /\.(ts|tsx|js|jsx)$/.test(file.relativePath));

  if (files.length === 0) {
    return {
      name: "Dead Code Analysis",
      score: 100,
      findings: [],
      recommendations: [],
    };
  }

  try {
    // Initialize ts-morph project
    const project = new Project({
      useInMemoryFileSystem: true,
    });

    // Populate the memory file system with the project files
    for (const file of files) {
      project.createSourceFile(file.relativePath, file.content);
    }

    const sourceFiles = project.getSourceFiles();

    // Map to keep track of what files import what
    const importMap = new Map<string, Set<string>>(); // importer -> importees
    const reverseImportMap = new Map<string, Set<string>>(); // importee -> importers

    for (const sourceFile of sourceFiles) {
      const relPath = sourceFile.getFilePath();
      importMap.set(relPath, new Set());
      if (!reverseImportMap.has(relPath)) {
        reverseImportMap.set(relPath, new Set());
      }

      for (const importDecl of sourceFile.getImportDeclarations()) {
        const moduleSpecifier = importDecl.getModuleSpecifierValue();
        if (moduleSpecifier.startsWith(".")) {
          // Resolve relative path
          const resolvedPath = resolveRelativeImport(relPath, moduleSpecifier, files);
          if (resolvedPath) {
            importMap.get(relPath)!.add(resolvedPath);
            if (!reverseImportMap.has(resolvedPath)) {
              reverseImportMap.set(resolvedPath, new Set());
            }
            reverseImportMap.get(resolvedPath)!.add(relPath);
          }
        }
      }
    }

    // 1. Find Unused Files
    for (const sourceFile of sourceFiles) {
      const relPath = sourceFile.getFilePath();
      const isEntry = ENTRY_PATTERNS.some((pattern) => pattern.test(relPath));
      if (isEntry) continue;

      const importers = reverseImportMap.get(relPath);
      if (!importers || importers.size === 0) {
        findings.push({
          id: `dead-code-unused-file-${relPath}`,
          title: "Unused File Detected",
          issue: `File '${relPath}' is not imported by any other file and is not marked as an entry point.`,
          impact: "Unused files increase project footprint, build times, and code rot without contributing features.",
          recommendation: "Delete the file if it is no longer needed, or import it if it was left unlinked.",
          severity: "Medium",
          location: { file: relPath, line: 1 },
        });
      }
    }

    // 2. Find Unused Exports
    for (const sourceFile of sourceFiles) {
      const relPath = sourceFile.getFilePath();
      const exportedDeclarations = sourceFile.getExportedDeclarations();

      for (const [name, decls] of exportedDeclarations.entries()) {
        if (name === "default") continue; // skip default exports for simplicity
        
        let hasReference = false;

        for (const decl of decls) {
          // Check if this declaration is referenced anywhere else in the project
          if (typeof (decl as any).findReferences === "function") {
            const references = (decl as any).findReferences();
            for (const ref of references) {
              for (const reference of ref.getReferences()) {
                const referencingFile = reference.getSourceFile().getFilePath();
                if (referencingFile !== relPath) {
                  hasReference = true;
                  break;
                }
              }
              if (hasReference) break;
            }
          }
          if (hasReference) break;
        }

        if (!hasReference && name !== "config") {
          // Get line number
          const firstDecl = decls[0];
          const line = firstDecl ? firstDecl.getStartLineNumber() : 1;
          findings.push({
            id: `dead-code-unused-export-${relPath}-${name}`,
            title: `Unused Export: '${name}'`,
            issue: `The export '${name}' in file '${relPath}' is never imported or referenced outside this file.`,
            impact: "Unused exports increase public module surface area and lead to dead code path accumulation.",
            recommendation: `Remove the 'export' keyword from '${name}' or delete it if it is no longer used.`,
            severity: "Medium",
            location: { file: relPath, line },
          });
        }
      }
    }

    // 3. Find Circular Dependencies (using DFS cycle detection)
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];

    function dfs(node: string, pathStack: string[]) {
      visited.add(node);
      recStack.add(node);
      pathStack.push(node);

      const neighbors = importMap.get(node);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            dfs(neighbor, pathStack);
          } else if (recStack.has(neighbor)) {
            const cycleIndex = pathStack.indexOf(neighbor);
            if (cycleIndex !== -1) {
              cycles.push(pathStack.slice(cycleIndex));
            }
          }
        }
      }

      recStack.delete(node);
      pathStack.pop();
    }

    for (const sourceFile of sourceFiles) {
      const relPath = sourceFile.getFilePath();
      if (!visited.has(relPath)) {
        dfs(relPath, []);
      }
    }

    for (const cycle of cycles) {
      const firstFile = cycle[0];
      if (firstFile) {
        const displayCycle = [...cycle, firstFile];
        findings.push({
          id: `dead-code-circular-dependency-${cycle.join("-")}`,
          title: "Circular Dependency Detected",
          issue: `Circular import cycle: ${displayCycle.join(" -> ")}`,
          impact: "Modules in the cycle can evaluate with partially initialized exports, causing bugs and runtime failures.",
          recommendation: "Break the cycle by extracting shared dependencies into a separate module.",
          severity: "High",
          location: { file: firstFile, line: 1 },
        });
      }
    }

  } catch (error) {
    // If AST parsing fails, return a warning finding without crashing the scan
    findings.push({
      id: "dead-code-scan-failed",
      title: "Dead Code Engine Error",
      issue: `The dead code analyzer encountered an error during parsing: ${error instanceof Error ? error.message : String(error)}`,
      impact: "Unused imports and circular dependencies were not fully audited.",
      recommendation: "Ensure TS files compile correctly and review project tsconfig setup.",
      severity: "Low",
      location: { file: "package.json", line: 1 },
    });
  }

  return {
    name: "Dead Code Analysis",
    score: scoreFromFindings(findings),
    findings,
    recommendations: findings.map((f) => f.recommendation),
  };
}

function resolveRelativeImport(importerRelPath: string, moduleSpecifier: string, files: any[]): string | null {
  const importerDir = path.dirname(importerRelPath);
  const candidateBase = path.normalize(path.join(importerDir, moduleSpecifier)).replace(/\\/g, "/");

  const extensions = [".tsx", ".ts", ".jsx", ".js"];
  for (const ext of extensions) {
    const candidate = candidateBase + ext;
    if (files.some((f) => f.relativePath === candidate)) {
      return candidate;
    }
  }

  // Try index resolver
  for (const ext of extensions) {
    const candidate = path.normalize(path.join(candidateBase, "index" + ext)).replace(/\\/g, "/");
    if (files.some((f) => f.relativePath === candidate)) {
      return candidate;
    }
  }

  return null;
}
