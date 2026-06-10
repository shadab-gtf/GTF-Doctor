import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const imageBaseUrl = "https://raw.githubusercontent.com/gtftechnologies/gtf-scale/main/assets/screenshots";

const readme = `# GTF Scale - Frontend Quality Audit CLI for React and Next.js

![GTF Scale Dashboard](${imageBaseUrl}/audit-report.png)

GTF Scale is a local-first developer CLI for auditing React, Next.js, TypeScript, Tailwind CSS, GSAP, and Lenis projects. It scans your frontend codebase, finds quality issues, generates a clear project health report, checks memory-leak risk, reviews component and page health, and helps teams reduce manual code review time.

It runs entirely offline. No paid APIs. No cloud account. No AI service required.

## Why GTF Scale

Frontend teams repeatedly review the same problems before launch:

- Missing SEO metadata
- Missing Open Graph and canonical URLs
- Missing image alt text and form labels
- Raw images instead of optimized Next.js images
- Too many client components
- Missing loading skeletons
- GSAP animations without cleanup
- Memory leaks from timers, listeners, observers, and stale effects
- Runtime risks from browser APIs, unsafe parsing, and unhandled fetch calls
- React-specific bugs such as missing keys, stale effects, and unsafe HTML
- Weak component and page architecture
- Reports that are hard to copy, share, or archive

GTF Scale turns those checks into one command:

\`\`\`bash
gtf audit --report
\`\`\`

## What You Get

- A readable terminal audit report
- Exportable Markdown reports for GitHub, Slack, Jira, and PR reviews
- Professional HTML dashboard reports for launch reviews
- JSON reports for automation and CI
- Clipboard support with \`gtf audit --copy\`
- Skeleton coverage checks
- Automatic skeleton component generation
- Memory leak and cleanup health checks
- React-specific diagnostics
- Runtime behavior risk insights
- Component health score
- Page health score
- Engineering score for build/test/type-safety readiness
- Priority-ranked findings with severity, impact, file, line, and recommendation

## Installation

Install globally from npm:

\`\`\`bash
npm install -g gtf-scale
gtf audit
\`\`\`

Use inside a project without global install:

\`\`\`bash
npx gtf-scale audit --report
\`\`\`

For local development:

\`\`\`bash
npm install
npm run build
npm link
gtf audit --report
\`\`\`

## Quick Start

\`\`\`bash
gtf init
gtf audit
gtf audit --report
gtf audit --copy
gtf memory
gtf react
gtf runtime
gtf component
gtf page
gtf engineer
gtf skeleton check
gtf skeleton generate
\`\`\`

Generated reports are saved in:

\`\`\`text
reports/audit-report.md
reports/audit-report.html
reports/audit-report.json
\`\`\`

## Screenshots

### Terminal Audit Report

![Terminal Audit](${imageBaseUrl}/terminal-audit.png)

### Skeleton Coverage Report

![Skeleton Coverage](${imageBaseUrl}/terminal-skeleton.png)

### SEO Terminal Report

![SEO Report](${imageBaseUrl}/terminal-seo.png)

### HTML Audit Dashboard

![Audit Dashboard](${imageBaseUrl}/audit-report.png)

### Skeleton Dashboard

![Skeleton Dashboard](${imageBaseUrl}/skeleton-report.png)

### SEO Dashboard

![SEO Dashboard](${imageBaseUrl}/seo-report.png)

## Audit Engines

| Engine | What It Checks |
| --- | --- |
| SEO | Metadata, Open Graph, Twitter cards, canonical URLs, sitemap, robots, schema signals |
| Metadata | Missing route metadata, duplicate patterns, weak titles, centralization opportunities |
| Accessibility | Missing alt text, missing labels, empty buttons, semantic issues |
| Performance | Raw images, oversized client usage, heavy imports, unnecessary client components |
| Memory Health | Missing cleanup for listeners, timers, observers, and stale async callbacks |
| React Diagnostics | Missing keys, stale effect risks, unsafe HTML, unnecessary memoization |
| Runtime Insights | Browser API SSR risks, unguarded JSON parsing, fetch error handling |
| Component Health | Oversized components, data fetching in UI, weak prop contracts |
| Page Health | Client pages, inline page UI, missing streaming boundaries |
| Next.js Health | Server-first architecture, client directives in pages, Suspense usage, routing patterns |
| Skeleton Coverage | Missing skeleton components for async sections and UI components |
| GSAP Health | Client-only animation usage, cleanup, \`ctx.revert()\`, ScrollTrigger lifecycle |
| Engineering Score | Build/test script readiness, TypeScript safety, unfinished code markers |

## Report Formats

### Terminal

\`\`\`bash
gtf audit
\`\`\`

Best for quick local review.

### Markdown

\`\`\`bash
gtf audit --markdown
\`\`\`

Creates \`reports/audit-report.md\`. Use it in GitHub Issues, pull request reviews, Slack, Jira, Linear, and team handoffs.

### HTML

\`\`\`bash
gtf audit --html
\`\`\`

Creates \`reports/audit-report.html\` with score cards, progress bars, issue tables, search, print, export, and light/dark mode.

### JSON

\`\`\`bash
gtf audit --json
\`\`\`

Creates \`reports/audit-report.json\` for automation, CI, and custom dashboards.

### Clipboard

\`\`\`bash
gtf audit --copy
\`\`\`

Copies the complete terminal report so it can be pasted directly into team tools.

## Project Health Score

GTF Scale calculates a 0-100 project health score using weighted frontend quality categories:

| Category | Weight |
| --- | ---: |
| SEO | 20% |
| Accessibility | 20% |
| Performance | 20% |
| Skeleton Coverage | 15% |
| Next.js Health | 15% |
| GSAP Health | 10% |
| Memory Health | Bonus diagnostic weight |
| React Diagnostics | Bonus diagnostic weight |
| Runtime Insights | Bonus diagnostic weight |
| Component Health | Bonus diagnostic weight |
| Page Health | Bonus diagnostic weight |
| Engineering Score | Bonus diagnostic weight |

Each finding includes:

- Severity: Critical, High, Medium, or Low
- Issue
- Impact
- File
- Line
- Recommendation
- Priority

## Commands

GTF Scale currently ships with 25 CLI commands and command variants.

| Command | Purpose |
| --- | --- |
| \`gtf init\` | Create \`.gtf/\` and \`gtf.config.ts\`. |
| \`gtf audit\` | Run the full frontend quality audit. |
| \`gtf audit --report\` | Export Markdown, HTML, and JSON reports. |
| \`gtf audit --copy\` | Copy the complete report to clipboard. |
| \`gtf audit --markdown\` | Export Markdown report. |
| \`gtf audit --html\` | Export HTML dashboard report. |
| \`gtf audit --json\` | Export JSON automation report. |
| \`gtf seo\` | Run SEO scanner. |
| \`gtf metadata\` | Run metadata scanner. |
| \`gtf accessibility\` | Run accessibility scanner. |
| \`gtf performance\` | Run performance scanner. |
| \`gtf memory\` | Run memory leak and cleanup health scanner. |
| \`gtf react\` | Run React-specific diagnostics. |
| \`gtf runtime\` | Run runtime behavior insight scanner. |
| \`gtf component\` | Run component health scanner. |
| \`gtf page\` | Run page health scanner. |
| \`gtf nextjs\` | Run Next.js health scanner. |
| \`gtf gsap\` | Run GSAP scanner. |
| \`gtf engineer\` | Run engineering score scanner. |
| \`gtf skeleton check\` | Check skeleton coverage. |
| \`gtf skeleton generate\` | Generate missing skeleton components. |
| \`gtf report\` | Generate all report formats. |
| \`gtf doctor\` | Audit current git changes and project health. |
| \`gtf version\` | Show CLI version. |
| \`gtf help\` | Show command help. |

## Scalable Architecture

GTF Scale is designed as a modular TypeScript CLI:

\`\`\`text
src/
  cli/
  commands/
  core/
  engines/
    seo/
    metadata/
    accessibility/
    performance/
    nextjs/
    gsap/
    skeleton/
  reporting/
  types/
  utils/
\`\`\`

Each engine is independent. Reports are generated from shared typed data, so new engines and report formats can be added without rewriting the CLI.

## Best Use Cases

- Pre-launch frontend audits
- Next.js website quality reviews
- React component library reviews
- Memory leak risk reviews
- React runtime behavior reviews
- Component and page architecture reviews
- Engineering readiness reviews before npm or production launch
- SEO and accessibility cleanup
- Pull request quality gates
- Performance review before deployment
- Skeleton coverage checks for loading states
- Team-shareable frontend health reports

## Self Testing

The package includes a self-validation workflow:

\`\`\`bash
npm test
npm run build
npm run self-test
npm pack --dry-run
\`\`\`

\`npm run self-test\` creates temporary demo projects, audits them, generates real reports, captures screenshots, updates this README, verifies package contents, and removes temporary demos.

## Trust and Detection Accuracy

GTF Scale is built to become more trustworthy than generic React checkers by combining several layers of validation:

- Static source diagnostics for React and Next.js architecture
- Memory-risk patterns for timers, listeners, observers, and animation cleanup
- Runtime-risk checks for browser APIs, parsing, and network failure paths
- Report-first output that makes every finding reviewable by a senior engineer
- Self-testing against clean React, clean Next.js, and intentionally bad demo projects
- npm package validation to ensure temporary demos and test artifacts are not published

The tool is intentionally deterministic. It does not invent results from a cloud service; every finding points to source code, impact, and a concrete recommendation.

## NPM Publish Readiness

The package is prepared for npm publishing with:

- CLI bin entry
- TypeScript build output
- README screenshots
- MIT license
- npm package metadata
- Strict package file allow-list
- Temporary examples excluded from publishing
- Source, tests, scripts, and generated temp folders excluded from the final package

## Roadmap

- Deeper AST-based route streaming checks
- Bundle analyzer report ingestion
- More Tailwind-aware skeleton generation
- Per-engine standalone HTML reports
- CI-friendly score thresholds

## Contributing

Before opening a pull request, run:

\`\`\`bash
npm test
npm run build
npm run self-test
npm pack --dry-run
\`\`\`

Keep changes local-first, typed, testable, and focused on improving frontend quality reports.

## License

MIT
`;

await fs.writeFile(path.join(rootDir, "README.md"), readme, "utf8");
