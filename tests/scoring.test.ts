import { describe, expect, it } from "vitest";
import { scoreFromFindings } from "../src/core/scoring.js";
import { Finding } from "../src/types/report.js";

describe("scoreFromFindings", () => {
  it("applies weighted penalties by severity", () => {
    const findings: Finding[] = [
      {
        id: "test",
        title: "Issue",
        issue: "Issue",
        impact: "Impact",
        recommendation: "Fix",
        severity: "Critical",
      },
      {
        id: "test-2",
        title: "Issue",
        issue: "Issue",
        impact: "Impact",
        recommendation: "Fix",
        severity: "Medium",
      },
    ];
    expect(scoreFromFindings(findings)).toBe(77);
  });
});
