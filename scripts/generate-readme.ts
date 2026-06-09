import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const readme = `# GTF Inspector

![GTF Inspector Banner](assets/screenshots/audit-report.png)

GTF Inspector is a local-first CLI platform for frontend quality auditing, report generation, and automatic skeleton generation. It works offline and requires no paid APIs, cloud services, or AI services.

## Features

- Report-first audits for React, Next.js, TypeScript, Tailwind CSS, GSAP, and Lenis projects.
- Terminal, Markdown, HTML, JSON, and clipboard report outputs.
- Senior-review style findings with issue, impact, file, line, recommendation, and priority.
- Weighted project health score across SEO, accessibility, performance, skeleton coverage, Next.js health, and GSAP health.
- Skeleton coverage scanner and TypeScript-based skeleton generator.
- Professional searchable, printable, exportable HTML dashboard with light and dark modes.

## Installation

\`\`\`bash
npm install -g gtf-inspector
gtf audit
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
gtf audit --copy
gtf audit --markdown
gtf audit --html
gtf audit --json
gtf skeleton check
gtf skeleton generate
\`\`\`

## Real Screenshots

### Terminal Audit

![Terminal Audit](assets/screenshots/terminal-audit.png)

### Skeleton Coverage

![Skeleton Coverage](assets/screenshots/terminal-skeleton.png)

### SEO Report

![SEO Report](assets/screenshots/terminal-seo.png)

### Audit Report Dashboard

![Audit Report](assets/screenshots/audit-report.png)

### Generated Skeleton Report

![Skeleton Report](assets/screenshots/skeleton-report.png)

### SEO Dashboard

![SEO Dashboard](assets/screenshots/seo-report.png)

## Real Reports

GTF Inspector writes reports to \`reports/\`:

- \`reports/audit-report.md\` for GitHub Issues, PR reviews, Slack, and Jira.
- \`reports/audit-report.html\` for a premium dashboard with search, print, export, and theme controls.
- \`reports/audit-report.json\` for automation.

## Examples

Temporary validation projects are created during \`npm run self-test\` under \`examples/\` and are deleted after screenshots and reports are generated. They are intentionally excluded from npm publishing.

## Commands

| Command | Purpose |
| --- | --- |
| \`gtf init\` | Create \`.gtf/\` and \`gtf.config.ts\`. |
| \`gtf audit\` | Run all audit engines and print the terminal report. |
| \`gtf audit --report\` | Export Markdown, HTML, and JSON reports. |
| \`gtf audit --copy\` | Generate and copy the full report to the clipboard. |
| \`gtf seo\` | Run SEO scanner. |
| \`gtf metadata\` | Run metadata scanner. |
| \`gtf accessibility\` | Run accessibility scanner. |
| \`gtf performance\` | Run performance scanner. |
| \`gtf nextjs\` | Run Next.js health scanner. |
| \`gtf gsap\` | Run GSAP scanner. |
| \`gtf skeleton check\` | Check skeleton coverage. |
| \`gtf skeleton generate\` | Generate missing skeleton components. |
| \`gtf report\` | Generate all report formats. |
| \`gtf doctor\` | Audit git changes and full project health. |
| \`gtf version\` | Show CLI version. |
| \`gtf help\` | Show command help. |

## Roadmap

- Add deeper AST rules for route segment streaming.
- Add optional bundle analyzer ingestion.
- Add richer Tailwind skeleton shape inference.
- Add per-engine HTML report pages.

## Contributing

Run the full quality gate before opening a pull request:

\`\`\`bash
npm test
npm run build
npm run self-test
npm pack --dry-run
\`\`\`

## License

MIT
`;

await fs.writeFile(path.join(rootDir, "README.md"), readme, "utf8");
