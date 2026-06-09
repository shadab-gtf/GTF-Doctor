import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const rootDir = process.cwd();
const examplesDir = path.join(rootDir, "examples");
const screenshotsDir = path.join(rootDir, "assets", "screenshots");
const npmCacheDir = path.join(rootDir, ".tmp", "npm-cache");
const nodeBin = process.execPath;
const cliPath = path.join(rootDir, "dist", "cli", "index.js");

interface CommandResult {
  stdout: string;
  stderr: string;
}

async function main(): Promise<void> {
  await ensureBuiltCli();
  await resetDir(examplesDir);
  await fs.mkdir(screenshotsDir, { recursive: true });

  const nextDemo = path.join(examplesDir, "nextjs-demo");
  const reactDemo = path.join(examplesDir, "react-demo");
  const badDemo = path.join(examplesDir, "bad-project-demo");

  await createNextDemo(nextDemo);
  await createReactDemo(reactDemo);
  await createBadDemo(badDemo);

  const terminalAudit = await runCli(badDemo, ["audit", "--report"]);
  await textPng("terminal-audit.png", terminalAudit.stdout);

  const terminalSkeleton = await runCli(badDemo, ["skeleton", "check"]);
  await textPng("terminal-skeleton.png", terminalSkeleton.stdout);

  const terminalSeo = await runCli(badDemo, ["seo"]);
  await textPng("terminal-seo.png", terminalSeo.stdout);

  await runCli(nextDemo, ["audit", "--report"]);
  await runCli(reactDemo, ["audit", "--report"]);
  await runCli(badDemo, ["audit", "--markdown"]);
  await runCli(badDemo, ["audit", "--html"]);
  await runCli(badDemo, ["audit", "--json"]);

  await dashboardPng("audit-report.png", "Audit Report", path.join(badDemo, "reports", "audit-report.json"));
  await dashboardPng("seo-report.png", "SEO Report", path.join(badDemo, "reports", "audit-report.json"));
  await dashboardPng("skeleton-report.png", "Skeleton Report", path.join(badDemo, "reports", "audit-report.json"));

  await execFileAsync("npm", ["run", "readme:generate"], { cwd: rootDir, shell: true });
  await verifyScreenshots();
  await verifyReadme();

  await fs.cp(path.join(badDemo, "reports"), path.join(rootDir, "reports"), { recursive: true });
  await fs.rm(examplesDir, { recursive: true, force: true });
  await verifyExamplesRemoved();

  await fs.mkdir(npmCacheDir, { recursive: true });
  const pack = await execFileAsync("npm", ["pack", "--dry-run", "--cache", npmCacheDir], { cwd: rootDir, shell: true });
  if (/examples\/|scripts\/|tests\/|src\//.test(pack.stdout)) {
    throw new Error("npm package contains temporary or source-only validation files.");
  }
}

async function ensureBuiltCli(): Promise<void> {
  await fs.access(cliPath);
}

async function runCli(cwd: string, args: string[]): Promise<CommandResult> {
  return execFileAsync(nodeBin, [cliPath, ...args], {
    cwd,
    env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
    maxBuffer: 1024 * 1024 * 8,
  });
}

async function resetDir(target: string): Promise<void> {
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
}

async function createNextDemo(target: string): Promise<void> {
  await fs.mkdir(path.join(target, "app", "components"), { recursive: true });
  await fs.writeFile(path.join(target, "package.json"), JSON.stringify({ name: "nextjs-demo", dependencies: { next: "15.0.0", react: "19.0.0" } }, null, 2));
  await fs.writeFile(path.join(target, "tsconfig.json"), JSON.stringify({ compilerOptions: { jsx: "preserve", strict: true } }, null, 2));
  await fs.writeFile(path.join(target, "app", "layout.tsx"), "export const metadata = { title: 'Demo', description: 'Demo app', openGraph: { title: 'Demo' }, alternates: { canonical: '/' } };\nexport default function Layout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html>; }\n");
  await fs.writeFile(path.join(target, "app", "page.tsx"), "import { Suspense } from 'react';\nimport { Hero } from './components/Hero';\nimport { HeroSkeleton } from './components/HeroSkeleton';\nexport default async function Page() { return <Suspense fallback={<HeroSkeleton />}><Hero title=\"Next Demo\" /></Suspense>; }\n");
  await fs.writeFile(path.join(target, "app", "components", "Hero.tsx"), "export function Hero({ title }: { title: string }) { return <section><h1>{title}</h1></section>; }\n");
  await fs.writeFile(path.join(target, "app", "components", "HeroSkeleton.tsx"), "export function HeroSkeleton() { return <section aria-hidden=\"true\"><div className=\"h-8 w-40 bg-slate-200\" /></section>; }\n");
}

async function createReactDemo(target: string): Promise<void> {
  await fs.mkdir(path.join(target, "src", "components"), { recursive: true });
  await fs.writeFile(path.join(target, "package.json"), JSON.stringify({ name: "react-demo", dependencies: { react: "19.0.0" } }, null, 2));
  await fs.writeFile(path.join(target, "tsconfig.json"), JSON.stringify({ compilerOptions: { jsx: "react-jsx", strict: true } }, null, 2));
  await fs.writeFile(path.join(target, "src", "components", "Card.tsx"), "export function Card() { return <article><h2>React Demo</h2><p>Ready</p></article>; }\n");
  await fs.writeFile(path.join(target, "src", "components", "CardSkeleton.tsx"), "export function CardSkeleton() { return <article aria-hidden=\"true\"><div className=\"h-6 w-32 bg-slate-200\" /></article>; }\n");
}

