import { AuditContext, EngineReport, Finding } from "../types/report.js";

export function attachCodeFrames(context: AuditContext, engines: EngineReport[]): EngineReport[] {
  const files = new Map(context.files.map((file) => [file.relativePath, file.content]));

  return engines.map((engine) => ({
    ...engine,
    findings: engine.findings.map((finding) => {
      if (!finding.location) {
        return finding;
      }
      const source = files.get(finding.location.file);
      if (!source) {
        return finding;
      }
      return {
        ...finding,
        codeFrame: buildCodeFrame(source, finding.location.line),
      };
    }),
  }));
}

function buildCodeFrame(source: string, targetLine: number): string {
  const lines = source.split(/\r?\n/);
  const start = Math.max(1, targetLine - 2);
  const end = Math.min(lines.length, targetLine + 2);
  const width = String(end).length;
  const frame: string[] = [];

  for (let lineNumber = start; lineNumber <= end; lineNumber += 1) {
    const marker = lineNumber === targetLine ? ">" : " ";
    const content = lines[lineNumber - 1] ?? "";
    frame.push(`${marker} ${String(lineNumber).padStart(width, " ")} | ${content}`);
  }

  return frame.join("\n");
}
