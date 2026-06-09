import path from "node:path";
import { collectProjectFiles, readPackageJson } from "./file-system.js";
export async function createAuditContext(rootDir) {
    const packageJson = await readPackageJson(rootDir);
    return {
        rootDir,
        projectName: packageJson?.name ?? path.basename(rootDir),
        files: await collectProjectFiles(rootDir),
        packageJson,
    };
}
//# sourceMappingURL=context.js.map