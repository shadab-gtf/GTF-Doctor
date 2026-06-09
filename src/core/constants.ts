export const REPORT_DIR = "reports";

export const DEFAULT_CONFIG = `export default {
  seo: true,
  accessibility: true,
  performance: true,
  gsap: true,
  skeleton: true,
  report: true,
  include: ["app", "pages", "src", "components"],
  exclude: ["node_modules", ".next", "dist", "build", "coverage"],
};
`;

export const SCORE_WEIGHTS = {
  seo: 0.2,
  accessibility: 0.2,
  performance: 0.2,
  skeleton: 0.15,
  nextjs: 0.15,
  gsap: 0.1,
} as const;