async function createBadDemo(target: string): Promise<void> {
  await fs.mkdir(path.join(target, "app", "components"), { recursive: true });
  await fs.writeFile(path.join(target, "package.json"), JSON.stringify({ name: "bad-project-demo", dependencies: { next: "15.0.0", react: "19.0.0", gsap: "3.12.0" } }, null, 2));
  await fs.writeFile(path.join(target, "tsconfig.json"), JSON.stringify({ compilerOptions: { jsx: "preserve", strict: true } }, null, 2));
  await fs.writeFile(path.join(target, "app", "layout.tsx"), "export default function Layout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html>; }\n");
  await fs.writeFile(path.join(target, "app", "page.tsx"), "'use client';\nimport { ProductCard } from './components/ProductCard';\nexport default function Page() { return <main><h1>Bad Demo</h1><ProductCard /></main>; }\n");
  await fs.writeFile(path.join(target, "app", "components", "ProductCard.tsx"), "export function ProductCard() { return <article><img src=\"/large.jpg\" /><input /><button></button></article>; }\n");
  await fs.writeFile(path.join(target, "app", "components", "AnimatedHero.tsx"), "'use client';\nimport gsap from 'gsap';\nimport { useEffect } from 'react';\nexport function AnimatedHero() { useEffect(() => { gsap.to('.hero', { opacity: 1 }); }, []); return <section className=\"hero\">Hero</section>; }\n");
}

async function textPng(fileName: string, text: string): Promise<void> {
  const lines = text.replace(/\x1b\[[0-9;]*m/g, "").split(/\r?\n/).slice(0, 52);
  const escaped = lines.map(escapeXml);
  const height = Math.max(520, escaped.length * 20 + 48);
  const svg = `<svg width="1200" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="${height}" fill="#020617"/>
  <rect x="24" y="24" width="1152" height="${height - 48}" rx="12" fill="#0f172a" stroke="#22d3ee"/>
  <text x="48" y="62" fill="#e2e8f0" font-family="Consolas, monospace" font-size="16">
    ${escaped.map((line, index) => `<tspan x="48" dy="${index === 0 ? 0 : 20}">${line || " "}</tspan>`).join("")}
  </text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(screenshotsDir, fileName));
}

async function dashboardPng(fileName: string, title: string, reportPath: string): Promise<void> {
  const raw = await fs.readFile(reportPath, "utf8");
  const report = JSON.parse(raw) as { overallScore: number; criticalIssues: number; warnings: number };
  const svg = `<svg width="1200" height="760" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#0ea5e9"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs>
    <rect width="1200" height="760" fill="#f8fafc"/>
    <rect width="1200" height="260" fill="url(#g)"/>
    <text x="60" y="92" font-family="Arial" font-size="24" fill="#dbeafe">GTF Inspector</text>
    <text x="60" y="170" font-family="Arial" font-size="64" font-weight="700" fill="white">${escapeXml(title)}</text>
    <text x="60" y="222" font-family="Arial" font-size="28" fill="#e0f2fe">Project Health ${report.overallScore}/100</text>
    <rect x="60" y="310" width="320" height="180" rx="8" fill="white" stroke="#e2e8f0"/>
    <rect x="440" y="310" width="320" height="180" rx="8" fill="white" stroke="#e2e8f0"/>
    <rect x="820" y="310" width="320" height="180" rx="8" fill="white" stroke="#e2e8f0"/>
    <text x="90" y="365" font-family="Arial" font-size="20" fill="#64748b">Overall Score</text>
    <text x="90" y="440" font-family="Arial" font-size="64" font-weight="700" fill="#0ea5e9">${report.overallScore}</text>
    <text x="470" y="365" font-family="Arial" font-size="20" fill="#64748b">Critical Issues</text>
    <text x="470" y="440" font-family="Arial" font-size="64" font-weight="700" fill="#dc2626">${report.criticalIssues}</text>
    <text x="850" y="365" font-family="Arial" font-size="20" fill="#64748b">Warnings</text>
    <text x="850" y="440" font-family="Arial" font-size="64" font-weight="700" fill="#d97706">${report.warnings}</text>
    <rect x="60" y="550" width="1080" height="28" rx="14" fill="#e2e8f0"/>
    <rect x="60" y="550" width="${Math.max(1, report.overallScore) * 10.8}" height="28" rx="14" fill="url(#g)"/>
    <text x="60" y="640" font-family="Arial" font-size="24" fill="#111827">Searchable report • Issue tables • Recommendations • Export • Print • Dark mode</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(screenshotsDir, fileName));
}

async function verifyScreenshots(): Promise<void> {
  const required = ["audit-report.png", "seo-report.png", "skeleton-report.png", "terminal-audit.png", "terminal-skeleton.png", "terminal-seo.png"];
  for (const file of required) {
    const stat = await fs.stat(path.join(screenshotsDir, file));
    if (stat.size < 1000) {
      throw new Error(`Screenshot is missing or too small: ${file}`);
    }
  }
}

async function verifyReadme(): Promise<void> {
  const content = await fs.readFile(path.join(rootDir, "README.md"), "utf8");
  for (const file of ["audit-report.png", "seo-report.png", "skeleton-report.png", "terminal-audit.png", "terminal-skeleton.png", "terminal-seo.png"]) {
    if (!content.includes(`assets/screenshots/${file}`)) {
      throw new Error(`README does not reference ${file}`);
    }
  }
  if (!content.includes("npm install -g gtf-inspector") || !content.includes("gtf audit")) {
    throw new Error("README installation instructions are incomplete.");
  }
}

async function verifyExamplesRemoved(): Promise<void> {
  try {
    await fs.access(examplesDir);
    throw new Error("Temporary demo projects were not removed.");
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

await main();
