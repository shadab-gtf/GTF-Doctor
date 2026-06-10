// @ts-ignore
import semver from "semver";
import { AuditContext, EngineReport, Finding } from "../../types/report.js";
import { scoreFromFindings } from "../../core/scoring.js";

const REACT_SERVER_DOM_PACKAGES = [
  "react-server-dom-webpack",
  "react-server-dom-turbopack",
  "react-server-dom-parcel",
  "react-server-dom-fn",
  "react-server-dom-esm",
];

interface RSCAdvisory {
  readonly rceFixedVersion: string;
  readonly latestSafeVersion: string;
}

const REACT_RSC_ADVISORIES_BY_MINOR: Record<string, RSCAdvisory> = {
  "19.0": { rceFixedVersion: "19.0.1", latestSafeVersion: "19.0.6" },
  "19.1": { rceFixedVersion: "19.1.2", latestSafeVersion: "19.1.7" },
  "19.2": { rceFixedVersion: "19.2.1", latestSafeVersion: "19.2.6" },
};

const NEXTJS_OLDEST_AFFECTED_MAJOR = 13;
const NEXTJS_RCE_FIXED_BY_MINOR: Record<string, string> = {
  "15.0": "15.0.5",
  "15.1": "15.1.9",
  "15.2": "15.2.6",
  "15.3": "15.3.6",
  "15.4": "15.4.8",
  "15.5": "15.5.7",
  "16.0": "16.0.7",
};
const NEXTJS_LATEST_SAFE_BY_MAJOR: Record<number, string> = {
  15: "15.5.18",
  16: "16.2.6",
};

const NEXTJS_SUPPORTED_UPGRADE_TARGETS = "15.5.18 or 16.2.6";
const REACT_BLOG_RSC_ADVISORY_URL = "https://react.dev/blog/2025/02/18/react-server-components-security-advisory";
const VERCEL_NEXTJS_SECURITY_RELEASE_URL = "https://vercel.com/blog/security-release-react-server-components";

