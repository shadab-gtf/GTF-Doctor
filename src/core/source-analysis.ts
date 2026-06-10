import { parse } from "@babel/parser";
import type { File, Node } from "@babel/types";
import { ProjectFile } from "../types/report.js";

export interface ImportRecord {
  source: string;
  line: number;
  importKind: "value" | "type";
}

export interface ParsedSource {
  file: ProjectFile;
  ast?: File;
  imports: ImportRecord[];
  parseError?: string;
}

export function analyzeSource(file: ProjectFile): ParsedSource {
  try {
    const ast = parse(file.content, {
      sourceType: "module",
      errorRecovery: true,
      plugins: [
        "jsx",
        "typescript",
        "decorators-legacy",
        "classProperties",
        "objectRestSpread",
        "dynamicImport",
        "importMeta",
      ],
    });

    return {
      file,
      ast,
      imports: ast.program.body.flatMap((node) => importFromNode(node)),
    };
  } catch (error) {
    return {
      file,
      imports: [],
      parseError: error instanceof Error ? error.message : "Unknown parser error",
    };
  }
}

function importFromNode(node: Node): ImportRecord[] {
  if (node.type !== "ImportDeclaration") {
    return [];
  }
  return [
    {
      source: node.source.value,
      line: node.loc?.start.line ?? 1,
      importKind: node.importKind === "type" ? "type" : "value",
    },
  ];
}
