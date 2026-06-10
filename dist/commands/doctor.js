import chalk from "chalk";
import { simpleGit } from "simple-git";
import ora from "ora";
import os from "node:os";
import clipboard from "clipboardy";
import { createAuditContext } from "../core/context.js";
import { runAllEngines } from "../engines/index.js";
import { attachCodeFrames } from "../core/code-frame.js";
import { buildAuditReport } from "../core/scoring.js";
import { summarizeProject } from "../core/project-summary.js";
import { select, renderCategorizedTally, renderScoreBox, buildDoctorPrompt, } from "../reporting/doctor.js";
export async function doctorCommand(rootDir) {
    const git = simpleGit(rootDir);
    const isRepo = await git.checkIsRepo();
    // 1. Choose what to scan
    let scanChoice = "full";
    if (isRepo) {
        scanChoice = await select("Choose what to scan", [
            { title: "Full codebase", value: "full" },
            { title: "Changed files only", value: "changed" },
        ]);
    }
    else {
        console.log(`${chalk.green("✓")} Choose what to scan » Full codebase (Git not detected)\n`);
    }
    // 2. Run scan
    const spinner = ora("Scanning React, Next.js, accessibility, performance, GSAP, and skeleton coverage...").start();
    const startTime = Date.now();
    const context = await createAuditContext(rootDir, { changedOnly: scanChoice === "changed" });
    const engines = attachCodeFrames(context, await runAllEngines(context));
    const report = buildAuditReport(summarizeProject(context), engines);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    const workers = os.cpus().length;
    const scannedFilesCount = context.files.length;
    spinner.succeed("Scan complete\n");
    // 3. Render statistics
    console.log(`${chalk.green("✓")} Scanned ${scannedFilesCount} files in ${duration}s [~${workers} workers]\n`);
    // 4. Render categorized issues
    console.log(renderCategorizedTally(report));
    console.log("");
    console.log(chalk.gray(`Run gtf audit to list every error and warning\n`));
    // 5. Render score box
    console.log(renderScoreBox(report.overallScore));
    console.log("");
    // 6. Next step action menu
    const nextAction = await select("What would you like to do next?", [
        { title: "Copy prompt to clipboard", value: "copy" },
        { title: "Skip", value: "skip" },
    ]);
    if (nextAction === "copy") {
        const payload = buildDoctorPrompt(report, scannedFilesCount, duration);
        await clipboard.write(payload);
        console.log(chalk.green("✓ Copied the prompt to your clipboard."));
    }
}
//# sourceMappingURL=doctor.js.map