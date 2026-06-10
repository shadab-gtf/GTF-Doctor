import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { spawn } from "node:child_process";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { scoreFromFindings } from "../../core/scoring.js";

const esmRequire = createRequire(import.meta.url);

function resolveOxlintBinary(): string | null {
  try {
    const mainPath = esmRequire.resolve("oxlint");
    const pkgDir = path.dirname(mainPath);
    const oxlintDir = path.resolve(pkgDir, "..");
    const binPath = path.join(oxlintDir, "bin", process.platform === "win32" ? "oxlint.exe" : "oxlint");
    if (fs.existsSync(binPath)) {
      return binPath;
    }
    const nodemodulesBin = path.resolve(oxlintDir, "..", ".bin", process.platform === "win32" ? "oxlint.cmd" : "oxlint");
    if (fs.existsSync(nodemodulesBin)) {
      return nodemodulesBin;
    }
  } catch {}
  return null;
}

function resolvePluginPath(): string | null {
  try {
    return esmRequire.resolve("oxlint-plugin-react-doctor");
  } catch {}
  return null;
}

export async function runLinterEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const binPath = resolveOxlintBinary();
  const pluginPath = resolvePluginPath();

  if (!binPath || !pluginPath) {
    return {
      name: "React Code Quality Linter",
      score: 100,
      findings: [],
      recommendations: ["Ensure oxlint and oxlint-plugin-react-doctor are installed in the workspace."],
    };
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gtf-scale-oxlintrc-"));
  const configPath = path.join(tempDir, "oxlintrc.json");

  try {
    // Dynamically load the plugin to extract rule list
    let reactDoctorPlugin: any;
    try {
      // @ts-ignore
      reactDoctorPlugin = (await import("oxlint-plugin-react-doctor")).default;
    } catch {}

    const rules: Record<string, string> = {};
    if (reactDoctorPlugin && reactDoctorPlugin.rules) {
      for (const ruleName of Object.keys(reactDoctorPlugin.rules)) {
        rules[`react-doctor/${ruleName}`] = "error";
      }
    } else {
      // Fallback default rules if plugin failed to load dynamically
      rules["react-doctor/no-array-index-as-key"] = "error";
      rules["react-doctor/no-nested-state-updates"] = "error";
      rules["react-doctor/no-stale-effects"] = "error";
    }

    const configContent = {
      categories: {
        correctness: "off",
        suspicious: "off",
        pedantic: "off",
        perf: "off",
        restriction: "off",
        style: "off",
        nursery: "off",
      },
      plugins: [],
      jsPlugins: [pluginPath],
      rules,
      settings: {
        "react-doctor": {
          rootDirectory: context.rootDir,
        },
      },
    };

    fs.writeFileSync(configPath, JSON.stringify(configContent));

    const sourceFiles = context.files
      .filter((file) => /\.(tsx|jsx|ts|js)$/.test(file.relativePath))
      .map((file) => path.join(context.rootDir, file.relativePath));

    if (sourceFiles.length === 0) {
      return {
        name: "React Code Quality Linter",
        score: 100,
        findings: [],
        recommendations: [],
      };
    }

    // Spawn oxlint process
    const args = ["-c", configPath, "--format", "json", ...sourceFiles];
    const stdout = await runSubprocess(binPath, args);

    if (stdout.trim().length > 0) {
      const jsonStart = stdout.indexOf("{");
      const sanitized = jsonStart >= 0 ? stdout.slice(jsonStart) : stdout;
      try {
        const parsed = JSON.parse(sanitized);
        if (parsed && Array.isArray(parsed.diagnostics)) {
          for (const diag of parsed.diagnostics) {
            if (diag.code) {
              const ruleCodeMatch = diag.code.match(/^(.+)\((.+)\)$/);
              const ruleName = ruleCodeMatch ? ruleCodeMatch[2] : diag.code;
              const title = (reactDoctorPlugin?.rules?.[ruleName]?.title) ?? `React linter: ${ruleName}`;
              const relPath = path.relative(context.rootDir, diag.filename).replace(/\\/g, "/");

              findings.push({
                id: `linter-${ruleName}-${relPath}-${diag.labels?.[0]?.span?.line ?? 1}`,
                title,
                issue: diag.message,
                impact: "Lint failures slow down development velocity, degrade code clarity, and lead to runtime exceptions.",
                recommendation: diag.help || "Refactor the flagged statement to align with quality standards.",
                severity: diag.severity === "error" ? "High" : "Medium",
                location: { file: relPath, line: diag.labels?.[0]?.span?.line ?? 1 },
              });
            }
          }
        }
      } catch {}
    }
  } catch (error: any) {
    // Capture environment execution failures cleanly (e.g., sandbox restrictions)
    findings.push({
      id: "linter-execution-blocked",
      title: "Linter Execution Warning",
      issue: `GTF Scale was unable to execute the native oxlint binary: ${error.message || String(error)}`,
      impact: "React-specific AST lint rules (state hooks, rendering performance, compiler readiness) could not be fully run.",
      recommendation: "Ensure Node execution permissions are configured and verify the oxlint package setup.",
      severity: "Low",
      location: { file: "package.json", line: 1 },
    });
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }

  return {
    name: "React Code Quality Linter",
    score: scoreFromFindings(findings),
    findings,
    recommendations: findings.map((f) => f.recommendation),
  };
}

function runSubprocess(binPath: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(binPath, args, { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let stdoutData = "";
    let stderrData = "";

    child.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderrData += chunk.toString();
    });

    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Oxlint linter execution timed out after 30 seconds."));
    }, 30000);

    child.on("close", (code) => {
      clearTimeout(timeout);
      // Oxlint exits with code 1 if diagnostics are found, which is expected.
      // We only reject if code is not 0/1, or if stderr has a major system crash error.
      if (code !== 0 && code !== 1) {
        reject(new Error(`Oxlint exited with code ${code}: ${stderrData}`));
      } else {
        resolve(stdoutData);
      }
    });

    child.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}
