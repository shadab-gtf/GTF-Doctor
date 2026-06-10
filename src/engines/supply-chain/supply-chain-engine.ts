import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { scoreFromFindings } from "../../core/scoring.js";

const SOCKET_FREE_PURL_API_BASE = "https://firewall-api.socket.dev/purl";
const SOCKET_PACKAGE_PAGE_BASE = "https://socket.dev/npm/package";
const SOCKET_FREE_USER_AGENT = "react-doctor-supply-chain";
const SUPPLY_CHAIN_DEFAULT_MIN_SCORE = 50;
const SUPPLY_CHAIN_FETCH_CONCURRENCY = 8;
const SUPPLY_CHAIN_IGNORED_PACKAGES = new Set(["next"]);

interface SocketScore {
  overall: number;
  license: number;
  maintenance: number;
  quality: number;
  supplyChain: number;
  vulnerability: number;
}

interface SocketArtifact {
  score?: SocketScore;
}

export async function runSupplyChainEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const packageJson = context.packageJson;
  if (!packageJson) {
    return {
      name: "Supply Chain Security",
      score: 100,
      findings: [],
      recommendations: [],
    };
  }

  // Collect dependencies
  const deps = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  };

  const targets: Array<{ name: string; spec: string; version: string }> = [];

  const resolveConcreteVersion = (spec: string): string | null => {
    const trimmed = spec.trim();
    if (trimmed.length === 0 || trimmed.includes(":")) return null;
    const match = trimmed.match(/\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?/);
    return match ? match[0] : null;
  };

  for (const [name, spec] of Object.entries(deps)) {
    if (SUPPLY_CHAIN_IGNORED_PACKAGES.has(name)) continue;
    const version = resolveConcreteVersion(spec);
    if (version) {
      targets.push({ name, spec, version });
    }
  }

  if (targets.length === 0) {
    return {
      name: "Supply Chain Security",
      score: 100,
      findings: [],
      recommendations: [],
    };
  }

  // Safe concurrent execution pool
  const results: Array<{ target: typeof targets[0]; score: SocketScore | null }> = [];
  const minScore = SUPPLY_CHAIN_DEFAULT_MIN_SCORE;

  const fetchScore = async (target: typeof targets[0]): Promise<SocketScore | null> => {
    const purl = `pkg:npm/${target.name}@${target.version}`;
    const url = `${SOCKET_FREE_PURL_API_BASE}/${encodeURIComponent(purl)}`;
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": SOCKET_FREE_USER_AGENT },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return null;
      const text = await response.text();
      for (const line of text.split("\n")) {
        if (line.trim().length === 0) continue;
        try {
          const parsed = JSON.parse(line) as SocketArtifact;
          if (parsed && parsed.score) {
            return {
              overall: Math.round(parsed.score.overall * 100),
              license: Math.round(parsed.score.license * 100),
              maintenance: Math.round(parsed.score.maintenance * 100),
              quality: Math.round(parsed.score.quality * 100),
              supplyChain: Math.round(parsed.score.supplyChain * 100),
              vulnerability: Math.round(parsed.score.vulnerability * 100),
            };
          }
        } catch {
          // ignore parsing error for this line
        }
      }
    } catch {
      // ignore lookup/timeout errors to fail-open
    }
    return null;
  };

  // Run in chunks
  for (let i = 0; i < targets.length; i += SUPPLY_CHAIN_FETCH_CONCURRENCY) {
    const chunk = targets.slice(i, i + SUPPLY_CHAIN_FETCH_CONCURRENCY);
    const promises = chunk.map(async (target) => {
      const score = await fetchScore(target);
      return { target, score };
    });
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }

  for (const { target, score } of results) {
    if (score && score.overall < minScore) {
      const pageUrl = `${SOCKET_PACKAGE_PAGE_BASE}/${target.name}/overview/${target.version}`;
      findings.push({
        id: `socket-low-score-${target.name}`,
        title: `Low Supply-Chain Score for ${target.name}`,
        issue: `Dependency '${target.name}' (declared as "${target.spec}") scored overall ${score.overall}/100, which is below the minimum safety threshold of ${minScore}.`,
        impact: `Vulnerability score: ${score.vulnerability}, Supply Chain safety: ${score.supplyChain}, Quality: ${score.quality}, Maintenance: ${score.maintenance}.`,
        recommendation: `Verify the package health at ${pageUrl}. Consider upgrading or replacing this dependency.`,
        severity: "High",
        location: { file: "package.json", line: 1 },
      });
    }
  }

  return {
    name: "Supply Chain Security",
    score: scoreFromFindings(findings),
    findings,
    recommendations: findings.map((f) => f.recommendation),
  };
}
