import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { scoreFromFindings } from "../../core/scoring.js";
import { pathExists } from "../../core/file-system.js";
import path from "node:path";
import { promises as fs } from "node:fs";

export async function runReactNativeEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const packageJson = context.packageJson;
  if (!packageJson) {
    return {
      name: "React Native Hardening",
      score: 100,
      findings: [],
      recommendations: [],
    };
  }

  const allDeps = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  };

  const isExpo = "expo" in allDeps;
  const isRN = "react-native" in allDeps || isExpo;

  if (!isRN) {
    return {
      name: "React Native Hardening",
      score: 100,
      findings: [],
      recommendations: [],
    };
  }

  const rootDir = context.rootDir;

  // 1. Check Babel preset config in babel.config.js
  const babelConfigPath = path.join(rootDir, "babel.config.js");
  const babelConfigJsonPath = path.join(rootDir, "babel.config.json");
  let hasBabelConfig = false;
  let babelContent = "";

  if (await pathExists(babelConfigPath)) {
    hasBabelConfig = true;
    try {
      babelContent = await fs.readFile(babelConfigPath, "utf8");
    } catch {}
  } else if (await pathExists(babelConfigJsonPath)) {
    hasBabelConfig = true;
    try {
      babelContent = await fs.readFile(babelConfigJsonPath, "utf8");
    } catch {}
  }

  if (hasBabelConfig) {
    const requiredPreset = isExpo ? "babel-preset-expo" : "metro-react-native-babel-preset";
    if (!babelContent.includes(requiredPreset)) {
      findings.push({
        id: "rn-babel-preset-missing",
        title: `Missing Babel Preset: ${requiredPreset}`,
        issue: `Your Babel configuration does not appear to include the recommended preset '${requiredPreset}'.`,
        impact: "React Native compilation might fail or perform suboptimally at runtime due to missing transformations.",
        recommendation: `Add '${requiredPreset}' to the presets list in your Babel config file.`,
        severity: "High",
        location: { file: "babel.config.js", line: 1 },
      });
    }
  }

  // 2. Check for Expo Router / React Navigation coexistence
  if (allDeps["expo-router"] && allDeps["@react-navigation/native"]) {
    findings.push({
      id: "expo-router-navigation-conflict",
      title: "Coexistence of expo-router and @react-navigation/native",
      issue: "Both 'expo-router' and '@react-navigation/native' are declared as direct dependencies.",
      impact: "This can lead to navigation state conflicts, duplicate router histories, and bundle bloating.",
      recommendation: "Expo Router internally wraps React Navigation. Consider managing navigation exclusively through Expo Router.",
      severity: "Medium",
      location: { file: "package.json", line: 1 },
    });
  }

  // 3. Expo `.gitignore` check
  if (isExpo) {
    const gitignorePath = path.join(rootDir, ".gitignore");
    if (await pathExists(gitignorePath)) {
      try {
        const gitignoreContent = await fs.readFile(gitignorePath, "utf8");
        if (!gitignoreContent.includes(".expo") || !gitignoreContent.includes("web-build")) {
          findings.push({
            id: "expo-gitignore-missing-paths",
            title: "Missing Expo Cache in .gitignore",
            issue: "Your .gitignore file does not exclude '.expo/' cache or 'web-build/' artifacts.",
            impact: "Large local caches and production build targets may be accidentally committed to git.",
            recommendation: "Append '.expo/' and 'web-build/' to your .gitignore file.",
            severity: "Medium",
            location: { file: ".gitignore", line: 1 },
          });
        }
      } catch {}
    }
  }

  // 4. Check for Metro Config configuration
  const metroConfigPath = path.join(rootDir, "metro.config.js");
  if (!(await pathExists(metroConfigPath))) {
    findings.push({
      id: "rn-metro-config-missing",
      title: "Missing metro.config.js",
      issue: "Metro bundler configuration file was not found at the project root.",
      impact: "Custom asset resolution, symlinks, and transformer options cannot be configured, leading to potential resolver errors.",
      recommendation: "Create a metro.config.js to explicitly define your bundler rules.",
      severity: "Medium",
      location: { file: "package.json", line: 1 },
    });
  }

  // 5. check for env.local files in Expo
  if (isExpo) {
    const envLocalPath = path.join(rootDir, ".env.local");
    if (await pathExists(envLocalPath)) {
      findings.push({
        id: "expo-env-local-unsupported",
        title: ".env.local is unsupported in Expo native builds",
        issue: "A '.env.local' file was detected in your Expo project.",
        impact: "Expo's native bundler does not automatically load '.env.local' for native platforms; values will be missing at runtime.",
        recommendation: "Use '.env' or environment variables specified in app.json/app.config.js instead.",
        severity: "High",
        location: { file: ".env.local", line: 1 },
      });
    }
  }

  return {
    name: "React Native Hardening",
    score: scoreFromFindings(findings),
    findings,
    recommendations: findings.map((f) => f.recommendation),
  };
}
