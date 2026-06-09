export function renderHtmlReport(report) {
    const engineCards = [];
    for (const engine of report.engines) {
        const rows = [];
        for (const finding of engine.findings) {
            const location = finding.location ? `${finding.location.file}:${finding.location.line}` : "Project level";
            rows.push(`<tr>
              <td><span class="pill ${finding.severity.toLowerCase()}">${finding.severity}</span></td>
              <td><b>${escapeHtml(finding.title)}</b><small>${escapeHtml(finding.impact)}</small></td>
              <td>${escapeHtml(location)}</td>
              <td>${escapeHtml(finding.recommendation)}</td>
            </tr>`);
        }
        engineCards.push(`<section class="card">
  <div class="cardHeader">
    <h2>${escapeHtml(engine.name)}</h2>
    <strong>${engine.score}</strong>
  </div>
  <div class="progress"><span style="width:${engine.score}%"></span></div>
  <table>
    <thead><tr><th>Priority</th><th>Issue</th><th>File</th><th>Recommendation</th></tr></thead>
    <tbody>
      ${rows.join("") || `<tr><td colspan="4">No issues detected.</td></tr>`}
    </tbody>
  </table>
</section>`);
    }
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GTF Inspector Report</title>
  <style>
    :root { color-scheme: light dark; --bg:#f8fafc; --surface:#ffffff; --ink:#111827; --muted:#64748b; --line:#e2e8f0; --blue:#0ea5e9; --violet:#7c3aed; --red:#dc2626; --amber:#d97706; }
    [data-theme="dark"] { --bg:#020617; --surface:#0f172a; --ink:#e5e7eb; --muted:#94a3b8; --line:#1e293b; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: var(--bg); color: var(--ink); }
    header { padding: 40px; color: white; background: linear-gradient(135deg, #0f172a, #1d4ed8 45%, #7c3aed); }
    header nav { display:flex; align-items:center; justify-content:space-between; gap:16px; }
    .actions { display:flex; gap:10px; flex-wrap:wrap; }
    button, input { border:0; border-radius:8px; padding:10px 14px; background:white; color:#1d4ed8; font-weight:700; }
    input { min-width:240px; color:#0f172a; font-weight:500; }
    h1 { margin: 36px 0 8px; font-size: clamp(36px, 6vw, 72px); line-height: 1; letter-spacing: 0; }
    .subtitle { color:#dbeafe; font-size:18px; }
    main { max-width: 1180px; margin: -42px auto 64px; padding: 0 24px; }
    .grid { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:16px; margin-bottom:16px; }
    .metric, .card { background:var(--surface); border:1px solid var(--line); border-radius:8px; box-shadow:0 12px 35px rgba(15,23,42,.08); }
    .metric { padding:20px; }
    .metric span { display:block; color:var(--muted); font-size:13px; }
    .metric strong { display:block; margin-top:8px; font-size:32px; }
    .card { padding:22px; margin-top:16px; }
    .cardHeader { display:flex; align-items:center; justify-content:space-between; gap:16px; }
    .cardHeader h2 { margin:0; font-size:22px; }
    .cardHeader strong { font-size:30px; color:var(--blue); }
    .progress { height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden; margin:14px 0 18px; }
    .progress span { display:block; height:100%; background:linear-gradient(90deg, var(--blue), var(--violet)); }
    table { width:100%; border-collapse:collapse; font-size:14px; }
    th, td { padding:12px; border-top:1px solid var(--line); text-align:left; vertical-align:top; }
    th { color:var(--muted); font-size:12px; text-transform:uppercase; }
    small { display:block; color:var(--muted); margin-top:4px; line-height:1.45; }
    .pill { display:inline-flex; border-radius:999px; padding:4px 9px; font-size:12px; font-weight:800; color:white; }
    .critical { background:var(--red); } .high { background:#9333ea; } .medium { background:var(--amber); } .low { background:var(--muted); }
    @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, minmax(0,1fr)); } table { display:block; overflow-x:auto; } }
    @media (max-width: 560px) { header { padding:24px; } main { padding:0 14px; } .grid { grid-template-columns:1fr; } }
    @media print { header { background:#fff; color:#111827; } button, input { display:none; } main { margin:0; } .card, .metric { box-shadow:none; } }
  </style>
</head>
<body>
  <header>
    <nav>
      <b>GTF Inspector</b>
      <div class="actions">
        <input id="search" placeholder="Search issues" oninput="filterRows(this.value)" />
        <button onclick="document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? '' : 'dark'">Theme</button>
        <button onclick="window.print()">Print</button>
        <button onclick="navigator.clipboard.writeText(document.documentElement.outerHTML)">Export</button>
      </div>
    </nav>
    <h1>Project Health ${report.overallScore}/100</h1>
    <p class="subtitle">${escapeHtml(report.project.name)} | ${escapeHtml(report.project.framework)} | Generated ${escapeHtml(report.generatedAt)}</p>
  </header>
  <main>
    <section class="grid">
      <div class="metric"><span>Components</span><strong>${report.project.components}</strong></div>
      <div class="metric"><span>Routes</span><strong>${report.project.routes}</strong></div>
      <div class="metric"><span>Critical Issues</span><strong>${report.criticalIssues}</strong></div>
      <div class="metric"><span>Time Saved</span><strong>${report.impact.reviewTimeSavedMinutes}m</strong></div>
    </section>
    ${engineCards.join("")}
  </main>
  <script>
    function filterRows(value) {
      const needle = value.toLowerCase();
      document.querySelectorAll("tbody tr").forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(needle) ? "" : "none";
      });
    }
  </script>
</body>
</html>`;
}
function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
//# sourceMappingURL=html.js.map