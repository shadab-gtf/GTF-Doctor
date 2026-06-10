import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_RESOLVED_CONFIG } from "./constants.js";
import { pathExists } from "./file-system.js";
import { ResolvedGtfConfig } from "../types/config.js";

type UnknownRecord = Record<string, unknown>;

export async function loadGtfConfig(rootDir: string): Promise<ResolvedGtfConfig> {
  const jsonPath = path.join(rootDir, "gtf.config.json");
  const tsPath = path.join(rootDir, "gtf.config.ts");

  if (await pathExists(jsonPath)) {
    const parsed = JSON.parse(await fs.readFile(jsonPath, "utf8")) as unknown;
    return mergeConfig(asRecord(parsed));
  }

  if (await pathExists(tsPath)) {
    const parsed = parseTsConfig(await fs.readFile(tsPath, "utf8"));
    return mergeConfig(parsed);
  }

  return cloneDefaultConfig();
}

function parseTsConfig(source: string): UnknownRecord {
  const objectSource = source.replace(/^\s*export\s+default\s+/m, "").replace(/;\s*$/, "");
  try {
    const config = Function(`"use strict"; return (${objectSource});`)() as unknown;
    return asRecord(config);
  } catch {
    return {};
  }
}

function mergeConfig(config: UnknownRecord): ResolvedGtfConfig {
  const defaults = cloneDefaultConfig();
  const architecture = asRecord(config.architecture);
  const policy = asRecord(config.policy);

  return {
    ...defaults,
    seo: booleanValue(config.seo, defaults.seo),
    accessibility: booleanValue(config.accessibility, defaults.accessibility),
    performance: booleanValue(config.performance, defaults.performance),
    memory: booleanValue(config.memory, defaults.memory),
    reactDiagnostics: booleanValue(config.reactDiagnostics, defaults.reactDiagnostics),
    runtimeInsights: booleanValue(config.runtimeInsights, defaults.runtimeInsights),
    componentHealth: booleanValue(config.componentHealth, defaults.componentHealth),
    pageHealth: booleanValue(config.pageHealth, defaults.pageHealth),
    engineeringScore: booleanValue(config.engineeringScore, defaults.engineeringScore),
    nextjs: booleanValue(config.nextjs, defaults.nextjs),
    gsap: booleanValue(config.gsap, defaults.gsap),
    skeleton: booleanValue(config.skeleton, defaults.skeleton),
    report: booleanValue(config.report, defaults.report),
    linter: booleanValue(config.linter, defaults.linter),
    deadCode: booleanValue(config.deadCode, defaults.deadCode),
    supplyChain: booleanValue(config.supplyChain, defaults.supplyChain),
    rscAdvisory: booleanValue(config.rscAdvisory, defaults.rscAdvisory),
    reactNative: booleanValue(config.reactNative, defaults.reactNative),
    include: stringArray(config.include, defaults.include),
    exclude: stringArray(config.exclude, defaults.exclude),
    architecture: {
      serverFirst: booleanValue(architecture.serverFirst, defaults.architecture.serverFirst),
      strictPages: booleanValue(architecture.strictPages, defaults.architecture.strictPages),
      requireSuspense: booleanValue(architecture.requireSuspense, defaults.architecture.requireSuspense),
      requireRouteLoading: booleanValue(architecture.requireRouteLoading, defaults.architecture.requireRouteLoading),
      requireRouteError: booleanValue(architecture.requireRouteError, defaults.architecture.requireRouteError),
      maxComponentLines: numberValue(architecture.maxComponentLines, defaults.architecture.maxComponentLines),
    },
    policy: {
      minimumScore: numberValue(policy.minimumScore, defaults.policy.minimumScore),
      failOnCritical: booleanValue(policy.failOnCritical, defaults.policy.failOnCritical),
      failOnHighCount: numberValue(policy.failOnHighCount, defaults.policy.failOnHighCount),
    },
  };
}

function cloneDefaultConfig(): ResolvedGtfConfig {
  return {
    ...DEFAULT_RESOLVED_CONFIG,
    include: [...DEFAULT_RESOLVED_CONFIG.include],
    exclude: [...DEFAULT_RESOLVED_CONFIG.exclude],
    architecture: { ...DEFAULT_RESOLVED_CONFIG.architecture },
    policy: { ...DEFAULT_RESOLVED_CONFIG.policy },
  };
}

function asRecord(value: unknown): UnknownRecord {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as UnknownRecord;
  }
  return {};
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function numberValue(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : fallback;
}
