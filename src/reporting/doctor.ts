import readline from "node:readline";
import chalk from "chalk";
import os from "node:os";
import { AuditReport, Finding } from "../types/report.js";

/**
 * Renders an interactive select menu using Node's built-in readline module.
 */
export async function select<T>(
  message: string,
  choices: { title: string; description?: string; value: T }[]
): Promise<T> {
  return new Promise((resolve) => {
    let selectedIndex = 0;
    const isTTY = process.stdin.isTTY;

    if (!isTTY) {
      const firstChoice = choices[0];
      if (firstChoice) {
        resolve(firstChoice.value);
      }
      return;
    }

    // Hide cursor
    process.stdout.write("\x1B[?25l");

    const render = () => {
      process.stdout.write(
        `${chalk.cyan("?")} ${chalk.bold(message)} ${chalk.gray("»")} - Use arrow-keys. Return to submit.\n`
      );

      choices.forEach((choice, index) => {
        const isSelected = index === selectedIndex;
        const pointer = isSelected ? chalk.cyan("❯") : " ";
        const title = isSelected ? chalk.cyan.underline(choice.title) : chalk.gray(choice.title);
        const desc = choice.description ? ` - ${choice.description}` : "";
        process.stdout.write(`  ${pointer} ${title}${chalk.gray(desc)}\n`);
      });
    };

    const clear = () => {
      const totalLines = 1 + choices.length;
      for (let i = 0; i < totalLines; i++) {
        process.stdout.write("\x1B[A\x1B[2K");
      }
      process.stdout.write("\r");
    };

    render();

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    const onKeypress = (str: string, key: any) => {
      if (key.ctrl && key.name === "c") {
        cleanup();
        process.exit(0);
      }

      if (key.name === "up" || key.name === "k") {
        selectedIndex = (selectedIndex - 1 + choices.length) % choices.length;
        clear();
        render();
      } else if (key.name === "down" || key.name === "j") {
        selectedIndex = (selectedIndex + 1) % choices.length;
        clear();
        render();
      } else if (key.name === "return" || key.name === "enter") {
        cleanup();
        // Clear selection menu and print final result
        const totalLines = 1 + choices.length;
        for (let i = 0; i < totalLines; i++) {
          process.stdout.write("\x1B[A\x1B[2K");
        }
        process.stdout.write("\r");
        const selected = choices[selectedIndex];
        if (selected) {
          console.log(`${chalk.green("✓")} ${chalk.bold(message)} » ${chalk.cyan(selected.title)}\n`);
          resolve(selected.value);
        }
      }
    };

    const cleanup = () => {
      process.stdin.removeListener("keypress", onKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
      process.stdout.write("\x1B[?25h"); // Restore cursor
    };

    process.stdin.on("keypress", onKeypress);
  });
}

/**
 * Returns a score-based chalk function.
 */
function getScoreColor(score: number) {
  if (score >= 90) return chalk.green;
  if (score >= 75) return chalk.yellow;
  return chalk.red;
}

/**
 * Returns the score label.
 */
function getScoreLabel(score: number): string {
  if (score >= 90) return "Great";
  if (score >= 75) return "OK";
  return "Critical";
}

/**
 * Formats standard categories count.
 */
function formatTally(category: string, count: number): string {
  const label = count === 1 ? "warning" : "warnings";
  const countStr = count > 0 ? chalk.yellow(`${count} ${label}`) : chalk.gray(`0 ${label}`);
  return `  ${chalk.bold(category)} ${chalk.gray("›")} ${countStr}`;
}

/**
 * Renders the categorized issue summary.
 */
export function renderCategorizedTally(report: AuditReport): string {
  let security = 0;
  let bugs = 0;
  let performance = 0;
  let accessibility = 0;
  let maintainability = 0;

  report.engines.forEach((engine) => {
    engine.findings.forEach((finding) => {
      const cat = (finding.category || "").toLowerCase();
      const eng = (engine.name || "").toLowerCase();

      if (eng.includes("supply-chain") || eng.includes("security") || cat === "security") {
        security++;
      } else if (
        eng.includes("react") ||
        eng.includes("memory") ||
        eng.includes("runtime") ||
        eng.includes("component") ||
        eng.includes("page") ||
        eng.includes("linter") ||
        cat === "reliability" ||
        cat === "type safety"
      ) {
        bugs++;
      } else if (
        eng.includes("performance") ||
        eng.includes("gsap") ||
        cat === "performance" ||
        cat === "bundle" ||
        cat === "animation"
      ) {
        performance++;
      } else if (eng.includes("accessibility") || cat === "accessibility") {
        accessibility++;
      } else {
        maintainability++;
      }
    });
  });

  const total = security + bugs + performance + accessibility + maintainability;

  return [
    chalk.bold.white(`All ${total} issues`),
    "",
    formatTally("Security", security),
    formatTally("Bugs", bugs),
    formatTally("Performance", performance),
    formatTally("Accessibility", accessibility),
    formatTally("Maintainability", maintainability),
  ].join("\n");
}

/**
 * Renders the score box with the ASCII face and progress bar.
 */
export function renderScoreBox(score: number): string {
  const colorize = getScoreColor(score);
  const label = getScoreLabel(score);

  // Eyes and mouth depending on score
  let eyes = "· ·";
  let mouth = " - ";
  if (score >= 90) {
    eyes = "◠ ◠";
    mouth = " ▽ ";
  } else if (score >= 75) {
    eyes = "• •";
    mouth = " ─ ";
  }

  const barWidth = 30;
  const filledCount = Math.round((score / 100) * barWidth);
  const emptyCount = Math.max(0, barWidth - filledCount);
  const bar = colorize("█".repeat(filledCount)) + chalk.gray("░".repeat(emptyCount));

  return [
    `  ${colorize("+---+")}  ${colorize(`${score} / 100 ${label}`)}`,
    `  ${colorize(`|${eyes}|`)}  ${bar}`,
    `  ${colorize(`|${mouth}|`)}  ${chalk.white("GTF Doctor")} ${chalk.gray("(https://gtf.scale)")}`,
    `  ${colorize("+---+")}`,
  ].join("\n");
}

/**
 * Builds the prompt payload for the clipboard.
 */
export function buildDoctorPrompt(report: AuditReport, scannedFiles: number, duration: string): string {
  const lines: string[] = [
    "You are an expert Frontend Architect and senior React/Next.js developer. I have run the GTF Doctor quality audit on my project, and it scored " + report.overallScore + "/100.",
    "Please help me refactor the codebase to resolve the issues below.",
    "",
    `Project: ${report.project.name}`,
    `Framework: ${report.project.framework}`,
    `Scanned files: ${scannedFiles} in ${duration}s`,
    `Total Critical Issues: ${report.criticalIssues}`,
    `Total Warnings: ${report.warnings}`,
    "",
    "Here is the list of issues that need to be resolved:",
    "",
  ];

  let issueCount = 1;
  report.engines.forEach((engine) => {
    if (engine.findings.length > 0) {
      lines.push(`### ${engine.name} (Engine Score: ${engine.score}/100)`);
      engine.findings.forEach((finding) => {
        const location = finding.location
          ? `${finding.location.file}:${finding.location.line}`
          : "Project-level";
        lines.push(
          `${issueCount++}. [${finding.severity}] ${finding.title}`,
          `   File: ${location}`,
          `   Issue: ${finding.issue}`,
          `   Impact: ${finding.impact}`,
          `   Recommendation: ${finding.recommendation}`,
          ""
        );
      });
    }
  });

  lines.push(
    "Please review each issue, explain its root cause, and write the complete refactored production-ready code blocks to fix it. Adhere strictly to clean architecture, SOLID principles, and optimal performance rules."
  );

  return lines.join("\n");
}
