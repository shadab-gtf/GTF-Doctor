export interface GtfConfig {
  seo: boolean;
  accessibility: boolean;
  performance: boolean;
  gsap: boolean;
  skeleton: boolean;
  report: boolean;
  include: string[];
  exclude: string[];
  linter?: boolean;
  deadCode?: boolean;
  supplyChain?: boolean;
  rscAdvisory?: boolean;
  reactNative?: boolean;
}

export interface ResolvedGtfConfig extends GtfConfig {
  memory: boolean;
  reactDiagnostics: boolean;
  runtimeInsights: boolean;
  componentHealth: boolean;
  pageHealth: boolean;
  engineeringScore: boolean;
  nextjs: boolean;
  linter: boolean;
  deadCode: boolean;
  supplyChain: boolean;
  rscAdvisory: boolean;
  reactNative: boolean;
  architecture: {
    serverFirst: boolean;
    strictPages: boolean;
    requireSuspense: boolean;
    requireRouteLoading: boolean;
    requireRouteError: boolean;
    maxComponentLines: number;
  };
  policy: {
    minimumScore: number;
    failOnCritical: boolean;
    failOnHighCount: number;
  };
}