export async function runRscAdvisoryEngine(context: AuditContext): Promise<EngineReport> {
  const findings: Finding[] = [];
  const packageJson = context.packageJson;
  if (!packageJson) {
    return {
      name: "React Server Components Advisory",
      score: 100,
      findings: [],
      recommendations: [],
    };
  }

  const allDeps = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
    ...(packageJson.peerDependencies ?? {}),
    ...(packageJson.optionalDependencies ?? {}),
  };

  const getCleanVersion = (spec: string): string | null => {
    const valid = semver.valid(semver.coerce(spec));
    return valid ? valid : null;
  };

  // 1. Audit Next.js version if present
  const nextSpec = allDeps["next"];
  if (nextSpec) {
    const nextVersion = getCleanVersion(nextSpec);
    if (nextVersion) {
      const major = semver.major(nextVersion);
      if (major >= NEXTJS_OLDEST_AFFECTED_MAJOR) {
        const latestSafeVersion = NEXTJS_LATEST_SAFE_BY_MAJOR[major];
        if (!latestSafeVersion) {
          if (major < 15) {
            findings.push({
              id: "rsc-nextjs-unsupported-line",
              title: "Unsupported Next.js Release Line Affected by RSC Advisories",
              issue: `next@${nextVersion} is on an unsupported Next.js release line affected by the React Server Components security advisories.`,
              impact: "Vulnerable Server Component configurations are exposed with no official patch on this line.",
              recommendation: `Upgrade to a patched Next.js release (${NEXTJS_SUPPORTED_UPGRADE_TARGETS}). Next.js bundles its own React Server Components runtime, so upgrading Next.js is what ships the fix. See ${VERCEL_NEXTJS_SECURITY_RELEASE_URL}`,
              severity: "High",
              location: { file: "package.json", line: 1 },
            });
          }
        } else {
          const rceFixedVersion = NEXTJS_RCE_FIXED_BY_MINOR[`${major}.${semver.minor(nextVersion)}`];
          if (rceFixedVersion && semver.lt(nextVersion, rceFixedVersion)) {
            findings.push({
              id: "rsc-nextjs-critical-rce",
              title: "Critical RSC Remote Code Execution in Next.js",
              issue: `next@${nextVersion} bundles the React Server Components runtime affected by the critical remote code execution vulnerability (CVE-2025-55182, CVSS 10.0).`,
              impact: "An unauthenticated attacker can run arbitrary code on your server by sending a crafted payload to any Server Function or Server Action endpoint.",
              recommendation: `Upgrade Next.js to ${latestSafeVersion} (or newer). Run 'npm install next@${latestSafeVersion}'. See ${VERCEL_NEXTJS_SECURITY_RELEASE_URL}`,
              severity: "Critical",
              location: { file: "package.json", line: 1 },
            });
          } else if (semver.lt(nextVersion, latestSafeVersion)) {
            findings.push({
              id: "rsc-nextjs-dos",
              title: "RSC Denial of Service in Next.js",
              issue: `next@${nextVersion} bundles a React Server Components runtime affected by a high-severity denial-of-service vulnerability (CVE-2026-23870).`,
              impact: "Attackers can crash or overwhelm the server via memory resource consumption on RSC endpoints.",
              recommendation: `Upgrade Next.js to ${latestSafeVersion} (or newer). Run 'npm install next@${latestSafeVersion}'. See ${VERCEL_NEXTJS_SECURITY_RELEASE_URL}`,
              severity: "High",
              location: { file: "package.json", line: 1 },
            });
          }
        }
      }
    }
  }

  // 2. Audit standalone react-server-dom-* packages if next is not governing the RSC runtime
  const nextGovernsRsc = nextSpec && getCleanVersion(nextSpec) && semver.major(getCleanVersion(nextSpec)!) >= NEXTJS_OLDEST_AFFECTED_MAJOR;
  if (!nextGovernsRsc) {
    for (const pkgName of REACT_SERVER_DOM_PACKAGES) {
      const spec = allDeps[pkgName];
      if (spec) {
        const version = getCleanVersion(spec);
        if (version) {
          const minorKey = `${semver.major(version)}.${semver.minor(version)}`;
          const advisory = REACT_RSC_ADVISORIES_BY_MINOR[minorKey];
          if (advisory) {
            if (semver.lt(version, advisory.rceFixedVersion)) {
              findings.push({
                id: `rsc-${pkgName}-critical-rce`,
                title: `Critical RSC Remote Code Execution in ${pkgName}`,
                issue: `${pkgName}@${version} has the critical React Server Components remote code execution vulnerability (CVE-2025-55182, CVSS 10.0).`,
                impact: "An unauthenticated attacker can run arbitrary code on your server by sending a crafted payload to any Server Function endpoint.",
                recommendation: `Upgrade React's Server Components runtime to ${advisory.latestSafeVersion}. Run 'npm install ${pkgName}@${advisory.latestSafeVersion}' and align 'react'/'react-dom'. See ${REACT_BLOG_RSC_ADVISORY_URL}`,
                severity: "Critical",
                location: { file: "package.json", line: 1 },
              });
            } else if (semver.lt(version, advisory.latestSafeVersion)) {
              findings.push({
                id: `rsc-${pkgName}-dos`,
                title: `RSC Denial of Service in ${pkgName}`,
                issue: `${pkgName}@${version} is affected by a high-severity React Server Components denial-of-service vulnerability (CVE-2026-23870).`,
                impact: "Attackers can trigger server exhaustion or denial of service via RSC payloads.",
                recommendation: `Upgrade to ${advisory.latestSafeVersion}. Run 'npm install ${pkgName}@${advisory.latestSafeVersion}' and align 'react'/'react-dom'. See ${REACT_BLOG_RSC_ADVISORY_URL}`,
                severity: "High",
                location: { file: "package.json", line: 1 },
              });
            }
          }
        }
      }
    }
  }

  return {
    name: "React Server Components Advisory",
    score: scoreFromFindings(findings),
    findings,
    recommendations: findings.map((f) => f.recommendation),
  };
}
