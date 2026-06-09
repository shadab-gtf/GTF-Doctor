export function summarizeProject(context) {
    const dependencies = {
        ...context.packageJson?.dependencies,
        ...context.packageJson?.devDependencies,
    };
    const framework = dependencies.next ? `Next.js ${dependencies.next}` : dependencies.react ? "React" : "Unknown";
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
function isComponent(relativePath) {
    return /\.(tsx|jsx)$/.test(relativePath) && !/(^|\/)(page|layout|loading|error)\.(tsx|jsx)$/.test(relativePath);
}
//# sourceMappingURL=project-summary.js.map