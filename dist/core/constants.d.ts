export declare const REPORT_DIR = "reports";
export declare const DEFAULT_CONFIG = "export default {\n  seo: true,\n  accessibility: true,\n  performance: true,\n  gsap: true,\n  skeleton: true,\n  report: true,\n  include: [\"app\", \"pages\", \"src\", \"components\"],\n  exclude: [\"node_modules\", \".next\", \"dist\", \"build\", \"coverage\"],\n};\n";
export declare const SCORE_WEIGHTS: {
    readonly seo: 0.2;
    readonly accessibility: 0.2;
    readonly performance: 0.2;
    readonly skeleton: 0.15;
    readonly nextjs: 0.15;
    readonly gsap: 0.1;
};
