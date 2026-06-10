import { AuditContext, ProjectSummary } from "../types/report.js";

export function summarizeProject(context: AuditContext): ProjectSummary {
  const dependencies = {
    ...context.packageJson?.dependencies,
    ...context.packageJson?.devDependencies,
    ...context.packageJson?.peerDependencies,
  };
  let framework = "Unknown";
  if (dependencies.next) {
    framework = `Next.js ${dependencies.next}`;
  } else if (dependencies.react) {
    framework = `React ${dependencies.react}`;
  } else if (context.files.some((f) => f.relativePath.startsWith("next.config.") || f.relativePath.includes("/next.config."))) {
    framework = "Next.js";
  }
  const components = context.files.filter((file) => isComponent(file.relativePath)).length;
  const pages = context.files.filter((file) => /(^|\/)(page|layout)\.(tsx|jsx)$/.test(file.relativePath)).length;
  const routes = context.files.filter((file) => file.relativePath.startsWith("app/") && /page\.(tsx|jsx)$/.test(file.relativePath)).length;
  return {
    name: context.projectName,
    framework,
    components,
    pages,
    routes,
  };
}

function isComponent(relativePath: string): boolean {
  return /\.(tsx|jsx)$/.test(relativePath) && !/(^|\/)(page|layout|loading|error)\.(tsx|jsx)$/.test(relativePath);
}
