import chalk from "chalk";
import { simpleGit } from "simple-git";
import { auditCommand } from "./audit.js";
export async function doctorCommand(rootDir) {
    const git = simpleGit(rootDir);
    const isRepo = await git.checkIsRepo();
    if (isRepo) {
        const status = await git.status();
        console.log(chalk.cyan("Changed Files:"));
        for (const file of status.files) {
            console.log(`• ${file.path}`);
        }
    }
    else {
        console.log(chalk.yellow("Git repository not detected. Running full local audit."));
    }
    await auditCommand(rootDir, {});
}
//# sourceMappingURL=doctor.js.map